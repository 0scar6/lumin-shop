import React from 'react';
import { Heart, Plus } from 'lucide-react';
import { CategoryKind, Product } from '../types';
import { cfg } from '../lib/config';

interface ProductCardProps {
  product: Product;
  index?: number;
  isFavorite: boolean;
  onToggleFavorite: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  themeMode?: 'dark' | 'light' | 'amoled';
  categoryLabel?: string;
  categoryKind?: CategoryKind;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  index = 0,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
  categoryLabel,
  categoryKind,
}) => {
  const fallbackName =
    categoryKind === 'ropa' || product.category === 'streetwear'
      ? cfg('pc_category_polo', 'Polo')
      : categoryKind === 'vaso' || product.category === 'cups'
      ? cfg('pc_category_cup', 'Vaso/Taza')
      : categoryKind === 'placa'
      ? cfg('pc_category_plaque', 'Placa')
      : cfg('pc_category_polo', 'Producto');
  const categoryName = categoryLabel || fallbackName;

  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
  const badgeLabel = product.agotado
    ? cfg('sold_out_label', 'Agotado')
    : product.tag || product.technique || '';

  return (
    <article
      className="product animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
    >
      <div className="picture">
        <button
          type="button"
          className="picopen"
          onClick={() => onSelectProduct(product)}
          aria-label={`Ver ${product.name}`}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={
              product.agotado
                ? 'opacity-40 grayscale-[60%] brightness-75'
                : undefined
            }
          />
        </button>

        {badgeLabel && (
          <span className={`tag ${product.agotado ? 'sold' : ''}`}>{badgeLabel}</span>
        )}

        <button
          type="button"
          className={`favorite ${isFavorite ? 'selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          aria-pressed={isFavorite}
          aria-label={`${isFavorite ? 'Quitar de' : 'Guardar en'} favoritos: ${product.name}`}
        >
          <Heart />
        </button>
      </div>

      <p className="cat">{categoryName}</p>

      <h3
        className="cursor-pointer transition-colors hover:text-[var(--accent-text,var(--accent))]"
        onClick={() => onSelectProduct(product)}
      >
        {product.name}
      </h3>

      <p className="meta">
        {product.productionTime}
        {product.technique ? ` · ${product.technique}` : ''}
      </p>

      <div className="pricerow">
        <span className="price">
          S/ {product.price.toFixed(2)}
          {hasDiscount && <del>S/ {product.originalPrice!.toFixed(2)}</del>}
        </span>

        <button
          type="button"
          className="btn"
          onClick={() => onSelectProduct(product)}
          disabled={product.agotado}
          aria-label={product.agotado ? cfg('sold_out_label', 'Agotado') : cfg('pc_order_label', 'Configurar Pedido')}
        >
          {product.agotado ? cfg('sold_out_label', 'Agotado') : cfg('pc_order_btn', 'Pedir')}
          {!product.agotado && <Plus />}
        </button>
      </div>
    </article>
  );
});
ProductCard.displayName = 'ProductCard';
