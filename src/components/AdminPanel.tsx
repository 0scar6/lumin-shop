import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Eye, EyeOff, Lock, Package, Settings, Image, Plus, Trash2, ArrowLeft, Check, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { reloadConfig } from '../lib/config';

const ADMIN_PASS = 'Ratitaxd12';

interface AdminPanelProps { isOpen: boolean; onClose: () => void; themeMode?: 'dark' | 'light' | 'amoled'; onConfigChange?: () => void; }
interface ConfigRow { id: string; seccion: string; clave: string; valor: string; }
interface ProductoRow { id: string; nombre: string; categoria_id: string; precio: number; precio_original: number | null; tecnica: string; tiempo_produccion: string; imagen: string; galeria: any; descripcion: string; etiqueta: string; opciones_ropa: any; opciones_vaso: any; personalizable: boolean; activo: boolean; destacado: boolean; }
interface PedidoRow { id: string; usuario_id: string; cliente_nombre: string; cliente_telefono: string; cliente_direccion: string; productos: any; total: number; estado: string; created_at: string; }

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onConfigChange }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [mainTab, setMainTab] = useState<'config' | 'products' | 'orders'>('config');

  // Config
  const [configRows, setConfigRows] = useState<ConfigRow[]>([]);
  const [cfgEdit, setCfgEdit] = useState<Record<string, string>>({});
  const [cfgOriginal, setCfgOriginal] = useState<Record<string, string>>({});
  const [cfgSection, setCfgSection] = useState('hero');
  const [cfgSaved, setCfgSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState('');

  // Products
  const [products, setProducts] = useState<ProductoRow[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductoRow | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [prodSaving, setProdSaving] = useState(false);

  // Orders
  const [orders, setOrders] = useState<PedidoRow[]>([]);

  useEffect(() => { if (!isOpen) { setAuthenticated(false); setPw(''); setEditingProduct(null); } }, [isOpen]);
  const handleLogin = () => { if (pw === ADMIN_PASS) { setAuthenticated(true); setPwError(false); } else { setPwError(true); setTimeout(() => setPwError(false), 2000); } };

  useEffect(() => { if (!authenticated || !supabase) return; loadConfig(); loadProducts(); loadOrders(); }, [authenticated]);

  const loadConfig = async () => { try { const { data } = await supabase!.from('configuracion').select('*'); if (data) { setConfigRows(data); const v: Record<string, string> = {}; data.forEach((r: ConfigRow) => { v[r.id] = r.valor; }); setCfgEdit(v); setCfgOriginal(v); } } catch {} };
  const loadProducts = async () => { try { const { data } = await supabase!.from('productos').select('*').order('created_at', { ascending: false }); if (data) setProducts(data as ProductoRow[]); } catch {} };
  const loadOrders = async () => { try { const { data } = await supabase!.from('pedidos').select('*').order('created_at', { ascending: false }); if (data) setOrders(data as PedidoRow[]); } catch {} };

  // Config save
  const cfgChanged = configRows.filter(r => cfgEdit[r.id] !== cfgOriginal[r.id]).length;
  const handleCfgSave = async () => { if (!supabase) return; for (const row of configRows) { const v = cfgEdit[row.id] ?? row.valor; if (v !== cfgOriginal[row.id]) { await supabase.from('configuracion').upsert({ id: row.id, seccion: row.seccion, clave: row.clave, valor: v }, { onConflict: 'id' }); } } setCfgOriginal({ ...cfgEdit }); setCfgSaved(true); await reloadConfig(); onConfigChange?.(); setTimeout(() => setCfgSaved(false), 2000); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => { const file = e.target.files?.[0]; if (!file || !supabase) return; setUploading(true); setUploadTarget(key); try { const ext = file.name.split('.').pop() || 'jpg'; const path = `uploads/${key}_${Date.now()}.${ext}`; const { error } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false }); if (error) throw error; const { data: urlData } = supabase.storage.from('media').getPublicUrl(path); if (urlData?.publicUrl) setCfgEdit(prev => ({ ...prev, [key]: urlData.publicUrl })); } catch (err: any) { alert('Error: ' + (err.message || err)); } setUploading(false); setUploadTarget(''); };

  // Products
  const startNewProduct = () => { setEditingProduct({ id: `prod-${Date.now()}`, nombre: '', categoria_id: 'streetwear', precio: 0, precio_original: null, tecnica: '', tiempo_produccion: '⚡ 24-48 hrs', imagen: '', galeria: null, descripcion: '', etiqueta: '', opciones_ropa: null, opciones_vaso: null, personalizable: false, activo: true, destacado: false }); setIsNewProduct(true); };

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
      await loadProducts();
      setEditingProduct(null);
      setIsNewProduct(false);
    } catch (err: any) { alert('Error al guardar: ' + (err.message || JSON.stringify(err))); }
    setProdSaving(false);
  };

  const handleProdDelete = async (id: string) => { if (!supabase || !confirm('¿Eliminar este producto?')) return; await supabase.from('productos').delete().eq('id', id); await loadProducts(); setEditingProduct(null); };

  const handleProdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !supabase || !editingProduct) return;
    setUploading(true);
    try { const ext = file.name.split('.').pop() || 'jpg'; const path = `products/${editingProduct.id}_${Date.now()}.${ext}`; const { error } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false }); if (error) throw error; const { data: urlData } = supabase.storage.from('media').getPublicUrl(path); if (urlData?.publicUrl) setEditingProduct(p => p ? { ...p, imagen: urlData.publicUrl } : p); } catch (err: any) { alert('Error: ' + err.message); }
    setUploading(false);
  };

  // Orders
  const handleOrderStatus = async (orderId: string, status: string) => { if (!supabase) return; await supabase.from('pedidos').update({ estado: status }).eq('id', orderId); setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: status } : o)); };

  // Reusable input class
  const inputCls = 'w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#1a1d1a] border-[#333] placeholder-gray-500 focus:outline-none focus:border-[#D2E8A3] focus:ring-1 focus:ring-[#D2E8A3]/30 transition-all';
  const labelCls = 'block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5';

  // Preview Banner
  const PreviewBanner = () => (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0F110D] p-3 space-y-2">
      <p className="text-[9px] font-bold text-[#D2E8A3] uppercase">Preview — Hero</p>
      <div className="rounded-lg overflow-hidden border border-white/10 bg-gradient-to-br from-[#161814] to-[#0A0A0A] p-3 space-y-2">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D2E8A3]/10 border border-[#D2E8A3]/30">
          <span className="text-[7px] font-bold text-[#D2E8A3]">{cfgEdit.hero_badge || 'Exclusivo'}</span>
        </div>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-7 space-y-1.5">
            <p className="font-black text-[10px] leading-tight">
              <span className="text-white">{cfgEdit.hero_title_1 || 'MODA URBANA &'}</span>{' '}
              <span className="text-[#D2E8A3]">{cfgEdit.hero_title_2 || 'VASOS SUBLIMADOS'}</span>
            </p>
            <p className="text-[7px] text-gray-400">{cfgEdit.hero_description || 'Sin sobre-stock...'}</p>
            <div className="flex gap-1">
              <span className="px-1.5 py-0.5 rounded bg-[#D2E8A3] text-[#0A0A0A] text-[6px] font-extrabold">{cfgEdit.hero_cta_catalogo || 'EXPLORAR'}</span>
              <span className="px-1.5 py-0.5 rounded border border-white/10 text-white text-[6px] font-bold">{cfgEdit.hero_cta_idea || 'Personalizar'}</span>
            </div>
          </div>
          <div className="col-span-5 grid grid-cols-2 gap-1">
            <div className="aspect-[4/5] rounded overflow-hidden bg-black/40">
              {cfgEdit.hero_media_1_url ? (/\.(mp4|webm)$/i.test(cfgEdit.hero_media_1_url) ? <video src={cfgEdit.hero_media_1_url} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <img src={cfgEdit.hero_media_1_url} className="w-full h-full object-cover" alt="" />) : <div className="w-full h-full flex items-center justify-center text-gray-600 text-[7px]">Media 1</div>}
            </div>
            <div className="aspect-[4/5] rounded overflow-hidden bg-black/40 mt-2">
              {cfgEdit.hero_media_2_url ? (/\.(mp4|webm)$/i.test(cfgEdit.hero_media_2_url) ? <video src={cfgEdit.hero_media_2_url} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <img src={cfgEdit.hero_media_2_url} className="w-full h-full object-cover" alt="" />) : <div className="w-full h-full flex items-center justify-center text-gray-600 text-[7px]">Media 2</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  // PASSWORD
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

  const cfgSections = [
    { key: 'hero', label: 'Hero' }, { key: 'marca', label: 'Marca' }, { key: 'secciones', label: 'Secciones' },
    { key: 'footer', label: 'Footer' }, { key: 'badges', label: 'Badges' }, { key: 'carrito', label: 'Carrito' }, { key: 'perfil', label: 'Perfil' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4" onClick={onClose}>
      <div className="relative w-full max-w-6xl max-h-[92vh] rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden flex flex-col text-white" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 flex-shrink-0">
          <div><h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide">Admin Panel</h2><p className="text-[10px] text-gray-400">LUMIN SHOP</p></div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-1 px-3 py-2 border-b border-white/10 flex-shrink-0">
          {[{ key: 'config' as const, label: 'Config', icon: Settings }, { key: 'products' as const, label: 'Productos', icon: Package }, { key: 'orders' as const, label: 'Pedidos', icon: ShoppingCart }].map(t => (
            <button key={t.key} onClick={() => { setMainTab(t.key); setEditingProduct(null); setIsNewProduct(false); }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all ${mainTab === t.key ? 'bg-[#D2E8A3] text-[#0A0A0A]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              <t.icon className="w-3.5 h-3.5" /><span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* ===== CONFIG ===== */}
          {mainTab === 'config' && (
            <div className="flex flex-col h-full">
              <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b border-white/10 flex-shrink-0">
                {cfgSections.map(s => (
                  <button key={s.key} onClick={() => setCfgSection(s.key)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${cfgSection === s.key ? 'bg-[#D2E8A3]/20 text-[#D2E8A3] border border-[#D2E8A3]/40' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {configRows.filter(r => r.seccion === cfgSection).map(row => {
                      const changed = cfgEdit[row.id] !== cfgOriginal[row.id];
                      return (
                        <div key={row.id} className={`space-y-1 p-3 rounded-xl border transition-all ${changed ? 'border-[#D2E8A3]/50 bg-[#D2E8A3]/5' : 'border-white/5 bg-white/[0.02]'}`}>
                          <label className="flex items-center gap-2 text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                            <span>{row.clave}</span>
                            <span className="text-[9px] font-mono text-gray-500">({row.id})</span>
                            {changed && <span className="text-[#D2E8A3] text-[9px]">● MODIFICADO</span>}
                          </label>
                          {(row.id.includes('media')) && (
                            <div className="flex items-center gap-2 mb-1">
                              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${uploading && uploadTarget === row.id ? 'bg-yellow-500/20 text-yellow-400' : 'bg-[#D2E8A3]/10 text-[#D2E8A3] hover:bg-[#D2E8A3]/20'}`}>
                                <Upload className="w-3 h-3" />{uploading && uploadTarget === row.id ? 'Subiendo...' : 'Subir archivo'}
                                <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={e => handleFileUpload(e, row.id)} disabled={uploading} />
                              </label>
                              <span className="text-[10px] text-gray-500">o URL:</span>
                            </div>
                          )}
                          <input type="text" value={cfgEdit[row.id] ?? ''} onChange={e => setCfgEdit(prev => ({ ...prev, [row.id]: e.target.value }))} className={inputCls} />
                          {cfgEdit[row.id] && row.id.includes('media') && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-h-48">
                              {/\.(mp4|webm)$/i.test(cfgEdit[row.id]) ? <video src={cfgEdit[row.id]} className="w-full h-48 object-cover" autoPlay muted loop playsInline /> : <img src={cfgEdit[row.id]} className="w-full h-48 object-cover" alt="" />}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-4">
                    {cfgSection === 'hero' && <PreviewBanner />}
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Valores actuales</p>
                      <div className="space-y-1.5">
                        {configRows.filter(r => r.seccion === cfgSection).map(r => (
                          <div key={r.id} className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 w-28 truncate flex-shrink-0">{r.clave}:</span>
                            <span className={`text-[11px] truncate ${cfgEdit[r.id] !== cfgOriginal[r.id] ? 'text-[#D2E8A3] font-bold' : 'text-gray-300'}`}>{cfgEdit[r.id] || '(vacío)'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {cfgSaved && <span className="text-xs text-green-400 font-bold">✓ Guardado</span>}
                  {cfgChanged > 0 && <span className="text-xs text-[#D2E8A3] font-bold">{cfgChanged} cambio{cfgChanged > 1 ? 's' : ''}</span>}
                </div>
                <button onClick={handleCfgSave} disabled={cfgChanged === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${cfgChanged > 0 ? 'bg-[#D2E8A3] text-[#0A0A0A] hover:bg-[#c2e088] shadow-lg' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}>
                  <Save className="w-4 h-4" /> Guardar{cfgChanged > 0 ? ` (${cfgChanged})` : ''}
                </button>
              </div>
            </div>
          )}

          {/* ===== PRODUCTS ===== */}
          {mainTab === 'products' && (
            <div className="flex flex-col h-full">
              {editingProduct ? (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  <button onClick={() => { setEditingProduct(null); setIsNewProduct(false); }} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-2">
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-extrabold uppercase text-white">{isNewProduct ? 'Nuevo Producto' : 'Editar'}</h3>
                      <div className="space-y-3">
                        <div><label className={labelCls}>ID</label><input value={editingProduct.id} onChange={e => setEditingProduct(p => p ? { ...p, id: e.target.value } : p)} disabled={!isNewProduct} className={`${inputCls} font-mono disabled:opacity-40`} /></div>
                        <div><label className={labelCls}>Nombre *</label><input value={editingProduct.nombre} onChange={e => setEditingProduct(p => p ? { ...p, nombre: e.target.value } : p)} placeholder="Nombre del producto..." className={inputCls} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Categoría</label>
                            <select value={editingProduct.categoria_id} onChange={e => setEditingProduct(p => p ? { ...p, categoria_id: e.target.value } : p)} className={inputCls}>
                              <option value="streetwear">Polos Sublimados</option>
                              <option value="cups">Vasos/Tazas</option>
                              <option value="drops">Placas de Aluminio</option>
                            </select>
                          </div>
                          <div><label className={labelCls}>Etiqueta</label><input value={editingProduct.etiqueta || ''} onChange={e => setEditingProduct(p => p ? { ...p, etiqueta: e.target.value } : p)} placeholder="🔥 BESTSELLER" className={inputCls} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={labelCls}>Precio (S/) *</label><input type="number" step="0.01" min="0" value={editingProduct.precio} onChange={e => setEditingProduct(p => p ? { ...p, precio: parseFloat(e.target.value) || 0 } : p)} className={inputCls} /></div>
                          <div><label className={labelCls}>Precio original (S/)</label><input type="number" step="0.01" min="0" value={editingProduct.precio_original ?? ''} onChange={e => setEditingProduct(p => p ? { ...p, precio_original: e.target.value ? parseFloat(e.target.value) : null } : p)} placeholder="Opcional" className={inputCls} /></div>
                        </div>
                        <div><label className={labelCls}>Técnica</label><input value={editingProduct.tecnica || ''} onChange={e => setEditingProduct(p => p ? { ...p, tecnica: e.target.value } : p)} placeholder="Sublimación Premium 200°C" className={inputCls} /></div>
                        <div><label className={labelCls}>Tiempo producción</label><input value={editingProduct.tiempo_produccion || ''} onChange={e => setEditingProduct(p => p ? { ...p, tiempo_produccion: e.target.value } : p)} placeholder="⚡ 24-48 hrs" className={inputCls} /></div>
                        <div><label className={labelCls}>Descripción</label><textarea rows={3} value={editingProduct.descripcion || ''} onChange={e => setEditingProduct(p => p ? { ...p, descripcion: e.target.value } : p)} placeholder="Descripción del producto..." className={`${inputCls} resize-none`} /></div>
                        <div>
                          <label className={labelCls}>Imagen principal</label>
                          <input value={editingProduct.imagen || ''} onChange={e => setEditingProduct(p => p ? { ...p, imagen: e.target.value } : p)} placeholder="https://ejemplo.com/imagen.jpg" className={`${inputCls} mb-2`} />
                          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#D2E8A3]/10 text-[#D2E8A3] text-xs font-bold cursor-pointer hover:bg-[#D2E8A3]/20 w-fit">
                            <Upload className="w-3.5 h-3.5" />{uploading ? 'Subiendo...' : 'Subir desde archivos'}
                            <input type="file" accept="image/*" className="hidden" onChange={handleProdImageUpload} disabled={uploading} />
                          </label>
                        </div>
                        <div className="flex items-center gap-6 pt-2">
                          {[{ key: 'activo', label: 'Activo' }, { key: 'destacado', label: 'Destacado' }, { key: 'personalizable', label: 'Personalizable' }].map(cb => (
                            <label key={cb.key} className="flex items-center gap-2 cursor-pointer group">
                              <div className="relative">
                                <input type="checkbox" checked={(editingProduct as any)[cb.key]} onChange={e => setEditingProduct(p => p ? { ...p, [cb.key]: e.target.checked } : p)} className="sr-only peer" />
                                <div className="w-5 h-5 rounded-md border-2 border-gray-600 peer-checked:border-[#D2E8A3] peer-checked:bg-[#D2E8A3] transition-all flex items-center justify-center">
                                  {(editingProduct as any)[cb.key] && <Check className="w-3 h-3 text-[#0A0A0A] stroke-[3]" />}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{cb.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Preview */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-extrabold uppercase text-[#D2E8A3]">Vista Previa</h3>
                      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#161814]">
                        <div className="aspect-square overflow-hidden bg-black/40">{editingProduct.imagen ? <img src={editingProduct.imagen} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin imagen</div>}</div>
                        <div className="p-4 space-y-2">
                          {editingProduct.etiqueta && <span className="inline-block px-2 py-0.5 rounded bg-black/80 text-[#D2E8A3] text-[10px] font-bold">{editingProduct.etiqueta}</span>}
                          <p className="text-white font-extrabold text-sm">{editingProduct.nombre || 'Nombre del producto'}</p>
                          <p className="text-gray-400 text-xs line-clamp-2">{editingProduct.descripcion || 'Descripción...'}</p>
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
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    {!isNewProduct ? <button onClick={() => handleProdDelete(editingProduct.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /> Eliminar</button> : <div />}
                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => { setEditingProduct(null); setIsNewProduct(false); }} className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-bold hover:bg-white/10 hover:text-white">Cancelar</button>
                      <button onClick={handleProdSave} disabled={prodSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-sm hover:bg-[#c2e088] shadow-lg disabled:opacity-50">
                        {prodSaving ? 'Guardando...' : <><Check className="w-4 h-4" /> Guardar</>}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase text-white">{products.length} Productos</h3>
                    <button onClick={startNewProduct} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs hover:bg-[#c2e088] shadow-lg"><Plus className="w-4 h-4" /> Nuevo</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {products.map(p => (
                      <div key={p.id} onClick={() => { setEditingProduct(p); setIsNewProduct(false); }}
                        className="rounded-2xl overflow-hidden border border-white/10 bg-[#161814] cursor-pointer transition-all hover:border-[#D2E8A3]/40 hover:bg-[#1a1d1a]">
                        <div className="aspect-video overflow-hidden bg-black/20">{p.imagen ? <img src={p.imagen} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin imagen</div>}</div>
                        <div className="p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            {!p.activo && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">INACTIVO</span>}
                            {p.destacado && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D2E8A3]/20 text-[#D2E8A3] font-bold">★ DESTACADO</span>}
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

          {/* ===== ORDERS ===== */}
          {mainTab === 'orders' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {orders.length === 0 ? <p className="text-sm text-gray-400 text-center py-10">No hay pedidos aún</p> : orders.map(order => (
                <div key={order.id} className="p-4 rounded-xl border border-white/10 bg-[#161814]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-gray-500">{order.id.slice(0, 12)}...</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.estado === 'entregado' ? 'bg-green-500/20 text-green-400' : order.estado === 'enviado' ? 'bg-blue-500/20 text-blue-400' : order.estado === 'produccion' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-400'}`}>{order.estado || 'pendiente'}</span>
                      </div>
                      <p className="text-xs text-gray-400">{order.cliente_nombre || 'Sin nombre'} — {order.cliente_telefono || 'Sin tel'}</p>
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
          )}
        </div>
      </div>
    </div>
  );
};
