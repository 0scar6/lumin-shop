import React, { useRef } from 'react';
import { ShoppingBag, MapPin, Sun, Moon } from 'lucide-react';
import { GoogleUser, NavigationTab, ThemeMode } from '../types';
import { cfg } from '../lib/config';

interface HeaderProps {
  cartCount: number;
  favoritesCount?: number;
  onOpenCart: () => void;
  onOpenFavorites?: () => void;
  onOpenProfile?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  themeMode?: ThemeMode;
  googleUser?: GoogleUser | null;
  onOpenGoogleAuth?: () => void;
  showSearch?: boolean;
  activeTab?: NavigationTab;
  setActiveTab?: (tab: NavigationTab) => void;
  onAdminActivate?: () => void;
  onToggleTheme?: () => void;
}

/**
 * Topbar de la maqueta: marca (5 clics = panel admin) + ubicación,
 * cambio rápido de tema y botón de pedido.
 */
export const Header: React.FC<HeaderProps> = React.memo(({
  cartCount,
  onOpenCart,
  themeMode = 'dark',
  activeTab = 'home',
  setActiveTab,
  onAdminActivate,
  onToggleTheme,
}) => {
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLight = themeMode === 'light';

  const handleLogoClick = () => {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 3000);
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0;
      onAdminActivate?.();
    }
    setActiveTab?.('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="wrap">
      <div className="topbar">
        {/* Marca (5 clics en 3 s = panel admin) */}
        <button className="brand" onClick={handleLogoClick} aria-label={`${cfg('brand_name', 'LUMIN SHOP')} · Inicio`}>
          <span className="mark">L</span>
          <span>
            <h1 className="wordmark">
              {cfg('brand_name', 'LUMIN SHOP')}
              <em>.</em>
            </h1>
            <small>{cfg('brand_slogan', 'URBAN APPAREL & SUBLIMATION')}</small>
          </span>
        </button>

        <div className="topright">
          <span className="location">
            <MapPin />
            {cfg('brand_location', 'Ayacucho, Perú')}
          </span>

          <button
            className="iconbtn"
            onClick={onToggleTheme}
            aria-label="Cambiar tema"
            title="Cambiar tema"
          >
            {isLight ? <Moon /> : <Sun />}
          </button>

          <button className="btn small" onClick={onOpenCart} aria-label="Mi Pedido">
            <ShoppingBag />
            {cfg('nav_cart', 'Pedido')} ({cartCount})
          </button>
        </div>
      </div>
    </header>
  );
});
Header.displayName = 'Header';
