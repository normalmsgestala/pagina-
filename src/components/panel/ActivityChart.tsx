import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Save, Lock } from 'lucide-react';
import { api } from '../../lib/api';

type Metric = 'conexiones' | 'trabajos' | 'ambos';
type View = 'dia' | 'alumno';
interface Config { days: number; metric: Metric; view: View }
interface Point { day: string; conexiones: number; trabajos: number }
interface Person { name: string; conexiones: number; trabajos: number }
interface Stats { config: Config; canEdit: boolean; series: Point[]; people: Person[] }

const SERIES = [
  { key: 'conexiones' as const, label: 'Conexiones', color: '#2a78d6' },
  { key: 'trabajos' as const, label: 'Trabajos enviados', color: '#eb6834' },
];
const DAYS = [7, 14, 30, 60, 90, 180];

/** Columna con extremo de datos redondeado (4px) y base recta. */
function colPath(x: number, y: number, w: number, h: number) {
  if (h <= 0) return '';
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}
/** Barra horizontal con extremo derecho redondeado. */
function barPath(x: number, y: number, w: number, h: number) {
  if (w <= 0) return '';
  const r = Math.min(4, h / 2, w);
  return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
}
const niceMax = (n: number) => { if (n <= 4) return 4; const p = Math.pow(10, Math.floor(Math.log10(n))); return Math.ceil(n / p) * p; };
const shortDay = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

/** Gráfica de conexiones y trabajos. Todos la ven; solo el administrador cambia el periodo, la métrica y la vista. */
export function ActivityChart() {
  const [data, setData] = useState<Stats | null>(null);
  const [draft, setDraft] = useState<Config | null>(null);
  const [msg, setMsg] = useState('');
  const [hover, setHover] = useState<number | null>(null);

  const load = useCallback(async (preview?: Config) => {
    try {
      const q = preview ? `?days=${preview.days}&metric=${preview.metric}&view=${preview.view}` : '';
      const r = await api<Stats>('stats' + q);
      setData(r); if (!preview) setDraft(r.config);
    } catch (e: any) { setMsg(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const change = (patch: Partial<Config>) => { if (!draft) return; const next = { ...draft, ...patch }; setDraft(next); setMsg(''); load(next); };
  const save = async () => {
    if (!draft) return;
    try { await api('stats', { method: 'PUT', body: draft }); setMsg('Guardado: todos verán la gráfica así.'); }
    catch (e: any) { setMsg(e.message); }
  };

  const cfg = data?.config;
  const shown = SERIES.filter(s => cfg && (cfg.metric === 'ambos' || cfg.metric === s.key));
  const days = useMemo(() => {
    if (!data) return [] as Point[];
    const map = new Map(data.series.map(p => [p.day, p]));
    const out: Point[] = [];
    for (let i = data.config.days - 1; i >= 0; i--) {
      const d = new Date(); d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      const p = map.get(key);
      out.push({ day: key, conexiones: Number(p?.conexiones) || 0, trabajos: Number(p?.trabajos) || 0 });
    }
    return out;
  }, [data]);

  if (!data || !cfg || !draft) return <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-500">{msg || 'Cargando gráfica…'}</div>;
  const total = (k: 'conexiones' | 'trabajos') => days.reduce((a, p) => a + p[k], 0);
  const sel = 'rounded-lg border border-stone-300 bg-white p-1.5 text-xs';

  return <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-stone-900"><BarChart3 size={16} /> Conexiones y trabajos del grupo</p>
        <p className="mt-0.5 text-xs text-stone-500">Últimos {cfg.days} días · {cfg.view === 'dia' ? 'por día' : 'por estudiante'}</p>
      </div>
      <div className="flex gap-5 text-right">
        {shown.map(s => <div key={s.key}><p className="text-2xl font-semibold tabular-nums text-stone-900">{total(s.key)}</p><p className="text-[11px] text-stone-500">{s.label}</p></div>)}
      </div>
    </div>

    {data.canEdit ? <div className="flex flex-wrap items-center gap-2 rounded-xl bg-stone-50 p-2">
      <select aria-label="Periodo" value={draft.days} onChange={e => change({ days: Number(e.target.value) })} className={sel}>{DAYS.map(d => <option key={d} value={d}>Últimos {d} días</option>)}</select>
      <select aria-label="Qué mostrar" value={draft.metric} onChange={e => change({ metric: e.target.value as Metric })} className={sel}>
        <option value="ambos">Conexiones y trabajos</option><option value="conexiones">Solo conexiones</option><option value="trabajos">Solo trabajos</option></select>
      <select aria-label="Vista" value={draft.view} onChange={e => change({ view: e.target.value as View })} className={sel}>
        <option value="dia">Por día</option><option value="alumno">Por estudiante</option></select>
      <button onClick={save} className="ml-auto inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white"><Save size={13} /> Guardar para todos</button>
    </div> : <p className="flex items-center gap-1 text-[11px] text-stone-400"><Lock size={11} /> El administrador decide qué muestra esta gráfica.</p>}
    {msg && <p className="text-xs text-amber-800">{msg}</p>}

    {shown.length > 1 && <div className="flex gap-4 text-xs text-stone-600">{shown.map(s =>
      <span key={s.key} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />{s.label}</span>)}</div>}

    {cfg.view === 'dia' ? <DayChart days={days} shown={shown} hover={hover} setHover={setHover} />
      : <PeopleChart people={data.people} shown={shown} />}

    <details className="text-xs text-stone-600">
      <summary className="cursor-pointer text-stone-500">Ver como tabla</summary>
      <table className="mt-2 w-full text-left">
        <thead className="text-stone-400"><tr><th className="py-1">{cfg.view === 'dia' ? 'Día' : 'Estudiante'}</th>{shown.map(s => <th key={s.key} className="py-1 text-right">{s.label}</th>)}</tr></thead>
        <tbody>{(cfg.view === 'dia' ? days.filter(d => d.conexiones || d.trabajos).map(d => ({ name: shortDay(d.day), ...d })) : data.people).map(r =>
          <tr key={r.name} className="border-t border-stone-100"><td className="py-1">{r.name}</td>{shown.map(s => <td key={s.key} className="py-1 text-right tabular-nums">{Number(r[s.key]) || 0}</td>)}</tr>)}</tbody>
      </table>
    </details>
  </section>;
}

function DayChart({ days, shown, hover, setHover }: { days: Point[]; shown: typeof SERIES; hover: number | null; setHover: (i: number | null) => void }) {
  const W = 720, H = 220, L = 32, B = 22, T = 8;
  const max = niceMax(Math.max(1, ...days.flatMap(d => shown.map(s => d[s.key]))));
  const band = (W - L) / days.length;
  const barW = Math.max(1, Math.min(24, (band - 4) / shown.length - 2));
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const ticks = [0, max / 2, max];
  const step = Math.ceil(days.length / 8);
  const h = hover != null ? days[hover] : null;
  return <div className="relative">
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Conexiones y trabajos por día" onMouseLeave={() => setHover(null)}>
      {ticks.map(t => <g key={t}><line x1={L} x2={W} y1={y(t)} y2={y(t)} stroke="#e7e5e4" strokeWidth={1} />
        <text x={L - 6} y={y(t) + 3} textAnchor="end" fontSize={10} fill="#78716c">{Math.round(t)}</text></g>)}
      {days.map((d, i) => {
        const x0 = L + i * band + (band - shown.length * (barW + 2)) / 2;
        return <g key={d.day} onMouseEnter={() => setHover(i)}>
          <rect x={L + i * band} y={T} width={band} height={H - T - B} fill={hover === i ? '#f5f5f4' : 'transparent'} />
          {shown.map((s, j) => <path key={s.key} d={colPath(x0 + j * (barW + 2), y(d[s.key]), barW, y(0) - y(d[s.key]))} fill={s.color} />)}
          {i % step === 0 && <text x={L + i * band + band / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="#78716c">{shortDay(d.day)}</text>}
        </g>;
      })}
    </svg>
    {h && <div className="pointer-events-none absolute right-2 top-0 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-stone-900">{shortDay(h.day)}</p>
      {shown.map(s => <p key={s.key} className="flex items-center gap-1.5 text-stone-600"><span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />{s.label}: <strong className="tabular-nums text-stone-900">{h[s.key]}</strong></p>)}
    </div>}
  </div>;
}

function PeopleChart({ people, shown }: { people: Person[]; shown: typeof SERIES }) {
  const max = niceMax(Math.max(1, ...people.flatMap(p => shown.map(s => Number(p[s.key]) || 0))));
  return <div className="space-y-1.5">
    {people.map(p => <div key={p.name} className="group grid grid-cols-[minmax(0,10rem)_1fr] items-center gap-3 sm:grid-cols-[14rem_1fr]">
      <span className="truncate text-xs text-stone-700" title={p.name}>{p.name}</span>
      <div className="space-y-0.5">{shown.map(s => {
        const v = Number(p[s.key]) || 0;
        return <div key={s.key} className="flex items-center gap-2" title={`${p.name} · ${s.label}: ${v}`}>
          <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="h-2.5 flex-1"><path d={barPath(0, 0, (v / max) * 100, 8)} fill={s.color} /></svg>
          <span className="w-7 text-right text-[11px] tabular-nums text-stone-600">{v}</span>
        </div>;
      })}</div>
    </div>)}
  </div>;
}
