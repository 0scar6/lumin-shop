export type Category = 'all' | 'streetwear' | 'cups' | 'drops';

export type ProductType = 'streetwear' | 'cups';

export interface ApparelOptions {
  sizes: (string | { name: string; extraPrice: number })[];
  fits: string[];
  colors: { name: string; hex: string }[];
}

export interface CupOptions {
  types: { name: string; extraPrice: number }[];
  finishes: string[];
}

export interface Product {
  id: string;
  name: string;
  category: ProductType;
  price: number;
  originalPrice?: number;
  technique: string; // e.g. 'Estampado Urbano HD' or 'Sublimación 200°C'
  productionTime: string; // e.g. '⚡ 24-48 hrs'
  image: string;
  galleryImages?: string[];
  description: string;
  tag?: string; // e.g. '🔥 DROP 04', '⚡ Top Ventas'
  apparelOptions?: ApparelOptions;
  cupOptions?: CupOptions;
  customizable?: boolean;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  selectedSize?: string;
  selectedFit?: string;
  selectedColor?: { name: string; hex: string };
  selectedCupType?: string;
  selectedFinish?: string;
  customText?: string;
  quantity: number;
}

export type NavigationTab = 'home' | 'catalog' | 'favorites' | 'cart' | 'profile';

export type ThemeMode = 'dark' | 'amoled' | 'light';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  verified: boolean;
  loginTime: string;
}

export interface UserProfileData {
  name: string;
  phone: string;
  address: string;
  dni?: string;
  email?: string;
}
