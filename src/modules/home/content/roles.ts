import {
  Bike,
  ChefHat,
  Carrot,
  Coffee,
  ConciergeBell,
  CookingPot,
  Croissant,
  Flame,
  House,
  Receipt,
  ShoppingBag,
  SprayCan,
  Truck,
  UserRound
} from 'lucide-react';
import type { Role } from '../schemas/home';

export const ROLES: Role[] = [
  {
    query: 'cook',
    title: 'Chefs & Cooks',
    description: 'Head Chef, Assistant Chef, Indian Cook, Continental Cook',
    icon: ChefHat
  },
  {
    query: 'helper',
    title: 'Kitchen Helpers',
    description: 'Food preparation, ingredient handling, kitchen support',
    icon: ShoppingBag
  },
  {
    query: 'steward',
    title: 'Cleaning & Stewarding',
    description: 'Dishwashing, kitchen cleaning, sanitation, hygiene',
    icon: SprayCan
  },
  {
    query: 'vegetable',
    title: 'Vegetable Cutting & Prep',
    description: 'Vegetable cutters, ingredient preparation staff',
    icon: Carrot
  },
  {
    query: 'bakery',
    title: 'Bakery Staff',
    description: 'Bakers, bakery assistants, pastry helpers',
    icon: Croissant
  },
  {
    query: 'waiter',
    title: 'Waiters & Service',
    description: 'Waiters, service staff, counter assistants',
    icon: ConciergeBell
  },
  {
    query: 'housekeeping',
    title: 'Housekeeping',
    description: 'Hotel housekeeping and cleaning personnel',
    icon: House
  },
  {
    query: 'delivery',
    title: 'Delivery & Store Support',
    description: 'Dispatch, stock handling and delivery support',
    icon: Truck
  }
];

export const MORE_ROLES: Role[] = [
  {
    query: 'tandoor',
    title: 'Tandoor Cook',
    description: 'Tandoor, grill and Indian bread station',
    icon: Flame
  },
  {
    query: 'south indian',
    title: 'South Indian Cook',
    description: 'Dosa, idli, meals and tiffin stations',
    icon: CookingPot
  },
  {
    query: 'barista',
    title: 'Barista',
    description: 'Coffee, tea and café counter',
    icon: Coffee
  },
  {
    query: 'captain',
    title: 'Captain & Host',
    description: 'Floor captain, host and guest seating',
    icon: UserRound
  },
  {
    query: 'counter',
    title: 'Counter & Billing',
    description: 'Cashier, order taking and billing',
    icon: Receipt
  },
  {
    query: 'rider',
    title: 'Rider',
    description: 'Food delivery and last-mile dispatch',
    icon: Bike
  }
];
