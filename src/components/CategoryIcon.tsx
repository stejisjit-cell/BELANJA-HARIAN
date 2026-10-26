import React from 'react';
import {
  Baby,
  Car,
  Coffee,
  GraduationCap,
  Heart,
  HeartPulse,
  Home,
  MoreHorizontal,
  Shirt,
  ShoppingBag,
  Smartphone,
  Smile,
  Sparkles,
  UtensilsCrossed,
  Wallet,
  Zap,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', color }) => {
  const props = { className, style: color ? { color } : undefined };

  switch (name) {
    case 'UtensilsCrossed':
      return <UtensilsCrossed {...props} />;
    case 'Coffee':
      return <Coffee {...props} />;
    case 'Home':
      return <Home {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'Baby':
      return <Baby {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Smile':
      return <Smile {...props} />;
    case 'Heart':
      return <Heart {...props} />;
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'Shirt':
      return <Shirt {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'Wallet':
      return <Wallet {...props} />;
    default:
      return <MoreHorizontal {...props} />;
  }
};
