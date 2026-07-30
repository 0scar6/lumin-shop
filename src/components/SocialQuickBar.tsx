import React from 'react';
import { MessageCircle, Instagram } from 'lucide-react';
import { cfg } from '../lib/config';

interface SocialQuickBarProps {
  themeMode?: 'dark' | 'light' | 'amoled';
}

export const SocialQuickBar: React.FC<SocialQuickBarProps> = ({ themeMode = 'dark' }) => {
  const isLight = themeMode === 'light';

  const handleWhatsApp = () => {
    const text = encodeURIComponent(cfg('brand_whatsapp_help', 'Hola LÚMIN SHOP! ⚡ Quisiera hacer una consulta o realizar un pedido por WhatsApp.'));
    window.open(`https://wa.me/${cfg('brand_phone_raw', '51993365099')}?text=${text}`, '_blank');
  };

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
      isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10 text-white'
    }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Label */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 flex-shrink-0">
            <MessageCircle className="w-5 h-5 fill-green-500 text-green-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base uppercase tracking-tight">
                WhatsApp & Redes Oficiales
              </h4>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Contacto directo <strong>{cfg('brand_phone', '993 365 099')}</strong> • Respuesta inmediata
            </p>
          </div>
        </div>

        {/* Right Icon Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center">
          
          {/* WhatsApp Direct Icon Button */}
          <button
            onClick={handleWhatsApp}
            className="p-3 rounded-2xl bg-green-500 hover:bg-green-600 text-black font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 px-4"
            title="Abrir WhatsApp Directo"
          >
            <MessageCircle className="w-5 h-5 fill-black" />
            <span className="text-xs uppercase font-extrabold">WhatsApp</span>
          </button>

          {/* Instagram Icon Button */}
          <a
            href="https://instagram.com/lumin.shop"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center ${
              isLight
                ? 'bg-slate-100 hover:bg-pink-500 hover:text-white border-slate-300 text-slate-800'
                : 'bg-[#0A0A0A] hover:bg-pink-600 text-gray-300 hover:text-white border-white/10'
            }`}
            title="Instagram @.lumin.shop"
          >
            <Instagram className="w-5 h-5" />
          </a>

          {/* TikTok Icon Button */}
          <a
            href="https://tiktok.com/@.lumin.shop"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center ${
              isLight
                ? 'bg-slate-100 hover:bg-black hover:text-white border-slate-300 text-slate-800'
                : 'bg-[#0A0A0A] hover:bg-white hover:text-black text-gray-300 border-white/10'
            }`}
            title="TikTok @.lumin.shop"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.39V9.06a6.34 6.34 0 0 0-3.5 1.05 6.33 6.33 0 0 0-2.8 4.28 6.34 6.34 0 0 0 1.25 5.25A6.33 6.33 0 0 0 9.17 22a6.34 6.34 0 0 0 6.33-6.33V9a8.16 8.16 0 0 0 4.09 1.14V6.69z"/>
            </svg>
          </a>

          {/* Facebook Icon Button */}
          <a
            href="https://facebook.com/lumin.shop"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center ${
              isLight
                ? 'bg-slate-100 hover:bg-blue-600 hover:text-white border-slate-300 text-slate-800'
                : 'bg-[#0A0A0A] hover:bg-blue-600 text-gray-300 hover:text-white border-white/10'
            }`}
            title="Facebook @.lumin.shop"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

        </div>

      </div>
    </div>
  );
};

export const FloatingWhatsAppWidget: React.FC = () => {
  const handleWhatsApp = () => {
    const text = encodeURIComponent(cfg('brand_whatsapp_help', 'Hola LÚMIN SHOP! ⚡ Quisiera hacer una consulta rápida desde la web.'));
    window.open(`https://wa.me/${cfg('brand_phone_raw', '51993365099')}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-40 flex flex-col items-end gap-2 group">
      {/* Tooltip on hover */}
      <div className="hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold border border-slate-700 shadow-2xl animate-fade-in pointer-events-none whitespace-nowrap">
        <span>Atención {cfg('brand_phone', '993 365 099')}</span>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
      </div>

      {/* Floating Action WhatsApp Button */}
      <button
        onClick={handleWhatsApp}
        className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-green-600 via-green-500 to-emerald-400 text-black flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 active:scale-95 transition-all group"
        aria-label="Contactar por WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-slate-900 animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-slate-900"></span>
        <MessageCircle className="w-7 h-7 fill-black text-black" />
      </button>
    </div>
  );
};
