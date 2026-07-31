import React, { useState, useEffect, useCallback } from 'react';
import { X, Upload, Save, Eye, EyeOff, Lock, Package, Settings, Image, Plus, Trash2, ArrowLeft, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { reloadConfig } from '../lib/config';

const ADMIN_PASS = 'Ratitaxd12';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: 'dark' | 'light' | 'amoled';
  onConfigChange?: () => void;
}

interface ConfigRow { id: string; seccion: string; clave: string; valor: string; }
interface ProductoRow { id: string; nombre: string; categoria_id: string; precio: number; precio_original: number | null; tecnica: string; tiempo_produccion: string; imagen: string; galeria: any; descripcion: string; etiqueta: string; opciones_ropa: any; opciones_vaso: any; personalizable: boolean; activo: boolean; destacado: boolean; }
interface PedidoRow { id: string; usuario_id: string; cliente_nombre: string; cliente_telefono: string; cliente_direccion: string; productos: any; total: number; estado: string; created_at: string; }

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, themeMode = 'dark', onConfigChange }) => {
  const isLight = themeMode === 'light';

  // Auth
  const [authenticated, setAuthenticated] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Tabs
  const [mainTab, setMainTab] = useState<'config' | 'products' | 'orders'>('config');

  // Config state
  const [configRows, setConfigRows] = useState<ConfigRow[]>([]);
  const [cfgEdit, setCfgEdit] = useState<Record<string, string>>({});
  const [cfgOriginal, setCfgOriginal] = useState<Record<string, string>>({});
  const [cfgSection, setCfgSection] = useState('hero');
  const [cfgSaved, setCfgSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState('');

  // Products state
  const [products, setProducts] = useState<ProductoRow[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductoRow | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [prodSaving, setProdSaving] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<PedidoRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // --- AUTH ---
  useEffect(() => { if (!isOpen) { setAuthenticated(false); setPw(''); } }, [isOpen]);
  const handleLogin = () => {
    if (pw === ADMIN_PASS) { setAuthenticated(true); setPwError(false); }
    else { setPwError(true); setTimeout(() => setPwError(false), 2000); }
  };

  // --- LOAD DATA ---
  useEffect(() => { if (!authenticated || !supabase) return; loadConfig(); loadProducts(); loadOrders(); }, [authenticated]);

  const loadConfig = async () => {
    try {
      const { data } = await supabase!.from('configuracion').select('*');
      if (data) {
        setConfigRows(data);
        const vals: Record<string, string> = {};
        data.forEach((r: ConfigRow) => { vals[r.id] = r.valor; });
        setCfgEdit(vals);
        setCfgOriginal(vals);
      }
    } catch {}
  };

  const loadProducts = async () => {
    try {
      const { data } = await supabase!.from('productos').select('*').order('created_at', { ascending: false });
      if (data) setProducts(data as ProductoRow[]);
    } catch {}
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data } = await supabase!.from('pedidos').select('*').order('created_at', { ascending: false });
      if (data) setOrders(data as PedidoRow[]);
    } catch {}
    setOrdersLoading(false);
  };

  // --- CONFIG ---
  const cfgChanged = configRows.filter(r => cfgEdit[r.id] !== cfgOriginal[r.id]).length;

  const handleCfgSave = async () => {
    if (!supabase) return;
    try {
      for (const row of configRows) {
        const v = cfgEdit[row.id] ?? row.valor;
        if (v !== cfgOriginal[row.id]) {
          await supabase.from('configuracion').upsert({ id: row.id, seccion: row.seccion, clave: row.clave, valor: v }, { onConflict: 'id' });
        }
      }
      setCfgOriginal({ ...cfgEdit });
      setCfgSaved(true);
      await reloadConfig();
      onConfigChange?.();
      setTimeout(() => setCfgSaved(false), 2000);
    } catch {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setUploading(true);
    setUploadTarget(key);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `uploads/${key}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
      if (urlData?.publicUrl) {
        setCfgEdit(prev => ({ ...prev, [key]: urlData.publicUrl }));
      }
    } catch (err: any) {
      alert('Error al subir: ' + (err.message || err));
    }
    setUploading(false);
    setUploadTarget('');
  };

  const cfgSections = [
    { key: 'hero', label: 'Hero' }, { key: 'marca', label: 'Marca' }, { key: 'secciones', label: 'Secciones' },
    { key: 'footer', label: 'Footer' }, { key: 'badges', label: 'Badges' }, { key: 'carrito', label: 'Carrito' }, { key: 'perfil', label: 'Perfil' },
  ];

  // --- PRODUCTS ---
  const emptyProduct: ProductoRow = {
    id: '', nombre: '', categoria_id: 'streetwear', precio: 0, precio_original: null,
    tecnica: '', tiempo_produccion: '⚡ 24-48 hrs', imagen: '', galeria: null,
    descripcion: '', etiqueta: '', opciones_ropa: null, opciones_vaso: null,
    personalizable: false, activo: true, destacado: false,
  };

  const startNewProduct = () => { setEditingProduct({ ...emptyProduct, id: `prod-${Date.now()}` }); setIsNewProduct(true); };

  const handleProdSave = async () => {
    if (!editingProduct || !supabase) return;
    setProdSaving(true);
    try {
      const { error } = await supabase.from('productos').upsert(editingProduct, { onConflict: 'id' });
      if (error) throw error;
      await loadProducts();
      setEditingProduct(null);
      setIsNewProduct(false);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setProdSaving(false);
  };

  const handleProdDelete = async (id: string) => {
    if (!supabase || !confirm('¿Eliminar este producto?')) return;
    await supabase.from('productos').delete().eq('id', id);
    await loadProducts();
    setEditingProduct(null);
  };

  const handleProdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imagen') => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !editingProduct) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `products/${editingProduct.id}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
      if (urlData?.publicUrl) {
        setEditingProduct(prev => prev ? { ...prev, [field]: urlData.publicUrl } : prev);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setUploading(false);
  };

  // --- ORDERS ---
  const handleOrderStatus = async (orderId: string, status: string) => {
    if (!supabase) return;
    await supabase.from('pedidos').update({ estado: status }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: status } : o));
  };

  // --- PREVIEW (live banner preview matching real HeroBanner) ---
  const PreviewBanner = () => (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#161814] via-[#0F110D] to-[#0A0A0A] p-4 space-y-3">
      <p className="text-[10px] font-bold text-[#D2E8A3] uppercase tracking-wider">Vista Previa — Hero Banner</p>
      
      <div className="rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#161814] via-[#0F110D] to-[#0A0A0A] p-4 space-y-3">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D2E8A3]/10 border border-[#D2E8A3]/30">
          <span className="text-[8px] text-[#D2E8A3]">🔥</span>
          <span className="text-[8px] font-bold text-[#D2E8A3] uppercase">{cfgEdit.hero_badge || 'Exclusivo — COLECCIÓN BAJO DEMANDA'}</span>
        </div>

        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Text side */}
          <div className="col-span-7 space-y-2">
            <h3 className="font-black text-xs uppercase leading-tight">
              <span className="text-white">{cfgEdit.hero_title_1 || 'MODA URBANA &'}</span>
              <br />
              <span className="text-[#D2E8A3]">{cfgEdit.hero_title_2 || 'VASOS SUBLIMADOS'}</span>
            </h3>
            <p className="text-[9px] text-gray-400 leading-snug">
              {cfgEdit.hero_subtitle_1 || 'Polos Sublimados con'}{' '}
              <span className="text-white font-bold">{cfgEdit.hero_subtitle_2 || 'Estampado Urbano HD High-Density'}</span>
              <br />
              {cfgEdit.hero_description || 'Sin sobre-stock. Fabricado especialmente para ti al confirmar tu orden.'}
            </p>
            <div className="flex gap-1">
              <span className="px-2 py-0.5 rounded bg-black/60 border border-white/15 text-[7px] text-gray-200 font-bold">
                {cfgEdit.hero_badge_1 || '⚡ Producción Express: 24 a 48 hrs'}
              </span>
              <span className="px-2 py-0.5 rounded bg-black/60 border border-white/15 text-[7px] text-gray-200 font-bold">
                {cfgEdit.hero_badge_2 || '🛡️ Garantía de Fijación Térmica'}
              </span>
            </div>
            <div className="flex gap-1.5">
              <span className="px-3 py-1.5 rounded-lg bg-[#D2E8A3] text-[#0A0A0A] text-[8px] font-extrabold">
                {cfgEdit.hero_cta_catalogo || 'EXPLORAR CATÁLOGO'}
              </span>
              <span className="px-3 py-1.5 rounded-lg border border-white/10 text-white text-[8px] font-bold">
                {cfgEdit.hero_cta_idea || 'Personalizar Mi Idea'}
              </span>
            </div>
          </div>

          {/* Media side */}
          <div className="col-span-5 grid grid-cols-2 gap-1.5">
            <div className="aspect-[4/5] rounded-lg overflow-hidden bg-black/40">
              {cfgEdit.hero_media_1_url ? (
                /\.(mp4|webm)$/i.test(cfgEdit.hero_media_1_url)
                  ? <video src={cfgEdit.hero_media_1_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  : <img src={cfgEdit.hero_media_1_url} className="w-full h-full object-cover" alt="" />
              ) : <div className="w-full h-full flex items-center justify-center text-gray-600 text-[8px]">Media 1</div>}
              <div className="relative -mt-6 p-1 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-[6px] font-mono text-[#D2E8A3]">{cfgEdit.hero_street_title || 'STREETWEAR'}</span>
                <span className="text-[7px] font-bold text-white block">{cfgEdit.hero_street_sub || 'Acid Tokyo 1988'}</span>
              </div>
            </div>
            <div className="aspect-[4/5] rounded-lg overflow-hidden bg-black/40 mt-3">
              {cfgEdit.hero_media_2_url ? (
                /\.(mp4|webm)$/i.test(cfgEdit.hero_media_2_url)
                  ? <video src={cfgEdit.hero_media_2_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  : <img src={cfgEdit.hero_media_2_url} className="w-full h-full object-cover" alt="" />
              ) : <div className="w-full h-full flex items-center justify-center text-gray-600 text-[8px]">Media 2</div>}
              <div className="relative -mt-6 p-1 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-[6px] font-mono text-[#D2E8A3]">{cfgEdit.hero_subli_title || 'SUBLIMACIÓN'}</span>
                <span className="text-[7px] font-bold text-white block">{cfgEdit.hero_subli_sub || 'Frosted Glass 16oz'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- RENDER ---
  if (!isOpen) return null;

  // PASSWORD
  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
        <div className={`relative w-full max-w-sm rounded-2xl border p-8 space-y-6 ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'}`} onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D2E8A3]/10 border border-[#D2E8A3]/30 flex items-center justify-center"><Lock className="w-6 h-6 text-[#D2E8A3]" /></div>
            <h2 className="text-lg font-extrabold uppercase">Admin Access</h2>
            <p className="text-xs text-gray-400">Contraseña requerida</p>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-mono transition-colors ${pwError ? 'border-red-500 bg-red-500/10' : isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'} focus:outline-none focus:border-[#D2E8A3]`}
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwError && <p className="text-xs text-red-400 text-center">Contraseña incorrecta</p>}
            <button onClick={handleLogin} className="w-full py-3 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-sm hover:bg-[#c2e088] transition-all shadow-lg">ENTRAR</button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4" onClick={onClose}>
      <div className={`relative w-full max-w-6xl max-h-[92vh] rounded-2xl border overflow-hidden flex flex-col ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'}`} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide">Admin Panel</h2>
            <p className="text-[10px] text-gray-400">LUMIN SHOP — Gestión completa</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-1 px-3 sm:px-4 py-2 border-b border-white/10 flex-shrink-0">
          {[
            { key: 'config' as const, label: 'Configuración', icon: Settings },
            { key: 'products' as const, label: 'Productos', icon: Package },
            { key: 'orders' as const, label: 'Pedidos', icon: Image },
          ].map(t => (
            <button key={t.key} onClick={() => { setMainTab(t.key); setEditingProduct(null); setIsNewProduct(false); }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all ${mainTab === t.key ? 'bg-[#D2E8A3] text-[#0A0A0A]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              <t.icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">

          {/* ========== CONFIG ========== */}
          {mainTab === 'config' && !editingProduct && (
            <div className="flex flex-col h-full">
              <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b border-white/10 flex-shrink-0">
                {cfgSections.map(s => (
                  <button key={s.key} onClick={() => setCfgSection(s.key)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${cfgSection === s.key ? 'bg-[#D2E8A3]/20 text-[#D2E8A3] border border-[#D2E8A3]/40' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Fields */}
                  <div className="space-y-3">
                    {configRows.filter(r => r.seccion === cfgSection).map(row => {
                      const changed = cfgEdit[row.id] !== cfgOriginal[row.id];
                      return (
                        <div key={row.id} className={`space-y-1.5 p-3 rounded-xl border transition-all ${changed ? 'border-[#D2E8A3]/40 bg-[#D2E8A3]/5' : 'border-transparent'}`}>
                          <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <span>{row.clave}</span>
                            <span className="text-[9px] font-mono text-gray-600">({row.id})</span>
                            {changed && <span className="text-[#D2E8A3]">●</span>}
                          </label>

                          {(row.id.includes('media')) && (
                            <div className="flex items-center gap-2 mb-1">
                              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${uploading && uploadTarget === row.id ? 'bg-yellow-500/20 text-yellow-400' : 'bg-[#D2E8A3]/10 text-[#D2E8A3] hover:bg-[#D2E8A3]/20'}`}>
                                <Upload className="w-3 h-3" />
                                {uploading && uploadTarget === row.id ? 'Subiendo...' : 'Subir archivo'}
                                <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={e => handleFileUpload(e, row.id)} disabled={uploading} />
                              </label>
                              <span className="text-[10px] text-gray-500">o pega URL:</span>
                            </div>
                          )}

                          <input type="text" value={cfgEdit[row.id] ?? ''}
                            onChange={e => setCfgEdit(prev => ({ ...prev, [row.id]: e.target.value }))}
                            className={`w-full px-3 py-2 rounded-xl border text-sm font-mono transition-colors ${isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'} focus:outline-none focus:border-[#D2E8A3]`}

                          />

                          {cfgEdit[row.id] && row.id.includes('media') && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-h-48">
                              {/\.(mp4|webm)$/i.test(cfgEdit[row.id])
                                ? <video src={cfgEdit[row.id]} className="w-full h-48 object-cover" autoPlay muted loop playsInline />
                                : <img src={cfgEdit[row.id]} className="w-full h-48 object-cover" alt="" />
                              }
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Live Preview */}
                  <div className="space-y-4">
                    {cfgSection === 'hero' && <PreviewBanner />}
                    
                    {cfgSection === 'marca' && (
                      <div className="rounded-xl overflow-hidden border border-white/10 bg-[#161814] p-4 space-y-2">
                        <p className="text-[10px] font-bold text-[#D2E8A3] uppercase">Vista Previa — Header / Marca</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#D2E8A3] rounded-lg flex items-center justify-center">
                            <span className="text-[#0A0A0A] font-extrabold text-sm">L</span>
                          </div>
                          <div>
                            <p className="text-white font-black text-sm">{cfgEdit.brand_name || 'LUMIN SHOP'}<span className="text-[#D2E8A3]">.</span></p>
                            <p className="text-gray-400 text-[8px] font-mono uppercase">{cfgEdit.brand_slogan || 'URBAN APPAREL & SUBLIMATION'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 text-[9px] text-gray-400">
                          <span>📱 {cfgEdit.brand_phone || '993 365 099'}</span>
                          <span>📍 {cfgEdit.brand_location || 'Lima, Perú'}</span>
                          <span>📸 {cfgEdit.brand_instagram || '@.lumin.shop'}</span>
                        </div>
                      </div>
                    )}

                    {cfgSection === 'footer' && (
                      <div className="rounded-xl overflow-hidden border border-white/10 bg-[#161814] p-4 space-y-2">
                        <p className="text-[10px] font-bold text-[#D2E8A3] uppercase">Vista Previa — Footer</p>
                        <p className="text-white font-bold text-xs">{cfgEdit.brand_name || 'LUMIN SHOP'}</p>
                        <p className="text-gray-400 text-[9px]">{cfgEdit.footer_description || 'Marca independiente...'}</p>
                        <p className="text-[#D2E8A3] text-[9px] font-bold">{cfgEdit.footer_production || 'Producción Express 24-48 hrs'}</p>
                        <div className="flex gap-2">
                          <span className="text-[8px] text-gray-500">{cfgEdit.brand_instagram || '@.lumin.shop'}</span>
                          <span className="text-[8px] text-gray-500">{cfgEdit.brand_tiktok || '@.lumin.shop'}</span>
                          <span className="text-[8px] text-gray-500">{cfgEdit.brand_facebook || '@.lumin.shop'}</span>
                        </div>
                        <p className="text-gray-600 text-[7px]">{cfgEdit.footer_copyright || '© 2026 LUMIN SHOP...'}</p>
                      </div>
                    )}

                    {cfgSection === 'carrito' && (
                      <div className="rounded-xl overflow-hidden border border-white/10 bg-[#161814] p-4 space-y-2">
                        <p className="text-[10px] font-bold text-[#D2E8A3] uppercase">Vista Previa — Carrito</p>
                        <p className="text-white font-bold text-xs">{cfgEdit.cart_empty_title || 'Tu pedido está vacío'}</p>
                        <p className="text-gray-400 text-[9px]">{cfgEdit.cart_empty_desc || 'Agrega polos...'}</p>
                        <span className="inline-block px-3 py-1.5 rounded-lg bg-[#D2E8A3] text-[#0A0A0A] text-[8px] font-extrabold">{cfgEdit.cart_empty_cta || 'IR AL CATÁLOGO'}</span>
                        <p className="text-white text-[9px] font-bold mt-2">{cfgEdit.cart_process_title || 'PROCESO DE FABRICACIÓN:'}</p>
                        <p className="text-gray-400 text-[8px]">{cfgEdit.cart_process_desc || 'Envías la orden...'}</p>
                      </div>
                    )}

                    {(cfgSection !== 'hero' && cfgSection !== 'marca' && cfgSection !== 'footer' && cfgSection !== 'carrito') && (
                      <div className={`p-4 rounded-xl border ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'}`}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Valores — {cfgSections.find(s => s.key === cfgSection)?.label}</p>
                        <div className="space-y-1.5">
                          {configRows.filter(r => r.seccion === cfgSection).map(r => (
                            <div key={r.id} className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500 w-24 truncate flex-shrink-0">{r.clave}:</span>
                              <span className={`text-xs truncate ${cfgEdit[r.id] !== cfgOriginal[r.id] ? 'text-[#D2E8A3] font-bold' : 'text-gray-300'}`}>
                                {cfgEdit[r.id] || '(vacío)'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Config Footer */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {cfgSaved && <span className="text-xs text-green-400 font-bold">✓ Guardado</span>}
                  {cfgChanged > 0 && <span className="text-xs text-[#D2E8A3] font-bold">{cfgChanged} cambio{cfgChanged > 1 ? 's' : ''}</span>}
                </div>
                <button onClick={handleCfgSave} disabled={cfgChanged === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${cfgChanged > 0 ? 'bg-[#D2E8A3] text-[#0A0A0A] hover:bg-[#c2e088] shadow-lg' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}>
                  <Save className="w-4 h-4" /> Guardar ({cfgChanged})
                </button>
              </div>
            </div>
          )}

          {/* ========== PRODUCTS ========== */}
          {mainTab === 'products' && (
            <div className="flex flex-col h-full">
              {/* Product List / Edit */}
              {editingProduct ? (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  <button onClick={() => { setEditingProduct(null); setIsNewProduct(false); }} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-2">
                    <ArrowLeft className="w-4 h-4" /> Volver a productos
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-extrabold uppercase">{isNewProduct ? 'Nuevo Producto' : 'Editar: ' + editingProduct.nombre}</h3>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">ID del producto</label>
                          <input value={editingProduct.id} onChange={e => setEditingProduct(p => p ? { ...p, id: e.target.value } : p)} disabled={!isNewProduct}
                            className="w-full px-3 py-2 rounded-xl border text-sm font-mono bg-white/5 border-white/10 text-white focus:outline-none focus:border-[#D2E8A3] disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Nombre</label>
                          <input value={editingProduct.nombre} onChange={e => setEditingProduct(p => p ? { ...p, nombre: e.target.value } : p)}
                            className="w-full px-3 py-2 rounded-xl border text-sm bg-white/5 border-white/10 text-white focus:outline-none focus:border-[#D2E8A3]" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Categoría</label>
                            <select value={editingProduct.categoria_id} onChange={e => setEditingProduct(p => p ? { ...p, categoria_id: e.target.value } : p)}
                              className="w-full px-3 py-2 rounded-xl border text-sm bg-white/5 border-white/10 text-white focus:outline-none focus:border-[#D2E8A3]">
                              <option value="streetwear">Polos Sublimados</option>
                              <option value="cups">Vasos/Tazas</option>
                              <option value="drops">Placas de Aluminio</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Etiqueta</label>
                            <input value={editingProduct.etiqueta || ''} onChange={e => setEditingProduct(p => p ? { ...p, etiqueta: e.target.value } : p)}
                              className="w-full px-3 py-2 rounded-xl border text-sm bg-white/5 border-white/10 text-white focus:outline-none focus:border-[#D2E8A3]" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Precio (S/)</label>
                            <input type="number" step="0.01" value={editingProduct.precio} onChange={e => setEditingProduct(p => p ? { ...p, precio: parseFloat(e.target.value) || 0 } : p)}
                              className="w-full px-3 py-2 rounded-xl border text-sm bg-white/5 border-white/10 text-white focus:outline-none focus:border-[#D2E8A3]" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Precio original (S/)</label>
                            <input type="number" step="0.01" value={editingProduct.precio_original ?? ''} onChange={e => setEditingProduct(p => p ? { ...p, precio_original: e.target.value ? parseFloat(e.target.value) : null } : p)}
                              className="w-full px-3 py-2 rounded-xl border text-sm bg-white/5 border-white/10 text-white focus:outline-none focus:border-[#D2E8A3]" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Técnica</label>
                          <input value={editingProduct.tecnica || ''} onChange={e => setEditingProduct(p => p ? { ...p, tecnica: e.target.value } : p)}
                            className="w-full px-3 py-2 rounded-xl border text-sm bg-white/5 border-white/10 text-white focus:outline-none focus:border-[#D2E8A3]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Tiempo producción</label>
                          <input value={editingProduct.tiempo_produccion || ''} onChange={e => setEditingProduct(p => p ? { ...p, tiempo_produccion: e.target.value } : p)}
                            className="w-full px-3 py-2 rounded-xl border text-sm bg-white/5 border-white/10 text-white focus:outline-none focus:border-[#D2E8A3]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Descripción</label>
                          <textarea rows={3} value={editingProduct.descripcion || ''} onChange={e => setEditingProduct(p => p ? { ...p, descripcion: e.target.value } : p)}
                            className="w-full px-3 py-2 rounded-xl border text-sm bg-white/5 border-white/10 text-white focus:outline-none focus:border-[#D2E8A3] resize-none" />
                        </div>

                        {/* Image: URL or File */}
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Imagen principal</label>
                          <input value={editingProduct.imagen || ''} onChange={e => setEditingProduct(p => p ? { ...p, imagen: e.target.value } : p)} placeholder="Pega URL de imagen..."
                            className="w-full px-3 py-2 rounded-xl border text-sm bg-white/5 border-white/10 text-white focus:outline-none focus:border-[#D2E8A3] mb-2" />
                          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#D2E8A3]/10 text-[#D2E8A3] text-xs font-bold cursor-pointer hover:bg-[#D2E8A3]/20 w-fit">
                            <Upload className="w-3.5 h-3.5" />
                            {uploading ? 'Subiendo...' : 'O subir desde archivos'}
                            <input type="file" accept="image/*" className="hidden" onChange={e => handleProdImageUpload(e, 'imagen')} disabled={uploading} />
                          </label>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editingProduct.activo} onChange={e => setEditingProduct(p => p ? { ...p, activo: e.target.checked } : p)} className="accent-[#D2E8A3]" />
                            <span className="text-xs font-bold text-gray-400">Activo</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editingProduct.destacado} onChange={e => setEditingProduct(p => p ? { ...p, destacado: e.target.checked } : p)} className="accent-[#D2E8A3]" />
                            <span className="text-xs font-bold text-gray-400">Destacado</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editingProduct.personalizable} onChange={e => setEditingProduct(p => p ? { ...p, personalizable: e.target.checked } : p)} className="accent-[#D2E8A3]" />
                            <span className="text-xs font-bold text-gray-400">Personalizable</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-extrabold uppercase text-[#D2E8A3]">Vista Previa</h3>
                      <div className={`rounded-2xl overflow-hidden border border-white/10 ${isLight ? 'bg-white' : 'bg-[#161814]'}`}>
                        <div className="aspect-square overflow-hidden bg-black/40">
                          {editingProduct.imagen ? (
                            <img src={editingProduct.imagen} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin imagen</div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          {editingProduct.etiqueta && (
                            <span className="inline-block px-2 py-0.5 rounded bg-black/80 text-[#D2E8A3] text-[10px] font-bold">{editingProduct.etiqueta}</span>
                          )}
                          <p className="text-white font-extrabold text-sm">{editingProduct.nombre || 'Nombre del producto'}</p>
                          <p className="text-gray-400 text-xs line-clamp-2">{editingProduct.descripcion || 'Descripción...'}</p>
                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-[#D2E8A3] font-black text-lg">S/ {editingProduct.precio.toFixed(2)}</span>
                            {editingProduct.precio_original && <span className="text-gray-500 text-xs line-through">S/ {editingProduct.precio_original.toFixed(2)}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Save/Delete */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    {!isNewProduct && (
                      <button onClick={() => handleProdDelete(editingProduct.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20">
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </button>
                    )}
                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => { setEditingProduct(null); setIsNewProduct(false); }}
                        className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-bold hover:bg-white/10">Cancelar</button>
                      <button onClick={handleProdSave} disabled={prodSaving || !editingProduct.nombre}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-sm hover:bg-[#c2e088] shadow-lg disabled:opacity-50">
                        {prodSaving ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar</>}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Product Grid */
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase">{products.length} Productos</h3>
                    <button onClick={startNewProduct} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs hover:bg-[#c2e088] shadow-lg">
                      <Plus className="w-4 h-4" /> Nuevo Producto
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {products.map(p => (
                      <div key={p.id} onClick={() => setEditingProduct(p)}
                        className={`rounded-2xl overflow-hidden border cursor-pointer transition-all hover:border-[#D2E8A3]/40 ${isLight ? 'bg-white border-slate-200' : 'bg-[#161814] border-white/10'}`}>
                        <div className="aspect-video overflow-hidden bg-black/20">
                          {p.imagen ? <img src={p.imagen} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin imagen</div>}
                        </div>
                        <div className="p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            {!p.activo && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">INACTIVO</span>}
                            {p.destacado && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D2E8A3]/20 text-[#D2E8A3] font-bold">★</span>}
                          </div>
                          <p className="text-white text-xs font-extrabold truncate">{p.nombre}</p>
                          <p className="text-[#D2E8A3] text-xs font-bold">S/ {p.precio.toFixed(2)}</p>
                          <p className="text-gray-500 text-[10px]">{p.categoria_id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========== ORDERS ========== */}
          {mainTab === 'orders' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {ordersLoading ? (
                <p className="text-sm text-gray-400 text-center py-10">Cargando pedidos...</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No hay pedidos aún</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className={`p-4 rounded-xl border ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-gray-500">{order.id.slice(0, 12)}...</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.estado === 'entregado' ? 'bg-green-500/20 text-green-400'
                            : order.estado === 'enviado' ? 'bg-blue-500/20 text-blue-400'
                            : order.estado === 'produccion' ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-white/10 text-gray-400'
                          }`}>{order.estado || 'pendiente'}</span>
                        </div>
                        <p className="text-xs text-gray-400">{order.cliente_nombre || 'Sin nombre'} — {order.cliente_telefono || 'Sin tel'}</p>
                        <p className="text-xs text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleString('es-PE') : ''}</p>
                      </div>
                      <div className="text-right space-y-2 flex-shrink-0">
                        <p className="text-sm font-extrabold text-[#D2E8A3]">S/ {order.total?.toFixed(2)}</p>
                        <select value={order.estado || 'pendiente'} onChange={e => handleOrderStatus(order.id, e.target.value)}
                          className="text-[11px] font-bold px-2 py-1 rounded-lg border bg-white/5 text-gray-400 border-white/10">
                          <option value="pendiente">Pendiente</option>
                          <option value="produccion">Producción</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregado">Entregado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
