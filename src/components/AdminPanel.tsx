import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  X, Upload, Save, Eye, EyeOff, Lock, Package, Settings, Image, Plus, Trash2,
  ArrowLeft, Check, ShoppingCart, Sliders, Sun, Home, LayoutGrid, Heart, FileText,
  User, ChevronRight, RefreshCw,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { reloadConfig } from '../lib/config';

const DEFAULT_ADMIN_PASS = 'Ratitaxd12';
type AdminTab = 'inicio' | 'catalogo' | 'favoritos' | 'pedidos' | 'cuenta';

interface AdminPanelProps { isOpen: boolean; onClose: () => void; onConfigChange?: () => void; }
interface ConfigRow { id: string; seccion: string; clave: string; valor: string; }
interface ProductoRow { id: string; nombre: string; categoria_id: string; precio: number; precio_original: number | null; tecnica: string; tiempo_produccion: string; imagen: string; galeria: any; descripcion: string; etiqueta: string; opciones_ropa: any; opciones_vaso: any; personalizable: boolean; activo: boolean; destacado: boolean; }
interface PedidoRow { id: string; usuario_id: string; cliente_nombre: string; cliente_telefono: string; cliente_direccion: string; productos: any; total: number; estado: string; created_at: string; }

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onConfigChange }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [mainTab, setMainTab] = useState<AdminTab>('inicio');
  const [adminPass, setAdminPass] = useState(DEFAULT_ADMIN_PASS);

  const [configRows, setConfigRows] = useState<ConfigRow[]>([]);
  const [cfgEdit, setCfgEdit] = useState<Record<string, string>>({});
  const [cfgOriginal, setCfgOriginal] = useState<Record<string, string>>({});
  const [cfgSaved, setCfgSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState('');

  const [products, setProducts] = useState<ProductoRow[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductoRow | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [prodSaving, setProdSaving] = useState(false);

  const [orders, setOrders] = useState<PedidoRow[]>([]);

  useEffect(() => { if (!isOpen) { setAuthenticated(false); setPw(''); setEditingProduct(null); } }, [isOpen]);
  useEffect(() => { if (isOpen && supabase) { supabase.from('configuracion').select('valor').eq('id', 'admin_password').single().then(({ data }) => { if (data?.valor) setAdminPass(data.valor); }); } }, [isOpen]);
  const handleLogin = () => { if (pw === adminPass) { setAuthenticated(true); setPwError(false); } else { setPwError(true); setTimeout(() => setPwError(false), 2000); } };

  useEffect(() => { if (!authenticated || !supabase) return; loadConfig(); loadProducts(); loadOrders(); }, [authenticated]);

  const loadConfig = async () => { try { const { data } = await supabase!.from('configuracion').select('*'); if (data) { setConfigRows(data); const v: Record<string, string> = {}; data.forEach((r: ConfigRow) => { v[r.id] = r.valor; }); setCfgEdit(v); setCfgOriginal(v); } } catch {} };
  const loadProducts = async () => { try { const { data } = await supabase!.from('productos').select('*').order('created_at', { ascending: false }); if (data) setProducts(data as ProductoRow[]); } catch {} };
  const loadOrders = async () => { try { const { data } = await supabase!.from('pedidos').select('*').order('created_at', { ascending: false }); if (data) setOrders(data as PedidoRow[]); } catch {} };

  const cfgChanged = useMemo(() => configRows.filter(r => cfgEdit[r.id] !== cfgOriginal[r.id]).length, [configRows, cfgEdit, cfgOriginal]);

  const handleCfgSave = async () => {
    if (!supabase) return;
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
  };

  const setCfg = useCallback((key: string, value: string) => {
    setCfgEdit(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0]; if (!file || !supabase) return;
    setUploading(true); setUploadTarget(key);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `uploads/${key}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
      if (urlData?.publicUrl) setCfgEdit(prev => ({ ...prev, [key]: urlData.publicUrl }));
    } catch (err: any) { alert('Error: ' + (err.message || err)); }
    setUploading(false); setUploadTarget('');
  };

  const startNewProduct = () => {
    setEditingProduct({ id: `prod-${Date.now()}`, nombre: '', categoria_id: 'streetwear', precio: 0, precio_original: null, tecnica: '', tiempo_produccion: '24-48 hrs', imagen: '', galeria: null, descripcion: '', etiqueta: '', opciones_ropa: null, opciones_vaso: null, personalizable: false, activo: true, destacado: false });
    setIsNewProduct(true);
  };
  const handleProdSave = async () => {
    if (!editingProduct || !supabase) return;
    if (!editingProduct.nombre.trim()) { alert('El nombre es obligatorio'); return; }
    setProdSaving(true);
    try {
      const { error } = await supabase.from('productos').upsert({
        id: editingProduct.id, nombre: editingProduct.nombre, categoria_id: editingProduct.categoria_id,
        precio: editingProduct.precio, precio_original: editingProduct.precio_original,
        tecnica: editingProduct.tecnica, tiempo_produccion: editingProduct.tiempo_produccion,
        imagen: editingProduct.imagen, galeria: editingProduct.galeria, descripcion: editingProduct.descripcion,
        etiqueta: editingProduct.etiqueta, opciones_ropa: editingProduct.opciones_ropa, opciones_vaso: editingProduct.opciones_vaso,
        personalizable: editingProduct.personalizable, activo: editingProduct.activo, destacado: editingProduct.destacado,
      }, { onConflict: 'id' });
      if (error) throw error;
      await loadProducts(); setEditingProduct(null); setIsNewProduct(false);
    } catch (err: any) { alert('Error: ' + (err.message || JSON.stringify(err))); }
    setProdSaving(false);
  };
  const handleProdDelete = async (id: string) => { if (!supabase || !confirm('Eliminar producto?')) return; await supabase.from('productos').delete().eq('id', id); await loadProducts(); setEditingProduct(null); };
  const handleProdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !supabase || !editingProduct) return;
    setUploading(true);
    try { const ext = file.name.split('.').pop() || 'jpg'; const path = `products/${editingProduct.id}_${Date.now()}.${ext}`; const { error } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false }); if (error) throw error; const { data: urlData } = supabase.storage.from('media').getPublicUrl(path); if (urlData?.publicUrl) setEditingProduct(p => p ? { ...p, imagen: urlData.publicUrl } : p); } catch (err: any) { alert('Error: ' + err.message); }
    setUploading(false);
  };
  const handleOrderStatus = async (orderId: string, status: string) => { if (!supabase) return; await supabase.from('pedidos').update({ estado: status }).eq('id', orderId); setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: status } : o)); };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#1a1d1a] border-[#333] placeholder-gray-500 focus:outline-none focus:border-[#D2E8A3] focus:ring-1 focus:ring-[#D2E8A3]/30 transition-all';
  const labelCls = 'block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5';

  if (!isOpen) return null;

  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0A0A0A] p-8 space-y-6" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D2E8A3]/10 border border-[#D2E8A3]/30 flex items-center justify-center"><Lock className="w-6 h-6 text-[#D2E8A3]" /></div>
            <h2 className="text-lg font-extrabold uppercase text-white">Admin</h2>
            <p className="text-xs text-gray-400">Contraseña requerida</p>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••"
                className={`${inputCls} ${pwError ? 'border-red-500' : ''}`} />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            {pwError && <p className="text-xs text-red-400 text-center">Contraseña incorrecta</p>}
            <button onClick={handleLogin} className="w-full py-3 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-sm hover:bg-[#c2e088] transition-all shadow-lg">ENTRAR</button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: any }[] = [
    { key: 'inicio', label: 'Inicio', icon: Home },
    { key: 'catalogo', label: 'Catálogo', icon: LayoutGrid },
    { key: 'favoritos', label: 'Favoritos', icon: Heart },
    { key: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
    { key: 'cuenta', label: 'Mi Cuenta', icon: User },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-2" onClick={onClose}>
      <div className="relative w-full h-full sm:max-w-[96vw] sm:max-h-[94vh] sm:rounded-2xl border-0 sm:border border-white/10 bg-[#0A0A0A] overflow-hidden flex flex-col text-white" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 flex-shrink-0 bg-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D2E8A3] flex items-center justify-center"><span className="text-[#0A0A0A] font-extrabold text-sm">L</span></div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">Admin Panel</h2>
              <p className="text-[9px] text-gray-500 font-mono">LUMIN SHOP CMS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cfgChanged > 0 && (
              <span className="text-[10px] font-bold text-[#D2E8A3] bg-[#D2E8A3]/10 px-2 py-1 rounded-lg">{cfgChanged} cambio{cfgChanged > 1 ? 's' : ''}</span>
            )}
            {cfgSaved && <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">Guardado</span>}
            <button onClick={handleCfgSave} disabled={cfgChanged === 0}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-extrabold text-[11px] transition-all ${cfgChanged > 0 ? 'bg-[#D2E8A3] text-[#0A0A0A] hover:bg-[#c2e088] shadow-lg' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}>
              <Save className="w-3.5 h-3.5" /> Guardar
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 py-2 border-b border-white/10 flex-shrink-0 overflow-x-auto bg-[#0A0A0A]">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setMainTab(t.key); setEditingProduct(null); setIsNewProduct(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${mainTab === t.key ? 'bg-[#D2E8A3] text-[#0A0A0A] shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              <t.icon className="w-3.5 h-3.5" /><span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
          {mainTab === 'inicio' && <TabInicio cfgEdit={cfgEdit} setCfg={setCfg} configRows={configRows} handleFileUpload={handleFileUpload} uploading={uploading} uploadTarget={uploadTarget} inputCls={inputCls} labelCls={labelCls} />}
          {mainTab === 'catalogo' && <TabCatalogo cfgEdit={cfgEdit} setCfg={setCfg} configRows={configRows} products={products} editingProduct={editingProduct} setEditingProduct={setEditingProduct} isNewProduct={isNewProduct} startNewProduct={startNewProduct} handleProdSave={handleProdSave} handleProdDelete={handleProdDelete} handleProdImageUpload={handleProdImageUpload} prodSaving={prodSaving} uploading={uploading} inputCls={inputCls} labelCls={labelCls} />}
          {mainTab === 'favoritos' && <TabFavoritos cfgEdit={cfgEdit} setCfg={setCfg} configRows={configRows} inputCls={inputCls} labelCls={labelCls} />}
          {mainTab === 'pedidos' && <TabPedidos orders={orders} handleOrderStatus={handleOrderStatus} />}
          {mainTab === 'cuenta' && <TabCuenta cfgEdit={cfgEdit} setCfg={setCfg} configRows={configRows} inputCls={inputCls} labelCls={labelCls} />}
        </div>
      </div>
    </div>
  );
};

/* ─── Shared field component ─── */
const CfgField = memo(({ id, label, value, onChange, type = 'text', placeholder, isMedia, handleFileUpload, uploading, uploadTarget, multiline, rows = 3 }: {
  id: string; label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
  isMedia?: boolean; handleFileUpload?: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void;
  uploading?: boolean; uploadTarget?: string; multiline?: boolean; rows?: number;
}) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">{label}</label>
    {isMedia && (
      <div className="flex items-center gap-2 mb-1">
        <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${uploading && uploadTarget === id ? 'bg-yellow-500/20 text-yellow-400' : 'bg-[#D2E8A3]/10 text-[#D2E8A3] hover:bg-[#D2E8A3]/20'}`}>
          <Upload className="w-3 h-3" />{uploading && uploadTarget === id ? 'Subiendo...' : 'Subir archivo'}
          <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={e => handleFileUpload?.(e, id)} disabled={uploading} />
        </label>
        <span className="text-[10px] text-gray-500">o pega URL:</span>
      </div>
    )}
    {multiline ? (
      <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#1a1d1a] border-[#333] placeholder-gray-500 focus:outline-none focus:border-[#D2E8A3] focus:ring-1 focus:ring-[#D2E8A3]/30 transition-all resize-none" />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#1a1d1a] border-[#333] placeholder-gray-500 focus:outline-none focus:border-[#D2E8A3] focus:ring-1 focus:ring-[#D2E8A3]/30 transition-all" />
    )}
    {isMedia && value && (
      <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-h-48">
        {/\.(mp4|webm)$/i.test(value) ? <video src={value} className="w-full h-48 object-cover" autoPlay muted loop playsInline /> : <img src={value} className="w-full h-48 object-cover" alt="" />}
      </div>
    )}
  </div>
));
CfgField.displayName = 'CfgField';

/* ─── Section wrapper ─── */
const Section = memo(({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/10 bg-[#161814] overflow-hidden">
    <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
      {icon}
      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">{title}</h3>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
));
Section.displayName = 'Section';

/* ─── TAB: INICIO ─── */
const TabInicio = memo(({ cfgEdit, setCfg, configRows, handleFileUpload, uploading, uploadTarget, inputCls, labelCls }: any) => {
  const heroRows = useMemo(() => configRows.filter((r: ConfigRow) => r.seccion === 'hero'), [configRows]);
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Hero Banner */}
      <Section title="Hero Banner" icon={<Home className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <CfgField id="hero_badge" label="Badge" value={cfgEdit.hero_badge || ''} onChange={v => setCfg('hero_badge', v)} placeholder="Exclusivo — COLECCIÓN BAJO DEMANDA" />
            <CfgField id="hero_title_1" label="Título Línea 1" value={cfgEdit.hero_title_1 || ''} onChange={v => setCfg('hero_title_1', v)} placeholder="MODA URBANA &" />
            <CfgField id="hero_title_2" label="Título Línea 2" value={cfgEdit.hero_title_2 || ''} onChange={v => setCfg('hero_title_2', v)} placeholder="VASOS SUBLIMADOS" />
            <CfgField id="hero_subtitle_1" label="Subtítulo 1" value={cfgEdit.hero_subtitle_1 || ''} onChange={v => setCfg('hero_subtitle_1', v)} placeholder="Polos Sublimados con" />
            <CfgField id="hero_subtitle_2" label="Subtítulo 2 (bold)" value={cfgEdit.hero_subtitle_2 || ''} onChange={v => setCfg('hero_subtitle_2', v)} placeholder="Estampado Urbano HD High-Density" />
            <CfgField id="hero_description" label="Descripción" value={cfgEdit.hero_description || ''} onChange={v => setCfg('hero_description', v)} placeholder="Sin sobre-stock. Fabricado para ti..." multiline rows={2} />
            <CfgField id="hero_badge_1" label="Badge Izq" value={cfgEdit.hero_badge_1 || ''} onChange={v => setCfg('hero_badge_1', v)} placeholder="Producción Express: 24 a 48 hrs" />
            <CfgField id="hero_badge_2" label="Badge Der" value={cfgEdit.hero_badge_2 || ''} onChange={v => setCfg('hero_badge_2', v)} placeholder="Garantía de Fijación Térmica & Color" />
            <CfgField id="hero_cta_catalogo" label="CTA Catálogo" value={cfgEdit.hero_cta_catalogo || ''} onChange={v => setCfg('hero_cta_catalogo', v)} placeholder="EXPLORAR CATÁLOGO" />
            <CfgField id="hero_cta_idea" label="CTA Idea" value={cfgEdit.hero_cta_idea || ''} onChange={v => setCfg('hero_cta_idea', v)} placeholder="Personalizar Mi Idea" />
          </div>
          {/* Live Preview */}
          <div className="rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#161814] via-[#0F110D] to-[#0A0A0A] p-6 space-y-4 relative">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full blur-3xl bg-[#D2E8A3]/10 pointer-events-none"></div>
            <p className="text-[9px] font-bold text-[#D2E8A3] uppercase tracking-wider relative z-10">Preview — Hero Banner</p>
            <div className="relative z-10 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-7 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D2E8A3]/10 border border-[#D2E8A3]/30">
                  <span className="text-[8px] font-bold text-[#D2E8A3] uppercase">{cfgEdit.hero_badge || 'Badge'}</span>
                </div>
                <h3 className="font-display font-extrabold leading-tight uppercase tracking-tight">
                  <span className="text-white text-sm block">{cfgEdit.hero_title_1 || 'Título 1'}</span>
                  <span className="text-[#D2E8A3] text-sm block">{cfgEdit.hero_title_2 || 'Título 2'}</span>
                </h3>
                <p className="text-[9px] text-gray-400 leading-relaxed">
                  {cfgEdit.hero_subtitle_1 || ''} <span className="text-white font-bold">{cfgEdit.hero_subtitle_2 || ''}</span>
                  <br />{cfgEdit.hero_description || ''}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 border border-white/15 text-[7px] font-bold text-gray-200">
                    <span className="text-[#D2E8A3]">⚡</span> {cfgEdit.hero_badge_1 || 'Badge 1'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 border border-white/15 text-[7px] font-bold text-gray-200">
                    <span className="text-[#D2E8A3]">🛡️</span> {cfgEdit.hero_badge_2 || 'Badge 2'}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <span className="px-3 py-1.5 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] text-[8px] font-extrabold shadow-lg">{cfgEdit.hero_cta_catalogo || 'CTA 1'}</span>
                  <span className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white text-[8px] font-bold">{cfgEdit.hero_cta_idea || 'CTA 2'}</span>
                </div>
              </div>
              <div className="col-span-5 grid grid-cols-2 gap-2 relative">
                <div className="relative group overflow-hidden rounded-2xl border border-white/10 aspect-[4/5]">
                  {cfgEdit.hero_media_1_url ? (/\.(mp4|webm)$/i.test(cfgEdit.hero_media_1_url) ? <video src={cfgEdit.hero_media_1_url} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <img src={cfgEdit.hero_media_1_url} className="w-full h-full object-cover" alt="" />) : <div className="w-full h-full flex items-center justify-center text-gray-600 text-[7px] bg-[#161814]">Media 1</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end">
                    <span className="text-[7px] font-mono text-[#D2E8A3] uppercase">{cfgEdit.hero_street_title || 'STREETWEAR'}</span>
                    <span className="text-[8px] font-bold text-white">{cfgEdit.hero_street_sub || 'Acid Tokyo 1988'}</span>
                  </div>
                </div>
                <div className="relative group overflow-hidden rounded-2xl border border-white/10 aspect-[4/5] mt-4">
                  {cfgEdit.hero_media_2_url ? (/\.(mp4|webm)$/i.test(cfgEdit.hero_media_2_url) ? <video src={cfgEdit.hero_media_2_url} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <img src={cfgEdit.hero_media_2_url} className="w-full h-full object-cover" alt="" />) : <div className="w-full h-full flex items-center justify-center text-gray-600 text-[7px] bg-[#161814]">Media 2</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end">
                    <span className="text-[7px] font-mono text-[#D2E8A3] uppercase">{cfgEdit.hero_subli_title || 'SUBLIMACIÓN'}</span>
                    <span className="text-[8px] font-bold text-white">{cfgEdit.hero_subli_sub || 'Frosted Glass 16oz'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Hero Media Settings */}
      <Section title="Media — Tamaño & Opacidad" icon={<Sliders className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(n => (
            <div key={n} className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Media {n}</p>
              <CfgField id={`hero_media_${n}_url`} label={`URL Media ${n}`} value={cfgEdit[`hero_media_${n}_url`] || ''} onChange={v => setCfg(`hero_media_${n}_url`, v)} isMedia handleFileUpload={handleFileUpload} uploading={uploading} uploadTarget={uploadTarget} placeholder="https://... o sube un archivo" />
              <CfgField id={`hero_street_${n === 1 ? 'title' : 'sub'}`} label={n === 1 ? 'Street Title' : 'Subli Sub'} value={cfgEdit[n === 1 ? 'hero_street_title' : 'hero_subli_sub'] || ''} onChange={v => setCfg(n === 1 ? 'hero_street_title' : 'hero_subli_sub', v)} />
              <CfgField id={`hero_street_${n === 1 ? 'sub' : 'title'}`} label={n === 1 ? 'Street Sub' : 'Subli Title'} value={cfgEdit[n === 1 ? 'hero_street_sub' : 'hero_subli_title'] || ''} onChange={v => setCfg(n === 1 ? 'hero_street_sub' : 'hero_subli_title', v)} />
            </div>
          ))}
        </div>
      </Section>

      {/* Badges / Process */}
      <Section title="Barra de Proceso" icon={<Package className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
        <CfgField id="badge_model_title" label="Título" value={cfgEdit.badge_model_title || ''} onChange={v => setCfg('badge_model_title', v)} placeholder="MODELO SUSTENTABLE BAJO DEMANDA" />
        <CfgField id="badge_model_subtitle" label="Subtítulo" value={cfgEdit.badge_model_subtitle || ''} onChange={v => setCfg('badge_model_subtitle', v)} placeholder="¿CÓMO FUNCIONA LUMIN SHOP?" />
        {[1, 2, 3].map(i => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <CfgField id={`badge_step${i}_title`} label={`Paso ${i} — Título`} value={cfgEdit[`badge_step${i}_title`] || ''} onChange={v => setCfg(`badge_step${i}_title`, v)} />
            <CfgField id={`badge_step${i}_desc`} label={`Paso ${i} — Descripción`} value={cfgEdit[`badge_step${i}_desc`] || ''} onChange={v => setCfg(`badge_step${i}_desc`, v)} />
          </div>
        ))}
      </Section>

      {/* About / Featured sections */}
      <Section title="Secciones" icon={<FileText className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
        <CfgField id="section_about_title" label="Título Sobre Nosotros" value={cfgEdit.section_about_title || ''} onChange={v => setCfg('section_about_title', v)} />
        <CfgField id="section_about_subtitle" label="Subtítulo" value={cfgEdit.section_about_subtitle || ''} onChange={v => setCfg('section_about_subtitle', v)} />
        <CfgField id="section_about_text" label="Descripción" value={cfgEdit.section_about_text || ''} onChange={v => setCfg('section_about_text', v)} multiline rows={4} />
        <div className="grid grid-cols-2 gap-3">
          <CfgField id="section_featured_title" label="Título Destacados" value={cfgEdit.section_featured_title || ''} onChange={v => setCfg('section_featured_title', v)} />
          <CfgField id="section_featured_sub" label="Subtítulo Destacados" value={cfgEdit.section_featured_sub || ''} onChange={v => setCfg('section_featured_sub', v)} />
        </div>
      </Section>

      {/* Social Quick */}
      <Section title="Social Quick Bar" icon={<Image className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
        <CfgField id="social_title" label="Título" value={cfgEdit.social_title || ''} onChange={v => setCfg('social_title', v)} />
        <CfgField id="social_text" label="Texto" value={cfgEdit.social_text || ''} onChange={v => setCfg('social_text', v)} />
        <CfgField id="social_subtitle" label="Subtítulo" value={cfgEdit.social_subtitle || ''} onChange={v => setCfg('social_subtitle', v)} />
      </Section>
    </div>
  );
});
TabInicio.displayName = 'TabInicio';

/* ─── TAB: CATÁLOGO ─── */
const TabCatalogo = memo(({ cfgEdit, setCfg, configRows, products, editingProduct, setEditingProduct, isNewProduct, startNewProduct, handleProdSave, handleProdDelete, handleProdImageUpload, prodSaving, uploading, inputCls, labelCls }: any) => {
  if (editingProduct) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <button onClick={() => { setEditingProduct(null); }} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-2">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Section title={isNewProduct ? 'Nuevo Producto' : 'Editar Producto'} icon={<Package className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
              <div><label className={labelCls}>ID</label><input value={editingProduct.id} onChange={(e: any) => setEditingProduct((p: any) => p ? { ...p, id: e.target.value } : p)} disabled={!isNewProduct} className={`${inputCls} font-mono disabled:opacity-40`} /></div>
              <div><label className={labelCls}>Nombre *</label><input value={editingProduct.nombre} onChange={(e: any) => setEditingProduct((p: any) => p ? { ...p, nombre: e.target.value } : p)} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Categoría</label><select value={editingProduct.categoria_id} onChange={(e: any) => setEditingProduct((p: any) => p ? { ...p, categoria_id: e.target.value } : p)} className={inputCls}><option value="streetwear">Polos Sublimados</option><option value="cups">Vasos/Tazas</option><option value="drops">Placas de Aluminio</option></select></div>
                <div><label className={labelCls}>Etiqueta</label><input value={editingProduct.etiqueta || ''} onChange={(e: any) => setEditingProduct((p: any) => p ? { ...p, etiqueta: e.target.value } : p)} placeholder="BESTSELLER" className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Precio (S/)</label><input type="number" step="0.01" min="0" value={editingProduct.precio} onChange={(e: any) => setEditingProduct((p: any) => p ? { ...p, precio: parseFloat(e.target.value) || 0 } : p)} className={inputCls} /></div>
                <div><label className={labelCls}>Precio original (S/)</label><input type="number" step="0.01" min="0" value={editingProduct.precio_original ?? ''} onChange={(e: any) => setEditingProduct((p: any) => p ? { ...p, precio_original: e.target.value ? parseFloat(e.target.value) : null } : p)} placeholder="Opcional" className={inputCls} /></div>
              </div>
              <CfgField id="editing_tecnica" label="Técnica" value={editingProduct.tecnica || ''} onChange={(v: string) => setEditingProduct((p: any) => p ? { ...p, tecnica: v } : p)} placeholder="Sublimación Premium 200°C" />
              <CfgField id="editing_tiempo" label="Tiempo producción" value={editingProduct.tiempo_produccion || ''} onChange={(v: string) => setEditingProduct((p: any) => p ? { ...p, tiempo_produccion: v } : p)} placeholder="24-48 hrs" />
              <CfgField id="editing_desc" label="Descripción" value={editingProduct.descripcion || ''} onChange={(v: string) => setEditingProduct((p: any) => p ? { ...p, descripcion: v } : p)} multiline rows={3} />
              <div>
                <label className={labelCls}>Imagen</label>
                <input value={editingProduct.imagen || ''} onChange={(e: any) => setEditingProduct((p: any) => p ? { ...p, imagen: e.target.value } : p)} placeholder="https://..." className={`${inputCls} mb-2`} />
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#D2E8A3]/10 text-[#D2E8A3] text-xs font-bold cursor-pointer hover:bg-[#D2E8A3]/20 w-fit">
                  <Upload className="w-3.5 h-3.5" />{uploading ? 'Subiendo...' : 'Subir'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleProdImageUpload} disabled={uploading} />
                </label>
              </div>
              <div className="flex items-center gap-6 pt-2">
                {[{ key: 'activo', label: 'Activo' }, { key: 'destacado', label: 'Destacado' }, { key: 'personalizable', label: 'Personalizable' }].map((cb: any) => (
                  <label key={cb.key} className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" checked={(editingProduct as any)[cb.key]} onChange={(e: any) => setEditingProduct((p: any) => p ? { ...p, [cb.key]: e.target.checked } : p)} className="sr-only peer" />
                      <div className="w-5 h-5 rounded-md border-2 border-gray-600 peer-checked:border-[#D2E8A3] peer-checked:bg-[#D2E8A3] transition-all flex items-center justify-center">
                        {(editingProduct as any)[cb.key] && <Check className="w-3 h-3 text-[#0A0A0A] stroke-[3]" />}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{cb.label}</span>
                  </label>
                ))}
              </div>
            </Section>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-[#D2E8A3]">Vista Previa</h3>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#161814]">
              <div className="aspect-square overflow-hidden bg-black/40">{editingProduct.imagen ? <img src={editingProduct.imagen} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin imagen</div>}</div>
              <div className="p-4 space-y-2">
                {editingProduct.etiqueta && <span className="inline-block px-2 py-0.5 rounded bg-black/80 text-[#D2E8A3] text-[10px] font-bold">{editingProduct.etiqueta}</span>}
                <p className="text-white font-extrabold text-sm">{editingProduct.nombre || 'Nombre'}</p>
                <p className="text-gray-400 text-xs line-clamp-2">{editingProduct.descripcion || 'Descripción...'}</p>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-[#D2E8A3] font-black text-lg">S/ {editingProduct.precio.toFixed(2)}</span>
                  {editingProduct.precio_original && <span className="text-gray-500 text-xs line-through">S/ {editingProduct.precio_original.toFixed(2)}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {!isNewProduct ? <button onClick={() => handleProdDelete(editingProduct.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /> Eliminar</button> : <div />}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setEditingProduct(null)} className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-bold hover:bg-white/10">Cancelar</button>
                <button onClick={handleProdSave} disabled={prodSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-sm hover:bg-[#c2e088] shadow-lg disabled:opacity-50">
                  {prodSaving ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const streetProducts = useMemo(() => products.filter((p: ProductoRow) => p.categoria_id === 'streetwear'), [products]);
  const cupsProducts = useMemo(() => products.filter((p: ProductoRow) => p.categoria_id === 'cups'), [products]);
  const dropsProducts = useMemo(() => products.filter((p: ProductoRow) => p.categoria_id === 'drops'), [products]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold uppercase text-white flex items-center gap-2"><Package className="w-4 h-4 text-[#D2E8A3]" /> {products.length} Productos</h3>
        <button onClick={startNewProduct} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs hover:bg-[#c2e088] shadow-lg"><Plus className="w-4 h-4" /> Nuevo</button>
      </div>

      {/* Config: catalog text */}
      <Section title="Texto del Catálogo" icon={<Settings className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
        <div className="grid grid-cols-2 gap-3">
          <CfgField id="catalog_title" label="Título" value={cfgEdit.catalog_title || ''} onChange={(v: string) => setCfg('catalog_title', v)} />
          <CfgField id="catalog_subtitle" label="Subtítulo" value={cfgEdit.catalog_subtitle || ''} onChange={(v: string) => setCfg('catalog_subtitle', v)} />
        </div>
        <CfgField id="catalog_empty" label="Texto vacío" value={cfgEdit.catalog_empty || ''} onChange={(v: string) => setCfg('catalog_empty', v)} />
      </Section>

      {/* Product Groups */}
      {[
        { label: 'Polos Sublimados', items: streetProducts, cat: 'streetwear' },
        { label: 'Vasos / Tazas', items: cupsProducts, cat: 'cups' },
        { label: 'Placas de Aluminio', items: dropsProducts, cat: 'drops' },
      ].map(group => (
        <Section key={group.cat} title={`${group.label} (${group.items.length})`} icon={<Package className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.items.map((p: ProductoRow) => (
              <div key={p.id} onClick={() => setEditingProduct(p)}
                className="rounded-2xl overflow-hidden border border-white/10 bg-[#0F110D] cursor-pointer transition-all hover:border-[#D2E8A3]/40 hover:bg-[#1a1d1a]">
                <div className="aspect-video overflow-hidden bg-black/20">{p.imagen ? <img src={p.imagen} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin imagen</div>}</div>
                <div className="p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    {!p.activo && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">OFF</span>}
                    {p.destacado && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D2E8A3]/20 text-[#D2E8A3] font-bold">★</span>}
                  </div>
                  <p className="text-white text-xs font-extrabold truncate">{p.nombre}</p>
                  <p className="text-[#D2E8A3] text-xs font-bold">S/ {p.precio.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {group.items.length === 0 && <p className="text-xs text-gray-500 col-span-full text-center py-4">Sin productos en esta categoría</p>}
          </div>
        </Section>
      ))}
    </div>
  );
});
TabCatalogo.displayName = 'TabCatalogo';

/* ─── TAB: FAVORITOS ─── */
const TabFavoritos = memo(({ cfgEdit, setCfg, configRows, inputCls, labelCls }: any) => (
  <div className="p-4 sm:p-6 space-y-6">
    <Section title="Página de Favoritos" icon={<Heart className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <CfgField id="favorites_title" label="Título" value={cfgEdit.favorites_title || ''} onChange={(v: string) => setCfg('favorites_title', v)} placeholder="Mis Favoritos" />
      <CfgField id="favorites_desc" label="Descripción" value={cfgEdit.favorites_desc || ''} onChange={(v: string) => setCfg('favorites_desc', v)} multiline rows={2} />
      <CfgField id="favorites_empty_title" label="Título (vacío)" value={cfgEdit.favorites_empty_title || ''} onChange={(v: string) => setCfg('favorites_empty_title', v)} />
      <CfgField id="favorites_empty_desc" label="Descripción (vacío)" value={cfgEdit.favorites_empty_desc || ''} onChange={(v: string) => setCfg('favorites_empty_desc', v)} multiline rows={2} />
      <CfgField id="favorites_empty_cta" label="CTA (vacío)" value={cfgEdit.favorites_empty_cta || ''} onChange={(v: string) => setCfg('favorites_empty_cta', v)} />
    </Section>
    {/* Preview */}
    <div className="rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#161814] via-[#0F110D] to-[#0A0A0A] p-6 space-y-4">
      <p className="text-[9px] font-bold text-[#D2E8A3] uppercase tracking-wider">Preview — Favoritos</p>
      <h3 className="text-white font-extrabold text-sm">{cfgEdit.favorites_title || 'Mis Favoritos'}</h3>
      <p className="text-gray-400 text-[10px]">{cfgEdit.favorites_desc || 'Descripción...'}</p>
      <div className="text-center space-y-3 py-6 border-t border-white/10">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#D2E8A3]/10 flex items-center justify-center"><Heart className="w-6 h-6 text-[#D2E8A3]" /></div>
        <p className="text-white font-extrabold text-xs">{cfgEdit.favorites_empty_title || 'Sin favoritos'}</p>
        <p className="text-gray-400 text-[10px]">{cfgEdit.favorites_empty_desc || 'Explora y agrega...'}</p>
        <span className="inline-block px-4 py-2 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] text-[10px] font-extrabold">{cfgEdit.favorites_empty_cta || 'IR AL CATÁLOGO'}</span>
      </div>
    </div>
  </div>
));
TabFavoritos.displayName = 'TabFavoritos';

/* ─── TAB: PEDIDOS ─── */
const TabPedidos = memo(({ orders, handleOrderStatus }: { orders: PedidoRow[]; handleOrderStatus: (id: string, status: string) => void }) => (
  <div className="p-4 sm:p-6 space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <ShoppingCart className="w-4 h-4 text-[#D2E8A3]" />
      <h3 className="text-sm font-extrabold uppercase text-white">{orders.length} Pedidos</h3>
    </div>
    {orders.length === 0 ? (
      <div className="text-center py-16 space-y-3">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#D2E8A3]/10 flex items-center justify-center"><ShoppingCart className="w-8 h-8 text-[#D2E8A3]/50" /></div>
        <p className="text-sm text-gray-400">No hay pedidos aún</p>
        <p className="text-[10px] text-gray-600">Los pedidos de WhatsApp aparecerán aquí</p>
      </div>
    ) : orders.map(order => (
      <div key={order.id} className="p-4 rounded-xl border border-white/10 bg-[#161814]">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-gray-500">{order.id.slice(0, 12)}...</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.estado === 'entregado' ? 'bg-green-500/20 text-green-400' : order.estado === 'enviado' ? 'bg-blue-500/20 text-blue-400' : order.estado === 'produccion' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-400'}`}>{order.estado || 'pendiente'}</span>
            </div>
            <p className="text-xs text-gray-400">{order.cliente_nombre || 'Sin nombre'} — {order.cliente_telefono || 'Sin tel'}</p>
            <p className="text-[10px] text-gray-500">{order.cliente_direccion || ''}</p>
            <p className="text-xs text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleString('es-PE') : ''}</p>
          </div>
          <div className="text-right space-y-2 flex-shrink-0">
            <p className="text-sm font-extrabold text-[#D2E8A3]">S/ {order.total?.toFixed(2)}</p>
            <select value={order.estado || 'pendiente'} onChange={e => handleOrderStatus(order.id, e.target.value)}
              className="text-[11px] font-bold px-2 py-1 rounded-lg border bg-[#1a1d1a] text-gray-300 border-[#333]">
              <option value="pendiente">Pendiente</option>
              <option value="produccion">Producción</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
            </select>
          </div>
        </div>
      </div>
    ))}
  </div>
));
TabPedidos.displayName = 'TabPedidos';

/* ─── TAB: MI CUENTA ─── */
const TabCuenta = memo(({ cfgEdit, setCfg, configRows, inputCls, labelCls }: any) => (
  <div className="p-4 sm:p-6 space-y-6">
    {/* Header / Brand */}
    <Section title="Header & Marca" icon={<User className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <div className="grid grid-cols-2 gap-3">
        <CfgField id="brand_name" label="Nombre" value={cfgEdit.brand_name || ''} onChange={(v: string) => setCfg('brand_name', v)} />
        <CfgField id="brand_slogan" label="Slogan" value={cfgEdit.brand_slogan || ''} onChange={(v: string) => setCfg('brand_slogan', v)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CfgField id="brand_phone" label="Teléfono" value={cfgEdit.brand_phone || ''} onChange={(v: string) => setCfg('brand_phone', v)} />
        <CfgField id="brand_location" label="Ubicación" value={cfgEdit.brand_location || ''} onChange={(v: string) => setCfg('brand_location', v)} />
        <CfgField id="brand_instagram" label="Instagram" value={cfgEdit.brand_instagram || ''} onChange={(v: string) => setCfg('brand_instagram', v)} />
      </div>
      <CfgField id="brand_whatsapp" label="WhatsApp Link" value={cfgEdit.brand_whatsapp || ''} onChange={(v: string) => setCfg('brand_whatsapp', v)} />
      {/* Header Preview */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#070806] p-5 space-y-3 mt-4">
        <p className="text-[9px] font-bold text-[#D2E8A3] uppercase tracking-wider">Preview — Header</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D2E8A3] rounded-xl flex items-center justify-center"><span className="text-[#0A0A0A] font-extrabold text-xl">L</span></div>
          <div>
            <p className="text-white font-display font-black text-lg uppercase">{cfgEdit.brand_name || 'LUMIN SHOP'}<span className="text-[#D2E8A3]">.</span></p>
            <p className="text-gray-300 text-[9px] font-mono uppercase">{cfgEdit.brand_slogan || 'URBAN APPAREL & SUBLIMATION'}</p>
          </div>
        </div>
      </div>
    </Section>

    {/* Profile / Account */}
    <Section title="Mi Cuenta / Perfil" icon={<User className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <CfgField id="profile_title" label="Título" value={cfgEdit.profile_title || ''} onChange={(v: string) => setCfg('profile_title', v)} />
      <CfgField id="profile_concepts" label="Conceptos título" value={cfgEdit.profile_concepts || ''} onChange={(v: string) => setCfg('profile_concepts', v)} />
      {[1, 2, 3].map((i: number) => (
        <div key={i} className="grid grid-cols-2 gap-3">
          <CfgField id={`concept_${i}_title`} label={`Concepto ${i} — Título`} value={cfgEdit[`concept_${i}_title`] || ''} onChange={(v: string) => setCfg(`concept_${i}_title`, v)} />
          <CfgField id={`concept_${i}_desc`} label={`Concepto ${i} — Descripción`} value={cfgEdit[`concept_${i}_desc`] || ''} onChange={(v: string) => setCfg(`concept_${i}_desc`, v)} multiline rows={2} />
        </div>
      ))}
      {/* Profile Preview */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0F110D] p-5 space-y-3 mt-4">
        <p className="text-[9px] font-bold text-[#D2E8A3] uppercase tracking-wider">Preview — Perfil</p>
        <p className="text-white font-extrabold text-xs">{cfgEdit.profile_title || 'MI CUENTA'}</p>
        <p className="text-gray-400 text-[9px]">{cfgEdit.profile_concepts || 'Conceptos:'}</p>
        <div className="space-y-2">
          {[1, 2, 3].map((i: number) => (
            <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/5">
              <p className="text-white text-[9px] font-bold">{cfgEdit[`concept_${i}_title`] || `Concepto ${i}`}</p>
              <p className="text-gray-500 text-[8px]">{cfgEdit[`concept_${i}_desc`] || '...'}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* Cart / Checkout */}
    <Section title="Carrito & Checkout" icon={<ShoppingCart className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <div className="grid grid-cols-2 gap-3">
        <CfgField id="cart_empty_title" label="Título vacío" value={cfgEdit.cart_empty_title || ''} onChange={(v: string) => setCfg('cart_empty_title', v)} />
        <CfgField id="cart_empty_cta" label="CTA" value={cfgEdit.cart_empty_cta || ''} onChange={(v: string) => setCfg('cart_empty_cta', v)} />
      </div>
      <CfgField id="cart_empty_desc" label="Descripción vacío" value={cfgEdit.cart_empty_desc || ''} onChange={(v: string) => setCfg('cart_empty_desc', v)} multiline rows={2} />
      <CfgField id="cart_process_title" label="Proceso título" value={cfgEdit.cart_process_title || ''} onChange={(v: string) => setCfg('cart_process_title', v)} />
      <CfgField id="cart_process_desc" label="Proceso descripción" value={cfgEdit.cart_process_desc || ''} onChange={(v: string) => setCfg('cart_process_desc', v)} multiline rows={2} />
      <CfgField id="cart_send_whatsapp" label="CTA WhatsApp" value={cfgEdit.cart_send_whatsapp || ''} onChange={(v: string) => setCfg('cart_send_whatsapp', v)} />
      {/* Cart Preview */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0F110D] p-5 space-y-3 mt-4">
        <p className="text-[9px] font-bold text-[#D2E8A3] uppercase tracking-wider">Preview — Carrito</p>
        <div className="text-center space-y-3 py-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#D2E8A3]/10 flex items-center justify-center"><span className="text-2xl">🛒</span></div>
          <p className="text-white font-extrabold text-sm">{cfgEdit.cart_empty_title || 'Vacío'}</p>
          <p className="text-gray-400 text-[10px]">{cfgEdit.cart_empty_desc || '...'}</p>
          <span className="inline-block px-4 py-2 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] text-[10px] font-extrabold">{cfgEdit.cart_empty_cta || 'IR AL CATÁLOGO'}</span>
        </div>
        <div className="border-t border-white/10 pt-3 space-y-2">
          <p className="text-white text-[10px] font-extrabold">{cfgEdit.cart_process_title || 'PROCESO:'}</p>
          <p className="text-gray-400 text-[9px]">{cfgEdit.cart_process_desc || '...'}</p>
          <span className="inline-block px-4 py-2 rounded-xl bg-green-500 text-black text-[10px] font-extrabold">{cfgEdit.cart_send_whatsapp || 'ENVIAR'}</span>
        </div>
      </div>
    </Section>

    {/* Envíos / Shipping */}
    <Section title="Envíos & Zonas" icon={<Package className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <p className="text-[10px] text-gray-400 mb-2">Precios de envío por zona. El recojo en tienda es GRATIS.</p>
      <div className="grid grid-cols-3 gap-3">
        <CfgField id="shipping_price_lima" label="Lima (S/)" value={cfgEdit.shipping_price_lima || '10'} onChange={(v: string) => setCfg('shipping_price_lima', v)} type="number" />
        <CfgField id="shipping_price_provincia" label="Provincia (S/)" value={cfgEdit.shipping_price_provincia || '25'} onChange={(v: string) => setCfg('shipping_price_provincia', v)} type="number" />
        <CfgField id="shipping_price_internacional" label="Internacional (S/)" value={cfgEdit.shipping_price_internacional || '80'} onChange={(v: string) => setCfg('shipping_price_internacional', v)} type="number" />
      </div>
      {/* Shipping Preview */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0F110D] p-5 space-y-3 mt-4">
        <p className="text-[9px] font-bold text-[#D2E8A3] uppercase tracking-wider">Preview — Envío</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { emoji: '🏙️', label: 'Lima', price: cfgEdit.shipping_price_lima || '10' },
            { emoji: '📦', label: 'Provincia', price: cfgEdit.shipping_price_provincia || '25' },
            { emoji: '✈️', label: 'Internacional', price: cfgEdit.shipping_price_internacional || '80' },
          ].map(z => (
            <div key={z.label} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
              <span className="text-lg block">{z.emoji}</span>
              <span className="text-white text-[10px] font-bold block">{z.label}</span>
              <span className="text-[#D2E8A3] text-[10px] font-bold block">S/ {z.price}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* Footer */}
    <Section title="Footer" icon={<FileText className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <CfgField id="footer_description" label="Descripción" value={cfgEdit.footer_description || ''} onChange={(v: string) => setCfg('footer_description', v)} multiline rows={2} />
      <CfgField id="footer_production" label="Producción" value={cfgEdit.footer_production || ''} onChange={(v: string) => setCfg('footer_production', v)} />
      <div className="grid grid-cols-2 gap-3">
        <CfgField id="footer_collections" label="Colecciones título" value={cfgEdit.footer_collections || ''} onChange={(v: string) => setCfg('footer_collections', v)} />
        <CfgField id="footer_guarantee_title" label="Garantía título" value={cfgEdit.footer_guarantee_title || ''} onChange={(v: string) => setCfg('footer_guarantee_title', v)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CfgField id="footer_col_1" label="Col 1" value={cfgEdit.footer_col_1 || ''} onChange={(v: string) => setCfg('footer_col_1', v)} />
        <CfgField id="footer_col_2" label="Col 2" value={cfgEdit.footer_col_2 || ''} onChange={(v: string) => setCfg('footer_col_2', v)} />
        <CfgField id="footer_col_3" label="Col 3" value={cfgEdit.footer_col_3 || ''} onChange={(v: string) => setCfg('footer_col_3', v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CfgField id="footer_guarantee_1" label="Garantía 1" value={cfgEdit.footer_guarantee_1 || ''} onChange={(v: string) => setCfg('footer_guarantee_1', v)} />
        <CfgField id="footer_guarantee_2" label="Garantía 2" value={cfgEdit.footer_guarantee_2 || ''} onChange={(v: string) => setCfg('footer_guarantee_2', v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CfgField id="footer_social_title" label="Social título" value={cfgEdit.footer_social_title || ''} onChange={(v: string) => setCfg('footer_social_title', v)} />
        <CfgField id="footer_social_text" label="Social texto" value={cfgEdit.footer_social_text || ''} onChange={(v: string) => setCfg('footer_social_text', v)} />
      </div>
      <CfgField id="footer_copyright" label="Copyright" value={cfgEdit.footer_copyright || ''} onChange={(v: string) => setCfg('footer_copyright', v)} />
      {/* Footer Preview */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#070806] p-5 space-y-4 mt-4">
        <p className="text-[9px] font-bold text-[#D2E8A3] uppercase tracking-wider">Preview — Footer</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="font-display text-sm font-black text-white uppercase">{cfgEdit.brand_name || 'LUMIN SHOP'}<span className="text-[#D2E8A3]">.</span></p>
            <p className="text-gray-400 text-[8px] leading-relaxed">{cfgEdit.footer_description || '...'}</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-white text-[9px] uppercase">{cfgEdit.footer_collections || 'Colecciones'}</p>
            <p className="text-gray-400 text-[8px]">{cfgEdit.footer_col_1 || 'Col 1'}</p>
            <p className="text-gray-400 text-[8px]">{cfgEdit.footer_col_2 || 'Col 2'}</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-white text-[9px] uppercase">{cfgEdit.footer_guarantee_title || 'Garantía'}</p>
            <p className="text-gray-400 text-[8px]">{cfgEdit.footer_guarantee_1 || '...'}</p>
            <p className="text-gray-400 text-[8px]">{cfgEdit.footer_guarantee_2 || '...'}</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-white text-[9px] uppercase">{cfgEdit.footer_social_title || 'Redes'}</p>
            <p className="text-gray-400 text-[8px]">{cfgEdit.footer_social_text || '...'}</p>
          </div>
        </div>
        <div className="pt-3 border-t border-white/5 text-[8px] text-gray-500">
          <p>{cfgEdit.footer_copyright || '© 2026 LUMIN SHOP'}</p>
        </div>
      </div>
    </Section>

    {/* Navigation labels */}
    <Section title="Navegación" icon={<Settings className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <div className="grid grid-cols-2 gap-3">
        <CfgField id="nav_home" label="Nav Inicio" value={cfgEdit.nav_home || ''} onChange={(v: string) => setCfg('nav_home', v)} />
        <CfgField id="nav_catalog" label="Nav Catálogo" value={cfgEdit.nav_catalog || ''} onChange={(v: string) => setCfg('nav_catalog', v)} />
        <CfgField id="nav_favorites" label="Nav Favoritos" value={cfgEdit.nav_favorites || ''} onChange={(v: string) => setCfg('nav_favorites', v)} />
        <CfgField id="nav_cart" label="Nav Carrito" value={cfgEdit.nav_cart || ''} onChange={(v: string) => setCfg('nav_cart', v)} />
        <CfgField id="nav_profile" label="Nav Perfil" value={cfgEdit.nav_profile || ''} onChange={(v: string) => setCfg('nav_profile', v)} />
        <CfgField id="nav_custom" label="Nav Idea" value={cfgEdit.nav_custom || ''} onChange={(v: string) => setCfg('nav_custom', v)} />
      </div>
    </Section>
  </div>
));
TabCuenta.displayName = 'TabCuenta';
