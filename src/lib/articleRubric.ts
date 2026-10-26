// Instrumento de arbitraje (Revista PRISMA, Escuela Normal Superior «Profr. Moisés Sáenz Garza»)
// y revisión automática de lo que le falta a un artículo. Lo usan el servidor y la página.

export interface RubricCriterion { id: string; grupo: 'fondo' | 'forma'; nombre: string; desc: string }
export const RUBRIC: RubricCriterion[] = [
  { id: 'pertinencia', grupo: 'fondo', nombre: 'Pertinencia temática', desc: 'El artículo se ajusta al enfoque y alcance de la revista (educación, formación docente, enseñanza y aprendizaje de la física).' },
  { id: 'originalidad', grupo: 'fondo', nombre: 'Originalidad y aportación', desc: 'Presenta hallazgos, enfoques o discusiones novedosas para el campo.' },
  { id: 'fundamentacion', grupo: 'fondo', nombre: 'Fundamentación teórica', desc: 'El marco conceptual es sólido, actualizado y coherente con el objeto de estudio.' },
  { id: 'rigor', grupo: 'fondo', nombre: 'Rigor metodológico', desc: 'El diseño, los instrumentos y el análisis son adecuados y están bien justificados.' },
  { id: 'argumentacion', grupo: 'fondo', nombre: 'Calidad argumentativa', desc: 'Los argumentos son claros, están bien sustentados y responden a la pregunta de investigación.' },
  { id: 'discusion', grupo: 'fondo', nombre: 'Discusión y conclusiones', desc: 'Las conclusiones se derivan de los resultados y dialogan con la literatura previa.' },
  { id: 'estructura', grupo: 'forma', nombre: 'Estructura y organización', desc: 'Sigue el formato IMRyD u otro pertinente; las secciones están bien delimitadas.' },
  { id: 'redaccion', grupo: 'forma', nombre: 'Redacción y estilo', desc: 'Claridad, cohesión, corrección gramatical y ortográfica.' },
  { id: 'citas', grupo: 'forma', nombre: 'Citas y referencias', desc: 'Uso correcto y consistente de la norma APA 7.' },
  { id: 'tablas', grupo: 'forma', nombre: 'Tablas, figuras y anexos', desc: 'Son pertinentes, claros y están correctamente referenciados en el texto.' },
  { id: 'extension', grupo: 'forma', nombre: 'Extensión', desc: 'Se ajusta a los límites de palabras establecidos (entre 1,500 y 8,000 palabras en el cuerpo).' },
];
export const SCALE = ['', 'Deficiente', 'Insuficiente', 'Aceptable', 'Bueno', 'Excelente'];
export const LIMITS = { minWords: 1500, maxWords: 8000, abstractMin: 120, abstractMax: 300, minRefs: 5 };
/** Para pasar a revisión del capitán: nada faltante, calificación ≥ 9 y ningún criterio debajo de 4. */
export const PASS = { minGrade: 9, minCriterion: 4 };

/** Apartados del artículo, en el orden IMRyD que se publica. */
export const ARTICLE_PARTS: { key: string; label: string; min: number; how: string }[] = [
  { key: 'intro', label: '1. Introducción', min: 120, how: 'Presenta el contexto, el problema, la pregunta de investigación y el objetivo, y anticipa cómo está organizado el artículo.' },
  { key: 'marco', label: '2. Marco teórico', min: 150, how: 'Explica los conceptos centrales con autores reconocidos y estudios recientes (últimos 5 años), citándolos en formato APA: (Apellido, año).' },
  { key: 'metodo', label: '3. Metodología', min: 120, how: 'Describe el enfoque (cuantitativo, cualitativo o mixto), los participantes o fuentes, los instrumentos, el procedimiento y cómo analizaste la información. Justifica cada elección.' },
  { key: 'resultados', label: '4. Resultados', min: 150, how: 'Presenta lo que encontraste, organizado por categorías o temas, sin opinar todavía. Apóyate en tablas o figuras numeradas y menciónalas en el texto (véase Figura 1).' },
  { key: 'discusion', label: '5. Discusión', min: 120, how: 'Compara tus resultados con lo que dicen los autores de tu marco teórico: ¿coinciden, difieren? Explica por qué y menciona los límites del estudio.' },
  { key: 'conclusiones', label: '6. Conclusiones', min: 80, how: 'Responde la pregunta de investigación con base en tus resultados, sin agregar información nueva, y propone implicaciones o líneas futuras.' },
];

export interface Missing { campo: string; problema: string; como: string }
export interface ArticleInput { title: string; summary: string; data: Record<string, any> }

const words = (s: unknown) => (String(s || '').trim().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const APA_REF = /^[^()]{2,}\(\s*(\d{4}[a-z]?|s\.\s?f\.)[^)]*\)\.\s+\S.{8,}/;
export const lines = (v: unknown): string[] => (Array.isArray(v) ? v : String(v || '').split('\n')).map(x => String(x).trim()).filter(Boolean);
/** Figuras guardadas como "enlace | título | descripción". */
export const parseFigures = (v: unknown) => lines(v).map(l => { const [url = '', title = '', note = ''] = l.split('|').map(x => x.trim()); return { url, title, note }; });

/** Cuerpo del artículo (todas las secciones) para contar palabras y buscar citas. */
export function articleBody(d: Record<string, any>) { return ARTICLE_PARTS.map(p => String(d[p.key] || '')).join('\n\n'); }

/** Revisa lo que exige el instrumento y que se puede comprobar sin interpretar: devuelve qué falta y cómo hacerlo. */
export function checkArticle(a: ArticleInput, now = new Date()): { missing: Missing[]; bodyWords: number } {
  const d = a.data || {};
  const m: Missing[] = [];
  const add = (campo: string, problema: string, como: string) => m.push({ campo, problema, como });
  const title = String(a.title || '').trim();
  if (title.length < 10) add('Título', 'El título es muy corto o falta.', 'Escribe un título claro de 10 a 20 palabras que diga el tema y el contexto (por ejemplo, la población o el nivel educativo).');
  if (!String(d.authors || '').trim()) add('Autoría', 'No se indicó quién escribe el artículo.', 'Escribe el nombre completo de cada autor.');
  if (!String(d.area || '').trim()) add('Área temática o línea', 'Falta el área temática.', 'Elige la línea a la que pertenece: investigación educativa, didáctica de la física, formación docente, etc.');
  const absW = words(a.summary);
  if (absW < LIMITS.abstractMin || absW > LIMITS.abstractMax) add('Resumen', `El resumen tiene ${absW} palabras; debe tener entre ${LIMITS.abstractMin} y ${LIMITS.abstractMax}.`, 'En un solo párrafo indica: tema y problema, objetivo, método, principales resultados y conclusión.');
  const kw = String(d.keywords || '').split(';').map(x => x.trim()).filter(Boolean);
  if (kw.length < 3 || kw.length > 6) add('Palabras clave', `Hay ${kw.length} palabras clave; deben ser de 3 a 6.`, 'Escribe de 3 a 6 términos separados por punto y coma ( ; ), de preferencia los que usarías para buscar el artículo en una base de datos.');
  const q = String(d.pregunta || '').trim();
  if (!/[¿?]/.test(q) || q.length < 15) add('Pregunta de investigación', 'Falta la pregunta de investigación o no está escrita como pregunta.', 'Redacta una pregunta concreta y delimitada (qué, quiénes, dónde, cuándo), entre signos ¿ ?.');
  if (String(d.objetivo || '').trim().length < 15) add('Objetivo', 'Falta el objetivo del estudio.', 'Empieza con un verbo en infinitivo (analizar, describir, comparar…) y di qué, en quiénes y para qué.');
  for (const p of ARTICLE_PARTS) {
    const w = words(d[p.key]);
    if (w < p.min) add(p.label, w === 0 ? 'Este apartado falta.' : `Este apartado tiene ${w} palabras; necesita al menos ${p.min}.`, p.how);
  }
  const body = articleBody(d);
  const bodyWords = words(body);
  if (bodyWords < LIMITS.minWords || bodyWords > LIMITS.maxWords) add('Extensión', `El cuerpo del artículo tiene ${bodyWords} palabras; debe tener entre ${LIMITS.minWords.toLocaleString('es-MX')} y ${LIMITS.maxWords.toLocaleString('es-MX')}.`, bodyWords < LIMITS.minWords ? 'Desarrolla más el marco teórico, los resultados y la discusión con evidencia; no rellenes.' : 'Recorta repeticiones y deja solo lo que responde a la pregunta de investigación.');

  const refs = lines(d.references);
  if (refs.length < LIMITS.minRefs) add('Referencias', `Hay ${refs.length} referencias; se necesitan al menos ${LIMITS.minRefs}.`, 'Agrega fuentes académicas verificables (artículos de revista, libros, tesis) de bases como ERIC, Redalyc, SciELO o Google Académico.');
  const notApa = refs.filter(r => !APA_REF.test(r));
  if (notApa.length) add('Referencias (formato APA)', `${notApa.length} referencia(s) no siguen APA 7: «${notApa[0].slice(0, 70)}…».`, 'Formato: Apellido, A. A. (Año). Título del trabajo. Revista o Editorial, volumen(número), páginas. https://doi.org/…');
  const years = refs.map(r => Number((r.match(/\((\d{4})/) || [])[1])).filter(Boolean);
  if (refs.length && !years.some(y => y >= now.getFullYear() - 5)) add('Referencias recientes', 'Ninguna referencia es de los últimos 5 años.', 'Incluye estudios recientes para que el marco teórico esté actualizado (alrededor del 80% de la literatura debería ser reciente).');
  const sorted = [...refs].sort((x, y) => norm(x).localeCompare(norm(y)));
  if (refs.join('\n') !== sorted.join('\n')) add('Referencias (orden)', 'Las referencias no están en orden alfabético.', 'Ordénalas alfabéticamente por el apellido del primer autor.');
  const nb = norm(body);
  const uncited = refs.filter(r => { const s = norm(r.split(/[,(]/)[0]).replace(/[.\s]+$/, '').trim(); return s.length > 1 && !nb.includes(s); });
  if (uncited.length) add('Citas en el texto', `${uncited.length} referencia(s) no se citan en el texto, por ejemplo: «${uncited[0].slice(0, 60)}…».`, 'Cada referencia de la lista debe citarse en el cuerpo como (Apellido, año) o Apellido (año), y cada cita debe aparecer en la lista.');
  const disc = norm(String(d.discusion || ''));
  if (refs.length && !refs.some(r => { const s = norm(r.split(/[,(]/)[0]).replace(/[.\s]+$/, '').trim(); return s.length > 1 && disc.includes(s); }))
    add('Discusión con la literatura', 'La discusión no menciona a ninguno de los autores de tus referencias.', 'Compara tus resultados con al menos dos autores del marco teórico: dónde coinciden y dónde difieren.');
  parseFigures(d.figures).forEach((f, i) => {
    if (!/^https?:\/\/\S+$/.test(f.url) || !f.title) add(`Figura ${i + 1}`, 'La figura no tiene enlace válido o título.', 'Usa el formato: enlace | Título de la figura | Nota o fuente.');
    if (!new RegExp(`(figura|tabla)\\s*${i + 1}\\b`, 'i').test(body)) add(`Figura ${i + 1}`, `La Figura ${i + 1} no se menciona en el texto.`, `Refiérela donde la comentas, por ejemplo: «como se observa en la Figura ${i + 1}…».`);
  });
  if (d.originalidad !== 'si') add('Declaración de originalidad', 'No se declaró que el trabajo es original y que todas las ideas ajenas están citadas.', 'Marca la casilla solo si es cierto; si copiaste algo, cítalo o redáctalo con tus palabras.');
  if (d.etica !== 'si') add('Ética en el manejo de datos', 'No se declaró el manejo ético de datos y participantes.', 'Explica en la metodología cómo protegiste la identidad de los participantes y obtuviste su consentimiento, y marca la casilla.');
  if (!String(d.usoIA || '').trim()) add('Uso de inteligencia artificial', 'No se declaró si se usó IA.', 'Escribe «No se utilizó IA» o explica para qué la usaste (por ejemplo, corregir ortografía) y que tú verificaste todo.');
  return { missing: m, bodyWords };
}

export interface RubricScore { puntaje: number; observacion: string; como: string }
export interface ArticleEvaluation {
  missing: Missing[]; bodyWords: number; ai: boolean;
  criterios: Record<string, RubricScore>; total: number; grade: number;
  plagio: string; etica: string; areas: string; dictamen: string; passed: boolean;
}
export const DICTAMEN: Record<string, string> = {
  aceptar: 'Aceptar sin cambios', menores: 'Aceptar con cambios menores', mayores: 'Aceptar con cambios mayores (requiere segunda revisión)', rechazar: 'Rechazar',
};
