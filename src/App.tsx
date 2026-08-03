import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FloatingDock } from './components/FloatingDock';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { ProductionBadgeBar } from './components/ProductionBadgeBar';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { SocialQuickBar, FloatingWhatsAppWidget } from './components/SocialQuickBar';
import { AdminPanel } from './components/AdminPanel';
import { TermsAndPrivacy } from './components/TermsAndPrivacy';

import { PRODUCTS as PRODUCTS_STATIC, CATEGORIES as CATEGORIES_STATIC, loadProductsFromSupabase } from './data/products';
import {
  syncFavoritesToSupabase,
  syncCartStateToSupabase,
  syncCartToSupabase,
  syncProfileToSupabase,
  syncGoogleUserToSupabase,
  syncCustomIdeaToSupabase,
  loadCategoriesFromSupabase,
} from './lib/supabase-data';
import { loadConfig, reloadConfig, cfg } from './lib/config';
import { supabase } from './lib/supabase';
import { generateOrderImage } from './lib/generateOrderImage';
import { sanitize } from './lib/sanitize';
import { Product, CartItem, NavigationTab, Category, ThemeMode, UserProfileData, GoogleUser } from './types';
import {
  Tag,
  MessageCircle,
  SlidersHorizontal,
  Shirt,
  Coffee,
  ArrowUpDown,
  Grid,
  Heart,
  ShoppingBag,
  User,
  Trash2,
  CheckCircle2,
  Copy,
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
  Minus,
  Globe,
  Package,
  Store,
} from 'lucide-react';

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

  // Config state
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    loadProductsFromSupabase().then(setProducts);
    loadCategoriesFromSupabase().then((cats) => {
      if (cats.length > 0) setCategories(cats);
    });
    loadConfig().then(() => setConfigLoaded(true));
  }, []);

  // Interactive Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCustomIdeaOpen, setIsCustomIdeaOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [termsTab, setTermsTab] = useState<'privacy' | 'terms'>('privacy');
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

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
    syncCartStateToSupabase(cart, userProfile, deliveryType, googleUser?.id);
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

  // Google auth removed

  useEffect(() => {
    if (googleUser) {
      localStorage.setItem('lumin_google_user', JSON.stringify(googleUser));
    } else {
      localStorage.removeItem('lumin_google_user');
    }
  }, [googleUser]);

  // Poll order statuses every 15 seconds
  useEffect(() => {
    if (!supabase) return;
    const pollOrders = async () => {
      try {
        let identifier = googleUser?.id;
        if (!identifier) {
          identifier = localStorage.getItem('lumin_anon_id') || '';
          if (!identifier) {
            identifier = 'anon-' + crypto.randomUUID();
            localStorage.setItem('lumin_anon_id', identifier);
          }
        }
        const { data } = await supabase.from('pedidos').select('id,estado,productos,cliente_nombre,total,created_at').eq('usuario_id', identifier).order('created_at', { ascending: false }).limit(10);
        if (data && data.length > 0) {
          const prev = prevOrderStatusesRef.current;
          data.forEach((order: any) => {
            if (prev[order.id] && prev[order.id] !== order.estado) {
              const labels: Record<string, string> = { pendiente: 'Pendiente', produccion: 'En Producción', enviado: 'Enviado', entregado: 'Entregado' };
              setOrderUpdateMsg(`Pedido #${order.id.slice(0, 8)}... → ${labels[order.estado] || order.estado}`);
              setTimeout(() => setOrderUpdateMsg(''), 5000);
            }
            prev[order.id] = order.estado;
          });
          setMyOrders(data);
        }
      } catch {}
    };
    pollOrders();
    const interval = setInterval(pollOrders, 15000);
    return () => clearInterval(interval);
  }, [googleUser?.id]);

  const handleGoogleLogin = useCallback((user: GoogleUser) => {
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
  }, []);

  const handleGoogleLogout = useCallback(() => {
    setGoogleUser(null);
  }, []);

  // Local state for full profile screen
  const [profileForm, setProfileForm] = useState<UserProfileData>(userProfile);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'envio' | 'recojo'>('envio');
  const [shippingZone, setShippingZone] = useState<'huamanga' | 'provincia' | 'internacional'>('huamanga');

  // Order status tracking
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [orderUpdateMsg, setOrderUpdateMsg] = useState('');
  const prevOrderStatusesRef = React.useRef<Record<string, string>>({});

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
  const handleSelectTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('lumin_theme_mode', mode);
  }, []);

  // Save user profile to localStorage
  const handleSaveProfile = useCallback((profile: UserProfileData) => {
    setUserProfile(profile);
    localStorage.setItem('lumin_user_profile', JSON.stringify(profile));
    syncProfileToSupabase(profile, themeMode, googleUser?.id);
  }, [themeMode, googleUser?.id]);

  const handleProfileScreenSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSaveProfile(profileForm);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 2500);
  }, [handleSaveProfile, profileForm]);

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
  const handleAddToCart = useCallback((item: CartItem) => {
    setCart((prev) => [...prev, item]);
  }, []);

  const handleUpdateQuantity = useCallback((cartItemId: string, delta: number) => {
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
  }, []);

  const handleRemoveItem = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Favorites operations
  const toggleFavorite = useCallback((product: Product) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  const favoriteIds = useMemo(() => new Set(favorites.map((p) => p.id)), [favorites]);

  // Tab navigation
  const handleTabChange = useCallback((tab: NavigationTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Helper: calculate unit price including size extra
  const getUnitPrice = (item: CartItem) => {
    const cupExtra = item.product.cupOptions?.types.find((t) => t.name === item.selectedCupType)?.extraPrice || 0;
    let sizeExtra = 0;
    if (item.selectedSize && item.product.apparelOptions) {
      const sizeObj = item.product.apparelOptions.sizes.find((s) => {
        const name = typeof s === 'string' ? s : s.name;
        return name === item.selectedSize;
      });
      if (sizeObj && typeof sizeObj !== 'string') sizeExtra = sizeObj.extraPrice;
    }
    return item.product.price + cupExtra + sizeExtra;
  };

  // Total cart calculation
  const cartItemCount = useMemo(() => cart.reduce((a, c) => a + c.quantity, 0), [cart]);

  const totalCartAmount = useMemo(() => {
    return cart.reduce((acc, item) => {
      return acc + getUnitPrice(item) * item.quantity;
    }, 0);
  }, [cart]);

  // Shipping cost
  const shippingCost = useMemo(() => deliveryType === 'recojo' ? 0 : (
    shippingZone === 'huamanga' ? parseFloat(cfg('shipping_price_huamanga', '0')) :
    shippingZone === 'provincia' ? parseFloat(cfg('shipping_price_provincia', '25')) :
    parseFloat(cfg('shipping_price_internacional', '80'))
  ), [deliveryType, shippingZone]);
  const grandTotal = totalCartAmount + shippingCost;

  // Form validation — name + address required for checkout
  const isCheckoutValid = useMemo(() => {
    const hasName = userProfile.name.trim().length > 0;
    const hasAddress = deliveryType === 'recojo' || userProfile.address.trim().length > 0;
    return hasName && hasAddress && cart.length > 0;
  }, [userProfile.name, userProfile.address, deliveryType, cart.length]);

  // Generate WhatsApp Message
  const buildWhatsAppMessage = useCallback(() => {
    const nameStr = userProfile.name.trim() || '';
    let msg = `${cfg('brand_whatsapp_msg', 'Hola LUMIN SHOP! Quisiera realizar el siguiente pedido:')}\n\n`;

    msg += `${cfg('whatsapp_contact_header', '*MIS DATOS DE CONTACTO:*')}\n`;
    msg += `${cfg('whatsapp_label_name', '*Nombre:*')} ${nameStr || cfg('whatsapp_fallback_name', 'Por indicar por chat')}\n`;
    if (userProfile.phone) msg += `${cfg('whatsapp_label_phone', '*Teléfono:*')} ${userProfile.phone}\n`;
    if (userProfile.dni) msg += `${cfg('whatsapp_label_dni', '*DNI:*')} ${userProfile.dni}\n`;
    
    if (deliveryType === 'envio') {
      const zoneLabels: Record<string, string> = { huamanga: 'Ayacucho / Huamanga', provincia: 'Provincia', internacional: 'Internacional' };
      msg += `${cfg('whatsapp_delivery_home', '*Modalidad:* Envio a Domicilio')}\n`;
      msg += `*Zona:* ${zoneLabels[shippingZone] || 'Provincia'}\n`;
      msg += `${cfg('whatsapp_label_address', '*Direccion:*')} ${userProfile.address || cfg('whatsapp_fallback_address', 'Por indicar por chat')}\n`;
      msg += `*Costo de envio:* S/ ${shippingCost.toFixed(2)}\n`;
    } else {
      msg += `${cfg('whatsapp_delivery_pickup', '*Modalidad:* Recojo en Tienda')}\n`;
    }

    msg += `\n${cfg('whatsapp_order_header', '*DETALLE DE MI PEDIDO*')} (${cart.reduce((sum, i) => sum + i.quantity, 0)} items):\n`;

    cart.forEach((item, index) => {
      const unitPrice = getUnitPrice(item);
      const itemTotal = unitPrice * item.quantity;

      msg += `\n*${index + 1}. ${item.product.name}* (Cant: ${item.quantity})\n`;
      if (item.selectedSize) msg += `   ${cfg('whatsapp_item_size', 'Talla:')} ${item.selectedSize}\n`;
      if (item.selectedFit) msg += `   ${cfg('whatsapp_item_fit', 'Fit/Corte:')} ${item.selectedFit}\n`;
      if (item.selectedColor) msg += `   ${cfg('whatsapp_item_color', 'Color:')} ${item.selectedColor.name}\n`;
      if (item.selectedCupType) msg += `   ${cfg('whatsapp_item_type', 'Tipo:')} ${item.selectedCupType}\n`;
      if (item.selectedFinish) msg += `   ${cfg('whatsapp_item_finish', 'Acabado:')} ${item.selectedFinish}\n`;
      if (item.customText) msg += `   ${cfg('whatsapp_item_custom_text', 'Texto Personalizado:')} "${item.customText}"\n`;
      msg += `   ${cfg('whatsapp_item_subtotal', 'Subtotal:')} S/ ${itemTotal.toFixed(2)}\n`;
    });

    if (shippingCost > 0) {
      msg += `\n*Costo de Envio:* S/ ${shippingCost.toFixed(2)}\n`;
    }
    msg += `\n*${cfg('whatsapp_order_total', 'TOTAL DE MI ORDEN:')} S/ ${grandTotal.toFixed(2)}*\n\n`;
    msg += cfg('whatsapp_order_closing', 'Por favor confírmenme los datos de pago y el tiempo de entrega. ¡Muchas gracias!');

    return msg;
  }, [cart, userProfile, deliveryType, shippingZone, shippingCost, grandTotal]);

  const handleSendWhatsAppOrder = useCallback(async () => {
    syncCartToSupabase(cart, userProfile, deliveryType, googleUser?.id, deliveryType === 'envio' ? shippingZone : undefined, deliveryType === 'envio' ? shippingCost : 0);

    // Strip emoji from config to avoid ? encoding in wa.me URLs
    const rawMsg = cfg('brand_whatsapp_msg', 'Hola LUMIN! Quisiera realizar el siguiente pedido:');
    const msg = rawMsg.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{2640}\u{2642}\u{2695}\u{2696}\u{2708}\u{2764}\u{FE0F}]/gu, '').trim();

    // Generate order image and upload to Supabase Storage
    let imageUrl = '';
    try {
      const blob = await generateOrderImage(cart, userProfile, deliveryType, grandTotal, getUnitPrice, shippingZone, shippingCost);
      if (supabase) {
        const fileName = `pedidos/pedido-${Date.now()}.jpg`;
        const { error } = await supabase.storage.from('media').upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });
        if (!error) {
          const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);
          if (urlData?.publicUrl) imageUrl = urlData.publicUrl;
        }
      }
    } catch {}

    // Always open WhatsApp directly to shop number
    const phone = cfg('brand_phone_raw', '51993365099');
    let fullMsg = msg;
    if (imageUrl) fullMsg += `\n\nAdjunto imagen del pedido:\n${imageUrl}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(fullMsg)}`, '_blank');
  }, [cart, userProfile, deliveryType, googleUser?.id, shippingZone, shippingCost, grandTotal]);

  const handleCopyOrderSummary = useCallback(() => {
    const message = buildWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2500);
  }, [buildWhatsAppMessage]);

  const handleCopyYapePhone = useCallback(() => {
    navigator.clipboard.writeText(cfg('brand_phone_raw', '993365099').replace(/^51/, ''));
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  }, []);

  // Custom idea submit to WhatsApp
  const handleSendCustomIdea = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!customIdeaText.trim()) return;

    let text = `${cfg('brand_whatsapp_idea', 'CONSULTA DE IDEA PERSONALIZADA LUMIN SHOP')}\n`;
    if (userProfile.name) text += `${cfg('whatsapp_idea_client', '*Cliente:*')} ${userProfile.name}\n`;
    if (userProfile.phone) text += `${cfg('whatsapp_idea_phone', '*Telefono:*')} ${userProfile.phone}\n`;
    text += `${cfg('whatsapp_idea_type', '*Tipo:*')} ${customIdeaType === 'polo' ? cfg('whatsapp_idea_type_polo', 'Polo Sublimado') : customIdeaType === 'vaso' ? cfg('whatsapp_idea_type_cup', 'Vaso / Taza Sublimada') : cfg('whatsapp_idea_type_other', 'Placa de Aluminio / Otro')}\n`;
    text += `${cfg('whatsapp_idea_detail', '*Detalle de mi idea:*')} ${customIdeaText.trim()}\n`;
    text += `\n${cfg('whatsapp_idea_closing', 'Quisiera cotización y asesoría de diseño por favor.')}`;

    syncCustomIdeaToSupabase(
      customIdeaType,
      customIdeaText.trim(),
      userProfile.email || '',
      googleUser?.id
    );

    window.open(`https://wa.me/${cfg('brand_phone_raw', '51993365099')}?text=${encodeURIComponent(text)}`, '_blank');
    setIsCustomIdeaOpen(false);
    setCustomIdeaText('');
  }, [customIdeaText, customIdeaType, userProfile, googleUser?.id]);

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
        onOpenGoogleAuth={() => {}}
        showSearch={activeTab === 'catalog'}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onAdminActivate={() => setIsAdminOpen(true)}
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
              heroMedia1Url={cfg('hero_media_1_url', '') || undefined}
              heroMedia2Url={cfg('hero_media_2_url', '') || undefined}
            />

            {/* Direct WhatsApp & Social Media Quick Access Bar */}
            <SocialQuickBar themeMode={themeMode} />

            {/* Brand Description Section - LUMIN SHOP */}
            <section className={`p-6 sm:p-8 rounded-3xl border space-y-4 relative overflow-hidden ${
              isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'glass-card border-white/10 text-white'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-[#D2E8A3]/20 text-[#D2E8A3]'
                  }`}>
                    {cfg('section_about_label', 'Sobre')} {cfg('brand_name', 'LUMIN SHOP')}
                  </span>
                  <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{cfg('brand_instagram', '@.lumin.shop')}</span>
                </div>
                <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{cfg('brand_location', '📍 Ayacucho, Perú • Envíos a Nivel Nacional')}</span>
              </div>

              <h2 className={`font-display text-2xl sm:text-3xl font-extrabold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {cfg('section_about_subtitle', 'Ropa Urbana Streetwear & Sublimación de Alta Temperatura')}
              </h2>

              <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-700' : 'text-gray-300'}`}
                dangerouslySetInnerHTML={{ __html: sanitize(cfg('section_about_text', 'LUMIN SHOP es una marca independiente peruana dedicada al diseño y confección de streetwear exclusivo y artículos gráficos. Nos especializamos en polos <strong>Oversized & Boxy Fit</strong> producidos en algodón reactivo de 240g (Heavyweight) de máxima durabilidad, además de <strong>Vasos Frosted Glass de 16oz</strong> y <strong>Tazas Térmicas de 11oz</strong> sublimadas térmicamente a 200°C. Cada prenda y producto se elabora 100% bajo pedido con acabado profesional.')) }}
              />

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleTabChange('catalog')}
                  className="px-5 py-2.5 rounded-full bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs sm:text-sm hover:bg-[#b8d682] transition-all flex items-center gap-2 shadow-lg"
                >
                  <Grid className="w-4 h-4" />
                  <span>{cfg('section_about_cta_cat', 'Explorar Catálogo de Productos')}</span>
                </button>
                <button
                  onClick={() => setIsCustomIdeaOpen(true)}
                  className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm transition-all border flex items-center gap-2 ${
                    isLight ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                  }`}
                >
                  <Tag className="w-4 h-4 text-[#D2E8A3]" />
                  <span>{cfg('section_about_cta_idea', 'Cotizar Idea Personalizada')}</span>
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
                    {cfg('section_featured_title', '🔥 SELECCIÓN DESTACADA DROP 04')}
                  </span>
                  <h3 className={`font-display text-xl sm:text-2xl font-extrabold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {cfg('section_featured_sub', 'Nuestros Más Pedidos')}
                  </h3>
                </div>
                <button
                  onClick={() => handleTabChange('catalog')}
                  className={`text-xs font-bold hover:underline flex items-center gap-1 ${isLight ? 'text-lime-700' : 'text-[#D2E8A3]'}`}
                >
                  {cfg('section_featured_view_all', 'Ver Catálogo Completo')} ({products.length}) →
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {products.slice(0, 4).map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    index={idx}
                    product={product}
                    isFavorite={favoriteIds.has(product.id)}
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
                    {cfg('catalog_subtitle', 'PANTALLA DE CATÁLOGO & PRODUCTOS')}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white">
                  {cfg('catalog_title', 'COLECCIÓN DISPONIBLE')}
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
                <span className={`${isLight ? 'text-slate-700' : 'text-gray-300'} font-bold hidden sm:inline`}>{cfg('catalog_filter_technique', 'Técnica:')}</span>

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
                  {cfg('catalog_filter_all', 'Todas')}
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
                  <span>{cfg('catalog_filter_textile', 'Textil HD')}</span>
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
                  <span>{cfg('catalog_filter_sublimation', 'Sublimado 200°C')}</span>
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
                  <option value="featured">{cfg('catalog_sort_featured', 'Destacados Drop')}</option>
                  <option value="price-asc">{cfg('catalog_sort_price_asc', 'Precio: Menor a Mayor')}</option>
                  <option value="price-desc">{cfg('catalog_sort_price_desc', 'Precio: Mayor a Menor')}</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center space-y-3 glass-card rounded-3xl p-8 border border-white/10">
                <Tag className="w-12 h-12 text-gray-600 mx-auto" />
                <p className="text-gray-400 text-sm">
                  {cfg('catalog_empty', 'No se encontraron productos con los filtros seleccionados.')}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedTechnique('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-full bg-[#D2E8A3] text-[#0A0A0A] font-bold text-xs"
                >
                  {cfg('catalog_reset_filters', 'Restablecer Filtros')}
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
                    isFavorite={favoriteIds.has(product.id)}
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
                    {cfg('favorites_subtitle', 'PANTALLA DE MIS FAVORITOS')}
                  </span>
                </div>
                <h2 className={`font-display text-2xl sm:text-3xl font-extrabold uppercase ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {cfg('favorites_title', 'PRODUCTOS GUARDADOS')} ({favorites.length})
                </h2>
              </div>

              {favorites.length > 0 && (
                <button
                  onClick={() => setFavorites([])}
                  className={`text-xs underline ${
                    isLight ? 'text-slate-500 hover:text-rose-600' : 'text-gray-400 hover:text-rose-400'
                  }`}
                >
                  {cfg('favorites_clear', 'Vaciar Favoritos')}
                </button>
              )}
            </div>

            {favorites.length === 0 ? (
              <div className={`py-16 text-center space-y-4 rounded-3xl p-8 border max-w-xl mx-auto ${
                isLight ? 'bg-white border-slate-300 text-slate-900 shadow-md' : 'glass-card border-white/10 text-white'
              }`}>
                <Heart className={`w-16 h-16 stroke-1 mx-auto ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                <h3 className={`font-display text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {cfg('favorites_empty_title', 'Aún no tienes productos guardados')}
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  {cfg('favorites_empty_desc', 'Explora el catálogo y presiona el corazón en los polos o vasos que más te gusten para guardarlos aquí.')}
                </p>
                <button
                  onClick={() => handleTabChange('catalog')}
                  className="px-6 py-3 rounded-full bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs shadow-lg inline-flex items-center gap-2 hover:bg-[#c2e088] transition-all"
                >
                  <Grid className="w-4 h-4" />
                  <span>{cfg('favorites_empty_cta', 'EXPLORAR CATÁLOGO')}</span>
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
                    {cfg('cart_subtitle', 'PANTALLA DE PEDIDO & PROCESAMIENTO')}
                  </span>
                </div>
                <h2 className={`font-display text-2xl sm:text-3xl font-extrabold uppercase ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {cfg('cart_title', 'MI PEDIDO LUMIN')} ({cart.length})
                </h2>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className={`text-xs underline ${
                    isLight ? 'text-slate-500 hover:text-red-600' : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  {cfg('cart_clear', 'Vaciar Carrito')}
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className={`py-16 text-center space-y-4 rounded-3xl p-8 border max-w-xl mx-auto ${
                isLight ? 'bg-white border-slate-300 text-slate-900 shadow-md' : 'glass-card border-white/10 text-white'
              }`}>
                <ShoppingBag className={`w-16 h-16 stroke-1 mx-auto ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                <h3 className={`font-display text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {cfg('cart_empty_title', 'Tu pedido está vacío por el momento')}
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  {cfg('cart_empty_desc', 'Agrega polos streetwear o vasos/tazas con tu personalización preferida para generar tu orden.')}
                </p>
                <button
                  onClick={() => handleTabChange('catalog')}
                  className="px-6 py-3 rounded-full bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs shadow-lg inline-flex items-center gap-2 hover:bg-[#c2e088] transition-all"
                >
                  <Grid className="w-4 h-4" />
                  <span>{cfg('cart_empty_cta', 'IR AL CATÁLOGO')}</span>
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
                      <span>{cfg('cart_process_title', 'PROCESO DE FABRICACIÓN BAJO PEDIDO:')}</span>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                      {cfg('cart_process_desc', 'Envías la orden a WhatsApp, iniciamos producción digital/artesanal (24-48h) y despachamos a tu domicilio.')}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {cart.map((item) => {
                      const itemUnitPrice = getUnitPrice(item);
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
                                  {cfg('cart_item_size', 'Talla:')} {item.selectedSize}
                                </span>
                              )}
                              {item.selectedFit && (
                                <span className={`px-2 py-0.5 rounded border font-semibold ${
                                  isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/10 border-white/10 text-gray-300'
                                }`}>
                                  {cfg('cart_item_fit', 'Fit:')} {item.selectedFit}
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
                                {cfg('cart_item_custom_text', 'Texto personalizado:')} "{item.customText}"
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
                          <h4 className="text-xs font-bold text-white">{cfg('cart_payment_title', 'Pago Yape / Plin Directo')}</h4>
                          <p className="text-[10px] text-purple-200">{cfg('cart_payment_holder', 'Titular: Oscar Daniel (LUMIN SHOP)')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-white/10">
                        <Smartphone className="w-3.5 h-3.5 text-[#00D2B5]" />
                        <span className="font-mono text-xs font-black text-white">{cfg('brand_phone', '993 365 099')}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCopyYapePhone}
                      className="w-full py-2 rounded-xl bg-[#742284] hover:bg-[#8A2B9C] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      {copiedPhone ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span>{cfg('cart_phone_copied', '¡Número 993365099 Copiado!')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#00D2B5]" />
                          <span>{cfg('cart_phone_copy', 'Copiar Número Yape / Plin')}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Contact Info Overview */}
                  <div className={`p-5 rounded-3xl border space-y-3 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10 text-white'
                  }`}>
                    <h4 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
                      isLight ? 'text-lime-800' : 'text-[#D2E8A3]'
                    }`}>
                      <Package className="w-3.5 h-3.5" />
                      {cfg('cart_shipping_title', 'Datos para el envío:')}
                      <span className="text-[9px] font-normal opacity-60 normal-case">(obligatorio)</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className={`text-[10px] uppercase block font-bold mb-1 ${
                          isLight ? 'text-slate-600' : 'text-gray-400'
                        }`}>{cfg('cart_form_name_label', 'Nombre Completo:')} <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                          placeholder={cfg('cart_form_name_placeholder', 'Tu nombre...')}
                          required
                          className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${
                            isLight ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-[#0A0A0A] border-white/10 text-white placeholder-gray-500'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`text-[10px] uppercase block font-bold mb-1 ${
                          isLight ? 'text-slate-600' : 'text-gray-400'
                        }`}>{cfg('cart_form_address_label', 'Dirección de Entrega:')} {deliveryType === 'envio' && <span className="text-red-400">*</span>}</label>
                        <input
                          type="text"
                          value={userProfile.address}
                          onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                          placeholder={cfg('cart_form_address_placeholder', 'Av, Calle, Dpto y Referencia...')}
                          required={deliveryType === 'envio'}
                          className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border ${
                            isLight ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-[#0A0A0A] border-white/10 text-white placeholder-gray-500'
                          }`}
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => { setDeliveryType('envio'); }}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            deliveryType === 'envio'
                              ? isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-[#D2E8A3] text-[#0A0A0A] border-[#D2E8A3]'
                              : isLight ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' : 'bg-black/30 text-gray-400 border-white/10'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{cfg('cart_delivery_home', 'Envío a Domicilio')}</span>
                        </button>
                        <button
                          onClick={() => setDeliveryType('recojo')}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            deliveryType === 'recojo'
                              ? isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-[#D2E8A3] text-[#0A0A0A] border-[#D2E8A3]'
                              : isLight ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' : 'bg-black/30 text-gray-400 border-white/10'
                          }`}
                        >
                          <Store className="w-3.5 h-3.5" />
                          <span>{cfg('cart_delivery_pickup', 'Recojo en Tienda')}</span>
                        </button>
                      </div>

                      {/* Shipping Zone Selector */}
                      {deliveryType === 'envio' && (
                        <div className="space-y-2 pt-2">
                          <label className={`text-[10px] uppercase block font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                            Zona de Envío:
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { key: 'huamanga' as const, label: 'Ayacucho', icon: MapPin, price: cfg('shipping_price_huamanga', '0') },
                              { key: 'provincia' as const, label: 'Provincia', icon: Truck, price: cfg('shipping_price_provincia', '25') },
                              { key: 'internacional' as const, label: 'Internacional', icon: Globe, price: cfg('shipping_price_internacional', '80') },
                            ].map(zone => (
                              <button
                                key={zone.key}
                                onClick={() => setShippingZone(zone.key)}
                                className={`py-2.5 px-2 rounded-xl text-[10px] font-bold border transition-all text-center flex flex-col items-center gap-1 ${
                                  shippingZone === zone.key
                                    ? isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-[#D2E8A3]/20 text-[#D2E8A3] border-[#D2E8A3]/50'
                                    : isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-black/30 text-gray-400 border-white/10'
                                }`}
                              >
                                <zone.icon className={`w-4 h-4 ${shippingZone === zone.key ? 'text-[#D2E8A3]' : 'text-gray-400'}`} />
                                <span>{zone.label}</span>
                                <span className="text-[9px] opacity-70">{zone.price === '0' ? 'GRATIS' : `S/ ${zone.price}`}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary & Buttons */}
                  <div className={`p-5 rounded-3xl border space-y-4 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#0A0A0A] border-white/10 text-white'
                  }`}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className={isLight ? 'text-slate-600 font-bold' : 'text-gray-400'}>Subtotal:</span>
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>S/ {totalCartAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs">
                        <span className={isLight ? 'text-slate-600 font-bold' : 'text-gray-400'}>
                          Envío ({deliveryType === 'recojo' ? 'Recojo' : shippingZone === 'huamanga' ? 'Ayacucho' : shippingZone === 'provincia' ? 'Provincia' : 'Internacional'}):
                        </span>
                        <span className={`font-bold ${shippingCost === 0 ? 'text-green-500' : isLight ? 'text-slate-900' : 'text-white'}`}>
                          {shippingCost === 0 ? 'GRATIS' : `S/ ${shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                      <div className={`border-t pt-2 flex justify-between items-baseline ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                        <span className={`text-xs font-mono uppercase font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                          {cfg('cart_total_label', 'Total a Pagar:')}
                        </span>
                        <span className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-[#D2E8A3]'}`}>
                          S/ {grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Terms consent checkbox */}
                      <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        acceptedTerms
                          ? isLight ? 'bg-lime-50 border-lime-300' : 'bg-[#D2E8A3]/5 border-[#D2E8A3]/30'
                          : isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}>
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-2 accent-[#D2E8A3]"
                        />
                        <span className={`text-[11px] leading-tight ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                          {cfg('checkout_consent_text', 'Acepto la Política de Privacidad y los Términos y Condiciones de LUMIN SHOP. Entiendo que mis datos personales serán utilizados únicamente para procesar mi pedido.')}{' '}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setTermsTab('privacy'); setIsTermsOpen(true); }}
                            className={`font-bold underline ${isLight ? 'text-lime-700 hover:text-lime-900' : 'text-[#D2E8A3] hover:text-[#c2e088]'}`}
                          >
                            {cfg('checkout_consent_privacy_link', 'Política de Privacidad')}
                          </button>
                          {' y '}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setTermsTab('terms'); setIsTermsOpen(true); }}
                            className={`font-bold underline ${isLight ? 'text-lime-700 hover:text-lime-900' : 'text-[#D2E8A3] hover:text-[#c2e088]'}`}
                          >
                            {cfg('checkout_consent_terms_link', 'Términos y Condiciones')}
                          </button>
                        </span>
                      </label>

                      <button
                        onClick={handleSendWhatsAppOrder}
                        disabled={!acceptedTerms || !isCheckoutValid}
                        className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-xl active:scale-98 ${
                          acceptedTerms && isCheckoutValid
                            ? 'bg-green-500 hover:bg-green-600 text-black shadow-green-500/20'
                            : isLight ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-white/10 text-gray-600 cursor-not-allowed shadow-none'
                        }`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{cfg('cart_checkout_whatsapp', 'ENVIAR PEDIDO POR WHATSAPP')}</span>
                      </button>

                      {!isCheckoutValid && cart.length > 0 && (
                        <p className={`text-[10px] text-center ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                          {!userProfile.name.trim() ? 'Ingresa tu nombre para continuar' : 'Ingresa tu dirección de entrega'}
                        </p>
                      )}

                      <button
                        onClick={handleCopyOrderSummary}
                        className={`w-full py-3 rounded-2xl border font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                          isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
                        }`}
                      >
                        {copiedOrder ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 font-bold">{cfg('cart_order_copied', '¡Texto de Orden Copiado!')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>{cfg('cart_copy_order', 'Copiar Texto de Pedido Completo')}</span>
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
                    {cfg('profile_subtitle', 'PANTALLA DE PERFIL & CONFIGURACIÓN "YO"')}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white">
                  {cfg('profile_title', 'MI CUENTA & PREFERENCIAS')}
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
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-400">{cfg('profile_stat_activity', 'Actividad')}</span>
                  <div className="p-1.5 rounded-lg bg-[#D2E8A3]/10 text-[#D2E8A3]">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className={`text-2xl font-black font-display tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>8</span>
                  <p className="text-[10px] text-gray-400 font-medium">{cfg('profile_stat_products_viewed', 'Productos vistos')}</p>
                </div>
              </div>

              {/* Stat 2: Favoritos */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${
                isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10 text-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-400">{cfg('profile_stat_collection', 'Colección')}</span>
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                    <Heart className="w-4 h-4 fill-rose-400/20" />
                  </div>
                </div>
                <div>
                  <span className={`text-2xl font-black font-display tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{favorites.length}</span>
                  <p className="text-[10px] text-gray-400 font-medium">{cfg('profile_stat_favorites', 'Favoritos')}</p>
                </div>
              </div>

              {/* Stat 3: Pedidos */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 transition-all ${
                isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10 text-white'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-400">{cfg('profile_stat_history', 'Historial')}</span>
                  <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className={`text-2xl font-black font-display tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{cart.length > 0 ? cart.length : 3}</span>
                  <p className="text-[10px] text-gray-400 font-medium">{cfg('profile_stat_orders', 'Pedidos')}</p>
                </div>
              </div>
            </div>

            {/* Order Status Notification */}
            {orderUpdateMsg && (
              <div className="p-3 rounded-2xl bg-[#D2E8A3]/10 border border-[#D2E8A3]/30 text-[#D2E8A3] text-xs font-bold text-center animate-pulse">
                {orderUpdateMsg}
              </div>
            )}

            {/* My Orders */}
            {myOrders.length > 0 && (
              <section className={`p-6 rounded-3xl border space-y-4 ${
                isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10'
              }`}>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#D2E8A3]" />
                  <h3 className="font-display text-lg font-bold uppercase">
                    {cfg('profile_my_orders_title', 'Mis Pedidos')}
                  </h3>
                </div>
                <div className="space-y-3">
                  {myOrders.map((order: any) => {
                    const statusColors: Record<string, string> = {
                      pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                      produccion: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                      enviado: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                      entregado: 'bg-green-500/20 text-green-400 border-green-500/30',
                    };
                    const statusLabels: Record<string, string> = {
                      pendiente: 'Pendiente', produccion: 'En Producción',
                      enviado: 'Enviado', entregado: 'Entregado',
                    };
                    const items = order.productos || [];
                    return (
                      <div key={order.id} className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0F110D] border-white/10'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono text-gray-500">#{order.id.slice(0, 8)}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[order.estado] || 'bg-white/10 text-gray-400'}`}>
                                {statusLabels[order.estado] || order.estado}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              {items.map((item: any, i: number) => (
                                <p key={i} className="text-[11px] text-gray-400">
                                  {item.product_name} x{item.quantity}
                                  {item.selected_size && ` • ${item.selected_size}`}
                                </p>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleDateString('es-PE') : ''}</p>
                          </div>
                          <p className="text-sm font-extrabold text-[#D2E8A3]">S/ {order.total?.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Section 1: Appearance Selector */}
            <section className={`p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10'
            }`}>
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-[#D2E8A3]" />
                <h3 className="font-display text-lg font-bold uppercase">
                  {cfg('profile_section_appearance_title', '1. Apariencia Visual del Sitio Web')}
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
                    <span className="block font-bold text-sm text-white">{cfg('profile_theme_dark', 'Oscuro (Clásico)')}</span>
                    <span className="text-[11px] text-gray-400 font-mono">{cfg('profile_theme_dark_desc', 'Verde Neón & Negro')}</span>
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
                    <span className="block font-bold text-sm text-white">{cfg('profile_theme_amoled', 'AMOLED')}</span>
                    <span className="text-[11px] text-gray-400 font-mono">{cfg('profile_theme_amoled_desc', 'Negro Absoluto #000')}</span>
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
                    <span className="block font-bold text-sm text-slate-900">{cfg('profile_theme_light', 'Modo Claro')}</span>
                    <span className="text-[11px] text-slate-600 font-mono">{cfg('profile_theme_light_desc', 'Fondo Claro Limpio')}</span>
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
                  {cfg('profile_section_data_title', '2. Mis Datos para Autocompletar Pedidos')}
                </h3>
              </div>

              <form onSubmit={handleProfileScreenSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">{cfg('profile_form_name_label', 'Nombre y Apellido')}</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder={cfg('profile_form_name_placeholder', 'Ej. Carlos Mendoza')}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none border ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">{cfg('profile_form_phone_label', 'WhatsApp / Teléfono')}</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder={cfg('profile_form_phone_placeholder', 'Ej. 987654321')}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none border ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">{cfg('profile_form_dni_label', 'DNI / RUC (Comprobante)')}</label>
                    <input
                      type="text"
                      value={profileForm.dni}
                      onChange={(e) => setProfileForm({ ...profileForm, dni: e.target.value })}
                      placeholder={cfg('profile_form_dni_placeholder', 'Ej. 72839401')}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none border ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">{cfg('profile_form_address_label', 'Dirección de Entrega')}</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder={cfg('profile_form_address_placeholder', 'Av, Calle y Distrito...')}
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
                      <span>{cfg('profile_save_success', '¡INFORMACIÓN GUARDADA CON ÉXITO!')}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{cfg('profile_save_button', 'GUARDAR MI INFORMACIÓN EN MI NAVEGADOR')}</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Section 3: Conceptos Clave del Servicio LUMIN SHOP */}
            <section className={`p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10 text-gray-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#D2E8A3]">
                  <HelpCircle className="w-5 h-5" />
                  <h3 className={`font-display text-lg font-extrabold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {cfg('profile_section_concepts_title', '3. Conceptos Clave del Servicio LUMIN SHOP')}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                  {cfg('profile_concepts_sub', 'Garantía & Calidad 100%')}
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
                      {cfg('concept_1_title', '1. Elaboración Bajo Pedido')}
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    {cfg('concept_1_desc', 'Producción y sublimación personalizada en 24 a 48 hrs hábiles antes de despachar.')}
                  </p>
                </div>

                {/* 2. Pagos Yape / Plin */}
                <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0A0A0A] border-white/5 text-gray-300'
                }`}>
                  <div className="flex items-center gap-2 text-[#D2E8A3]">
                    <CreditCard className="w-4 h-4 flex-shrink-0" />
                    <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {cfg('concept_2_title', '2. Pagos Yape / Plin / Bancos')}
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    {cfg('concept_2_desc', 'Pago directo al 993 365 099 a nombre de Oscar Daniel (LUMIN SHOP) o BCP / Interbank.')}
                  </p>
                </div>

                {/* 3. Envíos Gratis */}
                <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0A0A0A] border-white/5 text-gray-300'
                }`}>
                  <div className="flex items-center gap-2 text-[#D2E8A3]">
                    <Truck className="w-4 h-4 flex-shrink-0" />
                    <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {cfg('concept_3_title', '3. Envíos Gratis (S/ 200+)')}
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    {cfg('concept_3_desc', 'Envío sin costo en compras mayores a S/ 200 vía Olva Courier, Shalom o Express.')}
                  </p>
                </div>

                {/* 4. Telas & Sublimación */}
                <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0A0A0A] border-white/5 text-gray-300'
                }`}>
                  <div className="flex items-center gap-2 text-[#D2E8A3]">
                    <Shirt className="w-4 h-4 flex-shrink-0" />
                    <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {cfg('concept_4_title', '4. Algodón Reactivo & Sublimado HD')}
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    {cfg('concept_4_desc', 'Telas 24/1 de alto gramaje y sublimación térmica 1200 DPI que no se despinta ni se agrieta.')}
                  </p>
                </div>

                {/* 5. Asesoría WhatsApp */}
                <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0A0A0A] border-white/5 text-gray-300'
                }`}>
                  <div className="flex items-center gap-2 text-[#D2E8A3]">
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {cfg('concept_5_title', '5. Verificación por WhatsApp')}
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    {cfg('concept_5_desc', 'Atención personalizada humana para revisar tu diseño, confirmación de talla y datos antes del envío.')}
                  </p>
                </div>

                {/* 6. Garantía Total */}
                <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0A0A0A] border-white/5 text-gray-300'
                }`}>
                  <div className="flex items-center gap-2 text-[#D2E8A3]">
                    <Award className="w-4 h-4 flex-shrink-0" />
                    <strong className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {cfg('concept_6_title', '6. Garantía de Satisfacción')}
                    </strong>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    {cfg('concept_6_desc', 'Reemplazo o reembolso inmediato ante cualquier falla de fábrica o problemas en el estampado.')}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => { setTermsTab('privacy'); setIsTermsOpen(true); }}
        onOpenTerms={() => { setTermsTab('terms'); setIsTermsOpen(true); }}
      />

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

      {/* Product Detail & Customizer Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          themeMode={themeMode}
        />
      )}

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
                <span>{cfg('custom_idea_subtitle', 'COTIZACIÓN DE PRODUCTO SUBLIMADO')}</span>
              </div>
              <h3 className="font-display text-xl font-black text-white uppercase">
                {cfg('custom_idea_title', '¿Tienes un diseño en mente?')}
              </h3>
              <p className="text-xs text-gray-400">
                {cfg('custom_idea_desc', 'Escríbenos tu idea, logo o frase y te ayudaremos a sublimarlo en vasos, tazas, polos o placas de aluminio.')}
              </p>
            </div>

            <form onSubmit={handleSendCustomIdea} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  {cfg('custom_idea_product_type', 'Tipo de Producto:')}
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
                    {cfg('custom_idea_type_polo', '👕 Polo Sublimado')}
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
                    {cfg('custom_idea_type_cup', '☕ Vaso/Taza')}
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
                    {cfg('custom_idea_type_other', '⚡ Otro')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                  {cfg('custom_idea_message_label', 'Describe tu idea o mensaje:')}
                </label>
                <textarea
                  required
                  rows={4}
                  value={customIdeaText}
                  onChange={(e) => setCustomIdeaText(e.target.value)}
                  placeholder={cfg('custom_idea_placeholder', "Ej: Quiero un polo oversized negro con la ilustración de una calavera en la espalda y mi apodo 'Vektor' en la manga derecha...")}
                  className="w-full bg-[#161814] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D2E8A3]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>{cfg('custom_idea_submit', 'COTIZAR IDEA POR WHATSAPP')}</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Hidden Admin Panel - Activated by 5 clicks on logo */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onConfigChange={() => { reloadConfig(); }}
      />

      {/* Terms & Privacy Modal */}
      <TermsAndPrivacy
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        themeMode={themeMode}
        initialTab={termsTab}
      />

    </div>
  );
}
