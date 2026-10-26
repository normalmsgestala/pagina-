import React, { useMemo, useState } from 'react';
import { formatDate, usePublicPosts, type Post } from './lib/api';
import { ARTICLE_PARTS, lines as refLines, parseFigures } from './lib/articleRubric';
import { LoginButton } from './components/LoginButton';
import { ARTICLE_001, ARTICLE_002, ARTICLE_003, type StaticArticle, type ArticleSection } from './data/articlesBitacora';
import { ArrowLeft, ArrowRight, Search, BookOpen, X, CalendarDays, UserRound, Sparkles, HeartPulse, Lightbulb } from 'lucide-react';

type Article = Omit<StaticArticle, 'imageAlt' | 'method'> & { url?: string; method?: string; imageAlt?: string };
const STATIC_ARTICLES: Article[] = [ARTICLE_001, ARTICLE_002, ARTICLE_003];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80';
const paragraphs = (s: unknown) => String(s || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);

/** Convierte un artículo aprobado de la base de datos al formato de esta página. */
function fromPost(p: Post, n: number): Article {
  const d = p.data || {};
  const figs = parseFigures(d.figures).map((f, i) => ({ src: f.url, caption: `Figura ${i + 1}. ${f.title}${f.note ? '. ' + f.note : ''}` }));
  const imryd = ARTICLE_PARTS.some(x => d[x.key]);
  const sections: ArticleSection[] = imryd
    ? ARTICLE_PARTS.map(x => ({ heading: x.label, paragraphs: paragraphs(d[x.key]), ...(x.key === 'resultados' && figs.length ? { figures: figs } : {}) })).filter(x => x.paragraphs.length)
    : [
      { heading: '1. Introducción', paragraphs: paragraphs(d.intro) },
      { heading: '2. Desarrollo', paragraphs: paragraphs(d.body) },
      { heading: '3. Conclusiones', paragraphs: paragraphs(d.conclusion) },
    ].filter(x => x.paragraphs.length);
  const ethics = [d.originalidad === 'si' && 'Los autores declaran que el artículo es original y que todas las fuentes están citadas.',
    d.etica === 'si' && 'Los autores declaran el manejo ético de los datos y de los participantes.', d.usoIA && `Uso de inteligencia artificial: ${d.usoIA}`].filter(Boolean) as string[];
  const abstract = p.summary || '';
  return {
    id: String(n).padStart(3, '0'), category: d.category || 'Artículo', title: p.title,
    excerpt: abstract.length > 220 ? abstract.slice(0, 217) + '…' : abstract,
    date: formatDate(p.publishedAt || p.createdAt), image: d.image || FALLBACK_IMAGE,
    author: d.authors || p.authorName, keywords: d.keywords || '', abstract, sections,
    references: refLines(d.references), url: p.url, area: d.area, pregunta: d.pregunta, objetivo: d.objetivo, ethics,
  };
}

export default function BlogPage() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Article | null>(null);
  const posts = usePublicPosts('articulo');
  const all = useMemo<Article[]>(() => {
    const db = posts.slice().sort((a, b) => (a.publishedAt || a.createdAt).localeCompare(b.publishedAt || b.createdAt)).map((p, i) => fromPost(p, i + STATIC_ARTICLES.length + 1));
    return [...db, ...STATIC_ARTICLES].sort((a, b) => b.id.localeCompare(a.id));
  }, [posts]);
  const visible = all.filter(a => (a.title + ' ' + a.excerpt + ' ' + a.keywords + ' ' + a.author).toLowerCase().includes(query.toLowerCase()));
  const nextNumber = String(all.length + 1).padStart(3, '0');

  return <div className="min-h-screen bg-stone-50 text-stone-900">
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 gap-4">
        <a href="/" className="font-serif text-xl font-semibold tracking-wide">LEAF <span className="text-sm font-normal text-amber-800">2026—2030</span></a>
        <div className="flex items-center gap-4 text-sm"><a href="/" className="flex items-center gap-2 text-stone-600 hover:text-amber-800"><ArrowLeft size={16}/> Volver al Campus</a><LoginButton /></div>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-amber-800">LEAF 2026—2030 · Publicaciones de investigación</p>
      <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">Historias, ciencia<br/><span className="italic text-amber-200">y nuevas preguntas.</span></h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600">Investigaciones que nos invitan a mirar la educación desde otra perspectiva. Lee, descubre y conversa.</p>
      <label className="mt-9 flex max-w-md items-center gap-2 border-b border-stone-300 py-3 text-stone-500"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar artículos..." className="w-full bg-transparent text-sm outline-none"/></label>
      {visible.length ? <div className="mt-8 space-y-6">{visible.map(a => <button key={a.id} onClick={() => setActive(a)} className="group grid w-full overflow-hidden rounded-3xl border border-stone-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:grid-cols-[1.05fr_.95fr]">
        <div className="relative min-h-56 overflow-hidden bg-stone-200 sm:min-h-72"><img src={a.image} alt={a.imageAlt || ''} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-amber-900">DOSSIER · {a.id}</span></div>
        <div className="flex flex-col justify-center p-6 sm:p-10"><p className="text-xs font-semibold uppercase tracking-widest text-amber-800">{a.category} · {a.date}</p><h2 className="mt-4 font-serif text-2xl leading-snug sm:text-3xl">{a.id}. {a.title}</h2><p className="mt-4 text-sm leading-7 text-stone-600">{a.excerpt}</p><p className="mt-5 flex items-center gap-2 text-sm text-stone-500"><UserRound size={15}/> {a.author}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-stone-900">Leer la historia <ArrowRight size={16}/></span></div>
      </button>)}</div> : <p className="py-12 text-stone-600">No encontramos artículos con esa búsqueda.</p>}
      <section className="mt-16 border-t border-stone-200 pt-8"><p className="text-xs uppercase tracking-widest text-stone-500">Archivo editorial</p><h2 className="mt-2 font-serif text-2xl">Una colección que crece con evidencia.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">Los artículos se numeran consecutivamente (001, 002, 003…). Cada nueva publicación debe incluir resumen, palabras clave, metodología transparente cuando corresponda, desarrollo por secciones y referencias verificadas. Los estudiantes los envían desde el panel y un capitán los revisa antes de publicarlos.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Siguiente número</p><p className="mt-2 font-serif text-2xl">{nextNumber}</p><p className="mt-1 text-xs leading-5 text-stone-500">Se asigna al publicarse.</p></div><div className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Fuentes</p><p className="mt-2 font-serif text-xl">Verificables</p><p className="mt-1 text-xs leading-5 text-stone-500">Citas vinculadas con documentos originales.</p></div><div className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Transparencia</p><p className="mt-2 font-serif text-xl">Método y límites</p><p className="mt-1 text-xs leading-5 text-stone-500">Diferenciar evidencia, interpretación y aspectos pendientes.</p></div></div></section>
    </main>
    <footer className="border-t border-stone-200 px-5 py-6 text-center text-xs tracking-widest text-stone-500">LEAF 2026—2030 · ARTÍCULOS</footer>
    {active && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/70 p-2 sm:p-6" role="dialog" aria-modal="true" aria-label={active.title} onClick={() => setActive(null)}>
      <article className="my-3 w-full max-w-4xl overflow-hidden rounded-xl bg-stone-50 shadow-2xl sm:my-8" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-stone-50/95 px-5 py-3 backdrop-blur"><span className="text-xs font-semibold uppercase tracking-widest text-amber-800">Artículo {active.id} · Lectura completa</span><button onClick={() => setActive(null)} aria-label="Cerrar artículo" className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-sm hover:bg-white"><X size={16}/> Cerrar</button></div>
        <img src={active.image} alt={active.imageAlt || ''} className="h-52 w-full object-cover sm:h-80"/>
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-800">{active.category} · {active.date}</p>
          <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-5xl">{active.id}. {active.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600"><span className="inline-flex items-center gap-2"><UserRound size={15}/> {active.author}</span>{active.method && <span className="inline-flex items-center gap-2"><BookOpen size={15}/> {active.method}</span>}{active.url && <a href={active.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-amber-800 underline"><BookOpen size={15}/> Documento completo</a>}</div>
          {(active.area || active.pregunta) && <dl className="mt-6 grid gap-x-4 gap-y-2 rounded-xl border border-stone-200 bg-white p-5 text-sm sm:grid-cols-[10rem_1fr]">
            {active.area && <><dt className="text-xs font-bold uppercase tracking-wider text-amber-800">Área temática</dt><dd className="text-stone-700">{active.area}</dd></>}
            {active.pregunta && <><dt className="text-xs font-bold uppercase tracking-wider text-amber-800">Pregunta de investigación</dt><dd className="text-stone-700">{active.pregunta}</dd></>}
            {active.objetivo && <><dt className="text-xs font-bold uppercase tracking-wider text-amber-800">Objetivo</dt><dd className="text-stone-700">{active.objetivo}</dd></>}
          </dl>}
          {active.abstract && <div className="mt-8 rounded-xl border border-stone-200 bg-white p-5 sm:p-7"><h2 className="font-serif text-2xl">Resumen</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-700">{active.abstract}</p>{active.keywords && <p className="mt-4 text-sm leading-7"><strong>Palabras clave:</strong> {active.keywords}</p>}</div>}
          {active.event && <dl className="mt-6 grid gap-x-4 gap-y-2 rounded-xl border border-stone-200 bg-white p-5 text-sm sm:grid-cols-[8rem_1fr]">
            {active.event.map(([k, v]) => <React.Fragment key={k}><dt className="text-xs font-bold uppercase tracking-wider text-amber-800">{k}</dt><dd className="text-stone-700">{v}</dd></React.Fragment>)}
          </dl>}
          <div className="prose prose-stone mt-8 max-w-none">
            {active.sections.map(section => <section key={section.heading} className="mb-9"><h2 className="font-serif text-2xl sm:text-3xl">{section.heading}</h2>
              {section.paragraphs.map((paragraph, i) => <p key={i} className="mt-4 whitespace-pre-line text-[15px] leading-8 text-stone-700">{paragraph}</p>)}
              {section.quote && <blockquote className="my-6 border-l-4 border-amber-700 pl-4 font-serif text-xl italic leading-snug text-stone-800">«{section.quote}»</blockquote>}
              {[...(section.figure ? [section.figure] : []), ...(section.figures || [])].map(fg => <figure key={fg.src} className="my-6 overflow-hidden rounded-xl border border-stone-200 bg-white"><img src={fg.src} alt={fg.caption} loading="lazy" className="w-full" /><figcaption className="px-4 py-3 text-xs leading-5 text-stone-500">{fg.caption}</figcaption></figure>)}
              {section.table && <div className="my-6 overflow-x-auto rounded-xl border border-stone-200 bg-white"><table className="w-full text-left text-sm">
                <thead className="bg-stone-100 text-xs uppercase tracking-wider text-stone-600"><tr>{section.table.headers.map((h, i) => <th key={i} className="p-3">{h}</th>)}</tr></thead>
                <tbody>{section.table.rows.map((r, i) => <tr key={i} className="border-t border-stone-100 align-top">{r.map((c, j) => <td key={j} className={`p-3 ${j === 0 ? 'font-semibold text-stone-800' : 'text-stone-700'}`}>{c}</td>)}</tr>)}</tbody>
              </table>{section.table.caption && <p className="border-t border-stone-100 px-3 py-2 text-xs text-stone-500">{section.table.caption}</p>}</div>}
              {section.box && <aside className="my-6 rounded-xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-bold uppercase tracking-widest text-amber-900">{section.box.title}</p>
                <ul className="mt-3 space-y-2">{section.box.items.map(([t, d]) => <li key={t} className="text-sm leading-6 text-stone-700"><strong className="text-stone-900">{t}.</strong> {d}</li>)}</ul></aside>}
            </section>)}
            {active.references.length > 0 && <section className="mt-10 border-t border-stone-200 pt-8"><h2 className="font-serif text-2xl sm:text-3xl">Referencias</h2><ul className="mt-5 space-y-4">{active.references.map(ref => <li key={ref} className="break-words pl-8 -indent-8 text-sm leading-7 text-stone-700">{ref}</li>)}</ul></section>}
            {active.ethics && active.ethics.length > 0 && <section className="mt-8 rounded-xl border border-stone-200 bg-white p-5"><h2 className="font-serif text-xl">Declaraciones éticas</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">{active.ethics.map(x => <li key={x}>{x}</li>)}</ul></section>}
          </div>
        </div>
        <div className="border-t border-stone-200 px-5 py-5 text-center"><button onClick={() => setActive(null)} className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-900">Volver a artículos</button></div>
      </article>
    </div>}
  </div>;
}
