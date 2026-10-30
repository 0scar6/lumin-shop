import React from 'react';
import { Clock, ShieldCheck, Truck } from 'lucide-react';
import { cfg } from '../lib/config';

interface ProductionBadgeBarProps {
  themeMode?: 'dark' | 'light' | 'amoled';
}

/**
 * Barra de confianza `.trust` (3 ítems) que va justo debajo del hero,
 * igual que en LUMIN-propuesta.html.
 */
export const ProductionBadgeBar: React.FC<ProductionBadgeBarProps> = React.memo(() => {
  const items = [
    { icon: Clock, text: cfg('hero_badge_1', 'Producción en 24–48 h') },
    { icon: ShieldCheck, text: cfg('hero_badge_2', 'Calidad y color') },
    { icon: Truck, text: cfg('shipping_badge', 'Envíos a todo el Perú') },
  ];

  return (
    <div className="trust">
      {items.map(({ icon: Icon, text }, idx) => (
        <div className="trust-item" key={idx}>
          <Icon />
          {text}
        </div>
      ))}
    </div>
  );
});
ProductionBadgeBar.displayName = 'ProductionBadgeBar';
