import type { SearchableItem } from './jobTaxonomy';

/** 5. Skills, dishes and search keywords — extra searchable terms. */
export const SKILLS: SearchableItem[] = [
  { label: 'Pizza Making', type: 'skill', keywords: ['pizza making', 'pizza', 'margherita'] },
  {
    label: 'Pasta Preparation',
    type: 'skill',
    keywords: ['pasta preparation', 'pasta', 'alfredo', 'arrabbiata']
  },
  { label: 'Lasagna', type: 'skill', keywords: ['lasagna', 'italian', 'oven baked'] },
  { label: 'Risotto', type: 'skill', keywords: ['risotto', 'italian', 'rice'] },
  { label: 'Noodles', type: 'skill', keywords: ['noodles', 'chinese', 'stir fry'] },
  { label: 'Fried Rice', type: 'skill', keywords: ['fried rice', 'chinese', 'rice'] },
  { label: 'Manchurian', type: 'skill', keywords: ['manchurian', 'chinese', 'indo chinese'] },
  {
    label: 'Sushi Preparation',
    type: 'skill',
    keywords: ['sushi preparation', 'sushi', 'japanese']
  },
  { label: 'Biryani', type: 'skill', keywords: ['biryani', 'hyderabadi', 'mughlai', 'indian'] },
  {
    label: 'Tandoor Preparation',
    type: 'skill',
    keywords: ['tandoor preparation', 'tandoor', 'naan', 'tandoori']
  }
];
