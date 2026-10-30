/** Las categorías son libres: el admin puede crear nuevas (gorras, etc.). */
export type Category = string;

export type ProductType = string;

/** Comportamiento de la ficha de producto según la categoría. */
export type CategoryKind = 'ropa' | 'vaso' | 'placa' | 'otro';

export interface MeasureValue {
  alto: number;
  ancho: number;
  extraPrice?: number;
}

/** Valores de filtro guardados por producto: tallas, onzas, medidas, etc. */
export type ProductAttributes = Record<string, string[] | MeasureValue[]>;

export interface CategoryAttributeDef {
  key: string;
  label: string;
  tipo: 'opciones' | 'medida';
  valores?: string[];
  unidad?: string;
}

export interface CategoryUI {
  id: string;
  label: string;
  iconName: string;
  tipo: CategoryKind;
  atributos: CategoryAttributeDef[];
  activo?: boolean;
  orden?: number;
}

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
  attributes?: ProductAttributes;
  apparelOptions?: ApparelOptions;
  cupOptions?: CupOptions;
  customizable?: boolean;
  agotado?: boolean;
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
