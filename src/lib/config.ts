import { supabase } from './supabase';

let cachedConfig: Record<string, string> | null = null;
let loaded = false;

export async function loadConfig(): Promise<void> {
  if (!supabase || loaded) return;
  try {
    const { data, error } = await supabase.from('configuracion').select('*');
    if (error || !data || data.length === 0) { loaded = true; return; }
    cachedConfig = {};
    data.forEach((row: { id: string; valor: string }) => {
      cachedConfig![row.id] = row.valor;
    });
    loaded = true;
  } catch {
    loaded = true;
  }
}

export function cfg(key: string, fallback: string): string {
  return cachedConfig?.[key] ?? fallback;
}
