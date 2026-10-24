import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Trash2, Sparkles, MessageSquarePlus, Info, Loader2, Pencil } from 'lucide-react';
import { api, CONSISTENCY_NOTE, formatDateTime, type Proposal } from '../../lib/api';
import { StatusBadge } from './Moderation';

type Tok = { t: string; k: 'same' | 'add' | 'del' };
/** Diferencia por palabras (LCS). Para textos muy largos solo devuelve el texto nuevo sin resaltar. */
function wordDiff(a: string, b: string): Tok[] {
  const A = a.split(/(\s+)/), B = b.split(/(\s+)/);
  if (A.length * B.length > 3_000_000) return [{ t: b, k: 'same' }];
  const n = A.length, m = B.length;
  const L: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out: Tok[] = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ t: B[j], k: 'same' }); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) out.push({ t: A[i++], k: 'del' });
    else out.push({ t: B[j++], k: 'add' });
  }
  while (i < n) out.push({ t: A[i++], k: 'del' });
  while (j < m) out.push({ t: B[j++], k: 'add' });
  return out;
}

/** Antes y después lado a lado; en "después" se resalta lo nuevo y se tacha lo quitado. */
export function BeforeAfter({ before, after }: { before: string; after: string }) {
  const diff = useMemo(() => wordDiff(before, after), [before, after]);
  return <div className="grid gap-3 md:grid-cols-2">
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-stone-500">Antes (lo que hay en la página)</p>
      <p className="whitespace-pre-line text-sm text-stone-600">{before.trim() || <span className="italic text-stone-400">Apartado vacío</span>}</p>
    </div>
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">Después (cómo quedaría)</p>
      <p className="whitespace-pre-line text-sm text-stone-800">{diff.map((d, i) => d.k === 'same' ? <span key={i}>{d.t}</span>
        : d.k === 'add' ? <mark key={i} className="rounded bg-emerald-200/70 text-stone-900">{d.t}</mark>
          : d.t.trim() ? <del key={i} className="text-red-700/70">{d.t}</del> : null)}</p>
    </div>
  </div>;
}

/** Tarjeta de un aporte en la lista de aprobaciones del capitán. */
export function ProposalReview({ p, onDone }: { p: Proposal; onDone: () => void }) {
  const [note, setNote] = useState('');
  const [edit, setEdit] = useState(false);
  const [finalText, setFinalText] = useState(p.after);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const act = async (action: 'approve' | 'reject') => {
    setBusy(true); setMsg('');
    try {
      await api('proposals/' + p.id, { method: 'PATCH', body: { action, note, after: edit ? finalText : undefined } });
      onDone();
    } catch (e: any) { setMsg(e.message); if (e.status === 409) onDone(); }
    finally { setBusy(false); }
  };
  return <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded bg-violet-100 px-2 py-0.5 text-[11px] font-bold uppercase text-violet-900">Aporte a la página</span>
      <span className="flex-1 font-semibold">{p.moduleTitle} · {p.sectionTitle}</span>
      <StatusBadge status={p.status} />
      <span className="w-full text-xs text-stone-500">{p.authorName} · {formatDateTime(p.createdAt)}{p.mergedByAi ? ' · juntado con IA' : ' · juntado sin IA'}</span>
    </div>
    <details className="text-xs text-stone-600"><summary className="cursor-pointer text-stone-500">Ver lo que escribió el estudiante</summary>
      <p className="mt-2 whitespace-pre-line rounded-lg bg-stone-50 p-3">{p.contribution}</p></details>
    {edit
      ? <label className="block text-xs font-semibold text-stone-700">Texto final (puedes ajustarlo antes de aprobar)
        <textarea rows={8} value={finalText} onChange={e => setFinalText(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-sm font-normal" /></label>
      : <BeforeAfter before={p.before} after={p.after} />}
    {msg && <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900">{msg}</p>}
    {p.status === 'pending' && <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Comentario para el autor (opcional)" className="min-w-48 flex-1 rounded-lg border border-stone-300 p-2 text-xs" />
      <button onClick={() => setEdit(!edit)} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-xs"><Pencil size={13} /> {edit ? 'Ver antes y después' : 'Ajustar texto'}</button>
      <button disabled={busy} onClick={() => act('approve')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Check size={14} /> Aprobar</button>
      <button disabled={busy} onClick={() => act('reject')} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-xs disabled:opacity-50"><X size={14} /> Rechazar</button>
    </div>}
    {p.status !== 'pending' && (p.reviewerName || p.reviewNote) && <p className="text-xs text-stone-500">Revisó: {p.reviewerName}{p.reviewNote ? ' · «' + p.reviewNote + '»' : ''}{p.reviewedAt ? ' · ' + formatDateTime(p.reviewedAt) : ''}</p>}
  </div>;
}

export function PendingProposals({ onChange }: { onChange?: () => void }) {
  const [list, setList] = useState<Proposal[] | null>(null);
  const load = useCallback(() => { api<{ proposals: Proposal[] }>('proposals?status=pending').then(r => setList(r.proposals)).catch(() => setList([])); onChange?.(); }, [onChange]);
  useEffect(() => { load(); }, [load]);
  if (!list) return <p className="text-sm text-stone-500">Cargando aportes…</p>;
  if (!list.length) return null;
  return <div className="space-y-3">
    <p className="text-sm font-semibold text-stone-800">Aportes a la página ({list.length})</p>
    {list.map(p => <ProposalReview key={p.id} p={p} onDone={load} />)}
  </div>;
}

/** Botón y ventana para aportar a un apartado. Muestra la leyenda de concordancia y el resultado juntado. */
export function ContributeButton({ moduleId, sectionId, sectionTitle }: { moduleId: string; sectionId: string; sectionTitle: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ after: string; ai: boolean } | null>(null);
  const close = () => { setOpen(false); setText(''); setResult(null); setError(''); };
  const send = async () => {
    setBusy(true); setError('');
    try {
      const r = await api<{ after: string; mergedByAi: boolean }>('proposals', { body: { moduleId, field: 'guide:' + sectionId, contribution: text } });
      setResult({ after: r.after, ai: r.mergedByAi });
    } catch (e: any) { setError(e.status === 401 ? 'Inicia sesión para aportar.' : e.message); }
    finally { setBusy(false); }
  };
  return <>
    <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100">
      <MessageSquarePlus size={14} /> Aportar a este apartado</button>
    {open && createPortal(<div className="fixed inset-0 z-50 flex overflow-y-auto bg-stone-950/60 p-4" role="dialog" aria-modal="true" aria-label="Aportar" onClick={close}>
      <div className="relative m-auto w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 text-stone-900 shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={close} aria-label="Cerrar" className="absolute right-4 top-4 rounded-full p-1 text-stone-400 hover:bg-stone-100"><X size={18} /></button>
        <div><p className="text-xs font-semibold uppercase tracking-widest text-amber-800">Aportar</p><h2 className="mt-1 font-serif text-2xl">{sectionTitle}</h2></div>
        <div className="flex gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"><Info size={18} className="mt-0.5 shrink-0" /><p>{CONSISTENCY_NOTE}</p></div>
        {!result ? <>
          <label className="block text-xs font-semibold text-stone-700">Tu aporte
            <textarea autoFocus rows={8} maxLength={8000} value={text} onChange={e => setText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 p-3 text-sm font-normal" placeholder="Escribe la información que quieres sumar a este apartado…" /></label>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="flex items-center gap-3">
            <button disabled={busy || text.trim().length < 15} onClick={send} className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} {busy ? 'Juntando con la IA…' : 'Juntar y enviar a revisión'}</button>
            <span className="text-xs text-stone-500">Mínimo 15 caracteres.</span>
          </div>
        </> : <>
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><Check size={16} /> Enviado. Un capitán revisará cómo quedaría:</p>
          <p className="max-h-72 overflow-y-auto whitespace-pre-line rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-sm">{result.after}</p>
          {!result.ai && <p className="text-xs text-stone-500">La IA no estaba disponible; tu aporte se agregó al final y el capitán lo acomodará.</p>}
          <button onClick={close} className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white">Listo</button>
        </>}
      </div>
    </div>, document.body)}
  </>;
}

/** Aportes propios del usuario (en "Mis envíos"). */
export function MyProposals() {
  const [list, setList] = useState<Proposal[]>([]);
  const load = useCallback(() => { api<{ proposals: Proposal[] }>('proposals?mine=1&status=all').then(r => setList(r.proposals)).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);
  const remove = async (id: number) => { if (!confirm('¿Eliminar este aporte?')) return; try { await api('proposals/' + id, { method: 'DELETE' }); load(); } catch {} };
  if (!list.length) return null;
  return <div className="space-y-2">
    <p className="text-sm font-semibold text-stone-800">Mis aportes a la página</p>
    {list.map(p => <div key={p.id} className="flex flex-wrap items-start gap-3 rounded-xl border border-stone-200 bg-white p-3 text-sm">
      <div className="flex-1"><p className="font-medium">{p.moduleTitle} · {p.sectionTitle}</p>
        <p className="line-clamp-2 text-xs text-stone-500">{p.contribution}</p>
        {p.reviewNote && <p className="mt-1 text-xs text-stone-600">Comentario: {p.reviewNote}</p>}</div>
      <StatusBadge status={p.status} />
      {p.status === 'pending' && <button onClick={() => remove(p.id)} className="text-xs text-red-700 underline"><Trash2 size={12} className="inline" /> Eliminar</button>}
    </div>)}
  </div>;
}

/** Solo admin: historial de lo que pasa en la página (aportes con antes/después y movimientos). */
export function HistoryPanel() {
  const [props, setProps] = useState<Proposal[]>([]);
  const [acts, setActs] = useState<any[]>([]);
  const [tab, setTab] = useState<'aportes' | 'movimientos'>('aportes');
  useEffect(() => {
    api<{ proposals: Proposal[] }>('proposals?status=all').then(r => setProps(r.proposals)).catch(() => {});
    api<{ activity: any[] }>('activity?limit=300').then(r => setActs(r.activity.filter(a => !['inicio_sesion', 'cierre_sesion', 'seleccion_equipo', 'uso_ia'].includes(a.action)))).catch(() => {});
  }, []);
  return <div className="space-y-4">
    <div className="flex gap-2">{(['aportes', 'movimientos'] as const).map(t => <button key={t} onClick={() => setTab(t)}
      className={`rounded-full px-4 py-1.5 text-sm ${tab === t ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white'}`}>{t === 'aportes' ? `Cambios a la página (${props.length})` : 'Todo lo que pasa'}</button>)}</div>
    {tab === 'aportes' ? (props.length ? props.map(p => <ProposalReview key={p.id} p={p} onDone={() => {}} />)
      : <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">Todavía no hay aportes.</p>)
      : <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white"><table className="w-full text-left text-sm">
        <thead className="bg-stone-50 text-[11px] uppercase text-stone-500"><tr><th className="p-3">Cuándo</th><th className="p-3">Quién</th><th className="p-3">Qué pasó</th></tr></thead>
        <tbody>{acts.map(a => <tr key={a.id} className="border-t border-stone-100">
          <td className="whitespace-nowrap p-3 text-xs text-stone-500">{formatDateTime(a.created_at)}</td>
          <td className="p-3">{a.full_name || a.username}<span className="block text-[11px] text-stone-400">{a.role}</span></td>
          <td className="p-3 text-xs"><strong>{ACTION_TEXT[a.action] || a.action}</strong> {a.detail}</td></tr>)}</tbody></table></div>}
    <p className="text-xs text-stone-500">Para deshacer un cambio, usa «Versiones anteriores».</p>
  </div>;
}
const ACTION_TEXT: Record<string, string> = {
  aporte: 'Aportó a', aprobacion_aporte: 'Aprobó el aporte', rechazo_aporte: 'Rechazó el aporte', edicion_pagina: 'Editó la página:',
  aprobacion: 'Aprobó', rechazo: 'Rechazó', eliminacion: 'Borró', restauracion: 'Restauró', edicion: 'Editó',
  envio_articulo: 'Envió artículo', envio_podcast: 'Envió podcast', envio_documento: 'Subió documento', envio_fuente: 'Agregó fuente',
  envio_evidencia: 'Subió evidencia', envio_calendario: 'Agregó fecha', perfil_capitan: 'Llenó su perfil de capitán', cambio_rol: 'Cambió rol',
  alta_usuario: 'Creó usuario', reinicio_contrasena: 'Restableció contraseña', config_grafica: 'Configuró la gráfica',
};
