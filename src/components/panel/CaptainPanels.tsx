import React, { useCallback, useEffect, useState } from 'react';
import { Flag, Users, Target, ClipboardList, Check, ArrowLeft, ArrowRight, History, RotateCcw, RefreshCw, Pencil } from 'lucide-react';
import { api, formatDateTime, ROLE_LABEL, type Role, type User } from '../../lib/api';
import { AiAssist } from './AiAssist';

export interface CaptainProfile {
  userId: number; name: string; semester: string; area: string; duties: string; goals: string;
  wants: string[]; team: number[]; updatedAt: string;
}
interface Person { id: number; name: string; role: Role }

const SEMESTERS = ['1° semestre', '2° semestre', '3° semestre', '4° semestre', '5° semestre', '6° semestre', '7° semestre', '8° semestre'];
const WANTS = ['Agregar o reorganizar secciones', 'Editar los equipos y módulos del semestre', 'Actualizar el calendario',
  'Publicar artículos o podcasts', 'Subir evidencias y documentos', 'Mejorar textos y presentación', 'Revisar el trabajo de mi equipo'];
const input = 'mt-1 w-full rounded-lg border border-stone-300 bg-white p-2.5 text-sm font-normal focus:border-amber-600 focus:outline-none';

export function useCaptainProfile(enabled: boolean) {
  const [profile, setProfile] = useState<CaptainProfile | null | undefined>(undefined);
  const load = useCallback(() => {
    if (!enabled) { setProfile(null); return; }
    api<{ profile: CaptainProfile | null }>('captain').then(r => setProfile(r.profile)).catch(() => setProfile(null));
  }, [enabled]);
  useEffect(() => { load(); }, [load]);
  return { profile, reload: load };
}

/** Formulario del capitán: de qué es capitán, qué tiene que hacer, qué quiere hacer en la página y quién es su equipo. */
export function CaptainWizard({ me, initial, onDone, onCancel }: { me: User; initial?: CaptainProfile | null; onDone: () => void; onCancel?: () => void }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    semester: initial?.semester || SEMESTERS[0], area: initial?.area || '', duties: initial?.duties || '', goals: initial?.goals || '',
  });
  const [wants, setWants] = useState<string[]>(initial?.wants || []);
  const [team, setTeam] = useState<number[]>(initial?.team || []);
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api<{ people: Person[] }>('captain/people').then(r => setPeople(r.people.filter(p => p.id !== me.id))).catch(e => setError(e.message)); }, [me.id]);

  const steps = [
    { icon: Flag, title: '¿De qué eres capitán este semestre?', ok: f.area.trim().length > 1 },
    { icon: ClipboardList, title: '¿Qué es lo que tienes que hacer?', ok: f.duties.trim().length > 9 },
    { icon: Target, title: '¿Qué deseas hacer en la página?', ok: f.goals.trim().length > 4 },
    { icon: Users, title: '¿Quiénes son tu equipo de trabajo?', ok: true },
  ];
  const toggle = <T,>(list: T[], set: (v: T[]) => void, v: T) => set(list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
  const save = async () => {
    setBusy(true); setError('');
    try { await api('captain', { method: 'PUT', body: { ...f, wants, team } }); onDone(); }
    catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };
  const S = steps[step];

  return <div className="mx-auto max-w-2xl space-y-6">
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">Capitán · paso {step + 1} de {steps.length}</p>
      <div className="mx-auto mt-3 flex max-w-xs gap-1.5">{steps.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-amber-700' : 'bg-stone-200'}`} />)}</div>
      <h1 className="mt-5 flex items-center justify-center gap-2 font-serif text-3xl"><S.icon size={24} className="text-amber-800" /> {S.title}</h1>
      {step === 0 && <p className="mt-2 text-sm text-stone-500">Con lo que escribas aquí, la IA te ayudará a organizar tus actividades y modificar la página.</p>}
    </div>
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
      {step === 0 && <>
        <label className="block text-xs font-semibold text-stone-700">Semestre
          <select value={f.semester} onChange={e => setF({ ...f, semester: e.target.value })} className={input}>{SEMESTERS.map(s => <option key={s}>{s}</option>)}</select></label>
        <label className="block text-xs font-semibold text-stone-700">Soy capitán de…
          <input autoFocus value={f.area} maxLength={200} onChange={e => setF({ ...f, area: e.target.value })} className={input} placeholder="Ej. Equipo 2: Sillas Voladoras, o Comunicación y redes" /></label>
      </>}
      {step === 1 && <label className="block text-xs font-semibold text-stone-700">Redacta tus responsabilidades como capitán
        <textarea autoFocus rows={7} maxLength={4000} value={f.duties} onChange={e => setF({ ...f, duties: e.target.value })} className={input}
          placeholder="Ej. Coordinar a mi equipo para entregar el simulador, revisar los avances cada semana, subir evidencias…" /></label>}
      {step === 2 && <>
        <p className="text-xs font-semibold text-stone-700">Marca lo que te interesa</p>
        <div className="grid gap-2 sm:grid-cols-2">{WANTS.map(w => <label key={w} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-sm ${wants.includes(w) ? 'border-amber-600 bg-amber-50' : 'border-stone-200'}`}>
          <input type="checkbox" checked={wants.includes(w)} onChange={() => toggle(wants, setWants, w)} className="mt-0.5" /> {w}</label>)}</div>
        <label className="block text-xs font-semibold text-stone-700">Describe qué quieres hacer en la página
          <textarea rows={5} maxLength={4000} value={f.goals} onChange={e => setF({ ...f, goals: e.target.value })} className={input}
            placeholder="Ej. Quiero agregar una sección con los avances semanales de mi equipo y fotos de la maqueta…" /></label>
      </>}
      {step === 3 && <>
        <p className="text-sm text-stone-600">Marca a los compañeros que forman tu equipo ({team.length} seleccionados).</p>
        <div className="grid max-h-80 gap-1.5 overflow-y-auto sm:grid-cols-2">{people.map(p => <label key={p.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${team.includes(p.id) ? 'border-amber-600 bg-amber-50' : 'border-stone-200'}`}>
          <input type="checkbox" checked={team.includes(p.id)} onChange={() => toggle(team, setTeam, p.id)} />
          <span className="flex-1">{p.name}</span>{p.role !== 'editor' && <span className="text-[10px] text-stone-400">{ROLE_LABEL[p.role]}</span>}</label>)}</div>
      </>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex items-center gap-3 pt-2">
        {step > 0 ? <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 text-sm text-stone-600"><ArrowLeft size={15} /> Atrás</button>
          : onCancel && <button onClick={onCancel} className="text-sm text-stone-500 underline">Cancelar</button>}
        <span className="flex-1" />
        {step < steps.length - 1
          ? <button disabled={!S.ok} onClick={() => setStep(step + 1)} className="inline-flex items-center gap-1 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Siguiente <ArrowRight size={15} /></button>
          : <button disabled={busy} onClick={save} className="inline-flex items-center gap-1 rounded-xl bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Check size={15} /> {busy ? 'Guardando…' : 'Guardar'}</button>}
      </div>
    </div>
  </div>;
}

/** Pestaña "Mi capitanía": resumen de lo que redactó, su equipo y la IA que le ayuda con base en eso. */
export function CaptainTab({ me, profile, onChanged }: { me: User; profile: CaptainProfile; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  useEffect(() => { api<{ people: Person[] }>('captain/people').then(r => setPeople(r.people)).catch(() => {}); }, []);
  if (editing) return <CaptainWizard me={me} initial={profile} onDone={() => { setEditing(false); onChanged(); }} onCancel={() => setEditing(false)} />;
  const names = people.filter(p => profile.team.includes(p.id)).map(p => p.name);
  return <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-amber-800">{profile.semester}</p>
          <h2 className="mt-1 font-serif text-2xl">Capitán de {profile.area}</h2></div>
        <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 rounded-full border border-stone-300 px-3 py-1.5 text-xs"><Pencil size={12} /> Editar</button>
      </div>
      <div><p className="text-xs font-bold uppercase text-stone-400">Lo que tengo que hacer</p><p className="mt-1 whitespace-pre-line text-stone-700">{profile.duties}</p></div>
      <div><p className="text-xs font-bold uppercase text-stone-400">Lo que quiero hacer en la página</p>
        {profile.wants.length > 0 && <div className="mt-1 flex flex-wrap gap-1.5">{profile.wants.map(w => <span key={w} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-900">{w}</span>)}</div>}
        <p className="mt-1 whitespace-pre-line text-stone-700">{profile.goals}</p></div>
      <div><p className="text-xs font-bold uppercase text-stone-400">Mi equipo ({names.length})</p>
        {names.length ? <ul className="mt-1 grid gap-1 sm:grid-cols-2">{names.map(n => <li key={n} className="flex items-center gap-1.5 text-stone-700"><Check size={13} className="text-emerald-700" />{n}</li>)}</ul>
          : <p className="mt-1 text-stone-400">Sin integrantes registrados.</p>}</div>
    </section>
    <AiAssist tasks={['capitania', 'pagina', 'revisar', 'mejorar']} allowEmptyText title="Asistente de tu capitanía"
      hint="Conoce lo que redactaste y a tu equipo. Pídele un plan, repartir tareas o el texto de una sección nueva; luego aplícalo con «Modo edición» en la página." />
  </div>;
}

interface Version { id: number; scope: string; ref: string; action: string; label: string; user_name: string; created_at: string; size: number }
const SCOPE_LABEL: Record<string, string> = { pagina: 'Página', publicacion: 'Publicación', calendario: 'Calendario' };
const ACTION_TXT: Record<string, string> = {
  edicion: 'Antes de editar', eliminacion: 'Antes de borrar', aprobacion: 'Antes de aprobar', rechazo: 'Antes de rechazar', antes_de_restaurar: 'Antes de restaurar',
};

/** Solo el administrador: últimas 10 versiones de la página, publicaciones y calendario, con botón para restaurar. */
export function VersionsPanel() {
  const [list, setList] = useState<Version[]>([]);
  const [scope, setScope] = useState('pagina');
  const [msg, setMsg] = useState('');
  const load = useCallback(() => { api<{ versions: Version[] }>('versions').then(r => setList(r.versions)).catch(e => setMsg(e.message)); }, []);
  useEffect(() => { load(); }, [load]);
  const restore = async (v: Version) => {
    if (!confirm(`¿Restaurar esta versión (${formatDateTime(v.created_at)})? El estado actual también se guardará en el historial.`)) return;
    try { await api(`versions/${v.id}/restore`, { method: 'POST', body: {} }); setMsg('Versión restaurada.'); load(); }
    catch (e: any) { setMsg(e.message); }
  };
  const shown = list.filter(v => v.scope === scope);
  return <div className="space-y-4">
    <p className="flex items-start gap-2 text-sm text-stone-600"><History size={16} className="mt-0.5 shrink-0" />
      Cada vez que alguien edita, aprueba o borra algo, se guarda cómo estaba antes. Se conservan las últimas 10 versiones de cada tipo; las más viejas se borran solas. Solo tú puedes restaurarlas.</p>
    <div className="flex flex-wrap items-center gap-2">
      {Object.entries(SCOPE_LABEL).map(([k, l]) => <button key={k} onClick={() => setScope(k)}
        className={`rounded-full px-4 py-1.5 text-sm ${scope === k ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white'}`}>{l} ({list.filter(v => v.scope === k).length})</button>)}
      <button onClick={load} className="ml-auto inline-flex items-center gap-1 text-xs text-stone-500"><RefreshCw size={13} /> Actualizar</button>
    </div>
    {msg && <p className="text-sm text-amber-800">{msg}</p>}
    {shown.length === 0 ? <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">Todavía no hay versiones guardadas aquí.</p>
      : <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white"><table className="w-full text-left text-sm">
        <thead className="bg-stone-50 text-xs uppercase text-stone-500"><tr><th className="p-3">Cuándo</th><th className="p-3">Quién hizo el cambio</th><th className="p-3">Qué</th><th className="p-3"></th></tr></thead>
        <tbody>{shown.map(v => <tr key={v.id} className="border-t border-stone-100">
          <td className="whitespace-nowrap p-3 text-xs text-stone-500">{formatDateTime(v.created_at)}</td>
          <td className="p-3">{v.user_name}</td>
          <td className="p-3"><span className="text-xs font-semibold">{ACTION_TXT[v.action] || v.action}</span><span className="block text-xs text-stone-500">{v.label}</span></td>
          <td className="p-3 text-right"><button onClick={() => restore(v)} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold hover:bg-stone-50"><RotateCcw size={13} /> Restaurar</button></td>
        </tr>)}</tbody></table></div>}
  </div>;
}

/** Solo el administrador: lo que cada capitán redactó. */
export function CaptainsOverview() {
  const [profiles, setProfiles] = useState<CaptainProfile[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  useEffect(() => {
    api<{ profiles: CaptainProfile[] }>('captain/all').then(r => setProfiles(r.profiles)).catch(() => {});
    api<{ people: Person[] }>('captain/people').then(r => setPeople(r.people)).catch(() => {});
  }, []);
  const captains = people.filter(p => p.role === 'capitan');
  return <div className="grid gap-4 md:grid-cols-2">
    {captains.map(c => {
      const p = profiles.find(x => x.userId === c.id);
      return <section key={c.id} className="space-y-2 rounded-2xl border border-stone-200 bg-white p-5 text-sm">
        <p className="font-serif text-xl">{c.name}</p>
        {!p ? <p className="text-stone-400">Aún no llena su formulario de capitán.</p> : <>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">{p.semester} · {p.area}</p>
          <p className="whitespace-pre-line text-stone-700"><strong>Tareas:</strong> {p.duties}</p>
          <p className="whitespace-pre-line text-stone-700"><strong>En la página:</strong> {p.goals}</p>
          <p className="text-stone-700"><strong>Equipo:</strong> {people.filter(x => p.team.includes(x.id)).map(x => x.name).join(', ') || '—'}</p>
          <p className="text-[11px] text-stone-400">Actualizado {formatDateTime(p.updatedAt)}</p>
        </>}
      </section>;
    })}
    {!captains.length && <p className="text-sm text-stone-500">No hay capitanes registrados.</p>}
  </div>;
}
