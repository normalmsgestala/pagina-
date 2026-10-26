import React, { useMemo, useState } from 'react';
import { ClipboardCheck, Send, Loader2, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { api, type User } from '../../lib/api';
import { ARTICLE_PARTS, LIMITS, PASS, RUBRIC, SCALE, articleBody, type ArticleEvaluation } from '../../lib/articleRubric';
import { AiAssist } from './AiAssist';

const input = 'mt-1 w-full rounded-lg border border-stone-300 bg-white p-2.5 text-sm font-normal text-stone-900 focus:border-amber-600 focus:outline-none';
const AREAS = ['Investigación educativa', 'Didáctica de la física', 'Formación docente', 'Tecnologías y pedagogías emergentes', 'Evaluación del aprendizaje', 'Educación socioemocional'];
const countWords = (s: string) => (s.trim().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;

export interface ArticleDraft { id?: number; title: string; summary: string; url: string; moduleId: string; data: Record<string, any> }

/** Calificación del instrumento de arbitraje: lo que falta, los 11 criterios y el dictamen. */
export function EvaluationView({ e, compact }: { e: ArticleEvaluation; compact?: boolean }) {
  const color = e.passed ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-red-300 bg-red-50 text-red-900';
  return <div className="space-y-4">
    <div className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 ${color}`}>
      <div className="text-center"><p className="font-display text-4xl font-bold leading-none">{e.grade}</p><p className="text-[11px] font-semibold uppercase">de 10</p></div>
      <div className="flex-1 text-sm">
        <p className="flex items-center gap-1.5 font-semibold">{e.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {e.passed ? 'Cumple el instrumento de arbitraje' : 'Se devuelve para corregir'}</p>
        <p className="mt-0.5">Dictamen: <strong>{e.dictamen}</strong> · {e.total}/55 puntos · {e.bodyWords.toLocaleString('es-MX')} palabras en el cuerpo</p>
        {!e.ai && <p className="mt-1 text-xs">La calificación de fondo la dará el capitán (la IA no estaba disponible).</p>}
        {!e.passed && <p className="mt-1 text-xs">Para pasar a revisión: nada pendiente en «Lo que falta», calificación de {PASS.minGrade} o más y ningún criterio debajo de «{SCALE[PASS.minCriterion]}». Lo ideal es 10.</p>}
      </div>
    </div>

    {e.missing.length > 0 && <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-amber-950"><AlertTriangle size={16} /> Lo que falta ({e.missing.length})</p>
      <ol className="mt-3 space-y-3">{e.missing.map((m, i) => <li key={i} className="text-sm">
        <p className="font-semibold text-stone-900">{i + 1}. {m.campo}: <span className="font-normal text-stone-700">{m.problema}</span></p>
        <p className="mt-0.5 text-stone-700"><span className="font-semibold text-emerald-800">Cómo hacerlo:</span> {m.como}</p></li>)}</ol>
    </div>}

    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500"><tr><th className="p-3">Criterio</th><th className="p-3 text-center">1–5</th>{!compact && <th className="p-3">Observaciones y cómo mejorar</th>}</tr></thead>
        <tbody>{(['fondo', 'forma'] as const).map(g => <React.Fragment key={g}>
          <tr className="bg-stone-50/60"><td colSpan={3} className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500">Evaluación de {g === 'fondo' ? 'fondo (contenido científico)' : 'forma (aspectos formales)'}</td></tr>
          {RUBRIC.filter(c => c.grupo === g).map(c => { const r = e.criterios[c.id]; const low = r.puntaje < 5; return <tr key={c.id} className="border-t border-stone-100 align-top">
            <td className="p-3"><p className="font-semibold text-stone-900">{c.nombre}</p><p className="text-xs text-stone-500">{c.desc}</p></td>
            <td className="p-3 text-center"><span className={`inline-block min-w-8 rounded-full px-2 py-0.5 text-sm font-bold ${r.puntaje >= 5 ? 'bg-emerald-100 text-emerald-900' : r.puntaje >= 4 ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-800'}`}>{r.puntaje}</span><p className="mt-1 text-[10px] text-stone-500">{SCALE[r.puntaje]}</p></td>
            {!compact && <td className="p-3 text-xs text-stone-700"><p>{r.observacion}</p>{low && r.como && <p className="mt-1"><span className="font-semibold text-emerald-800">Cómo mejorar:</span> {r.como}</p>}</td>}
          </tr>; })}
        </React.Fragment>)}</tbody>
      </table>
    </div>
    {!compact && (e.plagio || e.etica || e.areas) && <div className="grid gap-3 text-sm sm:grid-cols-2">
      {e.plagio && <div className="rounded-xl border border-stone-200 bg-white p-3"><p className="text-[11px] font-bold uppercase text-stone-500">¿Indicios de plagio o autoplagio?</p><p className="mt-1 text-stone-700">{e.plagio}</p></div>}
      {e.etica && <div className="rounded-xl border border-stone-200 bg-white p-3"><p className="text-[11px] font-bold uppercase text-stone-500">¿Manejo ético de datos y participantes?</p><p className="mt-1 text-stone-700">{e.etica}</p></div>}
      {e.areas && <div className="rounded-xl border border-stone-200 bg-white p-3 sm:col-span-2"><p className="text-[11px] font-bold uppercase text-stone-500">Áreas de oportunidad</p><p className="mt-1 whitespace-pre-line text-stone-700">{e.areas}</p></div>}
    </div>}
  </div>;
}

/** Formulario del artículo con todos los apartados que pide el instrumento de arbitraje. */
export function ArticleForm({ user, initial, onDone }: { user: User; initial?: ArticleDraft; onDone: (status: string, e?: ArticleEvaluation) => void }) {
  const [t, setT] = useState({ title: initial?.title || '', summary: initial?.summary || '', url: initial?.url || '', moduleId: initial?.moduleId || '' });
  const [d, setD] = useState<Record<string, string>>(() => {
    const src = initial?.data || {};
    const out: Record<string, string> = { authors: user.fullName };
    for (const [k, v] of Object.entries(src)) out[k] = Array.isArray(v) ? v.join('\n') : String(v ?? '');
    return out;
  });
  const [evaluation, setEvaluation] = useState<ArticleEvaluation | null>(null);
  const [busy, setBusy] = useState<'' | 'check' | 'send'>('');
  const [error, setError] = useState('');
  const sd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setD(p => ({ ...p, [k]: e.target.value }));
  const st = (k: keyof typeof t) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setT(p => ({ ...p, [k]: e.target.value }));
  const bodyWords = useMemo(() => countWords(articleBody(d)), [d]);

  const payload = () => {
    const split = (s: string) => (s || '').split('\n').map(x => x.trim()).filter(Boolean);
    const data: Record<string, unknown> = { ...d, references: split(d.references), figures: split(d.figures) };
    return { kind: 'articulo', title: t.title.trim(), summary: t.summary.trim(), url: t.url.trim(), moduleId: t.moduleId, data };
  };
  const check = async () => {
    setBusy('check'); setError('');
    try { setEvaluation((await api<{ evaluation: ArticleEvaluation }>('articles/check', { body: payload() })).evaluation); window.scrollTo?.({ top: 0, behavior: 'smooth' }); }
    catch (e: any) { setError(e.message); } finally { setBusy(''); }
  };
  const send = async (ev: React.FormEvent) => {
    ev.preventDefault(); setBusy('send'); setError('');
    try {
      const r = initial?.id
        ? await api<{ status: string; evaluation: ArticleEvaluation }>('posts/' + initial.id, { method: 'PATCH', body: payload() })
        : await api<{ status: string; evaluation: ArticleEvaluation }>('posts', { body: payload() });
      if (r.status === 'rejected') { setEvaluation(r.evaluation); setError('Tu artículo se devolvió: revisa abajo qué falta y cómo hacerlo, corrige y vuelve a enviar.'); }
      else onDone(r.status, r.evaluation);
    } catch (e: any) { setError(e.message); } finally { setBusy(''); }
  };

  const W = ({ k, min }: { k: string; min: number }) => { const n = countWords(d[k] || ''); return <span className={`ml-1 font-normal ${n >= min ? 'text-emerald-700' : 'text-stone-400'}`}>({n}/{min}+ palabras)</span>; };

  return <form onSubmit={send} className="space-y-6">
    {evaluation && <EvaluationView e={evaluation} />}
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

    <div className="flex gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-950"><Info size={18} className="mt-0.5 shrink-0" />
      <p>Tu artículo se califica con el <strong>instrumento de arbitraje de la Revista PRISMA</strong> (11 criterios de fondo y forma). Si falta algo o la calificación es menor a {PASS.minGrade}, se te devuelve con lo que falta y cómo hacerlo. Usa «Revisar con la rúbrica» las veces que necesites antes de enviar; la meta es 10.</p></div>

    <fieldset className="grid gap-4 rounded-2xl border border-stone-200 p-4 sm:grid-cols-2">
      <legend className="px-2 text-sm font-bold text-stone-800">Datos generales</legend>
      <label className="text-xs font-semibold text-stone-700 sm:col-span-2">Título del artículo *<input required maxLength={300} value={t.title} onChange={st('title')} className={input} placeholder="Claro y específico: tema, población y contexto" /></label>
      <label className="text-xs font-semibold text-stone-700">Autor(es) *<input required value={d.authors || ''} onChange={sd('authors')} className={input} /></label>
      <label className="text-xs font-semibold text-stone-700">Área temática o línea *<input list="leaf-areas" required value={d.area || ''} onChange={sd('area')} className={input} placeholder="Elige o escribe" /><datalist id="leaf-areas">{AREAS.map(a => <option key={a} value={a} />)}</datalist></label>
      <label className="text-xs font-semibold text-stone-700 sm:col-span-2">Resumen * <span className={`font-normal ${countWords(t.summary) >= LIMITS.abstractMin && countWords(t.summary) <= LIMITS.abstractMax ? 'text-emerald-700' : 'text-stone-400'}`}>({countWords(t.summary)} palabras; {LIMITS.abstractMin}–{LIMITS.abstractMax})</span>
        <textarea required rows={5} value={t.summary} onChange={st('summary')} className={input} placeholder="Un párrafo: problema, objetivo, método, resultados principales y conclusión." /></label>
      <label className="text-xs font-semibold text-stone-700 sm:col-span-2">Palabras clave * <span className="font-normal text-stone-400">(3 a 6, separadas por ;)</span><input required value={d.keywords || ''} onChange={sd('keywords')} className={input} placeholder="formación docente; investigación educativa; física" /></label>
      <label className="text-xs font-semibold text-stone-700">Pregunta de investigación *<textarea required rows={2} value={d.pregunta || ''} onChange={sd('pregunta')} className={input} placeholder="¿…?" /></label>
      <label className="text-xs font-semibold text-stone-700">Objetivo *<textarea required rows={2} value={d.objetivo || ''} onChange={sd('objetivo')} className={input} placeholder="Analizar…, describir…, comparar…" /></label>
    </fieldset>

    <fieldset className="grid gap-4 rounded-2xl border border-stone-200 p-4">
      <legend className="px-2 text-sm font-bold text-stone-800">Cuerpo del artículo (IMRyD) · <span className={bodyWords >= LIMITS.minWords && bodyWords <= LIMITS.maxWords ? 'text-emerald-700' : 'text-stone-500'}>{bodyWords.toLocaleString('es-MX')} palabras</span> <span className="font-normal text-stone-400">({LIMITS.minWords.toLocaleString('es-MX')}–{LIMITS.maxWords.toLocaleString('es-MX')})</span></legend>
      {ARTICLE_PARTS.map(p => <label key={p.key} className="text-xs font-semibold text-stone-700">{p.label} *<W k={p.key} min={p.min} />
        <span className="mt-0.5 block font-normal text-stone-500">{p.how}</span>
        <textarea required rows={p.key === 'resultados' || p.key === 'marco' ? 10 : 7} value={d[p.key] || ''} onChange={sd(p.key)} className={input} /></label>)}
    </fieldset>

    <fieldset className="grid gap-4 rounded-2xl border border-stone-200 p-4">
      <legend className="px-2 text-sm font-bold text-stone-800">Tablas, figuras y referencias</legend>
      <label className="text-xs font-semibold text-stone-700">Figuras y tablas (opcional, una por línea)<span className="mt-0.5 block font-normal text-stone-500">Formato: enlace | Título | Nota o fuente. Se numeran en orden (Figura 1, Figura 2…) y cada una debe mencionarse en el texto.</span>
        <textarea rows={3} value={d.figures || ''} onChange={sd('figures')} className={input} placeholder="https://… | Matriz de la cuestión elaborada por el equipo | Elaboración propia" /></label>
      <label className="text-xs font-semibold text-stone-700">Referencias * <span className="font-normal text-stone-400">(APA 7, una por línea, en orden alfabético; mínimo {LIMITS.minRefs} y al menos una de los últimos 5 años)</span>
        <textarea required rows={7} value={d.references || ''} onChange={sd('references')} className={input} placeholder="Apellido, A. A. (2024). Título del artículo. Nombre de la Revista, 12(3), 45–60. https://doi.org/…" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-stone-700">Imagen de portada (enlace, opcional)<input type="url" value={d.image || ''} onChange={sd('image')} className={input} placeholder="https://…" /></label>
        <label className="text-xs font-semibold text-stone-700">Documento completo (enlace, opcional)<input type="url" value={t.url} onChange={st('url')} className={input} placeholder="https://drive.google.com/…" /></label>
      </div>
    </fieldset>

    <fieldset className="grid gap-3 rounded-2xl border border-stone-200 p-4 text-sm">
      <legend className="px-2 text-sm font-bold text-stone-800">Aspectos éticos</legend>
      <label className="flex items-start gap-2"><input type="checkbox" checked={d.originalidad === 'si'} onChange={e => setD(p => ({ ...p, originalidad: e.target.checked ? 'si' : '' }))} className="mt-1" />
        <span>Declaro que el artículo es original y que todas las ideas, datos y textos de otras personas están citados.</span></label>
      <label className="flex items-start gap-2"><input type="checkbox" checked={d.etica === 'si'} onChange={e => setD(p => ({ ...p, etica: e.target.checked ? 'si' : '' }))} className="mt-1" />
        <span>Declaro que los datos y participantes se manejaron de forma ética (consentimiento, anonimato y uso exclusivo para el estudio).</span></label>
      <label className="text-xs font-semibold text-stone-700">Uso de inteligencia artificial *<input required value={d.usoIA || ''} onChange={sd('usoIA')} className={input} placeholder="«No se utilizó IA» o explica para qué la usaste y que verificaste todo" /></label>
    </fieldset>

    <AiAssist tasks={['corregir', 'mejorar', 'sugerencias', 'resumir', 'palabras_clave', 'apa']}
      fields={[{ id: 'summary', label: 'Resumen' }, ...ARTICLE_PARTS.map(p => ({ id: p.key, label: p.label })), { id: 'references', label: 'Referencias' }, { id: 'keywords', label: 'Palabras clave' }]}
      hint="Te ayuda con tu propio texto: corregir, mejorar redacción, sugerencias o formato APA. No escribe el artículo por ti."
      getText={id => id === 'summary' ? (t.summary || ARTICLE_PARTS.map(p => d[p.key] || '').join('\n\n')) : (d[id] || '')}
      targetFor={(task, id) => task === 'palabras_clave' ? 'keywords' : task === 'resumir' ? 'summary' : id}
      onApply={(id, value) => id === 'summary' ? setT(p => ({ ...p, summary: value })) : setD(p => ({ ...p, [id]: value }))} />

    <div className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={!!busy} onClick={check} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
        {busy === 'check' ? <Loader2 size={15} className="animate-spin" /> : <ClipboardCheck size={15} />} Revisar con la rúbrica</button>
      <button disabled={!!busy} className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        {busy === 'send' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {initial?.id ? 'Reenviar corregido' : 'Enviar artículo'}</button>
      <span className="text-xs text-stone-500">Los campos con * son obligatorios.</span>
    </div>
  </form>;
}
