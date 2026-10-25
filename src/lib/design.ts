import { useEffect, useState } from 'react';
import { DEFAULT_DESIGN, designVariables, sanitizeDesign, type SiteDesign } from './designSchema';

const CACHE_KEY = 'leaf-design-v1';
let current: SiteDesign = (() => {
  try { const c = localStorage.getItem(CACHE_KEY); if (c) return sanitizeDesign(JSON.parse(c)); } catch { /* sin caché */ }
  return DEFAULT_DESIGN;
})();
const listeners = new Set<(d: SiteDesign) => void>();
const loadedFonts = new Set<string>();

function loadFont(name: string) {
  if (loadedFonts.has(name)) return;
  loadedFonts.add(name);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

/** Aplica un diseño a toda la página (también sirve como vista previa mientras se edita). */
export function applyDesign(d: SiteDesign) {
  const clean = sanitizeDesign(d);
  const root = document.documentElement.style;
  for (const [k, v] of Object.entries(designVariables(clean))) root.setProperty(k, v);
  loadFont(clean.fonts.heading); loadFont(clean.fonts.body);
  current = clean;
  listeners.forEach(fn => fn(clean));
}

/** Diseño guardado en el servidor; se carga una vez al abrir cualquier página. */
export async function loadSavedDesign(): Promise<SiteDesign> {
  try {
    const r = await fetch('/api/content/design', { credentials: 'same-origin' });
    const j = r.ok ? await r.json() : null;
    const d = sanitizeDesign(j?.value || DEFAULT_DESIGN);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch { /* sin caché */ }
    applyDesign(d);
    return d;
  } catch { applyDesign(current); return current; }
}

export function useDesign(): SiteDesign {
  const [d, setD] = useState(current);
  useEffect(() => { listeners.add(setD); setD(current); return () => { listeners.delete(setD); }; }, []);
  return d;
}

export function cacheDesign(d: SiteDesign) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(sanitizeDesign(d))); } catch { /* sin caché */ }
}
