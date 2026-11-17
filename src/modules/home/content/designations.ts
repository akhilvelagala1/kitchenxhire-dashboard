import type { SearchableItem } from './jobTaxonomy';

/** 2. Job designations — the actual positions employers hire for. */
export const DESIGNATIONS: SearchableItem[] = [
  {
    label: 'Executive Chef',
    type: 'designation',
    keywords: ['executive chef', 'chef de cuisine', 'head chef']
  },
  { label: 'Head Chef', type: 'designation', keywords: ['head chef', 'executive chef', 'chef'] },
  {
    label: 'Sous Chef',
    type: 'designation',
    keywords: ['sous chef', 'deputy chef', 'second chef']
  },
  {
    label: 'Chef de Partie (CDP)',
    type: 'designation',
    keywords: ['chef de partie', 'cdp', 'station chef', 'section chef']
  },
  {
    label: 'Demi Chef de Partie',
    type: 'designation',
    keywords: ['demi chef de partie', 'demi cdp', 'junior station chef']
  },
  {
    label: 'Commis Chef I',
    type: 'designation',
    keywords: ['commis chef', 'commis i', 'junior chef', 'trainee chef']
  },
  {
    label: 'Commis Chef II',
    type: 'designation',
    keywords: ['commis chef', 'commis ii', 'junior chef']
  },
  {
    label: 'Commis Chef III',
    type: 'designation',
    keywords: ['commis chef', 'commis iii', 'junior chef']
  },
  {
    label: 'Line Cook',
    type: 'designation',
    keywords: ['line cook', 'cook', 'station cook', 'grill cook']
  },
  {
    label: 'Prep Cook',
    type: 'designation',
    keywords: ['prep cook', 'preparation cook', 'food prep cook']
  },
  {
    label: 'Professional Cook',
    type: 'designation',
    keywords: ['professional cook', 'cook', 'qualified cook']
  },
  { label: 'Home Cook', type: 'designation', keywords: ['home cook', 'home chef', 'private cook'] },
  {
    label: 'Private Chef',
    type: 'designation',
    keywords: ['private chef', 'personal chef', 'home chef']
  },
  {
    label: 'Catering Chef',
    type: 'designation',
    keywords: ['catering chef', 'catering cook', 'event chef']
  },
  {
    label: 'Banquet Chef',
    type: 'designation',
    keywords: ['banquet chef', 'banquet cook', 'events chef']
  },
  {
    label: 'Cloud Kitchen Chef',
    type: 'designation',
    keywords: ['cloud kitchen chef', 'dark kitchen chef', 'delivery chef']
  },
  {
    label: 'Halwai',
    type: 'designation',
    keywords: ['halwai', 'sweet maker', 'mithai', 'dessert chef']
  },
  {
    label: 'Kitchen Helper',
    type: 'designation',
    keywords: ['kitchen helper', 'kitchen assistant', 'food prep assistant']
  },
  {
    label: 'Kitchen Assistant',
    type: 'designation',
    keywords: ['kitchen assistant', 'kitchen helper', 'food preparation assistant']
  },
  { label: 'Baker', type: 'designation', keywords: ['baker', 'bakery chef', 'bread baker'] },
  {
    label: 'Pastry Chef',
    type: 'designation',
    keywords: ['pastry chef', 'patissier', 'dessert chef']
  },
  {
    label: 'Cake Decorator',
    type: 'designation',
    keywords: ['cake decorator', 'cake maker', 'icing artist']
  },
  {
    label: 'Waiter',
    type: 'designation',
    keywords: ['waiter', 'waitress', 'server', 'restaurant server']
  },
  {
    label: 'Restaurant Manager',
    type: 'designation',
    keywords: ['restaurant manager', 'outlet manager', 'f&b manager']
  },
  {
    label: 'Warehouse Supervisor',
    type: 'designation',
    keywords: ['warehouse supervisor', 'storekeeper', 'stock supervisor']
  },
  {
    label: 'Tandoor Chef',
    type: 'designation',
    keywords: ['tandoor chef', 'tandoori cook', 'naan chef']
  },
  { label: 'BBQ Chef', type: 'designation', keywords: ['bbq chef', 'grill chef', 'barbecue cook'] },
  { label: 'Grill Chef', type: 'designation', keywords: ['grill chef', 'bbq chef', 'grill cook'] },
  {
    label: 'Pizza Chef',
    type: 'designation',
    keywords: ['pizza chef', 'pizzaiolo', 'pizza maker']
  },
  {
    label: 'Pasta Chef',
    type: 'designation',
    keywords: ['pasta chef', 'pasta cook', 'italian cook']
  },
  {
    label: 'Sushi Chef',
    type: 'designation',
    keywords: ['sushi chef', 'sushi cook', 'japanese chef']
  },
  {
    label: 'Seafood Chef',
    type: 'designation',
    keywords: ['seafood chef', 'fish cook', 'fish chef']
  },
  {
    label: 'Street Food Chef',
    type: 'designation',
    keywords: ['street food chef', 'chaat cook', 'pani puri cook']
  },
  {
    label: 'Fast Food Chef',
    type: 'designation',
    keywords: ['fast food chef', 'burger cook', 'sandwich cook']
  }
];
