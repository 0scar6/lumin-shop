import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cfg } from '../lib/config';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

// Redes oficiales (solo se muestran las que tengan URL https, igual que la maqueta)
const SOCIAL_LINKS = [
  { key: 'brand_tiktok', label: 'TikTok', fallback: 'https://www.tiktok.com/@.lumin.shop' },
  { key: 'brand_facebook', label: 'Facebook', fallback: 'https://www.facebook.com/share/1Md3qGZfWz/' },
  { key: 'brand_instagram', label: 'Instagram', fallback: 'https://instagram.com/lumin.shop' },
] as const;

export const Footer: React.FC<FooterProps> = React.memo(({ onOpenPrivacy, onOpenTerms }) => {
  const [storageOpen, setStorageOpen] = useState(false);

  const year = new Date().getFullYear();
  const location = cfg('brand_location', 'Ayacucho, Perú');
  const claimsUrl = cfg('footer_claims_url', '').trim();
  const waText = encodeURIComponent(
    cfg('brand_whatsapp_help', 'Hola LUMIN, quisiera consultar sobre un pedido.'),
  );
  const waUrl = `https://wa.me/${cfg('brand_phone_raw', '51993365099')}?text=${waText}`;

  return (
    <>
      <div className="wrap">
        <footer>
          <div>
            {cfg('brand_name', 'LUMIN SHOP')} ·{' '}
            {cfg('footer_description', 'Productos personalizados · Hechos bajo pedido')}
            <br />
            <span>{cfg('footer_copyright', `© ${year} · ${location}`)}</span>
          </div>

          <div className="footerlinks">
            {SOCIAL_LINKS.map(({ key, label, fallback }) => {
              const href = cfg(key, fallback);
              if (!/^https:\/\//.test(href)) return null;
              return (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer">
                  {label} ↗
                </a>
              );
            })}
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              WhatsApp ↗
            </a>
          </div>
        </footer>

        <div className="legal-links">
          <button type="button" onClick={onOpenTerms}>
            Términos y condiciones
          </button>
          <button type="button" onClick={onOpenPrivacy}>
            Privacidad
          </button>
          {claimsUrl && /^https:\/\//.test(claimsUrl) && (
            <button type="button" onClick={() => window.open(claimsUrl, '_blank', 'noopener')}>
              Libro de Reclamaciones
            </button>
          )}
          <button type="button" onClick={() => setStorageOpen(true)}>
            Almacenamiento del navegador
          </button>
        </div>
      </div>

      {/* Información de almacenamiento local (mismo contenido que la maqueta) */}
      {storageOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setStorageOpen(false)}
          role="presentation"
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Almacenamiento del navegador"
          >
            <div className="modal-head">
              <h2>Almacenamiento del navegador</h2>
              <button
                type="button"
                className="iconbtn"
                onClick={() => setStorageOpen(false)}
                aria-label="Cerrar"
              >
                <X />
              </button>
            </div>
            <div className="modal-body">
              <p>
                La tienda guarda tu tema, tus favoritos y los cambios de contenido mediante el
                almacenamiento local del navegador. El pedido permanece en memoria mientras la
                página está abierta.
              </p>
              <p className="subtle" style={{ marginTop: '15px' }}>
                No se han integrado herramientas de publicidad o analítica en esta tienda. Al abrir
                WhatsApp u otro enlace externo se aplican también las políticas de ese servicio.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
Footer.displayName = 'Footer';
