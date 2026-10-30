import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { cfg } from '../lib/config';
import { ThemeMode } from '../types';

interface TermsAndPrivacyProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: ThemeMode;
  initialTab?: 'privacy' | 'terms';
}

export const TermsAndPrivacy: React.FC<TermsAndPrivacyProps> = ({
  isOpen,
  onClose,
  themeMode = 'dark',
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = React.useState<'privacy' | 'terms'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const isLight = themeMode === 'light';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal animate-fade-in-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="modal-head">
          <h2>{activeTab === 'privacy' ? 'Política de Privacidad' : 'Términos y Condiciones'}</h2>
          <button type="button" className="close" onClick={onClose} aria-label="Cerrar">
            <X />
          </button>
        </div>

        {/* Selector de documento */}
        <div className="chips" style={{ padding: '15px 25px 0' }}>
          <button
            type="button"
            className={`chip ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
            aria-pressed={activeTab === 'privacy'}
          >
            Privacidad
          </button>
          <button
            type="button"
            className={`chip ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
            aria-pressed={activeTab === 'terms'}
          >
            Términos
          </button>
        </div>

        {/* Content */}
        <div className="modal-body" style={{ fontSize: 13, lineHeight: 1.65 }}>
          <div style={{ display: 'grid', gap: 18 }}>
          {activeTab === 'privacy' ? (
            <>
              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  1. Responsable del Tratamiento
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  <strong>LUMIN SHOP</strong>, representada por Oscar Daniel, con número de celular {cfg('brand_phone', '993 365 099')},
                  con domicilio en Ayacucho, Huamanga, Perú, es responsable del tratamiento de los datos personales
                  recopilados a través de este sitio web.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  2. Datos Personales Recopilados
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Para procesar tus pedidos y brindarte un servicio personalizado, recopilamos los siguientes datos:
                </p>
                <ul className={`list-disc pl-5 space-y-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                  <li><strong>Nombre completo</strong> — Para identificación del pedido y personalización.</li>
                  <li><strong>Número de celular / WhatsApp</strong> — Para comunicación sobre el estado del pedido.</li>
                  <li><strong>Dirección de entrega</strong> — Para despacho a domicilio.</li>
                  <li><strong>DNI / RUC</strong> — Únicamente si solicitas boleta o factura, o para verificación de envíos.</li>
                  <li><strong>Correo electrónico</strong> — Para comunicación alternativa (opcional).</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  3. Finalidad del Tratamiento
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Los datos personales son utilizados exclusivamente para:
                </p>
                <ul className={`list-disc pl-5 space-y-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                  <li>Procesar y despachar tus pedidos de productos sublimados.</li>
                  <li>Comunicarnos contigo sobre el estado de tu orden.</li>
                  <li>Personalizar tu experiencia de compra.</li>
                  <li>Cumplir obligaciones legales en materia de comprobantes de pago.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  4. Almacenamiento y Seguridad
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Tus datos se almacenan en servidores seguros de Supabase (AWS cloud) con cifrado en tránsito (TLS/SSL).
                  Se implementan políticas de seguridad y acceso restringido. No compartimos, vendemos ni cedemos tus datos
                  personales a terceros, salvo obligación legal.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  5. Tus Derechos
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  De acuerdo con la <strong>Ley N° 29733 — Ley de Protección de Datos Personales del Perú</strong>,
                  tienes derecho a:
                </p>
                <ul className={`list-disc pl-5 space-y-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                  <li><strong>Acceso:</strong> Solicitar qué datos tuyos almacenamos.</li>
                  <li><strong>Rectificación:</strong> Solicitar corrección de datos inexactos.</li>
                  <li><strong>Eliminación:</strong> Solicitar la eliminación de tus datos personales.</li>
                  <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos para finalidades no esenciales.</li>
                </ul>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Para ejercer estos derechos, contáctanos al <strong>{cfg('brand_phone', '993 365 099')}</strong> por WhatsApp o correo electrónico.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  6. Cookies y Tecnologías de Rastreo
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Este sitio utiliza <strong>localStorage</strong> del navegador para guardar tu carrito, favoritos y preferencias
                  de tema de forma local en tu dispositivo. Estos datos no se envían a servidores externos y se almacenan
                  únicamente en tu navegador. Puedes eliminarlos en cualquier momento desde la configuración de tu navegador.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  7. Cambios en esta Política
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Nos reservamos el derecho de actualizar esta Política de Privacidad. Cualquier cambio será publicado
                  en esta misma página. Te recomendamos revisarla periódicamente.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  8. Contacto
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Si tienes dudas sobre esta política o sobre el tratamiento de tus datos, escríbenos al <strong>{cfg('brand_phone', '993 365 099')}</strong> por
                  WhatsApp o al correo registrado en nuestra página de Instagram: <strong>@.lumin.shop</strong>
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  1. Aceptación de los Términos
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Al acceder y utilizar el sitio web de <strong>LUMIN SHOP</strong> (lumin-shop-nine.vercel.app), 
                  el usuario acepta íntegramente los presentes Términos y Condiciones. Si no está de acuerdo, 
                  debe abstenerse de usar el sitio.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  2. Naturaleza del Negocio
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  LUMIN SHOP es una marca independiente de <strong>sublimación y streetwear</strong> con base en Ayacucho, Perú.
                  Todos los productos son elaborados <strong>bajo pedido</strong> (no hay stock disponible). 
                  Los tiempos de producción son de 24 a 48 horas hábiles antes del despacho.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  3. Proceso de Compra
                </h3>
                <ul className={`list-disc pl-5 space-y-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                  <li>El cliente selecciona sus productos y personalizaciones en el catálogo.</li>
                  <li>Se genera un resumen del pedido que se envía vía WhatsApp.</li>
                  <li>El pago se realiza por <strong>Yape, Plin o transferencia bancaria</strong> antes de iniciar la producción.</li>
                  <li>Una vez confirmado el pago, se inicia la producción (24-48 hrs hábiles).</li>
                  <li>Se despacha el producto vía courier y se proporciona código de rastreo cuando aplique.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  4. Precios y Pagos
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Todos los precios están expresados en <strong>Soles peruanos (S/)</strong>. LUMIN SHOP se reserva el derecho
                  de modificar precios sin previo aviso. El pago debe completarse antes de iniciar la producción.
                  No se aceptan devoluciones de dinero una vez iniciada la confección del producto personalizado.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  5. Envíos
                </h3>
                <ul className={`list-disc pl-5 space-y-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                  <li><strong>Huamanga (Ayacucho):</strong> Envío GRATIS.</li>
                  <li><strong>Lima Metropolitana:</strong> S/ 15.</li>
                  <li><strong>Provincia:</strong> S/ 25.</li>
                  <li><strong>Internacional:</strong> S/ 80.</li>
                  <li><strong>Recojo en tienda:</strong> GRATIS.</li>
                </ul>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Los tiempos de entrega dependen del couriers (Olva, Shalom, Express). LUMIN SHOP no se hace responsable
                  por demoras imputables al servicio de mensajería, pero brindará asistencia en la gestión del seguimiento.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  6. Garantía y Devoluciones
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Ofrecemos <strong>garantía de satisfacción</strong>: si el producto presenta fallas de fábrica o problemas
                  en la sublimación (despintado, defectos de impresión), se ofrece reemplazo o reembolso.
                  Dado que los productos son personalizados bajo pedido, <strong>no se aceptan devoluciones</strong> por
                  cambio de opinión, error en el texto ingresado por el cliente, o diferencias menores de color por
                  calibración de pantalla.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  7. Propiedad Intelectual
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Todo el contenido del sitio (diseños, logotipos, imágenes, textos) es propiedad de LUMIN SHOP o sus
                  proveedores de imágenes con licencia. Queda prohibida su reproducción total o parcial sin autorización escrita.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  8. Limitación de Responsabilidad
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  LUMIN SHOP no será responsable por daños indirectos, pérdidas de beneficios, o perjuicios derivados del
                  uso o imposibilidad de uso del sitio web, incluyendo pero no limitado a errores en los pedidos,
                  interrupciones del servicio, o viruses en el contenido.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  9. Ley Aplicable y Jurisdicción
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia será sometida a
                  los tribunales competentes de la ciudad de Ayacucho, Huamanga.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className={`font-bold text-sm uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  10. Contacto
                </h3>
                <p className={isLight ? 'text-slate-700' : 'text-gray-300'}>
                  Para consultas sobre estos Términos y Condiciones, contáctanos al <strong>{cfg('brand_phone', '993 365 099')}</strong> por WhatsApp.
                </p>
              </section>
            </>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="modalfoot" style={{ justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="btn small">
            <ArrowLeft />
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
