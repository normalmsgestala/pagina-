import React from 'react';

export const Tarjeta: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 ${className}`}>{children}</div>
);

export const Titulo: React.FC<{ children: React.ReactNode; sub?: React.ReactNode }> = ({ children, sub }) => (
  <div className="space-y-1">
    <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900">{children}</h2>
    {sub && <p className="text-sm text-stone-600">{sub}</p>}
  </div>
);

export const BotonP: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'secundario' | 'peligro' }> = ({ variante = 'primario', className = '', ...p }) => (
  <button
    {...p}
    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
      variante === 'primario' ? 'bg-amber-700 text-white hover:bg-amber-800'
        : variante === 'peligro' ? 'bg-red-700 text-white hover:bg-red-800'
        : 'bg-white border border-stone-300 text-stone-800 hover:border-amber-600'
    } ${className}`}
  />
);

export const Barra: React.FC<{ valor: number; className?: string }> = ({ valor, className = '' }) => (
  <div className={`h-2.5 rounded-full bg-stone-200 overflow-hidden ${className}`} role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={100}>
    <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${valor}%` }} />
  </div>
);

export const Campo: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1">
    <span className="text-sm font-semibold text-stone-700">{label}</span>
    {children}
  </label>
);

export const inputCls = 'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-amber-500';

export const Seguridad = ({ texto }: { texto?: string }) => (
  <div className="flex gap-3 items-start rounded-xl border-2 border-red-300 bg-red-50 p-4 text-red-900">
    <span className="text-2xl leading-none" aria-hidden>{texto ? '⚠️' : '☀️'}</span>
    {texto
      ? <p className="text-sm sm:text-base"><b>Cuidado:</b> {texto}</p>
      : <p className="text-sm sm:text-base"><b>Regla de oro:</b> nunca mires al Sol con una lupa ni con tu telescopio. Puedes dañar tus ojos para siempre.</p>}
  </div>
);

export const fechaCorta = (iso?: string) => iso ? new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/** Reduce una foto a 1600 px como máximo (JPEG) antes de subirla. */
export async function comprimirImagen(f: File, max = 1600, calidad = 0.82): Promise<Blob> {
  if (!f.type.startsWith('image/')) return f;
  const bmp = await createImageBitmap(f).catch(() => null);
  if (!bmp) return f;
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  return await new Promise((res) => c.toBlob((b) => res(b || f), 'image/jpeg', calidad));
}
