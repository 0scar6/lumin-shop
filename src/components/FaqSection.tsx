import React from 'react';
import { cfg } from '../lib/config';

interface FaqSectionProps {
  themeMode?: 'dark' | 'light' | 'amoled';
}

/**
 * Preguntas frecuentes — columna derecha de `.aboutfaq` (igual que la maqueta:
 * <details>/<summary> con el título "Antes de pedir").
 */
export const FaqSection: React.FC<FaqSectionProps> = React.memo(() => {
  const items = [
    {
      q: cfg('faq_1_question', '¿Cuánto tarda mi pedido?'),
      a: cfg(
        'faq_1_answer',
        'La producción anunciada es de 24 a 48 horas desde la confirmación. Coordina la disponibilidad del diseño y el tiempo de envío por WhatsApp.',
      ),
    },
    {
      q: cfg('faq_2_question', '¿Puedo enviar mi propio diseño?'),
      a: cfg(
        'faq_2_answer',
        'Sí. Envíanos tu idea, foto o nombre por WhatsApp para coordinar el diseño antes de producirlo.',
      ),
    },
    {
      q: cfg('faq_3_question', '¿Cómo pago y recibo mi pedido?'),
      a: cfg(
        'faq_3_answer',
        'Coordinamos el pago por Yape y el envío contigo. Confirma el costo de entrega y el total antes de pagar.',
      ),
    },
  ];

  return (
    <div>
      <h2>{cfg('faq_heading', 'Antes de pedir')}</h2>
      {items.map((item, idx) => (
        <details key={idx}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
});
FaqSection.displayName = 'FaqSection';
