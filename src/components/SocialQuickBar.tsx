import React, { memo } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { cfg } from '../lib/config';

interface SocialQuickBarProps {
  themeMode?: 'dark' | 'light' | 'amoled';
}

const waUrl = (msg: string) =>
  `https://wa.me/${cfg('brand_phone_raw', '51993365099')}?text=${encodeURIComponent(msg)}`;

/**
 * Franja `.custom-banner` de personalización (bloque acento con CTA a WhatsApp),
 * igual que en LUMIN-propuesta.html.
 */
export const SocialQuickBar: React.FC<SocialQuickBarProps> = memo(() => {
  const handleWhatsApp = () => {
    window.open(
      waUrl(
        cfg(
          'brand_whatsapp_help',
          'Hola LUMIN SHOP! ⚡ Quisiera hacer una consulta o realizar un pedido por WhatsApp.',
        ),
      ),
      '_blank',
    );
  };

  return (
    <section className="custom-banner">
      <div>
        <p className="eyebrow">
          {cfg('custom_banner_eyebrow', '¿TIENES ALGO DIFERENTE EN MENTE?')}
        </p>
        <h2>{cfg('custom_banner_title', 'Tu diseño también tiene lugar aquí.')}</h2>
        <p>
          {cfg(
            'custom_banner_desc',
            'Un nombre, una foto o esa idea que no encuentras en el catálogo.',
          )}
        </p>
      </div>
      <button type="button" className="btn" onClick={handleWhatsApp}>
        {cfg('custom_banner_btn', 'Cuéntanos por WhatsApp')}
        <ArrowRight />
      </button>
    </section>
  );
});
SocialQuickBar.displayName = 'SocialQuickBar';

/** Botón flotante de WhatsApp (`.wa` de la maqueta). */
export const FloatingWhatsAppWidget: React.FC = () => (
  <a
    className="wa"
    href={waUrl(cfg('brand_whatsapp_help', 'Hola LUMIN, quisiera consultar sobre un pedido.'))}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contactar por WhatsApp"
  >
    <MessageCircle />
  </a>
);
