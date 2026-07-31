import React from 'react';
import { ShoppingBag, Heart, MessageCircle, Search, User } from 'lucide-react';
import { GoogleUser, NavigationTab } from '../types';
import { cfg } from '../lib/config';

interface HeaderProps {
  cartCount: number;
  favoritesCount: number;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onOpenProfile: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  themeMode?: 'dark' | 'light' | 'amoled';
  googleUser?: GoogleUser | null;
  onOpenGoogleAuth?: () => void;
  showSearch?: boolean;
  activeTab?: NavigationTab;
  setActiveTab?: (tab: NavigationTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  favoritesCount,
  onOpenCart,
  onOpenFavorites,
  onOpenProfile,
  searchQuery,
  setSearchQuery,
  themeMode = 'dark',
  googleUser = null,
  onOpenGoogleAuth,
  showSearch = true,
  activeTab = 'home',
  setActiveTab,
}) => {
  const isLight = themeMode === 'light';

  const handleWhatsAppHelp = () => {
    const text = encodeURIComponent(cfg('brand_whatsapp_help', 'Hola LUMIN SHOP! ⚡ Quisiera hacer una consulta sobre un pedido.'));
    window.open(`https://wa.me/${cfg('brand_phone_raw', '51993365099')}?text=${text}`, '_blank');
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 transition-colors ${
      isLight ? 'bg-white/95 text-slate-900 border-slate-200 shadow-sm' : 'bg-[#0A0A0A]/90 text-white border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & On-Demand Badge - Dedicated Spacious Branding Area */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button 
            onClick={() => { setActiveTab?.('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2 sm:gap-3 group text-left focus:outline-none flex-shrink-0"
          >
            <div className="w-8 h-8 sm:w-11 sm:h-11 bg-[#D2E8A3] rounded-xl flex items-center justify-center shadow-lg shadow-[#D2E8A3]/20 ring-2 ring-[#D2E8A3]/30 transition-transform group-hover:scale-105 flex-shrink-0">
              <span className="text-[#0A0A0A] font-extrabold text-lg sm:text-2xl font-display tracking-tight">L</span>
            </div>
            <div className="flex flex-col whitespace-nowrap min-w-max pr-1 sm:pr-4">
              <div className="flex items-center gap-1">
                <h1 className={`font-display text-base sm:text-2xl font-black tracking-wider uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {cfg('brand_name', 'LUMIN SHOP')}<span className="text-[#65A30D] sm:text-[#D2E8A3]">.</span>
                </h1>
              </div>
              <span className={`hidden sm:block text-[9px] sm:text-[10px] font-mono tracking-widest uppercase -mt-0.5 ${isLight ? 'text-slate-600 font-semibold' : 'text-gray-300'}`}>
                {cfg('brand_slogan', 'URBAN APPAREL & SUBLIMATION')}
              </span>
            </div>
          </button>

          {/* Badge: Atención por pedido */}
          <div className={`hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${
            isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#161814] border-white/10 text-[#D2E8A3]'
          }`}>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Atención por Pedido</span>
          </div>
        </div>

        {/* Nav removed — only bottom FloatingDock */}

        {/* Quick Search Input - ONLY visible in Catalog tab (showSearch = true) */}
        {showSearch && (
          <div className="flex-1 max-w-xs sm:max-w-sm relative hidden md:block">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : 'text-gray-300'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar polo, taza, oversized..."
              className={`w-full border rounded-full pl-9 pr-8 py-1.5 text-xs focus:outline-none transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-slate-800'
                  : 'bg-[#161814] border-white/20 text-white placeholder-gray-400 focus:border-[#D2E8A3]'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs transition-colors ${
                  isLight ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">

          {/* Google Auth removed - User Profile button */}

          {/* User Profile / Theme - Visible on sm+ (bottom dock handles mobile) */}
          <button
            onClick={onOpenProfile}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all flex-shrink-0 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-[#161814] hover:bg-[#222520] border-white/10 text-gray-300 hover:text-white'
            }`}
            title="Mi Perfil / Tema"
          >
            <User className="w-3.5 h-3.5 text-slate-900 dark:text-[#D2E8A3]" />
            <span>Yo</span>
          </button>

          {/* WhatsApp Direct */}
          <button
            onClick={handleWhatsAppHelp}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all flex-shrink-0 ${
              isLight
                ? 'bg-green-50 hover:bg-green-100 border-green-300 text-green-900'
                : 'bg-[#161814] hover:bg-[#222520] border-white/10 text-gray-300 hover:text-white'
            }`}
            title="Atención directa por WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="hidden lg:inline">Ayuda</span>
          </button>

          {/* Favorites Button - Visible on sm+ (bottom dock handles mobile) */}
          <button
            onClick={onOpenFavorites}
            className={`hidden sm:flex relative p-2 rounded-full border transition-all flex-shrink-0 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-[#161814] hover:bg-[#222520] border-white/10 text-gray-300 hover:text-white'
            }`}
            aria-label="Favoritos"
          >
            <Heart className="w-4 h-4" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Cart Button - ALWAYS VISIBLE, perfectly sized */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs hover:bg-[#b8d682] transition-all shadow-md flex-shrink-0"
            aria-label="Mi Pedido"
          >
            <ShoppingBag className="w-4 h-4 flex-shrink-0" />
            <span className="hidden xs:inline sm:inline">Mi Pedido</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#0A0A0A] text-[#D2E8A3] text-[10px] font-extrabold flex-shrink-0">
              {cartCount}
            </span>
          </button>
        </div>

      </div>

      {/* Mobile search input - ONLY visible in Catalog tab */}
      {showSearch && (
        <div className={`md:hidden mt-2 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <div className="relative">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : 'text-gray-300'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por modelo o tipo..."
              className={`w-full border rounded-full pl-8 pr-4 py-1.5 text-xs focus:outline-none ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500'
                  : 'bg-[#161814] border-white/20 text-white placeholder-gray-400'
              }`}
            />
          </div>
        </div>
      )}
    </header>
  );
};


