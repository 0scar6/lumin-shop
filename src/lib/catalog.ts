import type {
  CategoryAttributeDef,
  CategoryKind,
  CategoryUI,
  MeasureValue,
  Product,
} from '../types';

/**
 * Catálogo flexible: las categorías definen qué filtros usan (tallas, onzas,
 * medidas u otros que se agreguen desde el panel) y cada producto guarda sus
 * valores en `atributos`.
 *
 * Para no depender de una migración SQL, la taxonomía (tipo + filtros) se
 * guarda en la fila `catalog_taxonomy` de `configuracion`, y los valores de
 * cada producto dentro de `opciones_ropa.atributos` / `opciones_vaso.atributos`.
 */

export interface CategoryTaxonomyEntry {
  id: string;
  tipo: CategoryKind;
  atributos: CategoryAttributeDef[];
}

export const CATEGORY_KIND_LABEL: Record<CategoryKind, string> = {
  ropa: 'Ropa / tallas',
  vaso: 'Vasos / onzas',
  placa: 'Placas / medidas',
  otro: 'Otro / libre',
};

export const DEFAULT_TAXONOMY: CategoryTaxonomyEntry[] = [
  {
    id: 'streetwear',
    tipo: 'ropa',
    atributos: [
      { key: 'talla', label: 'Talla', tipo: 'opciones', valores: ['S', 'M', 'L', 'XL', 'XXL'] },
    ],
  },
  {
    id: 'cups',
    tipo: 'vaso',
    atributos: [
      { key: 'onzas', label: 'Onzas', tipo: 'opciones', valores: ['11oz', '16oz', '20oz'] },
    ],
  },
  {
    id: 'drops',
    tipo: 'placa',
    atributos: [
      { key: 'medida', label: 'Medida (alto × ancho)', tipo: 'medida', unidad: 'cm', valores: [] },
    ],
  },
];

const TAXONOMY_CONFIG_ID = 'catalog_taxonomy';

export function taxonomyConfigId(): string {
  return TAXONOMY_CONFIG_ID;
}

export function defaultTaxonomyFor(id: string): CategoryTaxonomyEntry {
  const found = DEFAULT_TAXONOMY.find((c) => c.id === id);
  if (found) return found;
  if (/gorra|cap|sombrero/i.test(id)) {
    return { id, tipo: 'ropa', atributos: [{ key: 'talla', label: 'Talla', tipo: 'opciones', valores: ['Unitalla', 'S/M', 'L/XL'] }] };
  }
  return { id, tipo: 'otro', atributos: [] };
}

export function parseTaxonomy(raw?: string | null): CategoryTaxonomyEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => entry && typeof entry.id === 'string')
      .map((entry) => ({
        id: String(entry.id),
        tipo: (['ropa', 'vaso', 'placa', 'otro'].includes(entry.tipo) ? entry.tipo : 'otro') as CategoryKind,
        atributos: Array.isArray(entry.atributos)
          ? entry.atributos
              .filter((a: any) => a && typeof a.key === 'string')
              .map((a: any) => ({
                key: String(a.key),
                label: String(a.label || a.key),
                tipo: a.tipo === 'medida' ? 'medida' : 'opciones',
                valores: Array.isArray(a.valores) ? a.valores.map((v: any) => String(v)).filter(Boolean) : [],
                unidad: typeof a.unidad === 'string' ? a.unidad : 'cm',
              }))
          : [],
      }));
  } catch {
    return [];
  }
}

export function serializeTaxonomy(entries: CategoryTaxonomyEntry[]): string {
  return JSON.stringify(
    entries.map((entry) => ({
      id: entry.id,
      tipo: entry.tipo,
      atributos: entry.atributos.map((a) => ({
        key: a.key,
        label: a.label,
        tipo: a.tipo,
        valores: a.valores || [],
        ...(a.tipo === 'medida' ? { unidad: a.unidad || 'cm' } : {}),
      })),
    })),
  );
}

export function buildCategoryList(
  rows: { id: string; nombre: string; icono?: string | null; activo?: boolean; orden?: number }[],
  taxonomy: CategoryTaxonomyEntry[],
  includeAll = true,
): CategoryUI[] {
  const mapped: CategoryUI[] = rows.map((row) => {
    const meta = taxonomy.find((t) => t.id === row.id) || defaultTaxonomyFor(row.id);
    return {
      id: row.id,
      label: row.nombre,
      iconName: row.icono || 'Grid',
      tipo: meta.tipo,
      atributos: meta.atributos,
      activo: row.activo !== false,
      orden: row.orden ?? 0,
    };
  });
  return includeAll
    ? [{ id: 'all', label: 'Todos los Productos', iconName: 'Grid', tipo: 'otro', atributos: [] }, ...mapped]
    : mapped;
}

export function categoryKindOf(categories: CategoryUI[], id: string): CategoryKind {
  return categories.find((c) => c.id === id)?.tipo || defaultTaxonomyFor(id).tipo;
}

export function categoryLabelOf(
  categories: CategoryUI[],
  id: string,
  fallback: string,
): string {
  return categories.find((c) => c.id === id)?.label || fallback;
}

export function categoryAttributesOf(
  categories: CategoryUI[],
  id: string,
): CategoryAttributeDef[] {
  return categories.find((c) => c.id === id)?.atributos || defaultTaxonomyFor(id).atributos;
}

// ─────────────────────────────────────────────────────────────
// Valores de atributos
// ─────────────────────────────────────────────────────────────

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL', '4XL', '5XL'];

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value).replace('.', ',');
}

export function measureLabel(measure: { alto: number; ancho: number }, unidad = 'cm'): string {
  return `${formatNumber(measure.alto)} × ${formatNumber(measure.ancho)} ${unidad}`.trim();
}

export function measureKey(measure: { alto: number; ancho: number }): string {
  return `${formatNumber(measure.alto)}x${formatNumber(measure.ancho)}`;
}

export function parseMeasures(text: string): { alto: number; ancho: number }[] {
  if (!text) return [];
  const found: { alto: number; ancho: number }[] = [];
  const re = /(\d+(?:[.,]\d+)?)\s*(?:cm|mm)?\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(cm|mm)?/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const alto = parseFloat(match[1].replace(',', '.'));
    const ancho = parseFloat(match[2].replace(',', '.'));
    if (Number.isFinite(alto) && Number.isFinite(ancho)) {
      const scale = (match[3] || '').toLowerCase() === 'mm' ? 0.1 : 1;
      found.push({ alto: Math.round(alto * scale * 10) / 10, ancho: Math.round(ancho * scale * 10) / 10 });
    }
  }
  return found;
}

export function parseOunces(text: string): string[] {
  if (!text) return [];
  const out: string[] = [];
  const re = /(\d+(?:[.,]\d+)?)\s*oz/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    out.push(`${match[1].replace(',', '.')}oz`);
  }
  return out;
}

export function sortAttributeValues(values: string[]): string[] {
  const unique = [...new Set(values.map((v) => String(v).trim()).filter(Boolean))];
  return unique.sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toUpperCase());
    const bi = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    const an = parseFloat(a.replace(',', '.'));
    const bn = parseFloat(b.replace(',', '.'));
    if (Number.isFinite(an) && Number.isFinite(bn) && !a.includes('×') && !b.includes('×')) return an - bn;
    return a.localeCompare(b, 'es');
  });
}

function storedValues(product: Product, key: string): (string | MeasureValue)[] {
  const raw = product.attributes?.[key];
  return Array.isArray(raw) ? raw : [];
}

/**
 * Todos los valores de un atributo para un producto. Si el producto todavía no
 * tiene el atributo guardado, se deduce de las opciones antiguas (tallas,
 * tipos de vaso, técnica o nombre) para que los filtros nunca lo dejen fuera.
 */
export function attributeValues(product: Product, def: CategoryAttributeDef): string[] {
  const key = def.key.toLowerCase();
  const unidad = def.unidad || 'cm';

  if (def.tipo === 'medida' || /medida|alto|ancho|dimension/.test(key)) {
    const measures: { alto: number; ancho: number }[] = [];
    for (const item of storedValues(product, def.key)) {
      if (item && typeof item === 'object' && 'alto' in item && 'ancho' in item) {
        measures.push({ alto: Number(item.alto), ancho: Number(item.ancho) });
      }
    }
    for (const type of product.cupOptions?.types || []) measures.push(...parseMeasures(type.name));
    measures.push(...parseMeasures(product.technique || ''));
    measures.push(...parseMeasures(product.name || ''));
    return [...new Set(
      measures
        .filter((m) => Number.isFinite(m.alto) && Number.isFinite(m.ancho))
        .map((m) => measureLabel(m, unidad)),
    )].sort((a, b) => {
      const [a1] = a.split('×').map((n) => parseFloat(n.replace(',', '.')));
      const [b1] = b.split('×').map((n) => parseFloat(n.replace(',', '.')));
      return (a1 || 0) - (b1 || 0);
    });
  }

  const values: string[] = [];
  for (const item of storedValues(product, def.key)) {
    if (typeof item === 'string') values.push(item);
  }

  const wantsSizes = /talla|size|medida_textil/.test(key);
  const wantsOunces = /onza|oz|ounce/.test(key);

  if (wantsSizes) {
    for (const size of product.apparelOptions?.sizes || []) {
      values.push(typeof size === 'string' ? size : size.name);
    }
  }

  if (wantsOunces) {
    for (const type of product.cupOptions?.types || []) values.push(...parseOunces(type.name));
    values.push(...parseOunces(product.name || ''));
    values.push(...parseOunces(product.technique || ''));
  }

  return sortAttributeValues(values);
}

/** ¿El producto cumple todos los filtros de atributo elegidos? */
export function matchesAttributes(
  product: Product,
  defs: CategoryAttributeDef[],
  selected: Record<string, string>,
): boolean {
  return defs.every((def) => {
    const chosen = selected[def.key];
    if (!chosen) return true;
    const target = chosen.toLowerCase();
    return attributeValues(product, def).some((v) => v.toLowerCase() === target);
  });
}
