import React, { memo } from 'react';
import { MessageCircle } from 'lucide-react';
import { Field, TextInput, Section, PreviewBox, EditableText } from './AdminShared';

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

    <Section title="Textos del Social Bar" icon={<MessageCircle className="w-3.5 h-3.5 text-[#D2E8A3]" />}>
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

  </div>
));
AdminConfig.displayName = 'AdminConfig';
