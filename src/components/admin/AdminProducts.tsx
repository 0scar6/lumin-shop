import React, { useMemo } from 'react';
import {
  Package, Settings, Plus, Trash2, ArrowLeft, Check, Shirt, Coffee, Save,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Field, TextInput, TextArea, MediaUpload, Section, PreviewBox } from './AdminShared';

export interface ProductoRow { id: string; nombre: string; categoria_id: string; precio: number; precio_original: number | null; tecnica: string; tiempo_produccion: string; imagen: string; galeria: any; descripcion: string; etiqueta: string; opciones_ropa: any; opciones_vaso: any; personalizable: boolean; activo: boolean; destacado: boolean; }

interface AdminProductsProps {
  cfgEdit: Record<string, string>;
  setCfg: (key: string, value: string) => void;
  handleCfgSave: () => void;
  cfgSaved: boolean;
  products: ProductoRow[];
  editingProduct: ProductoRow | null;
  setEditingProduct: (p: ProductoRow | null) => void;
  isNewProduct: boolean;
  startNewProduct: () => void;
  handleProdSave: () => void;
  handleProdDelete: (id: string) => void;
  handleProdImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prodSaving: boolean;
  uploading: boolean;
  handleSyncGalleries: () => void;
}

export const AdminProducts = ({
  cfgEdit, setCfg, handleCfgSave, cfgSaved, products, editingProduct, setEditingProduct, isNewProduct,
  startNewProduct, handleProdSave, handleProdDelete, handleProdImageUpload,
  prodSaving, uploading, handleSyncGalleries,
}: AdminProductsProps) => {
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
            {/* ── OPCIONES DE PRODUCTO ── */}
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#D2E8A3]/10 flex items-center justify-center"><Package className="w-4 h-4 text-[#D2E8A3]" /></div>
          <div>
            <h3 className="text-sm font-extrabold uppercase text-white">{products.length} Productos</h3>
            <p className="text-[9px] text-gray-500">Gestiona tu catálogo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSyncGalleries} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-gray-400 text-[10px] hover:text-[#D2E8A3] hover:bg-[#D2E8A3]/10 transition-all border border-white/5" title="Sincronizar galerías de productos existentes">🔄 Sincronizar</button>
          <button onClick={startNewProduct} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs hover:bg-[#c2e088] shadow-lg shadow-[#D2E8A3]/20 transition-all"><Plus className="w-4 h-4" /> Nuevo</button>
        </div>
      </div>

      <Section title="Texto del Catálogo" icon={<Settings className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Título"><TextInput value={cfgEdit.catalog_title || ''} onChange={(v: string) => setCfg('catalog_title', v)} /></Field>
          <Field label="Subtítulo"><TextInput value={cfgEdit.catalog_subtitle || ''} onChange={(v: string) => setCfg('catalog_subtitle', v)} /></Field>
        </div>
        <Field label="Texto vacío"><TextInput value={cfgEdit.catalog_empty || ''} onChange={(v: string) => setCfg('catalog_empty', v)} /></Field>
        <div className="flex justify-end pt-2">
          <button onClick={handleCfgSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D2E8A3] text-[#0A0A0A] font-extrabold text-xs hover:bg-[#c2e088] shadow-lg shadow-[#D2E8A3]/20 transition-all">
            {cfgSaved ? <><Check className="w-4 h-4" /> Guardado</> : <><Save className="w-4 h-4" /> Guardar Texto</>}
          </button>
        </div>
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
AdminProducts.displayName = 'AdminProducts';
