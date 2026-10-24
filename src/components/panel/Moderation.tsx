import React, { useCallback, useEffect, useState } from 'react';
import { Check, X, ExternalLink, Trash2, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { PendingProposals, MyProposals } from './Proposals';
import { api, aiRun, formatDate, formatDateTime, KIND_LABEL, STATUS_LABEL, TEAM_LABEL, type CalendarEvent, type Post, type Team } from '../../lib/api';

const badge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900', approved: 'bg-emerald-100 text-emerald-900', rejected: 'bg-red-100 text-red-800',
};
export const StatusBadge = ({ status }: { status: string }) =>
  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge[status] || 'bg-stone-100'}`}>{STATUS_LABEL[status as keyof typeof STATUS_LABEL] || status}</span>;

/** Contenido detallado de un envío para que el moderador lo revise antes de aprobar. */
function PostDetail({ p }: { p: Post }) {
  const d = p.data || {};
  const links: string[] = Array.isArray(d.links) ? d.links : [];
  const refs: string[] = Array.isArray(d.references) ? d.references : [];
  return <div className="space-y-2 text-sm text-stone-700">
    {p.summary && <p className="whitespace-pre-line">{p.summary}</p>}
    {p.kind === 'articulo' && <>
      {d.keywords && <p className="text-xs"><strong>Palabras clave:</strong> {d.keywords}</p>}
      {['intro', 'body', 'conclusion'].map((k, i) => d[k] && <div key={k}><p className="mt-2 text-xs font-bold uppercase text-stone-500">{['Introducción', 'Desarrollo', 'Conclusiones'][i]}</p><p className="whitespace-pre-line">{d[k]}</p></div>)}
      {refs.length > 0 && <ol className="list-decimal pl-5 text-xs">{refs.map(r => <li key={r}>{r}</li>)}</ol>}
    </>}
    {p.kind === 'fuente' && d.apa && <p className="rounded bg-stone-50 p-2 text-xs">{d.apa}</p>}
    {p.kind === 'podcast' && <p className="text-xs">Participantes: {d.participants} {d.duration && '· ' + d.duration}</p>}
    {p.kind === 'evidencia' && <p className="text-xs">Fecha: {formatDate(d.date)} {d.participants && '· ' + d.participants}</p>}
    {[p.url, ...links.filter(l => l !== p.url)].filter(Boolean).map(l =>
      <a key={l} href={l} target="_blank" rel="noreferrer" className="flex items-center gap-1 break-all text-xs text-amber-800 underline"><ExternalLink size={12} /> {l}</a>)}
  </div>;
}


/** Texto plano de un envío para que la IA lo revise. */
function postAsText(p: Post) {
  const d = p.data || {};
  return [`Tipo: ${KIND_LABEL[p.kind]}`, `Título: ${p.title}`, p.summary && `Resumen/descripción: ${p.summary}`,
    d.keywords && `Palabras clave: ${d.keywords}`, d.intro && `Introducción: ${d.intro}`, d.body && `Desarrollo: ${d.body}`,
    d.conclusion && `Conclusiones: ${d.conclusion}`, Array.isArray(d.references) && d.references.length && `Referencias: ${d.references.join(' | ')}`,
    d.apa && `Referencia: ${d.apa}`, p.url && `Enlace: ${p.url}`, Array.isArray(d.links) && d.links.length && `Enlaces: ${d.links.join(' ')}`,
  ].filter(Boolean).join('\n');
}

function ReviewWithAi({ text, onUseNote }: { text: string; onUseNote: (n: string) => void }) {
  const [out, setOut] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const run = async () => { setBusy(true); setErr(''); try { setOut(await aiRun('revisar', text)); } catch (e: any) { setErr(e.message); } finally { setBusy(false); } };
  const note = (out.split(/Comentario para el autor:/i)[1] || '').trim();
  return <div className="space-y-2">
    <button type="button" onClick={run} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-900 disabled:opacity-50">
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Revisar con IA</button>
    {err && <p className="text-xs text-red-700">{err}</p>}
    {out && <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-3 text-xs">
      <p className="whitespace-pre-line text-stone-800">{out}</p>
      {note && <button type="button" onClick={() => onUseNote(note)} className="mt-2 underline text-violet-900">Usar como comentario para el autor</button>}
      <p className="mt-1 text-[11px] text-stone-500">Sugerencia de la IA; la decisión es tuya.</p>
    </div>}
  </div>;
}

export function ModerationPanel({ onChange }: { onChange?: () => void } = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<'pending' | 'all'>('pending');
  const [msg, setMsg] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const [p, e] = await Promise.all([api<{ posts: Post[] }>('posts?status=' + view), api<{ events: CalendarEvent[] }>('calendar?status=all')]);
      setPosts(p.posts);
      setEvents(view === 'pending' ? e.events.filter(x => x.status === 'pending') : e.events);
    } catch (err: any) { setMsg(err.message); }
    onChange?.();
  }, [view, onChange]);
  useEffect(() => { load(); }, [load]);

  const act = async (path: string, method: 'PATCH' | 'DELETE', action?: string, key?: string) => {
    if (method === 'DELETE' && !confirm('¿Eliminar definitivamente?')) return;
    try {
      await api(path, { method, body: method === 'PATCH' ? { action, note: key ? notes[key] || '' : '' } : undefined });
      setMsg(action === 'approve' ? 'Publicado.' : action === 'reject' ? 'Rechazado.' : 'Eliminado.');
      load();
    } catch (err: any) { setMsg(err.message); }
  };

  const total = posts.length + events.length;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center gap-2">
      {(['pending', 'all'] as const).map(v => <button key={v} onClick={() => setView(v)}
        className={`rounded-full px-4 py-1.5 text-sm ${view === v ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white'}`}>{v === 'pending' ? 'Por revisar' : 'Todo'}</button>)}
      <button onClick={load} className="ml-auto inline-flex items-center gap-1 text-xs text-stone-500"><RefreshCw size={13} /> Actualizar</button>
    </div>
    {msg && <p className="text-sm text-amber-800">{msg}</p>}
    {view === 'pending' && <PendingProposals onChange={onChange} />}
    {(posts.length > 0 || events.length > 0) && <p className="text-sm font-semibold text-stone-800">Envíos y fechas ({total})</p>}
    {total === 0 && <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">No hay envíos ni fechas {view === 'pending' ? 'pendientes' : ''}.</p>}
    {posts.map(p => {
      const key = 'p' + p.id;
      return <details key={key} className="group rounded-xl border border-stone-200 bg-white" open={view === 'pending' && posts.length < 4}>
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
          <span className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-bold uppercase text-stone-600">{KIND_LABEL[p.kind]}</span>
          <span className="flex-1 font-semibold">{p.title}</span><StatusBadge status={p.status} />
          <span className="w-full text-xs text-stone-500">{p.authorName} · {TEAM_LABEL[p.team as Team] || 'Sin equipo'} · {formatDateTime(p.createdAt)}</span>
        </summary>
        <div className="space-y-3 border-t border-stone-100 p-4">
          <PostDetail p={p} />
          {p.status !== 'approved' && <ReviewWithAi text={postAsText(p)} onUseNote={n => setNotes(s => ({ ...s, [key]: n }))} />}
          <Actions status={p.status} note={notes[key] || ''} setNote={n => setNotes(s => ({ ...s, [key]: n }))}
            onApprove={() => act('posts/' + p.id, 'PATCH', 'approve', key)} onReject={() => act('posts/' + p.id, 'PATCH', 'reject', key)}
            onDelete={() => act('posts/' + p.id, 'DELETE')} />
        </div>
      </details>;
    })}
    {events.map(e => {
      const key = 'e' + e.id;
      return <div key={key} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-bold uppercase text-sky-900">Calendario</span>
          <span className="flex-1 font-semibold">{formatDate(e.date)} · {e.title}</span>{e.status && <StatusBadge status={e.status} />}
          <span className="w-full text-xs text-stone-500">{e.authorName} · {TEAM_LABEL[e.team as Team] || ''}</span>
        </div>
        {e.description && <p className="text-sm text-stone-700">{e.description}</p>}
        {e.mediaUrls.map(l => <a key={l} href={l} target="_blank" rel="noreferrer" className="block break-all text-xs text-amber-800 underline">{l}</a>)}
        <Actions status={e.status || 'pending'} note={notes[key] || ''} setNote={n => setNotes(s => ({ ...s, [key]: n }))}
          onApprove={() => act('calendar/' + e.id, 'PATCH', 'approve', key)} onReject={() => act('calendar/' + e.id, 'PATCH', 'reject', key)}
          onDelete={() => act('calendar/' + e.id, 'DELETE')} />
      </div>;
    })}
  </div>;
}

function Actions({ status, note, setNote, onApprove, onReject, onDelete }: {
  status: string; note: string; setNote: (n: string) => void; onApprove: () => void; onReject: () => void; onDelete: () => void;
}) {
  return <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
    {status !== 'approved' && <input value={note} onChange={e => setNote(e.target.value)} placeholder="Comentario para el autor (opcional)"
      className="min-w-48 flex-1 rounded-lg border border-stone-300 p-2 text-xs" />}
    {status !== 'approved' && <button onClick={onApprove} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white"><Check size={14} /> Aprobar y publicar</button>}
    {status !== 'rejected' && <button onClick={onReject} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-xs"><X size={14} /> {status === 'approved' ? 'Despublicar' : 'Rechazar'}</button>}
    <button onClick={onDelete} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs text-red-700"><Trash2 size={14} /> Eliminar</button>
  </div>;
}

export function MySubmissions() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => { api<{ posts: Post[] }>('posts?mine=1').then(r => setPosts(r.posts)).catch(e => setError(e.message)); }, []);
  useEffect(() => { load(); }, [load]);
  const remove = async (id: number) => {
    if (!confirm('¿Eliminar este envío?')) return;
    try { await api('posts/' + id, { method: 'DELETE' }); load(); } catch (e: any) { setError(e.message); }
  };
  if (error) return <p className="text-sm text-red-700">{error}</p>;
  if (!posts) return <p className="text-sm text-stone-500">Cargando…</p>;
  if (!posts.length) return <div className="space-y-4"><MyProposals /><p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">Todavía no has enviado artículos, podcasts ni evidencias.</p></div>;
  return <div className="space-y-4"><MyProposals /><div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
    <table className="w-full text-left text-sm">
      <thead className="bg-stone-50 text-xs uppercase text-stone-500"><tr><th className="p-3">Tipo</th><th className="p-3">Título</th><th className="p-3">Enviado</th><th className="p-3">Estado</th><th className="p-3"></th></tr></thead>
      <tbody>{posts.map(p => <tr key={p.id} className="border-t border-stone-100 align-top">
        <td className="p-3 text-xs">{KIND_LABEL[p.kind]}</td>
        <td className="p-3">{p.title}{p.reviewNote && <p className="mt-1 text-xs text-stone-500">Comentario: {p.reviewNote}</p>}</td>
        <td className="whitespace-nowrap p-3 text-xs text-stone-500">{formatDateTime(p.createdAt)}</td>
        <td className="p-3"><StatusBadge status={p.status} /></td>
        <td className="p-3">{p.status !== 'approved' && <button onClick={() => remove(p.id)} className="text-xs text-red-700 underline">Eliminar</button>}</td>
      </tr>)}</tbody>
    </table>
  </div></div>;
}
