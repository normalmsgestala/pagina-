import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UploadCloud, FileText, Trash2, Download, Eye, CheckCircle2, Clock, XCircle, Loader2, Archive, Users, RefreshCw } from 'lucide-react';
import { api, formatDateTime, type User } from '../../lib/api';

export type RepoStatus = 'pendiente' | 'acomodado' | 'descartado';
export interface RepoFile {
  id: string; userId: number; username: string; fullName: string; team: string; name: string; mime: string;
  size: number; note: string; status: RepoStatus; adminNote: string; createdAt: string; updatedAt: string | null;
}
interface Person { id: number; name: string; username: string; role: string; files: number; bytes: number; pending: number; organized: number; last: string | null }
interface Progress {
  totals: { people: number; withFiles: number; files: number; bytes: number; pending: number; organized: number; storage: 'r2' | 'd1'; maxFile: number; d1Limit: number };
  me: { files: number; bytes: number; pending: number; organized: number };
  people?: Person[];
}
interface QueueItem { key: string; file: File; loaded: number; state: 'esperando' | 'subiendo' | 'listo' | 'error'; error?: string }

export const fmtBytes = (n: number) => n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`;

const STATUS: Record<RepoStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  pendiente: { label: 'Por acomodar', cls: 'bg-amber-100 text-amber-900', icon: <Clock size={13} /> },
  acomodado: { label: 'Acomodado en la página', cls: 'bg-emerald-100 text-emerald-900', icon: <CheckCircle2 size={13} /> },
  descartado: { label: 'No se usará', cls: 'bg-stone-200 text-stone-700', icon: <XCircle size={13} /> },
};
const StatusChip = ({ s }: { s: RepoStatus }) =>
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS[s].cls}`}>{STATUS[s].icon}{STATUS[s].label}</span>;

function Bar({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return <div>
    {label && <div className="mb-1 flex justify-between text-xs text-stone-600"><span>{label}</span><span className="font-semibold">{pct}%</span></div>}
    <div className="h-2.5 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full bg-[#C85A32] transition-all" style={{ width: pct + '%' }} /></div>
  </div>;
}

/** Sube un archivo con XMLHttpRequest para poder mostrar el avance real. */
function uploadFile(file: File, note: string, onProgress: (loaded: number) => void): Promise<RepoFile> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/repo/upload');
    xhr.withCredentials = true;
    xhr.setRequestHeader('content-type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('x-file-name', encodeURIComponent(file.name));
    xhr.setRequestHeader('x-file-note', encodeURIComponent(note));
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(e.loaded); };
    xhr.onload = () => {
      let data: any = {};
      try { data = JSON.parse(xhr.responseText); } catch { /* respuesta sin JSON */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data.file);
      else reject(new Error(data.error || `No se pudo subir (error ${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Se cortó la conexión. Vuelve a intentarlo.'));
    xhr.send(file);
  });
}

function FileRow({ f, me, onChanged, showOwner }: { f: RepoFile; me: User; onChanged: () => void; showOwner?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const isAdmin = me.role === 'admin';
  const canDelete = isAdmin || (f.userId === me.id && f.status === 'pendiente');
  const preview = /^(application\/pdf|image\/(png|jpe?g|gif|webp)|text\/plain|video\/mp4|audio\/)/.test(f.mime);
  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true); setMsg('');
    try { await fn(); onChanged(); } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
  };
  return <li className="flex flex-wrap items-start gap-3 rounded-xl border border-stone-200 bg-white p-3">
    <FileText className="mt-0.5 shrink-0 text-stone-400" size={20} />
    <div className="min-w-0 flex-1">
      <p className="break-all text-sm font-semibold text-stone-900">{f.name}</p>
      <p className="mt-0.5 text-xs text-stone-500">
        {showOwner && <><span className="font-semibold text-stone-700">{f.fullName}</span> · </>}
        {fmtBytes(f.size)} · {formatDateTime(f.createdAt)}
      </p>
      {f.note && <p className="mt-1 text-xs text-stone-700">“{f.note}”</p>}
      {f.adminNote && <p className="mt-1 text-xs text-emerald-800">Nota del administrador: {f.adminNote}</p>}
      {msg && <p className="mt-1 text-xs text-red-700">{msg}</p>}
    </div>
    <div className="flex flex-wrap items-center gap-1.5">
      <StatusChip s={f.status} />
      {preview && <a href={`/api/repo/files/${f.id}/download?ver=1`} target="_blank" rel="noopener" className="rounded-full p-1.5 text-stone-600 hover:bg-stone-100" title="Ver"><Eye size={16} /></a>}
      <a href={`/api/repo/files/${f.id}/download`} className="rounded-full p-1.5 text-stone-600 hover:bg-stone-100" title="Descargar"><Download size={16} /></a>
      {isAdmin && <select disabled={busy} value={f.status} aria-label="Estado"
        onChange={e => act(() => api('repo/files/' + f.id, { method: 'PATCH', body: { status: e.target.value } }))}
        className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs">
        <option value="pendiente">Por acomodar</option><option value="acomodado">Acomodado</option><option value="descartado">No se usará</option>
      </select>}
      {canDelete && <button disabled={busy} title="Borrar" className="rounded-full p-1.5 text-red-700 hover:bg-red-50"
        onClick={() => { if (window.confirm(`¿Borrar «${f.name}»? No se puede recuperar.`)) act(() => api('repo/files/' + f.id, { method: 'DELETE' })); }}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}</button>}
    </div>
  </li>;
}

export function RepoPanel({ user }: { user: User }) {
  const canSeeAll = user.role === 'admin' || user.role === 'capitan' || user.role === 'maestro';
  const isAdmin = user.role === 'admin';
  const [progress, setProgress] = useState<Progress | null>(null);
  const [mine, setMine] = useState<RepoFile[]>([]);
  const [all, setAll] = useState<RepoFile[]>([]);
  const [filter, setFilter] = useState<{ user: number; status: string }>({ user: 0, status: 'pendiente' });
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [note, setNote] = useState('');
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const running = useRef(false);

  const load = useCallback(async () => {
    try {
      const [p, m] = await Promise.all([api<Progress>('repo/progress'), api<{ files: RepoFile[] }>('repo/files?mine=1')]);
      setProgress(p); setMine(m.files);
      if (canSeeAll) {
        const q = new URLSearchParams();
        if (filter.user) q.set('user', String(filter.user));
        if (filter.status) q.set('status', filter.status);
        setAll((await api<{ files: RepoFile[] }>('repo/files?' + q)).files);
      }
      setErr('');
    } catch (e: any) { setErr(e.message); }
  }, [canSeeAll, filter]);
  useEffect(() => { load(); }, [load]);

  const add = (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setQueue(q => [...q, ...list.map(f => ({ key: f.name + f.size + Math.random(), file: f, loaded: 0, state: 'esperando' as const }))]);
  };

  // sube la cola de uno en uno
  useEffect(() => {
    if (running.current) return;
    const next = queue.find(q => q.state === 'esperando');
    if (!next) return;
    running.current = true;
    const max = progress?.totals.maxFile || 20 * 1048576;
    const patch = (k: string, v: Partial<QueueItem>) => setQueue(q => q.map(x => x.key === k ? { ...x, ...v } : x));
    if (next.file.size > max) {
      patch(next.key, { state: 'error', error: `Pasa de ${fmtBytes(max)}. Comprímelo o súbelo a Drive y pega el enlace en la nota.` });
      running.current = false;
      return;
    }
    patch(next.key, { state: 'subiendo' });
    uploadFile(next.file, note, loaded => patch(next.key, { loaded }))
      .then(() => { patch(next.key, { state: 'listo', loaded: next.file.size }); load(); })
      .catch((e: Error) => patch(next.key, { state: 'error', error: e.message }))
      .finally(() => { running.current = false; setQueue(q => [...q]); });
  }, [queue, note, progress, load]);

  const totalQ = queue.reduce((n, q) => n + q.file.size, 0);
  const doneQ = queue.reduce((n, q) => n + (q.state === 'listo' ? q.file.size : q.state === 'subiendo' ? q.loaded : 0), 0);
  const uploading = queue.some(q => q.state === 'esperando' || q.state === 'subiendo');
  const t = progress?.totals;

  return <div className="space-y-8">
    <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="font-serif text-2xl">Subir a repositorio</h2>
      <p className="mt-1 text-sm text-stone-600">Deja aquí todo lo que tengas para la página: documentos, PDF, HTML, presentaciones, imágenes, videos cortos o cualquier otro archivo. <b>No tienes que acomodarlo</b>: el administrador lo revisa y lo coloca en su lugar.</p>
      <label className="mt-4 block text-sm font-semibold text-stone-800">Nota para quien lo va a acomodar (opcional)
        <input value={note} onChange={e => setNote(e.target.value)} maxLength={500}
          placeholder="Ej.: evidencias de la práctica 3 del módulo de mecánica, van en el calendario del 14 de noviembre"
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm font-normal" />
      </label>
      <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        onClick={() => input.current?.click()} role="button" tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') input.current?.click(); }}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${drag ? 'border-[#C85A32] bg-orange-50' : 'border-stone-300 bg-stone-50 hover:border-stone-400'}`}>
        <UploadCloud size={36} className="text-[#C85A32]" />
        <p className="font-semibold text-stone-800">Arrastra tus archivos aquí o toca para elegirlos</p>
        <p className="text-xs text-stone-500">Puedes elegir varios a la vez · hasta {t ? fmtBytes(t.maxFile) : '20 MB'} cada uno</p>
        <input ref={input} type="file" multiple className="hidden" onChange={e => { if (e.target.files) add(e.target.files); e.target.value = ''; }} />
      </div>

      {queue.length > 0 && <div className="mt-5 space-y-3">
        <Bar value={totalQ ? doneQ / totalQ : 0} label={uploading ? `Subiendo ${queue.filter(q => q.state === 'listo').length} de ${queue.length} archivos` : `Listo: ${queue.filter(q => q.state === 'listo').length} de ${queue.length} archivos subidos`} />
        <ul className="space-y-2">
          {queue.map(q => <li key={q.key} className="rounded-xl border border-stone-200 p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium">{q.file.name}</span>
              <span className={`shrink-0 text-xs font-semibold ${q.state === 'error' ? 'text-red-700' : q.state === 'listo' ? 'text-emerald-700' : 'text-stone-500'}`}>
                {q.state === 'listo' ? 'Subido ✓' : q.state === 'error' ? 'No se subió' : q.state === 'subiendo' ? `${fmtBytes(q.loaded)} de ${fmtBytes(q.file.size)}` : 'En espera'}</span>
            </div>
            {q.state !== 'error' && <div className="mt-2"><Bar value={q.file.size ? q.loaded / q.file.size : 1} /></div>}
            {q.error && <p className="mt-1 text-xs text-red-700">{q.error}</p>}
          </li>)}
        </ul>
        {!uploading && <button onClick={() => setQueue([])} className="text-xs font-semibold text-stone-600 underline">Limpiar la lista</button>}
      </div>}
      {err && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{err}</p>}
    </section>

    {progress && <section className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Tu avance</p>
        <p className="mt-2 text-3xl font-bold text-stone-900">{progress.me.files} <span className="text-base font-normal text-stone-600">archivo(s) · {fmtBytes(progress.me.bytes)}</span></p>
        <div className="mt-3"><Bar value={progress.me.files ? progress.me.organized / progress.me.files : 0} label={`${progress.me.organized} ya acomodados en la página`} /></div>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Avance del grupo</p>
        <p className="mt-2 text-3xl font-bold text-stone-900">{t!.withFiles} <span className="text-base font-normal text-stone-600">de {t!.people} compañeros ya subieron</span></p>
        <div className="mt-3"><Bar value={t!.people ? t!.withFiles / t!.people : 0} label={`${t!.files} archivos · ${t!.pending} por acomodar`} /></div>
      </div>
    </section>}

    <section>
      <div className="mb-3 flex items-center justify-between"><h3 className="font-serif text-xl">Lo que has subido</h3>
        <button onClick={load} className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600"><RefreshCw size={13} /> Actualizar</button></div>
      {mine.length === 0 ? <p className="text-sm text-stone-500">Todavía no subes archivos.</p>
        : <ul className="space-y-2">{mine.map(f => <FileRow key={f.id} f={f} me={user} onChanged={load} />)}</ul>}
    </section>

    {canSeeAll && progress?.people && <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="flex items-center gap-2 font-serif text-xl"><Users size={20} /> Avance por compañero</h3>
        {isAdmin && <a href="/api/repo/export?status=pendiente" className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
          <Archive size={16} /> Descargar lo pendiente en ZIP</a>}
      </div>
      {t!.storage === 'd1' && isAdmin && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
        Los archivos se guardan en la base de datos (D1): máximo 20 MB por archivo y 350 MB en total; van {fmtBytes(t!.bytes)}.
        Para más espacio (10 GB gratis y archivos de hasta 95 MB) conecta una cubeta R2 con el nombre de enlace <code>REPO</code> en Cloudflare Pages.</p>}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
            <tr><th className="px-4 py-2">Compañero</th><th className="px-3 py-2">Archivos</th><th className="px-3 py-2">Tamaño</th><th className="px-3 py-2">Por acomodar</th><th className="px-3 py-2">Acomodados</th><th className="px-3 py-2">Último</th></tr>
          </thead>
          <tbody>{progress.people.map(p => <tr key={p.id} className="cursor-pointer border-t border-stone-100 hover:bg-stone-50"
            onClick={() => setFilter({ user: p.id, status: '' })}>
            <td className="px-4 py-2 font-medium">{p.name}</td>
            <td className="px-3 py-2">{p.files || <span className="text-red-700">0</span>}</td>
            <td className="px-3 py-2">{p.files ? fmtBytes(p.bytes) : '—'}</td>
            <td className="px-3 py-2">{p.pending}</td>
            <td className="px-3 py-2">{p.organized}</td>
            <td className="px-3 py-2 text-xs text-stone-500">{p.last ? formatDateTime(p.last) : '—'}</td>
          </tr>)}</tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h3 className="mr-2 font-serif text-xl">Todos los archivos</h3>
        <select value={filter.user} onChange={e => setFilter(f => ({ ...f, user: Number(e.target.value) }))} className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm">
          <option value={0}>Todos los compañeros</option>
          {progress.people.filter(p => p.files).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm">
          <option value="">Cualquier estado</option><option value="pendiente">Por acomodar</option><option value="acomodado">Acomodados</option><option value="descartado">No se usarán</option>
        </select>
        <span className="text-xs text-stone-500">{all.length} archivo(s)</span>
      </div>
      {all.length === 0 ? <p className="text-sm text-stone-500">No hay archivos con ese filtro.</p>
        : <ul className="space-y-2">{all.map(f => <FileRow key={f.id} f={f} me={user} onChanged={load} showOwner />)}</ul>}
    </section>}
  </div>;
}
