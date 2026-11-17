import { cn } from '@/shared/lib/cn';
import logo from '../assets/kitchenx-logo.png';

interface KitchenXLogoProps {
  className?: string;
}

export function KitchenXLogo({ className }: KitchenXLogoProps) {
  return (
    <img src={logo} alt="KitchenX" className={cn('h-[22px] w-auto object-contain', className)} />
  );
}
