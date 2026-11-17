import anita from '../assets/hire-avatar-anita.jpg';
import ramesh from '../assets/hire-avatar-ramesh.jpg';
import suresh from '../assets/hire-avatar-suresh.jpg';
import type { Story } from '../schemas/home';

export const STORIES: Story[] = [
  {
    quote:
      'We found a good cook and two kitchen helpers quickly for our restaurant. The process was simple and the candidates were local.',
    name: 'Ramesh Kumar',
    role: 'Restaurant Owner, Hyderabad',
    pill: 'Restaurant',
    photo: ramesh
  },
  {
    quote:
      'I got a steady job as a kitchen helper near my home. The profile setup was easy and I started working within a few days.',
    name: 'Suresh Naik',
    role: 'Cook, Secunderabad',
    pill: 'Cook',
    photo: suresh
  },
  {
    quote:
      'We regularly hire bakery and packing staff through KitchenX Hiring. It helps us keep the team running smoothly, especially during peak days.',
    name: 'Anita Joseph',
    role: 'Bakery Owner, Hyderabad',
    pill: 'Bakery',
    photo: anita
  }
];
