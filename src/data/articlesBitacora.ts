// Artículos 001, 002 y 003 en el formato del instrumento de arbitraje (Revista PRISMA):
// datos generales, resumen, palabras clave, pregunta y objetivo, IMRyD, tablas y figuras numeradas
// y referidas en el texto, referencias APA 7 en orden alfabético y declaraciones éticas.

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  quote?: string;
  figure?: { src: string; caption: string };
  figures?: { src: string; caption: string }[];
  table?: { caption?: string; headers: string[]; rows: string[][] };
  box?: { title: string; items: [string, string][] };
}
export interface StaticArticle {
  id: string; category: string; title: string; excerpt: string; date: string; image: string; imageAlt: string;
  author: string; keywords: string; abstract: string; method: string; sections: ArticleSection[]; references: string[];
  event?: [string, string][];
  area?: string; pregunta?: string; objetivo?: string; ethics?: string[];
}

const IA_DECLARACION = 'Uso de inteligencia artificial: se utilizó IA generativa como apoyo para reorganizar el texto en formato IMRyD y revisar el formato APA 7. La selección de fuentes, la interpretación y la responsabilidad del contenido corresponden al autor.';

const JORNADA_HS = 'Hernández Sampieri, R. (2026, 22 de octubre). ¿Para qué sirve la investigación? El planteamiento del problema define la ruta de la investigación: cuantitativa, cualitativa o mixta [Conferencia]. Jornada de Habilitación Docente «Horizontes de la investigación en la formación docente», Secretaría de Educación de Nuevo León, Benemérita Escuela Normal Miguel F. Martínez, Monterrey, N. L., México.';
const HS_MENDOZA = 'Hernández-Sampieri, R., & Mendoza Torres, C. P. (2018). Metodología de la investigación: Las rutas cuantitativa, cualitativa y mixta. McGraw-Hill Interamericana.';
const BRAUN = 'Braun, V., & Clarke, V. (2022). Thematic analysis: A practical guide. SAGE.';
const ZABALZA = 'Zabalza, M. A. (2004). Diarios de clase: Un instrumento de investigación y desarrollo profesional. Narcea.';
const STENHOUSE = 'Stenhouse, L. (1987). La investigación como base de la enseñanza. Morata.';

// ───────────────────────────── 001 ─────────────────────────────
export const ARTICLE_001: StaticArticle = {
  id: '001',
  category: 'Investigación educativa',
  title: 'El bienestar socioemocional docente en Nuevo León: desafíos institucionales para una educación más humana',
  excerpt: '¿Quién cuida a quienes enseñan? Una mirada a las condiciones que hacen posible una escuela más humana.',
  date: '18 de octubre de 2026',
  image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1600&q=85',
  imageAlt: 'Docente y estudiantes en un entorno educativo',
  author: 'Carlos Ismael Estala Coronado',
  method: 'Revisión documental exploratoria',
  area: 'Investigación educativa · Bienestar docente',
  pregunta: '¿Qué desafíos institucionales enfrenta el bienestar socioemocional del profesorado en Nuevo León y qué líneas de acción se desprenden de la literatura disponible?',
  objetivo: 'Analizar los desafíos del bienestar socioemocional del profesorado en Nuevo León desde una perspectiva institucional y sistémica, a partir de una revisión documental exploratoria.',
  keywords: 'bienestar docente; educación socioemocional; salud mental; condiciones laborales; Nuevo León',
  abstract: 'Este artículo analiza los desafíos del bienestar socioemocional del profesorado en Nuevo León desde una perspectiva institucional y sistémica. Se propone un enfoque interpretativo-crítico y humanista para examinar cómo las condiciones organizacionales, las demandas emocionales y los recursos de apoyo se relacionan en la experiencia docente. La estrategia consiste en una revisión documental exploratoria y un análisis temático de fuentes académicas. La discusión preliminar aborda el agotamiento profesional, el trabajo emocional, la formación socioemocional, las redes de apoyo y el liderazgo escolar. La literatura consultada destaca la relevancia del bienestar docente, aunque la evidencia local disponible es limitada y no permite generalizar resultados a todo el estado. Se plantea que el bienestar no debe tratarse únicamente como una competencia individual, sino como una responsabilidad compartida entre autoridades, equipos directivos y comunidades escolares. Las recomendaciones iniciales incluyen acceso confidencial a apoyo psicológico, revisión de tareas administrativas, colaboración entre pares y formación de liderazgos sensibles. El texto es una revisión documental exploratoria en desarrollo; las afirmaciones sobre condiciones actuales específicas de Nuevo León requieren verificación adicional.',
  ethics: [
    'El autor declara que el artículo es original y que todas las ideas y datos de otras personas están citados.',
    'Manejo ético de datos: se trata de una revisión documental de fuentes publicadas; no participaron personas ni se recolectaron datos personales.',
    IA_DECLARACION,
  ],
  sections: [
    { heading: '1. Introducción', paragraphs: [
      'La educación emocional busca desarrollar conciencia y regulación emocional, autogestión y habilidades interpersonales, y requiere programas fundamentados y profesorado preparado (Bisquerra Alzina, 2003). Esta atención a las emociones plantea una pregunta institucional: ¿qué condiciones necesita el profesorado para acompañar el bienestar de sus estudiantes sin que su propia salud emocional quede relegada?',
      'El problema que orienta este artículo es la posible individualización del bienestar docente. Cuando el agotamiento se explica solo como falta de resiliencia o de habilidades personales, pueden quedar fuera del análisis factores organizacionales como la carga administrativa, la autonomía profesional, la seguridad, los equipos de apoyo y el liderazgo escolar.',
      'De ahí la pregunta de investigación: ¿qué desafíos institucionales enfrenta el bienestar socioemocional del profesorado en Nuevo León y qué líneas de acción se desprenden de la literatura disponible? El objetivo es analizar esos desafíos desde una perspectiva institucional y sistémica. Se trata de una revisión documental y un análisis crítico, no de una investigación empírica original.',
      'El artículo se organiza en seis apartados: tras esta introducción se presenta el marco teórico; después, la metodología de la revisión y las categorías de análisis (Tabla 1); luego, los resultados preliminares de la síntesis documental; la discusión con la literatura y, por último, las conclusiones con sus límites y líneas futuras.',
    ] },
    { heading: '2. Marco teórico', paragraphs: [
      'La perspectiva interpretativo-crítica permite examinar cómo se construyen las expectativas sobre el papel emocional del profesorado y cómo se relacionan con las condiciones institucionales. La perspectiva sistémica entiende el bienestar como un fenómeno vinculado con las interacciones entre docentes, equipos escolares, liderazgo, políticas educativas y entorno comunitario.',
      'La perspectiva humanista sitúa la dignidad, la agencia profesional y las necesidades de las personas en el centro del análisis. Desde esta combinación, la educación socioemocional no puede reducirse a técnicas individuales: también requiere examinar las condiciones que permiten o dificultan su práctica sostenible.',
      'En el plano conceptual, la educación emocional se entiende como un proceso educativo continuo orientado al desarrollo de competencias emocionales, entre ellas la conciencia y la regulación de las emociones, la autonomía, la competencia social y las habilidades para la vida y el bienestar (Bisquerra Alzina, 2003). Esta definición es útil porque reconoce que tales competencias se aprenden y, por lo tanto, dependen de condiciones de formación y acompañamiento.',
      'El bienestar docente, por su parte, es un constructo multidimensional. La revisión sistemática de Hascher y Waber (2021) sobre la investigación publicada entre 2000 y 2019 muestra la diversidad de definiciones e instrumentos con que se ha estudiado, lo que obliga a precisar qué dimensión se analiza en cada caso: emocional, laboral, social o de salud.',
      'Un tercer concepto es el trabajo emocional, es decir, el esfuerzo por manejar y expresar las emociones que la profesión exige. Los metaanálisis y revisiones sistemáticas sobre este tema relacionan la estrategia de actuación superficial, que consiste en mostrar emociones que no se sienten, con mayores niveles de agotamiento profesional (Kariou et al., 2021; Yin et al., 2019). Finalmente, la formación socioemocional del profesorado se ha planteado como una condición para que la educación socioemocional llegue a las aulas (García Pérez & Garza Ruíz, 2022).',
    ] },
    { heading: '3. Metodología', paragraphs: [
      'Se plantea una revisión documental exploratoria de fuentes académicas, normativas e institucionales relacionadas con el bienestar socioemocional docente en Nuevo León y México, complementada con literatura internacional pertinente. La selección final debe verificarse consultando los documentos originales y registrando autoría, fecha, título, publicación y enlace o DOI cuando corresponda.',
      'Los criterios de inclusión previstos consideran la relación directa con bienestar docente, salud ocupacional, educación socioemocional o condiciones institucionales; la identificación bibliográfica suficiente; y la aportación de evidencia, conceptos o contexto para alguna categoría analítica.',
      'El procedimiento consiste en localizar y verificar documentos, registrar sus datos bibliográficos, extraer fragmentos relevantes sin separarlos de su contexto, codificar contenidos en las categorías temáticas de la Tabla 1, contrastar convergencias y vacíos, y distinguir evidencia documental, interpretación del autor y recomendaciones.',
      'Pendiente de documentar: la descripción reproducible de la búsqueda (bases de datos consultadas, términos de búsqueda, periodo, fechas de consulta y número final de documentos). Mientras no se documente, los resultados deben leerse como una síntesis exploratoria y no como una revisión sistemática.',
      'Consideraciones éticas: al tratarse de una revisión de fuentes publicadas, no participaron personas ni se recolectaron datos personales. Se respetó la autoría de cada fuente mediante cita y referencia.',
    ], table: { caption: 'Tabla 1. Categorías iniciales de análisis de la revisión documental. Elaboración propia.', headers: ['Categoría', 'Qué se busca en las fuentes'], rows: [
      ['Demandas emocionales y condiciones laborales', 'Exigencias de mediación, inclusión, convivencia y acompañamiento emocional frente a los recursos disponibles.'],
      ['Agotamiento profesional y fatiga por compasión', 'Evidencia sobre burnout, estrés y malestar psicológico del profesorado.'],
      ['Autonomía docente y carga administrativa', 'Tareas que restan tiempo a la enseñanza y margen de decisión profesional.'],
      ['Apoyo psicológico y colaboración entre pares', 'Existencia y accesibilidad de redes de apoyo y servicios de orientación.'],
      ['Liderazgo escolar y responsabilidad institucional', 'Papel de directivos y supervisores en el cuidado del bienestar.'],
      ['Oferta formativa y políticas públicas de bienestar', 'Programas de formación socioemocional y su vigencia y alcance.'],
    ] } },
    { heading: '4. Resultados', paragraphs: [
      'Los ejes que siguen son resultados preliminares derivados del documento de trabajo y están sujetos a verificación de fuentes; no son resultados de una investigación de campo realizada para este artículo. Se organizan según las categorías de la Tabla 1.',
      'Desajuste entre demandas emocionales y recursos institucionales. El documento de trabajo plantea que el profesorado asume responsabilidades de mediación de conflictos, inclusión, convivencia y acompañamiento emocional. La revisión debe precisar qué estudios respaldan cada aspecto y hasta dónde pueden generalizarse.',
      'Condiciones de trabajo y agotamiento. Sieglin y Ramos Tovar (2007) estudiaron síntomas de depresión y ansiedad y su relación con factores laborales en una muestra no representativa de docentes de escuelas públicas del área metropolitana de Monterrey. Es un antecedente local relevante, pero no permite estimar la prevalencia actual en todo Nuevo León. Una revisión sistemática de Kariou et al. (2021) encontró asociaciones entre ciertas estrategias de trabajo emocional —en particular, la actuación superficial— y burnout docente, con resultados mixtos para otras estrategias.',
      'Formación socioemocional: oportunidad y límite. Los cursos y diplomados pueden contribuir al desarrollo profesional, pero no sustituyen las condiciones organizacionales necesarias para sostener el bienestar. La vigencia, alcance y características de programas específicos deben comprobarse antes de afirmarlos.',
      'Autonomía docente y carga administrativa. En el documento de trabajo, la carga administrativa aparece como un factor que resta tiempo a la enseñanza y al acompañamiento de los estudiantes. Las fuentes revisadas hasta ahora no ofrecen datos específicos de Nuevo León sobre esta categoría, por lo que se registra como un vacío que la búsqueda documentada deberá cubrir antes de formular conclusiones.',
      'Diversidad de definiciones e instrumentos. Al comparar las fuentes se observa que el bienestar docente se mide de maneras distintas: unas se centran en síntomas de malestar, otras en el agotamiento y otras en la satisfacción laboral (Hascher & Waber, 2021; Yin et al., 2019). Esta diferencia limita la comparación directa de resultados y es en sí misma un hallazgo de la revisión.',
      'Redes de apoyo y liderazgo escolar. La colaboración entre colegas, el apoyo psicológico accesible y un liderazgo sensible se proponen como líneas plausibles de acción. Su eficacia concreta para Nuevo León requiere estudios locales y evaluación de programas.',
    ] },
    { heading: '5. Discusión', paragraphs: [
      'La discusión central consiste en evitar que el bienestar socioemocional se formule únicamente como responsabilidad individual del docente. La literatura aborda tanto el desarrollo de competencias emocionales y la preparación del profesorado como la relación entre condiciones laborales y malestar psicológico. Los resultados deben interpretarse según el contexto y las limitaciones de cada estudio.',
      'Los resultados coinciden con Bisquerra Alzina (2003) en que la educación emocional requiere profesorado preparado, pero muestran un matiz: la preparación individual es necesaria y no suficiente. Si las competencias emocionales se desarrollan en condiciones de sobrecarga, el esfuerzo de regulación puede convertirse en un costo, tal como lo sugieren los hallazgos sobre la actuación superficial y el agotamiento (Kariou et al., 2021; Yin et al., 2019).',
      'La diversidad conceptual que documentan Hascher y Waber (2021) ayuda a explicar por qué la evidencia local es difícil de comparar: sin una definición explícita de bienestar y sin instrumentos comunes, los estudios miden cosas distintas. Esto refuerza la necesidad de que futuras investigaciones en Nuevo León precisen la dimensión del bienestar que estudian.',
      'El antecedente de Sieglin y Ramos Tovar (2007) es valioso por ser local, pero su antigüedad y el tipo de muestra impiden extrapolarlo a la situación actual. En el mismo sentido, la relación entre formación socioemocional y formación docente que plantean García Pérez y Garza Ruíz (2022) abre una línea de trabajo, aunque su efecto en el bienestar del profesorado de la entidad aún debe evaluarse.',
      'Como límites, esta revisión no documenta todavía su búsqueda de forma reproducible, se apoya en un número reducido de fuentes y no incluye datos primarios. Por ello, sus resultados son orientadores y no concluyentes.',
    ] },
    { heading: '6. Conclusiones', paragraphs: [
      'En respuesta a la pregunta de investigación, los desafíos identificados son de orden institucional: el desajuste entre demandas emocionales y recursos, la carga administrativa, la falta de apoyos accesibles y la escasa evidencia local que permita orientar decisiones.',
      'Como líneas de acción institucional se propone: desarrollar mecanismos accesibles y confidenciales de orientación y apoyo psicológico; revisar tareas administrativas y priorizar actividades vinculadas con la enseñanza; reservar tiempos para comunidades de práctica y acompañamiento entre pares; y fortalecer la formación de directivos y supervisores en liderazgo sensible, manejo de conflictos y protección de la autonomía profesional.',
      'En conclusión provisional, el bienestar socioemocional docente debe examinarse como una responsabilidad compartida y una condición de sostenibilidad educativa, no como una competencia aislada que cada profesor deba resolver por cuenta propia. Una política institucional coherente necesita articular formación, apoyo profesional, organización del trabajo, colaboración y liderazgo. La conclusión definitiva requiere completar la verificación de fuentes, documentar la búsqueda y, en estudios posteriores, recoger datos del profesorado de Nuevo León.',
    ] },
  ],
  references: [
    'Bisquerra Alzina, R. (2003). Educación emocional y competencias básicas para la vida. Revista de Investigación Educativa, 21(1), 7–43. https://revistas.um.es/rie/article/view/99071',
    'García Pérez, J. L., & Garza Ruíz, B. A. (2022). Educación socioemocional y formación docente. Revista RELEP: Educación y Pedagogía en Latinoamérica, 4(2), 32–45. https://doi.org/10.46990/relep.2022.4.2.606',
    'Hascher, T., & Waber, J. (2021). Teacher well-being: A systematic review of the research literature from the year 2000–2019. Educational Research Review, 34, Article 100411. https://doi.org/10.1016/j.edurev.2021.100411',
    'Kariou, A., Koutsimani, P., Montgomery, A., & Lainidi, O. (2021). Emotional labor and burnout among teachers: A systematic review. International Journal of Environmental Research and Public Health, 18(23), Article 12760. https://doi.org/10.3390/ijerph182312760',
    'Sieglin, V., & Ramos Tovar, M. E. (2007). Estrés laboral y depresión entre maestros del área metropolitana de Monterrey. Revista Mexicana de Sociología, 69(3), 517–551. https://www.scielo.org.mx/scielo.php?pid=S0188-25032007000300005&script=sci_arttext',
    'Yin, H., Huang, S., & Chen, G. (2019). The relationships between teachers’ emotional labor and their burnout and satisfaction: A meta-analytic review. Educational Research Review, 28, Article 100283. https://doi.org/10.1016/j.edurev.2019.100283',
  ],
};

// ───────────────────────────── 002 ─────────────────────────────
export const ARTICLE_002: StaticArticle = {
  id: '002',
  category: 'Bitácora docente · Investigación educativa',
  title: 'Investigar no es cosa de científicos: es la forma en que todos tomamos decisiones',
  excerpt: 'El Dr. Roberto Hernández Sampieri presentó la investigación como la competencia que más buscan las empresas y que cualquier maestro puede ejercer en su salón.',
  date: '26 de octubre de 2026',
  image: '/articulos/002-portada-hernandez-sampieri.jpg',
  imageAlt: 'El Dr. Roberto Hernández Sampieri durante su conferencia en la Benemérita Escuela Normal Miguel F. Martínez',
  author: 'Carlos Ismael Estala Coronado',
  method: 'Bitácora de conferencia · estudio cualitativo descriptivo',
  area: 'Investigación educativa · Formación docente',
  pregunta: '¿Qué aportes ofrece la conferencia del Dr. Roberto Hernández Sampieri para comprender la investigación como competencia docente y para elegir la ruta metodológica a partir del planteamiento del problema?',
  objetivo: 'Analizar los planteamientos de la conferencia sobre el sentido de la investigación y las rutas cuantitativa, cualitativa y mixta, e identificar sus implicaciones para la práctica docente en educación primaria.',
  keywords: 'investigación educativa; planteamiento del problema; ruta cuantitativa; ruta cualitativa; métodos mixtos; formación docente',
  abstract: 'En la Jornada de Habilitación Docente de Nuevo León, el Dr. Roberto Hernández Sampieri presentó la investigación como la competencia que más buscan las empresas, la que mueve la economía de los países y la que cualquier maestro puede ejercer en su salón. Este artículo tiene como objetivo analizar sus planteamientos sobre el sentido de la investigación y la elección de la ruta metodológica, e identificar implicaciones para la práctica docente en primaria. Se trata de un estudio cualitativo descriptivo basado en una bitácora de conferencia, con registro de la exposición y de las diapositivas, y un análisis temático de las notas. Los resultados se organizan en ocho ejes: para qué sirve investigar, la relación entre investigación y desarrollo, la investigación como competencia laboral, su carácter cotidiano, las tres rutas, el componente objetivo y subjetivo de la realidad, la distinción entre variables y conceptos, y dos casos ilustrativos. La discusión contrasta estos ejes con la literatura metodológica y con la tradición del docente investigador. Se concluye que el planteamiento del problema, y no la preferencia del investigador, define la ruta, y que el aula de primaria ofrece problemas que pueden abordarse con cualquiera de ellas.',
  ethics: [
    'El autor declara que el artículo es original y que las ideas del ponente y de otros autores están atribuidas y referenciadas.',
    'Manejo ético de datos: la conferencia fue un evento académico público; se cita al ponente por su participación pública y no se identifica a ningún asistente. Las cifras que mencionó el ponente se presentan como parte de su exposición, no como datos verificados por el autor.',
    IA_DECLARACION,
  ],
  event: [
    ['Evento', 'Jornada de Habilitación Docente «Horizontes de la investigación en la formación docente»'],
    ['Organiza', 'Secretaría de Educación de Nuevo León · Subsecretaría de Desarrollo Magisterial, Dirección de Desarrollo Académico'],
    ['Conferencia', '¿Para qué sirve la investigación? El planteamiento del problema define la ruta de la investigación: cuantitativa, cualitativa o mixta'],
    ['Ponente', 'Dr. Roberto Hernández Sampieri'],
    ['Sede y fecha', 'Benemérita Escuela Normal Miguel F. Martínez, Monterrey, N. L. · 22 de octubre de 2026'],
  ],
  sections: [
    { heading: '1. Introducción', paragraphs: [
      'Cuando a un estudiante le anuncian que llevará un curso de métodos de investigación, la reacción suele ser la misma en cualquier país: «eso no me sirve para nada, ¡qué pérdida de tiempo!, si yo no voy a ser científico ni investigador». Con esa escena arrancó el Dr. Hernández Sampieri, autor del conocido libro Metodología de la investigación, frente a un auditorio de maestros, directivos y estudiantes normalistas. Contó que ha visto esa misma cara en Nuevo León, Bolivia, Perú, Puerto Rico, España y Estados Unidos, y que él mismo la puso cuando era universitario.',
      'Al pedir que levantaran la mano quienes querían dedicarse a la investigación, apenas unos cuantos lo hicieron. Su respuesta fue el eje de toda la charla: aunque casi nadie quiera ser investigador, todos vamos a investigar en nuestra vida profesional.',
      'Ese rechazo inicial es el problema que motiva este artículo: si el profesorado percibe la investigación como ajena a su trabajo, difícilmente la usará para conocer a su grupo y tomar mejores decisiones. Por ello se plantea la pregunta: ¿qué aportes ofrece la conferencia para comprender la investigación como competencia docente y para elegir la ruta metodológica a partir del planteamiento del problema? El objetivo es analizar sus planteamientos e identificar implicaciones para la práctica en primaria.',
      'Tras esta introducción se presenta el marco teórico; luego, la metodología con la que se elaboró la bitácora; después, los resultados organizados por ejes temáticos; la discusión con la literatura y, finalmente, las conclusiones.',
    ] },
    { heading: '2. Marco teórico', paragraphs: [
      'La idea del docente como investigador tiene una larga tradición. Stenhouse (1987) propuso que la enseñanza puede ser objeto de investigación por parte de quien enseña, de modo que el aula se convierte en un espacio para poner a prueba ideas y no solo para aplicarlas. Elliott (1990) desarrolló esta perspectiva en la investigación-acción, en la que el profesorado identifica un problema de su práctica, actúa, observa y reflexiona en ciclos sucesivos. Schön (1998), por su parte, describió la reflexión en la acción como el modo en que los profesionales resuelven situaciones inciertas que no encajan en reglas preestablecidas.',
      'En el plano metodológico, Hernández-Sampieri y Mendoza (2018) organizan la investigación en tres rutas, cuantitativa, cualitativa y mixta, y sostienen que la elección depende del planteamiento del problema. La ruta cuantitativa mide variables y prueba hipótesis con análisis estadístico; la cualitativa busca comprender significados a partir de datos narrativos y visuales; la mixta integra ambas. Creswell y Creswell (2018) coinciden en que el diseño debe derivarse del problema y de las preguntas, y no de una preferencia previa del investigador.',
      'Los métodos mixtos se han defendido como un paradigma propio, sustentado en una postura pragmática que privilegia la pregunta de investigación por encima de la disputa entre enfoques (Johnson & Onwuegbuzie, 2004). Esta postura es la base de la idea, central en la conferencia, de no «casarse» con un enfoque.',
    ] },
    { heading: '3. Metodología', paragraphs: [
      'Se trata de un estudio cualitativo descriptivo. El instrumento fue una bitácora docente, entendida como un registro personal y sistemático que permite documentar y analizar experiencias formativas (Zabalza, 2004). La bitácora se elaboró durante la conferencia presencial del 22 de octubre de 2026 en la Benemérita Escuela Normal Miguel F. Martínez de Monterrey.',
      'Las fuentes de información fueron la exposición oral del ponente, sus diapositivas, registradas en fotografía (Figuras 1 y 2), y las intervenciones del público. Las notas se transcribieron el mismo día y se completaron con las fotografías para precisar datos y términos.',
      'El análisis siguió un procedimiento temático (Braun & Clarke, 2022): lectura completa de las notas, codificación de ideas, agrupación de códigos en ejes y revisión de los ejes contra el registro original. De ese proceso surgieron los ocho ejes que organizan los resultados y la síntesis de la Tabla 1.',
      'Consideraciones éticas: la conferencia fue un evento académico público; se atribuyen las ideas al ponente y no se identifica a ningún asistente. Como límite, se trata de un registro de una sola persona, por lo que la selección de ideas refleja su interpretación; las cifras y casos que mencionó el ponente se reportan como parte de su exposición y no fueron verificados de manera independiente.',
    ] },
    { heading: '4. Resultados', paragraphs: [
      'Los resultados se presentan en ocho ejes temáticos que surgieron del análisis de la bitácora.',
    ] },
    { heading: '4.1 Para qué sirve investigar', paragraphs: [
      'El primer propósito es conocer los fenómenos que nos rodean, desde los agujeros negros hasta el origen del universo. El ponente recorrió cómo ha cambiado nuestra idea de su tamaño: de pensar que la Tierra era un grano de arena, a saber que nuestra galaxia también lo es, y hoy a sospechar que el universo conocido es apenas una parte de lo que existe.',
      'También sirve para conocernos a nosotros mismos, desde nuestro ADN hasta nuestros motivos más profundos. Descubrir la estructura del ADN permitió desarrollar medicamentos para padecimientos específicos, y mencionó avances contra el Alzheimer y una vacuna contra el cáncer de piel en fase final de ensayos clínicos.',
      'La investigación ayuda además a comprender las causas de un conflicto bélico o de un desastre natural, y a resolver toda clase de problemas: por qué falla un sistema de producción, cómo se origina un conflicto en la familia o cómo puede mejorar el bienestar de una comunidad. Y recordó que la pandemia se resolvió con investigación: sin vacunas ni medicamentos probados, el panorama habría sido muy distinto.',
    ], quote: 'Investigar es reunir información para tomar decisiones. Y lo hacemos todo el tiempo.' },
    { heading: '4.2 Países, empresas y universidades', paragraphs: [
      'Con una gráfica de la inversión en investigación y desarrollo al inicio de la pandemia (véase Figura 1), mostró que los países más desarrollados son los que más invierten. Estados Unidos y China destacan por el monto total; Corea del Sur e Israel, por el porcentaje de su PIB; y naciones como Finlandia, Dinamarca o Singapur, por su número de investigadores por habitante. México aparece en la esquina inferior, entre los que menos invierten.',
      'En el mundo empresarial, las compañías que más invierten en investigación, como Alphabet (Google, YouTube), Amazon y Apple, son también las de mayor crecimiento. Amazon, explicó, investiga a cada cliente para ofrecerle justo lo que le interesa. En la educación superior ocurre lo mismo: las universidades mejor posicionadas en los rankings son las que más invierten en investigación.',
      'Lanzó una pregunta incómoda: ¿por qué no hay un celular o un automóvil diseñado y fabricado en México? Su respuesta fue que no hemos puesto el énfasis en la investigación. Lo contrastó con el caso de los zapateros de León, Guanajuato, que gracias a un estudio colaborativo recuperaron su mercado frente al calzado importado.',
    ], figure: { src: '/articulos/002-inversion-id.jpg', caption: 'Figura 1. Inversión en I+D como porcentaje del PIB frente a investigadores por millón de habitantes; el tamaño de cada círculo refleja el gasto total del país. Fuente: diapositiva de la conferencia, fotografía del autor.' } },
    { heading: '4.3 La competencia que buscan las empresas', paragraphs: [
      'Citó un estudio de ManpowerGroup según el cual, en 2023, cerca de ocho de cada diez empresas en el mundo no encontraban el talento que necesitaban, y en México alrededor del 70% reportaba lo mismo en 2025. La competencia más solicitada no son los idiomas ni el manejo de tecnología, aunque ambos importan: es la capacidad de reunir y analizar información para tomar decisiones. Es decir, investigación, aunque las empresas no la llamen así.',
      'Los educadores, añadió, tienen cabida también en las empresas, sobre todo en capacitación, una necesidad creciente con la llegada de la inteligencia artificial. Y un buen alcalde, un consultor o un emprendedor necesitan investigar: buena parte de los negocios en América Latina no llega a los tres años por no estudiar su mercado antes de abrir.',
    ] },
    { heading: '4.4 Investigar es parte de nuestra naturaleza', paragraphs: [
      'Para derribar el mito de que investigar es complicado, recurrió a ejemplos cotidianos. Un bebé que escucha un ruido voltea a buscar de dónde viene: ya está investigando. Cuando alguien nos atrae, revisamos sus redes y preguntamos por esa persona. Al comprar ropa, preguntamos a otros cómo se nos ve. La diferencia está en hacerlo con un método más formal.',
      'Compartió historias de jóvenes que transformaron su entorno: un estudiante en Panamá que diseñó con materiales naturales un sistema para llevar agua a su comunidad, y una joven de 19 años que investigó las propiedades térmicas del plástico PET y terminó fabricando ladrillos con él, hasta abrir plantas en otros estados y en Europa.',
      'El caso más memorable fue el del agua embotellada en México. A finales de los años ochenta, un gerente de una embotelladora en Cuernavaca intuyó que el agua podía ser un producto. Con encuestas, pruebas de mercado y estudios mixtos sustentaron la idea; el corporativo la rechazó por absurda, pero les permitieron probarla en su región. Hoy el agua embotellada es un mercado enorme, y todo nació de una investigación bien hecha.',
    ] },
    { heading: '4.5 Tres rutas para investigar', paragraphs: [
      'La segunda parte de la conferencia entró de lleno en la metodología. Todo estudio comienza con una idea y con reflexionar sobre la naturaleza del problema. De esa reflexión depende el camino: la ruta cuantitativa, la cualitativa o la mixta, que combina ambas. Hoy, insistió, no se trata de casarse con un enfoque, sino de plantear bien el problema y decidir con flexibilidad.',
      'La ruta cuantitativa es secuencial: no se pueden analizar datos que no se han recolectado, ni recolectarlos sin haber definido la población, establecido hipótesis, revisado la literatura y planteado el problema. Parte de una teoría y la contrasta con los hechos mediante la medición.',
      'La ruta cualitativa es más circular. También empieza con una idea, pero el problema se va afinando conforme se conoce el contexto. En lugar de partir de una teoría, se examinan los hechos y, a partir de ellos, se construye la interpretación. No hay medición: se analizan narrativas orales y escritas, documentos, fotografías y otros materiales visuales para reconstruir la realidad.',
      'La ruta mixta permite integrar ambas miradas y acumular evidencia en el camino. Su ejemplo, muy cercano a nosotros, fue la enseñanza de las matemáticas: puedo medir cuantitativamente el nivel de los alumnos y, a la vez, entrevistarlos para entender cómo razonan y qué saben, para luego diseñar mejores formas de enseñar.',
    ], quote: 'El planteamiento del problema define la ruta de la investigación.' },
    { heading: '4.6 Toda realidad tiene dos caras', paragraphs: [
      'El ponente sostuvo que casi cualquier fenómeno tiene un componente objetivo y uno subjetivo. En una escuela, una dependencia o una empresa hay datos medibles: cuántos alumnos hay inscritos, cuántos maestros, cuánto vale una acción en la bolsa. Pero también hay percepciones, relaciones y significados que no se miden con números.',
      'El futbol lo ilustra bien. Lo cuantitativo son los goles, los duelos defensivos, la velocidad de cada jugador o los patrones de juego, que hoy se analizan con tecnología y grandes bases de datos. Lo cualitativo es la alegría de jugar, el drama de perder o la pasión por un equipo. Incluso hechos físicos como la presión arterial, que parecen totalmente objetivos, cambian según la altitud de la ciudad; y el tiempo mismo no transcurre igual en la Tierra que cerca de un agujero negro.',
      'De ahí su advertencia: los datos numéricos son más objetivos, pero no del todo, porque hay que interpretarlos; y los datos narrativos tampoco son puramente subjetivos, pues en el análisis cualitativo también importa la frecuencia con que aparece un tema. Para elegir la ruta usó ejemplos domésticos: para colgar un cuadro basta un martillo, pero si la mesa está astillada se necesita una lija, y si falla la plomería ninguno de los dos sirve. Así, el planteamiento cuantitativo responde a la necesidad de estimar magnitudes o relaciones entre variables, y el cualitativo, a la de comprender e interpretar un fenómeno.',
    ] },
    { heading: '4.7 Variables y conceptos', paragraphs: [
      'Una aclaración que sorprendió al auditorio: los planteamientos cuantitativos trabajan con variables, que se miden; los cualitativos trabajan con conceptos, categorías y construcciones que se van analizando (véase Figura 2). Por eso, afirmó, es un error hablar de «variables cualitativas»: si algo se mide, es cuantitativo, aunque sea una variable nominal. En la ruta cuantitativa se miden emociones o actitudes y se buscan correlaciones; en la cualitativa se busca comprenderlas y profundizar en experiencias de vida y significados. La Tabla 1 sintetiza las diferencias entre ambas rutas.',
    ], quote: 'No existe la variable cualitativa.',
      figure: { src: '/articulos/002-variables-conceptos.jpg', caption: 'Figura 2. Los problemas cuantitativos trabajan con variables y constructos; los cualitativos, con conceptos, categorías, temas y patrones. Fuente: diapositiva de la conferencia, fotografía del autor.' },
      table: { caption: 'Tabla 1. Diferencias entre las rutas cuantitativa y cualitativa. Elaboración propia a partir de la conferencia.', headers: ['', 'Cuantitativa', 'Cualitativa'], rows: [
        ['Lógica', 'Deductiva: de la teoría a los hechos', 'Inductiva: de los hechos a la interpretación'],
        ['Proceso', 'Secuencial; no se saltan etapas', 'Circular; el problema se afina en el camino'],
        ['Trabaja con', 'Variables que se miden', 'Conceptos, categorías, temas y patrones'],
        ['Datos', 'Números, mediciones, estadística', 'Narrativas, entrevistas, documentos, imágenes'],
        ['Análisis', 'Estadístico, correlaciones, hipótesis', 'Temático (codificación)'],
        ['Busca', 'Estimar magnitudes y relaciones', 'Comprender significados y experiencias'],
      ] } },
    { heading: '4.8 Dos casos, dos rutas', paragraphs: [
      'Un estudio cuantitativo. Empresas automotrices de la región de Celaya pidieron a su centro de investigación medir el clima laboral, correlacionar sus variables y conocer el efecto de cada una sobre la productividad. Como se trataba de variables medibles, como la satisfacción laboral o la autonomía, el estudio fue cuantitativo y se resolvió con modelos estadísticos de regresión.',
      'Un estudio cualitativo. En una embotelladora, las áreas de producción, control de calidad y mantenimiento vivían en conflicto permanente, al grado de que se compraban los peores lubricantes para que las botellas de vidrio cayeran de las bandas y la línea tuviera que detenerse. Aquí no había nada que medir: había que comprender. Con entrevistas a todo el personal y grupos de enfoque descubrieron que el conflicto venía de los propios jefes, que transmitían su enemistad a sus equipos. La solución implicó nombrar nuevos gerentes y un proceso de cambio que tomó alrededor de tres años.',
    ] },
    { heading: '5. Discusión', paragraphs: [
      'El eje central de la conferencia, que el planteamiento del problema define la ruta, coincide con la propuesta de Hernández-Sampieri y Mendoza (2018) y con la de Creswell y Creswell (2018), para quienes el diseño se deriva de las preguntas de investigación. La insistencia en no «casarse» con un enfoque se sustenta en la postura pragmática de los métodos mixtos descrita por Johnson y Onwuegbuzie (2004), que privilegia la pregunta por encima de la disputa entre paradigmas.',
      'La afirmación de que «no existe la variable cualitativa» merece una lectura cuidadosa. En la tradición estadística es común llamar cualitativas o categóricas a las variables nominales; el ponente no niega su existencia, sino que subraya que, al medirlas y contarlas, se trabaja dentro de la ruta cuantitativa. Esta precisión terminológica es útil en la formación docente porque evita confundir el tipo de dato con el enfoque de la investigación.',
      'La idea de que todos investigamos, y de que el aula es un lugar privilegiado para hacerlo, dialoga con Stenhouse (1987), quien situó la investigación en el corazón de la enseñanza, y con Elliott (1990), cuya investigación-acción ofrece un camino concreto para que el profesorado estudie su práctica. La reflexión en la acción descrita por Schön (1998) explica por qué esta actitud no es un lujo académico: el trabajo docente está lleno de situaciones inciertas que exigen observar, preguntar y decidir.',
      'Una diferencia con la literatura es el énfasis económico de la conferencia: los ejemplos de empresas y países ilustran el valor social de investigar, pero la tradición educativa pone el acento en la mejora de la enseñanza y en la autonomía profesional. Ambas miradas son compatibles si se entiende que el beneficio último de la investigación docente es el aprendizaje de los alumnos. Como límite, este análisis se basa en el registro de una sola conferencia y de un solo observador.',
    ] },
    { heading: '6. Conclusiones', paragraphs: [
      'En respuesta a la pregunta de investigación, la conferencia aporta dos ideas para la formación docente. La primera es que investigar no es un lujo académico, sino una forma de reunir información para tomar decisiones que cualquier maestro puede ejercer. La segunda es que no hay un método mejor que otro, sino problemas que piden herramientas distintas: antes de preguntar «¿cómo lo voy a investigar?», hay que preguntarse con claridad «¿qué quiero saber de mis alumnos?».',
      'La idea que más interpela al autor es que la investigación no está desconectada de la realidad: tiene que ver con la familia, la salud y, sobre todo, con la educación. Como docentes, tenemos muchísimo que investigar de nuestros grupos: conocer mejor a los niños, saber qué les funciona y experimentar con métodos alternativos. El ponente advirtió además que la inteligencia artificial para la enseñanza ya viene en camino y que podremos aprovecharla, pero sin entregarnos a ella por completo.',
      'Si queremos formar niños capaces de resolver problemas, primero debemos ejercer esa misma actitud en nuestra práctica: observar, preguntar, registrar y decidir. Como línea futura, se propone documentar con el mismo procedimiento pequeñas investigaciones de aula que combinen datos medibles y la voz de los alumnos.',
    ], box: { title: 'Implicaciones para el aula', items: [
      ['Empezar por el problema', 'Antes de elegir instrumento, preguntarme qué quiero saber de mi grupo y si se mide o se comprende.'],
      ['Lo cuantitativo', 'Asistencia, resultados de evaluaciones, tiempo de lectura, avance en cálculo mental: datos para ver tendencias.'],
      ['Lo cualitativo', 'Escuchar cómo explican sus procedimientos, revisar sus cuadernos, observar el recreo y conversar con las familias.'],
      ['Lo mixto', 'Ver qué alumnos bajan en matemáticas y después entrevistarlos para entender por qué.'],
      ['Indagar con ellos', 'Pequeñas encuestas, registros y observaciones donde los alumnos sean también investigadores.'],
    ] } },
  ],
  references: [
    BRAUN,
    'Creswell, J. W., & Creswell, J. D. (2018). Research design: Qualitative, quantitative, and mixed methods approaches (5th ed.). SAGE.',
    'Elliott, J. (1990). La investigación-acción en educación. Morata.',
    JORNADA_HS,
    HS_MENDOZA,
    'Johnson, R. B., & Onwuegbuzie, A. J. (2004). Mixed methods research: A research paradigm whose time has come. Educational Researcher, 33(7), 14–26. https://doi.org/10.3102/0013189X033007014',
    'Schön, D. A. (1998). El profesional reflexivo: Cómo piensan los profesionales cuando actúan. Paidós.',
    STENHOUSE,
    ZABALZA,
  ],
};

// ───────────────────────────── 003 ─────────────────────────────
export const ARTICLE_003: StaticArticle = {
  id: '003',
  category: 'Bitácora docente · Investigación educativa',
  title: 'Investigar no empieza con una respuesta: empieza leyendo lo que otros ya descubrieron',
  excerpt: 'El Dr. Alfredo Torrico mostró paso a paso cómo construir la matriz de la cuestión, la herramienta que convierte una idea en un objeto de estudio y en una pregunta de investigación.',
  date: '26 de octubre de 2026',
  image: '/articulos/003-portada-matriz.jpg',
  imageAlt: 'El Dr. Alfredo Torrico explica la matriz de la cuestión frente a una diapositiva con la tabla de estudios',
  author: 'Carlos Ismael Estala Coronado',
  method: 'Bitácora de conferencia · estudio cualitativo descriptivo',
  area: 'Investigación educativa · Formación docente',
  pregunta: '¿Cómo se construye una pregunta de investigación sustentada en evidencia mediante la matriz de la cuestión, según la propuesta del Dr. Alfredo Torrico, y qué implica para la práctica docente?',
  objetivo: 'Describir la ruta de la matriz de la cuestión presentada en la conferencia y analizar sus implicaciones para que docentes y normalistas formulen preguntas de investigación delimitadas y sustentadas en evidencia.',
  keywords: 'matriz de la cuestión; objeto de estudio; vacíos del conocimiento; pregunta de investigación; bases de datos; inteligencia artificial',
  abstract: 'En el segundo día de la Jornada de Habilitación Docente, el Dr. Alfredo Torrico, de Caribbean University, mostró cómo construir la matriz de la cuestión, la herramienta que convierte una idea en un objeto de estudio y, más adelante, en una pregunta de investigación sustentada en evidencia científica. Este artículo tiene como objetivo describir esa ruta y analizar sus implicaciones para la práctica docente. Se trata de un estudio cualitativo descriptivo basado en una bitácora de conferencia, con registro de la exposición, de las diapositivas y del diálogo con el público, y un análisis temático de las notas. Los resultados describen los siete pasos de la ruta (idea, evidencia, matriz, análisis comparativo, objeto de estudio, vacíos y pregunta) y los temas que surgieron en el diálogo: los vacíos en el contexto local, el uso de fuentes clásicas y recientes, los resultados negativos, la delimitación, las bases de datos y el uso responsable de la inteligencia artificial. La discusión relaciona la matriz con la tipología de revisiones de la literatura y con las pautas de transparencia de las revisiones sistemáticas. Se concluye que una buena pregunta no se inventa: se construye leyendo, comparando y detectando lo que falta.',
  ethics: [
    'El autor declara que el artículo es original y que las ideas del ponente, de los participantes y de otros autores están atribuidas y referenciadas.',
    'Manejo ético de datos: la conferencia fue un evento académico público; se cita al ponente por su participación pública y las intervenciones del público se reportan sin identificar a ninguna persona.',
    IA_DECLARACION,
  ],
  event: [
    ['Evento', 'Jornada de Habilitación Docente «Horizontes de la investigación en la formación docente»'],
    ['Organiza', 'Secretaría de Educación de Nuevo León · Subsecretaría de Desarrollo Magisterial, Dirección de Desarrollo Académico'],
    ['Tema', 'La matriz de la cuestión: de la idea de investigación a los vacíos del conocimiento'],
    ['Ponente', 'Dr. Alfredo Torrico, Caribbean University (Puerto Rico)'],
    ['Sede y fecha', 'Benemérita Escuela Normal Miguel F. Martínez, Monterrey, N. L. · 23 de octubre de 2026'],
  ],
  sections: [
    { heading: '1. Introducción', paragraphs: [
      'Si la conferencia del día anterior nos convenció de que investigar sirve para todo (Hernández Sampieri, 2026), la segunda jornada respondió a la pregunta inevitable: ¿por dónde empiezo? El Dr. Alfredo Torrico, de Caribbean University en Puerto Rico, dedicó su exposición a una herramienta concreta, la matriz de la cuestión, y a un mensaje que repitió de distintas formas: antes de formular una pregunta de investigación hay que conocer qué se ha investigado ya sobre el tema (Torrico, 2026).',
      'Su sesión fue muy participativa. Estudiantes normalistas, docentes formadores y un investigador invitado de Puerto Rico intervinieron con preguntas y comentarios que enriquecieron el contenido, y buena parte de lo que aquí se recoge nació de ese diálogo.',
      'El problema que motiva este artículo es frecuente en la formación docente: se pide investigar, pero las preguntas suelen formularse a partir de ocurrencias y no de lo que ya se sabe. Por ello se plantea la pregunta: ¿cómo se construye una pregunta de investigación sustentada en evidencia mediante la matriz de la cuestión, y qué implica para la práctica docente? El objetivo es describir la ruta y analizar sus implicaciones.',
      'Tras esta introducción se presenta el marco teórico; luego, la metodología de la bitácora; después, los resultados; la discusión con la literatura y, finalmente, las conclusiones.',
    ] },
    { heading: '2. Marco teórico', paragraphs: [
      'Toda investigación parte de un planteamiento del problema que se nutre de la revisión de la literatura: conocer qué se ha estudiado permite precisar el problema, evitar repetir trabajos y justificar el aporte (Hernández-Sampieri & Mendoza, 2018). En ese sentido, la revisión de la literatura no es un trámite, sino el paso que convierte una inquietud en un objeto de estudio.',
      'Existen distintos tipos de revisión. Grant y Booth (2009) describieron catorce, desde la revisión narrativa hasta la sistemática, y mostraron que se distinguen por cómo buscan, evalúan, sintetizan y analizan los estudios. Booth et al. (2016) insistieron en que una revisión de calidad requiere una búsqueda explícita, criterios de selección claros y una síntesis organizada, de modo que otra persona pueda seguir el mismo camino.',
      'Para las revisiones sistemáticas, la declaración PRISMA 2020 establece qué debe informarse para que una revisión sea transparente: fuentes consultadas, estrategia de búsqueda, criterios de inclusión y el flujo de estudios seleccionados (Page et al., 2021). Aunque la matriz de la cuestión no es una revisión sistemática, comparte su lógica de registrar y comparar estudios de manera ordenada.',
      'Finalmente, la escritura académica exige citar con rigor. El manual de la American Psychological Association (2020) establece las normas de citas y referencias, y la guía de estilo APA incluye orientaciones para citar el contenido generado con inteligencia artificial (McAdoo, 2023).',
    ] },
    { heading: '3. Metodología', paragraphs: [
      'Se trata de un estudio cualitativo descriptivo. El instrumento fue una bitácora docente, entendida como un registro personal y sistemático que permite documentar y analizar experiencias formativas (Zabalza, 2004). La bitácora se elaboró durante la conferencia presencial del 23 de octubre de 2026 en la Benemérita Escuela Normal Miguel F. Martínez de Monterrey.',
      'Las fuentes fueron la exposición del ponente, sus diapositivas, registradas en fotografía (Figuras 1 a 4), y el diálogo con el público. Las notas se transcribieron el mismo día y se contrastaron con las fotografías para precisar términos y cifras.',
      'El análisis siguió un procedimiento temático (Braun & Clarke, 2022): lectura de las notas, codificación de ideas, agrupación en temas y revisión de los temas contra el registro original. Así se obtuvieron la síntesis de la ruta (Tabla 1) y los temas del diálogo que se presentan en los resultados.',
      'Consideraciones éticas: el evento fue público; se atribuyen las ideas al ponente y las intervenciones del público se reportan sin identificar a nadie. Como límite, el registro es de un solo observador, y las cifras mencionadas (costos de publicación o tamaño de bases de datos) se reportan como parte de la exposición, sin verificación independiente.',
    ] },
    { heading: '4. Resultados', paragraphs: [
      'Los resultados se presentan en dos partes: primero, la ruta de la matriz de la cuestión (apartados 4.1 y 4.2); después, los temas que surgieron del diálogo con el público (apartados 4.3 a 4.8).',
    ] },
    { heading: '4.1 La matriz de la cuestión', paragraphs: [
      'El punto de partida es una idea, que el ponente definió como la descripción de la realidad observada, acompañada de sus palabras clave. Con ellas se buscan estudios científicos, de preferencia artículos o tesis doctorales de los últimos cinco años, y se registran en una tabla: año, país, autor, título y resultados de partida (véase Figura 1).',
      'Hizo una aclaración importante: los resultados de partida no son las conclusiones del artículo. Son lo que yo identifico en ese estudio desde la mirada de mi propia idea, en unas quince palabras. Si me limito a copiar fragmentos, solo genero un documento paralelo sin aporte; la gracia está en leer, entender y extraer lo esencial.',
      'Y eso exige tiempo. Un artículo científico ronda las dieciocho páginas, y para comprenderlo hay que leerlo hasta tres veces: entender desde qué posición escribe el autor, en qué contexto, con qué datos y qué quiere comunicar. «Parece fácil», advirtió, «pero requiere muchas horas». En esta etapa, además, todavía no se discute la metodología: primero hay que dejar que la idea madure a partir de la lectura.',
    ], figure: { src: '/articulos/003-portada-matriz.jpg', caption: 'Figura 1. Estructura de la matriz de la cuestión: idea, año, país, autor, título y resultados de partida de cada estudio revisado. Fuente: diapositiva de la conferencia, fotografía del autor.' } },
    { heading: '4.2 Del análisis al objeto de estudio', paragraphs: [
      'Con los estudios en la matriz viene el análisis comparativo integral (véase Figura 2), que se apoya en cuatro preguntas: ¿qué resultados se repiten? (patrones), ¿en qué coinciden los estudios? (convergencias), ¿qué resultados difieren? (divergencias) y ¿qué hallazgos son incompatibles? (contradicciones). De ahí surge el objeto de estudio: la parte de la realidad que pretendo estudiar, ahora construida con base en evidencia y no en ocurrencias.',
      'Según explicó, hasta aquí llegan las tesis de licenciatura y maestría, que son aplicaciones del conocimiento existente a contextos concretos. El doctorado da un paso más: una segunda búsqueda, más específica, centrada en el objeto de estudio, para analizar tendencias, omisiones y aspectos que permanecen sin explicación, y así identificar los vacíos del conocimiento. De esos vacíos nace la pregunta de investigación. La Tabla 1 resume la ruta completa.',
    ], figure: { src: '/articulos/003-analisis-comparativo.jpg', caption: 'Figura 2. El análisis comparativo integral lleva de la matriz al objeto de estudio. Fuente: diapositiva de la conferencia, fotografía del autor.' },
      table: { caption: 'Tabla 1. Ruta de la idea a la pregunta de investigación. Elaboración propia a partir de la conferencia.', headers: ['Paso', 'Etapa', 'Qué se hace'], rows: [
        ['1', 'Idea', 'Describir la realidad que observo y anotar sus palabras clave.'],
        ['2', 'Evidencia científica', 'Buscar artículos o tesis doctorales de los últimos cinco años.'],
        ['3', 'Matriz', 'Registrar año, país, autor, título y resultados de partida (≈15 palabras).'],
        ['4', 'Análisis comparativo integral', 'Patrones, convergencias, divergencias y contradicciones.'],
        ['5', 'Objeto de estudio', 'La parte de la realidad que pretendo estudiar. Aquí llegan licenciatura y maestría.'],
        ['6', 'Vacíos del conocimiento', 'Tendencias, omisiones y lo que sigue sin explicación (nivel doctoral).'],
        ['7', 'Pregunta de investigación', 'La que mi estudio pretende responder.'],
      ] } },
    { heading: '4.3 Los vacíos están en el contexto', paragraphs: [
      'Una de las intervenciones más útiles vino del público. Hablar de vacíos del conocimiento suena a algo imposible, se dijo, pero cambia si se mira desde el contexto: quizá haya mucho escrito sobre el normalismo en el mundo o en México, pero difícilmente existe un estudio sobre el tercero B de la generación 2025-2026 en un contenido específico de primaria. Ahí está la oportunidad para investigar y, con los resultados, proponer mejoras a quienes dirigen la escuela.',
      'El investigador invitado de Puerto Rico añadió un matiz: el vacío hay que revisarlo a nivel local, nacional e internacional, y no hay que confundir la falta de vacíos con la zona de confort. Decir «no hay nada» muchas veces significa «no busqué lo suficiente».',
    ], quote: 'Si siempre te dicen que no hay nada… siempre hay algo.' },
    { heading: '4.4 ¿Clásicos o recientes?', paragraphs: [
      'Un docente defendió el valor de los autores originales sobre los actuales, que a menudo solo reformulan lo que otros investigaron hace décadas. La respuesta fue conciliadora: ir a las fuentes primarias es totalmente válido para el marco teórico. Si hablo de constructivismo, debo citar a Piaget. Como referencia, sugirió que alrededor del 80% de la literatura sea reciente y entre un 20 y un 30% pueda ser anterior.',
      'Pero la matriz de la cuestión es otra cosa: ahí se buscan estudios científicos recientes, que hayan pasado por el rigor del método, con población, instrumentos validados y análisis. Un libro expresa la perspectiva del autor, pero no necesariamente la sometió a ese proceso. Además, la realidad cambia rápido: las políticas educativas se transforman en pocos años y un estudio de hace un lustro puede ya no describir lo que vivimos hoy.',
    ] },
    { heading: '4.5 Banderas rojas, resultados negativos y delimitación', paragraphs: [
      'Si al buscar sobre una idea aparecen muy pocos resultados, es una bandera roja: el tema puede estar resuelto o ser tan nuevo que apenas empieza a producirse conocimiento. Si aparecen cientos, la idea va por buen camino porque habrá información suficiente para construir. También desmontó la creencia de que la ciencia siempre arroja resultados positivos: un proyecto de tratamiento de agua con organismos traídos de un clima tropical no funcionó en la época de frío, y ese fracaso se convirtió en una recomendación para otros. Un resultado negativo también es un resultado.',
      'Ante la duda de cómo manejar estudios de países con contextos muy distintos, la recomendación fue no preocuparse al inicio, pues en la matriz se buscan resultados; la discusión del contexto llega después, al construir los antecedentes. Y para no perderse en un proyecto enorme, la clave es delimitar el espacio (¿todo el estado, una escuela, un grupo?), el tiempo (¿un año, tres?, ¿estudio transversal o longitudinal?) y la población. Un error frecuente es elegir temas demasiado amplios.',
    ] },
    { heading: '4.6 Dónde buscar la evidencia', paragraphs: [
      'Google es un buscador, no una base de datos especializada: extrae información, pero no garantiza su calidad. Las bases especializadas trabajan con revistas que tienen un flujo editorial con revisión de pares, ISSN e indexación, lo que asegura rigor y originalidad (véanse Figuras 3 y 4). El investigador de Puerto Rico agregó que los primeros resultados de Google no son necesariamente los correctos, sino a veces los mejor posicionados por estrategia de mercado, y que conviene buscar por palabras clave y no con frases completas.',
      'El acceso no es barato. Publicar en una revista de alto nivel puede costar alrededor de 3,000 dólares y descargar un solo artículo, entre 50 y 70. Por eso, dijo, si se pide a los docentes investigar, las instituciones deberían proporcionar las credenciales de acceso. Mientras tanto, hay opciones abiertas muy valiosas, y Google Académico permite filtrar por años, siempre revisando de dónde proviene cada documento.',
    ], figures: [
      { src: '/articulos/003-bases-por-area.jpg', caption: 'Figura 3. Bases de datos especializadas por área del conocimiento; ERIC es la de investigación educativa. Fuente: diapositiva de la conferencia, fotografía del autor.' },
      { src: '/articulos/003-indices.jpg', caption: 'Figura 4. Índices multidisciplinarios de alto impacto y sistemas regionales de acceso abierto. Fuente: diapositiva de la conferencia, fotografía del autor.' },
    ], box: { title: '¿Dónde buscar?', items: [
      ['Multidisciplinarias de alto impacto (de pago)', 'Scopus y Web of Science; JCR y CiteScore miden el impacto de las revistas.'],
      ['Regionales de acceso abierto', 'SciELO y Redalyc, con revistas de Iberoamérica. Latindex registra y evalúa revistas, pero no es una base de artículos.'],
      ['Por área', 'ERIC (educación), PsycINFO (psicología), PubMed (salud), IEEE Xplore (ingeniería), EconLit (economía) y Business Source Complete (negocios).'],
      ['Google Académico', 'Útil y gratuito, con filtro por años, pero sin el control de una base especializada: hay que revisar de dónde viene cada documento.'],
    ] } },
    { heading: '4.7 La inteligencia artificial, con cautela', paragraphs: [
      'El tema surgió una y otra vez. El ponente distinguió dos tipos de razonamiento: el estadístico, basado en probabilidades, que es el de la inteligencia artificial, y el lógico, que es el humano. Por eso la IA «alucina»: puede inventar referencias o confundir temas. Contó que recibe trabajos hechos completamente con IA cuyos autores no saben qué están investigando.',
      'Aun así, no la descartó. Es una herramienta potente para resumir, sintetizar y ahorrar tiempo, y la norma APA ya permite citarla. La responsabilidad de validar sigue siendo del investigador. El invitado de Puerto Rico fue más tajante: los datos no se recolectan con IA, y el análisis debe ser del investigador.',
    ], quote: 'La inteligencia artificial es un amigo, pero un amigo al que hay que validar.' },
    { heading: '4.8 Investigar como aporte al país', paragraphs: [
      'Un formador de docentes reconoció que el Plan de Estudios 2022 pide investigar desde el primer año de la normal, con la observación de las prácticas, pero que muchas veces no hay tiempo ni preparación suficiente. La respuesta apuntó a la investigación que nace de la experiencia en el aula. El investigador invitado lo resumió con una idea: no ver la investigación como una materia que hay que aprobar, sino como una aportación personal al país (véase Figura 5).',
    ], figure: { src: '/articulos/003-reconocimientos.jpg', caption: 'Figura 5. Entrega de reconocimientos al cierre de la jornada académica. Fuente: fotografía del autor.' } },
    { heading: '5. Discusión', paragraphs: [
      'La matriz de la cuestión puede entenderse, en la tipología de Grant y Booth (2009), como una revisión estructurada que se ubica entre la revisión narrativa y la sistemática: registra los estudios con campos fijos y los compara, pero no exige un protocolo formal. Esta posición intermedia explica su utilidad para la formación docente, porque introduce el orden y la comparación sin la carga de una revisión sistemática completa.',
      'Las recomendaciones del ponente coinciden con Booth et al. (2016) en la necesidad de buscar en bases especializadas y de registrar lo encontrado, y con PRISMA 2020 (Page et al., 2021) en el valor de la transparencia. Sin embargo, la matriz no informa la estrategia de búsqueda ni el flujo de estudios descartados; si se quiere que otra persona pueda reproducirla, convendría añadir esos datos, tal como pide la declaración PRISMA.',
      'La sugerencia de que alrededor del 80% de la literatura sea reciente es una regla práctica del ponente y no una norma establecida; su sentido coincide con la idea de Hernández-Sampieri y Mendoza (2018) de que la revisión debe reflejar el estado actual del conocimiento, sin renunciar a las fuentes clásicas para el marco teórico.',
      'Sobre la inteligencia artificial, la postura de la conferencia es coherente con las orientaciones de APA: puede usarse y citarse, pero la responsabilidad del contenido y de las referencias es de quien escribe (American Psychological Association, 2020; McAdoo, 2023). La advertencia de que la IA puede inventar referencias refuerza la necesidad de verificar cada fuente. Como límite, este análisis se basa en el registro de una sola conferencia y de un solo observador.',
    ] },
    { heading: '6. Conclusiones', paragraphs: [
      'En respuesta a la pregunta de investigación, la matriz de la cuestión construye la pregunta en siete pasos: partir de una idea, buscar evidencia reciente, registrarla en una tabla, compararla, delimitar el objeto de estudio, identificar los vacíos y, de ellos, formular la pregunta. Una buena pregunta no se inventa: se construye leyendo con calma lo que otros han encontrado, comparando y detectando lo que falta.',
      'Para la práctica docente, la principal implicación es que el contexto propio es una fuente legítima de preguntas: en un salón, con un grupo y en un ciclo escolar hay preguntas que nadie ha respondido todavía. La segunda es que la evidencia se busca en bases especializadas y se verifica, también cuando se usa inteligencia artificial.',
      'El Dr. Torrico cerró con una idea que resume las dos jornadas: investigar no comienza con una respuesta, sino con la comprensión crítica de la realidad a partir de lo que otros han descubierto y de lo que todavía falta por descubrir. Como línea futura, se propone aplicar una mini matriz en el aula y documentar su uso con el mismo procedimiento.',
    ], box: { title: 'Implicaciones para la práctica', items: [
      ['Una mini matriz', 'Antes de probar una estrategia nueva con mi grupo, leer tres a cinco estudios recientes en ERIC, Redalyc o SciELO y anotar sus resultados en una tabla sencilla.'],
      ['Acotar el contexto', 'Mi pregunta no es sobre «la educación en México», sino sobre mi grupo, este ciclo escolar y un contenido concreto.'],
      ['Registrar lo que no funcionó', 'Un resultado negativo también orienta: me dice qué camino no repetir.'],
      ['La IA como apoyo', 'Puede ayudarme a resumir u organizar, pero cada cita y cada dato los verifico yo.'],
    ] } },
  ],
  references: [
    'American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.). https://doi.org/10.1037/0000165-000',
    'Booth, A., Sutton, A., & Papaioannou, D. (2016). Systematic approaches to a successful literature review (2nd ed.). SAGE.',
    BRAUN,
    'Grant, M. J., & Booth, A. (2009). A typology of reviews: An analysis of 14 review types and associated methodologies. Health Information and Libraries Journal, 26(2), 91–108. https://doi.org/10.1111/j.1471-1842.2009.00848.x',
    JORNADA_HS,
    HS_MENDOZA,
    'McAdoo, T. (2023, 7 de abril). How to cite ChatGPT. APA Style. https://apastyle.apa.org/blog/how-to-cite-chatgpt',
    'Page, M. J., McKenzie, J. E., Bossuyt, P. M., Boutron, I., Hoffmann, T. C., Mulrow, C. D., Shamseer, L., Tetzlaff, J. M., Akl, E. A., Brennan, S. E., Chou, R., Glanville, J., Grimshaw, J. M., Hróbjartsson, A., Lalu, M. M., Li, T., Loder, E. W., Mayo-Wilson, E., McDonald, S., . . . Moher, D. (2021). The PRISMA 2020 statement: An updated guideline for reporting systematic reviews. BMJ, 372, Article n71. https://doi.org/10.1136/bmj.n71',
    'Torrico, A. (2026, 23 de octubre). La matriz de la cuestión: de la idea de investigación a los vacíos del conocimiento [Conferencia]. Jornada de Habilitación Docente «Horizontes de la investigación en la formación docente», Secretaría de Educación de Nuevo León, Benemérita Escuela Normal Miguel F. Martínez, Monterrey, N. L., México.',
    ZABALZA,
  ],
};
