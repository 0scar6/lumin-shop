import { Product, ProductType } from '../types';
import { supabase } from '../lib/supabase';

// ============================================
// STATIC FALLBACK DATA (used if Supabase fails)
// ============================================

const PRODUCTS_STATIC: Product[] = [
  {
    id: 'polo-acid-tokyo',
    name: 'Polo Oversized "Acid Tokyo 1988"',
    category: 'streetwear',
    price: 79.00,
    originalPrice: 95.00,
    technique: 'Estampado Urbano HD Ultra-Resistente',
    productionTime: '⚡ 24-48 hrs',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Confeccionado en algodón reactivo 240g (Heavyweight). Estampado de alta definición con gran intensidad de color y durabilidad.',
    tag: '🔥 DROP 04 BESTSELLER',
    apparelOptions: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      fits: ['Oversized Streetwear', 'Boxy Heavyweight', 'Standard Fit'],
      colors: [
        { name: 'Negro Carbón', hex: '#0A0A0A' },
        { name: 'Gris Washed', hex: '#374151' },
        { name: 'Verde Oliva Dark', hex: '#1C2818' },
        { name: 'Off-White', hex: '#E5E5E0' }
      ]
    },
    customizable: true
  },
  {
    id: 'polo-cyber-lumin',
    name: 'Polo Boxy Fit "LUMIN Vector Mesh"',
    category: 'streetwear',
    price: 75.00,
    technique: 'Serigrafía Tacto Cero HD',
    productionTime: '⚡ 24-48 hrs',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Diseño geométrico minimalista con acabado en tonos pistacho y blanco mate. Corte streetwear holgado con caída pesada.',
    tag: '✨ NUEVO DROP',
    apparelOptions: {
      sizes: ['S', 'M', 'L', 'XL'],
      fits: ['Boxy Heavyweight', 'Oversized Streetwear'],
      colors: [
        { name: 'Negro Carbón', hex: '#0A0A0A' },
        { name: 'Washed Charcoal', hex: '#262626' }
      ]
    },
    customizable: true
  },
  {
    id: 'polo-mind-matter',
    name: 'Polo Minimal "Mind Over Matter"',
    category: 'streetwear',
    price: 69.00,
    originalPrice: 80.00,
    technique: 'Estampado Micro-Print HD',
    productionTime: '⚡ 24 hrs Express',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    description: 'Logo sutil en el pecho e ilustración detallada en la espalda. Algodón peruano 20/1 suave y fresco.',
    tag: '⚡ EXPRESS 24H',
    apparelOptions: {
      sizes: ['S', 'M', 'L', 'XL'],
      fits: ['Standard Fit', 'Oversized Streetwear'],
      colors: [
        { name: 'Negro Carbón', hex: '#0A0A0A' },
        { name: 'Blanco Puro', hex: '#FFFFFF' },
        { name: 'Verde Pistacho Soft', hex: '#C2D993' }
      ]
    },
    customizable: true
  },
  {
    id: 'polo-gothic-acid',
    name: 'Polo Heavyweight "Gothic Skull Mono"',
    category: 'streetwear',
    price: 85.00,
    technique: 'Serigrafía Relieve HD',
    productionTime: '⚡ 24-48 hrs',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    description: 'Arte gótico reinterpretado con estética urbana. Cuello de rib grueso y costuras reforzadas.',
    tag: '🔥 POPULAR',
    apparelOptions: {
      sizes: ['M', 'L', 'XL', 'XXL'],
      fits: ['Oversized Heavyweight'],
      colors: [
        { name: 'Negro Carbón', hex: '#0A0A0A' }
      ]
    },
    customizable: false
  },
  {
    id: 'vaso-frosted-tokyo',
    name: 'Vaso Frosted Glass "Tokyo Skyline 16oz"',
    category: 'cups',
    price: 45.00,
    originalPrice: 55.00,
    technique: 'Sublimación Premium 200°C',
    productionTime: '⚡ 24-48 hrs',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4efdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Vaso de vidrio esmerilado opaco con sorbete y tapa de bambú ecológica. Sublimado continuo full color de alta durabilidad.',
    tag: '🔥 TOP SUBLIMACIÓN',
    cupOptions: {
      types: [
        { name: 'Vaso Frosted Glass 16oz (Vidrio Esmerilado)', extraPrice: 0 },
        { name: 'Vaso Aluminio Térmico 20oz (Mantiene frío 12h)', extraPrice: 15 },
        { name: 'Taza Cerámica Matte 11oz', extraPrice: -10 }
      ],
      finishes: ['Acabado Esmerilado Frosted', 'Brillo Cristal', 'Textura Mate Tacto']
    },
    customizable: true
  },
  {
    id: 'taza-lumin-monochrome',
    name: 'Taza Cerámica "LUMIN Dark Mode 11oz"',
    category: 'cups',
    price: 35.00,
    technique: 'Sublimación Ultra HD 360°',
    productionTime: '⚡ 24 hrs Express',
    image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
    description: 'Cerámica de alta calidad clase A+ negra por dentro con diseño exterior personalizado. Apta para microondas.',
    tag: '⚡ CLÁSICO ESSENTIAL',
    cupOptions: {
      types: [
        { name: 'Taza Cerámica Negra 11oz', extraPrice: 0 },
        { name: 'Taza Cerámica Blanca 11oz', extraPrice: 0 },
        { name: 'Taza Mágica Térmica 11oz (Cambia con calor)', extraPrice: 12 }
      ],
      finishes: ['Negro Intermitente Matte', 'Brillante Cristal']
    },
    customizable: true
  },
  {
    id: 'vaso-aluminio-darkmatter',
    name: 'Vaso Térmico Aluminio "Dark Matter 20oz"',
    category: 'cups',
    price: 59.00,
    originalPrice: 69.00,
    technique: 'Sublimación Térmica en Metal',
    productionTime: '⚡ 24-48 hrs',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    description: 'Vaso hermético de acero/aluminio con aislamiento al vacío de doble pared. Conserva bebidas frías por 18 hrs y calientes por 8 hrs.',
    tag: '✨ EDICIÓN TÉRMINA',
    cupOptions: {
      types: [
        { name: 'Vaso Aluminio Térmico 20oz (Con sorbete)', extraPrice: 0 },
        { name: 'Botella Deportiva 600ml', extraPrice: 5 }
      ],
      finishes: ['Acabado Mate Anti-rayaduras', 'Satinado Metálico']
    },
    customizable: true
  },
  {
    id: 'polo-retro-arcade',
    name: 'Polo Heavy "Neon Grid Synth"',
    category: 'streetwear',
    price: 78.00,
    technique: 'Estampado Urbano HD 12 Colores',
    productionTime: '⚡ 24-48 hrs',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
    description: 'Combinación de estética retro arcade con cortes rectos modernos. Estampado suave sin sensación rígida.',
    tag: '🔥 POPULAR',
    apparelOptions: {
      sizes: ['S', 'M', 'L', 'XL'],
      fits: ['Oversized Streetwear', 'Boxy Heavyweight'],
      colors: [
        { name: 'Negro Carbón', hex: '#0A0A0A' },
        { name: 'Gris Washed', hex: '#374151' }
      ]
    },
    customizable: true
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'Todos los Productos', iconName: 'Grid' },
  { id: 'streetwear', label: 'Polos Oversized & Boxy Fit', iconName: 'Shirt' },
  { id: 'cups', label: 'Vasos Frosted Glass 16oz', iconName: 'Coffee' },
  { id: 'drops', label: 'Edición Especial Drop 04', iconName: 'Flame' }
];

export const FAQS = [
  {
    question: '¿Cómo funciona el proceso "Bajo Pedido"?',
    answer: 'Al no acumular sobre-stock masivo, cada prenda o vaso se estampa o sublima de manera personalizada una vez confirmado tu pedido. Esto garantiza colores ultra vivos, estampados frescos y cero fallos de almacenamiento. El tiempo de producción toma solo de 24 a 48 horas.'
  },
  {
    question: '¿Qué garantía tienen los estampados textiles y tazas?',
    answer: 'Utilizamos técnicas de fijación térmica y serigrafía de alta densidad a 200°C. Las prendas no se agrietan ni cuartean y mantienen sus colores vivos con el uso continuo.'
  },
  {
    question: '¿Cómo cuidar mis vasos y tazas sublimadas?',
    answer: 'Nuestros vasos frosted y tazas térmicas cuentan con recubrimiento de polímero importado. Son aptos para uso diario con limpieza suave. Recomendamos evitar esponjas de alambre para conservar el acabado satinado.'
  },
  {
    question: '¿Puedo enviar mi propio diseño o nombre personalizado?',
    answer: '¡Sí! Al configurar tu pedido puedes agregar texto, nombre o un mensaje especial sin costo adicional.'
  }
];

// ============================================
// SUPABASE DATA TRANSFORMATION
// ============================================

interface SupabaseProductRow {
  id: string;
  nombre: string;
  categoria_id: string | null;
  precio: number;
  precio_original: number | null;
  tecnica: string | null;
  tiempo_produccion: string | null;
  imagen: string | null;
  galeria: string[] | null;
  descripcion: string | null;
  etiqueta: string | null;
  personalizable: boolean | null;
  opciones_ropa: {
    sizes?: string[];
    fits?: string[];
    colors?: { name: string; hex: string }[];
  } | null;
  opciones_vaso: {
    types?: { name: string; extraPrice: number }[];
    finishes?: string[];
  } | null;
  destacado: boolean | null;
  activo: boolean | null;
  agotado?: boolean | null;
}

function mapSupabaseToProduct(row: SupabaseProductRow): Product {
  // Gallery: use galeria from DB, or create from main image
  const mainImage = row.imagen ?? '';
  let gallery: string[] | undefined;
  if (row.galeria && Array.isArray(row.galeria) && row.galeria.length > 0) {
    // Filter out nulls/empties and ensure main image is first
    gallery = row.galeria.filter((img: string) => img && img.length > 0);
    if (mainImage && !gallery.includes(mainImage)) {
      gallery.unshift(mainImage);
    }
  } else if (mainImage) {
    gallery = [mainImage];
  }

  return {
    id: row.id,
    name: row.nombre,
    category: (row.categoria_id || (row.opciones_ropa ? 'streetwear' : 'cups')) as ProductType,
    price: row.precio,
    originalPrice: row.precio_original ?? undefined,
    technique: row.tecnica ?? '',
    productionTime: row.tiempo_produccion ?? '',
    image: mainImage,
    galleryImages: gallery,
    description: row.descripcion ?? '',
    tag: row.etiqueta ?? undefined,
    apparelOptions: row.opciones_ropa
      ? {
          sizes: row.opciones_ropa.sizes ?? [],
          fits: row.opciones_ropa.fits ?? [],
          colors: row.opciones_ropa.colors ?? [],
        }
      : undefined,
    cupOptions: row.opciones_vaso
      ? {
          types: row.opciones_vaso.types ?? [],
          finishes: row.opciones_vaso.finishes ?? [],
        }
      : undefined,
    customizable: row.personalizable ?? false,
    agotado: row.agotado ?? false,
  };
}

// ============================================
// EXPORTED PRODUCTS (starts as static, updated from Supabase)
// ============================================

export let PRODUCTS: Product[] = PRODUCTS_STATIC;

// ============================================
// SUPABASE FETCH FUNCTION
// ============================================

export async function loadProductsFromSupabase(): Promise<Product[]> {
  if (!supabase) {
    console.error('[LUMIN] ⚠️ Supabase client is NULL. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    return [];
  }

  console.log('[LUMIN] Fetching products from Supabase...');

  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[LUMIN] ❌ Supabase fetch error:', error.message, error);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn('[LUMIN] ⚠️ No products in Supabase');
      return [];
    }

    console.log('[LUMIN] ✅ Loaded', data.length, 'products from Supabase:', data.map(d => d.nombre));
    const mapped = data.map(mapSupabaseToProduct);
    PRODUCTS = mapped;
    return mapped;
  } catch (err) {
    console.error('[LUMIN] ❌ Supabase connection failed:', err);
    return [];
  }
}
