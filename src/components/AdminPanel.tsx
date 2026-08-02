import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import {
  X, Upload, Save, Eye, EyeOff, Lock, Package, Settings, Image, Plus, Trash2,
  ArrowLeft, Check, ShoppingCart, Sliders, Sun, Home, LayoutGrid, Heart, FileText,
  User, ChevronDown, ChevronRight, Shirt, Coffee, Pencil, Type, MessageCircle,
  Clock, ShieldCheck, Truck, RefreshCw, Tag, HelpCircle, ChevronUp, Download,
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

  // ===== BACKUP / RESTORE =====
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing_up' | 'done' | 'restoring' | 'restored' | 'error'>('idle');
  const [restorePreview, setRestorePreview] = useState<any>(null);

  // Known Supabase tables — add new table names here when you create them
  const TABLES_TO_BACKUP = [
    'configuracion', 'productos', 'categorias', 'pedidos',
    'usuarios', 'perfiles', 'favoritos', 'carrito', 'ideas_personalizadas',
  ];

  const handleBackup = async () => {
    if (!supabase) return;
    setBackupStatus('backing_up');
    try {
      const results: Record<string, any[]> = {};
      const countPromises = TABLES_TO_BACKUP.map(async (table) => {
        try {
          const { data, error } = await supabase.from(table).select('*');
          if (!error && data) results[table] = data;
        } catch {}
      });
      await Promise.all(countPromises);

      const backup = {
        version: '2.0',
        created_at: new Date().toISOString(),
        shop: 'LUMIN SHOP',
        tables: Object.keys(results),
        data: results,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumin-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupStatus('done');
      setTimeout(() => setBackupStatus('idle'), 3000);
    } catch {
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.data && (parsed.shop === 'LUMIN SHOP' || parsed.version)) {
          setRestorePreview(parsed);
        } else {
          alert('Archivo de backup no válido de LUMIN SHOP');
        }
      } catch {
        alert('Error al leer el archivo JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestoreConfirm = async () => {
    if (!supabase || !restorePreview) return;
    setBackupStatus('restoring');
    try {
      const tablesToRestore = restorePreview.tables || Object.keys(restorePreview.data);

      for (const table of tablesToRestore) {
        const rows = restorePreview.data[table];
        if (!rows?.length) continue;

        // Detect primary key from first row
        const firstRow = rows[0];
        const pk = firstRow.id ? 'id' : firstRow.usuario_id ? 'usuario_id' : null;

        for (const row of rows) {
          if (pk) {
            await supabase.from(table).upsert(row, { onConflict: pk });
          } else {
            await supabase.from(table).insert(row);
          }
        }
      }

      setRestorePreview(null);
      setBackupStatus('restored');
      await reloadConfig();
      onConfigChange?.();
      loadConfig();
      loadProducts();
      loadOrders();
      setTimeout(() => setBackupStatus('idle'), 3000);
    } catch {
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }
  };

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
          {mainTab === 'cuenta' && <TabCuenta cfgEdit={cfgEdit} setCfg={setCfg} handleFileUpload={handleFileUpload} uploading={uploading} uploadTarget={uploadTarget} backupStatus={backupStatus} handleBackup={handleBackup} handleRestoreFile={handleRestoreFile} handleRestoreConfirm={handleRestoreConfirm} restorePreview={restorePreview} />}
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
          <video src={value} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="auto" crossOrigin="anonymous" onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }} />
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
   EDITABLE TEXT — WYSIWYG inline editing
   ═══════════════════════════════════════════════════════ */
const EditableText = memo(({ cfgKey, value, setCfg, className, isTextarea, rows, fallback, monospace }: {
  cfgKey: string; value: string; setCfg: (k: string, v: string) => void;
  className?: string; isTextarea?: boolean; rows?: number; fallback?: string; monospace?: boolean;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const display = value || fallback || '';

  useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [editing]);

  const save = () => { setEditing(false); if (draft !== (value || '')) setCfg(cfgKey, draft); };
  const cancel = () => { setDraft(value || ''); setEditing(false); };

  if (editing) {
    const base = 'w-full px-2 py-1 rounded-lg border border-[#D2E8A3] bg-black text-white text-inherit focus:outline-none focus:ring-1 focus:ring-[#D2E8A3]/50 z-50 relative';
    return isTextarea ? (
      <div className="relative group">
        <textarea ref={inputRef as any} value={draft} onChange={e => setDraft(e.target.value)} onBlur={save}
          onKeyDown={e => { if (e.key === 'Escape') cancel(); if (e.key === 'Enter' && e.metaKey) save(); }}
          rows={rows || 3} className={`${base} resize-none ${className || ''}`} />
        <span className="absolute -top-6 left-0 text-[9px] font-mono text-[#D2E8A3] bg-black px-1.5 py-0.5 rounded-md border border-[#D2E8A3]/30 z-50 whitespace-nowrap">{cfgKey}</span>
      </div>
    ) : (
      <div className="relative group">
        <input ref={inputRef as any} value={draft} onChange={e => setDraft(e.target.value)} onBlur={save}
          onKeyDown={e => { if (e.key === 'Escape') cancel(); if (e.key === 'Enter') save(); }}
          className={`${base} ${className || ''}`} />
        <span className="absolute -top-6 left-0 text-[9px] font-mono text-[#D2E8A3] bg-black px-1.5 py-0.5 rounded-md border border-[#D2E8A3]/30 z-50 whitespace-nowrap">{cfgKey}</span>
      </div>
    );
  }

  return (
    <span
      onDoubleClick={() => { setDraft(value || ''); setEditing(true); }}
      className={`cursor-pointer rounded-lg px-1.5 -mx-1.5 transition-all group relative inline-flex items-center gap-1.5 min-h-[1.5em] border border-transparent hover:border-[#D2E8A3]/40 hover:bg-[#D2E8A3]/[0.07] hover:shadow-[0_0_0_1px_rgba(210,232,163,0.1)] ${monospace ? 'font-mono' : ''} ${className || ''}`}
      title={`Doble clic para editar: ${cfgKey}`}
    >
      {display}
      <Pencil className="w-3 h-3 text-[#D2E8A3] opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0" />
    </span>
  );
});
EditableText.displayName = 'EditableText';

/* ═══════════════════════════════════════════════════════
   EDITABLE IMAGE — WYSIWYG media upload
   ═══════════════════════════════════════════════════════ */
const EditableImage = memo(({ cfgKey, value, setCfg, handleFileUpload, uploading, uploadTarget, className, fallback }: {
  cfgKey: string; value: string; setCfg: (k: string, v: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void;
  uploading: boolean; uploadTarget: string; className?: string; fallback?: string;
}) => {
  const isVideo = /\.(mp4|webm)$/i.test(value || '');
  const hasMedia = !!value;
  return (
    <div className={`relative group ${className || ''}`}>
      {hasMedia ? (
        isVideo ? <video src={value} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="auto" crossOrigin="anonymous" onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }} /> : <img src={value} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs bg-[#161814]">{fallback || 'Sin media'}</div>
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <label className={`px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer border border-[#D2E8A3]/30 text-[#D2E8A3] bg-black/80 hover:bg-[#D2E8A3]/10 transition-all flex items-center gap-1 ${uploading && uploadTarget === cfgKey ? 'animate-pulse' : ''}`}>
          <Upload className="w-3 h-3" />{uploading && uploadTarget === cfgKey ? 'Subiendo...' : 'Subir'}
          <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={e => handleFileUpload(e, cfgKey)} disabled={uploading} />
        </label>
      </div>
    </div>
  );
});
EditableImage.displayName = 'EditableImage';

/* ═══════════════════════════════════════════════════════
   SITE MIRROR SECTION WRAPPER
   ═══════════════════════════════════════════════════════ */
const MirrorSection = memo(({ title, icon, children, badge, editCount }: {
  title: string; icon?: React.ReactNode; children: React.ReactNode; badge?: string; editCount?: number;
}) => (
  <div className="rounded-3xl border border-white/10 bg-[#161814] overflow-hidden relative">
    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
      {icon && <span className="w-6 h-6 rounded-lg bg-[#D2E8A3]/10 flex items-center justify-center backdrop-blur-sm">{icon}</span>}
      <span className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest backdrop-blur-sm bg-black/40 px-2 py-1 rounded-lg">{title}</span>
    </div>
    {badge && <span className="absolute top-3 right-3 z-10 text-[9px] font-bold text-[#D2E8A3] bg-[#D2E8A3]/10 px-2 py-1 rounded-lg backdrop-blur-sm">{badge}</span>}
    {editCount !== undefined && editCount > 0 && <span className="absolute top-3 right-3 z-10 text-[9px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg backdrop-blur-sm">✓ {editCount}</span>}
    {children}
  </div>
));
MirrorSection.displayName = 'MirrorSection';

/* ═══════════════════════════════════════════════════════
   TAB: INICIO — WYSIWYG SITE MIRROR
   ═══════════════════════════════════════════════════════ */
const TabInicio = memo(({ cfgEdit, setCfg, configRows, handleFileUpload, uploading, uploadTarget }: any) => {
  const heroEdits = [cfgEdit.hero_badge, cfgEdit.hero_title_1, cfgEdit.hero_title_2, cfgEdit.hero_subtitle_1, cfgEdit.hero_subtitle_2, cfgEdit.hero_description, cfgEdit.hero_badge_1, cfgEdit.hero_badge_2, cfgEdit.hero_cta_catalogo, cfgEdit.hero_cta_idea].filter(Boolean).length;
  const socialEdits = [cfgEdit.social_bar_title, cfgEdit.social_bar_text, cfgEdit.social_bar_sub].filter(Boolean).length;
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

            {/* Left: Text */}
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

            {/* Right: Media */}
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

      {/* ─── SOCIAL QUICK BAR ─── */}
      <MirrorSection title="Social Bar" icon={<MessageCircle className="w-3.5 h-3.5 text-green-500" />} editCount={socialEdits}>
        <div className="p-4 sm:p-6">
          <div className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-[#0A0A0A]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 flex-shrink-0">
                  <MessageCircle className="w-5 h-5 fill-green-500 text-green-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <EditableText cfgKey="social_bar_title" value={cfgEdit.social_bar_title || ''} setCfg={setCfg} fallback="WhatsApp & Redes Oficiales" className="font-extrabold text-sm sm:text-base uppercase tracking-tight text-white" />
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                  <p className="text-xs text-gray-400">
                    <EditableText cfgKey="social_bar_text" value={cfgEdit.social_bar_text || ''} setCfg={setCfg} fallback="Contacto directo" />{' '}
                    <strong className="text-white"><EditableText cfgKey="brand_phone" value={cfgEdit.brand_phone || ''} setCfg={setCfg} fallback="993 365 099" /></strong>{' '}
                    • <EditableText cfgKey="social_bar_sub" value={cfgEdit.social_bar_sub || ''} setCfg={setCfg} fallback="Respuesta inmediata" />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="p-3 rounded-2xl bg-green-500 text-black font-bold flex items-center gap-2 px-4">
                  <MessageCircle className="w-5 h-5 fill-black" />
                  <span className="text-xs uppercase font-extrabold">WhatsApp</span>
                </span>
                <span className="p-3 rounded-2xl bg-[#0A0A0A] border border-white/10 text-gray-300 flex items-center justify-center">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </span>
                <span className="p-3 rounded-2xl bg-[#0A0A0A] border border-white/10 text-gray-300 flex items-center justify-center">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.39V9.06a6.34 6.34 0 0 0-3.5 1.05 6.33 6.33 0 0 0-2.8 4.28 6.34 6.34 0 0 0 1.25 5.25A6.33 6.33 0 0 0 9.17 22a6.34 6.34 0 0 0 6.33-6.33V9a8.16 8.16 0 0 0 4.09 1.14V6.69z"/></svg>
                </span>
                <span className="p-3 rounded-2xl bg-[#0A0A0A] border border-white/10 text-gray-300 flex items-center justify-center">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </span>
              </div>
            </div>
          </div>
          {/* Social URL Edit Fields */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><svg className="w-3 h-3 fill-current text-pink-400" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> Instagram</label>
              <EditableText cfgKey="brand_instagram" value={cfgEdit.brand_instagram || ''} setCfg={setCfg} fallback="https://instagram.com/lumin.shop" className="text-xs text-gray-300 w-full block" monospace />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><svg className="w-3 h-3 fill-current text-gray-300" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.39V9.06a6.34 6.34 0 0 0-3.5 1.05 6.33 6.33 0 0 0-2.8 4.28 6.34 6.34 0 0 0 1.25 5.25A6.33 6.33 0 0 0 9.17 22a6.34 6.34 0 0 0 6.33-6.33V9a8.16 8.16 0 0 0 4.09 1.14V6.69z"/></svg> TikTok</label>
              <EditableText cfgKey="brand_tiktok" value={cfgEdit.brand_tiktok || ''} setCfg={setCfg} fallback="https://tiktok.com/@.lumin.shop" className="text-xs text-gray-300 w-full block" monospace />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><svg className="w-3 h-3 fill-current text-blue-400" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook</label>
              <EditableText cfgKey="brand_facebook" value={cfgEdit.brand_facebook || ''} setCfg={setCfg} fallback="https://facebook.com/lumin.shop" className="text-xs text-gray-300 w-full block" monospace />
            </div>
          </div>
          <p className="text-[9px] text-gray-600 mt-1.5">Pega URLs completas (https://...) o solo el usuario (ej: lumin.shop)</p>
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
          {/* Top Banner */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#D2E8A3]/10 border border-[#D2E8A3]/20 text-[#D2E8A3]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <EditableText cfgKey="badge_model_title" value={cfgEdit.badge_model_title || ''} setCfg={setCfg} fallback="MODELO SUSTENTABLE BAJO DEMANDA" />
            </div>
            <EditableText cfgKey="badge_model_subtitle" value={cfgEdit.badge_model_subtitle || ''} setCfg={setCfg} fallback="¿CÓMO FUNCIONA LUMIN SHOP?" className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white block" />
            <EditableText cfgKey="badge_model_desc" value={cfgEdit.badge_model_desc || ''} setCfg={setCfg} fallback="Cero sobre-stock, mayor frescura en estampados y acabados totalmente personalizados para ti." className="text-xs sm:text-sm text-gray-300 block" />
          </div>

          {/* 3 Steps */}
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

          {/* Trust Bar */}
          <div className="p-4 rounded-2xl border border-white/5 bg-[#0A0A0A] flex flex-wrap items-center justify-around gap-4 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D2E8A3]" />
              <span>Fijación Térmica HD de Alta Durabilidad</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D2E8A3]" />
              <span>Tiempo de fabricación: 24-48 hrs</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#D2E8A3]" />
              <span>Atención Directa por WhatsApp</span>
            </div>
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
            {/* Col 1: Brand */}
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

            {/* Col 2: Collections */}
            <div className="space-y-3">
              <EditableText cfgKey="footer_collections" value={cfgEdit.footer_collections || ''} setCfg={setCfg} fallback="Colecciones" className="font-bold text-white text-xs uppercase font-mono tracking-wider block" />
              <ul className="space-y-2">
                {[
                  { key: 'footer_col_1', fallback: 'Polos Oversized & Boxy Fit', icon: '👕' },
                  { key: 'footer_col_2', fallback: 'Vasos Frosted Glass 16oz', icon: '☕' },
                  { key: 'footer_col_3', fallback: 'Tazas Térmicas 11oz', icon: '🔥' },
                  { key: 'footer_col_4', fallback: 'Edición Especial Drop 04', icon: '✨' },
                ].map(item => (
                  <li key={item.key} className="flex items-center gap-2">
                    <span className="text-[#D2E8A3] text-sm">{item.icon}</span>
                    <EditableText cfgKey={item.key} value={cfgEdit[item.key] || ''} setCfg={setCfg} fallback={item.fallback} className="text-gray-400 text-xs hover:text-[#D2E8A3] transition-colors" />
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Guarantees */}
            <div className="space-y-3">
              <EditableText cfgKey="footer_guarantee_title" value={cfgEdit.footer_guarantee_title || ''} setCfg={setCfg} fallback="Garantía & Envíos" className="font-bold text-white text-xs uppercase font-mono tracking-wider block" />
              <ul className="space-y-2">
                {[
                  { key: 'footer_guarantee_1', fallback: 'Estampados HD de alta resistencia', icon: '🛡️' },
                  { key: 'footer_guarantee_2', fallback: 'Envíos directos a todo el país', icon: '📍' },
                  { key: 'footer_guarantee_3', fallback: 'Pagos seguros: Yape, Plin, Transferencia o Tarjeta', icon: '💳' },
                ].map(item => (
                  <li key={item.key} className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <EditableText cfgKey={item.key} value={cfgEdit[item.key] || ''} setCfg={setCfg} fallback={item.fallback} className="text-gray-400 text-xs" />
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Social */}
            <div className="space-y-3">
              <EditableText cfgKey="footer_social_title" value={cfgEdit.footer_social_title || ''} setCfg={setCfg} fallback="Síguenos en Redes" className="font-bold text-white text-xs uppercase font-mono tracking-wider block" />
              <p className="text-gray-400 text-xs">
                <EditableText cfgKey="footer_social_text" value={cfgEdit.footer_social_text || ''} setCfg={setCfg} fallback="Encuéntranos en TikTok, Facebook e Instagram como" />{' '}
                <strong className="text-[#D2E8A3]"><EditableText cfgKey="brand_instagram" value={cfgEdit.brand_instagram || ''} setCfg={setCfg} fallback="@.lumin.shop" /></strong>
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="p-2.5 rounded-full bg-[#161814] border border-white/10 flex items-center gap-1.5 px-3.5 text-white">
                  <MessageCircle className="w-4 h-4 text-[#D2E8A3]" />
                  <span className="font-bold text-[11px]">WhatsApp</span>
                </span>
                <span className="p-2.5 rounded-full bg-[#161814] border border-white/10 flex items-center gap-1.5 px-3.5 text-white">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.39V9.06a6.34 6.34 0 0 0-3.5 1.05 6.33 6.33 0 0 0-2.8 4.28 6.34 6.34 0 0 0 1.25 5.25A6.33 6.33 0 0 0 9.17 22a6.34 6.34 0 0 0 6.33-6.33V9a8.16 8.16 0 0 0 4.09 1.14V6.69z"/></svg>
                  <span className="font-bold text-[11px]">TikTok</span>
                </span>
                <span className="p-2.5 rounded-full bg-[#161814] border border-white/10 flex items-center gap-1.5 px-3.5 text-white">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <span className="font-bold text-[11px]">Facebook</span>
                </span>
                <span className="p-2.5 rounded-full bg-[#161814] border border-white/10 flex items-center gap-1.5 px-3.5 text-white">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  <span className="font-bold text-[11px]">Instagram</span>
                </span>
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

            {/* Gallery Images Editor */}
            <div className="space-y-2">
              <label className={_labelCls}>Galería de Imágenes</label>
              <p className="text-[10px] text-gray-500">Imágenes adicionales que se muestran al cliente al abrir el producto.</p>
              <div className="flex flex-wrap gap-2">
                {(editingProduct.galeria || []).map((img: string, i: number) => (
                  <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        const gal = (editingProduct.galeria || []).filter((_: string, j: number) => j !== i);
                        setEditingProduct((p: any) => p ? { ...p, galeria: gal.length > 0 ? gal : null } : p);
                      }}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 hover:border-[#D2E8A3]/50 hover:text-[#D2E8A3] transition-all cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span className="text-[8px] font-bold mt-0.5">Agregar</span>
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !supabase || !editingProduct) return;
                      try {
                        const ext = file.name.split('.').pop() || 'jpg';
                        const path = `products/${editingProduct.id}_gallery_${Date.now()}.${ext}`;
                        const { error } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false });
                        if (error) throw error;
                        const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
                        if (urlData?.publicUrl) {
                          const gal = [...(editingProduct.galeria || []), urlData.publicUrl];
                          setEditingProduct((p: any) => p ? { ...p, galeria: gal } : p);
                        }
                      } catch (err: any) { alert('Error: ' + err.message); }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

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
const TabCuenta = memo(({ cfgEdit, setCfg, handleFileUpload, uploading, uploadTarget, backupStatus, handleBackup, handleRestoreFile, handleRestoreConfirm, restorePreview }: any) => (
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
          {/* Backup */}
          <div className="p-4 rounded-xl bg-[#0A0B0A] border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-[#D2E8A3]" />
              Descargar Backup Completo
            </h4>
            <p className="text-[11px] text-gray-400">
              Exporta todos tus productos, configuración, pedidos y categorías como archivo JSON.
              Úsalo para restaurar tu tienda si algo sale mal.
            </p>
            <button
              onClick={handleBackup}
              disabled={backupStatus === 'backing_up'}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                backupStatus === 'done'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-[#D2E8A3]/10 text-[#D2E8A3] border border-[#D2E8A3]/30 hover:bg-[#D2E8A3]/20'
              }`}
            >
              {backupStatus === 'backing_up' ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generando backup...</>
              ) : backupStatus === 'done' ? (
                <><Check className="w-3.5 h-3.5" /> Backup descargado</>
              ) : (
                <><Download className="w-3.5 h-3.5" /> Descargar Backup JSON</>
              )}
            </button>
          </div>

          {/* Restore */}
          <div className="p-4 rounded-xl bg-[#0A0B0A] border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-[#D2E8A3]" />
              Restaurar desde Backup
            </h4>
            <p className="text-[11px] text-gray-400">
              Sube un archivo de backup JSON para restaurar todos tus datos. Esto reemplazará la configuración actual.
            </p>
            <label className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
              backupStatus === 'restored'
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}>
              {backupStatus === 'restoring' ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Restaurando...</>
              ) : backupStatus === 'restored' ? (
                <><Check className="w-3.5 h-3.5" /> Datos restaurados</>
              ) : (
                <><Upload className="w-3.5 h-3.5" /> Seleccionar Archivo de Backup</>
              )}
              <input type="file" accept=".json" className="hidden" onChange={handleRestoreFile} disabled={backupStatus === 'restoring'} />
            </label>
          </div>
        </div>

        {/* Restore Preview */}
        <div className="space-y-3">
          {restorePreview ? (
            <div className="p-4 rounded-xl bg-[#0A0B0A] border border-[#D2E8A3]/30 space-y-3">
              <h4 className="text-xs font-bold text-[#D2E8A3] uppercase">Vista Previa del Backup</h4>
              <div className="space-y-1.5 text-[11px]">
                <p className="text-gray-400"><span className="text-white font-bold">Tienda:</span> {restorePreview.shop}</p>
                <p className="text-gray-400"><span className="text-white font-bold">Fecha:</span> {new Date(restorePreview.created_at).toLocaleString('es-PE')}</p>
                <p className="text-gray-400"><span className="text-white font-bold">Tablas:</span> {(restorePreview.tables || Object.keys(restorePreview.data)).length}</p>
                {(restorePreview.tables || Object.keys(restorePreview.data)).map((t: string) => (
                  <p key={t} className="text-gray-400 pl-3">
                    <span className="text-[#D2E8A3] font-mono">{t}:</span> {restorePreview.data[t]?.length || 0} registros
                  </p>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleRestoreConfirm}
                  disabled={backupStatus === 'restoring'}
                  className="flex-1 py-2 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] text-xs font-bold hover:bg-[#c2e088] transition-all"
                >
                  Confirmar Restauración
                </button>
                <button
                  onClick={() => setRestorePreview(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-bold border border-white/10 hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0A0B0A] border border-white/5 space-y-2 text-center">
              <RefreshCw className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-[11px] text-gray-500">
                Selecciona un archivo de backup JSON para vista previa antes de restaurar.
              </p>
            </div>
          )}
        </div>
      </div>
    </Section>
  </div>
));
TabCuenta.displayName = 'TabCuenta';
