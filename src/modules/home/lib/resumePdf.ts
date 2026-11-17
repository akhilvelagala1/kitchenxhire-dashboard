import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { ResumePreviewDocument } from '../components/ResumePreviewDocument';
import type { ResumeWizardFormValues } from '../schemas/jobSeekerResumeWizard';

const A4_CSS_WIDTH = 794;

const COLOR_PROPS = [
  'color',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'textDecorationColor'
] as const;

function waitForPaint(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
          window.setTimeout(done, 400);
        })
    )
  ).then(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
}

const MODERN_COLOR = /oklch|oklab|\blab\(|\blch\(|color-mix|\bcolor\(/;
const COLOR_FN = /(?:oklch|oklab|\blab|\blch|color-mix|\bcolor)\(/g;

function cssColorToRgba(color: string): string {
  if (!color || color === 'transparent' || color === 'none' || color.startsWith('rgb')) {
    return color;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return color;
  ctx.fillStyle = '#010203';
  ctx.fillStyle = color;
  if (ctx.fillStyle === '#010203') return color;
  ctx.fillRect(0, 0, 1, 1);
  const pixel = ctx.getImageData(0, 0, 1, 1).data;
  const alpha = (pixel[3] ?? 255) / 255;
  return `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${alpha})`;
}

/** html2canvas 1.4 only understands rgb/rgba, not Tailwind 4 oklab/oklch stops. */
export function rewriteUnsupportedCssColors(
  value: string,
  toRgba: (color: string) => string = cssColorToRgba
): string {
  let out = '';
  let last = 0;
  const re = new RegExp(COLOR_FN.source, 'g');
  for (let match = re.exec(value); match; match = re.exec(value)) {
    const start = match.index;
    let depth = 0;
    let end = start;
    for (; end < value.length; end += 1) {
      const ch = value[end];
      if (ch === '(') depth += 1;
      else if (ch === ')') {
        depth -= 1;
        if (depth === 0) {
          end += 1;
          break;
        }
      }
    }
    out += value.slice(last, start);
    out += toRgba(value.slice(start, end));
    last = end;
    re.lastIndex = end;
  }
  out += value.slice(last);
  return out.replace(
    /\s+in\s+(?:oklab|oklch|lab|lch|srgb-linear|srgb|display-p3|xyz-d65|xyz-d50|xyz|hsl|hwb)\b/gi,
    ''
  );
}

/** Rewrite the capture clone only. The on-screen resume is left untouched. */
function flattenModernColors(root: HTMLElement, view: Window) {
  const nodes = [root, ...root.querySelectorAll<HTMLElement>('*')];
  for (const node of nodes) {
    const style = view.getComputedStyle(node);
    for (const prop of COLOR_PROPS) {
      const value = style[prop];
      if (value && MODERN_COLOR.test(value)) {
        node.style[prop] = rewriteUnsupportedCssColors(value);
      }
    }
    if (style.backgroundImage !== 'none' && MODERN_COLOR.test(style.backgroundImage)) {
      node.style.backgroundImage = rewriteUnsupportedCssColors(style.backgroundImage);
    }
    if (style.boxShadow !== 'none' && MODERN_COLOR.test(style.boxShadow)) {
      node.style.boxShadow = rewriteUnsupportedCssColors(style.boxShadow);
    }
  }
}

function pdfFileName(fileName: string | undefined, fullName: string): string {
  const safeName = (fileName ?? fullName).replace(/[^\w.-]+/g, '_') || 'resume';
  return `${safeName}_KitchenX_Resume.pdf`;
}

async function captureSheet(sheet: HTMLElement, fileName: string): Promise<void> {
  const canvas = await html2canvas(sheet, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    logging: false,
    onclone(_doc, cloned) {
      const view = cloned.ownerDocument.defaultView ?? window;
      flattenModernColors(cloned, view);
    }
  });
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  let offset = 0;
  while (offset < imgHeight) {
    if (offset > 0) doc.addPage();
    doc.addImage(canvas, 'PNG', 0, -offset, pageWidth, imgHeight);
    offset += pageHeight;
  }
  doc.save(fileName);
}

/** Snapshot the same React preview template onto a white A4 PDF. */
export async function downloadResumePdf(
  values: ResumeWizardFormValues,
  fileName?: string
): Promise<void> {
  const live = document.getElementById('resume-preview-sheet');
  if (live instanceof HTMLElement) {
    await captureSheet(live, pdfFileName(fileName, values.fullName));
    return;
  }

  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:0;top:0;width:${A4_CSS_WIDTH}px;z-index:-1;pointer-events:none;background:#ffffff;`;
  host.className = 'kx-home bg-surface font-hire text-base text-ink';
  document.body.appendChild(host);

  const root = createRoot(host);
  try {
    flushSync(() => {
      root.render(createElement(ResumePreviewDocument, { values, forPdf: true }));
    });
    await waitForPaint(host);

    const sheet = host.firstElementChild;
    if (!(sheet instanceof HTMLElement)) {
      throw new Error('Resume preview did not render');
    }

    await captureSheet(sheet, pdfFileName(fileName, values.fullName));
  } finally {
    root.unmount();
    host.remove();
  }
}
