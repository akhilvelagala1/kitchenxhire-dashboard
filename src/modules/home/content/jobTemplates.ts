import type { EmploymentType } from '../schemas/home';
/**
 * One job posting template. Each template generates several postings (Hyderabad
 * flagship plus other cities) so that every category and city search returns
 * multiple distinct jobs. Local data only (UI-13) — a search API replaces this.
 */
interface Template {
  query: string;
  title: string;
  type: EmploymentType;
  place: string;
  /** The one legacy Hyderabad locality kept stable for this category's flagship posting. */
  area0: string;
  payMin: number;
  payMax: number;
  /** Extra searchable keywords (skills, dishes, synonyms). */
  extra: string;
  /** Main job category (connects to homepage category cards). */
  category: string;
  /** Cuisine specialization (searchable independently of job title). */
  cuisine: string;
  /** Food-type specialization (searchable independently of job title). */
  specialization: string;
}
/** All posting templates, including cuisine and specialization roles. */
export const TEMPLATES: Template[] = [
  {
    query: 'cook',
    title: 'South Indian Cook',
    type: 'Full-time',
    place: 'Restaurant',
    area0: 'Hitech City, Hyderabad',
    payMin: 22000,
    payMax: 28000,
    extra: 'chef dosa idli meals',
    category: 'Chefs & Cooks',
    cuisine: 'South Indian',
    specialization: 'Breakfast & Meals'
  },
  {
    query: 'helper',
    title: 'Kitchen Helper',
    type: 'Full-time',
    place: 'Cloud Kitchen',
    area0: 'Madhapur, Hyderabad',
    payMin: 14000,
    payMax: 18000,
    extra: 'prep packing ingredient handling',
    category: 'Kitchen Helpers',
    cuisine: 'Indian',
    specialization: 'Food Preparation'
  },
  {
    query: 'steward',
    title: 'Cleaning & Stewarding Staff',
    type: 'Full-time',
    place: 'Hotel',
    area0: 'Gachibowli, Hyderabad',
    payMin: 15000,
    payMax: 20000,
    extra: 'housekeeping sanitation dishwasher hygiene',
    category: 'Cleaning & Stewarding',
    cuisine: 'Indian',
    specialization: 'Hygiene & Sanitation'
  },
  {
    query: 'vegetable',
    title: 'Vegetable Prep Staff',
    type: 'Part-time',
    place: 'Cloud Kitchen',
    area0: 'Banjara Hills, Hyderabad',
    payMin: 9000,
    payMax: 12000,
    extra: 'cutter meat fish portioning',
    category: 'Vegetable Cutting & Prep',
    cuisine: 'Indian',
    specialization: 'Vegetable Cutting & Prep'
  },
  {
    query: 'bakery',
    title: 'Bakery Assistant',
    type: 'Part-time',
    place: 'Bakery & Café',
    area0: 'Kondapur, Hyderabad',
    payMin: 10000,
    payMax: 14000,
    extra: 'baker pastry counter cakes bread',
    category: 'Bakery Staff',
    cuisine: 'Indian',
    specialization: 'Bakery & Pastry'
  },
  {
    query: 'waiter',
    title: 'Waiter / Server',
    type: 'Part-time',
    place: 'Restaurant',
    area0: 'Secunderabad, Hyderabad',
    payMin: 12000,
    payMax: 16000,
    extra: 'service staff host counter',
    category: 'Waiters & Service',
    cuisine: 'Indian',
    specialization: 'Restaurant Service'
  },
  {
    query: 'housekeeping',
    title: 'Housekeeping Staff',
    type: 'Full-time',
    place: 'Hotel',
    area0: 'Hitech City, Hyderabad',
    payMin: 14000,
    payMax: 18000,
    extra: 'cleaning room attendant laundry',
    category: 'Housekeeping',
    cuisine: 'Indian',
    specialization: 'Hygiene & Sanitation'
  },
  {
    query: 'delivery',
    title: 'Delivery & Store Support',
    type: 'Full-time',
    place: 'Warehouse',
    area0: 'Gachibowli, Hyderabad',
    payMin: 15000,
    payMax: 20000,
    extra: 'dispatch stock receiving',
    category: 'Warehouse & Store Staff',
    cuisine: 'Indian',
    specialization: 'Warehouse & Dispatch'
  },
  {
    query: 'italian chef',
    title: 'Italian Chef',
    type: 'Full-time',
    place: 'Italian Restaurant',
    area0: 'Jubilee Hills, Hyderabad',
    payMin: 30000,
    payMax: 40000,
    extra: 'pizza pasta lasagna risotto italian cuisine',
    category: 'Chefs & Cooks',
    cuisine: 'Italian',
    specialization: 'Pizza & Pasta'
  },
  {
    query: 'pizza chef',
    title: 'Pizza Chef',
    type: 'Full-time',
    place: 'Pizzeria',
    area0: 'Banjara Hills, Hyderabad',
    payMin: 25000,
    payMax: 35000,
    extra: 'pizza making margherita farmhouse pizza oven',
    category: 'Chefs & Cooks',
    cuisine: 'Italian',
    specialization: 'Pizza'
  },
  {
    query: 'pasta chef',
    title: 'Pasta Chef',
    type: 'Full-time',
    place: 'Italian Restaurant',
    area0: 'Madhapur, Hyderabad',
    payMin: 24000,
    payMax: 34000,
    extra: 'pasta preparation alfredo arrabbiata italian cuisine',
    category: 'Chefs & Cooks',
    cuisine: 'Italian',
    specialization: 'Pasta'
  },
  {
    query: 'chinese cook',
    title: 'Chinese Cook',
    type: 'Full-time',
    place: 'Chinese Restaurant',
    area0: 'Gachibowli, Hyderabad',
    payMin: 24000,
    payMax: 32000,
    extra: 'noodles fried rice manchurian chinese cuisine',
    category: 'Chefs & Cooks',
    cuisine: 'Chinese',
    specialization: 'Chinese Wok'
  },
  {
    query: 'hyderabadi cook',
    title: 'Hyderabadi Cook',
    type: 'Full-time',
    place: 'Hyderabadi Restaurant',
    area0: 'Charminar, Hyderabad',
    payMin: 26000,
    payMax: 34000,
    extra: 'biryani haleem kebabs hyderabadi cuisine',
    category: 'Chefs & Cooks',
    cuisine: 'Hyderabadi',
    specialization: 'Biryani & Kebabs'
  },
  {
    query: 'north indian cook',
    title: 'North Indian Cook',
    type: 'Full-time',
    place: 'North Indian Restaurant',
    area0: 'Secunderabad, Hyderabad',
    payMin: 24000,
    payMax: 32000,
    extra: 'naan chole bhature punjabi north indian cuisine',
    category: 'Chefs & Cooks',
    cuisine: 'North Indian',
    specialization: 'Tandoor & Curries'
  },
  {
    query: 'tandoor chef',
    title: 'Tandoor Chef',
    type: 'Full-time',
    place: 'Tandoor Station',
    area0: 'Hitech City, Hyderabad',
    payMin: 26000,
    payMax: 34000,
    extra: 'naan tandoori roti tandoor punjabi north indian',
    category: 'Chefs & Cooks',
    cuisine: 'North Indian',
    specialization: 'Tandoor'
  },
  {
    query: 'bbq chef',
    title: 'BBQ Chef',
    type: 'Full-time',
    place: 'Grill Restaurant',
    area0: 'Banjara Hills, Hyderabad',
    payMin: 28000,
    payMax: 36000,
    extra: 'grilled dishes barbecue bbq grill cuisine',
    category: 'Chefs & Cooks',
    cuisine: 'American',
    specialization: 'BBQ & Grill'
  },
  {
    query: 'bakery chef',
    title: 'Bakery Chef',
    type: 'Full-time',
    place: 'Bakery & Café',
    area0: 'Kondapur, Hyderabad',
    payMin: 24000,
    payMax: 32000,
    extra: 'cakes bread croissants pastry bakery',
    category: 'Bakery Staff',
    cuisine: 'Indian',
    specialization: 'Bakery & Pastry'
  },
  {
    query: 'pastry chef',
    title: 'Pastry Chef',
    type: 'Full-time',
    place: 'Patisserie',
    area0: 'Jubilee Hills, Hyderabad',
    payMin: 26000,
    payMax: 36000,
    extra: 'cakes pastries desserts confectionery chocolates',
    category: 'Bakery Staff',
    cuisine: 'French',
    specialization: 'Bakery & Pastry'
  },
  {
    query: 'sushi chef',
    title: 'Sushi Chef',
    type: 'Full-time',
    place: 'Japanese Restaurant',
    area0: 'Hitech City, Hyderabad',
    payMin: 32000,
    payMax: 42000,
    extra: 'sushi nigiri maki japanese cuisine',
    category: 'Chefs & Cooks',
    cuisine: 'Japanese',
    specialization: 'Sushi'
  },
  {
    query: 'warehouse associate',
    title: 'Warehouse Associate',
    type: 'Full-time',
    place: 'Warehouse',
    area0: 'Gachibowli, Hyderabad',
    payMin: 15000,
    payMax: 20000,
    extra: 'stock picker packer dispatch receiving',
    category: 'Warehouse & Store Staff',
    cuisine: 'Indian',
    specialization: 'Warehouse & Dispatch'
  }
];

/** A short, templated description built from the posting's own category, cuisine and
 * specialization — not a single hardcoded sentence reused for every job. */
export function describeJob(template: Template): string {
  return `We are looking for an experienced ${template.title} to join our team at a ${template.place.toLowerCase()}, specializing in ${template.cuisine} ${template.specialization.toLowerCase()}.`;
}

/** Key responsibilities, derived from the posting's own fields. */
export function responsibilitiesFor(template: Template): string[] {
  return [
    `Handle day-to-day ${template.specialization.toLowerCase()} work at the ${template.place.toLowerCase()}`,
    'Maintain hygiene, food safety and quality standards',
    `Work with the ${template.category.toLowerCase()} team to meet daily service targets`
  ];
}

/** Required skills, derived from the posting's own cuisine, specialization and keywords. */
export function skillsFor(template: Template): string[] {
  const extraWords = template.extra
    .split(' ')
    .filter((word) => word.length > 3)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase() + word.slice(1));
  return [template.cuisine, template.specialization, ...extraWords];
}
