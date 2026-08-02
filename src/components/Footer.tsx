import React from 'react';
import { Tag, MessageCircle, Instagram, ShieldCheck, MapPin, Shirt, Coffee, Flame, FileText } from 'lucide-react';
import { cfg } from '../lib/config';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const Footer: React.FC<FooterProps> = React.memo(({ onOpenPrivacy, onOpenTerms }) => {
  return (
    <footer className="bg-[#070806] border-t border-white/10 pt-12 pb-28 px-4 lg:px-8 mt-16 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D2E8A3]"></span>
            <span className="font-display text-xl font-black text-white uppercase tracking-tight">
              {cfg('brand_name', 'LUMIN SHOP')}<span className="text-[#D2E8A3]">.</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            {cfg('footer_description', 'Marca independiente de ropa urbana streetwear (polos gráficos de alta definición) y vasos/tazas sublimadas de alta temperatura. Trabajamos 100% bajo pedido para garantizar máxima calidad.')}
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161814] border border-[#D2E8A3]/20 text-[#D2E8A3] text-[11px] font-mono">
            <Tag className="w-3 h-3 text-[#D2E8A3]" />
            <span>{cfg('footer_production', 'Producción Express 24-48 hrs')}</span>
          </div>
        </div>

        {/* Col 2: Categorías rápidas */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider">
            {cfg('footer_collections', 'Colecciones')}
          </h4>
          <ul className="space-y-2">
            <li>
              <a href="#catalog-section" className="hover:text-[#D2E8A3] transition-colors flex items-center gap-2">
                <Shirt className="w-3.5 h-3.5 text-[#D2E8A3]" />
                <span>{cfg('footer_col_1', 'Polos Oversized & Boxy Fit')}</span>
              </a>
            </li>
            <li>
              <a href="#catalog-section" className="hover:text-[#D2E8A3] transition-colors flex items-center gap-2">
                <Coffee className="w-3.5 h-3.5 text-[#D2E8A3]" />
                <span>{cfg('footer_col_2', 'Vasos Frosted Glass 16oz')}</span>
              </a>
            </li>
            <li>
              <a href="#catalog-section" className="hover:text-[#D2E8A3] transition-colors flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-[#D2E8A3]" />
                <span>{cfg('footer_col_3', 'Tazas Térmicas 11oz')}</span>
              </a>
            </li>
            <li>
              <a href="#catalog-section" className="hover:text-[#D2E8A3] transition-colors flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-[#D2E8A3]" />
                <span>{cfg('footer_col_4', 'Edición Especial Drop 04')}</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Atención y Garantías */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider">
            {cfg('footer_guarantee_title', 'Garantía & Envíos')}
          </h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D2E8A3]" />
              <span>{cfg('footer_guarantee_1', 'Estampados HD de alta resistencia')}</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D2E8A3]" />
              <span>{cfg('footer_guarantee_2', 'Envíos directos a todo el país')}</span>
            </li>
            <li><span>{cfg('footer_guarantee_3', 'Pagos seguros: Yape, Plin, Transferencia o Tarjeta')}</span></li>
          </ul>
        </div>

        {/* Col 4: Contacto directo & Redes */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider">
            {cfg('footer_social_title', 'Síguenos en Redes')}
          </h4>
          <p className="text-gray-400 text-xs">
            {cfg('footer_social_text', 'Encuéntranos en TikTok, Facebook e Instagram como')} <strong className="text-[#D2E8A3]">{cfg('brand_instagram', '@.lumin.shop')}</strong>
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={`https://wa.me/${cfg('brand_phone_raw', '51993365099')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-[#161814] hover:bg-[#D2E8A3] text-white hover:text-black transition-all border border-white/10 flex items-center gap-1.5 px-3.5"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-[#D2E8A3] group-hover:text-black" />
              <span className="font-bold text-[11px]">WhatsApp</span>
            </a>
            <a
              href={cfg('brand_tiktok', 'https://tiktok.com/@.lumin.shop').startsWith('http') ? cfg('brand_tiktok', 'https://tiktok.com/@.lumin.shop') : `https://tiktok.com/${cfg('brand_tiktok', '@.lumin.shop')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-[#161814] hover:bg-[#D2E8A3] text-white hover:text-black transition-all border border-white/10 flex items-center gap-1.5 px-3.5"
              title={`TikTok ${cfg('brand_tiktok', '@.lumin.shop')}`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.39V9.06a6.34 6.34 0 0 0-3.5 1.05 6.33 6.33 0 0 0-2.8 4.28 6.34 6.34 0 0 0 1.25 5.25A6.33 6.33 0 0 0 9.17 22a6.34 6.34 0 0 0 6.33-6.33V9a8.16 8.16 0 0 0 4.09 1.14V6.69z"/>
              </svg>
              <span className="font-bold text-[11px]">TikTok</span>
            </a>
            <a
              href={cfg('brand_facebook', 'https://facebook.com/lumin.shop').startsWith('http') ? cfg('brand_facebook', 'https://facebook.com/lumin.shop') : `https://facebook.com/${cfg('brand_facebook', 'lumin.shop')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-[#161814] hover:bg-blue-600 text-white hover:text-black transition-all border border-white/10 flex items-center gap-1.5 px-3.5"
              title={`Facebook ${cfg('brand_facebook', 'lumin.shop')}`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-bold text-[11px]">Facebook</span>
            </a>
            <a
              href={cfg('brand_instagram', 'https://instagram.com/lumin.shop').startsWith('http') ? cfg('brand_instagram', 'https://instagram.com/lumin.shop') : `https://instagram.com/${cfg('brand_instagram', 'lumin.shop')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-[#161814] hover:bg-[#D2E8A3] text-white hover:text-black transition-all border border-white/10 flex items-center gap-1.5 px-3.5"
              title={`Instagram ${cfg('brand_instagram', '@.lumin.shop')}`}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span className="font-bold text-[11px]">Instagram</span>
            </a>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
        <p>{cfg('footer_copyright', '© 2026 LUMIN SHOP. Todos los derechos reservados. Moda Urbana & Sublimación Bajo Pedido.')}</p>
        <div className="flex items-center gap-4">
          {onOpenPrivacy && (
            <button onClick={onOpenPrivacy} className="hover:text-[#D2E8A3] transition-colors flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Privacidad</span>
            </button>
          )}
          {onOpenTerms && (
            <button onClick={onOpenTerms} className="hover:text-[#D2E8A3] transition-colors flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Términos</span>
            </button>
          )}
          <span className="font-mono">Acento: #D2E8A3 | Carbón: #0A0A0A</span>
        </div>
      </div>
    </footer>
  );
});
Footer.displayName = 'Footer';
