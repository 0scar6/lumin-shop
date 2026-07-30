import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { FloatingDock } from './components/FloatingDock';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { FavoritesModal } from './components/FavoritesModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ProductionBadgeBar } from './components/ProductionBadgeBar';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { SocialQuickBar, FloatingWhatsAppWidget } from './components/SocialQuickBar';
import { GoogleAuthModal, GoogleLoginBanner } from './components/GoogleAuthModal';

import { PRODUCTS as PRODUCTS_STATIC, CATEGORIES as CATEGORIES_STATIC, loadProductsFromSupabase } from './data/products';
import {
  syncFavoritesToSupabase,
  syncCartToSupabase,
  syncProfileToSupabase,
  syncGoogleUserToSupabase,
  syncCustomIdeaToSupabase,
  loadCategoriesFromSupabase,
} from './lib/supabase-data';
import { Product, CartItem, NavigationTab, Category, ThemeMode, UserProfileData, GoogleUser } from './types';
import {
  Filter,
  Tag,
  MessageCircle,
  SlidersHorizontal,
  Shirt,
  Coffee,
  ArrowUpDown,
  Grid,
  Heart,
  ShoppingBag,
  Eye,
  User,
  Trash2,
  CheckCircle2,
  Copy,
  QrCode,
  Smartphone,
  Sun,
  Moon,
  Zap,
  Save,
  MapPin,
  ShieldCheck,
  CreditCard,
  Truck,
  HelpCircle,
  Clock,
  Award,
  Flame,
  Plus,
  Minus
} from 'lucide-react';

const yapeQrImage = '/yape_qr_code.jpg';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Products from Supabase (with static fallback)
  const [products, setProducts] = useState<Product[]>(PRODUCTS_STATIC);
  const [categories, setCategories] = useState(CATEGORIES_STATIC);

  useEffect(() => {
    loadProductsFromSupabase().then(setProducts);
    loadCategoriesFromSupabase().then((cats) => {
      if (cats.length > 0) setCategories(cats);
    });
  }, []);

  // Interactive Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isCustomIdeaOpen, setIsCustomIdeaOpen] = useState<boolean>(false);

  // Cart & Favorites State (persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lumin_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('lumin_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('lumin_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('lumin_favorites', JSON.stringify(favorites));
    syncFavoritesToSupabase(favorites);
  }, [favorites]);

  // Theme Mode & User Profile (persisted in localStorage)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('lumin_theme_mode');
    return (saved as ThemeMode) || 'dark';
  });

  const [userProfile, setUserProfile] = useState<UserProfileData>(() => {
    try {
      const saved = localStorage.getItem('lumin_user_profile');
      return saved ? JSON.parse(saved) : { name: '', phone: '', address: '', dni: '', email: '' };
    } catch {
      return { name: '', phone: '', address: '', dni: '', email: '' };
    }
  });

  // Google Authentication State
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(() => {
    try {
      const saved = localStorage.getItem('lumin_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isGoogleAuthOpen, setIsGoogleAuthOpen] = useState<boolean>(false);

  useEffect(() => {
    if (googleUser) {
      localStorage.setItem('lumin_google_user', JSON.stringify(googleUser));
    } else {
      localStorage.removeItem('lumin_google_user');
    }
  }, [googleUser]);

  const handleGoogleLogin = (user: GoogleUser) => {
    setGoogleUser(user);
    setUserProfile((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
    }));
    setProfileForm((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
    }));
    syncGoogleUserToSupabase(user);
  };

  const handleGoogleLogout = () => {
    setGoogleUser(null);
  };

  // Local state for full profile screen
  const [profileForm, setProfileForm] = useState<UserProfileData>(userProfile);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'envio' | 'recojo'>('envio');

  useEffect(() => {
    setProfileForm(userProfile);
  }, [userProfile]);

  // Sync document root class for Light / Dark / Amoled
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark', 'amoled');
    } else if (themeMode === 'amoled') {
      root.classList.add('amoled');
      root.classList.remove('light', 'dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light', 'amoled');
    }
  }, [themeMode]);

  // Save theme to localStorage
  const handleSelectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('lumin_theme_mode', mode);
  };

  // Save user profile to localStorage
  const handleSaveProfile = (profile: UserProfileData) => {
    setUserProfile(profile);
    localStorage.setItem('lumin_user_profile', JSON.stringify(profile));
    syncProfileToSupabase(profile, themeMode, googleUser?.id);
  };

  const handleProfileScreenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveProfile(profileForm);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 2500);
  };

  // Custom idea form state
  const [customIdeaText, setCustomIdeaText] = useState('');
  const [customIdeaType, setCustomIdeaType] = useState<'polo' | 'vaso' | 'otro'>('polo');

  // Filter products logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory === 'streetwear' && product.category !== 'streetwear') return false;
      if (selectedCategory === 'cups' && product.category !== 'cups') return false;
      if (selectedCategory === 'drops' && !product.tag?.includes('DROP')) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        const matchTech = product.technique.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchTech) return false;
      }

      // Technique / Type filter
      if (selectedTechnique === 'textil' && product.category !== 'streetwear') return false;
      if (selectedTechnique === 'sublimacion' && product.category !== 'cups') return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [selectedCategory, searchQuery, selectedTechnique, sortBy, products]);

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Favorites operations
  const toggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isProductFavorite = (productId: string) => {
    return favorites.some((p) => p.id === productId);
  };

  // Tab navigation
  const handleTabChange = (tab: NavigationTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Total cart calculation
  const totalCartAmount = cart.reduce((acc, item) => {
    const extra = item.product.cupOptions?.types.find((t) => t.name === item.selectedCupType)?.extraPrice || 0;
    return acc + (item.product.price + extra) * item.quantity;
  }, 0);

  // Generate WhatsApp Message
  const buildWhatsAppMessage = () => {
    const nameStr = userProfile.name.trim() || '';
    let msg = `¡Hola LÚMIN SHOP! ⚡ Quisiera realizar el siguiente pedido:\n\n`;

    msg += `👤 *MIS DATOS DE CONTACTO:*\n`;
    msg += `• *Nombre:* ${nameStr || 'Por indicar por chat'}\n`;
    if (userProfile.phone) msg += `• *Teléfono:* ${userProfile.phone}\n`;
    if (userProfile.dni) msg += `• *DNI:* ${userProfile.dni}\n`;
    
    if (deliveryType === 'envio') {
      msg += `• *Modalidad:* 🚀 Envío a Domicilio\n`;
      msg += `• *Dirección:* ${userProfile.address || 'Por indicar por chat'}\n`;
    } else {
      msg += `• *Modalidad:* 🏪 Recojo en Tienda\n`;
    }

    msg += `\n📦 *DETALLE DE MI PEDIDO* (${cart.reduce((sum, i) => sum + i.quantity, 0)} ítems):\n`;

    cart.forEach((item, index) => {
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
    });

    msg += `\n💰 *TOTAL DE MI ORDEN: S/ ${totalCartAmount.toFixed(2)}*\n\n`;
    msg += `Por favor confírmenme los datos de pago y el tiempo de entrega. ¡Muchas gracias!`;

    return msg;
  };

  const handleSendWhatsAppOrder = () => {
    const message = buildWhatsAppMessage();
    syncCartToSupabase(cart, userProfile, deliveryType, googleUser?.id);
    window.open(`https://wa.me/51993365099?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyOrderSummary = () => {
    const message = buildWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2500);
  };

  const handleCopyYapePhone = () => {
    navigator.clipboard.writeText('993365099');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  // Custom idea submit to WhatsApp
  const handleSendCustomIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIdeaText.trim()) return;

    let text = `⚡ *CONSULTA DE IDEA PERSONALIZADA LÚMIN SHOP*\n`;
    if (userProfile.name) text += `👤 *Cliente:* ${userProfile.name}\n`;
    if (userProfile.phone) text += `📞 *Teléfono:* ${userProfile.phone}\n`;
    text += `• *Tipo:* ${customIdeaType === 'polo' ? 'Polo Streetwear' : customIdeaType === 'vaso' ? 'Vaso / Taza Sublimada' : 'Otro artículo'}\n`;
    text += `• *Detalle de mi idea:* ${customIdeaText.trim()}\n`;
    text += `\nQuisiera cotización y asesoría de diseño por favor.`;

    syncCustomIdeaToSupabase(
      customIdeaType,
      customIdeaText.trim(),
      userProfile.email || '',
      googleUser?.id
    );

    window.open(`https://wa.me/51993365099?text=${encodeURIComponent(text)}`, '_blank');
    setIsCustomIdeaOpen(false);
    setCustomIdeaText('');
  };

  // Theme Wrapper CSS Classes
  const isLight = themeMode === 'light';
  const getThemeWrapperClass = () => {
    if (themeMode === 'amoled') return 'bg-[#000000] text-white selection:bg-[#D2E8A3] selection:text-[#0A0A0A]';
    if (themeMode === 'light') return 'bg-[#F4F5F0] text-slate-900 selection:bg-[#8AB73B] selection:text-white';
    return 'bg-[#0A0A0A] text-white selection:bg-[#D2E8A3] selection:text-[#0A0A0A]';
  };

  return (
    <div className={`min-h-screen w-full overflow-x-hidden flex flex-col font-sans transition-colors duration-300 pb-32 sm:pb-36 ${getThemeWrapperClass()}`}>
      
      {/* Header Bar */}
      <Header
        cartCount={cart.reduce((a, c) => a + c.quantity, 0)}
        favoritesCount={favorites.length}
        onOpenCart={() => handleTabChange('cart')}
        onOpenFavorites={() => handleTabChange('favorites')}
        onOpenProfile={() => handleTabChange('profile')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        themeMode={themeMode}
        googleUser={googleUser}
        onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
        showSearch={activeTab === 'catalog'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 space-y-8 pt-4">
        
        {/* SCREEN 1: INICIO (HOME) */}
        {activeTab === 'home' && (
          <div key="home-screen" className="space-y-8 animate-fade-in-up">
            {/* Top Hero Banner */}
            <HeroBanner
              onExploreClick={() => handleTabChange('catalog')}
              onCustomOrderClick={() => setIsCustomIdeaOpen(true)}
              themeMode={themeMode}
            />

            {/* Direct WhatsApp & Social Media Quick Access Bar */}
            <SocialQuickBar themeMode={themeMode} />

            {/* Brand Description Section - LÚMIN SHOP */}
            <section className={`p-6 sm:p-8 rounded-3xl border space-y-4 relative overflow-hidden ${
              isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'glass-card border-white/10 text-white'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-[#D2E8A3]/20 text-[#D2E8A3]'
                  }`}>
                    Sobre LÚMIN SHOP
                  </span>
                  <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>@.lumin.shop</span>
                </div>
                <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>📍 Lima, Perú • Envíos a Nivel Nacional</span>
              </div>

              <h2 className={`font-display text-2xl sm:text-3xl font-extrabold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Ropa Urbana Streetwear & Sublimación de Alta Temperatura
              </h2>

              <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                LÚMIN SHOP es una marca independiente peruana dedicada al diseño y confección de streetwear exclusivo y artículos gráficos. Nos especializamos en polos <strong>Oversized & Boxy Fit</strong> producidos en algodón reactivo de 240g (Heavyweight) de máxima durabilidad, además de <strong>Vasos Frosted Glass de 16oz</strong> y <strong>Tazas Térmicas de 11oz</strong> sublimadas térmicamente a 200°C. Cada prenda y producto se elabora 100% bajo pedido con acabado profesional.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleTabChange('catalog')}
                  className="px-5 py-2.5 rounded-full bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs sm:text-sm hover:bg-[#b8d682] transition-all flex items-center gap-2 shadow-lg"
                >
                  <Grid className="w-4 h-4" />
                  <span>Explorar Catálogo de Productos</span>
                </button>
                <button
                  onClick={() => setIsCustomIdeaOpen(true)}
                  className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm transition-all border flex items-center gap-2 ${
                    isLight ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                  }`}
                >
                  <Tag className="w-4 h-4 text-[#D2E8A3]" />
                  <span>Cotizar Idea Personalizada</span>
                </button>
              </div>
            </section>

            {/* How It Works & Production Badges */}
            <ProductionBadgeBar themeMode={themeMode} />

            {/* Bestseller Preview Drops */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className={`text-xs font-mono uppercase tracking-widest ${isLight ? 'text-lime-700 font-bold' : 'text-[#D2E8A3]'}`}>
                    🔥 SELECCIÓN DESTACADA DROP 04
                  </span>
                  <h3 className={`font-display text-xl sm:text-2xl font-extrabold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Nuestros Más Pedidos
                  </h3>
                </div>
                <button
                  onClick={() => handleTabChange('catalog')}
                  className={`text-xs font-bold hover:underline flex items-center gap-1 ${isLight ? 'text-lime-700' : 'text-[#D2E8A3]'}`}
                >
                  Ver Catálogo Completo ({products.length}) →
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {products.slice(0, 4).map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    index={idx}
                    product={product}
                    isFavorite={isProductFavorite(product.id)}
                    onToggleFavorite={toggleFavorite}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    themeMode={themeMode}
                  />
                ))}
              </div>
            </section>

            {/* FAQs */}
            <FaqSection themeMode={themeMode} />
          </div>
        )}

        {/* SCREEN 2: CATÁLOGO */}
        {activeTab === 'catalog' && (
          <div key="catalog-screen" className="space-y-6 animate-fade-in-up">
            {/* Section Heading & Category Pills */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D2E8A3]"></span>
                  <span className="text-xs font-mono text-[#D2E8A3] uppercase tracking-widest">
                    PANTALLA DE CATÁLOGO & PRODUCTOS
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white">
                  COLECCIÓN DISPONIBLE
                </h2>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {categories.map((cat) => {
                  const isCatActive = selectedCategory === cat.id;
                  const IconComponent =
                    cat.id === 'streetwear'
                      ? Shirt
                      : cat.id === 'cups'
                      ? Coffee
                      : cat.id === 'drops'
                      ? Flame
                      : Filter;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as Category)}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 flex-shrink-0 transition-all ${
                        isCatActive
                          ? 'bg-[#D2E8A3] text-[#0A0A0A] shadow-lg shadow-[#D2E8A3]/20 scale-105'
                          : isLight
                          ? 'bg-white text-slate-800 border border-slate-300 hover:border-slate-400'
                          : 'bg-[#161814] text-gray-300 border border-white/10 hover:border-white/30'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5 text-[#D2E8A3]" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-Filters & Sort Bar */}
            <div
              className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border text-xs ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800 shadow-sm'
                  : 'bg-[#161814] border-white/10 text-gray-300'
              }`}
            >
              {/* Quick technique filter pills */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className={`w-4 h-4 ${isLight ? 'text-lime-700' : 'text-[#D2E8A3]'}`} />
                <span className={`${isLight ? 'text-slate-700' : 'text-gray-300'} font-bold hidden sm:inline`}>Técnica:</span>

                <button
                  onClick={() => setSelectedTechnique('all')}
                  className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                    selectedTechnique === 'all'
                      ? 'bg-[#D2E8A3] text-[#0A0A0A] shadow-sm'
                      : isLight
                      ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Todas
                </button>

                <button
                  onClick={() => setSelectedTechnique('textil')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 font-bold ${
                    selectedTechnique === 'textil'
                      ? 'bg-[#D2E8A3] text-[#0A0A0A] shadow-sm'
                      : isLight
                      ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shirt className="w-3 h-3" />
                  <span>Textil HD</span>
                </button>

                <button
                  onClick={() => setSelectedTechnique('sublimacion')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 font-bold ${
                    selectedTechnique === 'sublimacion'
                      ? 'bg-[#D2E8A3] text-[#0A0A0A] shadow-sm'
                      : isLight
                      ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Coffee className="w-3 h-3" />
                  <span>Sublimado 200°C</span>
                </button>
              </div>

              {/* Sorting dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#D2E8A3] ${
                    isLight ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-[#0A0A0A] text-gray-300 border-white/10'
                  }`}
                >
                  <option value="featured">Destacados Drop</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center space-y-3 glass-card rounded-3xl p-8 border border-white/10">
                <Tag className="w-12 h-12 text-gray-600 mx-auto" />
                <p className="text-gray-400 text-sm">
                  No se encontraron productos con los filtros seleccionados.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedTechnique('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-full bg-[#D2E8A3] text-[#0A0A0A] font-bold text-xs"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div
                key={`${selectedCategory}-${selectedTechnique}-${searchQuery}-${sortBy}`}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in"
              >
                {filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    index={idx}
                    product={product}
                    isFavorite={isProductFavorite(product.id)}
                    onToggleFavorite={toggleFavorite}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    themeMode={themeMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCREEN 3: FAVORITOS (FAVORITES) */}
        {activeTab === 'favorites' && (
          <div key="favorites-screen" className="space-y-6 animate-fade-in-up">
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLight ? 'border-slate-200' : 'border-white/5'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span className={`text-xs font-mono uppercase tracking-widest ${
                    isLight ? 'text-lime-700 font-bold' : 'text-[#D2E8A3]'
                  }`}>
                    PANTALLA DE MIS FAVORITOS
                  </span>
                </div>
                <h2 className={`font-display text-2xl sm:text-3xl font-extrabold uppercase ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  PRODUCTOS GUARDADOS ({favorites.length})
                </h2>
              </div>

              {favorites.length > 0 && (
                <button
                  onClick={() => setFavorites([])}
                  className={`text-xs underline ${
                    isLight ? 'text-slate-500 hover:text-rose-600' : 'text-gray-400 hover:text-rose-400'
                  }`}
                >
                  Vaciar Favoritos
                </button>
              )}
            </div>

            {favorites.length === 0 ? (
              <div className={`py-16 text-center space-y-4 rounded-3xl p-8 border max-w-xl mx-auto ${
                isLight ? 'bg-white border-slate-300 text-slate-900 shadow-md' : 'glass-card border-white/10 text-white'
              }`}>
                <Heart className={`w-16 h-16 stroke-1 mx-auto ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                <h3 className={`font-display text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Aún no tienes productos guardados
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  Explora el catálogo y presiona el corazón en los polos o vasos que más te gusten para guardarlos aquí.
                </p>
                <button
                  onClick={() => handleTabChange('catalog')}
                  className="px-6 py-3 rounded-full bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs shadow-lg inline-flex items-center gap-2 hover:bg-[#c2e088] transition-all"
                >
                  <Grid className="w-4 h-4" />
                  <span>EXPLORAR CATÁLOGO</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {favorites.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    index={idx}
                    product={product}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    themeMode={themeMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCREEN 4: MI PEDIDO / CARRITO (CART) */}
        {activeTab === 'cart' && (
          <div key="cart-screen" className="space-y-6 animate-fade-in-up">
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLight ? 'border-slate-200' : 'border-white/5'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShoppingBag className={`w-4 h-4 ${isLight ? 'text-lime-700' : 'text-[#D2E8A3]'}`} />
                  <span className={`text-xs font-mono uppercase tracking-widest ${
                    isLight ? 'text-lime-700 font-bold' : 'text-[#D2E8A3]'
                  }`}>
                    PANTALLA DE PEDIDO & PROCESAMIENTO
                  </span>
                </div>
                <h2 className={`font-display text-2xl sm:text-3xl font-extrabold uppercase ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  MI PEDIDO LÚMIN ({cart.length})
                </h2>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className={`text-xs underline ${
                    isLight ? 'text-slate-500 hover:text-red-600' : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  Vaciar Carrito
                </button>
              )}
            </div>

            {/* Google Authentication Anti-Bot Banner */}
            <GoogleLoginBanner
              currentUser={googleUser}
              onOpenModal={() => setIsGoogleAuthOpen(true)}
              onLogout={handleGoogleLogout}
              themeMode={themeMode}
            />

            {cart.length === 0 ? (
              <div className={`py-16 text-center space-y-4 rounded-3xl p-8 border max-w-xl mx-auto ${
                isLight ? 'bg-white border-slate-300 text-slate-900 shadow-md' : 'glass-card border-white/10 text-white'
              }`}>
                <ShoppingBag className={`w-16 h-16 stroke-1 mx-auto ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                <h3 className={`font-display text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Tu pedido está vacío por el momento
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  Agrega polos streetwear o vasos/tazas con tu personalización preferida para generar tu orden.
                </p>
                <button
                  onClick={() => handleTabChange('catalog')}
                  className="px-6 py-3 rounded-full bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs shadow-lg inline-flex items-center gap-2 hover:bg-[#c2e088] transition-all"
                >
                  <Grid className="w-4 h-4" />
                  <span>IR AL CATÁLOGO</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left side: Cart Items List */}
                <div className="lg:col-span-7 space-y-4">
                  <div className={`p-4 rounded-2xl border space-y-1.5 ${
                    isLight ? 'bg-lime-50/80 border-lime-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-[#D2E8A3]/30 text-white'
                  }`}>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${
                      isLight ? 'text-lime-800' : 'text-[#D2E8A3]'
                    }`}>
                      <Tag className="w-4 h-4" />
                      <span>PROCESO DE FABRICACIÓN BAJO PEDIDO:</span>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                      Envías la orden a WhatsApp, iniciamos producción digital/artesanal (24-48h) y despachamos a tu domicilio.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {cart.map((item) => {
                      const extra = item.product.cupOptions?.types.find((t) => t.name === item.selectedCupType)?.extraPrice || 0;
                      const itemUnitPrice = item.product.price + extra;
                      const itemTotal = itemUnitPrice * item.quantity;

                      return (
                        <div
                          key={item.cartItemId}
                          className={`p-4 rounded-2xl border flex gap-3 sm:gap-4 relative group ${
                            isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'glass-card border-white/10 text-white'
                          }`}
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-white/10 flex-shrink-0"
                          />

                          <div className="flex-1 space-y-1.5">
                            <div className="flex justify-between items-start pr-6">
                              <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {item.product.name}
                              </h4>
                            </div>

                            <div className="flex flex-wrap gap-1.5 text-[11px]">
                              {item.selectedSize && (
                                <span className={`px-2 py-0.5 rounded border font-semibold ${
                                  isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/10 border-white/10 text-gray-300'
                                }`}>
                                  Talla: {item.selectedSize}
                                </span>
                              )}
                              {item.selectedFit && (
                                <span className={`px-2 py-0.5 rounded border font-semibold ${
                                  isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/10 border-white/10 text-gray-300'
                                }`}>
                                  Fit: {item.selectedFit}
                                </span>
                              )}
                              {item.selectedColor && (
                                <span className={`px-2 py-0.5 rounded border font-semibold flex items-center gap-1 ${
                                  isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/10 border-white/10 text-gray-300'
                                }`}>
                                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.selectedColor.hex }}></span>
                                  {item.selectedColor.name}
                                </span>
                              )}
                              {item.selectedCupType && (
                                <span className={`px-2 py-0.5 rounded border font-semibold ${
                                  isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/10 border-white/10 text-gray-300'
                                }`}>
                                  {item.selectedCupType}
                                </span>
                              )}
                            </div>

                            {item.customText && (
                              <p className={`text-xs italic font-medium ${isLight ? 'text-lime-800 font-bold' : 'text-[#D2E8A3]'}`}>
                                Texto personalizado: "{item.customText}"
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-2">
                              <div className={`flex items-center gap-2 border rounded-xl px-2.5 py-1 text-xs ${
                                isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
                              }`}>
                                <button
                                  onClick={() => handleUpdateQuantity(item.cartItemId, -1)}
                                  className={`${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white'} p-0.5`}
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className={`font-extrabold px-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.cartItemId, 1)}
                                  className={`${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white'} p-0.5`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <span className={`font-black text-base ${isLight ? 'text-slate-900 font-black' : 'text-[#D2E8A3]'}`}>
                                S/ {itemTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.cartItemId)}
                            className={`absolute top-4 right-4 transition-colors ${
                              isLight ? 'text-slate-400 hover:text-red-600' : 'text-gray-400 hover:text-red-400'
                            }`}
                            title="Eliminar ítem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right side: Summary & Direct WhatsApp Order */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Yape / Plin Card */}
                  <div className={`p-4 rounded-3xl border space-y-3 shadow-xl ${
                    isLight
                      ? 'bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 border-purple-700 text-white'
                      : 'bg-gradient-to-r from-[#200B29] to-[#121610] border-[#742284]/50 text-white'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#742284] flex items-center justify-center font-black text-white text-xs tracking-tighter shadow-lg">
                          YAPE
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Pago Yape / Plin Directo</h4>
                          <p className="text-[10px] text-purple-200">Titular: Oscar Daniel (LÚMIN SHOP)</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-white/10">
                        <Smartphone className="w-3.5 h-3.5 text-[#00D2B5]" />
                        <span className="font-mono text-xs font-black text-white">993 365 099</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCopyYapePhone}
                      className="w-full py-2 rounded-xl bg-[#742284] hover:bg-[#8A2B9C] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      {copiedPhone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span>¡Número 993365099 Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#00D2B5]" />
                          <span>Copiar Número Yape / Plin</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Contact Info Overview */}
                  <div className={`p-5 rounded-3xl border space-y-3 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10 text-white'
                  }`}>
                    <h4 className={`font-bold text-xs uppercase tracking-wider ${
                      isLight ? 'text-lime-800' : 'text-[#D2E8A3]'
                    }`}>
                      Datos para el envío:
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className={`text-[10px] uppercase block font-bold mb-1 ${
                          isLight ? 'text-slate-600' : 'text-gray-400'
                        }`}>Nombre Completo:</label>
                        <input
                          type="text"
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                          placeholder="Tu nombre..."
                          className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${
                            isLight ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-[#0A0A0A] border-white/10 text-white placeholder-gray-500'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`text-[10px] uppercase block font-bold mb-1 ${
                          isLight ? 'text-slate-600' : 'text-gray-400'
                        }`}>Dirección de Entrega:</label>
                        <input
                          type="text"
                          value={userProfile.address}
                          onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                          placeholder="Av, Calle, Dpto y Referencia..."
                          className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${
                            isLight ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-[#0A0A0A] border-white/10 text-white placeholder-gray-500'
                          }`}
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setDeliveryType('envio')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            deliveryType === 'envio'
                              ? isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-[#D2E8A3] text-[#0A0A0A] border-[#D2E8A3]'
                              : isLight ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' : 'bg-black/30 text-gray-400 border-white/10'
                          }`}
                        >
                          🚀 Envío Domicilio
                        </button>
                        <button
                          onClick={() => setDeliveryType('recojo')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            deliveryType === 'recojo'
                              ? isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-[#D2E8A3] text-[#0A0A0A] border-[#D2E8A3]'
                              : isLight ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' : 'bg-black/30 text-gray-400 border-white/10'
                          }`}
                        >
                          🏪 Recojo en Tienda
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Buttons */}
                  <div className={`p-5 rounded-3xl border space-y-4 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#0A0A0A] border-white/10 text-white'
                  }`}>
                    <div className={`flex justify-between items-baseline border-b pb-3 ${
                      isLight ? 'border-slate-200' : 'border-white/10'
                    }`}>
                      <span className={`text-xs font-mono uppercase ${isLight ? 'text-slate-600 font-bold' : 'text-gray-400'}`}>
                        Total a Pagar:
                      </span>
                      <span className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-[#D2E8A3]'}`}>
                        S/ {totalCartAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={handleSendWhatsAppOrder}
                        className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-black font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-500/20 active:scale-98"
                      >
                        <MessageCircle className="w-5 h-5 fill-black" />
                        <span>ENVIAR PEDIDO POR WHATSAPP</span>
                      </button>

                      <button
                        onClick={handleCopyOrderSummary}
                        className={`w-full py-3 rounded-2xl border font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                          isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
                        }`}
                      >
                        {copiedOrder ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 font-bold">¡Texto de Orden Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copiar Texto de Pedido Completo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 5: MI CUENTA / "YO" / PERFIL & CONFIGURACIÓN */}
        {activeTab === 'profile' && (
          <div key="profile-screen" className="space-y-6 animate-fade-in-up max-w-3xl mx-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#D2E8A3]" />
                  <span className="text-xs font-mono text-[#D2E8A3] uppercase tracking-widest">
                    PANTALLA DE PERFIL & CONFIGURACIÓN "YO"
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white">
                  MI CUENTA & PREFERENCIAS
                </h2>
              </div>
            </div>

            {/* Profile Statistics Cards */}
            <div className="grid grid-cols-3 gap-3">
              {/* Stat 1: Productos Vistos */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${
                isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10 text-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-400">Actividad</span>
                  <div className="p-1.5 rounded-lg bg-[#D2E8A3]/10 text-[#D2E8A3]">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className={`text-2xl font-black font-display tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>8</span>
                  <p className="text-[10px] text-gray-400 font-medium">Productos vistos</p>
                </div>
              </div>

              {/* Stat 2: Favoritos */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${
                isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10 text-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-400">Colección</span>
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                    <Heart className="w-4 h-4 fill-rose-400/20" />
                  </div>
                </div>
                <div>
                  <span className={`text-2xl font-black font-display tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{favorites.length}</span>
                  <p className="text-[10px] text-gray-400 font-medium">Favoritos</p>
                </div>
              </div>

              {/* Stat 3: Pedidos */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${
                isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10 text-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-400">Historial</span>
                  <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className={`text-2xl font-black font-display tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{cart.length > 0 ? cart.length : 3}</span>
                  <p className="text-[10px] text-gray-400 font-medium">Pedidos</p>
                </div>
              </div>
            </div>

            {/* Section 1: Appearance Selector */}
            <section className={`p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10'
            }`}>
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-[#D2E8A3]" />
                <h3 className="font-display text-lg font-bold uppercase">
                  1. Apariencia Visual del Sitio Web
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dark */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme('dark')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all ${
                    themeMode === 'dark'
                      ? 'border-[#D2E8A3] bg-[#0A0A0A] shadow-lg ring-2 ring-[#D2E8A3]'
                      : 'border-white/10 bg-black/20 hover:bg-black/40'
                  }`}
                >
                  <Moon className={`w-6 h-6 ${themeMode === 'dark' ? 'text-[#D2E8A3]' : 'text-gray-400'}`} />
                  <div>
                    <span className="block font-bold text-sm text-white">Oscuro (Clásico)</span>
                    <span className="text-[11px] text-gray-400 font-mono">Verde Neón & Negro</span>
                  </div>
                </button>

                {/* AMOLED */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme('amoled')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all ${
                    themeMode === 'amoled'
                      ? 'border-[#D2E8A3] bg-black shadow-lg ring-2 ring-[#D2E8A3]'
                      : 'border-white/10 bg-black/20 hover:bg-black/40'
                  }`}
                >
                  <Zap className={`w-6 h-6 ${themeMode === 'amoled' ? 'text-[#D2E8A3]' : 'text-gray-400'}`} />
                  <div>
                    <span className="block font-bold text-sm text-white">AMOLED</span>
                    <span className="text-[11px] text-gray-400 font-mono">Negro Absoluto #000</span>
                  </div>
                </button>

                {/* Light */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme('light')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all ${
                    themeMode === 'light'
                      ? 'border-[#8AB73B] bg-slate-100 ring-2 ring-[#8AB73B]'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <Sun className={`w-6 h-6 ${themeMode === 'light' ? 'text-[#8AB73B]' : 'text-gray-400'}`} />
                  <div>
                    <span className="block font-bold text-sm text-slate-900">Modo Claro</span>
                    <span className="text-[11px] text-slate-600 font-mono">Fondo Claro Limpio</span>
                  </div>
                </button>
              </div>
            </section>

            {/* Section 2: Contact Info */}
            <section className={`p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10'
            }`}>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#D2E8A3]" />
                <h3 className="font-display text-lg font-bold uppercase">
                  2. Mis Datos para Autocompletar Pedidos
                </h3>
              </div>

              <form onSubmit={handleProfileScreenSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Nombre y Apellido</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Ej. Carlos Mendoza"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none border ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">WhatsApp / Teléfono</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="Ej. 987654321"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none border ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">DNI / RUC (Comprobante)</label>
                    <input
                      type="text"
                      value={profileForm.dni}
                      onChange={(e) => setProfileForm({ ...profileForm, dni: e.target.value })}
                      placeholder="Ej. 72839401"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none border ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Dirección de Entrega</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="Av, Calle y Distrito..."
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none border ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#D2E8A3] hover:bg-[#b8d682] text-[#0A0A0A] font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98"
                >
                  {profileSaveSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#0A0A0A]" />
                      <span>¡INFORMACIÓN GUARDADA CON ÉXITO!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>GUARDAR MI INFORMACIÓN EN MI NAVEGADOR</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Section 3: Conceptos Clave del Servicio LÚMIN SHOP */}
            <section className={`p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10 text-gray-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#D2E8A3]">
                  <HelpCircle className="w-5 h-5" />
                  <h3 className={`font-display text-lg font-extrabold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    3. Conceptos Clave del Servicio LÚMIN SHOP
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                  Garantía & Calidad 100%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-1">
                {/* 1. Tiempos de Entrega */}
                <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0A0A0A] border-white/5 text-gray-300'
                }`}>
                  <div className="flex items-center gap-2 text-[#D2E8A3]">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      1. Elaboración Bajo Pedido
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    Producción y sublimación personalizada en <strong className="text-[#D2E8A3]">24 a 48 hrs hábiles</strong> antes de despachar.
                  </p>
                </div>

                {/* 2. Pagos Yape / Plin */}
                <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0A0A0A] border-white/5 text-gray-300'
                }`}>
                  <div className="flex items-center gap-2 text-[#D2E8A3]">
                    <CreditCard className="w-4 h-4 flex-shrink-0" />
                    <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      2. Pagos Yape / Plin / Bancos
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    Pago directo al <strong className="text-[#D2E8A3] font-mono">993 365 099</strong> a nombre de LÚMIN SHOP o BCP / Interbank.
                  </p>
                </div>

                {/* 3. Envíos Gratis */}
                <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0A0A0A] border-white/5 text-gray-300'
                }`}>
                  <div className="flex items-center gap-2 text-[#D2E8A3]">
                    <Truck className="w-4 h-4 flex-shrink-0" />
                    <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      3. Envíos Gratis (S/ 200+)
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    <strong className="text-green-400">Envío sin costo</strong> en compras mayores a S/ 200 vía Olva Courier, Shalom o Express.
                  </p>
                </div>

                {/* 4. Telas & Sublimación */}
                <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0A0A0A] border-white/5 text-gray-300'
                }`}>
                  <div className="flex items-center gap-2 text-[#D2E8A3]">
                    <Shirt className="w-4 h-4 flex-shrink-0" />
                    <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      4. Algodón Reactivo & Sublimado HD
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    Telas 24/1 de alto gramaje y sublimación térmica 1200 DPI que no se despinta ni se agrieta.
                  </p>
                </div>

                {/* 5. Asesoría WhatsApp */}
                <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0A0A0A] border-white/5 text-gray-300'
                }`}>
                  <div className="flex items-center gap-2 text-[#D2E8A3]">
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      5. Verificación por WhatsApp
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    Atención personalizada humana para revisar tu diseño, confirmación de talla y datos antes del envío.
                  </p>
                </div>

                {/* 6. Garantía Total */}
                <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0A0A0A] border-white/5 text-gray-300'
                }`}>
                  <div className="flex items-center gap-2 text-[#D2E8A3]">
                    <Award className="w-4 h-4 flex-shrink-0" />
                    <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      6. Garantía de Satisfacción
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    Reemplazo o reembolso inmediato ante cualquier falla de fábrica o problemas en el estampado.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Action WhatsApp Button */}
      <FloatingWhatsAppWidget />

      {/* Floating Dock Navigation Menu */}
      <FloatingDock
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        cartCount={cart.reduce((a, c) => a + c.quantity, 0)}
        favoritesCount={favorites.length}
        themeMode={themeMode}
      />

      {/* User Profile Overlay Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        themeMode={themeMode}
        onSelectTheme={handleSelectTheme}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Product Detail & Customizer Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          themeMode={themeMode}
        />
      )}

      {/* Cart Overlay Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        userProfile={userProfile}
        themeMode={themeMode}
      />

      {/* Favorites Overlay Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={toggleFavorite}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Custom Idea Modal */}
      {isCustomIdeaOpen && (
        <div
          onClick={() => setIsCustomIdeaOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg glass-card rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-8 bg-[#11130F] space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setIsCustomIdeaOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D2E8A3]/10 text-[#D2E8A3] text-xs font-mono">
                <Tag className="w-3.5 h-3.5" />
                <span>COTIZACIÓN DE DISEÑO PERSONALIZADO</span>
              </div>
              <h3 className="font-display text-xl font-black text-white uppercase">
                ¿Tienes una idea en mente?
              </h3>
              <p className="text-xs text-gray-400">
                Escríbenos tu idea, logo o frase y te ayudaremos a plasmarlo en polos streetwear o vasos/tazas sublimadas.
              </p>
            </div>

            <form onSubmit={handleSendCustomIdea} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  Tipo de Producto:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomIdeaType('polo')}
                    className={`p-2 rounded-xl text-xs font-bold border ${
                      customIdeaType === 'polo'
                        ? 'bg-[#D2E8A3] text-[#0A0A0A] border-[#D2E8A3]'
                        : 'bg-[#161814] text-gray-300 border-white/10'
                    }`}
                  >
                    👕 Polo Streetwear
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomIdeaType('vaso')}
                    className={`p-2 rounded-xl text-xs font-bold border ${
                      customIdeaType === 'vaso'
                        ? 'bg-[#D2E8A3] text-[#0A0A0A] border-[#D2E8A3]'
                        : 'bg-[#161814] text-gray-300 border-white/10'
                    }`}
                  >
                    ☕ Vaso/Taza
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomIdeaType('otro')}
                    className={`p-2 rounded-xl text-xs font-bold border ${
                      customIdeaType === 'otro'
                        ? 'bg-[#D2E8A3] text-[#0A0A0A] border-[#D2E8A3]'
                        : 'bg-[#161814] text-gray-300 border-white/10'
                    }`}
                  >
                    ⚡ Otro
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  Describe tu idea o mensaje:
                </label>
                <textarea
                  required
                  rows={4}
                  value={customIdeaText}
                  onChange={(e) => setCustomIdeaText(e.target.value)}
                  placeholder="Ej: Quiero un polo oversized negro con la ilustración de una calavera en la espalda y mi apodo 'Vektor' en la manga derecha..."
                  className="w-full bg-[#161814] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D2E8A3]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>COTIZAR IDEA POR WHATSAPP</span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

