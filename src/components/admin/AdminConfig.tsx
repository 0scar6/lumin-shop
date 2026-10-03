import React, { memo } from 'react';
import { MessageCircle, Palette, PartyPopper, Check } from 'lucide-react';
import { Field, TextInput, Section, PreviewBox, EditableText } from './AdminShared';
import { PALETTES, PALETTE_LABELS } from '../../lib/palette';
import { SEASON_OPTIONS, SEASONS } from '../CampaignStrip';

export const AdminConfig = memo(({ cfgEdit, setCfg }: { cfgEdit: Record<string, string>; setCfg: (key: string, value: string) => void }) => (
  <div className="p-5 sm:p-8 space-y-6 max-w-[1200px] mx-auto">

    <Section title="Contacto & Redes Sociales" icon={<MessageCircle className="w-3.5 h-3.5 text-green-500" />} badge="Configuración central">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Todo lo que configure aquí se aplica en <strong className="text-white">toda la web</strong>: WhatsApp, Instagram, TikTok, Facebook, teléfono, etc.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono (display)">
              <TextInput value={cfgEdit.brand_phone || ''} onChange={(v: string) => setCfg('brand_phone', v)} placeholder="993 365 099" />
            </Field>
            <Field label="Ubicación">
              <TextInput value={cfgEdit.brand_location || ''} onChange={(v: string) => setCfg('brand_location', v)} placeholder="Ayacucho, Perú" />
            </Field>
          </div>
          <Field label="Instagram URL o @usuario">
            <TextInput value={cfgEdit.brand_instagram || ''} onChange={(v: string) => setCfg('brand_instagram', v)} placeholder="https://instagram.com/lumin.shop" />
          </Field>
          <Field label="TikTok URL o @usuario">
            <TextInput value={cfgEdit.brand_tiktok || ''} onChange={(v: string) => setCfg('brand_tiktok', v)} placeholder="https://tiktok.com/@.lumin.shop" />
          </Field>
          <Field label="Facebook URL o usuario">
            <TextInput value={cfgEdit.brand_facebook || ''} onChange={(v: string) => setCfg('brand_facebook', v)} placeholder="https://facebook.com/lumin.shop" />
          </Field>
          <Field label="Mensaje de WhatsApp (saludo)">
            <TextInput value={cfgEdit.brand_whatsapp_help || ''} onChange={(v: string) => setCfg('brand_whatsapp_help', v)} placeholder="Hola, necesito ayuda..." />
          </Field>
          <p className="text-[9px] text-gray-600">Pega URLs completas (https://...) o solo el usuario (ej: lumin.shop)</p>
        </div>
        <PreviewBox title="Vista Previa — Social Bar">
          <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 flex-shrink-0">
                <MessageCircle className="w-5 h-5 fill-green-500 text-green-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base uppercase tracking-tight text-white">{cfgEdit.social_bar_title || 'WhatsApp & Redes Oficiales'}</span>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                <p className="text-xs text-gray-400">
                  {cfgEdit.social_bar_text || 'Contacto directo'}{' '}
                  <strong className="text-white">{cfgEdit.brand_phone || '993 365 099'}</strong>{' '}
                  • {cfgEdit.social_bar_sub || 'Respuesta inmediata'}
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
        </PreviewBox>
      </div>
    </Section>

    <Section title="Textos del Social Bar" icon={<MessageCircle className="w-3.5 h-3.5 text-[var(--accent)]" />}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Field label="Título del Social Bar">
            <TextInput value={cfgEdit.social_bar_title || ''} onChange={(v: string) => setCfg('social_bar_title', v)} placeholder="WhatsApp & Redes Oficiales" />
          </Field>
          <Field label="Texto principal">
            <TextInput value={cfgEdit.social_bar_text || ''} onChange={(v: string) => setCfg('social_bar_text', v)} placeholder="Contacto directo" />
          </Field>
          <Field label="Sub-texto">
            <TextInput value={cfgEdit.social_bar_sub || ''} onChange={(v: string) => setCfg('social_bar_sub', v)} placeholder="Respuesta inmediata" />
          </Field>
        </div>
        <PreviewBox title="Vista Previa — Texto">
          <div className="rounded-xl bg-[#0A0A0A] p-4 space-y-2">
            <p className="text-white font-extrabold text-sm">{cfgEdit.social_bar_title || 'WhatsApp & Redes Oficiales'}</p>
            <p className="text-gray-400 text-xs">
              {cfgEdit.social_bar_text || 'Contacto directo'} <strong className="text-white">{cfgEdit.brand_phone || '993 365 099'}</strong> • {cfgEdit.social_bar_sub || 'Respuesta inmediata'}
            </p>
          </div>
        </PreviewBox>
      </div>
    </Section>

    <Section title="Paleta de Color de la Marca" icon={<Palette className="w-3.5 h-3.5 text-[var(--accent)]" />} badge="Nuevo">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Cambia el color de acento de <strong className="text-white">toda la web</strong>: botones, enlaces, badges y detalles. Se aplica al <strong className="text-white">guardar</strong>.
          </p>
          {Object.entries(PALETTE_LABELS).map(([key, meta]) => {
            const selected = (cfgEdit.brand_palette || 'green') === key;
            return (
              <button
                key={key}
                onClick={() => setCfg('brand_palette', key)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all min-h-[58px] ${
                  selected ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-white/10 bg-white/5 hover:border-white/25'
                }`}
              >
                <span className="w-9 h-9 rounded-full flex-shrink-0 border border-white/20 shadow-lg" style={{ background: PALETTES[key].accent }} />
                <span className="flex-1">
                  <span className="block text-xs font-bold text-white">{meta.name}</span>
                  <span className="block text-[10px] text-gray-500 leading-snug">{meta.desc}</span>
                </span>
                {selected && <Check className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
        <PreviewBox title="Vista Previa — Paleta">
          {(() => {
            const pal = PALETTES[cfgEdit.brand_palette || 'green'] || PALETTES.green;
            return (
              <div className="rounded-xl bg-[#0A0A0A] border border-white/10 p-4 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg" style={{ background: pal.accent, color: '#0A0A0A' }}>Personalizar</span>
                  <span className="px-3 py-2 rounded-xl text-xs font-bold border" style={{ color: pal.accent, borderColor: `${pal.accent}66`, background: `${pal.accent}14` }}>#DROP 04</span>
                  <span className="text-xs font-bold" style={{ color: pal.accent }}>Enlace de acento</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-md border border-white/20" style={{ background: pal.accent }} />
                  <span className="w-6 h-6 rounded-md border border-white/20" style={{ background: pal.hover }} />
                  <span className="w-6 h-6 rounded-md border border-white/20" style={{ background: pal.hover2 }} />
                  <span className="w-6 h-6 rounded-md border border-white/20" style={{ background: pal.light }} />
                  <span className="text-[9px] font-mono text-gray-500 ml-1">{pal.accent}</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed">El modo claro usa automáticamente una variante más oscura del mismo color para mantener la legibilidad.</p>
              </div>
            );
          })()}
        </PreviewBox>
      </div>
    </Section>

    <Section title="Campaña de Temporada" icon={<PartyPopper className="w-3.5 h-3.5 text-[var(--accent)]" />} badge="Nuevo">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Muestra una franja decorativa arriba del inicio de la web con el mensaje que elijas. <strong className="text-white">No cambia precios ni productos.</strong>
          </p>
          <Field label="Temporada activa">
            <select
              value={cfgEdit.season_active || 'none'}
              onChange={(e) => setCfg('season_active', e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[var(--accent)] transition-colors"
            >
              {SEASON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Mensaje de campaña (opcional)">
            <TextInput
              value={cfgEdit.season_message || ''}
              onChange={(v: string) => setCfg('season_message', v)}
              placeholder="Ej. Regalos con tu propio diseño"
            />
          </Field>
          <p className="text-[9px] text-gray-600">Sin mensaje se usa una frase predeterminada de la temporada. Vuelve a «Sin campaña» para ocultarla.</p>
        </div>
        <PreviewBox title="Vista Previa — Franja">
          {(() => {
            const key = cfgEdit.season_active || 'none';
            const meta = SEASONS[key];
            if (!meta) {
              return (
                <div className="rounded-xl bg-[#0A0A0A] border border-dashed border-white/10 p-6 text-center">
                  <p className="text-[11px] text-gray-500">Sin campaña activa.<br />Elige una temporada para mostrar la franja en el inicio.</p>
                </div>
              );
            }
            const msg = (cfgEdit.season_message || '').trim() || meta.message;
            return (
              <div className="rounded-xl bg-[#0A0A0A] p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 rounded-2xl border" style={{ borderColor: `${meta.accent}55`, backgroundColor: `${meta.accent}12` }}>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border" style={{ color: meta.accent, borderColor: `${meta.accent}66`, backgroundColor: `${meta.accent}1a` }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: meta.accent }} />
                    {meta.emoji} {meta.label}
                  </span>
                  <span className="flex-1 min-w-[100px] text-[11px] text-gray-300 leading-snug">{msg}</span>
                  <span className="text-[10px] font-extrabold uppercase" style={{ color: meta.accent }}>Ver diseños →</span>
                </div>
                <p className="text-[9px] text-gray-600">Aparece sobre el banner principal en la pestaña de inicio.</p>
              </div>
            );
          })()}
        </PreviewBox>
      </div>
    </Section>

  </div>
));
AdminConfig.displayName = 'AdminConfig';
