import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FloatingDock } from './components/FloatingDock';
import { HeroBanner } from './components/HeroBanner';
import { CampaignStrip } from './components/CampaignStrip';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { ProductionBadgeBar } from './components/ProductionBadgeBar';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { SocialQuickBar, FloatingWhatsAppWidget } from './components/SocialQuickBar';
import { AdminPanel } from './components/AdminPanel';
import { TermsAndPrivacy } from './components/TermsAndPrivacy';

import { CATEGORIES as CATEGORIES_STATIC, loadProductsFromSupabase } from './data/products';
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
import { applyPalette } from './lib/palette';
import { supabase } from './lib/supabase';
import { generateOrderImage } from './lib/generateOrderImage';
import { sanitize } from './lib/sanitize';
import { Product, CartItem, NavigationTab, Category, ThemeMode, UserProfileData, GoogleUser, CategoryUI, CategoryAttributeDef } from './types';
import {
  attributeValues,
  categoryKindOf,
  matchesAttributes,
  sortAttributeValues,
} from './lib/catalog';
import {
  Tag,
  MessageCircle,
  ArrowRight,
  Search,
  Heart,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  Copy,
  Smartphone,
  Save,
  Truck,
  Plus,
  Minus,
  Store,
} from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Products from Supabase (empty until loaded)
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [categories, setCategories] = useState<CategoryUI[]>(CATEGORIES_STATIC);

  // Config state
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configVersion, setConfigVersion] = useState(0);

  // Aplica paleta + campaña de temporada + espaciado (variables CSS --accent*, --on y clases de la maqueta)
  useEffect(() => {
    applyPalette(
      cfg('brand_palette', 'green'),
      cfg('season_active', 'none'),
      cfg('site_layout', 'compact'),
    );
  }, [configLoaded, configVersion]);

  useEffect(() => {
    Promise.all([
      loadProductsFromSupabase().then((p) => setProducts(p)),
      loadConfig(),
      loadCategoriesFromSupabase().then((cats) => {
        if (cats.length > 0) setCategories(cats);
      }),
    ]).then(() => { setConfigLoaded(true); setProductsLoaded(true); });

    const timeout = setTimeout(() => { setConfigLoaded(true); setProductsLoaded(true); }, 5000);
    return () => clearTimeout(timeout);
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

  // Cambio rápido de tema desde el topbar (sol/luna de la maqueta)
  const toggleQuickTheme = useCallback(() => {
    handleSelectTheme(themeMode === 'light' ? 'dark' : 'light');
  }, [themeMode, handleSelectTheme]);

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

  // Filtros rápidos por atributo (tallas, onzas, medidas u otros definidos
  // en el panel para cada categoría).
  useEffect(() => {
    setSelectedAttributes({});
  }, [selectedCategory]);

  const activeCategory = useMemo(
    () => categories.find((cat) => cat.id === selectedCategory),
    [categories, selectedCategory],
  );

  const activeAttributeDefs: CategoryAttributeDef[] = useMemo(() => {
    if (!activeCategory || activeCategory.id === 'all') return [];
    return activeCategory.atributos || [];
  }, [activeCategory]);

  const attributeGroups = useMemo(() => {
    if (!activeCategory || activeCategory.id === 'all') return [] as { def: CategoryAttributeDef; values: string[] }[];
    const scoped = products.filter((p) => p.category === activeCategory.id);
    return activeAttributeDefs
      .map((def) => ({
        def,
        values: sortAttributeValues(scoped.flatMap((p) => attributeValues(p, def))),
      }))
      .filter((group) => group.values.length > 0);
  }, [products, activeCategory, activeAttributeDefs]);

  // Filter products logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter (las categorías son dinámicas)
      if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        const matchTech = product.technique.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchTech) return false;
      }

      // Technique / Type filter
      if (selectedTechnique === 'textil' && categoryKindOf(categories, product.category) !== 'ropa') return false;
      if (selectedTechnique === 'sublimacion' && !['vaso', 'placa'].includes(categoryKindOf(categories, product.category))) return false;

      // Attribute filters (talla / onzas / medida / personalizados)
      if (!matchesAttributes(product, activeAttributeDefs, selectedAttributes)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [selectedCategory, searchQuery, selectedTechnique, selectedAttributes, activeAttributeDefs, categories, sortBy, products]);

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

  const allLoaded = configLoaded && productsLoaded;

  if (!allLoaded) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0A] font-sans overflow-hidden relative select-none">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Central animation */}
        <div className="relative mb-10">
          {/* Outer rotating square */}
          <div className="w-24 h-24 border border-[var(--accent)]/20 rotate-45 animate-[spin_8s_linear_infinite]" />
          {/* Middle rotating square (opposite) */}
          <div className="absolute inset-2 border border-[var(--accent)]/30 rotate-12 animate-[spin_5s_linear_infinite_reverse]" />
          {/* Inner glowing square */}
          <div className="absolute inset-4 bg-[var(--accent)]/5 border border-[var(--accent)]/40 rotate-[30deg] animate-pulse" style={{ animationDuration: '2s' }} />
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-[var(--accent)] rounded-full shadow-[0_0_20px_var(--accent),0_0_40px_var(--accent),0_0_60px_color-mix(in_oklab,var(--accent)_30%,transparent)] animate-pulse" style={{ animationDuration: '1.5s' }} />
          </div>
        </div>

        {/* Brand */}
        <div className="text-center space-y-3">
          <h1 className="text-[var(--accent)] font-black text-xl sm:text-2xl tracking-[0.4em] uppercase">
            LUMIN
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[var(--accent)]/50" />
            <span className="text-[var(--accent)]/40 text-[10px] font-bold tracking-[0.3em] uppercase">SHOP</span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[var(--accent)]/50" />
          </div>
        </div>

        {/* Loading bar */}
        <div className="mt-10 w-40 h-[1px] bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)]/60 rounded-full animate-loading-bar" />
        </div>

        <style>{`
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
          .animate-loading-bar {
            width: 25%;
            animation: loading-bar 1.2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col transition-colors duration-300">
      
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
        onToggleTheme={toggleQuickTheme}
      />

      {/* Main Content Area (`.wrap` de la maqueta: max-width + padding lateral) */}
      <main className="wrap flex-1 w-full space-y-8 pt-4">

        {/* SCREEN 1: INICIO (HOME) — sin space-y: el espaciado lo dan las reglas de la maqueta */}
        {activeTab === 'home' && (
          <div key="home-screen" className="animate-fade-in-up">
            {/* Campaña de temporada activa (si la hay) */}
            <CampaignStrip onExploreClick={() => handleTabChange('catalog')} themeMode={themeMode} />

            {/* Top Hero Banner */}
            <HeroBanner
              onExploreClick={() => handleTabChange('catalog')}
              onCustomOrderClick={() => setIsCustomIdeaOpen(true)}
              themeMode={themeMode}
              heroMedia1Url={cfg('hero_media_1_url', '') || undefined}
              heroMedia2Url={cfg('hero_media_2_url', '') || undefined}
            />

            {/* Barra de confianza `.trust` (producción · calidad · envíos) */}
            <ProductionBadgeBar themeMode={themeMode} />

            {/* Destacados - `.sectionhead` + `.grid` de la maqueta */}
            {(products.length > 0 || !productsLoaded) && (
              <section>
                <div className="sectionhead">
                  <div>
                    <p className="eyebrow">
                      {cfg('section_featured_title', 'ENCUENTRA TU PRÓXIMO FAVORITO')}
                    </p>
                    <h2>{cfg('section_featured_sub', 'Diseños que hablan de ti.')}</h2>
                  </div>
                  <button
                    type="button"
                    className="textbtn"
                    onClick={() => handleTabChange('catalog')}
                  >
                    {cfg('section_featured_view_all', 'Ver todos')}
                    <ArrowRight />
                  </button>
                </div>

                <div className="grid">
                  {productsLoaded ? (
                    products.slice(0, 4).map((product, idx) => (
                      <ProductCard
                        key={product.id}
                        index={idx}
                        product={product}
                        isFavorite={favoriteIds.has(product.id)}
                        onToggleFavorite={toggleFavorite}
                        onSelectProduct={(p) => setSelectedProduct(p)}
                        themeMode={themeMode}
                        categoryLabel={categories.find((c) => c.id === product.category)?.label}
                        categoryKind={categoryKindOf(categories, product.category)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center">
                      <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Personalización — `.custom-banner` de la maqueta */}
            <SocialQuickBar themeMode={themeMode} />

            {/* Proceso — `.steps` de la maqueta */}
            <section>
              <p className="eyebrow">{cfg('badge_model_title', 'ASÍ DE SIMPLE')}</p>
              <h2 style={{ marginTop: 10 }}>
                {cfg('badge_model_subtitle', 'De tu idea a tus manos.')}
              </h2>
              <div className="steps">
                {[1, 2, 3].map((n) => {
                  const titles = ['Elige y personaliza', 'Confirmamos y creamos', 'Recibe y disfrútalo'];
                  const bodies = [
                    'Selecciona tu producto, talla o texto. También puedes enviar tu propio diseño.',
                    'Coordinamos los detalles contigo y elaboramos tu pedido en 24 a 48 horas.',
                    'Empacamos con cuidado y coordinamos el envío a tu domicilio.',
                  ];
                  return (
                    <div className="step" key={n}>
                      <p className="step-num">0{n} /</p>
                      <h3>{cfg(`badge_step${n}_title`, titles[n - 1])}</h3>
                      <p>{cfg(`badge_step${n}_desc`, bodies[n - 1])}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Marca + preguntas frecuentes — `.aboutfaq` de la maqueta */}
            <section className="aboutfaq">
              <div>
                <p className="eyebrow">
                  {cfg('section_about_label', 'DESDE AYACUCHO, CON IDENTIDAD')}
                </p>
                <h2>{cfg('section_about_subtitle', 'Diseños con algo de ti.')}</h2>
                <p
                  dangerouslySetInnerHTML={{
                    __html: sanitize(
                      cfg(
                        'section_about_text',
                        'Somos LUMIN SHOP. Creamos productos personalizados por pedido: polos, vasos, tazas y placas de aluminio. Cada pieza se elabora especialmente para quien la elige.',
                      ),
                    ),
                  }}
                />
                <a
                  className="textbtn"
                  href={`https://wa.me/${cfg('brand_phone_raw', '51993365099')}?text=${encodeURIComponent(
                    cfg('brand_whatsapp_help', 'Hola LUMIN, quisiera consultar sobre un pedido.'),
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cfg('section_about_cta_idea', 'Conversemos sobre tu pedido')}
                  <ArrowRight />
                </a>
              </div>

              <FaqSection themeMode={themeMode} />
            </section>
          </div>
        )}

        {/* SCREEN 2: CATÁLOGO */}
        {activeTab === 'catalog' && (
          <div key="catalog-screen" className="animate-fade-in-up">
            {/* Título de página (`.page-title`) */}
            <div className="page-title">
              <p className="eyebrow">
                {cfg('brand_name', 'LUMIN SHOP')} / {cfg('catalog_subtitle', 'CATÁLOGO')}
              </p>
              <h1>{cfg('catalog_title', 'Elige. Personaliza. Hazlo tuyo.')}</h1>
              <p>
                {cfg(
                  'catalog_description',
                  'Encuentra tu diseño y configura tu pedido. Lo elaboramos después de confirmar contigo.',
                )}
              </p>
            </div>

            {/* Barra de categorías + buscador (`.catalogbar`) */}
            <div className="catalogbar">
              <div className="chips">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`chip ${selectedCategory === cat.id ? 'active' : ''}`}
                    aria-pressed={selectedCategory === cat.id}
                    onClick={() => setSelectedCategory(cat.id as Category)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <label className="search">
                <Search />
                <span className="visuallyhidden">Buscar productos</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={cfg('search_placeholder', 'Busca un diseño, polo o taza…')}
                  aria-label="Buscar productos"
                />
              </label>
            </div>

            {/* Filtros por talla / onzas / medida (configurables por categoría) */}
            {attributeGroups.length > 0 && (
              <div className="attrfilters" aria-label="Filtros rápidos por categoría">
                {attributeGroups.map(({ def, values }) => {
                  const chosen = selectedAttributes[def.key];
                  return (
                    <div className="chips" role="group" aria-label={def.label} key={def.key}>
                      <span className="attrlabel">{def.label}</span>
                      <button
                        type="button"
                        className={`chip ${!chosen ? 'active' : ''}`}
                        aria-pressed={!chosen}
                        onClick={() =>
                          setSelectedAttributes((prev) => {
                            const next = { ...prev };
                            delete next[def.key];
                            return next;
                          })
                        }
                      >
                        Todas
                      </button>
                      {values.map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`chip ${chosen === value ? 'active' : ''}`}
                          aria-pressed={chosen === value}
                          onClick={() =>
                            setSelectedAttributes((prev) => ({
                              ...prev,
                              [def.key]: chosen === value ? '' : value,
                            }))
                          }
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Conteo + filtro de técnica + orden (`.labelrow`) */}
            <div className="labelrow">
              <p className="subtle" style={{ marginTop: 0 }}>
                {filteredProducts.length} diseños
              </p>

              <div className="chips" role="group" aria-label="Filtrar por técnica">
                <button
                  type="button"
                  className={`chip ${selectedTechnique === 'all' ? 'active' : ''}`}
                  aria-pressed={selectedTechnique === 'all'}
                  onClick={() => setSelectedTechnique('all')}
                >
                  {cfg('catalog_filter_technique', 'Técnica')}: {cfg('catalog_filter_all', 'Todas')}
                </button>
                <button
                  type="button"
                  className={`chip ${selectedTechnique === 'textil' ? 'active' : ''}`}
                  aria-pressed={selectedTechnique === 'textil'}
                  onClick={() => setSelectedTechnique('textil')}
                >
                  {cfg('catalog_filter_textile', 'Textil HD')}
                </button>
                <button
                  type="button"
                  className={`chip ${selectedTechnique === 'sublimacion' ? 'active' : ''}`}
                  aria-pressed={selectedTechnique === 'sublimacion'}
                  onClick={() => setSelectedTechnique('sublimacion')}
                >
                  {cfg('catalog_filter_sublimation', 'Sublimado 200°C')}
                </button>
              </div>

              <label className="field" style={{ margin: 0 }}>
                <span className="visuallyhidden">Ordenar productos</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')}
                >
                  <option value="featured">{cfg('catalog_sort_featured', 'Destacados')}</option>
                  <option value="price-asc">{cfg('catalog_sort_price_asc', 'Menor precio')}</option>
                  <option value="price-desc">{cfg('catalog_sort_price_desc', 'Mayor precio')}</option>
                </select>
              </label>
            </div>

            {/* Grilla de productos (`.grid`) */}
            <div
              key={`${selectedCategory}-${selectedTechnique}-${searchQuery}-${sortBy}-${JSON.stringify(selectedAttributes)}`}
              className="grid animate-fade-in"
              style={{ margin: '22px 0 40px' }}
            >
              {!productsLoaded ? (
                <div className="empty">
                  <div
                    className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto"
                    style={{ marginBottom: 15 }}
                  />
                  <p style={{ marginBottom: 0 }}>Cargando productos…</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="empty">
                  <Tag />
                  <h3>{cfg('catalog_empty', 'No encontramos ese diseño.')}</h3>
                  <p>Prueba otra palabra o categoría.</p>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedTechnique('all');
                      setSelectedAttributes({});
                      setSearchQuery('');
                    }}
                  >
                    {cfg('catalog_reset_filters', 'Restablecer filtros')}
                    <ArrowRight />
                  </button>
                </div>
              ) : (
                filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    index={idx}
                    product={product}
                    isFavorite={favoriteIds.has(product.id)}
                    onToggleFavorite={toggleFavorite}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    themeMode={themeMode}
                    categoryLabel={categories.find((c) => c.id === product.category)?.label}
                    categoryKind={categoryKindOf(categories, product.category)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* SCREEN 3: FAVORITOS (FAVORITES) */}
        {activeTab === 'favorites' && (
          <div key="favorites-screen" className="animate-fade-in-up">
            {/* Título de página (`.page-title`) */}
            <div className="page-title">
              <p className="eyebrow">{cfg('favorites_eyebrow', 'TU SELECCIÓN')}</p>
              <h1>{cfg('favorites_title', 'Los que te gustaron.')}</h1>
              <p>
                {cfg(
                  'favorites_description',
                  'Guarda tus diseños favoritos para volver a ellos.',
                )}
              </p>
            </div>

            {/* Grilla de favoritos (`.grid`) */}
            <div className="grid" style={{ margin: '30px 0 40px' }}>
              {favorites.length === 0 ? (
                <div className="empty">
                  <Heart />
                  <h3>{cfg('favorites_empty_title', 'Aún no tienes favoritos.')}</h3>
                  <p>
                    {cfg(
                      'favorites_empty_desc',
                      'Toca el corazón de un diseño para guardarlo.',
                    )}
                  </p>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleTabChange('catalog')}
                  >
                    {cfg('favorites_empty_cta', 'Explorar catálogo')}
                    <ArrowRight />
                  </button>
                </div>
              ) : (
                favorites.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    index={idx}
                    product={product}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    themeMode={themeMode}
                    categoryLabel={categories.find((c) => c.id === product.category)?.label}
                    categoryKind={categoryKindOf(categories, product.category)}
                  />
                ))
              )}
            </div>

            {favorites.length > 0 && (
              <div style={{ margin: '-20px 0 40px' }}>
                <button type="button" className="textbtn" onClick={() => setFavorites([])}>
                  <Trash2 />
                  {cfg('favorites_clear', 'Vaciar favoritos')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 4: MI PEDIDO / CARRITO (CART) */}
        {activeTab === 'cart' && (
          <div key="cart-screen" className="animate-fade-in-up">
            {/* Título de página (`.page-title`) */}
            <div className="page-title">
              <p className="eyebrow">
                {cfg('cart_eyebrow', 'TU SELECCIÓN')} / {cartItemCount}{' '}
                {cartItemCount === 1
                  ? cfg('cart_item_one', 'PRODUCTO')
                  : cfg('cart_item_many', 'PRODUCTOS')}
              </p>
              <h1>{cfg('order_title', 'Tu pedido, a tu manera.')}</h1>
              <p>
                {cfg(
                  'order_description',
                  'Revisa los detalles y envíanos tu selección para confirmar disponibilidad y entrega.',
                )}
              </p>
            </div>

            {cart.length === 0 ? (
              <div className="empty">
                <ShoppingBag />
                <h3>{cfg('cart_empty_title', 'Tu pedido empieza con una idea.')}</h3>
                <p>
                  {cfg(
                    'cart_empty_desc',
                    'Explora el catálogo y personaliza un diseño.',
                  )}
                </p>
                <button
                  type="button"
                  className="btn"
                  onClick={() => handleTabChange('catalog')}
                >
                  {cfg('cart_empty_cta', 'Explorar catálogo')}
                  <ArrowRight />
                </button>
              </div>
            ) : (
              <div className="ordergrid">
                {/* Líneas del pedido */}
                <div>
                  <div className="notice">
                    {cfg(
                      'cart_process_desc',
                      'Envías la orden a WhatsApp, iniciamos producción digital/artesanal (24-48h) y despachamos a tu domicilio.',
                    )}
                  </div>

                  {cart.map((item) => {
                    const itemUnitPrice = getUnitPrice(item);
                    const itemTotal = itemUnitPrice * item.quantity;

                    return (
                      <div className="orderline" key={item.cartItemId}>
                        <img src={item.product.image} alt={item.product.name} />

                        <div className="info">
                          <h3>{item.product.name}</h3>

                          <p>
                            {item.selectedSize &&
                              `${cfg('cart_item_size', 'Talla:')} ${item.selectedSize} · `}
                            {item.selectedFit &&
                              `${cfg('cart_item_fit', 'Fit:')} ${item.selectedFit} · `}
                            {item.selectedCupType && `${item.selectedCupType} · `}
                            {item.selectedColor && `${item.selectedColor.name} · `}
                            {item.customText
                              ? `${cfg('cart_item_custom_text', 'Texto personalizado:')} ${item.customText}`
                              : cfg('cart_item_no_text', 'Sin texto adicional')}
                          </p>

                          {item.product.agotado && (
                            <p className="danger">
                              {cfg('cart_item_sold', 'Agotado · retíralo para continuar')}
                            </p>
                          )}

                          <div className="qty">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.cartItemId, -1)}
                              aria-label="Disminuir cantidad"
                            >
                              <Minus />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={99}
                              step={1}
                              value={item.quantity}
                              aria-label={`Cantidad de ${item.product.name}`}
                              onChange={(e) => {
                                const next = Math.max(
                                  1,
                                  Math.min(99, Number(e.target.value) || 1),
                                );
                                handleUpdateQuantity(
                                  item.cartItemId,
                                  next - item.quantity,
                                );
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.cartItemId, 1)}
                              aria-label="Aumentar cantidad"
                            >
                              <Plus />
                            </button>
                          </div>
                        </div>

                        <div className="pricecol">
                          <strong>S/ {itemTotal.toFixed(2)}</strong>
                          <button
                            type="button"
                            className="textbtn danger"
                            onClick={() => handleRemoveItem(item.cartItemId)}
                          >
                            {cfg('cart_item_remove', 'Quitar')}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div
                    style={{
                      display: 'flex',
                      gap: 18,
                      flexWrap: 'wrap',
                      marginTop: 18,
                    }}
                  >
                    <button
                      type="button"
                      className="textbtn"
                      onClick={handleCopyOrderSummary}
                    >
                      {copiedOrder ? <CheckCircle2 /> : <Copy />}
                      {copiedOrder
                        ? cfg('cart_order_copied', '¡Texto de pedido copiado!')
                        : cfg('cart_copy_order', 'Copiar pedido')}
                    </button>
                    <button
                      type="button"
                      className="textbtn danger"
                      onClick={handleClearCart}
                    >
                      <Trash2 />
                      {cfg('cart_clear', 'Vaciar pedido')}
                    </button>
                  </div>
                </div>

                {/* Columna de resumen */}
                <div style={{ display: 'grid', gap: 24, alignContent: 'start' }}>
                  {/* Datos de entrega */}
                  <section className="panel">
                    <h3>{cfg('cart_shipping_title', 'Datos para el envío')}</h3>
                    <p>
                      {cfg(
                        'cart_shipping_desc',
                        'Los usamos solo para coordinar tu entrega por WhatsApp.',
                      )}
                    </p>

                    <div className="chips" role="group" aria-label="Modalidad de entrega">
                      <button
                        type="button"
                        className={`chip ${deliveryType === 'envio' ? 'active' : ''}`}
                        onClick={() => setDeliveryType('envio')}
                        aria-pressed={deliveryType === 'envio'}
                      >
                        <Truck className="w-4 h-4" />
                        {cfg('cart_delivery_home', 'Envío a domicilio')}
                      </button>
                      <button
                        type="button"
                        className={`chip ${deliveryType === 'recojo' ? 'active' : ''}`}
                        onClick={() => setDeliveryType('recojo')}
                        aria-pressed={deliveryType === 'recojo'}
                      >
                        <Store className="w-4 h-4" />
                        {cfg('cart_delivery_pickup', 'Recojo en tienda')}
                      </button>
                    </div>

                    <label className="field">
                      <span>{cfg('cart_form_name_label', 'Nombre completo')} *</span>
                      <input
                        type="text"
                        value={userProfile.name}
                        onChange={(e) =>
                          setUserProfile({ ...userProfile, name: e.target.value })
                        }
                        placeholder={cfg('cart_form_name_placeholder', 'Tu nombre…')}
                        autoComplete="name"
                        required
                      />
                    </label>

                    <label className="field">
                      <span>
                        {cfg('cart_form_address_label', 'Dirección de entrega')}
                        {deliveryType === 'envio' ? ' *' : ''}
                      </span>
                      <input
                        type="text"
                        value={userProfile.address}
                        onChange={(e) =>
                          setUserProfile({ ...userProfile, address: e.target.value })
                        }
                        placeholder={cfg(
                          'cart_form_address_placeholder',
                          'Av., calle, dpto. y referencia…',
                        )}
                        autoComplete="street-address"
                        required={deliveryType === 'envio'}
                      />
                    </label>

                    {deliveryType === 'envio' && (
                      <div style={{ marginTop: 18 }}>
                        <span className="eyebrow">
                          {cfg('cart_form_zone_label', 'Zona de envío')}
                        </span>
                        <div className="chips" style={{ flexWrap: 'wrap', marginTop: 10 }}>
                          {[
                            {
                              key: 'huamanga' as const,
                              label: cfg('cart_zone_local', 'Ayacucho'),
                              price: cfg('shipping_price_huamanga', '0'),
                            },
                            {
                              key: 'provincia' as const,
                              label: cfg('cart_zone_province', 'Provincia'),
                              price: cfg('shipping_price_provincia', '25'),
                            },
                            {
                              key: 'internacional' as const,
                              label: cfg('cart_zone_international', 'Internacional'),
                              price: cfg('shipping_price_internacional', '80'),
                            },
                          ].map((zone) => (
                            <button
                              key={zone.key}
                              type="button"
                              className={`chip ${
                                shippingZone === zone.key ? 'active' : ''
                              }`}
                              onClick={() => setShippingZone(zone.key)}
                              aria-pressed={shippingZone === zone.key}
                            >
                              {zone.label} ·{' '}
                              {zone.price === '0'
                                ? cfg('cart_free', 'GRATIS')
                                : `S/ ${zone.price}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="subtle">
                      {deliveryType === 'recojo'
                        ? cfg(
                            'cart_pickup_note',
                            'Coordinamos el punto y horario de recojo por WhatsApp.',
                          )
                        : cfg(
                            'cart_shipping_note',
                            'El envío se cotiza aparte y se confirma por WhatsApp.',
                          )}
                    </p>
                  </section>

                  {/* Pago */}
                  <section className="panel">
                    <h3>{cfg('cart_payment_title', 'Pago Yape / Plin')}</h3>
                    <p>
                      {cfg(
                        'cart_payment_holder',
                        'Titular: Oscar Daniel (LUMIN SHOP)',
                      )}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          fontWeight: 700,
                        }}
                      >
                        <Smartphone />
                        {cfg('brand_phone', '993 365 099')}
                      </span>
                      <button
                        type="button"
                        className="btn outline small"
                        onClick={handleCopyYapePhone}
                      >
                        {copiedPhone ? <CheckCircle2 /> : <Copy />}
                        {copiedPhone
                          ? cfg('cart_phone_copied', '¡Número copiado!')
                          : cfg('cart_phone_copy', 'Copiar número')}
                      </button>
                    </div>
                  </section>

                  {/* Resumen */}
                  <section className="panel">
                    <h3>{cfg('cart_summary_title', 'Resumen')}</h3>
                    <p>
                      {cfg(
                        'cart_summary_desc',
                        'Producción bajo pedido. Confirmamos los detalles contigo por WhatsApp.',
                      )}
                    </p>

                    <div style={{ display: 'grid', gap: 10, fontSize: 12 }}>
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}
                      >
                        <span style={{ color: 'var(--muted)' }}>
                          {cfg('cart_subtotal_label', 'Subtotal')}
                        </span>
                        <span>S/ {totalCartAmount.toFixed(2)}</span>
                      </div>
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}
                      >
                        <span style={{ color: 'var(--muted)' }}>
                          {cfg('cart_shipping_label', 'Envío')} (
                          {deliveryType === 'recojo'
                            ? cfg('cart_delivery_pickup', 'Recojo en tienda')
                            : shippingZone === 'huamanga'
                            ? cfg('cart_zone_local', 'Ayacucho')
                            : shippingZone === 'provincia'
                            ? cfg('cart_zone_province', 'Provincia')
                            : cfg('cart_zone_international', 'Internacional')}
                          )
                        </span>
                        <span>
                          {shippingCost === 0
                            ? cfg('cart_free', 'GRATIS')
                            : `S/ ${shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <div className="total">
                      <span>{cfg('cart_total_label', 'Total estimado')}</span>
                      <span>S/ {grandTotal.toFixed(2)}</span>
                    </div>

                    <label className="check" style={{ alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                      />
                      <span
                        style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.45 }}
                      >
                        {cfg(
                          'checkout_consent_text',
                          'Acepto la Política de Privacidad y los Términos y Condiciones de LUMIN SHOP. Entiendo que mis datos personales serán utilizados únicamente para procesar mi pedido.',
                        )}{' '}
                        <button
                          type="button"
                          className="textbtn"
                          style={{ display: 'inline', padding: 0, fontSize: 11 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTermsTab('privacy');
                            setIsTermsOpen(true);
                          }}
                        >
                          {cfg(
                            'checkout_consent_privacy_link',
                            'Política de Privacidad',
                          )}
                        </button>{' '}
                        {cfg('checkout_consent_and', 'y')}{' '}
                        <button
                          type="button"
                          className="textbtn"
                          style={{ display: 'inline', padding: 0, fontSize: 11 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTermsTab('terms');
                            setIsTermsOpen(true);
                          }}
                        >
                          {cfg('checkout_consent_terms_link', 'Términos y Condiciones')}
                        </button>
                      </span>
                    </label>

                    <button
                      type="button"
                      className="btn full"
                      onClick={handleSendWhatsAppOrder}
                      disabled={!acceptedTerms || !isCheckoutValid}
                    >
                      <MessageCircle />
                      {cfg('cart_checkout_whatsapp', 'Coordinar por WhatsApp')}
                    </button>

                    {!isCheckoutValid && (
                      <p className="error">
                        {!userProfile.name.trim()
                          ? cfg(
                              'cart_error_name',
                              'Ingresa tu nombre para continuar.',
                            )
                          : cfg(
                              'cart_error_address',
                              'Ingresa tu dirección de entrega.',
                            )}
                      </p>
                    )}

                    <button
                      type="button"
                      className="textbtn"
                      onClick={() => handleTabChange('catalog')}
                    >
                      {cfg('cart_continue', 'Seguir explorando')}
                      <ArrowRight />
                    </button>
                  </section>
                </div>
              </div>
            )}
          </div>
        )}
        {/* SCREEN 5: MI CUENTA / "YO" / PERFIL & CONFIGURACIÓN */}
        {activeTab === 'profile' && (
          <div key="profile-screen" className="animate-fade-in-up">
            {/* Título de página (`.page-title`) */}
            <div className="page-title">
              <p className="eyebrow">{cfg('profile_eyebrow', 'A TU GUSTO')}</p>
              <h1>{cfg('profile_title', 'Tu espacio LUMIN.')}</h1>
              <p>
                {cfg(
                  'profile_description',
                  'Elige cómo quieres ver la tienda y encuentra ayuda para tu pedido.',
                )}
              </p>
            </div>

            {orderUpdateMsg && (
              <div className="notice" style={{ color: 'var(--accent)' }}>
                {orderUpdateMsg}
              </div>
            )}

            {/* Apariencia + ayuda (`.accountgrid`) */}
            <div className="accountgrid">
              <section className="panel">
                <h3>{cfg('profile_appearance_title', 'Tu apariencia')}</h3>
                <p>
                  {cfg(
                    'profile_appearance_desc',
                    'Elige el tema que te resulte más cómodo. Se recuerda en este dispositivo.',
                  )}
                </p>
                <div className="chips">
                  {[
                    { key: 'light' as ThemeMode, label: cfg('profile_theme_light', 'Claro') },
                    { key: 'dark' as ThemeMode, label: cfg('profile_theme_dark', 'Oscuro') },
                    { key: 'amoled' as ThemeMode, label: cfg('profile_theme_amoled', 'AMOLED') },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={`chip ${themeMode === option.key ? 'active' : ''}`}
                      onClick={() => handleSelectTheme(option.key)}
                      aria-pressed={themeMode === option.key}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel">
                <h3>{cfg('profile_help_title', '¿Te ayudamos a elegir?')}</h3>
                <p>
                  {cfg(
                    'profile_help_desc',
                    'Cuéntanos qué tienes en mente y coordinamos tu diseño.',
                  )}
                </p>
                <a
                  className="btn outline"
                  href={`https://wa.me/${cfg(
                    'brand_phone_raw',
                    '51993365099',
                  )}?text=${encodeURIComponent(
                    cfg(
                      'brand_whatsapp_help',
                      'Hola LUMIN, quisiera consultar sobre un pedido.',
                    ),
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle />
                  {cfg('profile_help_btn', 'Hablar con LUMIN')}
                </a>
              </section>
            </div>

            {/* Mis pedidos */}
            {myOrders.length > 0 && (
              <section className="panel" style={{ marginBottom: 24 }}>
                <h3>{cfg('profile_my_orders_title', 'Mis pedidos')}</h3>
                <div>
                  {myOrders.map((order: any) => {
                    const statusLabels: Record<string, string> = {
                      pendiente: cfg('order_status_pending', 'Pendiente'),
                      produccion: cfg('order_status_production', 'En producción'),
                      enviado: cfg('order_status_sent', 'Enviado'),
                      entregado: cfg('order_status_delivered', 'Entregado'),
                    };
                    const items = order.productos || [];
                    return (
                      <div
                        key={order.id}
                        style={{
                          borderTop: '1px solid var(--line)',
                          padding: '14px 0',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 12,
                            flexWrap: 'wrap',
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <p style={{ color: 'var(--muted)', fontSize: 11 }}>
                              #{order.id.slice(0, 8)} ·{' '}
                              {order.created_at
                                ? new Date(order.created_at).toLocaleDateString('es-PE')
                                : ''}{' '}
                              ·{' '}
                              <strong style={{ color: 'var(--text)' }}>
                                {statusLabels[order.estado] || order.estado}
                              </strong>
                            </p>
                            {items.map((item: any, i: number) => (
                              <p key={i} style={{ fontSize: 12, marginTop: 4 }}>
                                {item.product_name} ×{item.quantity}
                                {item.selected_size ? ` · ${item.selected_size}` : ''}
                              </p>
                            ))}
                          </div>
                          <strong>S/ {order.total?.toFixed(2)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Mis datos */}
            <section className="panel" style={{ marginBottom: 24 }}>
              <h3>{cfg('profile_section_data_title', 'Mis datos')}</h3>
              <p>
                {cfg(
                  'profile_data_desc',
                  'Se guardan en este dispositivo para completar tus pedidos más rápido.',
                )}
              </p>

              <form className="editor" onSubmit={handleProfileScreenSubmit}>
                <div className="two">
                  <label className="field">
                    <span>{cfg('profile_form_name_label', 'Nombre y apellido')}</span>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      placeholder={cfg('profile_form_name_placeholder', 'Ej. Carlos Mendoza')}
                      autoComplete="name"
                    />
                  </label>

                  <label className="field">
                    <span>{cfg('profile_form_phone_label', 'WhatsApp / Teléfono')}</span>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, phone: e.target.value })
                      }
                      placeholder={cfg('profile_form_phone_placeholder', 'Ej. 987654321')}
                      autoComplete="tel"
                    />
                  </label>
                </div>

                <div className="two">
                  <label className="field">
                    <span>{cfg('profile_form_dni_label', 'DNI / RUC')}</span>
                    <input
                      type="text"
                      value={profileForm.dni}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, dni: e.target.value })
                      }
                      placeholder={cfg('profile_form_dni_placeholder', 'Ej. 72839401')}
                    />
                  </label>

                  <label className="field">
                    <span>{cfg('profile_form_address_label', 'Dirección de entrega')}</span>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, address: e.target.value })
                      }
                      placeholder={cfg(
                        'profile_form_address_placeholder',
                        'Av., calle y distrito…',
                      )}
                      autoComplete="street-address"
                    />
                  </label>
                </div>

                <button type="submit" className="btn">
                  {profileSaveSuccess ? (
                    <>
                      <CheckCircle2 />
                      <span>{cfg('profile_save_success', '¡Información guardada!')}</span>
                    </>
                  ) : (
                    <>
                      <Save />
                      <span>{cfg('profile_save_button', 'Guardar mis datos')}</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Conceptos clave del servicio */}
            <section className="panel">
              <h3>{cfg('profile_section_concepts_title', 'Conceptos clave')}</h3>
              <p>
                {cfg(
                  'profile_concepts_sub',
                  'Todo lo que necesitas saber antes de pedir.',
                )}
              </p>

              <div className="notice">
                <strong>{cfg('concept_1_title', 'Elaboración bajo pedido')}</strong>
                <br />
                {cfg(
                  'concept_1_desc',
                  'Producción y sublimación personalizada en 24 a 48 hrs hábiles antes de despachar.',
                )}
              </div>

              <div className="notice">
                <strong>{cfg('concept_2_title', 'Pagos Yape / Plin / Bancos')}</strong>
                <br />
                {cfg(
                  'concept_2_desc',
                  'Pago directo al 993 365 099 a nombre de Oscar Daniel (LUMIN SHOP) o BCP / Interbank.',
                )}
              </div>

              <div className="notice">
                <strong>{cfg('concept_3_title', 'Envíos gratis (S/ 200+)')}</strong>
                <br />
                {cfg(
                  'concept_3_desc',
                  'Envío sin costo en compras mayores a S/ 200 vía Olva Courier, Shalom o Express.',
                )}
              </div>

              <div className="notice">
                <strong>{cfg('concept_4_title', 'Algodón reactivo & sublimado HD')}</strong>
                <br />
                {cfg(
                  'concept_4_desc',
                  'Telas 24/1 de alto gramaje y sublimación térmica 1200 DPI que no se despinta ni se agrieta.',
                )}
              </div>

              <div className="notice">
                <strong>{cfg('concept_5_title', 'Verificación por WhatsApp')}</strong>
                <br />
                {cfg(
                  'concept_5_desc',
                  'Atención personalizada humana para revisar tu diseño, confirmación de talla y datos antes del envío.',
                )}
              </div>

              <div className="notice">
                <strong>{cfg('concept_6_title', 'Garantía de satisfacción')}</strong>
                <br />
                {cfg(
                  'concept_6_desc',
                  'Reemplazo o reembolso inmediato ante cualquier falla de fábrica o problemas en el estampado.',
                )}
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
          categoryLabel={categories.find((c) => c.id === selectedProduct.category)?.label}
          categoryKind={categoryKindOf(categories, selectedProduct.category)}
        />
      )}

      {/* Custom Idea Modal */}
      {isCustomIdeaOpen && (
        <div
          onClick={() => setIsCustomIdeaOpen(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal animate-fade-in-up"
            style={{ maxWidth: 560 }}
            role="dialog"
            aria-modal="true"
            aria-label={cfg('custom_idea_title', '¿Tienes un diseño en mente?')}
          >
            <div className="modal-head">
              <h2>{cfg('custom_idea_title', '¿Tienes un diseño en mente?')}</h2>
              <button
                type="button"
                className="close"
                onClick={() => setIsCustomIdeaOpen(false)}
                aria-label={cfg('pm_close_label', 'Cerrar')}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>✕</span>
              </button>
            </div>

            <form onSubmit={handleSendCustomIdea}>
              <div className="modal-body">
                <p className="eyebrow">
                  {cfg('custom_idea_subtitle', 'COTIZACIÓN DE PRODUCTO SUBLIMADO')}
                </p>
                <p style={{ margin: '10px 0 4px', color: 'var(--muted)', fontSize: 13 }}>
                  {cfg(
                    'custom_idea_desc',
                    'Escríbenos tu idea, logo o frase y te ayudaremos a sublimarlo en vasos, tazas, polos o placas de aluminio.',
                  )}
                </p>

                <div className="field">
                  <span>{cfg('custom_idea_product_type', 'Tipo de producto')}</span>
                  <div className="chips" style={{ flexWrap: 'wrap' }}>
                    {[
                      { key: 'polo' as const, label: cfg('custom_idea_type_polo', 'Polo') },
                      { key: 'vaso' as const, label: cfg('custom_idea_type_cup', 'Vaso / taza') },
                      { key: 'otro' as const, label: cfg('custom_idea_type_other', 'Otro') },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className={`chip ${
                          customIdeaType === option.key ? 'active' : ''
                        }`}
                        onClick={() => setCustomIdeaType(option.key)}
                        aria-pressed={customIdeaType === option.key}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="field">
                  <span>{cfg('custom_idea_message_label', 'Describe tu idea o mensaje')}</span>
                  <textarea
                    required
                    rows={4}
                    value={customIdeaText}
                    onChange={(e) => setCustomIdeaText(e.target.value)}
                    placeholder={cfg(
                      'custom_idea_placeholder',
                      "Ej: Quiero un polo oversized negro con la ilustración de una calavera en la espalda y mi apodo 'Vektor' en la manga derecha...",
                    )}
                  />
                </label>
              </div>

              <div className="modalfoot" style={{ justifyContent: 'flex-end' }}>
                <button type="submit" className="btn">
                  <MessageCircle />
                  {cfg('custom_idea_submit', 'Cotizar por WhatsApp')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Admin Panel - Activated by 5 clicks on logo */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onConfigChange={() => { reloadConfig().then(() => setConfigVersion(v => v + 1)); }}
        onCatalogChange={() => {
          loadProductsFromSupabase().then((items) => { if (items.length > 0) setProducts(items); });
          loadCategoriesFromSupabase().then((cats) => { if (cats.length > 0) setCategories(cats); });
        }}
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
