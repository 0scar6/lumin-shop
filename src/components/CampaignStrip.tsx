import React, { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { cfg } from '../lib/config';

export interface SeasonMeta {
  label: string;
  emoji: string;
  accent: string;
  message: string;
}

export const SEASONS: Record<string, SeasonMeta> = {
  halloween: {
    label: 'HALLOWEEN',
    emoji: '🎃',
    accent: '#e7b07b',
    message: 'Dale un toque distinto a tus diseños de temporada.',
  },
  christmas: {
    label: 'NAVIDAD',
    emoji: '🎄',
    accent: '#b9dfc2',
    message: 'Un detalle personalizado para compartir esta Navidad.',
  },
  newyear: {
    label: 'AÑO NUEVO',
    emoji: '✨',
    accent: '#e6d398',
    message: 'Nuevas ideas para empezar el año a tu manera.',
  },
  blackfriday: {
    label: 'BLACK FRIDAY',
    emoji: '🏷️',
    accent: '#efefeb',
    message: 'Explora los diseños disponibles y consulta tu pedido.',
  },
};

export const SEASON_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'Sin campaña' },
  { value: 'halloween', label: '🎃 Halloween' },
  { value: 'christmas', label: '🎄 Navidad' },
  { value: 'newyear', label: '✨ Año Nuevo' },
  { value: 'blackfriday', label: '🏷️ Black Friday' },
];

interface CampaignStripProps {
  onExploreClick: () => void;
  themeMode?: 'dark' | 'light' | 'amoled';
}

/** Franja de campaña de temporada — solo visible si hay una temporada activa en la config. */
export const CampaignStrip = memo(({ onExploreClick, themeMode = 'dark' }: CampaignStripProps) => {
  const seasonKey = cfg('season_active', 'none');
  const season = SEASONS[seasonKey];
  if (!season) return null;

  const message = cfg('season_message', '').trim() || season.message;
  const isLight = themeMode === 'light';

  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-5 py-3 rounded-2xl border transition-colors"
      style={{ borderColor: `${season.accent}55`, backgroundColor: `${season.accent}12` }}
    >
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border flex-shrink-0"
        style={{ color: season.accent, borderColor: `${season.accent}66`, backgroundColor: `${season.accent}1a` }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: season.accent }} />
        {season.emoji} {season.label}
      </span>

      <span className={`flex-1 min-w-[160px] text-xs sm:text-sm leading-snug ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
        {message}
      </span>

      <button
        onClick={onExploreClick}
        className="group inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider flex-shrink-0 min-h-[32px] transition-opacity hover:opacity-80"
        style={{ color: season.accent }}
      >
        Ver diseños
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
});
CampaignStrip.displayName = 'CampaignStrip';
