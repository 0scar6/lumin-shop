import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, Send, Copy, CheckCircle, Clock, Tag, MessageSquare, UserCheck, MapPin, QrCode, Smartphone } from 'lucide-react';
import { CartItem, UserProfileData, ThemeMode } from '../types';
import { cfg } from '../lib/config';

const yapeQrImage = '/yape_qr_code.jpg';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  userProfile?: UserProfileData;
  themeMode?: ThemeMode;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  userProfile,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';
  const [copied, setCopied] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showYapeModal, setShowYapeModal] = useState(false);
  const [customerName, setCustomerName] = useState(userProfile?.name || '');
  const [deliveryType, setDeliveryType] = useState<'envio' | 'recojo'>('envio');

  useEffect(() => {
    if (userProfile?.name && !customerName) {
      setCustomerName(userProfile.name);
    }
  }, [userProfile]);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => {
    const extra = item.product.cupOptions?.types.find((t) => t.name === item.selectedCupType)?.extraPrice || 0;
    const itemUnitPrice = item.product.price + extra;
    return acc + itemUnitPrice * item.quantity;
  }, 0);

  // Generate WhatsApp Order Text (Customer perspective to shop)
  const buildWhatsAppMessage = () => {
    const nameStr = customerName.trim() || userProfile?.name || '';
    let msg = `¡Hola LUMIN SHOP! ⚡ Quisiera realizar el siguiente pedido:\n\n`;

    // Customer Info
    msg += `👤 *MIS DATOS DE CONTACTO:*\n`;
    msg += `• *Nombre:* ${nameStr || 'Por indicar por chat'}\n`;
    if (userProfile?.phone) msg += `• *Teléfono:* ${userProfile.phone}\n`;
    if (userProfile?.dni) msg += `• *DNI:* ${userProfile.dni}\n`;
    
    if (deliveryType === 'envio') {
      msg += `• *Modalidad:* 🚀 Envío a Domicilio\n`;
      msg += `• *Dirección:* ${userProfile?.address || 'Por indicar por chat'}\n`;
    } else {
      msg += `• *Modalidad:* 🏪 Recojo en Tienda\n`;
    }

    msg += `\n📦 *DETALLE DE MI PEDIDO* (${cartItems.reduce((sum, i) => sum + i.quantity, 0)} ítems):\n`;

    cartItems.forEach((item, index) => {
      const extra = item.product.cupOptions?.types.find((t) => t.name === item.selectedCupType)?.extraPrice || 0;
      const unitPrice = item.product.price + extra;
      const itemTotal = unitPrice * item.quantity;

      msg += `\n*${index + 1}. ${item.product.name}* (Cant: ${item.quantity})\n`;
      if (item.selectedSize) msg += `   • Talla: ${item.selectedSize}\n`;
      if (item.selectedFit) msg += `   • Fit/Corte: ${item.selectedFit}\n`;
      if (item.selectedColor) msg += `   • Color: ${item.selectedColor.name}\n`;
      if (item.selectedCupType) msg += `   • Tipo: ${item.selectedCupType}\n`;
      if (item.selectedFinish) msg += `   • Acabado: ${item.selectedFinish}\n`;
      if (item.customText) msg += `   • Texto Personalizado: "${item.customText}"\n`;
      msg += `   • Subtotal: S/ ${itemTotal.toFixed(2)}\n`;
      msg += `   • Imagen de referencia: ${item.product.image}\n`;
    });

    msg += `\n💰 *TOTAL DE MI ORDEN: S/ ${totalAmount.toFixed(2)}*\n\n`;
    msg += `Por favor confírmenme los datos de pago (Yape / Plin / BCP) y el tiempo de entrega para coordinar. ¡Muchas gracias!`;

    return msg;
  };

  const handleSendWhatsApp = () => {
    const message = buildWhatsAppMessage();
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cfg('brand_phone_raw', '51993365099')}?text=${encoded}`, '_blank');
  };

  const handleCopyOrder = () => {
    const message = buildWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyYapePhone = () => {
    navigator.clipboard.writeText(cfg('brand_phone_raw', '51993365099').replace(/^51/, ''));
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:justify-end p-2 sm:p-4 pb-20 sm:pb-24 bg-black/60 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#11130F] h-[78vh] sm:h-[84vh] rounded-2xl sm:rounded-3xl border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden my-auto"
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2 sm:hidden"></div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D2E8A3]" />
            <h2 className="font-display text-base sm:text-lg font-black uppercase text-white">
              {cfg('cd_title', 'Mi Pedido LUMIN')} ({cartItems.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label={cfg('cd_close_label', 'Cerrar pedido')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-gray-500">
              <ShoppingBag className="w-16 h-16 text-gray-700 stroke-1" />
              <p className="text-sm">{cfg('cd_empty_msg', 'Aún no has añadido ningún producto a tu pedido.')}</p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-[#D2E8A3] text-[#0A0A0A] font-bold text-xs shadow-lg"
              >
                {cfg('cd_view_catalog', 'VER CATÁLOGO')}
              </button>
            </div>
          ) : (
            <>
              {/* Production Workflow Banner */}
              <div className="p-3.5 rounded-2xl bg-[#161814] border border-[#D2E8A3]/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#D2E8A3]">
                  <Tag className="w-4 h-4" />
                  <span>{cfg('cd_process_title', 'PROCESO DE ATENCIÓN BAJO PEDIDO:')}</span>
                </div>
                <ol className="text-[11px] text-gray-300 space-y-1 list-decimal list-inside pl-1">
                  <li>{cfg('cd_step1', 'Envías la orden a nuestro WhatsApp.')}</li>
                  <li>{cfg('cd_step2', 'Iniciamos producción digital/artesanal (24-48h).')}</li>
                  <li>{cfg('cd_step3', 'Despachamos tu pedido directo a tu dirección.')}</li>
                </ol>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const extra = item.product.cupOptions?.types.find((t) => t.name === item.selectedCupType)?.extraPrice || 0;
                  const itemUnitPrice = item.product.price + extra;
                  const itemTotal = itemUnitPrice * item.quantity;

                  return (
                    <div
                      key={item.cartItemId}
                      className="p-3 sm:p-3.5 rounded-2xl glass-card border border-white/10 flex gap-3 relative group"
                    >
                      {/* Product Thumbnail */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-white/10 flex-shrink-0"
                      />

                      {/* Content details */}
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start pr-6">
                          <h4 className="font-bold text-xs text-white line-clamp-1">
                            {item.product.name}
                          </h4>
                        </div>

                        {/* Specs tags */}
                        <div className="flex flex-wrap gap-1 text-[10px] text-gray-400">
                          {item.selectedSize && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                              {cfg('cd_size_label', 'Talla:')} {item.selectedSize}
                            </span>
                          )}
                          {item.selectedFit && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                              Fit: {item.selectedFit}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.selectedColor.hex }}></span>
                              {item.selectedColor.name}
                            </span>
                          )}
                          {item.selectedCupType && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                              {item.selectedCupType}
                            </span>
                          )}
                        </div>

                        {item.customText && (
                          <div className="text-[10px] text-[#D2E8A3] italic">
                            {cfg('cd_custom_text', 'Texto personalizado:')} "{item.customText}"
                          </div>
                        )}

                        {/* Quantity and subtotal */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1.5 bg-[#0A0A0A] border border-white/10 rounded-lg px-2 py-0.5 text-xs">
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                              className="text-gray-400 hover:text-white"
                            >
                              -
                            </button>
                            <span className="font-bold text-white px-1">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                              className="text-gray-400 hover:text-white"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-black text-sm text-[#D2E8A3]">
                            S/ {itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Delete Item Button */}
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors"
                        title={cfg('cd_delete_item', 'Eliminar ítem')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Customer Quick Form */}
              <div className="p-3.5 rounded-2xl bg-[#161814] border border-white/10 space-y-2.5 pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#D2E8A3]" />
                    <span>{cfg('cd_customer_form_title', 'Datos para la orden:')}</span>
                  </h4>
                  {userProfile?.name && (
                    <span className="text-[10px] text-[#D2E8A3] font-mono">{cfg('cd_autofill_hint', 'Autocompletado desde "Yo"')}</span>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={cfg('cd_name_placeholder', 'Tu nombre completo...')}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D2E8A3]"
                  />
                </div>

                {userProfile?.address && (
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 px-1">
                    <MapPin className="w-3 h-3 text-[#D2E8A3] flex-shrink-0" />
                    <span className="truncate">{userProfile.address}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setDeliveryType('envio')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${
                      deliveryType === 'envio'
                        ? 'bg-[#D2E8A3] text-[#0A0A0A] border-[#D2E8A3] font-bold'
                        : 'bg-[#0A0A0A] text-gray-400 border-white/10'
                    }`}
                  >
                    🚀 {cfg('cd_delivery_home', 'Envío Domicilio')}
                  </button>
                  <button
                    onClick={() => setDeliveryType('recojo')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${
                      deliveryType === 'recojo'
                        ? 'bg-[#D2E8A3] text-[#0A0A0A] border-[#D2E8A3] font-bold'
                        : 'bg-[#0A0A0A] text-gray-400 border-white/10'
                    }`}
                  >
                    🏪 {cfg('cd_pickup', 'Recojo en Tienda')}
                  </button>
                </div>
              </div>

              {/* Yape / Plin Payment Section */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#200B29] to-[#121610] border border-[#742284]/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#742284] flex items-center justify-center font-black text-white text-[10px] tracking-tighter shadow">
                      YAPE
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        {cfg('cd_yape_title', 'Pagar con Yape / Plin')}
                      </h4>
                      <p className="text-[10px] text-gray-400">Titular: LUMIN SHOP (Oscar Daniel)</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowYapeModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-[#742284] hover:bg-[#8A2B9C] text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-md active:scale-95"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#00D2B5]" />
                    <span>{cfg('cd_view_qr', 'Ver QR')}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between bg-black/50 px-3 py-2 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-white font-mono font-bold">
                    <Smartphone className="w-3.5 h-3.5 text-[#00D2B5]" />
                    <span>993 365 099</span>
                  </div>

                  <button
                    onClick={handleCopyYapePhone}
                    className="text-[10px] font-bold text-[#D2E8A3] hover:underline flex items-center gap-1"
                  >
                    {copiedPhone ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">{cfg('cd_copied', '¡Copiado!')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{cfg('cd_copy_number', 'Copiar Número')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Modal QR YAPE Grande */}
        {showYapeModal && (
          <div
            onClick={() => setShowYapeModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xs bg-[#120B16] rounded-3xl border border-[#742284]/60 p-5 text-center shadow-2xl flex flex-col items-center space-y-3"
            >
              <button
                onClick={() => setShowYapeModal(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-2xl bg-[#742284] flex items-center justify-center text-white font-black text-sm tracking-tight shadow-lg shadow-[#742284]/30">
                YAPE
              </div>

              <div>
                <h3 className="text-base font-black text-white">{cfg('cd_qr_title', 'QR Estático Yape / Plin')}</h3>
                <p className="text-xs text-gray-400">LUMIN SHOP • 993 365 099</p>
              </div>

              <div className="p-2 rounded-2xl bg-white border-4 border-[#742284] shadow-2xl overflow-hidden max-w-[210px]">
                <img
                  src={yapeQrImage}
                  alt="QR Yape LUMIN SHOP"
                  className="w-full h-auto rounded-lg object-contain"
                />
              </div>

              <p className="text-[11px] text-gray-300 leading-tight">
                {cfg('cd_qr_instruction', 'Escanea desde la App Yape o Plin. Luego envía tu comprobante adjunto al pedir por WhatsApp.')}
              </p>

              <button
                onClick={handleCopyYapePhone}
                className="w-full py-2.5 rounded-xl bg-[#742284] hover:bg-[#8B2FA1] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95"
              >
                {copiedPhone ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>{cfg('cd_phone_copied', '¡Número 993365099 Copiado!')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#00D2B5]" />
                    <span>{cfg('cd_copy_phone', 'Copiar 993 365 099 para Yapear')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Bottom Total & Order Buttons */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 pb-6 border-t border-white/10 bg-[#0A0A0A] space-y-3">
            
            {/* Detailed Cart Breakdown */}
            <div className="p-3 rounded-2xl bg-[#161814] border border-white/10 space-y-2">
              
              {/* Subtotal */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-mono">{cfg('cd_subtotal', 'Subtotal:')}</span>
                <span className="font-bold text-white">S/ {totalAmount.toFixed(2)}</span>
              </div>

              {/* Free Shipping Indicator */}
              <div className="pt-1 border-t border-white/5 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 flex items-center gap-1">
                    <span>🚀 {cfg('cd_delivery_label', 'Envío Domicilio:')}</span>
                  </span>
                  {totalAmount >= 200 ? (
                    <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-black text-[11px] font-mono">
                      {cfg('cd_free', '¡GRATIS!')}
                    </span>
                  ) : (
                    <span className="text-gray-300 font-medium text-[11px]">
                      S/ 12.00 <span className="text-gray-500 text-[10px]">({cfg('cd_free_from', 'Gratis desde S/ 200')})</span>
                    </span>
                  )}
                </div>

                {/* Progress bar / Free shipping message */}
                {totalAmount >= 200 ? (
                  <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-[11px] text-green-400 font-bold flex items-center justify-center gap-1.5">
                    <span>🎉 {cfg('cd_free_congrats', '¡Felicidades! Calificas para Envío GRATIS')}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{cfg('cd_add_for_free', 'Añade S/ ')}{(200 - totalAmount).toFixed(2)} {cfg('cd_add_for_free_suffix', 'más para Envío Gratis')}</span>
                      <span>{Math.round((totalAmount / 200) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-[#D2E8A3] transition-all duration-300"
                        style={{ width: `${Math.min(100, (totalAmount / 200) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Final */}
              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-xs text-white uppercase font-black font-mono">{cfg('cd_total_final', 'Total Final:')}</span>
                <span className="text-2xl font-black text-[#D2E8A3]">
                  S/ {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={handleSendWhatsApp}
                className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-98"
              >
                <MessageSquare className="w-4 h-4 fill-black" />
                <span>{cfg('cd_send_whatsapp', 'ENVIAR PEDIDO POR WHATSAPP (con imagen)')}</span>
              </button>

              <button
                onClick={handleCopyOrder}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">{cfg('cd_order_copied', '¡Texto de Orden Copiado!')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-400" />
                    <span>{cfg('cd_copy_summary', 'Copiar Resumen de Pedido')}</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
              <button
                onClick={onClearCart}
                className="hover:text-gray-300 underline"
              >
                {cfg('cd_empty_cart', 'Vaciar carrito')}
              </button>
              <button
                onClick={onClose}
                className="hover:text-gray-300"
              >
                {cfg('cd_close_hint', 'Tocar afuera para cerrar')}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

