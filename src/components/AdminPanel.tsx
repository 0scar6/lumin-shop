import React, { useState, useEffect } from 'react';
import { X, Upload, Image, Video, Save, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cfg } from '../lib/config';

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

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, themeMode = 'dark' }) => {
  const isLight = themeMode === 'light';
  const [configRows, setConfigRows] = useState<ConfigRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<string>('');
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    if (!isOpen || !supabase) return;
    loadConfig();
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const { data } = await supabase!.from('configuracion').select('*');
      if (data) {
        setConfigRows(data);
        const vals: Record<string, string> = {};
        data.forEach((r: ConfigRow) => { vals[r.id] = r.valor; });
        setEditValues(vals);
      }
    } catch {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, configKey: string) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setUploading(true);
    setUploadTarget(configKey);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `hero_${configKey}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('media')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
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
        await supabase.from('configuracion').upsert({
          id: row.id,
          seccion: row.seccion,
          clave: row.clave,
          valor: newVal,
        }, { onConflict: 'id' });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
    }
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] rounded-2xl border overflow-hidden flex flex-col ${
          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-extrabold uppercase tracking-wide">Admin Panel</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Configuración general de LUMIN SHOP</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 px-4 py-2 overflow-x-auto border-b border-white/10">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeSection === s.key
                  ? 'bg-[#D2E8A3] text-[#0A0A0A]'
                  : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredRows.map(row => (
            <div key={row.id} className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span>{row.clave}</span>
                <span className="text-[10px] font-mono text-gray-600">({row.id})</span>
              </label>

              {/* Media upload for hero URLs */}
              {(row.id === 'hero_media_1_url' || row.id === 'hero_media_2_url') && (
                <div className="flex items-center gap-2">
                  <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    uploading && uploadTarget === row.id
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-[#D2E8A3]/10 text-[#D2E8A3] hover:bg-[#D2E8A3]/20'
                  }`}>
                    <Upload className="w-3.5 h-3.5" />
                    {uploading && uploadTarget === row.id ? 'Subiendo...' : 'Subir archivo'}
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
                      <ExternalLink className="w-3 h-3" /> Ver actual
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

              {/* Preview for media URLs */}
              {editValues[row.id] && (row.id.includes('media')) && (
                <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-h-48">
                  {/\.(mp4|webm)$/i.test(editValues[row.id]) ? (
                    <video src={editValues[row.id]} className="w-full h-48 object-cover" autoPlay muted loop playsInline />
                  ) : (
                    <img src={editValues[row.id]} className="w-full h-48 object-cover" alt="Preview" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <span className={`text-xs font-bold ${saved ? 'text-green-400' : 'text-transparent'}`}>
            ✓ Guardado
          </span>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-sm hover:bg-[#c2e088] transition-all shadow-lg"
          >
            <Save className="w-4 h-4" />
            Guardar Todos
          </button>
        </div>
      </div>
    </div>
  );
};
