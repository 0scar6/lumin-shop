/**
 * Normaliza el catálogo real de LUMIN SHOP:
 *  - define la taxonomía de filtros (tallas / onzas / medidas) en configuracion
 *  - deduce y guarda los atributos de cada producto dentro de opciones_ropa/vaso
 *  - mueve la "Placa Sublimada" de Polos a Placas y convierte su medida
 *
 * Uso:  node scripts/normalize-catalog.mjs
 * Requiere .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
 */
import fs from 'node:fs';

const envText = fs.readFileSync('.env', 'utf8');
const env = (key) => (envText.match(new RegExp(`^${key}=(.*)$`, 'm')) || [])[1]?.trim().replace(/^"|"$/g, '');
const url = env('VITE_SUPABASE_URL');
const key = env('VITE_SUPABASE_ANON_KEY');
if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

const request = async (path, options = {}) => {
  const res = await fetch(`${url}/rest/v1/${path}`, { headers, ...options });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
};

const TAXONOMY = [
  {
    id: 'streetwear',
    tipo: 'ropa',
    atributos: [{ key: 'talla', label: 'Talla', tipo: 'opciones', valores: ['S', 'M', 'L', 'XL', 'XXL'] }],
  },
  {
    id: 'cups',
    tipo: 'vaso',
    atributos: [{ key: 'onzas', label: 'Onzas', tipo: 'opciones', valores: ['11oz', '16oz', '20oz'] }],
  },
  {
    id: 'drops',
    tipo: 'placa',
    atributos: [{ key: 'medida', label: 'Medida (alto × ancho)', tipo: 'medida', unidad: 'cm', valores: [] }],
  },
];

const VALID_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL', '4XL', '5XL'];

const measureLabel = (m, unidad = 'cm') => `${m.alto} × ${m.ancho} ${unidad}`;
const measureKey = (m) => `${m.alto}x${m.ancho}`;

function parseMeasures(text = '') {
  const out = [];
  const re = /(\d+(?:[.,]\d+)?)\s*(?:cm|mm)?\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(cm|mm)?/gi;
  let match;
  while ((match = re.exec(text)) !== null) {
    const alto = parseFloat(match[1].replace(',', '.'));
    const ancho = parseFloat(match[2].replace(',', '.'));
    if (Number.isFinite(alto) && Number.isFinite(ancho)) {
      const scale = (match[3] || '').toLowerCase() === 'mm' ? 0.1 : 1;
      out.push({ alto: Math.round(alto * scale * 10) / 10, ancho: Math.round(ancho * scale * 10) / 10 });
    }
  }
  return out;
}

function parseOunces(text = '') {
  const out = [];
  const re = /(\d+(?:[.,]\d+)?)\s*oz/gi;
  let match;
  while ((match = re.exec(text)) !== null) out.push(`${match[1].replace(',', '.')}oz`);
  return [...new Set(out)];
}

const products = await request('productos?select=*&order=created_at.asc');
console.log(`Productos a normalizar: ${products.length}`);

let updated = 0;
for (const product of products) {
  let categoria = product.categoria_id;
  let ropa = product.opciones_ropa ? { ...product.opciones_ropa } : null;
  let vaso = product.opciones_vaso ? { ...product.opciones_vaso } : null;
  let attributes = {
    ...(ropa?.atributos || {}),
    ...(vaso?.atributos || {}),
  };

  const isPlaque =
    categoryIs(categoria, 'streetwear') &&
    (/placa/i.test(product.nombre || '') || parseMeasures(product.tecnica || '').length > 0);

  if (isPlaque) {
    categoria = 'drops';
    const measures = [
      ...parseMeasures(product.tecnica || ''),
      ...parseMeasures(product.nombre || ''),
      ...(vaso?.types || []).flatMap((t) => parseMeasures(t.name || '')),
    ].filter((m, i, arr) => arr.findIndex((x) => measureKey(x) === measureKey(m)) === i);

    const types = measures.length > 0
      ? measures.map((m) => ({ name: measureLabel(m), extraPrice: 0 }))
      : (vaso?.types || []);

    ropa = null;
    vaso = { types, finishes: vaso?.finishes || [], atributos: { medida: measures } };
    attributes = { medida: measures };
    console.log(`→ ${product.nombre}: Polos → Placas, medidas ${measures.map((m) => measureLabel(m)).join(', ') || '(sin medida)'}`);
  } else if (categoria === 'streetwear') {
    const sizes = (ropa?.sizes || [])
      .map((s) => (typeof s === 'string' ? s : s?.name))
      .map((s) => String(s || '').trim().toUpperCase())
      .filter((s) => VALID_SIZES.includes(s));
    const finalSizes = sizes.length > 0 ? [...new Set(sizes)] : ['S', 'M', 'L', 'XL'];
    ropa = {
      sizes: finalSizes,
      fits: ropa?.fits || [],
      colors: ropa?.colors || [],
      atributos: { talla: finalSizes },
    };
    attributes = { talla: finalSizes };
    if (sizes.length === 0) {
      console.log(`→ ${product.nombre}: sin tallas, se asignan S, M, L, XL`);
    } else if (sizes.length !== (ropa?.sizes || []).length) {
      console.log(`→ ${product.nombre}: tallas normalizadas ${finalSizes.join(', ')}`);
    }
  } else if (categoria === 'cups') {
    const ounces = [
      ...parseOunces(product.nombre || ''),
      ...parseOunces(product.tecnica || ''),
      ...(vaso?.types || []).flatMap((t) => parseOunces(t.name || '')),
    ].filter((v, i, arr) => arr.indexOf(v) === i);

    const types = (vaso?.types && vaso.types.length > 0)
      ? vaso.types
      : ounces.map((oz) => ({ name: oz, extraPrice: 0 }));

    vaso = {
      types,
      finishes: vaso?.finishes || [],
      atributos: { onzas: ounces },
    };
    attributes = { onzas: ounces };
  } else if (categoria === 'drops') {
    const measures = [
      ...(vaso?.types || []).flatMap((t) => parseMeasures(t.name || '')),
      ...parseMeasures(product.tecnica || ''),
      ...parseMeasures(product.nombre || ''),
    ].filter((m, i, arr) => arr.findIndex((x) => measureKey(x) === measureKey(m)) === i);

    const types = measures.length > 0
      ? measures.map((m) => ({ name: measureLabel(m), extraPrice: 0 }))
      : (vaso?.types || []);
    vaso = { types, finishes: vaso?.finishes || [], atributos: { medida: measures } };
    attributes = { medida: measures };
  }

  const payload = {
    categoria_id: categoria,
    opciones_ropa: ropa,
    opciones_vaso: vaso,
  };

  await request(`productos?id=eq.${encodeURIComponent(product.id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  updated += 1;
  console.log(`✓ ${product.nombre} → ${categoria} · ${JSON.stringify(attributes)}`);
}

await request('configuracion?on_conflict=id', {
  method: 'POST',
  headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify({
    id: 'catalog_taxonomy',
    seccion: 'catalogo',
    clave: 'categorias',
    valor: JSON.stringify(TAXONOMY),
  }),
});

console.log(`\nListo: ${updated} productos normalizados y taxonomía guardada.`);

function categoryIs(current, expected) {
  return String(current || '').toLowerCase() === expected;
}
