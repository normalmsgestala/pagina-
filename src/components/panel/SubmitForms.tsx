import React, { useState } from 'react';
import { FileText, Mic, FolderOpen, BookMarked, Camera, CalendarPlus, Send, CheckCircle2 } from 'lucide-react';
import { INITIAL_CURRICULUM } from '../../data/defaultCurriculum';
import { api, apaReference, CONSISTENCY_NOTE, isMod, KINDS_BY_TEAM, CALENDAR_TEAMS, KIND_LABEL, type AiTask, type Kind, type Role, type Team, type User } from '../../lib/api';
import { AiAssist } from './AiAssist';
import { ArticleForm } from './ArticleForm';

type FormKind = Kind | 'calendario';
const ICONS: Record<FormKind, any> = { articulo: FileText, podcast: Mic, documento: FolderOpen, fuente: BookMarked, evidencia: Camera, calendario: CalendarPlus };
const HINTS: Record<FormKind, string> = {
  articulo: 'Texto con resumen, desarrollo por secciones y referencias.',
  podcast: 'Episodio publicado en YouTube, Spotify u otra plataforma.',
  documento: 'Documentación del proyecto en Drive, OneDrive, etc.',
  fuente: 'Libro, artículo, sitio web o video consultado (formato APA).',
  evidencia: 'Fotos, videos o archivos que muestran el trabajo realizado.',
  calendario: 'Fecha, actividad realizada o próxima, con fotos o videos.',
};
const AI_FIELDS: Record<FormKind, { id: string; label: string }[]> = {
  articulo: [{ id: 'summary', label: 'Resumen' }, { id: 'intro', label: 'Introducción' }, { id: 'body', label: 'Desarrollo' },
    { id: 'conclusion', label: 'Conclusiones' }, { id: 'references', label: 'Referencias' }, { id: 'keywords', label: 'Palabras clave' }],
  podcast: [{ id: 'summary', label: 'Descripción' }, { id: 'sources', label: 'Fuentes consultadas' }],
  documento: [{ id: 'summary', label: 'Descripción' }],
  fuente: [{ id: '_ref', label: 'Datos de la fuente' }, { id: 'summary', label: '¿Para qué sirve?' }],
  evidencia: [{ id: 'summary', label: '¿Qué se hizo?' }],
  calendario: [{ id: 'description', label: 'Descripción' }],
};
const AI_FORM_TASKS: Record<FormKind, AiTask[]> = {
  articulo: ['corregir', 'mejorar', 'resumir', 'palabras_clave', 'sugerencias'],
  podcast: ['corregir', 'mejorar', 'sugerencias'], documento: ['corregir', 'mejorar'],
  fuente: ['apa', 'corregir'], evidencia: ['corregir', 'mejorar'], calendario: ['corregir', 'mejorar'],
};

const MODULES = (INITIAL_CURRICULUM[0]?.modules || []).map(m => ({ id: m.id, title: m.title }));

export function availableForms(role: Role, team: Team | ''): FormKind[] {
  if (isMod(role)) return ['articulo', 'podcast', 'documento', 'fuente', 'evidencia', 'calendario'];
  if (role !== 'editor' || !team) return [];
  return [...KINDS_BY_TEAM[team], ...(CALENDAR_TEAMS.includes(team) ? ['calendario' as const] : [])];
}

const input = 'mt-1 w-full rounded-lg border border-stone-300 bg-white p-2.5 text-sm font-normal text-stone-900 focus:border-amber-600 focus:outline-none';
const labelCls = 'block text-xs font-semibold text-stone-700';

function Field({ label, hint, children, wide }: { label: string; hint?: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={labelCls + (wide ? ' sm:col-span-2' : '')}>{label}{children}{hint && <span className="mt-1 block text-[11px] font-normal text-stone-400">{hint}</span>}</label>;
}

export function SubmitPanel({ user, team }: { user: User; team: Team | '' }) {
  const forms = availableForms(user.role, team);
  const [active, setActive] = useState<FormKind | null>(null);
  const [done, setDone] = useState<{ kind: FormKind; status: string } | null>(null);

  if (!forms.length) return <p className="text-sm text-stone-500">Tu cuenta no tiene opciones de publicación.</p>;

  return <div className="space-y-6">
    {done && <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      <div><strong>{done.kind === 'calendario' ? 'Fecha enviada.' : KIND_LABEL[done.kind as Kind] + ' enviado.'}</strong>{' '}
        {done.status === 'approved' ? 'Ya está publicado en la página.' : done.kind === 'articulo' ? 'Cumplió el instrumento de arbitraje; un capitán lo revisará antes de publicarlo.' : 'Un capitán lo revisará antes de publicarlo. Puedes ver su estado en "Mis envíos".'}</div>
    </div>}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {forms.map(k => {
        const Icon = ICONS[k];
        return <button key={k} onClick={() => { setActive(k); setDone(null); }}
          className={`rounded-2xl border p-4 text-left transition ${active === k ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600' : 'border-stone-200 bg-white hover:border-stone-400'}`}>
          <Icon size={20} className="text-amber-800" />
          <p className="mt-3 font-semibold text-stone-900">{k === 'calendario' ? 'Fecha en el calendario' : KIND_LABEL[k]}</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">{HINTS[k]}</p>
        </button>;
      })}
    </div>
    {active === 'articulo' && <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"><h3 className="mb-4 font-serif text-2xl">Nuevo artículo</h3>
      <ArticleForm key="articulo" user={user} onDone={status => { setDone({ kind: 'articulo', status }); setActive(null); }} /></div>}
    {active && active !== 'articulo' && <FormFor key={active} kind={active} user={user} onDone={status => { setDone({ kind: active, status }); setActive(null); }} />}
  </div>;
}

function FormFor({ kind, user, onDone }: { kind: FormKind; user: User; onDone: (status: string) => void }) {
  const [f, setF] = useState<Record<string, string>>({ authors: kind === 'articulo' ? user.fullName : '', sourceType: 'libro' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
  const v = (k: string) => f[k] || '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      let r: { status: string };
      if (kind === 'calendario') {
        r = await api('calendar', { body: { date: v('date'), title: v('title'), description: v('description'), mediaUrls: v('links') } });
      } else {
        const lines = (s: string) => s.split('\n').map(x => x.trim()).filter(Boolean);
        const data: Record<string, unknown> = { ...f };
        delete data.title; delete data.summary; delete data.url; delete data.moduleId;
        if (kind === 'evidencia') data.links = lines(v('links'));
        if (kind === 'articulo') data.references = lines(v('references'));
        if (kind === 'fuente') data.apa = apaReference(f, v('title'), v('url'));
        r = await api('posts', { body: { kind, title: v('title'), summary: v('summary'), url: v('url') || (kind === 'evidencia' ? lines(v('links'))[0] || '' : ''), moduleId: v('moduleId'), data } });
      }
      onDone(r.status);
    } catch (err: any) { setError(err.message || 'No se pudo enviar'); }
    finally { setBusy(false); }
  };

  const moduleSelect = <Field label="Proyecto relacionado (opcional)">
    <select value={v('moduleId')} onChange={set('moduleId')} className={input}>
      <option value="">— General —</option>
      {MODULES.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
    </select>
  </Field>;

  return <form onSubmit={submit} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
    <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">{CONSISTENCY_NOTE.replace('La IA junta tu aporte con el contenido existente sin agregar información nueva, y un capitán', 'Un capitán')}</p>
    <h3 className="font-serif text-2xl">{kind === 'calendario' ? 'Nueva fecha en el calendario' : 'Nuevo ' + KIND_LABEL[kind as Kind].toLowerCase()}</h3>

    {kind === 'podcast' && <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Título del episodio *" wide><input required maxLength={300} value={v('title')} onChange={set('title')} className={input} /></Field>
      <Field label="Enlace del episodio *" hint="YouTube se mostrará con reproductor integrado." wide><input required type="url" value={v('url')} onChange={set('url')} className={input} placeholder="https://youtu.be/..." /></Field>
      <Field label="Sección o tema"><input value={v('section')} onChange={set('section')} className={input} placeholder="Ej. Tecnologías emergentes" /></Field>
      <Field label="Duración aproximada"><input value={v('duration')} onChange={set('duration')} className={input} placeholder="Ej. 15 min" /></Field>
      <Field label="Participantes *" wide><input required value={v('participants')} onChange={set('participants')} className={input} placeholder="Nombres de quienes participan" /></Field>
      <Field label="Descripción *" hint="Propósito del episodio y de qué se habla." wide><textarea required rows={4} value={v('summary')} onChange={set('summary')} className={input} /></Field>
      <Field label="Fuentes consultadas (opcional)" wide><textarea rows={3} value={v('sources')} onChange={set('sources')} className={input} /></Field>
    </div>}

    {kind === 'documento' && <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Título del documento *" wide><input required maxLength={300} value={v('title')} onChange={set('title')} className={input} /></Field>
      <Field label="Enlace al documento *" hint="Revisa que el enlace sea público o compartido con la escuela." wide><input required type="url" value={v('url')} onChange={set('url')} className={input} placeholder="https://drive.google.com/..." /></Field>
      <Field label="Tipo"><select value={v('docType')} onChange={set('docType')} className={input}>
        <option value="">Selecciona…</option><option>Reporte</option><option>Guía o manual</option><option>Presentación</option>
        <option>Hoja de datos</option><option>Planeación didáctica</option><option>Otro</option></select></Field>
      {moduleSelect}
      <Field label="Descripción *" wide><textarea required rows={3} value={v('summary')} onChange={set('summary')} className={input} /></Field>
    </div>}

    {kind === 'fuente' && <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Tipo de fuente *"><select value={v('sourceType')} onChange={set('sourceType')} className={input}>
        <option value="libro">Libro</option><option value="revista">Artículo de revista</option><option value="web">Página web</option>
        <option value="video">Video</option><option value="tesis">Tesis</option></select></Field>
      <Field label="Año *"><input required value={v('year')} onChange={set('year')} className={input} placeholder="2024" /></Field>
      <Field label="Autor(es) *" hint="Formato: Apellido, A. B., & Apellido, C." wide><input required value={v('authors')} onChange={set('authors')} className={input} /></Field>
      <Field label="Título *" wide><input required maxLength={300} value={v('title')} onChange={set('title')} className={input} /></Field>
      <Field label={v('sourceType') === 'revista' ? 'Nombre de la revista *' : v('sourceType') === 'web' ? 'Sitio web' : v('sourceType') === 'tesis' ? 'Institución *' : v('sourceType') === 'video' ? 'Canal o plataforma *' : 'Editorial *'}>
        <input required={v('sourceType') !== 'web'} value={v('source')} onChange={set('source')} className={input} /></Field>
      {v('sourceType') === 'revista' && <><Field label="Volumen (número)"><input value={v('volume')} onChange={set('volume')} className={input} placeholder="21(1)" /></Field>
        <Field label="Páginas"><input value={v('pages')} onChange={set('pages')} className={input} placeholder="7–43" /></Field></>}
      <Field label="Enlace o DOI"><input type="url" value={v('url')} onChange={set('url')} className={input} placeholder="https://doi.org/..." /></Field>
      {moduleSelect}
      <Field label="¿Para qué sirve esta fuente? (opcional)" wide><textarea rows={2} value={v('summary')} onChange={set('summary')} className={input} /></Field>
      {v('title') && <div className="rounded-lg bg-stone-50 p-3 text-xs text-stone-600 sm:col-span-2"><strong className="block text-stone-800">Vista previa APA:</strong>{apaReference(f, v('title'), v('url'))}</div>}
    </div>}

    {kind === 'evidencia' && <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Título de la evidencia *" wide><input required maxLength={300} value={v('title')} onChange={set('title')} className={input} placeholder="Ej. Armado de la estructura del barco" /></Field>
      <Field label="Fecha de la actividad *"><input required type="date" value={v('date')} onChange={set('date')} className={input} /></Field>
      {moduleSelect}
      <Field label="Enlaces de fotos, videos o archivos *" hint="Uno por línea. Pueden ser carpetas de Drive." wide><textarea required rows={3} value={v('links')} onChange={set('links')} className={input} placeholder="https://..." /></Field>
      <Field label="¿Qué se hizo? *" wide><textarea required rows={4} value={v('summary')} onChange={set('summary')} className={input} /></Field>
      <Field label="Participantes" wide><input value={v('participants')} onChange={set('participants')} className={input} /></Field>
    </div>}

    {kind === 'calendario' && <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Fecha *"><input required type="date" value={v('date')} onChange={set('date')} className={input} /></Field>
      <Field label="Nombre de la actividad *"><input required maxLength={200} value={v('title')} onChange={set('title')} className={input} placeholder="Ej. Presentación del proyecto" /></Field>
      <Field label="Descripción" wide><textarea rows={3} value={v('description')} onChange={set('description')} className={input} /></Field>
      <Field label="Enlaces de fotos o videos" hint="Uno por línea." wide><textarea rows={3} value={v('links')} onChange={set('links')} className={input} placeholder="https://..." /></Field>
    </div>}

    <AiAssist tasks={AI_FORM_TASKS[kind]} fields={AI_FIELDS[kind]}
      hint="Te ayuda solo con tu propio texto: corrige, mejora y sugiere. Tú decides qué usar."
      getText={id => id === '_ref' ? [v('authors'), v('year') && '(' + v('year') + ')', v('title'), v('source'), v('volume'), v('pages'), v('url')].filter(Boolean).join('. ')
        : id === 'summary' && kind === 'articulo' ? [v('summary'), v('intro'), v('body'), v('conclusion')].filter(Boolean).join('\n\n') : v(id)}
      targetFor={(task, id) => task === 'palabras_clave' ? 'keywords' : task === 'resumir' ? 'summary' : id === '_ref' ? 'summary' : id}
      onApply={(id, value) => setF(p => ({ ...p, [id]: value }))} />

    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="flex flex-wrap items-center gap-3">
      <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-50">
        <Send size={15} /> {busy ? 'Enviando…' : user.role === 'admin' || user.role === 'capitan' ? 'Publicar' : 'Enviar a revisión'}</button>
      <span className="text-xs text-stone-500">Los campos con * son obligatorios.</span>
    </div>
  </form>;
}
