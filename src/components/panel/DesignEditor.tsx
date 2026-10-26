import React, { useEffect, useState } from 'react';
import { Palette, Type, Square, LayoutList, Eye, EyeOff, ArrowUp, ArrowDown, Save, Undo2, RotateCcw, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { applyDesign, cacheDesign, loadSavedDesign } from '../../lib/design';
import { BODY_FONTS, DEFAULT_DESIGN, HEADING_FONTS, SECTION_LABEL, sanitizeDesign, type Radius, type SiteDesign } from '../../lib/designSchema';

const COLOR_FIELDS: { key: keyof SiteDesign['colors']; label: string; hint: string }[] = [
  { key: 'background', label: 'Fondo', hint: 'Color de fondo de toda la página' },
  { key: 'heading', label: 'Títulos grandes', hint: 'Títulos de secciones y proyectos' },
  { key: 'text', label: 'Letras de las explicaciones', hint: 'Párrafos y textos descriptivos' },
  { key: 'button', label: 'Botones importantes', hint: 'Iniciar sesión, Publicar, Guardar…' },
  { key: 'calendar', label: 'Números del calendario', hint: 'Fechas del calendario de actividades' },
  { key: 'accent', label: 'Etiquetas y enlaces', hint: 'Textos pequeños de acento y enlaces' },
  { key: 'dark', label: 'Texto fuerte', hint: 'Nombres y textos destacados' },
  { key: 'marquee', label: 'Marquesina del proyecto', hint: 'Recuadro «¡Bienvenidos al Parque!»' },
  { key: 'gold', label: 'Detalles dorados', hint: 'Franjas y bordes de las tarjetas' },
];
const D = DEFAULT_DESIGN.colors;
const PRESETS: { name: string; colors: SiteDesign['colors'] }[] = [
  { name: 'Campus (crema, pino y terracota)', colors: D },
  { name: 'Feria clásica', colors: { ...D, background: '#fff8e8', heading: '#1c1917', text: '#44403c', button: '#1c1917', calendar: '#f2bd45' } },
  { name: 'Ciencia azul', colors: { ...D, accent: '#1d4ed8', background: '#f1f5ff', heading: '#1e3a8a', text: '#1f2937', button: '#2563eb', calendar: '#7dd3fc' } },
  { name: 'Morado', colors: { ...D, accent: '#7e22ce', background: '#faf5ff', heading: '#581c87', text: '#2e1065', button: '#9333ea', calendar: '#f0abfc' } },
];
const input = 'mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-sm font-normal';

/** Editor del diseño: solo administrador y capitanes. Lo que cambies se ve al momento; «Guardar» lo publica para todos. */
export function DesignEditor() {
  const [saved, setSaved] = useState<SiteDesign | null>(null);
  const [d, setD] = useState<SiteDesign>(DEFAULT_DESIGN);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { loadSavedDesign().then(x => { setSaved(x); setD(x); }); }, []);
  // Al salir del editor sin guardar, regresa al diseño publicado.
  useEffect(() => () => { loadSavedDesign(); }, []);

  const update = (next: SiteDesign) => { setD(next); applyDesign(next); setMsg(''); };
  const setColor = (k: keyof SiteDesign['colors'], v: string) => update({ ...d, colors: { ...d.colors, [k]: v } });
  const setHome = (patch: Partial<SiteDesign['home']>) => update({ ...d, home: { ...d.home, ...patch } });
  const moveSection = (i: number, dir: -1 | 1) => {
    const s = [...d.home.sections]; const j = i + dir;
    if (j < 0 || j >= s.length) return;
    [s[i], s[j]] = [s[j], s[i]]; setHome({ sections: s });
  };
  const dirty = saved && JSON.stringify(sanitizeDesign(d)) !== JSON.stringify(saved);

  const save = async () => {
    setBusy(true);
    try {
      const clean = sanitizeDesign(d);
      await api('content/design', { method: 'PUT', body: { value: clean, detail: 'Diseño de la página' } });
      setSaved(clean); cacheDesign(clean); setMsg('Diseño publicado: todos los visitantes ya lo ven. El administrador puede revertirlo en «Versiones anteriores».');
    } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
  };

  if (!saved) return <p className="text-sm text-stone-500">Cargando diseño…</p>;
  return <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
    <div className="space-y-6">
      <section className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5">
        <p className="flex items-center gap-2 font-semibold"><Palette size={17} className="text-amber-800" /> Colores</p>
        <div className="flex flex-wrap gap-2">{PRESETS.map(p => <button key={p.name} onClick={() => update({ ...d, colors: p.colors })}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1 text-xs hover:border-stone-500">
          {Object.values(p.colors).slice(0, 3).map((c, i) => <span key={i} className="h-3 w-3 rounded-full border border-black/10" style={{ background: c }} />)} {p.name}</button>)}</div>
        <div className="grid gap-3 sm:grid-cols-2">{COLOR_FIELDS.map(f => <label key={f.key} className="flex items-center gap-3 rounded-xl border border-stone-200 p-2.5">
          <input type="color" value={d.colors[f.key]} onChange={e => setColor(f.key, e.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent p-0" />
          <span className="text-sm"><strong className="block text-xs">{f.label}</strong><span className="text-[11px] text-stone-500">{f.hint}</span></span>
        </label>)}</div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-2">
        <p className="flex items-center gap-2 font-semibold sm:col-span-2"><Type size={17} className="text-amber-800" /> Tipografías</p>
        <label className="text-xs font-semibold text-stone-700">Títulos
          <select value={d.fonts.heading} onChange={e => update({ ...d, fonts: { ...d.fonts, heading: e.target.value } })} className={input} style={{ fontFamily: `'${d.fonts.heading}'` }}>
            {HEADING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</select></label>
        <label className="text-xs font-semibold text-stone-700">Texto
          <select value={d.fonts.body} onChange={e => update({ ...d, fonts: { ...d.fonts, body: e.target.value } })} className={input}>
            {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</select></label>
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold text-stone-700">Tarjetas de proyectos</p>
          <div className="mt-1 flex gap-2">{([['estampa', 'Estampas pegadas'], ['plano', 'Planas']] as const).map(([k, l]) =>
            <button key={k} onClick={() => update({ ...d, cardStyle: k })} className={`rounded-xl border px-4 py-2 text-xs ${d.cardStyle === k ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white'}`}>{l}</button>)}</div>
        </div>
        <div className="sm:col-span-2">
          <p className="flex items-center gap-2 text-xs font-semibold text-stone-700"><Square size={14} /> Esquinas de tarjetas y botones</p>
          <div className="mt-1 flex gap-2">{([['recto', 'Rectas'], ['normal', 'Normales'], ['redondo', 'Redondeadas']] as [Radius, string][]).map(([r, l]) =>
            <button key={r} onClick={() => update({ ...d, radius: r })} className={`rounded-xl border px-4 py-2 text-xs ${d.radius === r ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white'}`}>{l}</button>)}</div>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-5">
        <p className="flex items-center gap-2 font-semibold"><LayoutList size={17} className="text-amber-800" /> Portada</p>
        <label className="text-xs font-semibold text-stone-700">Nombre en la barra superior<input maxLength={40} value={d.home.logo} onChange={e => setHome({ logo: e.target.value })} className={input} /></label>
        <label className="text-xs font-semibold text-stone-700">Línea pequeña sobre el título<input maxLength={160} value={d.home.badge} onChange={e => setHome({ badge: e.target.value })} className={input} /></label>
        <label className="text-xs font-semibold text-stone-700">Título principal<input maxLength={160} value={d.home.title} onChange={e => setHome({ title: e.target.value })} className={input} /></label>
        <label className="text-xs font-semibold text-stone-700">Descripción<textarea rows={4} maxLength={1500} value={d.home.description} onChange={e => setHome({ description: e.target.value })} className={input} /></label>
        <div>
          <p className="text-xs font-semibold text-stone-700">Secciones del inicio (orden y cuáles se muestran)</p>
          <div className="mt-1 space-y-1.5">{d.home.sections.map((s, i) => <div key={s.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${s.visible ? 'border-stone-200 bg-white' : 'border-dashed border-stone-300 bg-stone-50 text-stone-400'}`}>
            <span className="flex-1">{SECTION_LABEL[s.id]}</span>
            <button title="Subir" disabled={i === 0} onClick={() => moveSection(i, -1)} className="rounded p-1 hover:bg-stone-100 disabled:opacity-30"><ArrowUp size={15} /></button>
            <button title="Bajar" disabled={i === d.home.sections.length - 1} onClick={() => moveSection(i, 1)} className="rounded p-1 hover:bg-stone-100 disabled:opacity-30"><ArrowDown size={15} /></button>
            <button title={s.visible ? 'Ocultar' : 'Mostrar'} onClick={() => setHome({ sections: d.home.sections.map((x, k) => k === i ? { ...x, visible: !x.visible } : x) })} className="rounded p-1 hover:bg-stone-100">{s.visible ? <Eye size={15} /> : <EyeOff size={15} />}</button>
          </div>)}</div>
        </div>
      </section>
    </div>

    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-2.5">
          <span className="font-display text-sm font-bold text-stone-900">{d.home.logo}</span>
          <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-semibold text-white">Iniciar sesión</span>
        </div>
        <div className="space-y-2 p-4">
          {d.home.badge && <p className="line-clamp-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-800">{d.home.badge}</p>}
          <p className="font-display text-xl font-bold leading-tight text-stone-900">{d.home.title}</p>
          <p className="line-clamp-3 text-xs text-stone-600">{d.home.description}</p>
          <div className="circus-marquee mt-3 rounded-2xl px-3 pb-4 pt-3 text-center text-xs font-black uppercase text-white">¡Bienvenidos al Parque!</div>
          <div className="circus-project-card mt-2 rounded-2xl border p-3"><h3 className="text-sm font-bold font-display">01 Primer Semestre</h3></div>
          <div className="flex items-center gap-2 pt-1"><span className="leaf-calendar-date rounded-lg px-2 py-1 text-[11px] font-bold">16 oct 2026</span><span className="text-xs text-stone-600">Inauguración</span></div>
          <button type="button" className="mt-1 rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold text-white">Botón importante</button>
          <a className="mt-1 inline-block text-xs text-amber-800 underline">Enlace de ejemplo</a>
        </div>
        <p className="border-t border-stone-200 bg-white px-4 py-2 text-[11px] text-stone-500">Vista previa · toda la página ya muestra tus cambios mientras editas</p>
      </div>
      {msg && <p className="flex gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900"><Check size={15} className="shrink-0" />{msg}</p>}
      <button disabled={busy || !dirty} onClick={save} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white disabled:opacity-40">
        <Save size={16} /> {busy ? 'Publicando…' : 'Guardar para todos'}</button>
      <div className="flex gap-2">
        <button disabled={!dirty} onClick={() => update(saved)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white py-2 text-xs disabled:opacity-40"><Undo2 size={14} /> Descartar cambios</button>
        <button onClick={() => update(DEFAULT_DESIGN)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white py-2 text-xs"><RotateCcw size={14} /> Diseño original</button>
      </div>
      {dirty && <p className="text-center text-[11px] text-amber-800">Tienes cambios sin guardar.</p>}
    </aside>
  </div>;
}
