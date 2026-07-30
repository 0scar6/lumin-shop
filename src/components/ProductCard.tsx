import React from 'react';
import { Heart, Plus, Clock, Flame } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  index?: number;
  isFavorite: boolean;
  onToggleFavorite: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  themeMode?: 'dark' | 'light' | 'amoled';
}

export const ProductCard: React.FC<ProductCardProps> = ({
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
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between animate-fade-in-up border ${
        isLight
          ? 'bg-white border-slate-300 text-slate-900 shadow-sm hover:border-lime-600'
          : 'glass-card border-white/10 hover:border-[#D2E8A3]/40'
      }`}
    >
      
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#10120E]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-20 ${
            isFavorite
              ? 'bg-[#D2E8A3] text-[#0A0A0A]'
              : 'bg-black/60 text-white hover:bg-black/80'
          }`}
          aria-label="Guardar en favoritos"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#0A0A0A]' : ''}`} />
        </button>

        {/* Top Badges (Tag & Discount) */}
        <div className="absolute top-3 left-3 right-12 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
          {product.tag && (
            <div className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-[#D2E8A3] uppercase tracking-wider">
              {product.tag}
            </div>
          )}

          {/* Discount Percentage Red Badge */}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-0.5 animate-pulse">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </div>
          )}
        </div>

        {/* Technique Badge overlay at bottom of image */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-medium text-gray-200 border border-white/10">
            {product.technique}
          </span>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          {/* Category Micro label */}
          <div className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono mb-1 ${
            isLight ? 'text-lime-700 font-bold' : 'text-[#D2E8A3]'
          }`}>
            <Flame className="w-3 h-3" />
            <span className="uppercase tracking-wider">
              {product.category === 'streetwear' ? 'Polo Sublimado' : product.category === 'cups' ? 'Vaso/Taza' : 'Placa de Aluminio'}
            </span>
          </div>

          <h3
            onClick={() => onSelectProduct(product)}
            className={`font-extrabold text-xs sm:text-base cursor-pointer line-clamp-1 transition-colors ${
              isLight ? 'text-slate-900 hover:text-lime-700' : 'text-white hover:text-[#D2E8A3]'
            }`}
          >
            {product.name}
          </h3>

          <p className={`text-[11px] sm:text-xs line-clamp-2 mt-0.5 leading-snug ${
            isLight ? 'text-slate-700 font-medium' : 'text-gray-300'
          }`}>
            {product.description}
          </p>
        </div>

        {/* Production Time Badge */}
        <div className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold ${
          isLight ? 'text-slate-700 font-medium' : 'text-gray-300'
        }`}>
          <Clock className={`w-3 h-3 flex-shrink-0 ${isLight ? 'text-lime-700' : 'text-[#D2E8A3]'}`} />
          <span>{product.productionTime}</span>
        </div>

        {/* Price & Action Button */}
        <div className={`pt-2 border-t flex items-center justify-between gap-1.5 mt-auto ${
          isLight ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div className="flex flex-col">
            <span className={`text-[9px] sm:text-[10px] uppercase font-mono font-bold ${
              isLight ? 'text-slate-600' : 'text-gray-400'
            }`}>
              S/ Soles
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-sm sm:text-lg font-black whitespace-nowrap ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                S/ {product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className={`text-[10px] sm:text-xs line-through hidden sm:inline ${
                  isLight ? 'text-slate-500 font-semibold' : 'text-gray-400'
                }`}>
                  S/ {product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onSelectProduct(product)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#D2E8A3] hover:bg-[#b8d682] text-[#0A0A0A] font-extrabold text-[11px] sm:text-xs transition-all shadow-md active:scale-95 whitespace-nowrap"
            aria-label="Configurar Pedido"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Pedir</span>
          </button>
        </div>

      </div>

    </div>
  );
};
