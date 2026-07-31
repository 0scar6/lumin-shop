import { supabase } from './supabase';
import { Product, CartItem, UserProfileData, GoogleUser } from '../types';

// All sync functions fail silently - localStorage remains the source of truth
// Supabase is a remote backup/sync layer

// ============================================
// FAVORITES
// ============================================

export async function syncFavoritesToSupabase(favorites: Product[], userId?: string): Promise<void> {
  if (!supabase) return;
  try {
    const identifier = userId || getAnonymousId();

    // Clear existing favorites for this user
    await supabase
      .from('favoritos')
      .delete()
      .eq('usuario_id', identifier);

    // Insert new favorites
    if (favorites.length > 0) {
      const rows = favorites.map((p) => ({
        id: crypto.randomUUID(),
        usuario_id: identifier,
        producto_id: p.id,
      }));
      await supabase.from('favoritos').insert(rows);
    }
  } catch {
    // Silent fail
  }
}

export async function loadFavoritesFromSupabase(userId?: string): Promise<Product[]> {
  if (!supabase) return [];
  try {
    const identifier = userId || getAnonymousId();
    const { data } = await supabase
      .from('favoritos')
      .select('producto_id')
      .eq('usuario_id', identifier);

    if (!data || data.length === 0) return [];
    // We just return the IDs - the caller will match with products
    return data.map((r) => r.producto_id) as unknown as Product[];
  } catch {
    return [];
  }
}

// ============================================
// CART STATE (real-time sync, not orders)
// ============================================

export async function syncCartStateToSupabase(
  cart: CartItem[],
  userProfile: UserProfileData,
  deliveryType: string,
  userId?: string
): Promise<void> {
  if (!supabase) return;
  try {
    const identifier = userId || getAnonymousId();
    const total = cart.reduce((acc, item) => {
      const extra = item.product.cupOptions?.types.find((t) => t.name === item.selectedCupType)?.extraPrice || 0;
      return acc + (item.product.price + extra) * item.quantity;
    }, 0);

    const cartItems = cart.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      selected_size: item.selectedSize,
      selected_fit: item.selectedFit,
      selected_color: item.selectedColor,
      selected_cup_type: item.selectedCupType,
      selected_finish: item.selectedFinish,
      custom_text: item.customText,
    }));

    if (cart.length === 0) {
      await supabase.from('carrito').delete().eq('usuario_id', identifier);
    } else {
      await supabase.from('carrito').delete().eq('usuario_id', identifier);
      await supabase.from('carrito').insert({
        id: crypto.randomUUID(),
        usuario_id: identifier,
        cliente_nombre: userProfile.name || '',
        cliente_telefono: userProfile.phone || '',
        cliente_direccion: userProfile.address || '',
        cliente_dni: userProfile.dni || '',
        productos: cartItems,
        total,
        metodo_envio: deliveryType || 'domicilio',
      });
    }
  } catch {
    // Silent fail
  }
}

// ============================================
// ORDERS (WhatsApp)
// ============================================

export async function syncCartToSupabase(
  cart: CartItem[],
  userProfile: UserProfileData,
  deliveryType: string,
  userId?: string,
  shippingZone?: string,
  shippingCost?: number
): Promise<void> {
  if (!supabase || cart.length === 0) return;
  try {
    const identifier = userId || getAnonymousId();
    const subtotal = cart.reduce((acc, item) => {
      const extra = item.product.cupOptions?.types.find((t) => t.name === item.selectedCupType)?.extraPrice || 0;
      return acc + (item.product.price + extra) * item.quantity;
    }, 0);
    const total = subtotal + (shippingCost || 0);

    const orderItems = cart.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      selected_size: item.selectedSize,
      selected_fit: item.selectedFit,
      selected_color: item.selectedColor,
      selected_cup_type: item.selectedCupType,
      selected_finish: item.selectedFinish,
      custom_text: item.customText,
    }));

    await supabase.from('pedidos').insert({
      id: crypto.randomUUID(),
      usuario_id: identifier,
      cliente_nombre: userProfile.name || 'Sin nombre',
      cliente_telefono: userProfile.phone || '',
      cliente_direccion: userProfile.address || '',
      cliente_dni: userProfile.dni || '',
      productos: orderItems,
      total,
      estado: 'pendiente',
      metodo_envio: deliveryType || 'domicilio',
      zona_envio: shippingZone || 'lima',
      costo_envio: shippingCost || 0,
    });
  } catch {
    // Silent fail
  }
}

// ============================================
// USER PROFILE
// ============================================

export async function syncProfileToSupabase(
  profile: UserProfileData,
  themeMode: string,
  userId?: string
): Promise<void> {
  if (!supabase) return;
  try {
    const identifier = userId || getAnonymousId();

    // Upsert profile
    const { error } = await supabase
      .from('perfiles')
      .upsert(
        {
          id: identifier,
          usuario_id: identifier,
          tema: themeMode,
          nombre_completo: profile.name,
          telefono: profile.phone,
          direccion: profile.address,
          dni: profile.dni,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'usuario_id' }
      );

    if (error) {
      // If upsert fails (e.g., unique constraint), try update
      await supabase
        .from('perfiles')
        .update({
          tema: themeMode,
          nombre_completo: profile.name,
          telefono: profile.phone,
          direccion: profile.address,
          dni: profile.dni,
          updated_at: new Date().toISOString(),
        })
        .eq('usuario_id', identifier);
    }
  } catch {
    // Silent fail
  }
}

// ============================================
// GOOGLE AUTH USER
// ============================================

export async function syncGoogleUserToSupabase(user: GoogleUser): Promise<void> {
  if (!supabase) return;
  try {
    // Upsert user
    await supabase
      .from('usuarios')
      .upsert(
        {
          id: user.id,
          email: user.email,
          nombre: user.name,
          avatar_url: user.picture,
          ultimo_login: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
  } catch {
    // Silent fail
  }
}

// ============================================
// CUSTOM IDEAS
// ============================================

export async function syncCustomIdeaToSupabase(
  tipoProducto: string,
  descripcion: string,
  email: string,
  userId?: string
): Promise<void> {
  if (!supabase) return;
  try {
    const identifier = userId || getAnonymousId();
    await supabase.from('ideas_personalizadas').insert({
      id: crypto.randomUUID(),
      usuario_id: identifier,
      tipo_producto: tipoProducto,
      descripcion,
      email,
    });
  } catch {
    // Silent fail
  }
}

// ============================================
// CATEGORIES (from Supabase)
// ============================================

interface SupabaseCategory {
  id: string;
  nombre: string;
  icono: string | null;
  activo: boolean;
  orden: number;
}

interface CategoryUI {
  id: string;
  label: string;
  iconName: string;
}

const CATEGORY_ICON_MAP: Record<string, string> = {
  Shirt: 'Shirt',
  Coffee: 'Coffee',
  Flame: 'Flame',
  Grid: 'Grid',
};

export async function loadCategoriesFromSupabase(): Promise<CategoryUI[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error || !data || data.length === 0) return [];

    const allCategory: CategoryUI = { id: 'all', label: 'Todos los Productos', iconName: 'Grid' };
    const mapped = data.map((c: SupabaseCategory) => ({
      id: c.id,
      label: c.nombre,
      iconName: CATEGORY_ICON_MAP[c.icono || ''] || 'Grid',
    }));

    return [allCategory, ...mapped];
  } catch {
    return [];
  }
}

// ============================================
// CONFIGURACION (textos editables desde Supabase)
// ============================================

export interface ConfigItem {
  id: string;
  seccion: string;
  clave: string;
  valor: string;
}

let cachedConfig: Record<string, string> | null = null;

export async function loadConfigFromSupabase(): Promise<Record<string, string>> {
  if (!supabase) return {};
  if (cachedConfig) return cachedConfig;

  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*');

    if (error || !data || data.length === 0) return {};

    const config: Record<string, string> = {};
    data.forEach((row: ConfigItem) => {
      config[row.id] = row.valor;
    });

    cachedConfig = config;
    return config;
  } catch {
    return {};
  }
}

export function getConfigValue(config: Record<string, string>, key: string, fallback: string): string {
  return config[key] ?? fallback;
}

// ============================================
// UTILS
// ============================================

function getAnonymousId(): string {
  let id = localStorage.getItem('lumin_anon_id');
  if (!id) {
    id = 'anon-' + crypto.randomUUID();
    localStorage.setItem('lumin_anon_id', id);
  }
  return id;
}
