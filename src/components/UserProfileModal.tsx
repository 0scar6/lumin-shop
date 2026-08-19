import React, { useState } from 'react';
import { X, User, Sun, Moon, Zap, Save, CheckCircle2, ShieldCheck, CreditCard, Truck, PhoneCall, HelpCircle, Eye, Heart, ShoppingBag, Clock, Sparkles, MessageCircle, Shirt, Award } from 'lucide-react';
import { ThemeMode, UserProfileData } from '../types';
import { cfg } from '../lib/config';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  userProfile: UserProfileData;
  onSaveProfile: (profile: UserProfileData) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  themeMode,
  onSelectTheme,
  userProfile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserProfileData>({
    name: userProfile.name || '',
    phone: userProfile.phone || '',
    address: userProfile.address || '',
    dni: userProfile.dni || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const isLight = themeMode === 'light';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 pb-20 sm:pb-24 bg-black/60 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col max-h-[78vh] overflow-hidden transition-colors ${
          isLight
            ? 'bg-white text-gray-900 border-gray-200'
            : themeMode === 'amoled'
            ? 'bg-black text-white border-white/10'
            : 'bg-[#11130F] text-white border-white/10'
        }`}
      >
        {/* Mobile pull handle */}
        <div className="w-12 h-1 bg-gray-500/30 rounded-full mx-auto mt-2.5 sm:hidden"></div>

        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0A0A0A] border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D2E8A3] flex items-center justify-center text-[#0A0A0A] font-extrabold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-tight">
                {cfg('up_title', 'Mi Perfil y Preferencias')}
              </h2>
              <p className="text-[10px] text-gray-500 -mt-0.5">LUMIN Shop & Personalización</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isLight ? 'hover:bg-gray-200 text-gray-600' : 'hover:bg-white/10 text-gray-400 hover:text-white'
            }`}
            aria-label={cfg('up_close_label', 'Cerrar perfil')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* STATS SECTION */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className={`p-3 rounded-2xl border flex flex-col justify-between gap-1.5 ${
              isLight ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-[#161814] border-white/10 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase text-gray-400">{cfg('up_activity', 'Actividad')}</span>
                <Eye className="w-3.5 h-3.5 text-[#D2E8A3]" />
              </div>
              <div>
                <span className="text-xl font-black font-display">8</span>
                <p className="text-[9px] text-gray-400">{cfg('up_products_viewed', 'Productos vistos')}</p>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex flex-col justify-between gap-1.5 ${
              isLight ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-[#161814] border-white/10 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase text-gray-400">{cfg('up_collection', 'Colección')}</span>
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
              </div>
              <div>
                <span className="text-xl font-black font-display">4</span>
                <p className="text-[9px] text-gray-400">{cfg('up_favorites', 'Favoritos')}</p>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex flex-col justify-between gap-1.5 ${
              isLight ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-[#161814] border-white/10 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase text-gray-400">{cfg('up_orders', 'Pedidos')}</span>
                <ShoppingBag className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div>
                <span className="text-xl font-black font-display">3</span>
                <p className="text-[9px] text-gray-400">{cfg('up_orders_count', 'Pedidos')}</p>
              </div>
            </div>
          </div>
          
          {/* SECTION 1: THEME CUSTOMIZATION */}
          <div className="space-y-3">
            <label className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-lime-800' : 'text-[#D2E8A3]'} flex items-center gap-1.5`}>
              <Sun className="w-4 h-4" />
              <span>{cfg('up_theme_label', '1. Apariencia Visual de la Web:')}</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {/* Dark Theme */}
              <button
                type="button"
                onClick={() => onSelectTheme('dark')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  themeMode === 'dark'
                    ? 'border-[#D2E8A3] bg-[#161814] shadow-md shadow-[#D2E8A3]/10 ring-1 ring-[#D2E8A3]'
                    : isLight
                    ? 'border-gray-300 bg-gray-100 hover:border-gray-400'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Moon className={`w-5 h-5 ${themeMode === 'dark' ? 'text-[#D2E8A3]' : isLight ? 'text-slate-600' : 'text-gray-400'}`} />
                <div>
                  <span className={`block font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {cfg('up_theme_dark', 'Oscuro')}
                  </span>
                  <span className={`text-[9px] font-mono ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{cfg('up_theme_dark_desc', 'Clásico LUMIN')}</span>
                </div>
              </button>

              {/* AMOLED Theme */}
              <button
                type="button"
                onClick={() => onSelectTheme('amoled')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  themeMode === 'amoled'
                    ? 'border-[#D2E8A3] bg-black shadow-md shadow-[#D2E8A3]/10 ring-1 ring-[#D2E8A3]'
                    : isLight
                    ? 'border-gray-300 bg-gray-100 hover:border-gray-400'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Zap className={`w-5 h-5 ${themeMode === 'amoled' ? 'text-[#D2E8A3]' : isLight ? 'text-slate-600' : 'text-gray-400'}`} />
                <div>
                  <span className={`block font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    AMOLED
                  </span>
                  <span className={`text-[9px] font-mono ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{cfg('up_theme_amoled_desc', 'Negro Puro')}</span>
                </div>
              </button>

              {/* Light Theme */}
              <button
                type="button"
                onClick={() => onSelectTheme('light')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  themeMode === 'light'
                    ? 'border-[#8AB73B] bg-gray-100 text-gray-900 ring-2 ring-[#8AB73B]'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Sun className={`w-5 h-5 ${themeMode === 'light' ? 'text-[#8AB73B]' : 'text-gray-400'}`} />
                <div>
                  <span className={`block font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {cfg('up_theme_light', 'Claro')}
                  </span>
                  <span className={`text-[9px] font-mono ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{cfg('up_theme_light_desc', 'Día Limpio')}</span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 2: CUSTOMER DATA FOR AUTOFILL */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-lime-800' : 'text-[#D2E8A3]'} flex items-center gap-1.5`}>
                <User className="w-4 h-4" />
                <span>{cfg('up_data_label', '2. Mis Datos para Envíos Rápidos:')}</span>
              </label>
              <span className={`text-[10px] font-mono ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>({cfg('up_browser_hint', 'Se guarda en tu navegador')})</span>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-700 font-medium' : 'text-gray-300'}`}>
              {cfg('up_data_desc', 'Completa tus datos una sola vez para que tus pedidos por WhatsApp se generen automáticamente sin volver a escribirlos.')}
            </p>

            <div className="space-y-2.5 pt-1">
              <div>
                <label className={`block text-[11px] font-bold uppercase mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{cfg('up_name_label', 'Nombre y Apellido')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={cfg('up_name_placeholder', 'Ej. Carlos Mendoza')}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 transition-colors ${
                    isLight
                      ? 'bg-slate-100 text-slate-900 border border-slate-300 placeholder-slate-500 focus:ring-[#8AB73B]'
                      : 'bg-[#161814] text-white border border-white/20 placeholder-gray-400 focus:border-[#D2E8A3]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={`block text-[11px] font-bold uppercase mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{cfg('up_phone_label', 'WhatsApp / Teléfono')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={cfg('up_phone_placeholder', 'Ej. 987654321')}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 transition-colors ${
                      isLight
                        ? 'bg-slate-100 text-slate-900 border border-slate-300 placeholder-slate-500 focus:ring-[#8AB73B]'
                        : 'bg-[#161814] text-white border border-white/20 placeholder-gray-400 focus:border-[#D2E8A3]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{cfg('up_dni_label', 'DNI (Opcional)')}</label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    placeholder={cfg('up_dni_placeholder', 'Para la guía de envío')}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 transition-colors ${
                      isLight
                        ? 'bg-slate-100 text-slate-900 border border-slate-300 placeholder-slate-500 focus:ring-[#8AB73B]'
                        : 'bg-[#161814] text-white border border-white/20 placeholder-gray-400 focus:border-[#D2E8A3]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{cfg('up_address_label', 'Dirección de Entrega y Referencia')}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={cfg('up_address_placeholder', 'Ej. Av. Larco 456 Dpto 302, Miraflores (Ref: Frente a la iglesia)')}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 transition-colors ${
                    isLight
                      ? 'bg-slate-100 text-slate-900 border border-slate-300 placeholder-slate-500 focus:ring-[#8AB73B]'
                      : 'bg-[#161814] text-white border border-white/20 placeholder-gray-400 focus:border-[#D2E8A3]'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#D2E8A3] hover:bg-[#b8d682] text-[#0A0A0A] font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#0A0A0A]" />
                  <span>{cfg('up_save_success', '¡DATOS GUARDADOS CON ÉXITO!')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{cfg('up_save_btn', 'GUARDAR MI INFORMACIÓN')}</span>
                </>
              )}
            </button>
          </form>

          {/* SECTION 3: CONCEPTOS CLAVE DEL SERVICIO LUMIN SHOP */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-lime-800' : 'text-[#D2E8A3]'} flex items-center gap-1.5`}>
                <HelpCircle className="w-4 h-4" />
                <span>{cfg('up_concepts_label', '3. Conceptos del Servicio LUMIN SHOP:')}</span>
              </label>
              <span className="text-[10px] font-mono font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                {cfg('up_guarantee_badge', 'Garantía 100%')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Concept 1: Tiempos de Entrega */}
              <div className={`p-3.5 rounded-2xl border space-y-1.5 transition-all ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#161814] border-white/10 text-gray-300'
              }`}>
                <div className={`flex items-center gap-2 ${isLight ? 'text-lime-800' : 'text-[#D2E8A3]'}`}>
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {cfg('up_concept1_title', '1. Tiempos de Elaboración:')}
                  </strong>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {cfg('up_concept1_desc', 'Confección y sublimación personalizada en ')}<strong className={isLight ? 'text-lime-800 font-extrabold' : 'text-[#D2E8A3]'}>24 a 48 hrs hábiles</strong>{cfg('up_concept1_desc_suffix', ' antes del despacho final.')}
                </p>
              </div>

              {/* Concept 2: Pagos Seguros */}
              <div className={`p-3.5 rounded-2xl border space-y-1.5 transition-all ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#161814] border-white/10 text-gray-300'
              }`}>
                <div className={`flex items-center gap-2 ${isLight ? 'text-lime-800' : 'text-[#D2E8A3]'}`}>
                  <CreditCard className="w-4 h-4 flex-shrink-0" />
                  <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {cfg('up_concept2_title', '2. Pagos Yape / Plin / BCP:')}
                  </strong>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {cfg('up_concept2_desc', 'Pago seguro al ')}<strong className={`font-mono ${isLight ? 'text-lime-800 font-bold' : 'text-[#D2E8A3]'}`}>{cfg('brand_phone', '993 365 099')}</strong>{cfg('up_concept2_desc_suffix', ' a nombre de LUMIN SHOP. Aceptamos BCP, BBVA e Interbank.')}
                </p>
              </div>

              {/* Concept 3: Envíos Gratis */}
              <div className={`p-3.5 rounded-2xl border space-y-1.5 transition-all ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#161814] border-white/10 text-gray-300'
              }`}>
                <div className={`flex items-center gap-2 ${isLight ? 'text-lime-800' : 'text-[#D2E8A3]'}`}>
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {cfg('up_concept3_title', '3. Envíos Gratis & Cobertura:')}
                  </strong>
                </div>
                <p className="text-[11px] leading-relaxed">
                  <strong className={isLight ? 'text-green-700 font-extrabold' : 'text-green-400'}>{cfg('up_concept3_highlight', 'Gratis por compras desde S/ 200')}</strong>{cfg('up_concept3_desc', '. Envíos con Olva Courier, Shalom o Motorizado Express.')}
                </p>
              </div>

              {/* Concept 4: Calidad de Telas */}
              <div className={`p-3.5 rounded-2xl border space-y-1.5 transition-all ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#161814] border-white/10 text-gray-300'
              }`}>
                <div className={`flex items-center gap-2 ${isLight ? 'text-lime-800' : 'text-[#D2E8A3]'}`}>
                  <Shirt className="w-4 h-4 flex-shrink-0" />
                  <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {cfg('up_concept4_title', '4. Algodón 24/1 & Sublimación HD:')}
                  </strong>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {cfg('up_concept4_desc', 'Telas reactivas de alto gramaje y estampado HD 1200 DPI de máxima fijación resistente a lavados.')}
                </p>
              </div>

              {/* Concept 5: Verificación WhatsApp */}
              <div className={`p-3.5 rounded-2xl border space-y-1.5 transition-all ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#161814] border-white/10 text-gray-300'
              }`}>
                <div className={`flex items-center gap-2 ${isLight ? 'text-lime-800' : 'text-[#D2E8A3]'}`}>
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {cfg('up_concept5_title', '5. Asesoría Directa WhatsApp:')}
                  </strong>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {cfg('up_concept5_desc', 'Coordinación personalizada en tiempo real para validar tu talla, color y datos de entrega antes de producir.')}
                </p>
              </div>

              {/* Concept 6: Garantía Total */}
              <div className={`p-3.5 rounded-2xl border space-y-1.5 transition-all ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#161814] border-white/10 text-gray-300'
              }`}>
                <div className={`flex items-center gap-2 ${isLight ? 'text-lime-800' : 'text-[#D2E8A3]'}`}>
                  <Award className="w-4 h-4 flex-shrink-0" />
                  <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {cfg('up_concept6_title', '6. Garantía de Calidad LUMIN:')}
                  </strong>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {cfg('up_concept6_desc', '100% de cobertura ante defectos o fallas de estampado. Reemplazo o ajuste inmediato sin complicaciones.')}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info & close */}
        <div className={`p-3 sm:px-6 sm:py-4 border-t flex items-center justify-between text-[11px] ${
          isLight ? 'bg-gray-100 border-gray-200 text-gray-600' : 'bg-[#0A0A0A] border-white/10 text-gray-400'
        }`}>
          <span>{cfg('up_footer_text', 'LUMIN SHOP v2.0 • Urbano & Sublimación')}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
          >
            {cfg('up_close_hint', 'Tocar afuera o cerrar')}
          </button>
        </div>

      </div>
    </div>
  );
};
