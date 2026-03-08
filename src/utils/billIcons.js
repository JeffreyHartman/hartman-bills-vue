import {
  Receipt, CreditCard, Home, Zap, Droplets, Flame, Wifi, Phone, Tv, Car,
  Shield, HeartPulse, GraduationCap, ShoppingCart, Utensils, Dumbbell,
  Music, Dog, Baby, Briefcase, Landmark, Wallet, Wrench, Trash2
} from 'lucide-vue-next';

// Available icons for bills
export const BILL_ICONS = [
  { key: 'receipt', label: 'Receipt' },
  { key: 'credit-card', label: 'Credit Card' },
  { key: 'home', label: 'Home' },
  { key: 'zap', label: 'Electric' },
  { key: 'droplets', label: 'Water' },
  { key: 'flame', label: 'Gas' },
  { key: 'wifi', label: 'Internet' },
  { key: 'phone', label: 'Phone' },
  { key: 'tv', label: 'TV / Streaming' },
  { key: 'car', label: 'Car' },
  { key: 'shield', label: 'Insurance' },
  { key: 'heart-pulse', label: 'Health' },
  { key: 'graduation-cap', label: 'Education' },
  { key: 'shopping-cart', label: 'Shopping' },
  { key: 'utensils', label: 'Food' },
  { key: 'dumbbell', label: 'Gym' },
  { key: 'music', label: 'Music' },
  { key: 'dog', label: 'Pet' },
  { key: 'baby', label: 'Childcare' },
  { key: 'briefcase', label: 'Business' },
  { key: 'landmark', label: 'Bank' },
  { key: 'wallet', label: 'Wallet' },
  { key: 'wrench', label: 'Maintenance' },
  { key: 'trash-2', label: 'Trash / Waste' },
];

// Map icon keys to Lucide Vue components
export const ICON_MAP = {
  'receipt': Receipt,
  'credit-card': CreditCard,
  'home': Home,
  'zap': Zap,
  'droplets': Droplets,
  'flame': Flame,
  'wifi': Wifi,
  'phone': Phone,
  'tv': Tv,
  'car': Car,
  'shield': Shield,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  'shopping-cart': ShoppingCart,
  'utensils': Utensils,
  'dumbbell': Dumbbell,
  'music': Music,
  'dog': Dog,
  'baby': Baby,
  'briefcase': Briefcase,
  'landmark': Landmark,
  'wallet': Wallet,
  'wrench': Wrench,
  'trash-2': Trash2,
};

export const ICON_COLORS = [
  '#4f46e5', // indigo
  '#2563eb', // blue
  '#0891b2', // cyan
  '#059669', // emerald
  '#16a34a', // green
  '#65a30d', // lime
  '#ca8a04', // yellow
  '#ea580c', // orange
  '#dc2626', // red
  '#db2777', // pink
  '#9333ea', // purple
  '#6366f1', // violet
  '#475569', // slate
  '#1e293b', // dark slate
];

export const DEFAULT_ICON = 'receipt';
export const DEFAULT_ICON_COLOR = '#4f46e5';
