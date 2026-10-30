import React, { memo, useState, useCallback, useEffect } from 'react';
import { Tag, ArrowRight } from 'lucide-react';
import { cfg } from '../lib/config';
import { SeasonArt } from './SeasonArt';

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80';

// Videos aceptados en los bloques del inicio (subidos desde el admin o por URL).
// Se ignora query string / fragmento (?download=1, #t=2) al detectar la extensión.
const VIDEO_URL_RE = /\.(mp4|webm|ogg|m4v|mov)(\?[^#]*)?(#.*)?$/i;

interface HeroMediaProps {
  url: string;
  alt: string;
  className?: string;
  scale?: number;
  opacity?: number;
}

const HeroMedia: React.FC<HeroMediaProps> = memo(({ url, alt, className, scale = 100, opacity = 100 }) => {
  const [videoFailed, setVideoFailed] = useState(false);
  const isVideo = VIDEO_URL_RE.test(url) && !videoFailed;
  const isTikTok = /tiktok\.com/i.test(url);
  const scaleVal = Math.max(50, Math.min(200, scale)) / 100;
  const opacityVal = Math.max(0, Math.min(100, opacity)) / 100;

  const wrapperStyle: React.CSSProperties = { opacity: opacityVal };
  const mediaStyle: React.CSSProperties = { transform: `scale(${scaleVal})`, transformOrigin: 'center' };

  const handleVideoError = useCallback(() => {
    setVideoFailed(true);
  }, []);

  // Si cambia la media (admin sube otro archivo), se reintenta desde cero
  useEffect(() => {
    setVideoFailed(false);
  }, [url]);

  if (isTikTok) {
    const videoId = url.match(/\/video\/(\d+)/)?.[1];
    const embedUrl = videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : url;
    return (
      <div className={`${className} relative overflow-hidden`} style={wrapperStyle}>
        <iframe src={embedUrl} title={alt} className="absolute inset-0 w-[170%] h-[170%] -left-[35%] -top-[20%] border-0 pointer-events-none" allow="autoplay; fullscreen" allowFullScreen />
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        onError={handleVideoError}
        className={className}
        style={{ ...wrapperStyle, ...mediaStyle, backgroundColor: '#000' }}
      />
    );
  }

  // Si el video no se puede reproducir (formato/CORS), se muestra la imagen de respaldo
  const imgSrc = videoFailed ? DEFAULT_FALLBACK : url;
  return <img src={imgSrc} alt={alt} className={className} loading="eager" style={{ ...wrapperStyle, ...mediaStyle }} />;
});
HeroMedia.displayName = 'HeroMedia';

interface HeroBannerProps {
  onExploreClick: () => void;
  onCustomOrderClick: () => void;
  themeMode?: 'dark' | 'light' | 'amoled';
  heroMedia1Url?: string;
  heroMedia2Url?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = React.memo(({
  onExploreClick,
  onCustomOrderClick,
  heroMedia1Url,
  heroMedia2Url,
}) => {
  const defaultMedia1 = cfg('hero_media_1_url', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80');
  const defaultMedia2 = cfg('hero_media_2_url', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80');

  return (
    <section className="hero">
      <div>
        <p className="eyebrow accent">
          <span className="dot" />
          {cfg('hero_badge', 'HECHO BAJO PEDIDO · HECHO PARA TI')}
        </p>

        <h1>
          {cfg('hero_title_1', 'Tu idea.')}
          <span>{cfg('hero_title_2', 'Hecha tuya.')}</span>
        </h1>

        <p>
          {cfg('hero_subtitle_1', 'Polos, tazas y placas con tu estilo.')}{' '}
          <strong>{cfg('hero_subtitle_2', 'Elige un diseño o cuéntanos el tuyo:')}</strong>{' '}
          {cfg('hero_description', 'lo hacemos especialmente para ti.')}
        </p>

        <div className="hero-actions">
          <button type="button" className="btn" onClick={onExploreClick}>
            {cfg('hero_cta_catalogo', 'Explorar catálogo')}
            <ArrowRight />
          </button>
          <button type="button" className="btn outline" onClick={onCustomOrderClick}>
            {cfg('hero_cta_idea', 'Tengo una idea')}
            <Tag />
          </button>
        </div>
      </div>

      <div className="season-visual">
        <div className="stage">
          <div className="hero-photo">
            <HeroMedia
              url={heroMedia1Url || defaultMedia1}
              alt={cfg('hero_street_sub', 'Polo Streetwear')}
              scale={parseInt(cfg('hero_media_1_scale', '100'))}
              opacity={parseInt(cfg('hero_media_1_opacity', '100'))}
            />
          </div>
          <div className="hero-photo secondary">
            <HeroMedia
              url={heroMedia2Url || defaultMedia2}
              alt={cfg('hero_subli_sub', 'Vaso sublimado')}
              scale={parseInt(cfg('hero_media_2_scale', '100'))}
              opacity={parseInt(cfg('hero_media_2_opacity', '100'))}
            />
          </div>
          <span className="stamp">{cfg('hero_stamp', '100% PERSONALIZADO')}</span>
          <span className="stage-caption">{cfg('hero_stage_caption', 'DISEÑO ARTÍSTICO / SUBLIMACIÓN')}</span>
        </div>
        <SeasonArt />
      </div>
    </section>
  );
});
HeroBanner.displayName = 'HeroBanner';
