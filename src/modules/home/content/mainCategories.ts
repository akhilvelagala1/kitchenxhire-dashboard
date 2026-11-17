import type { SearchableItem } from './jobTaxonomy';

/** 1. Main job categories — shown on the existing homepage category cards. */
export const MAIN_CATEGORIES: SearchableItem[] = [
  {
    label: 'Chefs & Cooks',
    type: 'category',
    keywords: [
      'chef',
      'cook',
      'kitchen',
      'culinary',
      'head chef',
      'sous chef',
      'line cook',
      'prep cook',
      'executive chef',
      'commis chef',
      'chef de partie'
    ]
  },
  {
    label: 'Kitchen Helpers',
    type: 'category',
    keywords: [
      'kitchen helper',
      'kitchen assistant',
      'food preparation assistant',
      'ingredient handler',
      'kitchen support',
      'kitchen porter'
    ]
  },
  {
    label: 'Cleaning & Stewarding',
    type: 'category',
    keywords: [
      'dishwasher',
      'kitchen cleaner',
      'kitchen steward',
      'stewarding assistant',
      'sanitation staff',
      'hygiene staff',
      'cleaning'
    ]
  },
  {
    label: 'Vegetable Cutting & Prep',
    type: 'category',
    keywords: [
      'vegetable cutter',
      'food preparation worker',
      'meat cutter',
      'fish cleaner',
      'portioning assistant',
      'food prep'
    ]
  },
  {
    label: 'Bakery Staff',
    type: 'category',
    keywords: [
      'baker',
      'pastry chef',
      'cake decorator',
      'bakery assistant',
      'bread maker',
      'confectioner'
    ]
  },
  {
    label: 'Waiters & Service',
    type: 'category',
    keywords: [
      'waiter',
      'steward',
      'captain',
      'host',
      'hostess',
      'restaurant server',
      'banquet server',
      'barista',
      'bartender',
      'cashier',
      'counter staff'
    ]
  },
  {
    label: 'Warehouse & Store Staff',
    type: 'category',
    keywords: [
      'storekeeper',
      'inventory assistant',
      'picker',
      'packer',
      'warehouse associate',
      'stock handler',
      'receiving staff',
      'dispatch staff'
    ]
  },
  {
    label: 'Supervisors & Management',
    type: 'category',
    keywords: [
      'kitchen supervisor',
      'floor supervisor',
      'restaurant manager',
      'outlet manager',
      'f&b manager',
      'operations manager',
      'facility manager',
      'building supervisor',
      'production supervisor'
    ]
  },
  {
    label: 'Housekeeping',
    type: 'category',
    keywords: ['housekeeping', 'room attendant', 'laundry', 'cleaning staff']
  },
  {
    label: 'Delivery & Store Support',
    type: 'category',
    keywords: ['delivery', 'dispatch', 'rider', 'stock', 'warehouse support']
  },
  {
    label: 'Procurement & Purchase',
    type: 'category',
    keywords: ['procurement', 'purchase', 'buyer', 'sourcing']
  },
  {
    label: 'Food Quality Control',
    type: 'category',
    keywords: ['quality control', 'food safety', 'hygiene inspector']
  },
  {
    label: 'Food Safety & Hygiene',
    type: 'category',
    keywords: ['food safety', 'hygiene', 'sanitation']
  },
  {
    label: 'Restaurant Operations',
    type: 'category',
    keywords: ['restaurant operations', 'floor manager', 'shift supervisor']
  },
  {
    label: 'Central Kitchen Operations',
    type: 'category',
    keywords: ['central kitchen', 'commissary', 'production supervisor']
  },
  {
    label: 'Maintenance & Facilities',
    type: 'category',
    keywords: ['maintenance', 'facilities', 'technician', 'repair']
  }
];
