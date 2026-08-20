import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import {
  X, Upload, Save, Eye, EyeOff, Lock, Package, Settings, Image, Plus, Trash2,
  ArrowLeft, Check, ShoppingCart, Sliders, Sun, Home, LayoutGrid, Heart, FileText,
  User, ChevronDown, ChevronRight, Shirt, Coffee, Pencil, Type, MessageCircle,
  Clock, ShieldCheck, Truck, RefreshCw, Tag, HelpCircle, ChevronUp, Download,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { reloadConfig } from '../lib/config';
import { AdminSharedProps, Field, TextInput, TextArea, MediaUpload, Section, PreviewBox, EditableText, EditableImage, MirrorSection } from './admin/AdminShared';
import { AdminConfig } from './admin/AdminConfig';
import { AdminProducts, ProductoRow } from './admin/AdminProducts';
import { AdminOrders, PedidoRow } from './admin/AdminOrders';

type AdminTab = 'inicio' | 'config' | 'catalogo' | 'favoritos' | 'pedidos' | 'cuenta';

interface AdminPanelProps { isOpen: boolean; onClose: () => void; onConfigChange?: () => void; }
interface ConfigRow { id: string; seccion: string; clave: string; valor: string; }

const TABLES_TO_BACKUP = [
  'configuracion', 'productos', 'categorias', 'pedidos',
  'usuarios', 'perfiles', 'favoritos', 'carrito', 'ideas_personalizadas',
];

const hashPassword = async (pw: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onConfigChange }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [mainTab, setMainTab] = useState<AdminTab>('inicio');
  const [storedHash, setStoredHash] = useState<string | null>(null);
  const [hashLoaded, setHashLoaded] = useState(false);

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

  useEffect(() => {
    if (!isOpen || !supabase) return;
    supabase.from('configuracion').select('valor').eq('id', 'admin_password_hash').single().then(({ data }) => {
      if (data?.valor) setStoredHash(data.valor);
      setHashLoaded(true);
    }).catch(() => setHashLoaded(true));
  }, [isOpen]);

  const handleLogin = async () => {
    if (storedHash) {
      const inputHash = await hashPassword(pw);
      if (inputHash === storedHash) { setAuthenticated(true); setPwError(false); }
      else { setPwError(true); setTimeout(() => setPwError(false), 2000); }
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  };

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
    if (cfgEdit.brand_phone) {
      const raw = cfgEdit.brand_phone.replace(/\s+/g, '').replace(/^0+/, '');
      cfgEdit.brand_phone_raw = raw.startsWith('51') ? raw : '51' + raw;
    }
    for (const row of configRows) {
      const v = cfgEdit[row.id] ?? row.valor;
      if (v !== cfgOriginal[row.id]) {
        await supabase.from('configuracion').upsert({ id: row.id, seccion: row.seccion, clave: row.clave, valor: v }, { onConflict: 'id' });
      }
    }
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

  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing_up' | 'done' | 'restoring' | 'restored' | 'error'>('idle');
  const [restorePreview, setRestorePreview] = useState<any>(null);

  const handleBackup = async () => {
    if (!supabase) return;
    setBackupStatus('backing_up');
    try {
      const results: Record<string, any[]> = {};
      const countPromises = TABLES_TO_BACKUP.map(async (table) => {
        try { const { data, error } = await supabase.from(table).select('*'); if (!error && data) results[table] = data; } catch {}
      });
      await Promise.all(countPromises);
      const backup = { version: '2.0', created_at: new Date().toISOString(), shop: 'LUMIN SHOP', tables: Object.keys(results), data: results };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `lumin-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      setBackupStatus('done'); setTimeout(() => setBackupStatus('idle'), 3000);
    } catch { setBackupStatus('error'); setTimeout(() => setBackupStatus('idle'), 3000); }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.data && (parsed.shop === 'LUMIN SHOP' || parsed.version)) setRestorePreview(parsed);
        else alert('Archivo de backup no válido de LUMIN SHOP');
      } catch { alert('Error al leer el archivo JSON'); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const handleRestoreConfirm = async () => {
    if (!supabase || !restorePreview) return;
    setBackupStatus('restoring');
    try {
      const tablesToRestore = restorePreview.tables || Object.keys(restorePreview.data);
      for (const table of tablesToRestore) {
        const rows = restorePreview.data[table]; if (!rows?.length) continue;
        const firstRow = rows[0]; const pk = firstRow.id ? 'id' : firstRow.usuario_id ? 'usuario_id' : null;
        for (const row of rows) { if (pk) await supabase.from(table).upsert(row, { onConflict: pk }); else await supabase.from(table).insert(row); }
      }
      setRestorePreview(null); setBackupStatus('restored');
      await reloadConfig(); onConfigChange?.(); loadConfig(); loadProducts(); loadOrders();
      setTimeout(() => setBackupStatus('idle'), 3000);
    } catch { setBackupStatus('error'); setTimeout(() => setBackupStatus('idle'), 3000); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0]; if (!file || !supabase) return;
    setUploading(true); setUploadTarget(key);
    try {
      const ext = file.name.split('.').pop() || 'jpg'; const path = `uploads/${key}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
      if (urlData?.publicUrl) setCfgEdit(prev => ({ ...prev, [key]: urlData.publicUrl }));
    } catch (err: any) { alert('Error: ' + (err.message || err)); }
    setUploading(false); setUploadTarget('');
  };

  const startNewProduct = () => {
    setEditingProduct({ id: `prod-${Date.now()}`, nombre: '', categoria_id: 'streetwear', precio: 0, precio_original: null, tecnica: '', tiempo_produccion: '24-48 hrs', imagen: '', galeria: null, descripcion: '', etiqueta: '', opciones_ropa: { sizes: ['S', 'M', 'L', 'XL'], fits: ['Oversized Streetwear'], colors: [{ name: 'Negro', hex: '#0A0A0A' }] }, opciones_vaso: null, personalizable: false, activo: true, destacado: false, agotado: false });
    setIsNewProduct(true);
  };

  const handleProdSave = async () => {
    if (!editingProduct || !supabase) return;
    if (!editingProduct.nombre.trim()) { alert('El nombre es obligatorio'); return; }
    setProdSaving(true);
    try {
      let galeria = editingProduct.galeria;
      if ((!galeria || galeria.length === 0) && editingProduct.imagen) galeria = [editingProduct.imagen];
      const { error } = await supabase.from('productos').upsert({
        id: editingProduct.id, nombre: editingProduct.nombre, categoria_id: editingProduct.categoria_id,
        precio: editingProduct.precio, precio_original: editingProduct.precio_original,
        tecnica: editingProduct.tecnica, tiempo_produccion: editingProduct.tiempo_produccion,
        imagen: editingProduct.imagen, galeria, descripcion: editingProduct.descripcion,
        etiqueta: editingProduct.etiqueta, opciones_ropa: editingProduct.opciones_ropa, opciones_vaso: editingProduct.opciones_vaso,
        personalizable: editingProduct.personalizable, activo: editingProduct.activo, destacado: editingProduct.destacado, agotado: editingProduct.agotado || false,
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

  const handleSyncGalleries = async () => {
    if (!supabase || !confirm('Esto sincronizará la galería de TODOS los productos. ¿Continuar?')) return;
    const { data } = await supabase.from('productos').select('id, imagen, galeria');
    if (!data) return; let count = 0;
    for (const row of data) {
      const mainImage = row.imagen || ''; let gallery = row.galeria;
      if ((!gallery || gallery.length === 0) && mainImage) { gallery = [mainImage]; await supabase.from('productos').update({ galeria: gallery }).eq('id', row.id); count++; }
    }
    alert(`Sincronizados ${count} productos. Galería actualizada.`); await loadProducts();
  };

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
    { key: 'config', label: 'Config', icon: MessageCircle, desc: 'Teléfono, redes sociales' },
    { key: 'catalogo', label: 'Catálogo', icon: LayoutGrid, desc: 'Productos y categorías' },
    { key: 'favoritos', label: 'Favoritos', icon: Heart, desc: 'Página de favoritos' },
    { key: 'pedidos', label: 'Pedidos', icon: ShoppingCart, desc: 'Gestión de pedidos' },
    { key: 'cuenta', label: 'Mi Cuenta', icon: User, desc: 'Marca, perfil, envíos' },
  ];

  const sharedProps: AdminSharedProps = { cfgEdit, setCfg, handleFileUpload, uploading, uploadTarget };

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
          {mainTab === 'inicio' && <TabInicio {...sharedProps} configRows={configRows} />}
          {mainTab === 'config' && <AdminConfig cfgEdit={cfgEdit} setCfg={setCfg} />}
          {mainTab === 'catalogo' && <AdminProducts cfgEdit={cfgEdit} setCfg={setCfg} handleCfgSave={handleCfgSave} cfgSaved={cfgSaved} products={products} editingProduct={editingProduct} setEditingProduct={setEditingProduct} isNewProduct={isNewProduct} startNewProduct={startNewProduct} handleProdSave={handleProdSave} handleProdDelete={handleProdDelete} handleProdImageUpload={handleProdImageUpload} prodSaving={prodSaving} uploading={uploading} handleSyncGalleries={handleSyncGalleries} />}
          {mainTab === 'favoritos' && <TabFavoritos cfgEdit={cfgEdit} setCfg={setCfg} />}
          {mainTab === 'pedidos' && <AdminOrders orders={orders} handleOrderStatus={handleOrderStatus} />}
          {mainTab === 'cuenta' && <TabCuenta {...sharedProps} backupStatus={backupStatus} handleBackup={handleBackup} handleRestoreFile={handleRestoreFile} handleRestoreConfirm={handleRestoreConfirm} restorePreview={restorePreview} setRestorePreview={setRestorePreview} />}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   TAB: INICIO — WYSIWYG SITE MIRROR
   ═══════════════════════════════════════════════════════ */
const TabInicio = memo(({ cfgEdit, setCfg, configRows, handleFileUpload, uploading, uploadTarget }: any) => {
  const heroEdits = [cfgEdit.hero_badge, cfgEdit.hero_title_1, cfgEdit.hero_title_2, cfgEdit.hero_subtitle_1, cfgEdit.hero_subtitle_2, cfgEdit.hero_description, cfgEdit.hero_badge_1, cfgEdit.hero_badge_2, cfgEdit.hero_cta_catalogo, cfgEdit.hero_cta_idea].filter(Boolean).length;
  const aboutEdits = [cfgEdit.section_about_subtitle, cfgEdit.section_about_text, cfgEdit.section_about_cta_cat, cfgEdit.section_about_cta_idea].filter(Boolean).length;
  const badgeEdits = [cfgEdit.badge_model_title, cfgEdit.badge_model_subtitle, cfgEdit.badge_step1_title, cfgEdit.badge_step2_title, cfgEdit.badge_step3_title].filter(Boolean).length;
  const faqEdits = [cfgEdit.faq_badge, cfgEdit.faq_heading].filter(Boolean).length;
  const footerEdits = [cfgEdit.footer_description, cfgEdit.footer_collections, cfgEdit.footer_copyright].filter(Boolean).length;

  return (
    <div className="p-3 sm:p-6 space-y-4 max-w-[1200px] mx-auto">

      {/* ─── HOW-TO BANNER ─── */}
      <div className="rounded-2xl border border-[#D2E8A3]/20 bg-[#D2E8A3]/5 p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#D2E8A3]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Pencil className="w-4 h-4 text-[#D2E8A3]" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-extrabold text-[#D2E8A3] uppercase tracking-wider">Modo Edición Visual — Doble clic para editar</p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Haz <strong className="text-white">doble clic</strong> en cualquier texto verde o blanco para editarlo directamente.
            Los cambios se guardan localmente — presiona <strong className="text-[#D2E8A3]">"Guardar"</strong> arriba para subirlos a Supabase.
            Las imágenes se cambian pasando el cursor encima.
          </p>
        </div>
      </div>

      {/* ─── HERO BANNER ─── */}
      <MirrorSection title="Hero Banner" icon={<Home className="w-3.5 h-3.5 text-[#D2E8A3]" />} badge="Sección principal" editCount={heroEdits}>
        <div className="p-4 sm:p-8 bg-gradient-to-br from-[#161814] via-[#0F110D] to-[#0A0A0A] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full blur-3xl bg-[#D2E8A3]/10 pointer-events-none"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2E8A3]/10 border border-[#D2E8A3]/30 text-[#D2E8A3] text-xs font-bold uppercase tracking-wider">
                <span className="text-lime-600">🔥</span>
                <EditableText cfgKey="hero_badge" value={cfgEdit.hero_badge || ''} setCfg={setCfg} fallback="Exclusivo — COLECCIÓN BAJO DEMANDA" />
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold leading-tight uppercase tracking-tight text-white">
                <EditableText cfgKey="hero_title_1" value={cfgEdit.hero_title_1 || ''} setCfg={setCfg} fallback="MODA URBANA &" /><br />
                <EditableText cfgKey="hero_title_2" value={cfgEdit.hero_title_2 || ''} setCfg={setCfg} fallback="VASOS SUBLIMADOS" className="text-[#D2E8A3]" />
              </h2>
              <p className="text-sm sm:text-base max-w-xl leading-relaxed text-gray-400">
                <EditableText cfgKey="hero_subtitle_1" value={cfgEdit.hero_subtitle_1 || ''} setCfg={setCfg} fallback="Polos Sublimados con" />{' '}
                <EditableText cfgKey="hero_subtitle_2" value={cfgEdit.hero_subtitle_2 || ''} setCfg={setCfg} fallback="Estampado Urbano HD High-Density" className="text-white font-bold" />
                {' '}y vasos/tazas con sublimación continua a 200°C.<br className="hidden sm:inline" />
                <EditableText cfgKey="hero_description" value={cfgEdit.hero_description || ''} setCfg={setCfg} fallback="Sin sobre-stock. Fabricado especialmente para ti al confirmar tu orden." />
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-black/60 border border-white/15 text-gray-200">
                  <span className="text-[#D2E8A3]">⚡</span>
                  <EditableText cfgKey="hero_badge_1" value={cfgEdit.hero_badge_1 || ''} setCfg={setCfg} fallback="Producción Express: 24 a 48 hrs" />
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-black/60 border border-white/15 text-gray-200">
                  <span className="text-[#D2E8A3]">🛡️</span>
                  <EditableText cfgKey="hero_badge_2" value={cfgEdit.hero_badge_2 || ''} setCfg={setCfg} fallback="Garantía de Fijación Térmica & Color" />
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <span className="px-6 py-3.5 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg">
                  <EditableText cfgKey="hero_cta_catalogo" value={cfgEdit.hero_cta_catalogo || ''} setCfg={setCfg} fallback="EXPLORAR CATÁLOGO" />
                </span>
                <span className="px-6 py-3.5 rounded-xl border bg-white/5 border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2">
                  <span className="text-[#D2E8A3]">✨</span>
                  <EditableText cfgKey="hero_cta_idea" value={cfgEdit.hero_cta_idea || ''} setCfg={setCfg} fallback="Personalizar Mi Idea" />
                </span>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="grid grid-cols-2 gap-3 relative">
                <div className="relative group overflow-hidden rounded-2xl border border-white/10 aspect-[4/5] bg-[#161814]">
                  <EditableImage cfgKey="hero_media_1_url" value={cfgEdit.hero_media_1_url || ''} setCfg={setCfg} handleFileUpload={handleFileUpload} uploading={uploading} uploadTarget={uploadTarget} className="w-full h-full" fallback="Media 1" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end pointer-events-none">
                    <EditableText cfgKey="hero_street_title" value={cfgEdit.hero_street_title || ''} setCfg={setCfg} fallback="STREETWEAR" className="text-[10px] font-mono text-[#D2E8A3] uppercase" /><br />
                    <EditableText cfgKey="hero_street_sub" value={cfgEdit.hero_street_sub || ''} setCfg={setCfg} fallback="Acid Tokyo 1988" className="text-xs font-bold text-white" />
                  </div>
                </div>
                <div className="relative group overflow-hidden rounded-2xl border border-white/10 aspect-[4/5] mt-6 bg-[#161814]">
                  <EditableImage cfgKey="hero_media_2_url" value={cfgEdit.hero_media_2_url || ''} setCfg={setCfg} handleFileUpload={handleFileUpload} uploading={uploading} uploadTarget={uploadTarget} className="w-full h-full" fallback="Media 2" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end pointer-events-none">
                    <EditableText cfgKey="hero_subli_title" value={cfgEdit.hero_subli_title || ''} setCfg={setCfg} fallback="SUBLIMACIÓN" className="text-[10px] font-mono text-[#D2E8A3] uppercase" /><br />
                    <EditableText cfgKey="hero_subli_sub" value={cfgEdit.hero_subli_sub || ''} setCfg={setCfg} fallback="Frosted Glass 16oz" className="text-xs font-bold text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MirrorSection>

      {/* ─── ABOUT SECTION ─── */}
      <MirrorSection title="Sobre LUMIN SHOP" icon={<FileText className="w-3.5 h-3.5 text-[#D2E8A3]" />} badge="Descripción de marca" editCount={aboutEdits}>
        <div className="p-4 sm:p-8 border border-white/10 rounded-3xl bg-[#0A0A0A] space-y-4 relative overflow-hidden m-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#D2E8A3]/20 text-[#D2E8A3]">
                <EditableText cfgKey="section_about_label" value={cfgEdit.section_about_label || ''} setCfg={setCfg} fallback="Sobre" />{' '}
                <EditableText cfgKey="brand_name" value={cfgEdit.brand_name || ''} setCfg={setCfg} fallback="LUMIN SHOP" />
              </span>
              <EditableText cfgKey="brand_instagram" value={cfgEdit.brand_instagram || ''} setCfg={setCfg} fallback="@.lumin.shop" className="text-xs font-mono text-gray-400" />
            </div>
            <EditableText cfgKey="brand_location" value={cfgEdit.brand_location || ''} setCfg={setCfg} fallback="📍 Ayacucho, Perú • Envíos a Nivel Nacional" className="text-xs font-mono text-gray-400" />
          </div>
          <EditableText cfgKey="section_about_subtitle" value={cfgEdit.section_about_subtitle || ''} setCfg={setCfg} fallback="Ropa Urbana Streetwear & Sublimación de Alta Temperatura" className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white block" />
          <div className="text-sm sm:text-base leading-relaxed text-gray-300">
            <EditableText cfgKey="section_about_text" value={cfgEdit.section_about_text || ''} setCfg={setCfg} isTextarea rows={4}
              fallback="LUMIN SHOP es una marca independiente peruana dedicada al diseño y confección de streetwear exclusivo y artículos gráficos." className="w-full block" />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="px-5 py-2.5 rounded-full bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <EditableText cfgKey="section_about_cta_cat" value={cfgEdit.section_about_cta_cat || ''} setCfg={setCfg} fallback="Explorar Catálogo de Productos" />
            </span>
            <span className="px-5 py-2.5 rounded-full border bg-white/5 border-white/10 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2">
              <span className="text-[#D2E8A3]">✨</span>
              <EditableText cfgKey="section_about_cta_idea" value={cfgEdit.section_about_cta_idea || ''} setCfg={setCfg} fallback="Cotizar Idea Personalizada" />
            </span>
          </div>
        </div>
      </MirrorSection>

      {/* ─── HOW IT WORKS / PRODUCTION BADGES ─── */}
      <MirrorSection title="Cómo Funciona" icon={<RefreshCw className="w-3.5 h-3.5 text-[#D2E8A3]" />} badge="Proceso" editCount={badgeEdits}>
        <div className="p-4 sm:p-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#D2E8A3]/10 border border-[#D2E8A3]/20 text-[#D2E8A3]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <EditableText cfgKey="badge_model_title" value={cfgEdit.badge_model_title || ''} setCfg={setCfg} fallback="MODELO SUSTENTABLE BAJO DEMANDA" />
            </div>
            <EditableText cfgKey="badge_model_subtitle" value={cfgEdit.badge_model_subtitle || ''} setCfg={setCfg} fallback="¿CÓMO FUNCIONA LUMIN SHOP?" className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white block" />
            <EditableText cfgKey="badge_model_desc" value={cfgEdit.badge_model_desc || ''} setCfg={setCfg} fallback="Cero sobre-stock, mayor frescura en estampados y acabados totalmente personalizados para ti." className="text-xs sm:text-sm text-gray-300 block" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 bg-[#0A0A0A] relative overflow-hidden hover:border-[#D2E8A3]/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-[#D2E8A3]/80">{String(i).padStart(2, '0')}</span>
                  <div className="p-3 rounded-xl border bg-[#0A0A0A] border-white/10 text-[#D2E8A3]">
                    {i === 1 ? <Tag className="w-5 h-5" /> : i === 2 ? <Clock className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                  </div>
                </div>
                <EditableText cfgKey={`badge_step${i}_title`} value={cfgEdit[`badge_step${i}_title`] || ''} setCfg={setCfg} fallback={['Eliges y Configuras', 'Producción 24-48h', 'Despacho & Entrega'][i - 1]} className="font-bold text-base text-white block mb-1" />
                <EditableText cfgKey={`badge_step${i}_desc`} value={cfgEdit[`badge_step${i}_desc`] || ''} setCfg={setCfg} fallback={['Seleccionas tu prenda o vaso, talla, corte, color o texto personal.', 'Estampamos con serigrafía/fijación térmica o sublimamos a 200°C con máxima fijación.', 'Empacamos con cuidado y enviamos a la puerta de tu domicilio.'][i - 1]} className="text-xs text-gray-300 block" />
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl border border-white/5 bg-[#0A0A0A] flex flex-wrap items-center justify-around gap-4 text-xs text-gray-300">
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#D2E8A3]" /><span>Fijación Térmica HD de Alta Durabilidad</span></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#D2E8A3]" /><span>Tiempo de fabricación: 24-48 hrs</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#D2E8A3]" /><span>Atención Directa por WhatsApp</span></div>
          </div>
        </div>
      </MirrorSection>

      {/* ─── FEATURED PRODUCTS ─── */}
      <MirrorSection title="Productos Destacados" icon={<Tag className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <EditableText cfgKey="section_featured_title" value={cfgEdit.section_featured_title || ''} setCfg={setCfg} fallback="🔥 SELECCIÓN DESTACADA DROP 04" className="text-xs font-mono uppercase tracking-widest text-[#D2E8A3] block" />
              <EditableText cfgKey="section_featured_sub" value={cfgEdit.section_featured_sub || ''} setCfg={setCfg} fallback="Nuestros Más Pedidos" className="font-display text-xl sm:text-2xl font-extrabold uppercase text-white block" />
            </div>
            <span className="text-xs font-bold text-[#D2E8A3] flex items-center gap-1">
              <EditableText cfgKey="section_featured_view_all" value={cfgEdit.section_featured_view_all || ''} setCfg={setCfg} fallback="Ver Catálogo Completo" /> →
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden border border-white/5 bg-[#0A0A0A]">
                <div className="aspect-video bg-[#161814] flex items-center justify-center text-gray-600 text-xs">Producto {i}</div>
                <div className="p-3 space-y-1.5">
                  <p className="text-white text-xs font-extrabold">Producto destacado {i}</p>
                  <p className="text-[#D2E8A3] text-sm font-black">S/ 0.00</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-gray-500 text-center">Los productos destacados se muestran automáticamente desde el catálogo</p>
        </div>
      </MirrorSection>

      {/* ─── FAQ ─── */}
      <MirrorSection title="Preguntas Frecuentes" icon={<HelpCircle className="w-3.5 h-3.5 text-[#D2E8A3]" />} editCount={faqEdits}>
        <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-[#161814] text-gray-200 text-xs font-mono font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-[#D2E8A3]" />
              <EditableText cfgKey="faq_badge" value={cfgEdit.faq_badge || ''} setCfg={setCfg} fallback="RESOLVEMOS TUS DUDAS" />
            </div>
            <EditableText cfgKey="faq_heading" value={cfgEdit.faq_heading || ''} setCfg={setCfg} fallback="PREGUNTAS FRECUENTES" className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white block" />
          </div>
          {['¿Cómo funciona el proceso "Bajo Pedido"?', '¿Qué garantía tienen los estampados textiles y tazas?', '¿Puedo enviar mi propio diseño?', '¿Cómo cuidar mis vasos y tazas sublimadas?'].map((q, i) => (
            <div key={i} className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white">
                <span>{q}</span>
                <ChevronDown className="w-5 h-5 text-[#D2E8A3] flex-shrink-0" />
              </div>
            </div>
          ))}
          <p className="text-[9px] text-gray-500 text-center">Las preguntas FAQ se editan desde la sección de datos en Supabase</p>
        </div>
      </MirrorSection>

      {/* ─── FOOTER ─── */}
      <MirrorSection title="Footer" icon={<FileText className="w-3.5 h-3.5 text-[#D2E8A3]" />} editCount={footerEdits}>
        <div className="p-4 sm:p-8 bg-[#070806] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D2E8A3]"></span>
                <EditableText cfgKey="brand_name" value={cfgEdit.brand_name || ''} setCfg={setCfg} fallback="LUMIN SHOP" className="font-display text-xl font-black text-white uppercase tracking-tight" monospace />
              </div>
              <EditableText cfgKey="footer_description" value={cfgEdit.footer_description || ''} setCfg={setCfg} isTextarea rows={3}
                fallback="Marca independiente de ropa urbana streetwear (polos gráficos de alta definición) y vasos/tazas sublimadas de alta temperatura."
                className="text-gray-400 text-xs leading-relaxed block w-full" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161814] border border-[#D2E8A3]/20 text-[#D2E8A3] text-[11px] font-mono">
                <Tag className="w-3 h-3" />
                <EditableText cfgKey="footer_production" value={cfgEdit.footer_production || ''} setCfg={setCfg} fallback="Producción Express 24-48 hrs" />
              </span>
            </div>
            <div className="space-y-3">
              <EditableText cfgKey="footer_collections" value={cfgEdit.footer_collections || ''} setCfg={setCfg} fallback="Colecciones" className="font-bold text-white text-xs uppercase font-mono tracking-wider block" />
              <ul className="space-y-2">
                {[{ key: 'footer_col_1', fallback: 'Polos Oversized & Boxy Fit', icon: '👕' }, { key: 'footer_col_2', fallback: 'Vasos Frosted Glass 16oz', icon: '☕' }, { key: 'footer_col_3', fallback: 'Tazas Térmicas 11oz', icon: '🔥' }, { key: 'footer_col_4', fallback: 'Edición Especial Drop 04', icon: '✨' }].map(item => (
                  <li key={item.key} className="flex items-center gap-2">
                    <span className="text-[#D2E8A3] text-sm">{item.icon}</span>
                    <EditableText cfgKey={item.key} value={cfgEdit[item.key] || ''} setCfg={setCfg} fallback={item.fallback} className="text-gray-400 text-xs hover:text-[#D2E8A3] transition-colors" />
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <EditableText cfgKey="footer_guarantee_title" value={cfgEdit.footer_guarantee_title || ''} setCfg={setCfg} fallback="Garantía & Envíos" className="font-bold text-white text-xs uppercase font-mono tracking-wider block" />
              <ul className="space-y-2">
                {[{ key: 'footer_guarantee_1', fallback: 'Estampados HD de alta resistencia', icon: '🛡️' }, { key: 'footer_guarantee_2', fallback: 'Envíos directos a todo el país', icon: '📍' }, { key: 'footer_guarantee_3', fallback: 'Pagos seguros: Yape, Plin, Transferencia o Tarjeta', icon: '💳' }].map(item => (
                  <li key={item.key} className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <EditableText cfgKey={item.key} value={cfgEdit[item.key] || ''} setCfg={setCfg} fallback={item.fallback} className="text-gray-400 text-xs" />
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <EditableText cfgKey="footer_social_title" value={cfgEdit.footer_social_title || ''} setCfg={setCfg} fallback="Síguenos en Redes" className="font-bold text-white text-xs uppercase font-mono tracking-wider block" />
              <p className="text-gray-400 text-xs">
                <EditableText cfgKey="footer_social_text" value={cfgEdit.footer_social_text || ''} setCfg={setCfg} fallback="Encuéntranos en TikTok, Facebook e Instagram como" />{' '}
                <strong className="text-[#D2E8A3]"><EditableText cfgKey="brand_instagram" value={cfgEdit.brand_instagram || ''} setCfg={setCfg} fallback="@.lumin.shop" /></strong>
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="p-2.5 rounded-full bg-[#161814] border border-white/10 flex items-center gap-1.5 px-3.5 text-white"><MessageCircle className="w-4 h-4 text-[#D2E8A3]" /><span className="font-bold text-[11px]">WhatsApp</span></span>
                <span className="p-2.5 rounded-full bg-[#161814] border border-white/10 flex items-center gap-1.5 px-3.5 text-white"><svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.39V9.06a6.34 6.34 0 0 0-3.5 1.05 6.33 6.33 0 0 0-2.8 4.28 6.34 6.34 0 0 0 1.25 5.25A6.33 6.33 0 0 0 9.17 22a6.34 6.34 0 0 0 6.33-6.33V9a8.16 8.16 0 0 0 4.09 1.14V6.69z"/></svg><span className="font-bold text-[11px]">TikTok</span></span>
                <span className="p-2.5 rounded-full bg-[#161814] border border-white/10 flex items-center gap-1.5 px-3.5 text-white"><svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg><span className="font-bold text-[11px]">Facebook</span></span>
                <span className="p-2.5 rounded-full bg-[#161814] border border-white/10 flex items-center gap-1.5 px-3.5 text-white"><svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg><span className="font-bold text-[11px]">Instagram</span></span>
              </div>
            </div>
          </div>
          <div className="pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
            <EditableText cfgKey="footer_copyright" value={cfgEdit.footer_copyright || ''} setCfg={setCfg} fallback="© 2026 LUMIN SHOP. Todos los derechos reservados. Moda Urbana & Sublimación Bajo Pedido." />
            <p className="font-mono">Acento: #D2E8A3 | Carbón: #0A0A0A</p>
          </div>
        </div>
      </MirrorSection>

    </div>
  );
});
TabInicio.displayName = 'TabInicio';

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
   TAB: MI CUENTA
   ═══════════════════════════════════════════════════════ */
const TabCuenta = memo(({ cfgEdit, setCfg, handleFileUpload, uploading, uploadTarget, backupStatus, handleBackup, handleRestoreFile, handleRestoreConfirm, restorePreview, setRestorePreview }: any) => (
  <div className="p-5 sm:p-8 space-y-6 max-w-[1200px] mx-auto">

    {/* Brand */}
    <Section title="Header & Marca" icon={<User className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre"><TextInput value={cfgEdit.brand_name || ''} onChange={(v: string) => setCfg('brand_name', v)} /></Field>
            <Field label="Slogan"><TextInput value={cfgEdit.brand_slogan || ''} onChange={(v: string) => setCfg('brand_slogan', v)} /></Field>
          </div>
          <p className="text-[10px] text-gray-500">Teléfono y redes sociales se configuran en la pestaña <strong className="text-[#D2E8A3]">Config</strong>.</p>
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
      <p className="text-[10px] text-gray-500">Precios de envío por zona. Recojo en Tienda es GRATIS.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Ayacucho/Huamanga (S/)"><TextInput type="number" value={cfgEdit.shipping_price_huamanga || '0'} onChange={(v: string) => setCfg('shipping_price_huamanga', v)} /></Field>
          <Field label="Provincia (S/)"><TextInput type="number" value={cfgEdit.shipping_price_provincia || '25'} onChange={(v: string) => setCfg('shipping_price_provincia', v)} /></Field>
          <Field label="Internac. (S/)"><TextInput type="number" value={cfgEdit.shipping_price_internacional || '80'} onChange={(v: string) => setCfg('shipping_price_internacional', v)} /></Field>
        </div>
        <PreviewBox title="Vista Previa — Envíos">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '📍', label: 'Ayacucho', price: cfgEdit.shipping_price_huamanga === '0' || !cfgEdit.shipping_price_huamanga ? 'GRATIS' : `S/ ${cfgEdit.shipping_price_huamanga}` },
              { icon: '📦', label: 'Provincia', price: `S/ ${cfgEdit.shipping_price_provincia || '25'}` },
              { icon: '✈️', label: 'Internac.', price: `S/ ${cfgEdit.shipping_price_internacional || '80'}` },
            ].map(z => (
              <div key={z.label} className="p-3 rounded-xl bg-white/5 border border-white/5 text-center space-y-1">
                <span className="text-lg block">{z.icon}</span>
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

    {/* Backup & Restore */}
    <Section title="Backup & Restaurar Datos" icon={<RefreshCw className="w-3.5 h-3.5 text-[#D2E8A3]" />} badge="Seguridad">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0A0B0A] border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2"><Download className="w-3.5 h-3.5 text-[#D2E8A3]" /> Descargar Backup Completo</h4>
            <p className="text-[11px] text-gray-400">Exporta todos tus productos, configuración, pedidos y categorías como archivo JSON. Úsalo para restaurar tu tienda si algo sale mal.</p>
            <button onClick={handleBackup} disabled={backupStatus === 'backing_up'}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                backupStatus === 'done' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#D2E8A3]/10 text-[#D2E8A3] border border-[#D2E8A3]/30 hover:bg-[#D2E8A3]/20'
              }`}>
              {backupStatus === 'backing_up' ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generando backup...</> : backupStatus === 'done' ? <><Check className="w-3.5 h-3.5" /> Backup descargado</> : <><Download className="w-3.5 h-3.5" /> Descargar Backup JSON</>}
            </button>
          </div>
          <div className="p-4 rounded-xl bg-[#0A0B0A] border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2"><Upload className="w-3.5 h-3.5 text-[#D2E8A3]" /> Restaurar desde Backup</h4>
            <p className="text-[11px] text-gray-400">Sube un archivo de backup JSON para restaurar todos tus datos. Esto reemplazará la configuración actual.</p>
            <label className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
              backupStatus === 'restored' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}>
              {backupStatus === 'restoring' ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Restaurando...</> : backupStatus === 'restored' ? <><Check className="w-3.5 h-3.5" /> Datos restaurados</> : <><Upload className="w-3.5 h-3.5" /> Seleccionar Archivo de Backup</>}
              <input type="file" accept=".json" className="hidden" onChange={handleRestoreFile} disabled={backupStatus === 'restoring'} />
            </label>
          </div>
        </div>
        <div className="space-y-3">
          {restorePreview ? (
            <div className="p-4 rounded-xl bg-[#0A0B0A] border border-[#D2E8A3]/30 space-y-3">
              <h4 className="text-xs font-bold text-[#D2E8A3] uppercase">Vista Previa del Backup</h4>
              <div className="space-y-1.5 text-[11px]">
                <p className="text-gray-400"><span className="text-white font-bold">Tienda:</span> {restorePreview.shop}</p>
                <p className="text-gray-400"><span className="text-white font-bold">Fecha:</span> {new Date(restorePreview.created_at).toLocaleString('es-PE')}</p>
                <p className="text-gray-400"><span className="text-white font-bold">Tablas:</span> {(restorePreview.tables || Object.keys(restorePreview.data)).length}</p>
                {(restorePreview.tables || Object.keys(restorePreview.data)).map((t: string) => (
                  <p key={t} className="text-gray-400 pl-3"><span className="text-[#D2E8A3] font-mono">{t}:</span> {restorePreview.data[t]?.length || 0} registros</p>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleRestoreConfirm} disabled={backupStatus === 'restoring'} className="flex-1 py-2 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] text-xs font-bold hover:bg-[#c2e088] transition-all">Confirmar Restauración</button>
                <button onClick={() => setRestorePreview(null)} className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-bold border border-white/10 hover:bg-white/10 transition-all">Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0A0B0A] border border-white/5 space-y-2 text-center">
              <RefreshCw className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-[11px] text-gray-500">Selecciona un archivo de backup JSON para vista previa antes de restaurar.</p>
            </div>
          )}
        </div>
      </div>
    </Section>
  </div>
));
TabCuenta.displayName = 'TabCuenta';
