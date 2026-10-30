// Paletas de color de marca — se aplican mediante variables CSS (--accent*)
export interface Palette {
  accent: string; // color principal sobre fondos oscuros
  hover: string; // tono hover principal
  hover2: string; // tono hover fuerte / active
  light: string; // acento para tema claro (botones, fondos)
  ink: string; // texto de acento legible en tema claro
  on: string; // texto sobre el fondo de acento (btn .btn)
}

export const PALETTES: Record<string, Palette> = {
  green: { accent: '#D2E8A3', hover: '#c2e088', hover2: '#b8d682', light: '#8AB73B', ink: '#4D7C0F', on: '#1e2911' },
  sand: { accent: '#e4cfaf', hover: '#dcc394', hover2: '#d2b681', light: '#8A6A44', ink: '#80603b', on: '#33271a' },
  lilac: { accent: '#d5c7ed', hover: '#c9b9e7', hover2: '#bcaae0', light: '#705395', ink: '#705395', on: '#2b203e' },
};

export const PALETTE_LABELS: Record<string, { name: string; desc: string }> = {
  green: { name: 'Verde salvia', desc: 'Mantiene la identidad de LUMIN. Recomendado.' },
  sand: { name: 'Arena cálida', desc: 'Más suave, artesanal y cercano.' },
  lilac: { name: 'Lavanda suave', desc: 'Un toque creativo sin colores intensos.' },
};

// Acentos de campaña de temporada (misma lógica que la maqueta: al activar una
// campaña el acento de TODA la tienda cambia; al volver a "none" se recupera).
export const SEASON_ACCENTS: Record<string, { accent: string; on: string; ink: string }> = {
  halloween: { accent: '#e7b07b', on: '#362312', ink: '#965120' },
  christmas: { accent: '#b9dfc2', on: '#183d24', ink: '#29623d' },
  newyear: { accent: '#e6d398', on: '#392e13', ink: '#776026' },
  blackfriday: { accent: '#efefeb', on: '#191b16', ink: '#333333' },
};

/** Hex del acento para una paleta (para mostrar en textos informativos). */
export const paletteAccent = (name?: string): string =>
  (PALETTES[name ?? 'green'] || PALETTES.green).accent;

/**
 * Aplica la paleta + campaña de temporada como variables CSS en :root,
 * y sincroniza las clases que usa el CSS de la maqueta
 * (palette-*, season-*, layout-*).
 */
export function applyPalette(name?: string, season?: string, layout?: string): void {
  if (typeof document === 'undefined') return;

  const paletteKey = name && PALETTES[name] ? name : 'green';
  const p = PALETTES[paletteKey];
  const seasonKey = season && SEASON_ACCENTS[season] ? season : 'none';
  const s = SEASON_ACCENTS[seasonKey];

  const accent = s ? s.accent : p.accent;
  const ink = s ? s.ink : p.ink;
  const on = s ? s.on : p.on;
  const hover = s ? `color-mix(in srgb, ${accent} 88%, #000 12%)` : p.hover;
  const hover2 = s ? `color-mix(in srgb, ${accent} 78%, #000 22%)` : p.hover2;

  const root = document.documentElement.style;
  root.setProperty('--accent', accent);
  root.setProperty('--accent-hover', hover);
  root.setProperty('--accent-hover2', hover2);
  root.setProperty('--accent-light', s ? accent : p.light);
  root.setProperty('--accent-ink', ink);
  root.setProperty('--on', on);

  const html = document.documentElement;
  for (const k of Object.keys(PALETTES)) html.classList.toggle(`palette-${k}`, k === paletteKey);
  const seasons = ['none', ...Object.keys(SEASON_ACCENTS)];
  for (const k of seasons) html.classList.toggle(`season-${k}`, k === seasonKey);
  html.classList.toggle('layout-compact', (layout || 'compact') !== 'airy');
}

/** Hex actual del acento leído desde CSS (para canvas/imágenes). */
export function currentAccentHex(): string {
  if (typeof document === 'undefined') return '#D2E8A3';
  return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#D2E8A3';
}
