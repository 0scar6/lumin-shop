import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  X, Upload, Save, Eye, EyeOff, Lock, Package, Settings, Image, Plus, Trash2,
  ArrowLeft, Check, ShoppingCart, Sliders, Sun, Home, LayoutGrid, Heart, FileText,
  User, ChevronDown, ChevronRight, Shirt, Coffee,
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

  const cfgChanged = useMemo(() => {
    let count = 0;
    const existingIds = new Set(configRows.map(r => r.id));
    for (const r of configRows) {
      if (cfgEdit[r.id] !== cfgOriginal[r.id]) count++;
    }
    for (const [key, val] of Object.entries(cfgEdit)) {
      if (!existingIds.has(key) && val && val !== (cfgOriginal[key] ?? '')) count++;
    }
    return count;
  }, [configRows, cfgEdit, cfgOriginal]);

  const handleCfgSave = async () => {
    if (!supabase) return;
    // Save existing rows that changed
    for (const row of configRows) {
      const v = cfgEdit[row.id] ?? row.valor;
      if (v !== cfgOriginal[row.id]) {
        await supabase.from('configuracion').upsert({ id: row.id, seccion: row.seccion, clave: row.clave, valor: v }, { onConflict: 'id' });
      }
    }
    // Also save any NEW keys not yet in the DB
    const existingIds = new Set(configRows.map((r: ConfigRow) => r.id));
    for (const [key, value] of Object.entries(cfgEdit)) {
      if (!existingIds.has(key) && value && value !== cfgOriginal[key]) {
        const section = key.split('_')[0] || 'general';
        await supabase.from('configuracion').upsert({ id: key, seccion: section, clave: key, valor: value }, { onConflict: 'id' });
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
    setEditingProduct({ id: `prod-${Date.now()}`, nombre: '', categoria_id: 'streetwear', precio: 0, precio_original: null, tecnica: '', tiempo_produccion: '24-48 hrs', imagen: '', galeria: null, descripcion: '', etiqueta: '', opciones_ropa: { sizes: ['S', 'M', 'L', 'XL'], fits: ['Oversized Streetwear'], colors: [{ name: 'Negro', hex: '#0A0A0A' }] }, opciones_vaso: null, personalizable: false, activo: true, destacado: false });
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

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#1a1d1a] border-white/10 placeholder-gray-500 focus:outline-none focus:border-[#D2E8A3] focus:ring-1 focus:ring-[#D2E8A3]/30 transition-all';
  const labelCls = 'block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5';

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

  const tabs: { key: AdminTab; label: string; icon: any; desc: string }[] = [
    { key: 'inicio', label: 'Inicio', icon: Home, desc: 'Hero, badges, secciones' },
    { key: 'catalogo', label: 'Catálogo', icon: LayoutGrid, desc: 'Productos y categorías' },
    { key: 'favoritos', label: 'Favoritos', icon: Heart, desc: 'Página de favoritos' },
    { key: 'pedidos', label: 'Pedidos', icon: ShoppingCart, desc: 'Gestión de pedidos' },
    { key: 'cuenta', label: 'Mi Cuenta', icon: User, desc: 'Marca, perfil, envíos' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-3" onClick={onClose}>
      <div className="relative w-full h-full sm:w-[95vw] sm:max-w-[1400px] sm:h-[92vh] sm:rounded-3xl border-0 sm:border border-white/10 bg-[#0A0A0A] overflow-hidden flex flex-col text-white shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 flex-shrink-0 bg-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D2E8A3] flex items-center justify-center shadow-lg shadow-[#D2E8A3]/20">
              <span className="text-[#0A0A0A] font-extrabold text-base">L</span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">Admin Panel</h2>
              <p className="text-[9px] text-gray-500 font-mono tracking-wider">LUMIN SHOP CMS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cfgChanged > 0 && (
              <span className="text-[10px] font-bold text-[#D2E8A3] bg-[#D2E8A3]/10 px-2.5 py-1.5 rounded-lg border border-[#D2E8A3]/20">{cfgChanged} cambio{cfgChanged > 1 ? 's' : ''}</span>
            )}
            {cfgSaved && <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2.5 py-1.5 rounded-lg border border-green-400/20">Guardado</span>}
            <button onClick={handleCfgSave} disabled={cfgChanged === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-[11px] transition-all ${cfgChanged > 0 ? 'bg-[#D2E8A3] text-[#0A0A0A] hover:bg-[#c2e088] shadow-lg shadow-[#D2E8A3]/20' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}>
              <Save className="w-3.5 h-3.5" /> Guardar
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 px-4 py-2.5 border-b border-white/5 flex-shrink-0 overflow-x-auto bg-[#0A0A0A]">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setMainTab(t.key); setEditingProduct(null); setIsNewProduct(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                mainTab === t.key
                  ? 'bg-[#D2E8A3] text-[#0A0A0A] shadow-lg shadow-[#D2E8A3]/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}>
              <t.icon className="w-4 h-4" />
              <div className="text-left">
                <span className="block">{t.label}</span>
                <span className={`block text-[8px] font-normal ${mainTab === t.key ? 'text-[#0A0A0A]/60' : 'text-gray-500'}`}>{t.desc}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
          {mainTab === 'inicio' && <TabInicio cfgEdit={cfgEdit} setCfg={setCfg} configRows={configRows} handleFileUpload={handleFileUpload} uploading={uploading} uploadTarget={uploadTarget} />}
          {mainTab === 'catalogo' && <TabCatalogo cfgEdit={cfgEdit} setCfg={setCfg} products={products} editingProduct={editingProduct} setEditingProduct={setEditingProduct} isNewProduct={isNewProduct} startNewProduct={startNewProduct} handleProdSave={handleProdSave} handleProdDelete={handleProdDelete} handleProdImageUpload={handleProdImageUpload} prodSaving={prodSaving} uploading={uploading} />}
          {mainTab === 'favoritos' && <TabFavoritos cfgEdit={cfgEdit} setCfg={setCfg} />}
          {mainTab === 'pedidos' && <TabPedidos orders={orders} handleOrderStatus={handleOrderStatus} />}
          {mainTab === 'cuenta' && <TabCuenta cfgEdit={cfgEdit} setCfg={setCfg} handleFileUpload={handleFileUpload} uploading={uploading} uploadTarget={uploadTarget} />}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════ */

const Field = memo(({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
    {children}
  </div>
));
Field.displayName = 'Field';

const TextInput = memo(({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#161814] border-white/10 placeholder-gray-600 focus:outline-none focus:border-[#D2E8A3]/50 focus:ring-1 focus:ring-[#D2E8A3]/20 transition-all" />
));
TextInput.displayName = 'TextInput';

const TextArea = memo(({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) => (
  <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#161814] border-white/10 placeholder-gray-600 focus:outline-none focus:border-[#D2E8A3]/50 focus:ring-1 focus:ring-[#D2E8A3]/20 transition-all resize-none" />
));
TextArea.displayName = 'TextArea';

const MediaUpload = memo(({ id, label, value, onChange, handleFileUpload, uploading, uploadTarget }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void;
  uploading: boolean; uploadTarget: string;
}) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
    <div className="flex items-center gap-2">
      <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all border ${
        uploading && uploadTarget === id
          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
          : 'bg-[#D2E8A3]/10 text-[#D2E8A3] border-[#D2E8A3]/20 hover:bg-[#D2E8A3]/20'
      }`}>
        <Upload className="w-3 h-3" />{uploading && uploadTarget === id ? 'Subiendo...' : 'Subir'}
        <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={e => handleFileUpload(e, id)} disabled={uploading} />
      </label>
      <span className="text-[10px] text-gray-600">o pega URL</span>
    </div>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="https://..."
      className="w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#161814] border-white/10 placeholder-gray-600 focus:outline-none focus:border-[#D2E8A3]/50 focus:ring-1 focus:ring-[#D2E8A3]/20 transition-all font-mono text-[11px]" />
    {value && (
      <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-[#0F110D]">
        {/\.(mp4|webm)$/i.test(value) ? (
          <video src={value} className="w-full h-full object-cover" autoPlay muted loop playsInline />
        ) : (
          <img src={value} className="w-full h-full object-cover" alt="" />
        )}
      </div>
    )}
  </div>
));
MediaUpload.displayName = 'MediaUpload';

const Section = memo(({ title, icon, children, badge }: { title: string; icon?: React.ReactNode; children: React.ReactNode; badge?: string }) => (
  <div className="rounded-2xl border border-white/5 bg-[#111311]">
    <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-[#D2E8A3]/10 flex items-center justify-center">{icon}</div>
        <h3 className="text-[11px] font-extrabold text-white uppercase tracking-wider">{title}</h3>
      </div>
      {badge && <span className="text-[9px] font-bold text-[#D2E8A3] bg-[#D2E8A3]/10 px-2 py-0.5 rounded-md">{badge}</span>}
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
));
Section.displayName = 'Section';

const PreviewBox = memo(({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/5 bg-[#0A0B0A] overflow-hidden">
    <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
      <Eye className="w-3 h-3 text-[#D2E8A3]" />
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{title}</span>
    </div>
    <div className="p-4">{children}</div>
  </div>
));
PreviewBox.displayName = 'PreviewBox';

/* ═══════════════════════════════════════════════════════
   TAB: INICIO
   ═══════════════════════════════════════════════════════ */
const TabInicio = memo(({ cfgEdit, setCfg, configRows, handleFileUpload, uploading, uploadTarget }: any) => (
  <div className="p-5 sm:p-8 space-y-6 max-w-[1200px] mx-auto">

    {/* Hero Text */}
    <Section title="Hero Banner" icon={<Home className="w-3.5 h-3.5 text-[#D2E8A3]" />} badge="Sección principal">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fields */}
        <div className="space-y-3">
          <Field label="Badge"><TextInput value={cfgEdit.hero_badge || ''} onChange={v => setCfg('hero_badge', v)} placeholder="Exclusivo — COLECCIÓN BAJO DEMANDA" /></Field>
          <Field label="Título Línea 1"><TextInput value={cfgEdit.hero_title_1 || ''} onChange={v => setCfg('hero_title_1', v)} placeholder="MODA URBANA &" /></Field>
          <Field label="Título Línea 2"><TextInput value={cfgEdit.hero_title_2 || ''} onChange={v => setCfg('hero_title_2', v)} placeholder="VASOS SUBLIMADOS" /></Field>
          <Field label="Subtítulo 1"><TextInput value={cfgEdit.hero_subtitle_1 || ''} onChange={v => setCfg('hero_subtitle_1', v)} placeholder="Polos Sublimados con" /></Field>
          <Field label="Subtítulo 2 (bold)"><TextInput value={cfgEdit.hero_subtitle_2 || ''} onChange={v => setCfg('hero_subtitle_2', v)} placeholder="Estampado Urbano HD High-Density" /></Field>
          <Field label="Descripción"><TextArea value={cfgEdit.hero_description || ''} onChange={v => setCfg('hero_description', v)} placeholder="Sin sobre-stock. Fabricado para ti..." rows={2} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Badge Izq"><TextInput value={cfgEdit.hero_badge_1 || ''} onChange={v => setCfg('hero_badge_1', v)} placeholder="Producción Express: 24 a 48 hrs" /></Field>
            <Field label="Badge Der"><TextInput value={cfgEdit.hero_badge_2 || ''} onChange={v => setCfg('hero_badge_2', v)} placeholder="Garantía de Fijación Térmica" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CTA Catálogo"><TextInput value={cfgEdit.hero_cta_catalogo || ''} onChange={v => setCfg('hero_cta_catalogo', v)} placeholder="EXPLORAR CATÁLOGO" /></Field>
            <Field label="CTA Idea"><TextInput value={cfgEdit.hero_cta_idea || ''} onChange={v => setCfg('hero_cta_idea', v)} placeholder="Personalizar Mi Idea" /></Field>
          </div>
        </div>
        {/* Live Preview */}
        <PreviewBox title="Vista Previa — Hero Banner">
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#161814] via-[#0F110D] to-[#0A0A0A] p-5 space-y-3 relative">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full blur-3xl bg-[#D2E8A3]/10 pointer-events-none"></div>
            <div className="relative z-10 grid grid-cols-12 gap-3 items-center">
              <div className="col-span-7 space-y-2.5">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D2E8A3]/10 border border-[#D2E8A3]/30">
                  <span className="text-[7px] font-bold text-[#D2E8A3] uppercase">{cfgEdit.hero_badge || 'Badge'}</span>
                </div>
                <h3 className="font-display font-extrabold leading-tight uppercase">
                  <span className="text-white text-xs block">{cfgEdit.hero_title_1 || 'Título 1'}</span>
                  <span className="text-[#D2E8A3] text-xs block">{cfgEdit.hero_title_2 || 'Título 2'}</span>
                </h3>
                <p className="text-[8px] text-gray-400 leading-relaxed">
                  {cfgEdit.hero_subtitle_1 || ''} <span className="text-white font-bold">{cfgEdit.hero_subtitle_2 || ''}</span>
                  <br />{cfgEdit.hero_description || ''}
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[6px] font-bold text-gray-200">
                    <span className="text-[#D2E8A3]">⚡</span> {cfgEdit.hero_badge_1 || 'Badge 1'}
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[6px] font-bold text-gray-200">
                    <span className="text-[#D2E8A3]">🛡️</span> {cfgEdit.hero_badge_2 || 'Badge 2'}
                  </span>
                </div>
                <div className="flex gap-1.5 pt-0.5">
                  <span className="px-2 py-1 rounded-lg bg-[#D2E8A3] text-[#0A0A0A] text-[7px] font-extrabold">{cfgEdit.hero_cta_catalogo || 'CTA 1'}</span>
                  <span className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-white text-[7px] font-bold">{cfgEdit.hero_cta_idea || 'CTA 2'}</span>
                </div>
              </div>
              <div className="col-span-5 grid grid-cols-2 gap-1.5 relative">
                <div className="relative overflow-hidden rounded-xl border border-white/10 aspect-[4/5]">
                  {cfgEdit.hero_media_1_url ? (/\.(mp4|webm)$/i.test(cfgEdit.hero_media_1_url) ? <video src={cfgEdit.hero_media_1_url} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <img src={cfgEdit.hero_media_1_url} className="w-full h-full object-cover" alt="" />) : <div className="w-full h-full flex items-center justify-center text-gray-600 text-[6px] bg-[#161814]">Media 1</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-1.5 flex flex-col justify-end">
                    <span className="text-[6px] font-mono text-[#D2E8A3] uppercase">{cfgEdit.hero_street_title || 'STREETWEAR'}</span>
                    <span className="text-[7px] font-bold text-white">{cfgEdit.hero_street_sub || 'Acid Tokyo 1988'}</span>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl border border-white/10 aspect-[4/5] mt-3">
                  {cfgEdit.hero_media_2_url ? (/\.(mp4|webm)$/i.test(cfgEdit.hero_media_2_url) ? <video src={cfgEdit.hero_media_2_url} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <img src={cfgEdit.hero_media_2_url} className="w-full h-full object-cover" alt="" />) : <div className="w-full h-full flex items-center justify-center text-gray-600 text-[6px] bg-[#161814]">Media 2</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-1.5 flex flex-col justify-end">
                    <span className="text-[6px] font-mono text-[#D2E8A3] uppercase">{cfgEdit.hero_subli_title || 'SUBLIMACIÓN'}</span>
                    <span className="text-[7px] font-bold text-white">{cfgEdit.hero_subli_sub || 'Frosted Glass 16oz'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PreviewBox>
      </div>
    </Section>

    {/* Hero Media */}
    <Section title="Media del Hero" icon={<Image className="w-3.5 h-3.5 text-[#D2E8A3]" />} badge="Imágenes / Videos">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MediaUpload id="hero_media_1_url" label="Media 1 — Streetwear" value={cfgEdit.hero_media_1_url || ''} onChange={v => setCfg('hero_media_1_url', v)} handleFileUpload={handleFileUpload} uploading={uploading} uploadTarget={uploadTarget} />
        <MediaUpload id="hero_media_2_url" label="Media 2 — Sublimación" value={cfgEdit.hero_media_2_url || ''} onChange={v => setCfg('hero_media_2_url', v)} handleFileUpload={handleFileUpload} uploading={uploading} uploadTarget={uploadTarget} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          <Field label="Street Title"><TextInput value={cfgEdit.hero_street_title || ''} onChange={v => setCfg('hero_street_title', v)} /></Field>
          <Field label="Street Sub"><TextInput value={cfgEdit.hero_street_sub || ''} onChange={v => setCfg('hero_street_sub', v)} /></Field>
        </div>
        <div className="space-y-3">
          <Field label="Subli Title"><TextInput value={cfgEdit.hero_subli_title || ''} onChange={v => setCfg('hero_subli_title', v)} /></Field>
          <Field label="Subli Sub"><TextInput value={cfgEdit.hero_subli_sub || ''} onChange={v => setCfg('hero_subli_sub', v)} /></Field>
        </div>
      </div>
    </Section>

    {/* Process Bar */}
    <Section title="Barra de Proceso" icon={<Package className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Field label="Título"><TextInput value={cfgEdit.badge_model_title || ''} onChange={v => setCfg('badge_model_title', v)} placeholder="MODELO SUSTENTABLE BAJO DEMANDA" /></Field>
          <Field label="Subtítulo"><TextInput value={cfgEdit.badge_model_subtitle || ''} onChange={v => setCfg('badge_model_subtitle', v)} placeholder="¿CÓMO FUNCIONA LUMIN SHOP?" /></Field>
          {[1, 2, 3].map(i => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <Field label={`Paso ${i} — Título`}><TextInput value={cfgEdit[`badge_step${i}_title`] || ''} onChange={v => setCfg(`badge_step${i}_title`, v)} /></Field>
              <Field label={`Paso ${i} — Desc`}><TextInput value={cfgEdit[`badge_step${i}_desc`] || ''} onChange={v => setCfg(`badge_step${i}_desc`, v)} /></Field>
            </div>
          ))}
        </div>
        <PreviewBox title="Vista Previa — Proceso">
          <div className="space-y-3">
            <p className="text-white font-extrabold text-xs uppercase">{cfgEdit.badge_model_title || 'MODELO SUSTENTABLE'}</p>
            <p className="text-gray-400 text-[9px]">{cfgEdit.badge_model_subtitle || '¿Cómo funciona?'}</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                  <div className="w-7 h-7 mx-auto rounded-full bg-[#D2E8A3]/15 flex items-center justify-center text-[#D2E8A3] text-[10px] font-bold">{i}</div>
                  <p className="text-white text-[8px] font-bold">{cfgEdit[`badge_step${i}_title`] || `Paso ${i}`}</p>
                  <p className="text-gray-500 text-[7px]">{cfgEdit[`badge_step${i}_desc`] || '...'}</p>
                </div>
              ))}
            </div>
          </div>
        </PreviewBox>
      </div>
    </Section>

    {/* About & Social */}
    <Section title="Secciones & Social" icon={<FileText className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Field label="Título Sobre Nosotros"><TextInput value={cfgEdit.section_about_title || ''} onChange={v => setCfg('section_about_title', v)} /></Field>
          <Field label="Subtítulo"><TextInput value={cfgEdit.section_about_subtitle || ''} onChange={v => setCfg('section_about_subtitle', v)} /></Field>
          <Field label="Descripción"><TextArea value={cfgEdit.section_about_text || ''} onChange={v => setCfg('section_about_text', v)} rows={4} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Título Destacados"><TextInput value={cfgEdit.section_featured_title || ''} onChange={v => setCfg('section_featured_title', v)} /></Field>
            <Field label="Subtítulo Destacados"><TextInput value={cfgEdit.section_featured_sub || ''} onChange={v => setCfg('section_featured_sub', v)} /></Field>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Social Quick Bar</p>
          <Field label="Título"><TextInput value={cfgEdit.social_title || ''} onChange={v => setCfg('social_title', v)} /></Field>
          <Field label="Texto"><TextInput value={cfgEdit.social_text || ''} onChange={v => setCfg('social_text', v)} /></Field>
          <Field label="Subtítulo"><TextInput value={cfgEdit.social_subtitle || ''} onChange={v => setCfg('social_subtitle', v)} /></Field>
        </div>
      </div>
    </Section>
  </div>
));
TabInicio.displayName = 'TabInicio';

/* ═══════════════════════════════════════════════════════
   TAB: CATÁLOGO
   ═══════════════════════════════════════════════════════ */
const TabCatalogo = ({ cfgEdit, setCfg, products, editingProduct, setEditingProduct, isNewProduct, startNewProduct, handleProdSave, handleProdDelete, handleProdImageUpload, prodSaving, uploading }: any) => {
  const _labelCls = 'block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5';
  const _inputCls = 'w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#1a1d1a] border-white/10 placeholder-gray-500 focus:outline-none focus:border-[#D2E8A3] focus:ring-1 focus:ring-[#D2E8A3]/30 transition-all';
  const streetProducts = useMemo(() => products.filter((p: ProductoRow) => p.categoria_id === 'streetwear'), [products]);
  const cupsProducts = useMemo(() => products.filter((p: ProductoRow) => p.categoria_id === 'cups'), [products]);
  const dropsProducts = useMemo(() => products.filter((p: ProductoRow) => p.categoria_id === 'drops'), [products]);
  if (editingProduct) {
    return (
      <div className="p-5 sm:p-8 max-w-[1200px] mx-auto space-y-4">
        <button onClick={() => setEditingProduct(null)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title={isNewProduct ? 'Nuevo Producto' : 'Editar Producto'} icon={<Package className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
            <Field label="ID"><TextInput value={editingProduct.id} onChange={v => setEditingProduct((p: any) => p ? { ...p, id: v } : p)} /></Field>
            <Field label="Nombre *"><TextInput value={editingProduct.nombre} onChange={v => setEditingProduct((p: any) => p ? { ...p, nombre: v } : p)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoría">
                <select value={editingProduct.categoria_id} onChange={e => {
                  const cat = e.target.value;
                  setEditingProduct((p: any) => {
                    if (!p) return p;
                    const updated: any = { ...p, categoria_id: cat };
                    if (cat === 'streetwear' && !p.opciones_ropa) {
                      updated.opciones_ropa = { sizes: ['S', 'M', 'L', 'XL'], fits: ['Oversized Streetwear'], colors: [{ name: 'Negro', hex: '#0A0A0A' }] };
                    } else if ((cat === 'cups' || cat === 'drops') && !p.opciones_vaso) {
                      updated.opciones_vaso = { types: [{ name: '', extraPrice: 0 }], finishes: [''] };
                    }
                    return updated;
                  });
                }}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#161814] border-white/10 focus:outline-none focus:border-[#D2E8A3]/50 transition-all">
                  <option value="streetwear">Polos Sublimados</option>
                  <option value="cups">Vasos/Tazas</option>
                  <option value="drops">Placas de Aluminio</option>
                </select>
              </Field>
              <Field label="Etiqueta"><TextInput value={editingProduct.etiqueta || ''} onChange={v => setEditingProduct((p: any) => p ? { ...p, etiqueta: v } : p)} placeholder="BESTSELLER" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio (S/)"><TextInput type="number" value={String(editingProduct.precio)} onChange={v => setEditingProduct((p: any) => p ? { ...p, precio: parseFloat(v) || 0 } : p)} /></Field>
              <Field label="Precio original (S/)"><TextInput type="number" value={String(editingProduct.precio_original ?? '')} onChange={v => setEditingProduct((p: any) => p ? { ...p, precio_original: v ? parseFloat(v) : null } : p)} placeholder="Opcional" /></Field>
            </div>
            <Field label="Técnica"><TextInput value={editingProduct.tecnica || ''} onChange={v => setEditingProduct((p: any) => p ? { ...p, tecnica: v } : p)} placeholder="Sublimación Premium 200°C" /></Field>
            <Field label="Tiempo producción"><TextInput value={editingProduct.tiempo_produccion || ''} onChange={v => setEditingProduct((p: any) => p ? { ...p, tiempo_produccion: v } : p)} placeholder="24-48 hrs" /></Field>
            <Field label="Descripción"><TextArea value={editingProduct.descripcion || ''} onChange={v => setEditingProduct((p: any) => p ? { ...p, descripcion: v } : p)} rows={3} /></Field>
            <MediaUpload id="product_image" label="Imagen del producto" value={editingProduct.imagen || ''} onChange={v => setEditingProduct((p: any) => p ? { ...p, imagen: v } : p)} handleFileUpload={handleProdImageUpload} uploading={uploading} uploadTarget="product_image" />

            <div className="flex items-center gap-6 pt-2">
              {[{ key: 'activo', label: 'Activo' }, { key: 'destacado', label: 'Destacado' }, { key: 'personalizable', label: 'Personalizable' }].map((cb: any) => (
                <label key={cb.key} className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" checked={(editingProduct as any)[cb.key]} onChange={e => setEditingProduct((p: any) => p ? { ...p, [cb.key]: e.target.checked } : p)} className="sr-only peer" />
                    <div className="w-5 h-5 rounded-lg border-2 border-gray-600 peer-checked:border-[#D2E8A3] peer-checked:bg-[#D2E8A3] transition-all flex items-center justify-center">
                      {(editingProduct as any)[cb.key] && <Check className="w-3 h-3 text-[#0A0A0A] stroke-[3]" />}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{cb.label}</span>
                </label>
              ))}
            </div>
            {/* ── OPCIONES DE PRODUCTO (dentro del Section) ── */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              <p className="text-[11px] font-extrabold text-[#D2E8A3] uppercase tracking-wider flex items-center gap-2"><Shirt className="w-3.5 h-3.5" /> Opciones de Polos (Tallas con precio extra / Cortes / Colores)</p>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tallas (nombre + precio extra)</label>
                <div className="space-y-1.5">
                  {(editingProduct.opciones_ropa?.sizes || []).map((s: any, i: number) => {
                    const name = typeof s === 'string' ? s : s.name;
                    const extra = typeof s === 'string' ? 0 : (s.extraPrice || 0);
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <TextInput value={name} onChange={v => {
                          const sizes = [...(editingProduct.opciones_ropa?.sizes || [])];
                          sizes[i] = extra > 0 ? { name: v, extraPrice: extra } : v;
                          setEditingProduct((p: any) => p ? { ...p, opciones_ropa: { ...(p.opciones_ropa || {}), sizes } } : p);
                        }} placeholder="Ej: S" />
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-gray-500">+S/</span>
                          <TextInput type="number" value={String(extra)} onChange={v => {
                            const sizes = [...(editingProduct.opciones_ropa?.sizes || [])];
                            const val = parseInt(v) || 0;
                            sizes[i] = val > 0 ? { name, extraPrice: val } : name;
                            setEditingProduct((p: any) => p ? { ...p, opciones_ropa: { ...(p.opciones_ropa || {}), sizes } } : p);
                          }} />
                        </div>
                        <button onClick={() => {
                          const sizes = (editingProduct.opciones_ropa?.sizes || []).filter((_: any, j: number) => j !== i);
                          setEditingProduct((p: any) => p ? { ...p, opciones_ropa: { ...(p.opciones_ropa || {}), sizes } } : p);
                        }} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    );
                  })}
                  <button onClick={() => {
                    const sizes = [...(editingProduct.opciones_ropa?.sizes || []), 'M'];
                    setEditingProduct((p: any) => p ? { ...p, opciones_ropa: { ...(p.opciones_ropa || {}), sizes } } : p);
                  }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D2E8A3]/10 text-[#D2E8A3] text-xs font-bold hover:bg-[#D2E8A3]/20 transition-all"><Plus className="w-3 h-3" /> Agregar talla</button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Cortes / Fits</label>
                <div className="space-y-1.5">
                  {(editingProduct.opciones_ropa?.fits || []).map((fit: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <TextInput value={fit} onChange={v => {
                        const fits = [...(editingProduct.opciones_ropa?.fits || [])];
                        fits[i] = v;
                        setEditingProduct((p: any) => p ? { ...p, opciones_ropa: { ...(p.opciones_ropa || {}), fits } } : p);
                      }} placeholder="Ej: Oversized Streetwear" />
                      <button onClick={() => {
                        const fits = (editingProduct.opciones_ropa?.fits || []).filter((_: any, j: number) => j !== i);
                        setEditingProduct((p: any) => p ? { ...p, opciones_ropa: { ...(p.opciones_ropa || {}), fits } } : p);
                      }} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const fits = [...(editingProduct.opciones_ropa?.fits || []), ''];
                    setEditingProduct((p: any) => p ? { ...p, opciones_ropa: { ...(p.opciones_ropa || {}), fits } } : p);
                  }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D2E8A3]/10 text-[#D2E8A3] text-xs font-bold hover:bg-[#D2E8A3]/20 transition-all"><Plus className="w-3 h-3" /> Agregar corte</button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Colores de tela</label>
                <div className="space-y-1.5">
                  {(editingProduct.opciones_ropa?.colors || []).map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="color" value={c.hex || '#000000'} onChange={e => {
                        const colors = [...(editingProduct.opciones_ropa?.colors || [])];
                        colors[i] = { ...colors[i], hex: e.target.value };
                        setEditingProduct((p: any) => p ? { ...p, opciones_ropa: { ...(p.opciones_ropa || {}), colors } } : p);
                      }} className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent shrink-0" />
                      <TextInput value={c.name} onChange={v => {
                        const colors = [...(editingProduct.opciones_ropa?.colors || [])];
                        colors[i] = { ...colors[i], name: v };
                        setEditingProduct((p: any) => p ? { ...p, opciones_ropa: { ...(p.opciones_ropa || {}), colors } } : p);
                      }} placeholder="Nombre del color" />
                      <button onClick={() => {
                        const colors = (editingProduct.opciones_ropa?.colors || []).filter((_: any, j: number) => j !== i);
                        setEditingProduct((p: any) => p ? { ...p, opciones_ropa: { ...(p.opciones_ropa || {}), colors } } : p);
                      }} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const colors = [...(editingProduct.opciones_ropa?.colors || []), { name: 'Negro', hex: '#0A0A0A' }];
                    setEditingProduct((p: any) => p ? { ...p, opciones_ropa: { ...(p.opciones_ropa || {}), colors } } : p);
                  }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D2E8A3]/10 text-[#D2E8A3] text-xs font-bold hover:bg-[#D2E8A3]/20 transition-all"><Plus className="w-3 h-3" /> Agregar color</button>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-4">
              <p className="text-[11px] font-extrabold text-[#D2E8A3] uppercase tracking-wider flex items-center gap-2"><Coffee className="w-3.5 h-3.5" /> Opciones de Vasos / Tazas / Placas</p>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{editingProduct.categoria_id === 'drops' ? 'Medidas' : 'Tipos'}</label>
                <div className="space-y-1.5">
                  {(editingProduct.opciones_vaso?.types || []).map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <TextInput value={t.name} onChange={v => {
                        const types = [...(editingProduct.opciones_vaso?.types || [])];
                        types[i] = { ...types[i], name: v };
                        setEditingProduct((p: any) => p ? { ...p, opciones_vaso: { ...(p.opciones_vaso || {}), types } } : p);
                      }} placeholder={editingProduct.categoria_id === 'drops' ? 'Ej: 20x30cm' : 'Ej: Vaso Frosted 16oz'} />
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-gray-500">+S/</span>
                        <TextInput type="number" value={String(t.extraPrice || 0)} onChange={v => {
                          const types = [...(editingProduct.opciones_vaso?.types || [])];
                          types[i] = { ...types[i], extraPrice: parseInt(v) || 0 };
                          setEditingProduct((p: any) => p ? { ...p, opciones_vaso: { ...(p.opciones_vaso || {}), types } } : p);
                        }} />
                      </div>
                      <button onClick={() => {
                        const types = (editingProduct.opciones_vaso?.types || []).filter((_: any, j: number) => j !== i);
                        setEditingProduct((p: any) => p ? { ...p, opciones_vaso: { ...(p.opciones_vaso || {}), types } } : p);
                      }} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const types = [...(editingProduct.opciones_vaso?.types || []), { name: '', extraPrice: 0 }];
                    setEditingProduct((p: any) => p ? { ...p, opciones_vaso: { ...(p.opciones_vaso || {}), types } } : p);
                  }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D2E8A3]/10 text-[#D2E8A3] text-xs font-bold hover:bg-[#D2E8A3]/20 transition-all"><Plus className="w-3 h-3" /> Agregar {editingProduct.categoria_id === 'drops' ? 'medida' : 'tipo'}</button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Acabados</label>
                <div className="space-y-1.5">
                  {(editingProduct.opciones_vaso?.finishes || []).map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <TextInput value={f} onChange={v => {
                        const finishes = [...(editingProduct.opciones_vaso?.finishes || [])];
                        finishes[i] = v;
                        setEditingProduct((p: any) => p ? { ...p, opciones_vaso: { ...(p.opciones_vaso || {}), finishes } } : p);
                      }} placeholder="Ej: Acabado Mate" />
                      <button onClick={() => {
                        const finishes = (editingProduct.opciones_vaso?.finishes || []).filter((_: any, j: number) => j !== i);
                        setEditingProduct((p: any) => p ? { ...p, opciones_vaso: { ...(p.opciones_vaso || {}), finishes } } : p);
                      }} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const finishes = [...(editingProduct.opciones_vaso?.finishes || []), ''];
                    setEditingProduct((p: any) => p ? { ...p, opciones_vaso: { ...(p.opciones_vaso || {}), finishes } } : p);
                  }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D2E8A3]/10 text-[#D2E8A3] text-xs font-bold hover:bg-[#D2E8A3]/20 transition-all"><Plus className="w-3 h-3" /> Agregar acabado</button>
                </div>
              </div>
            </div>

          </Section>
          <div className="space-y-4">
            <PreviewBox title="Vista Previa del Producto">
              <div className="rounded-xl overflow-hidden bg-[#161814]">
                <div className="aspect-square overflow-hidden bg-black/40">{editingProduct.imagen ? <img src={editingProduct.imagen} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin imagen</div>}</div>
                <div className="p-4 space-y-2">
                  {editingProduct.etiqueta && <span className="inline-block px-2 py-0.5 rounded bg-black/80 text-[#D2E8A3] text-[10px] font-bold">{editingProduct.etiqueta}</span>}
                  <p className="text-white font-extrabold text-sm">{editingProduct.nombre || 'Nombre del producto'}</p>
                  <p className="text-gray-400 text-xs line-clamp-2">{editingProduct.descripcion || 'Descripción del producto...'}</p>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-[#D2E8A3] font-black text-lg">S/ {editingProduct.precio.toFixed(2)}</span>
                    {editingProduct.precio_original && <span className="text-gray-500 text-xs line-through">S/ {editingProduct.precio_original.toFixed(2)}</span>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    {!editingProduct.activo && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">INACTIVO</span>}
                    {editingProduct.destacado && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D2E8A3]/20 text-[#D2E8A3] font-bold">DESTACADO</span>}
                  </div>
                </div>
              </div>
            </PreviewBox>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              {!isNewProduct ? <button onClick={() => handleProdDelete(editingProduct.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"><Trash2 className="w-3.5 h-3.5" /> Eliminar</button> : <div />}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setEditingProduct(null)} className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-400 text-xs font-bold hover:bg-white/10 transition-all">Cancelar</button>
                <button onClick={handleProdSave} disabled={prodSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-sm hover:bg-[#c2e088] shadow-lg shadow-[#D2E8A3]/20 disabled:opacity-50 transition-all">
                  {prodSaving ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar</>}
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
    );
  }

  const ProductCard = ({ p }: { p: ProductoRow }) => (
    <div onClick={() => setEditingProduct(p)}
      className="rounded-2xl overflow-hidden border border-white/5 bg-[#111311] cursor-pointer transition-all hover:border-[#D2E8A3]/30 hover:bg-[#161814] group">
      <div className="aspect-video overflow-hidden bg-black/20">{p.imagen ? <img src={p.imagen} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin imagen</div>}</div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          {!p.activo && <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">OFF</span>}
          {p.destacado && <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#D2E8A3]/20 text-[#D2E8A3] font-bold">★ DESTACADO</span>}
        </div>
        <p className="text-white text-xs font-extrabold truncate">{p.nombre}</p>
        <div className="flex items-baseline justify-between">
          <p className="text-[#D2E8A3] text-sm font-black">S/ {p.precio.toFixed(2)}</p>
          {p.precio_original && <p className="text-gray-500 text-[10px] line-through">S/ {p.precio_original.toFixed(2)}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-5 sm:p-8 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#D2E8A3]/10 flex items-center justify-center"><Package className="w-4 h-4 text-[#D2E8A3]" /></div>
          <div>
            <h3 className="text-sm font-extrabold uppercase text-white">{products.length} Productos</h3>
            <p className="text-[9px] text-gray-500">Gestiona tu catálogo</p>
          </div>
        </div>
        <button onClick={startNewProduct} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs hover:bg-[#c2e088] shadow-lg shadow-[#D2E8A3]/20 transition-all"><Plus className="w-4 h-4" /> Nuevo</button>
      </div>

      <Section title="Texto del Catálogo" icon={<Settings className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Título"><TextInput value={cfgEdit.catalog_title || ''} onChange={(v: string) => setCfg('catalog_title', v)} /></Field>
          <Field label="Subtítulo"><TextInput value={cfgEdit.catalog_subtitle || ''} onChange={(v: string) => setCfg('catalog_subtitle', v)} /></Field>
        </div>
        <Field label="Texto vacío"><TextInput value={cfgEdit.catalog_empty || ''} onChange={(v: string) => setCfg('catalog_empty', v)} /></Field>
      </Section>

      {[
        { label: 'Polos Sublimados', items: streetProducts, cat: 'streetwear', emoji: '👕' },
        { label: 'Vasos / Tazas', items: cupsProducts, cat: 'cups', emoji: '☕' },
        { label: 'Placas de Aluminio', items: dropsProducts, cat: 'drops', emoji: '🖼️' },
      ].map(group => (
        <Section key={group.cat} title={`${group.emoji} ${group.label}`} icon={<Package className="w-3.5 h-3.5 text-[#D2E8A3]" />} badge={`${group.items.length} productos`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.items.map((p: ProductoRow) => <ProductCard key={p.id} p={p} />)}
            {group.items.length === 0 && <p className="text-xs text-gray-500 col-span-full text-center py-8">Sin productos en esta categoría</p>}
          </div>
        </Section>
      ))}
    </div>
  );
};
TabCatalogo.displayName = 'TabCatalogo';

/* ═══════════════════════════════════════════════════════
   TAB: FAVORITOS
   ═══════════════════════════════════════════════════════ */
const TabFavoritos = memo(({ cfgEdit, setCfg }: any) => (
  <div className="p-5 sm:p-8 space-y-6 max-w-[1200px] mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Section title="Página de Favoritos" icon={<Heart className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
        <Field label="Título"><TextInput value={cfgEdit.favorites_title || ''} onChange={(v: string) => setCfg('favorites_title', v)} placeholder="Mis Favoritos" /></Field>
        <Field label="Descripción"><TextArea value={cfgEdit.favorites_desc || ''} onChange={(v: string) => setCfg('favorites_desc', v)} rows={2} /></Field>
        <Field label="Título (vacío)"><TextInput value={cfgEdit.favorites_empty_title || ''} onChange={(v: string) => setCfg('favorites_empty_title', v)} /></Field>
        <Field label="Descripción (vacío)"><TextArea value={cfgEdit.favorites_empty_desc || ''} onChange={(v: string) => setCfg('favorites_empty_desc', v)} rows={2} /></Field>
        <Field label="CTA (vacío)"><TextInput value={cfgEdit.favorites_empty_cta || ''} onChange={(v: string) => setCfg('favorites_empty_cta', v)} /></Field>
      </Section>
      <PreviewBox title="Vista Previa — Favoritos">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#161814] via-[#0F110D] to-[#0A0A0A] p-5 space-y-3">
          <h3 className="text-white font-extrabold text-sm">{cfgEdit.favorites_title || 'Mis Favoritos'}</h3>
          <p className="text-gray-400 text-[10px]">{cfgEdit.favorites_desc || 'Descripción...'}</p>
          <div className="text-center space-y-3 py-6 border-t border-white/10">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#D2E8A3]/10 flex items-center justify-center"><Heart className="w-6 h-6 text-[#D2E8A3]" /></div>
            <p className="text-white font-extrabold text-xs">{cfgEdit.favorites_empty_title || 'Sin favoritos'}</p>
            <p className="text-gray-400 text-[10px]">{cfgEdit.favorites_empty_desc || 'Explora y agrega...'}</p>
            <span className="inline-block px-4 py-2 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] text-[10px] font-extrabold">{cfgEdit.favorites_empty_cta || 'IR AL CATÁLOGO'}</span>
          </div>
        </div>
      </PreviewBox>
    </div>
  </div>
));
TabFavoritos.displayName = 'TabFavoritos';

/* ═══════════════════════════════════════════════════════
   TAB: PEDIDOS
   ═══════════════════════════════════════════════════════ */
const TabPedidos = memo(({ orders, handleOrderStatus }: { orders: PedidoRow[]; handleOrderStatus: (id: string, status: string) => void }) => {
  const statusColors: Record<string, string> = {
    pendiente: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    produccion: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    enviado: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    entregado: 'bg-green-500/15 text-green-400 border-green-500/30',
  };
  const statusLabels: Record<string, string> = {
    pendiente: 'Pendiente', produccion: 'En Producción', enviado: 'Enviado', entregado: 'Entregado',
  };

  return (
    <div className="p-5 sm:p-8 space-y-4 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-[#D2E8A3]/10 flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-[#D2E8A3]" /></div>
        <div>
          <h3 className="text-sm font-extrabold uppercase text-white">{orders.length} Pedidos</h3>
          <p className="text-[9px] text-gray-500">Gestiona los estados de entrega</p>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#D2E8A3]/5 border border-[#D2E8A3]/10 flex items-center justify-center"><ShoppingCart className="w-10 h-10 text-[#D2E8A3]/30" /></div>
          <div>
            <p className="text-sm text-gray-400 font-bold">No hay pedidos aún</p>
            <p className="text-[10px] text-gray-600 mt-1">Los pedidos de WhatsApp aparecerán aquí</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="p-4 sm:p-5 rounded-2xl border border-white/5 bg-[#111311] hover:bg-[#161814] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-gray-600">#{order.id.slice(0, 8)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[order.estado] || 'bg-white/10 text-gray-400 border-white/10'}`}>
                      {statusLabels[order.estado] || order.estado}
                    </span>
                  </div>
                  <p className="text-xs text-white font-bold">{order.cliente_nombre || 'Sin nombre'}</p>
                  <p className="text-[11px] text-gray-400">{order.cliente_telefono || ''} {order.cliente_direccion ? `— ${order.cliente_direccion}` : ''}</p>
                  <p className="text-[10px] text-gray-600">{order.created_at ? new Date(order.created_at).toLocaleString('es-PE') : ''}</p>
                </div>
                <div className="text-right space-y-2 flex-shrink-0">
                  <p className="text-base font-black text-[#D2E8A3]">S/ {order.total?.toFixed(2)}</p>
                  <select value={order.estado || 'pendiente'} onChange={e => handleOrderStatus(order.id, e.target.value)}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-xl border bg-[#161814] text-gray-300 border-white/10 focus:outline-none focus:border-[#D2E8A3]/50 transition-all cursor-pointer">
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="produccion">🔨 Producción</option>
                    <option value="enviado">📦 Enviado</option>
                    <option value="entregado">✅ Entregado</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
TabPedidos.displayName = 'TabPedidos';

/* ═══════════════════════════════════════════════════════
   TAB: MI CUENTA
   ═══════════════════════════════════════════════════════ */
const TabCuenta = memo(({ cfgEdit, setCfg, handleFileUpload, uploading, uploadTarget }: any) => (
  <div className="p-5 sm:p-8 space-y-6 max-w-[1200px] mx-auto">

    {/* Brand */}
    <Section title="Header & Marca" icon={<User className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre"><TextInput value={cfgEdit.brand_name || ''} onChange={(v: string) => setCfg('brand_name', v)} /></Field>
            <Field label="Slogan"><TextInput value={cfgEdit.brand_slogan || ''} onChange={(v: string) => setCfg('brand_slogan', v)} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Teléfono"><TextInput value={cfgEdit.brand_phone || ''} onChange={(v: string) => setCfg('brand_phone', v)} /></Field>
            <Field label="Ubicación"><TextInput value={cfgEdit.brand_location || ''} onChange={(v: string) => setCfg('brand_location', v)} /></Field>
            <Field label="Instagram"><TextInput value={cfgEdit.brand_instagram || ''} onChange={(v: string) => setCfg('brand_instagram', v)} /></Field>
          </div>
          <Field label="WhatsApp Link"><TextInput value={cfgEdit.brand_whatsapp || ''} onChange={(v: string) => setCfg('brand_whatsapp', v)} /></Field>
        </div>
        <PreviewBox title="Vista Previa — Header">
          <div className="rounded-xl bg-[#070806] p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D2E8A3] rounded-xl flex items-center justify-center shadow-lg"><span className="text-[#0A0A0A] font-extrabold text-xl">L</span></div>
              <div>
                <p className="text-white font-display font-black text-lg uppercase">{cfgEdit.brand_name || 'LUMIN SHOP'}<span className="text-[#D2E8A3]">.</span></p>
                <p className="text-gray-300 text-[9px] font-mono uppercase">{cfgEdit.brand_slogan || 'URBAN APPAREL & SUBLIMATION'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[9px] text-gray-400">📱 {cfgEdit.brand_phone || '993 365 099'}</span>
              <span className="text-[9px] text-gray-400">📍 {cfgEdit.brand_location || 'Ayacucho, Perú'}</span>
              <span className="text-[9px] text-gray-400">📸 {cfgEdit.brand_instagram || '@.lumin.shop'}</span>
            </div>
          </div>
        </PreviewBox>
      </div>
    </Section>

    {/* Profile */}
    <Section title="Mi Cuenta / Perfil" icon={<User className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Field label="Título"><TextInput value={cfgEdit.profile_title || ''} onChange={(v: string) => setCfg('profile_title', v)} /></Field>
          <Field label="Conceptos título"><TextInput value={cfgEdit.profile_concepts || ''} onChange={(v: string) => setCfg('profile_concepts', v)} /></Field>
          {[1, 2, 3].map((i: number) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <Field label={`Concepto ${i} — Título`}><TextInput value={cfgEdit[`concept_${i}_title`] || ''} onChange={(v: string) => setCfg(`concept_${i}_title`, v)} /></Field>
              <Field label={`Concepto ${i} — Desc`}><TextArea value={cfgEdit[`concept_${i}_desc`] || ''} onChange={(v: string) => setCfg(`concept_${i}_desc`, v)} rows={2} /></Field>
            </div>
          ))}
        </div>
        <PreviewBox title="Vista Previa — Perfil">
          <div className="rounded-xl bg-[#0F110D] p-5 space-y-3">
            <p className="text-white font-extrabold text-xs">{cfgEdit.profile_title || 'MI CUENTA'}</p>
            <p className="text-gray-400 text-[9px]">{cfgEdit.profile_concepts || 'Conceptos:'}</p>
            <div className="space-y-2">
              {[1, 2, 3].map((i: number) => (
                <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-white text-[9px] font-bold">{cfgEdit[`concept_${i}_title`] || `Concepto ${i}`}</p>
                  <p className="text-gray-500 text-[8px]">{cfgEdit[`concept_${i}_desc`] || '...'}</p>
                </div>
              ))}
            </div>
          </div>
        </PreviewBox>
      </div>
    </Section>

    {/* Cart */}
    <Section title="Carrito & Checkout" icon={<ShoppingCart className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Título vacío"><TextInput value={cfgEdit.cart_empty_title || ''} onChange={(v: string) => setCfg('cart_empty_title', v)} /></Field>
            <Field label="CTA"><TextInput value={cfgEdit.cart_empty_cta || ''} onChange={(v: string) => setCfg('cart_empty_cta', v)} /></Field>
          </div>
          <Field label="Descripción vacío"><TextArea value={cfgEdit.cart_empty_desc || ''} onChange={(v: string) => setCfg('cart_empty_desc', v)} rows={2} /></Field>
          <Field label="Proceso título"><TextInput value={cfgEdit.cart_process_title || ''} onChange={(v: string) => setCfg('cart_process_title', v)} /></Field>
          <Field label="Proceso descripción"><TextArea value={cfgEdit.cart_process_desc || ''} onChange={(v: string) => setCfg('cart_process_desc', v)} rows={2} /></Field>
          <Field label="CTA WhatsApp"><TextInput value={cfgEdit.cart_send_whatsapp || ''} onChange={(v: string) => setCfg('cart_send_whatsapp', v)} /></Field>
        </div>
        <PreviewBox title="Vista Previa — Carrito">
          <div className="rounded-xl bg-[#0F110D] p-5 space-y-3">
            <div className="text-center space-y-3 py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#D2E8A3]/10 flex items-center justify-center"><span className="text-xl">🛒</span></div>
              <p className="text-white font-extrabold text-xs">{cfgEdit.cart_empty_title || 'Vacío'}</p>
              <p className="text-gray-400 text-[10px]">{cfgEdit.cart_empty_desc || '...'}</p>
              <span className="inline-block px-3 py-1.5 rounded-lg bg-[#D2E8A3] text-[#0A0A0A] text-[10px] font-extrabold">{cfgEdit.cart_empty_cta || 'IR AL CATÁLOGO'}</span>
            </div>
            <div className="border-t border-white/10 pt-3 space-y-2">
              <p className="text-white text-[10px] font-extrabold">{cfgEdit.cart_process_title || 'PROCESO:'}</p>
              <p className="text-gray-400 text-[9px]">{cfgEdit.cart_process_desc || '...'}</p>
              <span className="inline-block px-3 py-1.5 rounded-lg bg-green-500 text-black text-[10px] font-extrabold">{cfgEdit.cart_send_whatsapp || 'ENVIAR'}</span>
            </div>
          </div>
        </PreviewBox>
      </div>
    </Section>

    {/* Shipping */}
    <Section title="Envíos & Zonas" icon={<Package className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <p className="text-[10px] text-gray-500">Precios de envío por zona. Ayacucho/Huamanga y Recojo en Tienda son GRATIS.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lima (S/)"><TextInput type="number" value={cfgEdit.shipping_price_lima || '15'} onChange={(v: string) => setCfg('shipping_price_lima', v)} /></Field>
          <Field label="Provincia (S/)"><TextInput type="number" value={cfgEdit.shipping_price_provincia || '25'} onChange={(v: string) => setCfg('shipping_price_provincia', v)} /></Field>
          <Field label="Internac. (S/)"><TextInput type="number" value={cfgEdit.shipping_price_internacional || '80'} onChange={(v: string) => setCfg('shipping_price_internacional', v)} /></Field>
        </div>
        <PreviewBox title="Vista Previa — Envíos">
          <div className="grid grid-cols-4 gap-2">
            {[
              { emoji: '🏠', label: 'Huamanga', price: 'GRATIS' },
              { emoji: '🏙️', label: 'Lima', price: `S/ ${cfgEdit.shipping_price_lima || '15'}` },
              { emoji: '📦', label: 'Provincia', price: `S/ ${cfgEdit.shipping_price_provincia || '25'}` },
              { emoji: '✈️', label: 'Internac.', price: `S/ ${cfgEdit.shipping_price_internacional || '80'}` },
            ].map(z => (
              <div key={z.label} className="p-3 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                <span className="text-lg block">{z.emoji}</span>
                <span className="text-white text-[10px] font-bold block">{z.label}</span>
                <span className="text-[#D2E8A3] text-[10px] font-bold block">{z.price}</span>
              </div>
            ))}
          </div>
        </PreviewBox>
      </div>
    </Section>

    {/* Footer */}
    <Section title="Footer" icon={<FileText className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Field label="Descripción"><TextArea value={cfgEdit.footer_description || ''} onChange={(v: string) => setCfg('footer_description', v)} rows={2} /></Field>
          <Field label="Producción"><TextInput value={cfgEdit.footer_production || ''} onChange={(v: string) => setCfg('footer_production', v)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Colecciones título"><TextInput value={cfgEdit.footer_collections || ''} onChange={(v: string) => setCfg('footer_collections', v)} /></Field>
            <Field label="Garantía título"><TextInput value={cfgEdit.footer_guarantee_title || ''} onChange={(v: string) => setCfg('footer_guarantee_title', v)} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Col 1"><TextInput value={cfgEdit.footer_col_1 || ''} onChange={(v: string) => setCfg('footer_col_1', v)} /></Field>
            <Field label="Col 2"><TextInput value={cfgEdit.footer_col_2 || ''} onChange={(v: string) => setCfg('footer_col_2', v)} /></Field>
            <Field label="Col 3"><TextInput value={cfgEdit.footer_col_3 || ''} onChange={(v: string) => setCfg('footer_col_3', v)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Garantía 1"><TextInput value={cfgEdit.footer_guarantee_1 || ''} onChange={(v: string) => setCfg('footer_guarantee_1', v)} /></Field>
            <Field label="Garantía 2"><TextInput value={cfgEdit.footer_guarantee_2 || ''} onChange={(v: string) => setCfg('footer_guarantee_2', v)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Social título"><TextInput value={cfgEdit.footer_social_title || ''} onChange={(v: string) => setCfg('footer_social_title', v)} /></Field>
            <Field label="Social texto"><TextInput value={cfgEdit.footer_social_text || ''} onChange={(v: string) => setCfg('footer_social_text', v)} /></Field>
          </div>
          <Field label="Copyright"><TextInput value={cfgEdit.footer_copyright || ''} onChange={(v: string) => setCfg('footer_copyright', v)} /></Field>
        </div>
        <PreviewBox title="Vista Previa — Footer">
          <div className="rounded-xl bg-[#070806] p-5 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <p className="font-display text-xs font-black text-white uppercase">{cfgEdit.brand_name || 'LUMIN SHOP'}<span className="text-[#D2E8A3]">.</span></p>
                <p className="text-gray-400 text-[7px] leading-relaxed">{cfgEdit.footer_description || '...'}</p>
              </div>
              <div className="space-y-1.5">
                <p className="font-bold text-white text-[8px] uppercase">{cfgEdit.footer_collections || 'Colecciones'}</p>
                <p className="text-gray-400 text-[7px]">{cfgEdit.footer_col_1 || '...'}</p>
                <p className="text-gray-400 text-[7px]">{cfgEdit.footer_col_2 || '...'}</p>
              </div>
              <div className="space-y-1.5">
                <p className="font-bold text-white text-[8px] uppercase">{cfgEdit.footer_guarantee_title || 'Garantía'}</p>
                <p className="text-gray-400 text-[7px]">{cfgEdit.footer_guarantee_1 || '...'}</p>
                <p className="text-gray-400 text-[7px]">{cfgEdit.footer_guarantee_2 || '...'}</p>
              </div>
              <div className="space-y-1.5">
                <p className="font-bold text-white text-[8px] uppercase">{cfgEdit.footer_social_title || 'Redes'}</p>
                <p className="text-gray-400 text-[7px]">{cfgEdit.footer_social_text || '...'}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/5 text-[7px] text-gray-600">{cfgEdit.footer_copyright || '© 2026 LUMIN SHOP'}</div>
          </div>
        </PreviewBox>
      </div>
    </Section>

    {/* Navigation */}
    <Section title="Navegación" icon={<Settings className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Field label="Nav Inicio"><TextInput value={cfgEdit.nav_home || ''} onChange={(v: string) => setCfg('nav_home', v)} /></Field>
        <Field label="Nav Catálogo"><TextInput value={cfgEdit.nav_catalog || ''} onChange={(v: string) => setCfg('nav_catalog', v)} /></Field>
        <Field label="Nav Favoritos"><TextInput value={cfgEdit.nav_favorites || ''} onChange={(v: string) => setCfg('nav_favorites', v)} /></Field>
        <Field label="Nav Carrito"><TextInput value={cfgEdit.nav_cart || ''} onChange={(v: string) => setCfg('nav_cart', v)} /></Field>
        <Field label="Nav Perfil"><TextInput value={cfgEdit.nav_profile || ''} onChange={(v: string) => setCfg('nav_profile', v)} /></Field>
        <Field label="Nav Idea"><TextInput value={cfgEdit.nav_custom || ''} onChange={(v: string) => setCfg('nav_custom', v)} /></Field>
      </div>
    </Section>
  </div>
));
TabCuenta.displayName = 'TabCuenta';
