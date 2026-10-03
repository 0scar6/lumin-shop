// Paletas de color de marca — se aplican mediante variables CSS (--accent*)
export interface Palette {
  accent: string; // color principal sobre fondos oscuros
  hover: string; // tono hover principal
  hover2: string; // tono hover fuerte / active
  light: string; // acento para tema claro (botones, fondos)
  ink: string; // texto de acento legible en tema claro
}

export const PALETTES: Record<string, Palette> = {
  green: { accent: '#D2E8A3', hover: '#c2e088', hover2: '#b8d682', light: '#8AB73B', ink: '#4D7C0F' },
  sand: { accent: '#e4cfaf', hover: '#dcc394', hover2: '#d2b681', light: '#8A6A44', ink: '#80603b' },
  lilac: { accent: '#d5c7ed', hover: '#c9b9e7', hover2: '#bcaae0', light: '#705395', ink: '#705395' },
};

export const PALETTE_LABELS: Record<string, { name: string; desc: string }> = {
  green: { name: 'Verde salvia', desc: 'Mantiene la identidad de LUMIN. Recomendado.' },
  sand: { name: 'Arena cálida', desc: 'Más suave, artesanal y cercano.' },
  lilac: { name: 'Lavanda suave', desc: 'Un toque creativo sin colores intensos.' },
};

/** Hex del acento para una paleta (para mostrar en textos informativos). */
export const paletteAccent = (name?: string): string =>
  (PALETTES[name ?? 'green'] || PALETTES.green).accent;

/** Aplica la paleta como variables CSS en :root. */
export function applyPalette(name: string): void {
  if (typeof document === 'undefined') return;
  const p = PALETTES[name] || PALETTES.green;
  const root = document.documentElement.style;
  root.setProperty('--accent', p.accent);
  root.setProperty('--accent-hover', p.hover);
  root.setProperty('--accent-hover2', p.hover2);
  root.setProperty('--accent-light', p.light);
  root.setProperty('--accent-ink', p.ink);
}

/** Hex actual del acento leído desde CSS (para canvas/imágenes). */
export function currentAccentHex(): string {
  if (typeof document === 'undefined') return '#D2E8A3';
  return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#D2E8A3';
}
