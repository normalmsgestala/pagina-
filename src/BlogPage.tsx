import React, { useMemo, useState } from 'react';
import { formatDate, usePublicPosts, type Post } from './lib/api';
import { LoginButton } from './components/LoginButton';
import { ArrowLeft, ArrowRight, Search, BookOpen, X, CalendarDays, UserRound, Sparkles, HeartPulse, Lightbulb } from 'lucide-react';

const article = {
  id: '001',
  category: 'Investigación educativa',
  title: 'El bienestar socioemocional docente en Nuevo León: desafíos institucionales para una educación más humana',
  excerpt: '¿Quién cuida a quienes enseñan? Una mirada a las condiciones que hacen posible una escuela más humana.',
  date: '18 de octubre de 2026',
  image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1600&q=85',
  author: 'Carlos Ismael Estala Coronado',
  keywords: 'bienestar docente; educación socioemocional; salud mental; condiciones laborales; Nuevo León',
  abstract: 'Este artículo analiza los desafíos del bienestar socioemocional del profesorado en Nuevo León desde una perspectiva institucional y sistémica. Se propone un enfoque interpretativo-crítico y humanista para examinar cómo las condiciones organizacionales, las demandas emocionales y los recursos de apoyo se relacionan en la experiencia docente. La estrategia consiste en una revisión documental exploratoria y un análisis temático de fuentes académicas. La discusión preliminar aborda el agotamiento profesional, el trabajo emocional, la formación socioemocional, las redes de apoyo y el liderazgo escolar. La literatura consultada destaca la relevancia del bienestar docente, aunque la evidencia local disponible es limitada y no permite generalizar resultados a todo el estado. Se plantea que el bienestar no debe tratarse únicamente como una competencia individual, sino como una responsabilidad compartida entre autoridades, equipos directivos y comunidades escolares. Las recomendaciones iniciales incluyen acceso confidencial a apoyo psicológico, revisión de tareas administrativas, colaboración entre pares y formación de liderazgos sensibles. El texto es una revisión documental exploratoria en desarrollo; las afirmaciones sobre condiciones actuales específicas de Nuevo León requieren verificación adicional.',
  sections: [
    { heading: '1. Introducción', paragraphs: [
      'La educación emocional busca desarrollar conciencia y regulación emocional, autogestión y habilidades interpersonales, y requiere programas fundamentados y profesorado preparado (Bisquerra Alzina, 2003). Esta atención a las emociones plantea una pregunta institucional: ¿qué condiciones necesita el profesorado para acompañar el bienestar de sus estudiantes sin que su propia salud emocional quede relegada?',
      'El problema que orienta este artículo es la posible individualización del bienestar docente. Cuando el agotamiento se explica solo como falta de resiliencia o de habilidades personales, pueden quedar fuera del análisis factores organizacionales como la carga administrativa, la autonomía profesional, la seguridad, los equipos de apoyo y el liderazgo escolar.',
      'El objetivo es analizar los desafíos del bienestar socioemocional del profesorado en Nuevo León desde una perspectiva institucional y sistémica. Se trata de una revisión documental y un análisis crítico, no de una investigación empírica original.'
    ]},
    { heading: '2. Marco epistemológico', paragraphs: [
      'La perspectiva interpretativo-crítica permite examinar cómo se construyen las expectativas sobre el papel emocional del profesorado y cómo se relacionan con las condiciones institucionales. La perspectiva sistémica entiende el bienestar como un fenómeno vinculado con las interacciones entre docentes, equipos escolares, liderazgo, políticas educativas y entorno comunitario.',
      'La perspectiva humanista sitúa la dignidad, la agencia profesional y las necesidades de las personas en el centro del análisis. Desde esta combinación, la educación socioemocional no puede reducirse a técnicas individuales: también requiere examinar las condiciones que permiten o dificultan su práctica sostenible.',
      'Las categorías iniciales de análisis son: demandas emocionales y condiciones laborales; agotamiento profesional y fatiga por compasión; autonomía docente y carga administrativa; apoyo psicológico y colaboración entre pares; liderazgo escolar y responsabilidad institucional; y oferta formativa y políticas públicas de bienestar.'
    ]},
    { heading: '3. Metodología', paragraphs: [
      'Se plantea una revisión documental exploratoria de fuentes académicas, normativas e institucionales relacionadas con el bienestar socioemocional docente en Nuevo León y México, complementada con literatura internacional pertinente. La selección final debe verificarse consultando los documentos originales y registrando autoría, fecha, título, publicación y enlace o DOI cuando corresponda.',
      'Los criterios de inclusión previstos consideran la relación directa con bienestar docente, salud ocupacional, educación socioemocional o condiciones institucionales; la identificación bibliográfica suficiente; y la aportación de evidencia, conceptos o contexto para alguna categoría analítica.',
      'El procedimiento consiste en localizar y verificar documentos, registrar sus datos bibliográficos, extraer fragmentos relevantes sin separarlos de su contexto, codificar contenidos en categorías temáticas, contrastar convergencias y vacíos, y distinguir evidencia documental, interpretación del autor y recomendaciones. La descripción reproducible de la búsqueda —bases de datos, términos, periodo, fechas de consulta y número final de documentos— sigue pendiente.'
    ]},
    { heading: '4. Resultados preliminares de la síntesis documental', paragraphs: [
      'Los ejes que siguen son resultados preliminares derivados del documento de trabajo y están sujetos a verificación de fuentes; no son resultados de una investigación de campo realizada para este artículo.',
      'Desajuste entre demandas emocionales y recursos institucionales. El documento de trabajo plantea que el profesorado asume responsabilidades de mediación de conflictos, inclusión, convivencia y acompañamiento emocional. La revisión debe precisar qué estudios respaldan cada aspecto y hasta dónde pueden generalizarse.',
      'Condiciones de trabajo y agotamiento. Sieglin y Ramos Tovar (2007) estudiaron síntomas de depresión y ansiedad y su relación con factores laborales en una muestra no representativa de docentes de escuelas públicas del área metropolitana de Monterrey. Es un antecedente local relevante, pero no permite estimar la prevalencia actual en todo Nuevo León. Una revisión sistemática de Kariou et al. (2021) encontró asociaciones entre ciertas estrategias de trabajo emocional —en particular, la actuación superficial— y burnout docente, con resultados mixtos para otras estrategias.',
      'Formación socioemocional: oportunidad y límite. Los cursos y diplomados pueden contribuir al desarrollo profesional, pero no sustituyen las condiciones organizacionales necesarias para sostener el bienestar. La vigencia, alcance y características de programas específicos deben comprobarse antes de afirmarlos.',
      'Redes de apoyo y liderazgo escolar. La colaboración entre colegas, el apoyo psicológico accesible y un liderazgo sensible se proponen como líneas plausibles de acción. Su eficacia concreta para Nuevo León requiere estudios locales y evaluación de programas.'
    ]},
    { heading: '5. Discusión y conclusiones', paragraphs: [
      'La discusión central consiste en evitar que el bienestar socioemocional se formule únicamente como responsabilidad individual del docente. La literatura aborda tanto el desarrollo de competencias emocionales y la preparación del profesorado como la relación entre condiciones laborales y malestar psicológico. Los resultados deben interpretarse según el contexto y las limitaciones de cada estudio.',
      'Como líneas de acción institucional se propone: desarrollar mecanismos accesibles y confidenciales de orientación y apoyo psicológico; revisar tareas administrativas y priorizar actividades vinculadas con la enseñanza; reservar tiempos para comunidades de práctica y acompañamiento entre pares; y fortalecer la formación de directivos y supervisores en liderazgo sensible, manejo de conflictos y protección de la autonomía profesional.',
      'En conclusión provisional, el bienestar socioemocional docente debe examinarse como una responsabilidad compartida y una condición de sostenibilidad educativa, no como una competencia aislada que cada profesor deba resolver por cuenta propia. Una política institucional coherente necesita articular formación, apoyo profesional, organización del trabajo, colaboración y liderazgo. La conclusión definitiva requiere completar la verificación de fuentes y delimitar el alcance de la evidencia documental.'
    ]}
  ],
  references: [
    'Bisquerra Alzina, R. (2003). Educación emocional y competencias básicas para la vida. Revista de Investigación Educativa, 21(1), 7–43. https://revistas.um.es/rie/article/view/99071',
    'García Pérez, J. L., & Garza Ruíz, B. A. (2022). Educación socioemocional y formación docente. Revista RELEP: Educación y Pedagogía en Latinoamérica, 4(2), 32–45. https://doi.org/10.46990/relep.2022.4.2.606',
    'Hascher, T., & Waber, J. (2021). Teacher well-being: A systematic review of the research literature from the year 2000–2019. Educational Research Review, 34, Article 100411. https://doi.org/10.1016/j.edurev.2021.100411',
    'Kariou, A., Koutsimani, P., Montgomery, A., & Lainidi, O. (2021). Emotional labor and burnout among teachers: A systematic review. International Journal of Environmental Research and Public Health, 18(23), Article 12760. https://doi.org/10.3390/ijerph182312760',
    'Sieglin, V., & Ramos Tovar, M. E. (2007). Estrés laboral y depresión entre maestros del área metropolitana de Monterrey. Revista Mexicana de Sociología, 69(3), 517–551. https://www.scielo.org.mx/scielo.php?pid=S0188-25032007000300005&script=sci_arttext',
    'Yin, H., Huang, S., & Chen, G. (2019). The relationships between teachers’ emotional labor and their burnout and satisfaction: A meta-analytic review. Educational Research Review, 28, Article 100283. https://doi.org/10.1016/j.edurev.2019.100283'
  ]
};

type Article = typeof article & { url?: string };
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80';
const paragraphs = (s: unknown) => String(s || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);

/** Convierte un artículo aprobado de la base de datos al formato de esta página. */
function fromPost(p: Post, n: number): Article {
  const d = p.data || {};
  const sections = [
    { heading: '1. Introducción', paragraphs: paragraphs(d.intro) },
    { heading: '2. Desarrollo', paragraphs: paragraphs(d.body) },
    { heading: '3. Conclusiones', paragraphs: paragraphs(d.conclusion) },
  ].filter(x => x.paragraphs.length);
  const abstract = p.summary || '';
  return {
    id: String(n).padStart(3, '0'), category: d.category || 'Artículo', title: p.title,
    excerpt: abstract.length > 220 ? abstract.slice(0, 217) + '…' : abstract,
    date: formatDate(p.publishedAt || p.createdAt), image: d.image || FALLBACK_IMAGE,
    author: d.authors || p.authorName, keywords: d.keywords || '', abstract, sections,
    references: Array.isArray(d.references) ? d.references : [], url: p.url,
  };
}

export default function BlogPage() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Article | null>(null);
  const posts = usePublicPosts('articulo');
  const all = useMemo<Article[]>(() => {
    const db = posts.slice().sort((a, b) => (a.publishedAt || a.createdAt).localeCompare(b.publishedAt || b.createdAt)).map((p, i) => fromPost(p, i + 2));
    return [...db.reverse(), article];
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
        <div className="relative min-h-56 overflow-hidden bg-stone-200 sm:min-h-72"><img src={a.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-amber-900">DOSSIER · {a.id}</span></div>
        <div className="flex flex-col justify-center p-6 sm:p-10"><p className="text-xs font-semibold uppercase tracking-widest text-amber-800">{a.category} · {a.date}</p><h2 className="mt-4 font-serif text-2xl leading-snug sm:text-3xl">{a.id}. {a.title}</h2><p className="mt-4 text-sm leading-7 text-stone-600">{a.excerpt}</p><p className="mt-5 flex items-center gap-2 text-sm text-stone-500"><UserRound size={15}/> {a.author}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-stone-900">Leer la historia <ArrowRight size={16}/></span></div>
      </button>)}</div> : <p className="py-12 text-stone-600">No encontramos artículos con esa búsqueda.</p>}
      <section className="mt-16 border-t border-stone-200 pt-8"><p className="text-xs uppercase tracking-widest text-stone-500">Archivo editorial</p><h2 className="mt-2 font-serif text-2xl">Una colección que crece con evidencia.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">Los artículos se numeran consecutivamente (001, 002, 003…). Cada nueva publicación debe incluir resumen, palabras clave, metodología transparente cuando corresponda, desarrollo por secciones y referencias verificadas. Los estudiantes los envían desde el panel y un moderador los revisa antes de publicarlos.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Siguiente número</p><p className="mt-2 font-serif text-2xl">{nextNumber}</p><p className="mt-1 text-xs leading-5 text-stone-500">Se asigna al publicarse.</p></div><div className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Fuentes</p><p className="mt-2 font-serif text-xl">Verificables</p><p className="mt-1 text-xs leading-5 text-stone-500">Citas vinculadas con documentos originales.</p></div><div className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Transparencia</p><p className="mt-2 font-serif text-xl">Método y límites</p><p className="mt-1 text-xs leading-5 text-stone-500">Diferenciar evidencia, interpretación y aspectos pendientes.</p></div></div></section>
    </main>
    <footer className="border-t border-stone-200 px-5 py-6 text-center text-xs tracking-widest text-stone-500">LEAF 2026—2030 · ARTÍCULOS</footer>
    {active && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/70 p-2 sm:p-6" role="dialog" aria-modal="true" aria-label={active.title} onClick={() => setActive(null)}>
      <article className="my-3 w-full max-w-4xl overflow-hidden rounded-xl bg-stone-50 shadow-2xl sm:my-8" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-stone-50/95 px-5 py-3 backdrop-blur"><span className="text-xs font-semibold uppercase tracking-widest text-amber-800">Artículo {active.id} · Lectura completa</span><button onClick={() => setActive(null)} aria-label="Cerrar artículo" className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-3 py-2 text-sm hover:bg-white"><X size={16}/> Cerrar</button></div>
        <img src={active.image} alt="" className="h-52 w-full object-cover sm:h-80"/>
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-800">{active.category} · {active.date}</p>
          <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-5xl">{active.id}. {active.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600"><span className="inline-flex items-center gap-2"><UserRound size={15}/> {active.author}</span>{active === article && <span className="inline-flex items-center gap-2"><BookOpen size={15}/> Revisión documental exploratoria</span>}{active.url && <a href={active.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-amber-800 underline"><BookOpen size={15}/> Documento completo</a>}</div>
          {active.abstract && <div className="mt-8 rounded-xl border border-stone-200 bg-white p-5 sm:p-7"><h2 className="font-serif text-2xl">Resumen</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-700">{active.abstract}</p>{active.keywords && <p className="mt-4 text-sm leading-7"><strong>Palabras clave:</strong> {active.keywords}</p>}</div>}
          <div className="prose prose-stone mt-8 max-w-none">
            {active.sections.map(section => <section key={section.heading} className="mb-9"><h2 className="font-serif text-2xl sm:text-3xl">{section.heading}</h2>{section.paragraphs.map((paragraph, i) => <p key={i} className="mt-4 whitespace-pre-line text-[15px] leading-8 text-stone-700">{paragraph}</p>)}</section>)}
            {active.references.length > 0 && <section className="mt-10 border-t border-stone-200 pt-8"><h2 className="font-serif text-2xl sm:text-3xl">Referencias</h2><ol className="mt-5 list-decimal space-y-4 pl-5">{active.references.map(ref => <li key={ref} className="break-words text-sm leading-7 text-stone-700">{ref}</li>)}</ol></section>}
          </div>
        </div>
        <div className="border-t border-stone-200 px-5 py-5 text-center"><button onClick={() => setActive(null)} className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-900">Volver a artículos</button></div>
      </article>
    </div>}
  </div>;
}
