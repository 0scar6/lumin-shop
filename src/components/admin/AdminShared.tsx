import React, { useState, useEffect, memo, useRef } from 'react';
import { Upload, Eye, Pencil } from 'lucide-react';

export const Field = memo(({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
    {children}
  </div>
));
Field.displayName = 'Field';

export const TextInput = memo(({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#161814] border-white/10 placeholder-gray-600 focus:outline-none focus:border-[#D2E8A3]/50 focus:ring-1 focus:ring-[#D2E8A3]/20 transition-all" />
));
TextInput.displayName = 'TextInput';

export const TextArea = memo(({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) => (
  <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="w-full px-3 py-2.5 rounded-xl border text-sm text-white bg-[#161814] border-white/10 placeholder-gray-600 focus:outline-none focus:border-[#D2E8A3]/50 focus:ring-1 focus:ring-[#D2E8A3]/20 transition-all resize-none" />
));
TextArea.displayName = 'TextArea';

export const MediaUpload = memo(({ id, label, value, onChange, handleFileUpload, uploading, uploadTarget }: {
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

export const Section = memo(({ title, icon, children, badge }: { title: string; icon?: React.ReactNode; children: React.ReactNode; badge?: string }) => (
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

export const PreviewBox = memo(({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/5 bg-[#0A0B0A] overflow-hidden">
    <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
      <Eye className="w-3 h-3 text-[#D2E8A3]" />
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{title}</span>
    </div>
    <div className="p-4">{children}</div>
  </div>
));
PreviewBox.displayName = 'PreviewBox';

export const EditableText = memo(({ cfgKey, value, setCfg, className, isTextarea, rows, fallback, monospace }: {
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

export const EditableImage = memo(({ cfgKey, value, setCfg, handleFileUpload, uploading, uploadTarget, className, fallback }: {
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

export const MirrorSection = memo(({ title, icon, children, badge, editCount }: {
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

export interface AdminSharedProps {
  cfgEdit: Record<string, string>;
  setCfg: (key: string, value: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void;
  uploading: boolean;
  uploadTarget: string;
}
