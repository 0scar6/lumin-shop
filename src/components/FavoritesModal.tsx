import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Product[];
  onRemoveFavorite: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 pb-20 sm:pb-24 bg-black/60 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg glass-card rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-[#11130F] flex flex-col max-h-[75vh] my-auto"
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2 sm:hidden"></div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#D2E8A3] fill-[#D2E8A3]" />
            <h2 className="font-display text-base sm:text-lg font-black uppercase text-white">
              Mis Favoritos ({favorites.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar favoritos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {favorites.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-3">
              <Heart className="w-12 h-12 mx-auto text-gray-700" />
              <p className="text-sm">No tienes productos guardados en tus favoritos.</p>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-[#D2E8A3] text-[#0A0A0A] font-bold text-xs"
              >
                EXPLORAR PRODUCTOS
              </button>
            </div>
          ) : (
            favorites.map((product) => (
              <div
                key={product.id}
                className="p-3.5 rounded-2xl bg-[#161814] border border-white/10 flex items-center justify-between gap-3 group"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-white/10 flex-shrink-0"
                />

                <div className="flex-1">
                  <h4 className="font-bold text-xs text-white line-clamp-1">
                    {product.name}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {product.technique}
                  </span>
                  <div className="text-sm font-black text-[#D2E8A3] mt-0.5">
                    S/ {product.price.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-bold text-xs hover:bg-[#b8d682] transition-colors shadow-md"
                    title="Configurar Pedido"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onRemoveFavorite(product)}
                    className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-red-400 border border-white/10 transition-colors"
                    title="Quitar de Favoritos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer dismissal */}
        <div className="p-3 border-t border-white/10 bg-[#0A0A0A] flex items-center justify-between text-[11px] text-gray-500">
          <span>{favorites.length} ítems guardados</span>
          <button
            onClick={onClose}
            className="hover:text-gray-300 font-semibold"
          >
            Tocar afuera para cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

