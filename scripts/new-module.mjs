#!/usr/bin/env node
// Scaffolds a module by copying the categories reference module, so a new page
// starts with every shared component and the full page contract wired in.
//
//   npm run new:module -- <module> <Entity> <EntityPlural> <route-prefix> <permission-prefix>
//   npm run new:module -- brands Brand Brands catalogue/brands catalog.brands
import { cpSync, existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, walk } from './guards/lib.mjs';

const [mod, Entity, Plural, routePrefix, permPrefix] = process.argv.slice(2);
if (!mod || !Entity || !Plural || !routePrefix || !permPrefix || !/^[a-z][a-z-]*$/.test(mod)) {
  console.error(
    'Usage: npm run new:module -- <module> <Entity> <EntityPlural> <route-prefix> <permission-prefix>'
  );
  console.error(
    'Example: npm run new:module -- brands Brand Brands catalogue/brands catalog.brands'
  );
  process.exit(1);
}

const src = join(ROOT, 'src/modules/categories');
const dest = join(ROOT, 'src/modules', mod);
if (existsSync(dest)) {
  console.error(`src/modules/${mod} already exists`);
  process.exit(1);
}

const entity = Entity.charAt(0).toLowerCase() + Entity.slice(1);
const camel = mod.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
// Order matters: longest and most specific tokens first.
const swaps = [
  ['/catalog/categories', `/${permPrefix.replace('.', '/')}`],
  ['catalogue/categories', routePrefix],
  ['catalog.categories', permPrefix],
  ['categoriesModule', `${camel}Module`],
  ["id: 'categories'", `id: '${mod}'`],
  ['"module": "categories"', `"module": "${mod}"`],
  ['Categories', Plural],
  ['categories', Plural.toLowerCase()],
  ['CATEGORY', Entity.toUpperCase()],
  ['Category', Entity],
  ['category', entity]
];

cpSync(src, dest, { recursive: true });
for (const file of walk(dest, ['.ts', '.tsx', '.json'])) {
  let text = readFileSync(file, 'utf8');
  for (const [from, to] of swaps) text = text.split(from).join(to);
  writeFileSync(file, text);
  const renamed = file.replace(/Category/g, Entity).replace(/category/g, entity);
  if (renamed !== file) renameSync(file, renamed);
}

const contractPath = join(dest, 'page.contract.json');
const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
delete contract.capabilities.treeView;
contract.reference = 'FILL IN: prototype page, Figma frame or screenshot this page follows';
contract.owner = 'FILL IN: @github-handle of the owning developer';
writeFileSync(contractPath, JSON.stringify(contract, null, 2) + '\n');

const registryPath = join(ROOT, 'src/app/modules.ts');
let registry = readFileSync(registryPath, 'utf8');
registry = registry.replace(
  "import { overviewModule } from '@/modules/overview';",
  `import { overviewModule } from '@/modules/overview';\nimport { ${camel}Module } from '@/modules/${mod}';`
);
registry = registry.replace(/\];\s*$/, `, ${camel}Module];\n`);
writeFileSync(registryPath, registry);

console.log(`Created src/modules/${mod} from the categories reference and registered it.`);
console.log(
  'Next: replace the category fields in schemas/, columns and the form, fill in page.contract.json,'
);
console.log('then run npm run format && npm run verify.');
