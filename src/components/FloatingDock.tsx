import React from 'react';
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

export const FloatingDock: React.FC<FloatingDockProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  favoritesCount,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';

  const tabs = [
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
      highlight: true,
    },
    {
      id: 'profile' as NavigationTab,
      label: cfg('nav_profile', 'Mi Cuenta'),
      icon: User,
    },
  ];

  return (
    <nav
      aria-label={cfg('nav_main_label', 'Navegación Principal')}
      className={`fixed bottom-2.5 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94vw] sm:w-auto max-w-md sm:max-w-xl px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-around sm:justify-center gap-1 sm:gap-2.5 ${
        isLight
          ? 'bg-white text-slate-900 border-2 border-slate-900 shadow-xl shadow-slate-900/20'
          : 'bg-[#0F120D]/95 text-white border-2 border-[#D2E8A3]/80 shadow-2xl shadow-black backdrop-blur-xl'
      }`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center justify-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all duration-200 flex-1 sm:flex-initial whitespace-nowrap ${
              isActive
                ? isLight
                  ? 'bg-slate-900 text-[#D2E8A3] shadow-md scale-105 ring-1 ring-slate-900'
                  : 'bg-[#D2E8A3] text-[#0A0A0A] shadow-lg shadow-[#D2E8A3]/30 scale-105'
                : isLight
                ? 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
                : 'text-gray-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon
              className={`w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0 ${
                isActive
                  ? isLight
                    ? 'text-[#D2E8A3]'
                    : 'text-[#0A0A0A]'
                  : isLight
                  ? 'text-slate-900'
                  : 'text-gray-200'
              }`}
            />

            <span className={`text-[10px] sm:text-xs font-extrabold tracking-tight whitespace-nowrap ${
              isActive ? 'inline' : 'hidden xs:inline sm:inline'
            }`}>
              {tab.label}
            </span>

            {/* Notification Badge */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={`flex items-center justify-center min-w-[16px] h-[16px] sm:min-w-4 sm:h-4 px-1 text-[9px] sm:text-[10px] font-black rounded-full flex-shrink-0 ${
                  isActive
                    ? isLight
                      ? 'bg-[#D2E8A3] text-slate-950'
                      : 'bg-[#0A0A0A] text-[#D2E8A3]'
                    : isLight
                    ? 'bg-slate-900 text-white'
                    : 'bg-[#D2E8A3] text-[#0A0A0A]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};


