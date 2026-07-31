import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Clock, Tag, Plus, Minus, ShoppingBag, Shirt, Coffee } from 'lucide-react';
import { Product, CartItem, ThemeMode } from '../types';
import { cfg } from '../lib/config';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
  themeMode?: ThemeMode;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';
  const isApparel = product?.category === 'streetwear';

  // Apparel State
  const firstSize = product?.apparelOptions?.sizes[0];
  const defaultSize = firstSize ? (typeof firstSize === 'string' ? firstSize : firstSize.name) : 'M';
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [selectedFit, setSelectedFit] = useState<string>(
    product?.apparelOptions?.fits[0] || 'Oversized Streetwear'
  );
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(
    product?.apparelOptions?.colors[0] || { name: 'Negro Carbón', hex: '#0A0A0A' }
  );

  // Cup State
  const [selectedCupTypeObj, setSelectedCupTypeObj] = useState<{ name: string; extraPrice: number }>(
    product?.cupOptions?.types[0] || { name: 'Vaso Frosted Glass 16oz', extraPrice: 0 }
  );
  const [selectedFinish, setSelectedFinish] = useState<string>(
    product?.cupOptions?.finishes[0] || 'Acabado Esmerilado Frosted'
  );

  // General Customization State
  const [customText, setCustomText] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>(product?.image || '');

  useEffect(() => {
    if (!product) return;
    setActiveImage(product.image);
    if (product.apparelOptions) {
      const sizeAt1 = product.apparelOptions.sizes[1];
      setSelectedSize(sizeAt1 ? (typeof sizeAt1 === 'string' ? sizeAt1 : sizeAt1.name) : 'M');
      setSelectedFit(product.apparelOptions.fits[0] || 'Oversized Streetwear');
      setSelectedColor(product.apparelOptions.colors[0] || { name: 'Negro Carbón', hex: '#0A0A0A' });
    }
    if (product.cupOptions) {
      setSelectedCupTypeObj(product.cupOptions.types[0] || { name: 'Vaso Frosted Glass 16oz', extraPrice: 0 });
      setSelectedFinish(product.cupOptions.finishes[0] || 'Acabado Esmerilado Frosted');
    }
    setCustomText('');
    setQuantity(1);
  }, [product]);

  if (!product) return null;

  // Calculate Total Unit Price
  const basePrice = product.price;
  const extraPrice = !isApparel && selectedCupTypeObj ? selectedCupTypeObj.extraPrice : 0;
  const unitPrice = basePrice + extraPrice;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    const newItem: CartItem = {
      cartItemId: `${product.id}-${Date.now()}`,
      product,
      selectedSize: isApparel ? selectedSize : undefined,
      selectedFit: isApparel ? selectedFit : undefined,
      selectedColor: isApparel ? selectedColor : undefined,
      selectedCupType: !isApparel ? selectedCupTypeObj.name : undefined,
      selectedFinish: !isApparel ? selectedFinish : undefined,
      customText: customText.trim() ? customText.trim() : undefined,
      quantity,
    };

    onAddToCart(newItem);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-3xl rounded-2xl sm:rounded-3xl border overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] ${
          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#11130F] border-white/10 text-white'
        }`}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 z-30 p-2.5 rounded-full border transition-colors shadow-lg ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
              : 'bg-black/70 hover:bg-black text-white border-white/10'
          }`}
          aria-label={cfg('pm_close_label', 'Cerrar modal')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Left Column: Image & Gallery Preview */}
          <div className={`md:col-span-5 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0A] border-white/10'
          }`}>
            <div className="space-y-3 sm:space-y-4">
              <div className={`relative aspect-[4/3] md:aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden border ${
                isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#161814] border-white/10'
              }`}>
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-[#D2E8A3]">
                  {product.technique}
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {product.galleryImages && product.galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImage === imgUrl
                          ? 'border-[#D2E8A3] scale-105 shadow-sm'
                          : isLight ? 'border-slate-300 opacity-70 hover:opacity-100' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`${cfg('pm_view_prefix', 'Vista')} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Production guarantee notes */}
            <div className={`mt-4 pt-3 border-t space-y-1.5 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <div className={`flex items-center gap-2 text-[11px] sm:text-xs ${isLight ? 'text-slate-700 font-medium' : 'text-gray-300'}`}>
                <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${isLight ? 'text-lime-700' : 'text-[#D2E8A3]'}`} />
                <span>{cfg('pm_production_time', 'Tiempo de confección: ')}<strong>24 a 48 hrs</strong></span>
              </div>
              <div className={`flex items-center gap-2 text-[11px] sm:text-xs ${isLight ? 'text-slate-700 font-medium' : 'text-gray-300'}`}>
                <ShieldCheck className={`w-3.5 h-3.5 flex-shrink-0 ${isLight ? 'text-lime-700' : 'text-[#D2E8A3]'}`} />
                <span>{cfg('pm_quality_guarantee', 'Calidad Garantizada LUMIN 100%')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Form */}
          <div className="md:col-span-7 p-4 sm:p-6 flex flex-col justify-between space-y-4 sm:space-y-6">
            
            <div className="space-y-4">
              <div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono mb-1.5 font-bold ${
                  isLight
                    ? 'bg-lime-100 border-lime-300 text-lime-900'
                    : 'bg-[#D2E8A3]/10 border-[#D2E8A3]/20 text-[#D2E8A3]'
                }`}>
                  {isApparel ? <Shirt className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
                  <span className="uppercase">{isApparel ? cfg('pm_category_polo', 'Polo Sublimado Bajo Pedido') : cfg('pm_category_cup', 'Vaso / Taza Sublimada')}</span>
                </div>
                <h2 className={`font-display text-xl sm:text-2xl font-extrabold leading-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {product.name}
                </h2>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-700 font-medium' : 'text-gray-400'}`}>
                  {product.description}
                </p>
              </div>

              {/* OPTION 1: APPAREL CUSTOMIZER (Size, Fit, Color) */}
              {isApparel && product.apparelOptions && (
                <div className="space-y-3 pt-1">
                  
                  {/* Selector de Talla */}
                  <div>
                    <label className={`block text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${
                      isLight ? 'text-slate-800' : 'text-gray-300'
                    }`}>
                      {cfg('pm_size_label', '1. Selecciona tu Talla:')}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {product.apparelOptions.sizes.map((size) => {
                        const sizeName = typeof size === 'string' ? size : size.name;
                        const sizeExtra = typeof size === 'string' ? 0 : size.extraPrice;
                        return (
                          <button
                            key={sizeName}
                            onClick={() => setSelectedSize(sizeName)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                              selectedSize === sizeName
                                ? 'bg-[#D2E8A3] text-[#0A0A0A] border-[#D2E8A3] shadow-md'
                                : isLight
                                ? 'bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
                                : 'bg-[#161814] text-gray-300 border-white/10 hover:border-white/30'
                            }`}
                          >
                            {sizeName}{sizeExtra > 0 ? ` +S/ ${sizeExtra}` : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selector de Corte / Fit */}
                  <div>
                    <label className={`block text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${
                      isLight ? 'text-slate-800' : 'text-gray-300'
                    }`}>
                      {cfg('pm_fit_label', '2. Tipo de Corte / Fit:')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {product.apparelOptions.fits.map((fit) => (
                        <button
                          key={fit}
                          onClick={() => setSelectedFit(fit)}
                          className={`p-2 rounded-xl text-xs font-bold text-left border flex items-center justify-between transition-all ${
                            selectedFit === fit
                              ? isLight
                                ? 'bg-slate-900 text-[#D2E8A3] border-slate-900'
                                : 'bg-[#1D2218] text-[#D2E8A3] border-[#D2E8A3]'
                              : isLight
                              ? 'bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
                              : 'bg-[#161814] text-gray-300 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <span>{fit}</span>
                          {selectedFit === fit && <Check className="w-3.5 h-3.5 text-[#D2E8A3]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color de Prenda */}
                  <div>
                    <label className={`block text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${
                      isLight ? 'text-slate-800' : 'text-gray-300'
                    }`}>
                      {cfg('pm_color_label', '3. Color de Tela: ')}<span className={isLight ? 'text-lime-800 font-extrabold' : 'text-[#D2E8A3] font-mono'}>{selectedColor.name}</span>
                    </label>
                    <div className="flex items-center gap-2.5">
                      {product.apparelOptions.colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c)}
                          style={{ backgroundColor: c.hex }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all relative ${
                            selectedColor.name === c.name
                              ? 'border-[#D2E8A3] scale-110 shadow-lg'
                              : isLight ? 'border-slate-400 hover:scale-105' : 'border-white/20 hover:scale-105'
                          }`}
                          title={c.name}
                        >
                          {selectedColor.name === c.name && (
                            <span className="absolute inset-0 flex items-center justify-center text-white text-[10px]">
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* OPTION 2: CUP / SUBLIMATED CUSTOMIZER */}
              {!isApparel && product.cupOptions && (
                <div className="space-y-3 pt-1">
                  
                  {/* Selector de Tipo de Vaso */}
                  <div>
                    <label className={`block text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${
                      isLight ? 'text-slate-800' : 'text-gray-300'
                    }`}>
                      {cfg('pm_cup_type_label', '1. Tipo de Vaso / Taza:')}
                    </label>
                    <div className="space-y-1.5">
                      {product.cupOptions.types.map((typeObj) => (
                        <button
                          key={typeObj.name}
                          onClick={() => setSelectedCupTypeObj(typeObj)}
                          className={`w-full p-2.5 rounded-xl text-xs font-bold text-left border flex items-center justify-between transition-all ${
                            selectedCupTypeObj.name === typeObj.name
                              ? isLight
                                ? 'bg-slate-900 text-[#D2E8A3] border-slate-900'
                                : 'bg-[#1D2218] text-[#D2E8A3] border-[#D2E8A3]'
                              : isLight
                              ? 'bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
                              : 'bg-[#161814] text-gray-300 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <span>{typeObj.name}</span>
                          <span className={`font-bold ${isLight && selectedCupTypeObj.name !== typeObj.name ? 'text-lime-800' : 'text-[#D2E8A3]'}`}>
                            {typeObj.extraPrice > 0 ? `+S/ ${typeObj.extraPrice}` : typeObj.extraPrice < 0 ? `-S/ ${Math.abs(typeObj.extraPrice)}` : cfg('pm_included', 'Incluido')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Acabado */}
                  <div>
                    <label className={`block text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${
                      isLight ? 'text-slate-800' : 'text-gray-300'
                    }`}>
                      {cfg('pm_finish_label', '2. Acabado de la Superficie:')}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {product.cupOptions.finishes.map((finish) => (
                        <button
                          key={finish}
                          onClick={() => setSelectedFinish(finish)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            selectedFinish === finish
                              ? 'bg-[#D2E8A3] text-[#0A0A0A] border-[#D2E8A3]'
                              : isLight
                              ? 'bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
                              : 'bg-[#161814] text-gray-300 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {finish}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Custom Name or Text Personalization */}
              <div className="pt-1">
                <label className={`block text-[11px] font-extrabold uppercase tracking-wider mb-1 flex items-center justify-between ${
                  isLight ? 'text-slate-800' : 'text-gray-300'
                }`}>
                  <span>{cfg('pm_custom_text_label', 'Añadir Texto o Apodo Personalizado:')}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{cfg('pm_free', 'Gratis')}</span>
                    <span className={`text-[10px] font-mono font-bold ${
                      customText.length >= 30 ? 'text-red-500' : isLight ? 'text-lime-800' : 'text-[#D2E8A3]'
                    }`}>
                      {customText.length}/30 {cfg('pm_characters', 'caracteres')}
                    </span>
                  </div>
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={isApparel ? cfg('pm_placeholder_apparel', 'Ej. Nombre en manga / "LUMIN 04"') : cfg('pm_placeholder_cup', 'Ej. "Carlos" o Frase corta')}
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-slate-800'
                      : 'bg-[#161814] border-white/10 text-white placeholder-gray-500 focus:border-[#D2E8A3]'
                  }`}
                />
              </div>

            </div>

          </div>

        </div>

        {/* Sticky Bottom Actions & Total Price */}
        <div className={`p-3.5 sm:px-6 sm:py-4 border-t z-10 flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#0E100C] border-white/10'
        }`}>
          
          {/* Quantity selector & calculated price */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div className={`flex items-center gap-1.5 border rounded-xl p-1 ${
              isLight ? 'bg-white border-slate-300' : 'bg-[#161814] border-white/10'
            }`}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight ? 'hover:bg-slate-200 text-slate-800' : 'hover:bg-white/10 text-gray-300'
                }`}
                aria-label={cfg('pm_decrease', 'Disminuir cantidad')}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className={`w-7 text-center text-xs sm:text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight ? 'hover:bg-slate-200 text-slate-800' : 'hover:bg-white/10 text-gray-300'
                }`}
                aria-label={cfg('pm_increase', 'Aumentar cantidad')}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-right">
              <span className={`text-[9px] sm:text-[10px] font-mono block ${isLight ? 'text-slate-600 font-bold' : 'text-gray-400'}`}>{cfg('pm_total_label', 'TOTAL ESTIMADO')}</span>
              <span className={`text-lg sm:text-xl font-black ${isLight ? 'text-slate-900' : 'text-[#D2E8A3]'}`}>
                S/ {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAdd}
            className="w-full sm:w-auto sm:px-8 py-3 sm:py-3.5 rounded-xl bg-[#D2E8A3] hover:bg-[#b8d682] text-[#0A0A0A] font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#D2E8A3]/15 active:scale-98"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{cfg('pm_add_to_cart', 'AÑADIR A MI PEDIDO')}</span>
          </button>

        </div>

      </div>
    </div>
  );
};
