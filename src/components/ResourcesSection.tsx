import React, { useState } from 'react';
import { FolderOpen, BookMarked, Camera, ExternalLink } from 'lucide-react';
import { formatDate, TEAM_LABEL, usePublicPosts, type Kind, type Post, type Team } from '../lib/api';

const TABS: { kind: Kind; label: string; icon: any; empty: string }[] = [
  { kind: 'documento', label: 'Documentación', icon: FolderOpen, empty: 'El equipo de Investigación todavía no ha publicado documentos.' },
  { kind: 'fuente', label: 'Fuentes bibliográficas', icon: BookMarked, empty: 'Aún no hay fuentes registradas.' },
  { kind: 'evidencia', label: 'Evidencias', icon: Camera, empty: 'Mecánica y Logística todavía no han publicado evidencias.' },
];

/** Biblioteca pública con lo aprobado por los capitanes. Si se pasa `moduleId`, filtra por ese proyecto. */
export function ResourcesSection({ moduleId, compact }: { moduleId?: string; compact?: boolean }) {
  const all = usePublicPosts();
  const [tab, setTab] = useState<Kind>('documento');
  const posts = all.filter(p => (p.kind === 'documento' || p.kind === 'fuente' || p.kind === 'evidencia') && (!moduleId || p.moduleId === moduleId));
  if (compact && !posts.length) return null;
  const visible = posts.filter(p => p.kind === tab);

  return <section className={compact ? 'space-y-3' : 'space-y-4 border-t border-stone-200 pt-8'}>
    {!compact && <div>
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800"><FolderOpen size={15} /> Biblioteca del grupo</p>
      <h2 className="mt-2 font-display text-2xl font-bold">Documentos, fuentes y evidencias</h2>
      <p className="mt-1 text-sm text-stone-500">Material que suben los equipos y aprueban los capitanes.</p>
    </div>}
    {compact && <h3 className="text-sm font-bold text-stone-800">Material compartido por los equipos</h3>}
    <div className="flex flex-wrap gap-2">
      {TABS.map(t => <button key={t.kind} onClick={() => setTab(t.kind)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${tab === t.kind ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-600'}`}>
        <t.icon size={13} /> {t.label} ({posts.filter(p => p.kind === t.kind).length})</button>)}
    </div>
    {visible.length === 0 ? <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-400">{TABS.find(t => t.kind === tab)!.empty}</p>
      : <div className="space-y-2">{visible.map(p => <Item key={p.id} p={p} />)}</div>}
  </section>;
}

function Item({ p }: { p: Post }) {
  const links: string[] = Array.isArray(p.data?.links) ? p.data.links : [];
  const meta = [p.authorName, TEAM_LABEL[p.team as Team] && 'Equipo de ' + TEAM_LABEL[p.team as Team], p.kind === 'evidencia' && p.data?.date ? formatDate(p.data.date) : formatDate(p.publishedAt)].filter(Boolean).join(' · ');
  if (p.kind === 'fuente') return <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm">
    <p className="leading-6 text-stone-800">{p.data?.apa || p.title}</p>
    {p.summary && <p className="mt-1 text-xs text-stone-500">{p.summary}</p>}
    {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-amber-800 underline">Consultar fuente <ExternalLink size={12} /></a>}
  </div>;
  return <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-semibold text-stone-900">{p.title}</p>{p.data?.docType && <span className="text-[11px] text-stone-400">{p.data.docType}</span>}</div>
    {p.summary && <p className="mt-1 whitespace-pre-line text-stone-600">{p.summary}</p>}
    <div className="mt-2 flex flex-wrap gap-3">
      {[p.url, ...links.filter(l => l !== p.url)].filter(Boolean).map((l, i) =>
        <a key={l + i} href={l} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-amber-800 underline">{p.kind === 'evidencia' ? `Ver evidencia ${i + 1}` : 'Abrir documento'} <ExternalLink size={12} /></a>)}
    </div>
    <p className="mt-2 text-[11px] text-stone-400">{meta}</p>
  </div>;
}
