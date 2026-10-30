import React, { useState, useEffect } from 'react';
import { X, Clock, ShieldCheck, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product, CartItem, ThemeMode, CategoryKind } from '../types';
import { cfg } from '../lib/config';

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

const MediaDisplay: React.FC<{ src: string; alt: string; className?: string }> = ({
  src,
  alt,
  className,
}) => {
  const [videoFailed, setVideoFailed] = useState(false);
  if (isVideoUrl(src) && !videoFailed) {
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        onError={() => setVideoFailed(true)}
        className={className}
        style={{ backgroundColor: '#000' }}
      />
    );
  }
  return <img src={src} alt={alt} className={className} />;
};

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
  themeMode?: ThemeMode;
  categoryLabel?: string;
  categoryKind?: CategoryKind;
}

/**
 * Detalle y personalización del producto con la estructura de la maqueta:
 * `.modal` > `.modal-head` + `.productdetail` + `.modalfoot`.
 */
export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  categoryLabel,
  categoryKind,
}) => {
  const kind = categoryKind || (product?.category === 'streetwear' ? 'ropa' : product?.category === 'cups' ? 'vaso' : 'otro');
  const isApparel = kind === 'ropa';

  // Push history state when modal opens so back button closes it
  useEffect(() => {
    if (!product) return;
    window.history.pushState({ modal: 'product' }, '');
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [product, onClose]);

  // Apparel State
  const firstSize = product?.apparelOptions?.sizes[0];
  const defaultSize = firstSize
    ? typeof firstSize === 'string'
      ? firstSize
      : firstSize.name
    : 'M';
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [selectedFit, setSelectedFit] = useState<string>(
    product?.apparelOptions?.fits[0] || 'Oversized Streetwear',
  );
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(
    product?.apparelOptions?.colors[0] || { name: 'Negro Carbón', hex: '#0A0A0A' },
  );

  // Cup State
  const [selectedCupTypeObj, setSelectedCupTypeObj] = useState<{
    name: string;
    extraPrice: number;
  }>(product?.cupOptions?.types[0] || { name: 'Vaso Frosted Glass 16oz', extraPrice: 0 });
  const [selectedFinish, setSelectedFinish] = useState<string>(
    product?.cupOptions?.finishes[0] || 'Acabado Esmerilado Frosted',
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
      setSelectedSize(
        sizeAt1 ? (typeof sizeAt1 === 'string' ? sizeAt1 : sizeAt1.name) : 'M',
      );
      setSelectedFit(product.apparelOptions.fits[0] || 'Oversized Streetwear');
      setSelectedColor(
        product.apparelOptions.colors[0] || { name: 'Negro Carbón', hex: '#0A0A0A' },
      );
    }
    if (product.cupOptions) {
      setSelectedCupTypeObj(
        product.cupOptions.types[0] || { name: 'Vaso Frosted Glass 16oz', extraPrice: 0 },
      );
      setSelectedFinish(
        product.cupOptions.finishes[0] || 'Acabado Esmerilado Frosted',
      );
    }
    setCustomText('');
    setQuantity(1);
  }, [product]);

  if (!product) return null;

  // Build gallery: always include main image first, then any extra gallery images
  const mainImage = product.image;
  const allGalleryImages = [
    mainImage,
    ...(product.galleryImages || []).filter((img) => img && img !== mainImage),
  ].filter(Boolean);

  // Calculate Total Unit Price
  const basePrice = product.price;
  const selectedSizeObj = product.apparelOptions?.sizes.find((s) => {
    const name = typeof s === 'string' ? s : s.name;
    return name === selectedSize;
  });
  const apparelSizeExtra =
    isApparel && selectedSizeObj && typeof selectedSizeObj !== 'string'
      ? selectedSizeObj.extraPrice
      : 0;
  const cupTypeExtra = !isApparel && selectedCupTypeObj ? selectedCupTypeObj.extraPrice : 0;
  const unitPrice = basePrice + apparelSizeExtra + cupTypeExtra;
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal animate-fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        <div className="modal-head">
          <h2>{cfg('pm_head_title', 'Hazlo tuyo')}</h2>
          <button
            type="button"
            className="close"
            onClick={onClose}
            aria-label={cfg('pm_close_label', 'Cerrar')}
          >
            <X />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!product.agotado) handleAdd();
          }}
        >
          <div className="modal-body productdetail">
            {/* Media + galería */}
            <div className="pd-media">
              <div className="pd-frame">
                <MediaDisplay
                  src={activeImage}
                  alt={product.name}
                  className={product.agotado ? 'opacity-40 grayscale' : undefined}
                />
                {product.agotado && (
                  <span
                    className="tag sold"
                    style={{ position: 'absolute', top: 12, left: 12 }}
                  >
                    {cfg('sold_out_label', 'Agotado')}
                  </span>
                )}
                {product.technique && (
                  <span
                    className="tag"
                    style={{ position: 'absolute', top: 12, right: 12, left: 'auto' }}
                  >
                    {product.technique}
                  </span>
                )}
              </div>

              {allGalleryImages.length > 1 && (
                <div className="pd-thumbs">
                  {allGalleryImages.map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={activeImage === imgUrl ? 'active' : ''}
                      aria-label={`${cfg('pm_view_prefix', 'Vista')} ${idx + 1}`}
                    >
                      <MediaDisplay src={imgUrl} alt={`Vista ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              <p className="subtle" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Clock style={{ width: 15, height: 15 }} />
                {cfg('pm_production_time', 'Producción en ')}
                <strong>{product.productionTime}</strong>
              </p>
              <p className="subtle" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <ShieldCheck style={{ width: 15, height: 15 }} />
                {cfg('pm_quality_guarantee', 'Calidad garantizada LUMIN 100%')}
              </p>
            </div>

            {/* Detalle y opciones */}
            <div>
              <p className="eyebrow">
                {categoryLabel ||
                  (isApparel
                    ? cfg('pm_category_polo', 'Polo sublimado')
                    : cfg('pm_category_cup', 'Vaso / taza sublimada'))}
              </p>
              <h2>{product.name}</h2>
              <p>{product.description}</p>

              {product.agotado && (
                <div className="notice">
                  {cfg(
                    'pm_sold_notice',
                    'Este diseño está agotado. Consulta cuándo estará disponible.',
                  )}
                </div>
              )}

              {/* Polo: talla, corte y color */}
              {isApparel && product.apparelOptions && (
                <>
                  <label className="field">
                    <span>{cfg('pm_size_label', 'Talla')}</span>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                    >
                      {product.apparelOptions.sizes.map((size) => {
                        const sizeName = typeof size === 'string' ? size : size.name;
                        const sizeExtra = typeof size === 'string' ? 0 : size.extraPrice;
                        return (
                          <option key={sizeName} value={sizeName}>
                            {sizeName}
                            {sizeExtra > 0 ? ` — + S/ ${sizeExtra}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <div className="field">
                    <span>{cfg('pm_fit_label', 'Corte')}</span>
                    <div className="chips" style={{ flexWrap: 'wrap' }}>
                      {product.apparelOptions.fits.map((fit) => (
                        <button
                          key={fit}
                          type="button"
                          className={`chip ${selectedFit === fit ? 'active' : ''}`}
                          onClick={() => setSelectedFit(fit)}
                          aria-pressed={selectedFit === fit}
                        >
                          {fit}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <span>
                      {cfg('pm_color_label', 'Color')} · {selectedColor.name}
                    </span>
                    <div className="chips" style={{ flexWrap: 'wrap' }}>
                      {product.apparelOptions.colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          className={`chip ${selectedColor.name === c.name ? 'active' : ''}`}
                          onClick={() => setSelectedColor(c)}
                          aria-pressed={selectedColor.name === c.name}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        >
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              background: c.hex,
                              border: '1px solid var(--line)',
                            }}
                          />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Vaso / taza / placa: medida o tipo, y acabado */}
              {!isApparel && product.cupOptions && (
                <>
                  {product.cupOptions.types.length > 0 && (
                    <div className="field">
                      <span>
                        {kind === 'placa'
                          ? cfg('pm_measure_label', 'Medida (alto × ancho)')
                          : cfg('pm_cup_type_label', 'Tipo de vaso / taza')}
                      </span>
                      <div className="chips" style={{ flexWrap: 'wrap' }}>
                        {product.cupOptions.types.map((typeObj) => (
                          <button
                            key={typeObj.name}
                            type="button"
                            className={`chip ${
                              selectedCupTypeObj.name === typeObj.name ? 'active' : ''
                            }`}
                            onClick={() => setSelectedCupTypeObj(typeObj)}
                            aria-pressed={selectedCupTypeObj.name === typeObj.name}
                          >
                            {typeObj.name}
                            {typeObj.extraPrice > 0
                              ? ` · + S/ ${typeObj.extraPrice}`
                              : typeObj.extraPrice < 0
                              ? ` · - S/ ${Math.abs(typeObj.extraPrice)}`
                              : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.cupOptions.finishes.length > 0 && (
                    <div className="field">
                      <span>{cfg('pm_finish_label', 'Acabado')}</span>
                      <div className="chips" style={{ flexWrap: 'wrap' }}>
                        {product.cupOptions.finishes.map((finish) => (
                          <button
                            key={finish}
                            type="button"
                            className={`chip ${selectedFinish === finish ? 'active' : ''}`}
                            onClick={() => setSelectedFinish(finish)}
                            aria-pressed={selectedFinish === finish}
                          >
                            {finish}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <label className="field">
                <span>
                  {cfg('pm_custom_text_label', 'Texto o nombre personalizado · opcional')} ·{' '}
                  {customText.length}/30
                </span>
                <input
                  type="text"
                  maxLength={30}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={
                    isApparel
                      ? cfg('pm_placeholder_apparel', 'Ej. Nombre en manga / "LUMIN 04"')
                      : cfg('pm_placeholder_cup', 'Ej. "Carlos" o frase corta')
                  }
                  autoComplete="off"
                />
              </label>

              <p className="subtle">
                {cfg(
                  'pm_coordination_note',
                  'Coordinaremos contigo el diseño final y las opciones disponibles antes de producirlo.',
                )}
              </p>
            </div>
          </div>

          <div className="modalfoot">
            <div>
              <p className="subtle">{cfg('pm_total_label', 'Total estimado')}</p>
              <p className="price">S/ {totalPrice.toFixed(2)}</p>
            </div>

            <div className="qty">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label={cfg('pm_decrease', 'Disminuir cantidad')}
              >
                <Minus />
              </button>
              <input
                type="number"
                min={1}
                max={99}
                step={1}
                value={quantity}
                aria-label={cfg('pm_quantity_label', 'Cantidad')}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))
                }
              />
              <button
                type="button"
                onClick={() => setQuantity(Math.min(99, quantity + 1))}
                aria-label={cfg('pm_increase', 'Aumentar cantidad')}
              >
                <Plus />
              </button>
            </div>

            <button type="submit" className="btn" disabled={product.agotado}>
              <ShoppingBag />
              {product.agotado
                ? cfg('sold_out_label', 'Agotado')
                : cfg('pm_add_to_cart', 'Añadir al pedido')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
