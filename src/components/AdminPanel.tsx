import React, { useState, useEffect } from 'react';
import { X, Upload, Save, ExternalLink, Lock, Eye, EyeOff, Package, ShoppingBag, FileText, Settings, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ADMIN_PASSWORD = 'Ratitaxd12';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: 'dark' | 'light' | 'amoled';
}

interface ConfigRow {
  id: string;
  seccion: string;
  clave: string;
  valor: string;
}

interface PedidoRow {
  id: string;
  usuario_id: string;
  items: string;
  total: number;
  estado: string;
  created_at: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, themeMode = 'dark' }) => {
  const isLight = themeMode === 'light';
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [configRows, setConfigRows] = useState<ConfigRow[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [activeTab, setActiveTab] = useState<'config' | 'orders' | 'storage'>('config');

  const [orders, setOrders] = useState<PedidoRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAuthenticated(false);
      setPasswordInput('');
      setPasswordError(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!authenticated || !supabase) return;
    loadConfig();
    loadOrders();
  }, [authenticated]);

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const loadConfig = async () => {
    try {
      const { data } = await supabase!.from('configuracion').select('*');
      if (data) {
        setConfigRows(data);
        const vals: Record<string, string> = {};
        data.forEach((r: ConfigRow) => { vals[r.id] = r.valor; });
        setEditValues(vals);
        setOriginalValues(vals);
      }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, configKey: string) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setUploading(true);
    setUploadTarget(configKey);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `hero_${configKey}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);
      if (urlData?.publicUrl) {
        setEditValues(prev => ({ ...prev, [configKey]: urlData.publicUrl }));
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
    setUploading(false);
    setUploadTarget('');
  };

  const handleSaveAll = async () => {
    if (!supabase) return;
    try {
      for (const row of configRows) {
        const newVal = editValues[row.id] ?? row.valor;
        if (newVal !== originalValues[row.id]) {
          await supabase.from('configuracion').upsert({
            id: row.id, seccion: row.seccion, clave: row.clave, valor: newVal,
          }, { onConflict: 'id' });
        }
      }
      setOriginalValues({ ...editValues });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!supabase) return;
    await supabase.from('pedidos').update({ estado: newStatus }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: newStatus } : o));
  };

  const getChangedCount = () => {
    return configRows.filter(r => editValues[r.id] !== originalValues[r.id]).length;
  };

  const sections = [
    { key: 'hero', label: 'Hero / Media' },
    { key: 'marca', label: 'Marca' },
    { key: 'secciones', label: 'Secciones' },
    { key: 'footer', label: 'Footer' },
    { key: 'badges', label: 'Badges' },
    { key: 'carrito', label: 'Carrito' },
    { key: 'perfil', label: 'Perfil' },
  ];

  const filteredRows = configRows.filter(r => r.seccion === activeSection);

  if (!isOpen) return null;

  // PASSWORD SCREEN
  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
        <div
          className={`relative w-full max-w-sm rounded-2xl border p-8 space-y-6 ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D2E8A3]/10 border border-[#D2E8A3]/30 flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#D2E8A3]" />
            </div>
            <h2 className="text-lg font-extrabold uppercase tracking-wide">Admin Access</h2>
            <p className="text-xs text-gray-400">Ingresa la contraseña para continuar</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Contraseña"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-mono transition-colors ${
                  passwordError
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-lime-600'
                    : 'bg-white/5 border-white/10 text-white focus:border-[#D2E8A3]'
                } focus:outline-none`}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && <p className="text-xs text-red-400 text-center">Contraseña incorrecta</p>}
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-sm hover:bg-[#c2e088] transition-all shadow-lg"
            >
              ENTRAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN PANEL
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={`relative w-full max-w-5xl max-h-[90vh] rounded-2xl border overflow-hidden flex flex-col ${
          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-extrabold uppercase tracking-wide">Admin Panel</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">LUMIN SHOP — Gestión completa</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-1 px-4 py-2 border-b border-white/10">
          {[
            { key: 'config' as const, label: 'Configuración', icon: Settings },
            { key: 'orders' as const, label: 'Pedidos', icon: Package },
            { key: 'storage' as const, label: 'Storage / Media', icon: Image },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === t.key
                  ? 'bg-[#D2E8A3] text-[#0A0A0A]'
                  : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: CONFIG */}
        {activeTab === 'config' && (
          <>
            <div className="flex gap-1 px-4 py-2 overflow-x-auto border-b border-white/10">
              {sections.map(s => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                    activeSection === s.key
                      ? 'bg-[#D2E8A3]/20 text-[#D2E8A3] border border-[#D2E8A3]/40'
                      : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredRows.map(row => {
                const isChanged = editValues[row.id] !== originalValues[row.id];
                return (
                  <div key={row.id} className={`space-y-1.5 p-3 rounded-xl border transition-all ${
                    isChanged ? 'border-[#D2E8A3]/40 bg-[#D2E8A3]/5' : 'border-transparent'
                  }`}>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span>{row.clave}</span>
                      <span className="text-[10px] font-mono text-gray-600">({row.id})</span>
                      {isChanged && <span className="text-[10px] text-[#D2E8A3] font-bold">● modificado</span>}
                    </label>

                    {(row.id === 'hero_media_1_url' || row.id === 'hero_media_2_url') && (
                      <div className="flex items-center gap-2 mb-1">
                        <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          uploading && uploadTarget === row.id
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-[#D2E8A3]/10 text-[#D2E8A3] hover:bg-[#D2E8A3]/20'
                        }`}>
                          <Upload className="w-3.5 h-3.5" />
                          {uploading && uploadTarget === row.id ? 'Subiendo...' : 'Subir a Storage'}
                          <input
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, row.id)}
                            disabled={uploading}
                          />
                        </label>
                        {editValues[row.id] && (
                          <a href={editValues[row.id]} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-[#D2E8A3] flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Ver
                          </a>
                        )}
                      </div>
                    )}

                    <input
                      type="text"
                      value={editValues[row.id] ?? ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, [row.id]: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-xl border text-sm font-mono transition-colors ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-lime-600'
                          : 'bg-white/5 border-white/10 text-white focus:border-[#D2E8A3]'
                      } focus:outline-none`}
                    />

                    {editValues[row.id] && row.id.includes('media') && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-h-48">
                        {/\.(mp4|webm)$/i.test(editValues[row.id]) ? (
                          <video src={editValues[row.id]} className="w-full h-48 object-cover" autoPlay muted loop playsInline />
                        ) : (
                          <img src={editValues[row.id]} className="w-full h-48 object-cover" alt="Preview" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* TAB: ORDERS */}
        {activeTab === 'orders' && (
          <div className="flex-1 overflow-y-auto p-6">
            {ordersLoading ? (
              <p className="text-sm text-gray-400 text-center py-10">Cargando pedidos...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No hay pedidos aún</p>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className={`p-4 rounded-xl border ${
                    isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-[#D2E8A3] flex-shrink-0" />
                          <span className="text-xs font-mono text-gray-500 truncate">{order.id}</span>
                        </div>
                        <p className="text-xs text-gray-400">Usuario: {order.usuario_id || 'Anónimo'}</p>
                        <p className="text-xs text-gray-400">Fecha: {new Date(order.created_at).toLocaleString('es-PE')}</p>
                        <div className="text-xs text-gray-300 mt-1 whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                          {typeof order.items === 'string' ? order.items : JSON.stringify(order.items, null, 2)}
                        </div>
                      </div>
                      <div className="text-right space-y-2 flex-shrink-0">
                        <p className="text-sm font-extrabold text-[#D2E8A3]">S/ {order.total?.toFixed(2)}</p>
                        <select
                          value={order.estado || 'pendiente'}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${
                            order.estado === 'entregado' ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : order.estado === 'produccion' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-white/5 text-gray-400 border-white/10'
                          }`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="produccion">En Producción</option>
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
        )}

        {/* TAB: STORAGE */}
        {activeTab === 'storage' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className={`p-4 rounded-xl border ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'}`}>
              <h3 className="text-sm font-extrabold mb-2">Cómo usar Storage</h3>
              <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Ve a <strong className="text-white">Supabase Dashboard → Storage → media</strong></li>
                <li>Click <strong className="text-white">Upload files</strong> y sube tu video o imagen</li>
                <li>Copia la <strong className="text-white">URL pública</strong> del archivo</li>
                <li>Pégal en <strong className="text-[#D2E8A3]">Configuración → Hero / Media</strong></li>
                <li>Guarda los cambios y recarga la página</li>
              </ol>
            </div>

            <div className={`p-4 rounded-xl border ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'}`}>
              <h3 className="text-sm font-extrabold mb-2">Subir archivo rápido</h3>
              <p className="text-xs text-gray-400 mb-3">Sube directamente desde aquí y copia la URL generada:</p>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D2E8A3]/10 text-[#D2E8A3] text-xs font-bold cursor-pointer hover:bg-[#D2E8A3]/20 transition-all">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !supabase) return;
                      setUploading(true);
                      try {
                        const ext = file.name.split('.').pop() || 'jpg';
                        const fileName = `upload_${Date.now()}.${ext}`;
                        const { error } = await supabase.storage.from('media').upload(fileName, file, { cacheControl: '3600', upsert: false });
                        if (error) throw error;
                        const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);
                        if (urlData?.publicUrl) {
                          navigator.clipboard.writeText(urlData.publicUrl);
                          alert('URL copiada al portapapeles:\n' + urlData.publicUrl);
                        }
                      } catch (err) {
                        alert('Error al subir: ' + (err as Error).message);
                      }
                      setUploading(false);
                    }}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {activeTab === 'config' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold transition-all ${saved ? 'text-green-400' : 'text-transparent'}`}>
                ✓ Guardado
              </span>
              {getChangedCount() > 0 && (
                <span className="text-xs text-[#D2E8A3] font-bold">{getChangedCount()} cambios pendientes</span>
              )}
            </div>
            <button
              onClick={handleSaveAll}
              disabled={getChangedCount() === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shadow-lg ${
                getChangedCount() > 0
                  ? 'bg-[#D2E8A3] text-[#0A0A0A] hover:bg-[#c2e088]'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              Guardar ({getChangedCount()})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
