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

/** Franja de campaña de temporada (`.campaign-strip`) — solo visible con temporada activa. */
export const CampaignStrip = memo(({ onExploreClick }: CampaignStripProps) => {
  const seasonKey = cfg('season_active', 'none');
  const season = SEASONS[seasonKey];
  if (!season) return null;

  const message = cfg('season_message', '').trim() || season.message;

  return (
    <div className="campaign-strip">
      <strong>
        {season.emoji} {season.label}
      </strong>
      <span>{message}</span>
      <button type="button" className="textbtn" onClick={onExploreClick}>
        Ver diseños
        <ArrowRight />
      </button>
    </div>
  );
});
CampaignStrip.displayName = 'CampaignStrip';
