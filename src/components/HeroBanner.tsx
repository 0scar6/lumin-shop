import React from 'react';
import { Tag, ArrowRight, Clock, ShieldCheck, Flame } from 'lucide-react';

interface HeroMediaProps {
  url: string;
  alt: string;
  className?: string;
}

const HeroMedia: React.FC<HeroMediaProps> = ({ url, alt, className }) => {
  const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
  const isTikTok = /tiktok\.com/i.test(url);

  if (isTikTok) {
    const videoId = url.match(/\/video\/(\d+)/)?.[1];
    const embedUrl = videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : url;
    return (
      <div className={`${className} relative overflow-hidden`}>
        <iframe
          src={embedUrl}
          title={alt}
          className="absolute inset-0 w-[170%] h-[170%] -left-[35%] -top-[20%] border-0 pointer-events-none"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
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
        className={className}
      />
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="eager"
    />
  );
};

interface HeroBannerProps {
  onExploreClick: () => void;
  onCustomOrderClick: () => void;
  themeMode?: 'dark' | 'light' | 'amoled';
  heroMedia1Url?: string;
  heroMedia2Url?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onCustomOrderClick,
  themeMode = 'dark',
  heroMedia1Url,
  heroMedia2Url,
}) => {
  const isLight = themeMode === 'light';

  const defaultMedia1 = 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80';
  const defaultMedia2 = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';

  return (
    <div className={`relative rounded-3xl overflow-hidden border p-6 sm:p-10 my-6 transition-all ${
      isLight
        ? 'bg-gradient-to-br from-white via-slate-50 to-slate-100 border-slate-300 text-slate-900 shadow-lg'
        : 'bg-gradient-to-br from-[#161814] via-[#0F110D] to-[#0A0A0A] border-white/10 text-white'
    }`}>
      {/* Background Accent Glow */}
      <div className={`absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
        isLight ? 'bg-lime-400/20' : 'bg-[#D2E8A3]/10'
      }`}></div>
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column Text Content */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isLight
              ? 'bg-lime-100 border border-lime-300 text-lime-800'
              : 'bg-[#D2E8A3]/10 border border-[#D2E8A3]/30 text-[#D2E8A3]'
          }`}>
            <Flame className="w-3.5 h-3.5 text-lime-600 dark:text-[#D2E8A3]" />
            <span>Exclusivo — COLECCIÓN BAJO DEMANDA</span>
          </div>

          <h2 className={`font-display text-3xl sm:text-5xl font-extrabold leading-tight uppercase tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            MODA URBANA & <br />
            <span className={isLight ? 'text-lime-700 font-black' : 'text-[#D2E8A3]'}>VASOS SUBLIMADOS</span>
          </h2>

          <p className={`text-sm sm:text-base max-w-xl leading-relaxed ${
            isLight ? 'text-slate-700' : 'text-gray-400'
          }`}>
            Polos Sublimados con <strong className={isLight ? 'text-slate-900 font-bold' : 'text-white'}>Estampado Urbano HD High-Density</strong> y vasos/tazas con sublimación continua a 200°C. <br className="hidden sm:inline" />
            Sin sobre-stock. Fabricado especialmente para ti al confirmar tu orden.
          </p>

          {/* Micro Production Badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
              isLight ? 'bg-slate-200 border border-slate-300 text-slate-900' : 'bg-black/60 border border-white/15 text-gray-200'
            }`}>
              <Clock className="w-3.5 h-3.5 text-lime-700 dark:text-[#D2E8A3]" />
              ⚡ Producción Express: 24 a 48 hrs
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
              isLight ? 'bg-slate-200 border border-slate-300 text-slate-900' : 'bg-black/60 border border-white/15 text-gray-200'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-lime-700 dark:text-[#D2E8A3]" />
              🛡️ Garantía de Fijación Térmica & Color
            </span>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
            <button
              onClick={onExploreClick}
              className="px-6 py-3.5 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-sm hover:bg-[#c2e088] transition-all flex items-center justify-center gap-2 shadow-lg group"
            >
              <span>EXPLORAR CATÁLOGO</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onCustomOrderClick}
              className={`px-6 py-3.5 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isLight
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
              }`}
            >
              <Tag className="w-4 h-4 text-[#D2E8A3]" />
              <span>Personalizar Mi Idea</span>
            </button>
          </div>
        </div>

        {/* Right Column Featured Products Visual Showcase */}
        <div className="lg:col-span-5 relative">
          <div className="grid grid-cols-2 gap-3 relative">
            
            {/* Feature Image 1: Streetwear */}
            <div className={`relative group overflow-hidden rounded-2xl border aspect-[4/5] ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#161814] border-white/10'
            }`}>
              <HeroMedia
                url={heroMedia1Url || defaultMedia1}
                alt="Polo Streetwear Oversized"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[10px] font-mono text-[#D2E8A3] uppercase">STREETWEAR</span>
                <span className="text-xs font-bold text-white leading-tight">Acid Tokyo 1988</span>
              </div>
            </div>

            {/* Feature Image 2: Sublimated Frosted Cup */}
            <div className={`relative group overflow-hidden rounded-2xl border aspect-[4/5] mt-6 ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#161814] border-white/10'
            }`}>
              <HeroMedia
                url={heroMedia2Url || defaultMedia2}
                alt="Vaso Sublimado Frosted"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-[10px] font-mono text-[#D2E8A3] uppercase">SUBLIMACIÓN</span>
                <span className="text-xs font-bold text-white leading-tight">Frosted Glass 16oz</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
