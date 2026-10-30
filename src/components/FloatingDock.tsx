import React, { useMemo } from 'react';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { NavigationTab, ThemeMode } from '../types';
import { cfg } from '../lib/config';

interface FloatingDockProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  cartCount: number;
  favoritesCount: number;
  themeMode?: ThemeMode;
}

export const FloatingDock: React.FC<FloatingDockProps> = React.memo(({
  activeTab,
  setActiveTab,
  cartCount,
  favoritesCount,
  themeMode = 'dark',
}) => {
  const tabs = useMemo(() => [
    { id: 'home' as NavigationTab, label: cfg('nav_home', 'Inicio'), icon: Home },
    { id: 'catalog' as NavigationTab, label: cfg('nav_catalog', 'Catálogo'), icon: Grid },
    {
      id: 'favorites' as NavigationTab,
      label: cfg('nav_favorites', 'Favoritos'),
      icon: Heart,
      badge: favoritesCount,
    },
    {
      id: 'cart' as NavigationTab,
      label: cfg('nav_cart', 'Pedido'),
      icon: ShoppingBag,
      badge: cartCount,
    },
    {
      id: 'profile' as NavigationTab,
      label: cfg('nav_profile', 'Mi espacio'),
      icon: User,
    },
  ], [favoritesCount, cartCount]);

  return (
    <nav className="bottomnav" aria-label={cfg('nav_main_label', 'Navegación Principal')}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`navitem ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon />
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="badge">{tab.badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
});
FloatingDock.displayName = 'FloatingDock';
