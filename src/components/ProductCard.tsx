import React from 'react';
import { Heart, Plus, Clock, Flame } from 'lucide-react';
import { Product } from '../types';
import { cfg } from '../lib/config';

interface ProductCardProps {
  product: Product;
  index?: number;
  isFavorite: boolean;
  onToggleFavorite: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  themeMode?: 'dark' | 'light' | 'amoled';
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  index = 0,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';

  return (
    <div
      style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
      className={`group relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 flex flex-col animate-fade-in-up border ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm hover:border-lime-500'
          : 'glass-card border-white/10 hover:border-[#D2E8A3]/40'
      }`}
    >
      
      {/* Image Container — shorter on mobile */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-[#10120E] cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover object-center transition-transform duration-500 ${
            product.agotado
              ? 'opacity-40 grayscale-[60%] brightness-75'
              : 'group-hover:scale-105'
          }`}
          loading="lazy"
        />

        {/* Sold Out Overlay */}
        {product.agotado && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
            <div className="relative z-20 flex flex-col items-center gap-1">
              <span className="text-orange-400 font-black text-sm sm:text-base uppercase tracking-[0.2em] drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]">
                Agotado
              </span>
            </div>
          </div>
        )}

        {/* Favorite Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all z-20 ${
            isFavorite
              ? 'bg-[#D2E8A3] text-[#0A0A0A]'
              : 'bg-black/50 text-white/80 hover:bg-black/70'
          }`}
          aria-label={cfg('pc_save_fav', 'Guardar en favoritos')}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-[#0A0A0A]' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 right-10 flex flex-wrap items-center gap-1 z-10 pointer-events-none">
          {product.agotado && (
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-orange-600 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-lg">
              Agotado
            </div>
          )}
          {product.tag && (
            <div className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded bg-black/70 backdrop-blur-md text-[8px] sm:text-[10px] font-bold text-[#D2E8A3] uppercase tracking-wider">
              {product.tag}
            </div>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-lg">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </div>
          )}
        </div>

        {/* Technique badge */}
        <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2">
          <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded bg-black/70 backdrop-blur-md text-[8px] sm:text-[10px] font-medium text-gray-200 border border-white/10">
            {product.technique}
          </span>
        </div>
      </div>

      {/* Info Body — tighter on mobile */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-1.5 sm:gap-2">
        <div>
          {/* Category */}
          <div className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-mono mb-0.5 ${
            isLight ? 'text-lime-700 font-bold' : 'text-[#D2E8A3]'
          }`}>
            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="uppercase tracking-wider">
              {product.category === 'streetwear' ? cfg('pc_category_polo', 'Polo') : product.category === 'cups' ? cfg('pc_category_cup', 'Vaso/Taza') : cfg('pc_category_plaque', 'Placa')}
            </span>
          </div>

          {/* Name */}
          <h3
            onClick={() => onSelectProduct(product)}
            className={`font-extrabold text-[11px] sm:text-sm leading-tight cursor-pointer line-clamp-1 transition-colors ${
              isLight ? 'text-slate-900 hover:text-lime-700' : 'text-white hover:text-[#D2E8A3]'
            }`}
          >
            {product.name}
          </h3>

          {/* Description — hidden on very small screens */}
          <p className={`text-[10px] sm:text-[11px] line-clamp-1 mt-0.5 hidden sm:block ${
            isLight ? 'text-slate-600' : 'text-gray-400'
          }`}>
            {product.description}
          </p>
        </div>

        {/* Production time */}
        <div className={`flex items-center gap-1 text-[8px] sm:text-[10px] ${
          isLight ? 'text-slate-600' : 'text-gray-500'
        }`}>
          <Clock className={`w-2.5 h-2.5 flex-shrink-0 ${isLight ? 'text-lime-700' : 'text-[#D2E8A3]'}`} />
          <span>{product.productionTime}</span>
        </div>

        {/* Price + Button */}
        <div className={`pt-1.5 sm:pt-2 border-t flex items-center justify-between ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div className="flex flex-col">
            <span className={`text-[8px] sm:text-[9px] font-mono font-bold ${
              isLight ? 'text-slate-500' : 'text-gray-500'
            }`}>
              S/
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-sm sm:text-base font-black whitespace-nowrap ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className={`text-[9px] sm:text-[10px] line-through hidden sm:inline ${
                  isLight ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onSelectProduct(product)}
            disabled={product.agotado}
            className={`flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-extrabold text-[10px] sm:text-[11px] transition-all shadow-md active:scale-95 ${
              product.agotado
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 cursor-not-allowed shadow-none'
                : 'bg-[#D2E8A3] hover:bg-[#b8d682] text-[#0A0A0A]'
            }`}
            aria-label={product.agotado ? 'Agotado' : cfg('pc_order_label', 'Configurar Pedido')}
          >
            {product.agotado ? (
              <span>Agotado</span>
            ) : (
              <>
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                <span>{cfg('pc_order_btn', 'Pedir')}</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
});
ProductCard.displayName = 'ProductCard';
