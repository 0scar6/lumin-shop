import React, { useMemo, useState } from 'react';
import {
  Package, Settings, Plus, Trash2, ArrowLeft, Check, Shirt, Coffee, Save, Ruler,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Field, TextInput, TextArea, MediaUpload, Section, PreviewBox } from './AdminShared';
import { AdminCategories } from './AdminCategories';
import type {
  CategoryAttributeDef,
  CategoryUI,
  MeasureValue,
  ProductAttributes,
} from '../../types';
import { measureLabel, sortAttributeValues } from '../../lib/catalog';

export interface ProductoRow { id: string; nombre: string; categoria_id: string; precio: number; precio_original: number | null; tecnica: string; tiempo_produccion: string; imagen: string; galeria: any; descripcion: string; etiqueta: string; opciones_ropa: any; opciones_vaso: any; atributos?: ProductAttributes; personalizable: boolean; activo: boolean; destacado: boolean; agotado: boolean; }

interface AdminProductsProps {
  cfgEdit: Record<string, string>;
  setCfg: (key: string, value: string) => void;
  handleCfgSave: () => void;
  cfgSaved: boolean;
  products: ProductoRow[];
  editingProduct: ProductoRow | null;
  setEditingProduct: React.Dispatch<React.SetStateAction<ProductoRow | null>>;
  isNewProduct: boolean;
  startNewProduct: () => void;
  handleProdSave: () => void;
  handleProdDelete: (id: string) => void;
  handleProdImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prodSaving: boolean;
  uploading: boolean;
  handleSyncGalleries: () => void;
  categories: CategoryUI[];
  onSaveCategories: (next: CategoryUI[]) => Promise<void>;
  categoriesSaving: boolean;
}

const OptionValueEditor: React.FC<{
  def: CategoryAttributeDef;
  values: string[];
  onChange: (values: string[]) => void;
}> = ({ def, values, onChange }) => {
  const [newValue, setNewValue] = useState('');
  const suggestions = sortAttributeValues([...(def.valores || []), ...values]);

  const add = () => {
    const value = newValue.trim();
    if (!value) return;
    if (!values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      onChange([...values, value]);
    }
    setNewValue('');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((value) => {
          const active = values.some((v) => v.toLowerCase() === value.toLowerCase());
          return (
            <button
              key={value}
              type="button"
              onClick={() =>
                onChange(
                  active
                    ? values.filter((v) => v.toLowerCase() !== value.toLowerCase())
                    : [...values, value],
                )
              }
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                active
                  ? 'bg-[var(--accent)] text-[#0A0A0A] border-[var(--accent)]'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:border-[var(--accent)]/40'
              }`}
            >
              {value}
            </button>
          );
        })}
        {suggestions.length === 0 && (
          <span className="text-[10px] text-gray-500">Sin valores sugeridos. Agrega uno abajo.</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Añadir otro valor (ej. 24oz, Unitalla…)"
          className="flex-1 px-3 py-2 rounded-lg border text-xs text-white bg-[#161814] border-white/10 placeholder-gray-500 focus:outline-none focus:border-[var(--accent)]/50"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent)]/20"
        >
          Añadir
        </button>
      </div>
    </div>
  );
};

export const AdminProducts = ({
  cfgEdit, setCfg, handleCfgSave, cfgSaved, products, editingProduct, setEditingProduct, isNewProduct,
  startNewProduct, handleProdSave, handleProdDelete, handleProdImageUpload,
  prodSaving, uploading, handleSyncGalleries, categories, onSaveCategories, categoriesSaving,
}: AdminProductsProps) => {
  const _labelCls = 'block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5';
  const _inputCls = 'w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#1a1d1a] border-white/10 placeholder-gray-500 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all';

  const groups = useMemo(
    () =>
      categories
        .filter((cat) => cat.id !== 'all')
        .map((cat) => ({
          ...cat,
          items: products.filter((p: ProductoRow) => p.categoria_id === cat.id),
        })),
    [categories, products],
  );

  const currentCategory = editingProduct
    ? categories.find((cat) => cat.id === editingProduct.categoria_id)
    : undefined;
  const currentKind =
    currentCategory?.tipo ||
    (editingProduct?.categoria_id === 'streetwear' ? 'ropa' : editingProduct?.categoria_id === 'cups' ? 'vaso' : 'otro');
  const currentAttrDefs = currentCategory?.atributos || [];

  const setAttr = (key: string, value: string[] | MeasureValue[]) =>
    setEditingProduct((p: any) =>
      p ? { ...p, atributos: { ...(p.atributos || {}), [key]: value } } : p,
    );

  if (editingProduct) {
    return (
      <div className="p-5 sm:p-8 max-w-[1200px] mx-auto space-y-4">
        <button onClick={() => setEditingProduct(null)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title={isNewProduct ? 'Nuevo Producto' : 'Editar Producto'} icon={<Package className="w-3.5 h-3.5 text-[var(--accent)]" />}>
            <Field label="ID"><TextInput value={editingProduct.id} onChange={v => setEditingProduct((p: any) => p ? { ...p, id: v } : p)} /></Field>
            <Field label="Nombre *"><TextInput value={editingProduct.nombre} onChange={v => setEditingProduct((p: any) => p ? { ...p, nombre: v } : p)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoría">
                <select value={editingProduct.categoria_id} onChange={e => {
                  const cat = categories.find(c => c.id === e.target.value);
                  const kind = cat?.tipo || 'otro';
                  setEditingProduct((p: any) => {
                    if (!p) return p;
                    const updated: any = { ...p, categoria_id: e.target.value, atributos: {} };
                    if (kind === 'ropa') {
                      if (!p.opciones_ropa) {
                        updated.opciones_ropa = { sizes: ['S', 'M', 'L', 'XL'], fits: ['Oversized Streetwear'], colors: [{ name: 'Negro', hex: '#0A0A0A' }] };
                      }
                    } else if (!p.opciones_vaso) {
                      updated.opciones_vaso = { types: [], finishes: [] };
                    }
                    return updated;
                  });
                }}
                  className={_inputCls}>
                  {categories.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.label}{c.activo === false ? ' (oculta)' : ''}</option>
                  ))}
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
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-all cursor-pointer">
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
              {[{ key: 'activo', label: 'Activo' }, { key: 'destacado', label: 'Destacado' }, { key: 'personalizable', label: 'Personalizable' }, { key: 'agotado', label: 'Agotado / Drop Finalizado' }].map((cb: any) => (
                <label key={cb.key} className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" checked={(editingProduct as any)[cb.key]} onChange={e => setEditingProduct((p: any) => p ? { ...p, [cb.key]: e.target.checked } : p)} className="sr-only peer" />
                    <div className="w-5 h-5 rounded-lg border-2 border-gray-600 peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] transition-all flex items-center justify-center">
                      {(editingProduct as any)[cb.key] && <Check className="w-3 h-3 text-[#0A0A0A] stroke-[3]" />}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{cb.label}</span>
                </label>
              ))}
            </div>
            {/* ── FILTROS RÁPIDOS DE LA CATEGORÍA (tallas / onzas / medidas) ── */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              <p className="text-[11px] font-extrabold text-[var(--accent)] uppercase tracking-wider flex items-center gap-2">
                <Ruler className="w-3.5 h-3.5" /> Filtros de la categoría · {currentCategory?.label || editingProduct.categoria_id}
              </p>
              <p className="text-[10px] text-gray-500">
                Estos valores alimentan los chips del catálogo (talla, onzas, alto × ancho…). Se guardan en el producto.
              </p>

              {currentAttrDefs.length === 0 && (
                <p className="text-[10px] text-gray-500">
                  Esta categoría no tiene filtros. Agrégalos en “Categorías y filtros” (arriba en el catálogo).
                </p>
              )}

              {currentAttrDefs.map((def) => {
                const raw = editingProduct.atributos?.[def.key];

                if (def.tipo === 'medida') {
                  const measures = Array.isArray(raw)
                    ? (raw as MeasureValue[]).filter((m) => m && typeof m === 'object' && 'alto' in m)
                    : [];
                  const unidad = def.unidad || 'cm';
                  return (
                    <div key={def.key}>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {def.label} <span className="text-gray-500 normal-case tracking-normal">· alto × ancho ({unidad})</span>
                      </label>
                      <div className="space-y-1.5">
                        {measures.map((m, i) => (
                          <div key={i} className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-500">Alto</span>
                              <div className="w-20">
                                <TextInput
                                  type="number"
                                  value={String(m.alto ?? '')}
                                  onChange={(v) => {
                                    const next = [...measures];
                                    next[i] = { ...next[i], alto: parseFloat(v) || 0 };
                                    setAttr(def.key, next);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-500">Ancho</span>
                              <div className="w-20">
                                <TextInput
                                  type="number"
                                  value={String(m.ancho ?? '')}
                                  onChange={(v) => {
                                    const next = [...measures];
                                    next[i] = { ...next[i], ancho: parseFloat(v) || 0 };
                                    setAttr(def.key, next);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-500">+S/</span>
                              <div className="w-20">
                                <TextInput
                                  type="number"
                                  value={String(m.extraPrice || 0)}
                                  onChange={(v) => {
                                    const next = [...measures];
                                    next[i] = { ...next[i], extraPrice: parseFloat(v) || 0 };
                                    setAttr(def.key, next);
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-[10px] text-[var(--accent)]">
                              {measureLabel(m, unidad)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAttr(def.key, measures.filter((_, j) => j !== i))}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setAttr(def.key, [...measures, { alto: 20, ancho: 30, extraPrice: 0 }])}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent)]/20 transition-all"
                        >
                          <Plus className="w-3 h-3" /> Agregar medida
                        </button>
                      </div>
                    </div>
                  );
                }

                const values = Array.isArray(raw)
                  ? (raw as unknown[]).filter((v): v is string => typeof v === 'string')
                  : [];
                return (
                  <div key={def.key}>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      {def.label}
                    </label>
                    <OptionValueEditor
                      def={def}
                      values={values}
                      onChange={(next) => setAttr(def.key, next)}
                    />
                  </div>
                );
              })}
            </div>

            {/* ── OPCIONES DE PRODUCTO ── */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              <p className="text-[11px] font-extrabold text-[var(--accent)] uppercase tracking-wider flex items-center gap-2"><Shirt className="w-3.5 h-3.5" /> Opciones de Ropa (Tallas con precio extra / Cortes / Colores)</p>
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
                  }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent)]/20 transition-all"><Plus className="w-3 h-3" /> Agregar talla</button>
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
                  }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent)]/20 transition-all"><Plus className="w-3 h-3" /> Agregar corte</button>
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
                  }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent)]/20 transition-all"><Plus className="w-3 h-3" /> Agregar color</button>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-4">
              <p className="text-[11px] font-extrabold text-[var(--accent)] uppercase tracking-wider flex items-center gap-2"><Coffee className="w-3.5 h-3.5" /> Opciones de Vasos / Tazas / Placas</p>
              {currentKind === 'placa' ? (
                <p className="text-[10px] text-gray-500">
                  Las medidas de esta placa se editan arriba, en “Filtros de la categoría · alto × ancho”.
                  Desde ahí se generan las opciones que ve el cliente.
                </p>
              ) : (
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tipos</label>
                <div className="space-y-1.5">
                  {(editingProduct.opciones_vaso?.types || []).map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <TextInput value={t.name} onChange={v => {
                        const types = [...(editingProduct.opciones_vaso?.types || [])];
                        types[i] = { ...types[i], name: v };
                        setEditingProduct((p: any) => p ? { ...p, opciones_vaso: { ...(p.opciones_vaso || {}), types } } : p);
                      }} placeholder="Ej: Vaso Frosted 16oz" />
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
                  }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent)]/20 transition-all"><Plus className="w-3 h-3" /> Agregar tipo</button>
                </div>
              </div>
              )}
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
                  }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent)]/20 transition-all"><Plus className="w-3 h-3" /> Agregar acabado</button>
                </div>
              </div>
            </div>

          </Section>
          <div className="space-y-4">
            <PreviewBox title="Vista Previa del Producto">
              <div className="rounded-xl overflow-hidden bg-[#161814]">
                <div className="aspect-square overflow-hidden bg-black/40">{editingProduct.imagen ? <img src={editingProduct.imagen} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin imagen</div>}</div>
                <div className="p-4 space-y-2">
                  {editingProduct.etiqueta && <span className="inline-block px-2 py-0.5 rounded bg-black/80 text-[var(--accent)] text-[10px] font-bold">{editingProduct.etiqueta}</span>}
                  <p className="text-white font-extrabold text-sm">{editingProduct.nombre || 'Nombre del producto'}</p>
                  <p className="text-gray-400 text-xs line-clamp-2">{editingProduct.descripcion || 'Descripción del producto...'}</p>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-[var(--accent)] font-black text-lg">S/ {editingProduct.precio.toFixed(2)}</span>
                    {editingProduct.precio_original && <span className="text-gray-500 text-xs line-through">S/ {editingProduct.precio_original.toFixed(2)}</span>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    {editingProduct.agotado && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">AGOTADO</span>}
                    {!editingProduct.activo && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">INACTIVO</span>}
                    {editingProduct.destacado && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)] font-bold">DESTACADO</span>}
                  </div>
                </div>
              </div>
            </PreviewBox>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              {!isNewProduct ? <button onClick={() => handleProdDelete(editingProduct.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"><Trash2 className="w-3.5 h-3.5" /> Eliminar</button> : <div />}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setEditingProduct(null)} className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-400 text-xs font-bold hover:bg-white/10 transition-all">Cancelar</button>
                <button onClick={handleProdSave} disabled={prodSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[#0A0A0A] font-extrabold text-sm hover:bg-[var(--accent-hover)] shadow-lg shadow-[var(--accent)]/20 disabled:opacity-50 transition-all">
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
      className="rounded-2xl overflow-hidden border border-white/5 bg-[#111311] cursor-pointer transition-all hover:border-[var(--accent)]/30 hover:bg-[#161814] group">
      <div className="aspect-video overflow-hidden bg-black/20">{p.imagen ? <img src={p.imagen} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin imagen</div>}</div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          {p.agotado && <span className="text-[8px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">AGOTADO</span>}
          {!p.activo && <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">OFF</span>}
          {p.destacado && <span className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)] font-bold">★ DESTACADO</span>}
        </div>
        <p className="text-white text-xs font-extrabold truncate">{p.nombre}</p>
        <div className="flex items-baseline justify-between">
          <p className="text-[var(--accent)] text-sm font-black">S/ {p.precio.toFixed(2)}</p>
          {p.precio_original && <p className="text-gray-500 text-[10px] line-through">S/ {p.precio_original.toFixed(2)}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-5 sm:p-8 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center"><Package className="w-4 h-4 text-[var(--accent)]" /></div>
          <div>
            <h3 className="text-sm font-extrabold uppercase text-white">{products.length} Productos</h3>
            <p className="text-[9px] text-gray-500">Gestiona tu catálogo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSyncGalleries} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-gray-400 text-[10px] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all border border-white/5" title="Sincronizar galerías de productos existentes">🔄 Sincronizar</button>
          <button onClick={startNewProduct} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[#0A0A0A] font-extrabold text-xs hover:bg-[var(--accent-hover)] shadow-lg shadow-[var(--accent)]/20 transition-all"><Plus className="w-4 h-4" /> Nuevo</button>
        </div>
      </div>

      <Section title="Texto del Catálogo" icon={<Settings className="w-3.5 h-3.5 text-[var(--accent)]" />}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Título"><TextInput value={cfgEdit.catalog_title || ''} onChange={(v: string) => setCfg('catalog_title', v)} /></Field>
          <Field label="Subtítulo"><TextInput value={cfgEdit.catalog_subtitle || ''} onChange={(v: string) => setCfg('catalog_subtitle', v)} /></Field>
        </div>
        <Field label="Texto vacío"><TextInput value={cfgEdit.catalog_empty || ''} onChange={(v: string) => setCfg('catalog_empty', v)} /></Field>
        <div className="flex justify-end pt-2">
          <button onClick={handleCfgSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-[#0A0A0A] font-extrabold text-xs hover:bg-[var(--accent-hover)] shadow-lg shadow-[var(--accent)]/20 transition-all">
            {cfgSaved ? <><Check className="w-4 h-4" /> Guardado</> : <><Save className="w-4 h-4" /> Guardar Texto</>}
          </button>
        </div>
      </Section>

      <AdminCategories
        categories={categories}
        onSave={onSaveCategories}
        saving={categoriesSaving}
      />

      {(() => {
        const known = new Set(groups.map((group) => group.id));
        const orphans = products.filter((p) => !known.has(p.categoria_id));
        const allGroups = orphans.length > 0
          ? [...groups, { id: '__orphans', label: 'Sin categoría', iconName: 'Grid', items: orphans } as any]
          : groups;
        const emojiFor = (iconName: string) =>
          iconName === 'Shirt' ? '👕' : iconName === 'Coffee' ? '☕' : iconName === 'Flame' ? '🖼️' : iconName === 'Package' ? '📦' : '🏷️';
        return allGroups.map((group) => (
          <Section
            key={group.id}
            title={`${emojiFor(group.iconName)} ${group.label}`}
            icon={<Package className="w-3.5 h-3.5 text-[var(--accent)]" />}
            badge={`${group.items.length} productos`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.items.map((p: ProductoRow) => <ProductCard key={p.id} p={p} />)}
              {group.items.length === 0 && <p className="text-xs text-gray-500 col-span-full text-center py-8">Sin productos en esta categoría</p>}
            </div>
          </Section>
        ));
      })()}
    </div>
  );
};
AdminProducts.displayName = 'AdminProducts';
