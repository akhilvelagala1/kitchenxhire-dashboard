import { ChefHat, FileText, MapPin, Star, Users, Zap } from 'lucide-react';
import bakeries from '../assets/hire-bakeries.jpg';
import cafes from '../assets/hire-cafes.jpg';
import career from '../assets/hire-career.jpg';
import catering from '../assets/hire-catering.jpg';
import chefPortrait from '../assets/hire-chef-portrait.jpg';
import cloud from '../assets/hire-cloud.jpg';
import hotels from '../assets/hire-hotels.jpg';
import restaurants from '../assets/hire-restaurants.jpg';
import type { Business, Feature, Step, ValueCard } from '../schemas/home';

export const HERO_TICKS = [
  'Local opportunities',
  'Simple applications',
  'Built for food businesses'
];

export const FEATURES: Feature[] = [
  {
    titleLines: ['Kitchen &', 'hospitality roles'],
    description: 'Jobs across restaurants, hotels, bakeries, and cloud kitchens.',
    icon: ChefHat
  },
  {
    titleLines: ['Local hiring'],
    description: 'Discover opportunities and candidates in your city or nearby areas.',
    icon: MapPin
  },
  {
    titleLines: ['Simple', 'applications'],
    description: 'Create a profile and apply without a complicated process.',
    icon: Zap
  },
  {
    titleLines: ['Business-first', 'support'],
    description: 'Tools designed around the practical needs of food businesses.',
    icon: Users
  }
];

export const BUSINESSES: Business[] = [
  {
    title: 'Restaurants',
    description: 'Find cooks, kitchen helpers and service staff for daily operations.',
    image: restaurants,
    alt: 'Chef plating a dish in a restaurant kitchen'
  },
  {
    title: 'Hotels',
    description: 'Hire kitchen, housekeeping and banquet staff for your hotel.',
    image: hotels,
    alt: 'Hotel housekeeper preparing a room'
  },
  {
    title: 'Bakeries',
    description: 'Hire bakers, pastry assistants, production helpers and counter staff.',
    image: bakeries,
    alt: 'Baker finishing cakes'
  },
  {
    title: 'Cafés',
    description: 'Hire baristas, kitchen and café service staff.',
    image: cafes,
    alt: 'Café staff holding a pastry'
  },
  {
    title: 'Cloud Kitchens',
    description: 'Build a reliable team for preparation, cooking, packing and dispatch.',
    image: cloud,
    alt: 'Cloud kitchen staff packing orders'
  },
  {
    title: 'Catering Businesses',
    description: 'Find experienced staff for catering events and canteens.',
    image: catering,
    alt: 'Catering team on the kitchen line'
  }
];

export const SEEKER_STEPS: Step[] = [
  {
    title: 'Create a Profile',
    description: 'Add basic details, skills, experience and location.',
    image: career,
    alt: 'Kitchen professional creating a profile'
  },
  {
    title: 'Find Opportunities',
    description: 'Browse suitable jobs near home or in a preferred area.',
    image: cafes,
    alt: 'Finding nearby kitchen jobs'
  },
  {
    title: 'Connect with Employers',
    description: "Apply and respond to employers' contact or interview requests.",
    image: restaurants,
    alt: 'Connecting with a kitchen employer'
  },
  {
    title: 'Get Hired',
    description: 'Complete the selection process and confirm the opportunity.',
    image: chefPortrait,
    alt: 'Kitchen professional who got hired'
  }
];

export const EMPLOYER_STEPS: Step[] = [
  {
    title: 'Post a Vacancy',
    description: 'Share the role, shift, pay, location and what the work needs.',
    image: restaurants,
    alt: 'Posting a kitchen vacancy'
  },
  {
    title: 'Reach Local People',
    description: 'Get applicants from your city and nearby areas.',
    image: hotels,
    alt: 'Reaching local hospitality staff'
  },
  {
    title: 'Review Applicants',
    description: 'See practical kitchen and service skills before you decide.',
    image: cloud,
    alt: 'Reviewing kitchen applicants'
  },
  {
    title: 'Hire and Contact',
    description: 'Shortlist candidates and reach out directly.',
    image: career,
    alt: 'Hiring and contacting staff'
  }
];

export const VALUE_CARDS: ValueCard[] = [
  {
    title: 'Location first',
    description: 'Find jobs and people in your city and nearby areas.',
    image: cafes,
    alt: 'Kitchen team working a restaurant line',
    icon: MapPin
  },
  {
    title: 'Skills that matter',
    description: 'Match jobs based on real, practical kitchen and service skills.',
    image: chefPortrait,
    alt: 'Kitchen professional ready for the next role',
    icon: Star
  },
  {
    title: 'Clear job details',
    description: 'See the role, pay, shift and expectations before applying.',
    image: career,
    alt: 'Clear kitchen job details on a shift',
    icon: FileText
  }
];
