import type { SearchableItem } from './jobTaxonomy';

/** 3. Cuisine specializations — searchable independently of job titles. */
export const CUISINES: SearchableItem[] = [
  {
    label: 'Indian',
    type: 'cuisine',
    keywords: [
      'indian',
      'indian cuisine',
      'indian chef',
      'indian cook',
      'dal makhani',
      'indian thali'
    ]
  },
  {
    label: 'North Indian',
    type: 'cuisine',
    keywords: ['north indian', 'north indian chef', 'naan', 'chole bhature', 'punjabi']
  },
  {
    label: 'South Indian',
    type: 'cuisine',
    keywords: ['south indian', 'south indian chef', 'idli', 'dosa', 'sambar', 'meals']
  },
  {
    label: 'Andhra',
    type: 'cuisine',
    keywords: ['andhra', 'andhra chef', 'andhra meals', 'gongura pachadi']
  },
  {
    label: 'Hyderabadi',
    type: 'cuisine',
    keywords: ['hyderabadi', 'hyderabadi chef', 'biryani', 'haleem', 'kebabs']
  },
  {
    label: 'Chinese',
    type: 'cuisine',
    keywords: ['chinese', 'chinese chef', 'noodles', 'fried rice', 'manchurian']
  },
  {
    label: 'Italian',
    type: 'cuisine',
    keywords: ['italian', 'italian chef', 'pizza', 'pasta', 'lasagna', 'risotto']
  },
  {
    label: 'Continental',
    type: 'cuisine',
    keywords: ['continental', 'continental chef', 'grilled dishes', 'soups']
  },
  {
    label: 'Mexican',
    type: 'cuisine',
    keywords: ['mexican', 'mexican chef', 'tacos', 'nachos', 'burritos']
  },
  { label: 'Thai', type: 'cuisine', keywords: ['thai', 'thai chef', 'pad thai', 'green curry'] },
  {
    label: 'Japanese',
    type: 'cuisine',
    keywords: ['japanese', 'japanese chef', 'sushi', 'ramen', 'tempura']
  },
  { label: 'Korean', type: 'cuisine', keywords: ['korean', 'korean chef', 'kimchi', 'bibimbap'] },
  {
    label: 'French',
    type: 'cuisine',
    keywords: ['french', 'french chef', 'croissants', 'ratatouille']
  },
  {
    label: 'Mediterranean',
    type: 'cuisine',
    keywords: ['mediterranean', 'mediterranean chef', 'hummus', 'falafel']
  },
  {
    label: 'Arabic / Middle Eastern',
    type: 'cuisine',
    keywords: ['arabic', 'middle eastern', 'shawarma', 'mandi']
  },
  {
    label: 'Lebanese',
    type: 'cuisine',
    keywords: ['lebanese', 'lebanese chef', 'tabbouleh', 'fattoush']
  },
  { label: 'American', type: 'cuisine', keywords: ['american', 'american chef', 'burgers', 'bbq'] },
  { label: 'Spanish', type: 'cuisine', keywords: ['spanish', 'spanish chef', 'paella', 'tapas'] },
  {
    label: 'Mughlai',
    type: 'cuisine',
    keywords: ['mughlai', 'mughlai chef', 'biryani', 'korma', 'kebabs']
  },
  {
    label: 'Bengali',
    type: 'cuisine',
    keywords: ['bengali', 'bengali chef', 'fish curry', 'mishti doi']
  },
  {
    label: 'Punjabi',
    type: 'cuisine',
    keywords: ['punjabi', 'punjabi chef', 'sarson da saag', 'butter chicken']
  },
  {
    label: 'Gujarati',
    type: 'cuisine',
    keywords: ['gujarati', 'gujarati chef', 'dhokla', 'thepla']
  },
  {
    label: 'Rajasthani',
    type: 'cuisine',
    keywords: ['rajasthani', 'rajasthani chef', 'dal baati churma']
  },
  {
    label: 'Kerala',
    type: 'cuisine',
    keywords: ['kerala', 'kerala chef', 'appam', 'kerala parotta']
  },
  { label: 'Goan', type: 'cuisine', keywords: ['goan', 'goan chef', 'goan fish curry', 'vindaloo'] }
];
