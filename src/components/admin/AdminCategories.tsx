import React, { useEffect, useMemo, useState } from 'react';
import { Layers, Plus, Save, Trash2 } from 'lucide-react';
import type { CategoryAttributeDef, CategoryKind, CategoryUI } from '../../types';
import { CATEGORY_KIND_LABEL } from '../../lib/catalog';
import { Field, Section, TextInput } from './AdminShared';

interface AdminCategoriesProps {
  categories: CategoryUI[];
  onSave: (next: CategoryUI[]) => Promise<void>;
  saving: boolean;
}

const KINDS: CategoryKind[] = ['ropa', 'vaso', 'placa', 'otro'];
const ICONS = ['Shirt', 'Coffee', 'Flame', 'Grid', 'Package', 'Tag'];

const inputCls =
  'w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#161814] border-white/10 focus:outline-none focus:border-[var(--accent)]/50 transition-all';

const emptyCategory = (): CategoryUI => ({
  id: `cat-${Date.now()}`,
  label: 'Nueva categoría',
  iconName: 'Grid',
  tipo: 'otro',
  atributos: [],
  activo: true,
  orden: 99,
});

const emptyAttribute = (): CategoryAttributeDef => ({
  key: `filtro_${Date.now()}`,
  label: 'Nuevo filtro',
  tipo: 'opciones',
  valores: [],
});

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, onSave, saving }) => {
  const realCategories = useMemo(() => categories.filter((c) => c.id !== 'all'), [categories]);
  const [draft, setDraft] = useState<CategoryUI[]>(realCategories);

  useEffect(() => {
    setDraft(categories.filter((c) => c.id !== 'all'));
  }, [categories]);

  const update = (index: number, patch: Partial<CategoryUI>) => {
    setDraft((prev) => prev.map((cat, i) => (i === index ? { ...cat, ...patch } : cat)));
  };

  const updateAttr = (catIndex: number, attrIndex: number, patch: Partial<CategoryAttributeDef>) => {
    setDraft((prev) =>
      prev.map((cat, i) => {
        if (i !== catIndex) return cat;
        const atributos = cat.atributos.map((attr, j) => (j === attrIndex ? { ...attr, ...patch } : attr));
        return { ...cat, atributos };
      }),
    );
  };

  const removeAttr = (catIndex: number, attrIndex: number) => {
    setDraft((prev) =>
      prev.map((cat, i) =>
        i === catIndex ? { ...cat, atributos: cat.atributos.filter((_, j) => j !== attrIndex) } : cat,
      ),
    );
  };

  const addAttr = (catIndex: number) => {
    setDraft((prev) =>
      prev.map((cat, i) => (i === catIndex ? { ...cat, atributos: [...cat.atributos, emptyAttribute()] } : cat)),
    );
  };

  const handleSave = async () => {
    const clean = draft
      .map((cat, index) => ({
        ...cat,
        id: cat.id.trim(),
        label: cat.label.trim() || 'Categoría',
        orden: Number.isFinite(cat.orden) ? Number(cat.orden) : index + 1,
        atributos: cat.atributos
          .map((attr) => ({
            ...attr,
            key: attr.key.trim().toLowerCase().replace(/\s+/g, '_'),
            label: attr.label.trim() || attr.key.trim(),
            valores: (attr.valores || []).map((v) => v.trim()).filter(Boolean),
          }))
          .filter((attr) => attr.key),
      }))
      .filter((cat) => cat.id);

    const ids = new Set<string>();
    for (const cat of clean) {
      if (ids.has(cat.id)) {
        alert(`La categoría "${cat.id}" está repetida. Usa un ID distinto.`);
        return;
      }
      ids.add(cat.id);
    }

    await onSave(clean);
  };

  return (
    <Section
      title="Categorías y filtros"
      icon={<Layers className="w-3.5 h-3.5 text-[var(--accent)]" />}
      badge={`${draft.length} categorías`}
    >
      <p className="text-[11px] text-gray-400 leading-relaxed">
        Cada categoría define sus propios filtros rápidos: <strong className="text-white">tallas</strong>,{' '}
        <strong className="text-white">onzas</strong>, <strong className="text-white">alto × ancho</strong> o
        cualquier otro que necesites (gorras, nuevos rubros…). Los productos se clasifican con esos valores.
      </p>

      <div className="space-y-3">
        {draft.map((cat, catIndex) => (
          <div key={`${cat.id}-${catIndex}`} className="rounded-2xl border border-white/10 bg-[#111311] p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Field label="ID (no cambiar si ya tiene productos)">
                <TextInput
                  value={cat.id}
                  onChange={(v) => update(catIndex, { id: v.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="gorras"
                />
              </Field>
              <Field label="Nombre visible">
                <TextInput value={cat.label} onChange={(v) => update(catIndex, { label: v })} placeholder="Gorras" />
              </Field>
              <Field label="Comportamiento">
                <select
                  value={cat.tipo}
                  onChange={(e) => update(catIndex, { tipo: e.target.value as CategoryKind })}
                  className={inputCls}
                >
                  {KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {CATEGORY_KIND_LABEL[kind]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Icono">
                <select
                  value={cat.iconName}
                  onChange={(e) => update(catIndex, { iconName: e.target.value })}
                  className={inputCls}
                >
                  {ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
              <Field label="Orden">
                <TextInput
                  type="number"
                  value={String(cat.orden ?? catIndex + 1)}
                  onChange={(v) => update(catIndex, { orden: parseInt(v) || catIndex + 1 })}
                />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={cat.activo !== false}
                  onChange={(e) => update(catIndex, { activo: e.target.checked })}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <span className="text-xs font-bold text-gray-400">Visible en la tienda</span>
              </label>
              <button
                type="button"
                onClick={() => setDraft((prev) => prev.filter((_, i) => i !== catIndex))}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar categoría
              </button>
            </div>

            <div className="border-t border-white/10 pt-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-extrabold text-[var(--accent)] uppercase tracking-wider">
                  Filtros rápidos de esta categoría
                </p>
                <button
                  type="button"
                  onClick={() => addAttr(catIndex)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold hover:bg-[var(--accent)]/20"
                >
                  <Plus className="w-3 h-3" /> Añadir filtro
                </button>
              </div>

              {cat.atributos.length === 0 && (
                <p className="text-[10px] text-gray-500">
                  Sin filtros: la categoría se muestra pero no tendrá chips de talla/onzas/medida.
                </p>
              )}

              {cat.atributos.map((attr, attrIndex) => (
                <div key={`${attr.key}-${attrIndex}`} className="rounded-xl border border-white/10 bg-[#161814] p-3 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <Field label="Clave">
                      <TextInput
                        value={attr.key}
                        onChange={(v) => updateAttr(catIndex, attrIndex, { key: v })}
                        placeholder="talla / onzas / medida"
                      />
                    </Field>
                    <Field label="Etiqueta">
                      <TextInput
                        value={attr.label}
                        onChange={(v) => updateAttr(catIndex, attrIndex, { label: v })}
                        placeholder="Talla"
                      />
                    </Field>
                    <Field label="Tipo">
                      <select
                        value={attr.tipo}
                        onChange={(e) =>
                          updateAttr(catIndex, attrIndex, {
                            tipo: e.target.value as CategoryAttributeDef['tipo'],
                          })
                        }
                        className={inputCls}
                      >
                        <option value="opciones">Opciones (tallas, onzas…)</option>
                        <option value="medida">Medida alto × ancho</option>
                      </select>
                    </Field>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeAttr(catIndex, attrIndex)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Quitar
                      </button>
                    </div>
                  </div>

                  {attr.tipo === 'medida' ? (
                    <Field label="Unidad">
                      <TextInput
                        value={attr.unidad || 'cm'}
                        onChange={(v) => updateAttr(catIndex, attrIndex, { unidad: v })}
                        placeholder="cm"
                      />
                    </Field>
                  ) : (
                    <Field label="Valores sugeridos (separados por coma)">
                      <TextInput
                        value={(attr.valores || []).join(', ')}
                        onChange={(v) =>
                          updateAttr(catIndex, attrIndex, {
                            valores: v.split(',').map((item) => item.trim()).filter(Boolean),
                          })
                        }
                        placeholder="S, M, L, XL, XXL"
                      />
                    </Field>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setDraft((prev) => [...prev, { ...emptyCategory(), orden: prev.length + 1 }])}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 text-xs font-bold hover:bg-white/10 transition-all"
        >
          <Plus className="w-4 h-4" /> Nueva categoría
        </button>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[#0A0A0A] font-extrabold text-sm hover:bg-[var(--accent-hover)] shadow-lg shadow-[var(--accent)]/20 disabled:opacity-50 transition-all"
          >
            {saving ? 'Guardando...' : <><Save className="w-4 h-4" /> Guardar categorías</>}
          </button>
        </div>
      </div>
    </Section>
  );
};

AdminCategories.displayName = 'AdminCategories';
