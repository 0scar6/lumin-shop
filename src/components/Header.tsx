import React from 'react';
import { ShoppingBag, Heart, MessageCircle, Search, User, ShieldCheck, Home, Grid, HelpCircle } from 'lucide-react';
import { GoogleUser, NavigationTab } from '../types';

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
    const text = encodeURIComponent('Hola LÚMIN SHOP! ⚡ Quisiera hacer una consulta sobre un pedido.');
    window.open(`https://wa.me/51993365099?text=${text}`, '_blank');
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 transition-colors ${
      isLight ? 'bg-white/95 text-slate-900 border-slate-200 shadow-sm' : 'bg-[#0A0A0A]/90 text-white border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & On-Demand Badge - Dedicated Spacious Branding Area */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 sm:gap-3 group text-left focus:outline-none flex-shrink-0"
          >
            <div className="w-8 h-8 sm:w-11 sm:h-11 bg-[#D2E8A3] rounded-xl flex items-center justify-center shadow-lg shadow-[#D2E8A3]/20 ring-2 ring-[#D2E8A3]/30 transition-transform group-hover:scale-105 flex-shrink-0">
              <span className="text-[#0A0A0A] font-extrabold text-lg sm:text-2xl font-display tracking-tight">L</span>
            </div>
            <div className="flex flex-col whitespace-nowrap min-w-max pr-1 sm:pr-4">
              <div className="flex items-center gap-1">
                <h1 className={`font-display text-base sm:text-2xl font-black tracking-wider uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  LÚMIN SHOP<span className="text-[#65A30D] sm:text-[#D2E8A3]">.</span>
                </h1>
              </div>
              <span className={`hidden sm:block text-[9px] sm:text-[10px] font-mono tracking-widest uppercase -mt-0.5 ${isLight ? 'text-slate-600 font-semibold' : 'text-gray-300'}`}>
                URBAN APPAREL & SUBLIMATION
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

        {/* Header Navigation Menu Bar for Desktop */}
        {setActiveTab && (
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                activeTab === 'home'
                  ? isLight
                    ? 'bg-slate-900 text-[#D2E8A3] shadow-sm'
                    : 'bg-[#D2E8A3] text-[#0A0A0A] shadow-sm'
                  : isLight
                  ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
                  : 'text-gray-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Inicio</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                activeTab === 'catalog'
                  ? isLight
                    ? 'bg-slate-900 text-[#D2E8A3] shadow-sm'
                    : 'bg-[#D2E8A3] text-[#0A0A0A] shadow-sm'
                  : isLight
                  ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
                  : 'text-gray-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Catálogo</span>
            </button>

            <button
              onClick={onOpenFavorites}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                activeTab === 'favorites'
                  ? isLight
                    ? 'bg-slate-900 text-[#D2E8A3] shadow-sm'
                    : 'bg-[#D2E8A3] text-[#0A0A0A] shadow-sm'
                  : isLight
                  ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
                  : 'text-gray-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Favoritos</span>
            </button>

            <button
              onClick={onOpenProfile}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                activeTab === 'profile'
                  ? isLight
                    ? 'bg-slate-900 text-[#D2E8A3] shadow-sm'
                    : 'bg-[#D2E8A3] text-[#0A0A0A] shadow-sm'
                  : isLight
                  ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
                  : 'text-gray-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Mi Cuenta</span>
            </button>
          </nav>
        )}

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

          {/* Google Auth / Continuar con Google Header Button */}
          {googleUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border border-green-500/50 bg-green-500/10 text-green-500 text-xs font-bold transition-all hover:scale-105 flex-shrink-0"
              title={`Verificado: ${googleUser.email}`}
            >
              <img
                src={googleUser.picture}
                alt={googleUser.name}
                className="w-5 h-5 rounded-full border border-green-500 object-cover flex-shrink-0"
              />
              <span className="hidden sm:inline font-mono text-[11px] font-bold">
                {googleUser.name.split(' ')[0]}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            </button>
          ) : (
            <button
              onClick={onOpenGoogleAuth}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95 flex-shrink-0 ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900 shadow-sm'
                  : 'bg-[#161814] hover:bg-[#222520] border-white/20 text-white'
              }`}
              title="Continuar con Google"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
              </svg>
              <span className="hidden sm:inline font-bold">Google</span>
            </button>
          )}

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


