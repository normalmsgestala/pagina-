// Artículos 002 y 003: bitácoras de la Jornada de Habilitación Docente (Carlos Ismael Estala Coronado).
// Mismo formato que el artículo 001: resumen, palabras clave, secciones numeradas y referencias.
// Las secciones pueden llevar, además de párrafos, una cita, una lista, una tabla o una figura.

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  quote?: string;
  figure?: { src: string; caption: string };
  table?: { caption?: string; headers: string[]; rows: string[][] };
  box?: { title: string; items: [string, string][] };
}
export interface StaticArticle {
  id: string; category: string; title: string; excerpt: string; date: string; image: string; imageAlt: string;
  author: string; keywords: string; abstract: string; method: string; sections: ArticleSection[]; references: string[];
  event?: [string, string][];
}

export const ARTICLE_002: StaticArticle = {
  id: '002',
  category: 'Bitácora docente · Investigación educativa',
  title: 'Investigar no es cosa de científicos: es la forma en que todos tomamos decisiones',
  excerpt: 'El Dr. Roberto Hernández Sampieri presentó la investigación como la competencia que más buscan las empresas y que cualquier maestro puede ejercer en su salón.',
  date: '26 de octubre de 2026',
  image: '/articulos/002-portada-hernandez-sampieri.jpg',
  imageAlt: 'El Dr. Roberto Hernández Sampieri durante su conferencia en la Benemérita Escuela Normal Miguel F. Martínez',
  author: 'Carlos Ismael Estala Coronado',
  method: 'Bitácora de conferencia',
  keywords: 'investigación educativa; planteamiento del problema; ruta cuantitativa; ruta cualitativa; métodos mixtos; formación docente',
  abstract: 'En la Jornada de Habilitación Docente de Nuevo León, el Dr. Roberto Hernández Sampieri presentó la investigación como la competencia que más buscan las empresas, la que mueve la economía de los países y la que cualquier maestro puede ejercer en su salón. Esta bitácora recoge los ejes de la conferencia: para qué sirve investigar, la relación entre investigación y desarrollo de países, empresas y universidades, y las tres rutas metodológicas (cuantitativa, cualitativa y mixta). La idea central es que el planteamiento del problema, y no la preferencia del investigador, define el camino. Cierra con aplicaciones para el aula de primaria y una reflexión sobre la investigación como forma de pensar.',
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
    ] },
    { heading: '2. Para qué sirve investigar', paragraphs: [
      'El primer propósito es conocer los fenómenos que nos rodean, desde los agujeros negros hasta el origen del universo. El ponente recorrió cómo ha cambiado nuestra idea de su tamaño: de pensar que la Tierra era un grano de arena, a saber que nuestra galaxia también lo es, y hoy a sospechar que el universo conocido es apenas una parte de lo que existe.',
      'También sirve para conocernos a nosotros mismos, desde nuestro ADN hasta nuestros motivos más profundos. Descubrir la estructura del ADN permitió desarrollar medicamentos para padecimientos específicos, y mencionó avances contra el Alzheimer y una vacuna contra el cáncer de piel en fase final de ensayos clínicos.',
      'La investigación ayuda además a comprender las causas de un conflicto bélico o de un desastre natural, y a resolver toda clase de problemas: por qué falla un sistema de producción, cómo se origina un conflicto en la familia o cómo puede mejorar el bienestar de una comunidad. Y recordó que la pandemia se resolvió con investigación: sin vacunas ni medicamentos probados, el panorama habría sido muy distinto.',
    ], quote: 'Investigar es reunir información para tomar decisiones. Y lo hacemos todo el tiempo.' },
    { heading: '3. Países, empresas y universidades', paragraphs: [
      'Con una gráfica de la inversión en investigación y desarrollo al inicio de la pandemia, mostró que los países más desarrollados son los que más invierten. Estados Unidos y China destacan por el monto total; Corea del Sur e Israel, por el porcentaje de su PIB; y naciones como Finlandia, Dinamarca o Singapur, por su número de investigadores por habitante. México aparece en la esquina inferior, entre los que menos invierten.',
      'En el mundo empresarial, las compañías que más invierten en investigación, como Alphabet (Google, YouTube), Amazon y Apple, son también las de mayor crecimiento. Amazon, explicó, investiga a cada cliente para ofrecerle justo lo que le interesa. En la educación superior ocurre lo mismo: las universidades mejor posicionadas en los rankings son las que más invierten en investigación.',
      'Lanzó una pregunta incómoda: ¿por qué no hay un celular o un automóvil diseñado y fabricado en México? Su respuesta fue que no hemos puesto el énfasis en la investigación. Lo contrastó con el caso de los zapateros de León, Guanajuato, que gracias a un estudio colaborativo recuperaron su mercado frente al calzado importado.',
    ], figure: { src: '/articulos/002-inversion-id.jpg', caption: 'Diapositiva: inversión en I+D como porcentaje del PIB frente a investigadores por millón de habitantes. El tamaño de cada círculo refleja el gasto total del país.' } },
    { heading: '4. La competencia que buscan las empresas', paragraphs: [
      'Citó un estudio de ManpowerGroup según el cual, en 2023, cerca de ocho de cada diez empresas en el mundo no encontraban el talento que necesitaban, y en México alrededor del 70% reportaba lo mismo en 2025. La competencia más solicitada no son los idiomas ni el manejo de tecnología, aunque ambos importan: es la capacidad de reunir y analizar información para tomar decisiones. Es decir, investigación, aunque las empresas no la llamen así.',
      'Los educadores, añadió, tienen cabida también en las empresas, sobre todo en capacitación, una necesidad creciente con la llegada de la inteligencia artificial. Y un buen alcalde, un consultor o un emprendedor necesitan investigar: buena parte de los negocios en América Latina no llega a los tres años por no estudiar su mercado antes de abrir.',
    ] },
    { heading: '5. Investigar es parte de nuestra naturaleza', paragraphs: [
      'Para derribar el mito de que investigar es complicado, recurrió a ejemplos cotidianos. Un bebé que escucha un ruido voltea a buscar de dónde viene: ya está investigando. Cuando alguien nos atrae, revisamos sus redes y preguntamos por esa persona. Al comprar ropa, preguntamos a otros cómo se nos ve. La diferencia está en hacerlo con un método más formal.',
      'Compartió historias de jóvenes que transformaron su entorno: un estudiante en Panamá que diseñó con materiales naturales un sistema para llevar agua a su comunidad, y una joven de 19 años que investigó las propiedades térmicas del plástico PET y terminó fabricando ladrillos con él, hasta abrir plantas en otros estados y en Europa.',
      'El caso más memorable fue el del agua embotellada en México. A finales de los años ochenta, un gerente de una embotelladora en Cuernavaca intuyó que el agua podía ser un producto. Con encuestas, pruebas de mercado y estudios mixtos sustentaron la idea; el corporativo la rechazó por absurda, pero les permitieron probarla en su región. Hoy el agua embotellada es un mercado enorme, y todo nació de una investigación bien hecha.',
    ] },
    { heading: '6. Tres rutas para investigar', paragraphs: [
      'La segunda parte de la conferencia entró de lleno en la metodología. Todo estudio comienza con una idea y con reflexionar sobre la naturaleza del problema. De esa reflexión depende el camino: la ruta cuantitativa, la cualitativa o la mixta, que combina ambas. Hoy, insistió, no se trata de casarse con un enfoque, sino de plantear bien el problema y decidir con flexibilidad.',
      'La ruta cuantitativa es secuencial: no se pueden analizar datos que no se han recolectado, ni recolectarlos sin haber definido la población, establecido hipótesis, revisado la literatura y planteado el problema. Parte de una teoría y la contrasta con los hechos mediante la medición.',
      'La ruta cualitativa es más circular. También empieza con una idea, pero el problema se va afinando conforme se conoce el contexto. En lugar de partir de una teoría, se examinan los hechos y, a partir de ellos, se construye la interpretación. No hay medición: se analizan narrativas orales y escritas, documentos, fotografías y otros materiales visuales para reconstruir la realidad.',
      'La ruta mixta permite integrar ambas miradas y acumular evidencia en el camino. Su ejemplo, muy cercano a nosotros, fue la enseñanza de las matemáticas: puedo medir cuantitativamente el nivel de los alumnos y, a la vez, entrevistarlos para entender cómo razonan y qué saben, para luego diseñar mejores formas de enseñar.',
    ], quote: 'El planteamiento del problema define la ruta de la investigación.' },
    { heading: '7. Toda realidad tiene dos caras', paragraphs: [
      'El ponente sostuvo que casi cualquier fenómeno tiene un componente objetivo y uno subjetivo. En una escuela, una dependencia o una empresa hay datos medibles: cuántos alumnos hay inscritos, cuántos maestros, cuánto vale una acción en la bolsa. Pero también hay percepciones, relaciones y significados que no se miden con números.',
      'El futbol lo ilustra bien. Lo cuantitativo son los goles, los duelos defensivos, la velocidad de cada jugador o los patrones de juego, que hoy se analizan con tecnología y grandes bases de datos. Lo cualitativo es la alegría de jugar, el drama de perder o la pasión por un equipo. Incluso hechos físicos como la presión arterial, que parecen totalmente objetivos, cambian según la altitud de la ciudad; y el tiempo mismo no transcurre igual en la Tierra que cerca de un agujero negro.',
      'De ahí su advertencia: los datos numéricos son más objetivos, pero no del todo, porque hay que interpretarlos; y los datos narrativos tampoco son puramente subjetivos, pues en el análisis cualitativo también importa la frecuencia con que aparece un tema.',
    ] },
    { heading: '8. La herramienta según el problema', paragraphs: [
      'Para explicar cómo elegir la ruta usó ejemplos domésticos. Si quiero colgar un cuadro, me basta un martillo y un clavo. Pero si la mesa de madera está astillada y lastima a la gente, el martillo no sirve: necesito una lija. Y si lo que falla es la plomería del baño, ni el clavo ni la lija ayudan. Lo mismo con la ropa: no me visto igual para la nieve, para la playa, para hacer deporte o para ir al estadio.',
      'Así, el planteamiento cuantitativo responde a la necesidad de estimar magnitudes, conocer con qué frecuencia ocurre un fenómeno o calcular la relación entre variables, como el rendimiento en clase. El cualitativo responde a la necesidad de comprender o interpretar un fenómeno y descubrir patrones detrás de narrativas verbales o visuales.',
    ] },
    { heading: '9. Variables y conceptos', paragraphs: [
      'Una aclaración que sorprendió al auditorio: los planteamientos cuantitativos trabajan con variables, que se miden; los cualitativos trabajan con conceptos, categorías y construcciones que se van analizando. Por eso, afirmó, es un error hablar de «variables cualitativas»: si algo se mide, es cuantitativo, aunque sea una variable nominal. En la ruta cuantitativa se miden emociones o actitudes y se buscan correlaciones; en la cualitativa se busca comprenderlas y profundizar en experiencias de vida y significados.',
    ], quote: 'No existe la variable cualitativa.',
      figure: { src: '/articulos/002-variables-conceptos.jpg', caption: 'Diapositiva: los problemas cuantitativos trabajan con variables y constructos; los cualitativos, con conceptos, categorías, temas y patrones.' },
      table: { caption: 'Síntesis elaborada a partir de la conferencia.', headers: ['', 'Cuantitativa', 'Cualitativa'], rows: [
        ['Lógica', 'Deductiva: de la teoría a los hechos', 'Inductiva: de los hechos a la interpretación'],
        ['Proceso', 'Secuencial; no se saltan etapas', 'Circular; el problema se afina en el camino'],
        ['Trabaja con', 'Variables que se miden', 'Conceptos, categorías, temas y patrones'],
        ['Datos', 'Números, mediciones, estadística', 'Narrativas, entrevistas, documentos, imágenes'],
        ['Análisis', 'Estadístico, correlaciones, hipótesis', 'Temático (codificación)'],
        ['Busca', 'Estimar magnitudes y relaciones', 'Comprender significados y experiencias'],
      ] } },
    { heading: '10. Dos casos, dos rutas', paragraphs: [
      'Un estudio cuantitativo. Empresas automotrices de la región de Celaya pidieron a su centro de investigación medir el clima laboral, correlacionar sus variables y conocer el efecto de cada una sobre la productividad. Como se trataba de variables medibles, como la satisfacción laboral o la autonomía, el estudio fue cuantitativo y se resolvió con modelos estadísticos de regresión.',
      'Un estudio cualitativo. En una embotelladora, las áreas de producción, control de calidad y mantenimiento vivían en conflicto permanente, al grado de que se compraban los peores lubricantes para que las botellas de vidrio cayeran de las bandas y la línea tuviera que detenerse. Aquí no había nada que medir: había que comprender. Con entrevistas a todo el personal y grupos de enfoque descubrieron que el conflicto venía de los propios jefes, que transmitían su enemistad a sus equipos. La solución implicó nombrar nuevos gerentes y un proceso de cambio que tomó alrededor de tres años.',
    ] },
    { heading: '11. Lo que me llevo como maestro', paragraphs: [
      'La idea que más me interpela es que la investigación no está desconectada de la realidad: tiene que ver con la familia, la salud y, sobre todo, con la educación. El ponente nos dijo que, como docentes, tenemos muchísimo que investigar de nuestros grupos: conocer mejor a los niños, saber qué les funciona y experimentar con métodos alternativos.',
      'También advirtió que la inteligencia artificial para la enseñanza ya viene en camino, y que podremos aprovecharla, pero sin entregarnos a ella por completo. Me quedo con su observación de que los niños hacen investigaciones maravillosas y que, en algún punto, el sistema educativo apaga esa curiosidad. En primaria tenemos la oportunidad de hacer lo contrario.',
    ], box: { title: 'Para el aula', items: [
      ['Empezar por el problema', 'Antes de elegir instrumento, preguntarme qué quiero saber de mi grupo y si se mide o se comprende.'],
      ['Lo cuantitativo', 'Asistencia, resultados de evaluaciones, tiempo de lectura, avance en cálculo mental: datos para ver tendencias.'],
      ['Lo cualitativo', 'Escuchar cómo explican sus procedimientos, revisar sus cuadernos, observar el recreo y conversar con las familias.'],
      ['Lo mixto', 'Ver qué alumnos bajan en matemáticas y después entrevistarlos para entender por qué.'],
      ['Indagar con ellos', 'Pequeñas encuestas, registros y observaciones donde los alumnos sean también investigadores.'],
    ] } },
    { heading: '12. Reflexión final', paragraphs: [
      'Salgo de la conferencia con dos convicciones. La primera: investigar no es un lujo académico, es una forma de pensar. La segunda: no hay un método mejor que otro, sino problemas que piden herramientas distintas. Antes de preguntar «¿cómo lo voy a investigar?», debo preguntarme con claridad «¿qué quiero saber de mis alumnos?». Si quiero formar niños capaces de resolver problemas, primero debo ejercer esa misma actitud en mi práctica: observar, preguntar, registrar y decidir.',
    ] },
  ],
  references: [
    'Hernández Sampieri, R. (2026, 22 de octubre). ¿Para qué sirve la investigación? El planteamiento del problema define la ruta de la investigación: cuantitativa, cualitativa o mixta [Conferencia]. Jornada de Habilitación Docente «Horizontes de la investigación en la formación docente», Secretaría de Educación de Nuevo León, Benemérita Escuela Normal Miguel F. Martínez, Monterrey, N. L., México.',
  ],
};

export const ARTICLE_003: StaticArticle = {
  id: '003',
  category: 'Bitácora docente · Investigación educativa',
  title: 'Investigar no empieza con una respuesta: empieza leyendo lo que otros ya descubrieron',
  excerpt: 'El Dr. Alfredo Torrico mostró paso a paso cómo construir la matriz de la cuestión, la herramienta que convierte una idea en un objeto de estudio y en una pregunta de investigación.',
  date: '26 de octubre de 2026',
  image: '/articulos/003-portada-matriz.jpg',
  imageAlt: 'El Dr. Alfredo Torrico explica la matriz de la cuestión frente a una diapositiva con la tabla de estudios',
  author: 'Carlos Ismael Estala Coronado',
  method: 'Bitácora de conferencia',
  keywords: 'matriz de la cuestión; objeto de estudio; vacíos del conocimiento; pregunta de investigación; bases de datos; inteligencia artificial',
  abstract: 'En el segundo día de la Jornada de Habilitación Docente, el Dr. Alfredo Torrico, de Caribbean University, mostró paso a paso cómo construir la matriz de la cuestión, la herramienta que convierte una idea en un objeto de estudio y, más adelante, en una pregunta de investigación sustentada en evidencia científica. Esta bitácora recoge la ruta presentada (idea, evidencia, matriz, análisis comparativo, objeto de estudio, vacíos del conocimiento y pregunta), así como el diálogo con el público sobre los vacíos en el contexto local, el uso de fuentes clásicas y recientes, los resultados negativos, la delimitación del estudio, las bases de datos especializadas y el uso responsable de la inteligencia artificial.',
  event: [
    ['Evento', 'Jornada de Habilitación Docente «Horizontes de la investigación en la formación docente»'],
    ['Organiza', 'Secretaría de Educación de Nuevo León · Subsecretaría de Desarrollo Magisterial, Dirección de Desarrollo Académico'],
    ['Tema', 'La matriz de la cuestión: de la idea de investigación a los vacíos del conocimiento'],
    ['Ponente', 'Dr. Alfredo Torrico, Caribbean University (Puerto Rico)'],
    ['Sede y fecha', 'Benemérita Escuela Normal Miguel F. Martínez, Monterrey, N. L. · 23 de octubre de 2026'],
  ],
  sections: [
    { heading: '1. Introducción', paragraphs: [
      'Si la conferencia del día anterior nos convenció de que investigar sirve para todo, la segunda jornada respondió a la pregunta inevitable: ¿por dónde empiezo? El Dr. Alfredo Torrico, de Caribbean University en Puerto Rico, dedicó su exposición a una herramienta concreta, la matriz de la cuestión, y a un mensaje que repitió de distintas formas: antes de formular una pregunta de investigación hay que conocer qué se ha investigado ya sobre el tema.',
      'Su sesión fue muy participativa. Estudiantes normalistas, docentes formadores y un investigador invitado de Puerto Rico intervinieron con preguntas y comentarios que enriquecieron el contenido, y buena parte de lo que aquí recojo nació de ese diálogo.',
    ] },
    { heading: '2. La matriz de la cuestión', paragraphs: [
      'El punto de partida es una idea, que el ponente definió como la descripción de la realidad observada, acompañada de sus palabras clave. Con ellas se buscan estudios científicos, de preferencia artículos o tesis doctorales de los últimos cinco años, y se registran en una tabla: año, país, autor, título y resultados de partida.',
      'Hizo una aclaración importante: los resultados de partida no son las conclusiones del artículo. Son lo que yo identifico en ese estudio desde la mirada de mi propia idea, en unas quince palabras. Si me limito a copiar fragmentos, solo genero un documento paralelo sin aporte; la gracia está en leer, entender y extraer lo esencial.',
      'Y eso exige tiempo. Un artículo científico ronda las dieciocho páginas, y para comprenderlo hay que leerlo hasta tres veces: entender desde qué posición escribe el autor, en qué contexto, con qué datos y qué quiere comunicar. «Parece fácil», advirtió, «pero requiere muchas horas».',
      'En esta etapa, además, todavía no se discute la metodología. No es el momento de decidir si el estudio será cuantitativo, cualitativo o mixto: si se empieza por ahí, el debate puede consumir años. Primero hay que dejar que la idea madure a partir de la lectura.',
    ] },
    { heading: '3. Del análisis al objeto de estudio', paragraphs: [
      'Con los estudios en la matriz viene el análisis comparativo integral, que se apoya en cuatro preguntas: ¿qué resultados se repiten? (patrones), ¿en qué coinciden los estudios? (convergencias), ¿qué resultados difieren? (divergencias) y ¿qué hallazgos son incompatibles? (contradicciones). De ahí surge el objeto de estudio: la parte de la realidad que pretendo estudiar, ahora construida con base en evidencia y no en ocurrencias.',
      'Según explicó, hasta aquí llegan las tesis de licenciatura y maestría, que son aplicaciones del conocimiento existente a contextos concretos. El doctorado da un paso más: una segunda búsqueda, más específica, centrada en el objeto de estudio, para analizar tendencias, omisiones y aspectos que permanecen sin explicación, y así identificar los vacíos del conocimiento, uno por cada cita revisada. De esos vacíos nace la pregunta de investigación.',
    ], figure: { src: '/articulos/003-analisis-comparativo.jpg', caption: 'Diapositiva: el análisis comparativo integral lleva de la matriz al objeto de estudio.' },
      table: { caption: 'Síntesis de la ruta presentada en la conferencia.', headers: ['Paso', 'Etapa', 'Qué se hace'], rows: [
        ['1', 'Idea', 'Describir la realidad que observo y anotar sus palabras clave.'],
        ['2', 'Evidencia científica', 'Buscar artículos o tesis doctorales de los últimos cinco años.'],
        ['3', 'Matriz', 'Registrar año, país, autor, título y resultados de partida (≈15 palabras).'],
        ['4', 'Análisis comparativo integral', 'Patrones, convergencias, divergencias y contradicciones.'],
        ['5', 'Objeto de estudio', 'La parte de la realidad que pretendo estudiar. Aquí llegan licenciatura y maestría.'],
        ['6', 'Vacíos del conocimiento', 'Tendencias, omisiones y lo que sigue sin explicación (nivel doctoral).'],
        ['7', 'Pregunta de investigación', 'La que mi estudio pretende responder.'],
      ] } },
    { heading: '4. Los vacíos están en el contexto', paragraphs: [
      'Una de las intervenciones más útiles vino del público. Hablar de vacíos del conocimiento suena a algo imposible, se dijo, pero cambia si se mira desde el contexto: quizá haya mucho escrito sobre el normalismo en el mundo o en México, pero difícilmente existe un estudio sobre el tercero B de la generación 2025-2026 en un contenido específico de primaria. Ahí está la oportunidad para investigar y, con los resultados, proponer mejoras a quienes dirigen la escuela.',
      'El investigador invitado de Puerto Rico añadió un matiz: el vacío hay que revisarlo a nivel local, nacional e internacional, y no hay que confundir la falta de vacíos con la zona de confort. Decir «no hay nada» muchas veces significa «no busqué lo suficiente».',
    ], quote: 'Si siempre te dicen que no hay nada… siempre hay algo.' },
    { heading: '5. ¿Clásicos o recientes?', paragraphs: [
      'Un docente defendió el valor de los autores originales sobre los actuales, que a menudo solo reformulan lo que otros investigaron hace décadas. La respuesta fue conciliadora: ir a las fuentes primarias es totalmente válido para el marco teórico. Si hablo de constructivismo, debo citar a Piaget. Como referencia, sugirió que alrededor del 80% de la literatura sea reciente y entre un 20 y un 30% pueda ser anterior.',
      'Pero la matriz de la cuestión es otra cosa: ahí se buscan estudios científicos recientes, que hayan pasado por el rigor del método, con población, instrumentos validados y análisis. Un libro expresa la perspectiva del autor, pero no necesariamente la sometió a ese proceso. Además, la realidad cambia rápido: las políticas educativas se transforman en pocos años y un estudio de hace un lustro puede ya no describir lo que vivimos hoy.',
    ] },
    { heading: '6. Banderas rojas y resultados negativos', paragraphs: [
      'Si al buscar sobre una idea aparecen muy pocos resultados, es una bandera roja: el tema puede estar resuelto o ser tan nuevo que apenas empieza a producirse conocimiento. Si aparecen cientos, la idea va por buen camino porque habrá información suficiente para construir.',
      'También desmontó la creencia de que la ciencia siempre arroja resultados positivos. Contó un proyecto de tratamiento de agua con organismos que, traídos de un clima tropical, no funcionaron en la época de frío: todas las pruebas salieron negativas hasta que se entendió la causa. Ese fracaso inicial se convirtió en una recomendación para otros. Un resultado negativo también es un resultado: marca el camino que no hay que repetir.',
    ] },
    { heading: '7. Delimitar para poder avanzar', paragraphs: [
      'Una estudiante preguntó cómo manejar estudios de países con contextos muy distintos, por ejemplo en educación socioemocional. La recomendación fue no preocuparse por eso al inicio, pues en la matriz se buscan resultados; la discusión del contexto llega después, al construir los antecedentes y la justificación.',
      'Otro asistente planteó si convenía investigar un tema poco estudiado en Nuevo León sin perderse en un proyecto enorme. La clave, respondieron, es delimitar: el espacio (¿todo el estado, la ciudad, una escuela, un grupo?), el tiempo (¿un año, tres?, ¿estudio transversal o longitudinal?) y la población. Esa delimitación define la viabilidad y los tiempos. Un error frecuente es elegir temas demasiado amplios.',
    ] },
    { heading: '8. Dónde buscar la evidencia', paragraphs: [
      'Google es un buscador, no una base de datos especializada: extrae información, pero no garantiza su calidad. Las bases especializadas trabajan con revistas que tienen un flujo editorial con revisión de pares, ISSN e indexación, lo que asegura rigor y originalidad. El investigador de Puerto Rico agregó que los primeros resultados de Google no son necesariamente los correctos, sino a veces los mejor posicionados por estrategia de mercado, y que conviene buscar por palabras clave y no con frases completas.',
      'El acceso no es barato. Publicar en una revista de alto nivel puede costar alrededor de 3,000 dólares y descargar un solo artículo, entre 50 y 70. Por eso, dijo, si se pide a los docentes investigar, las instituciones deberían proporcionar las credenciales de acceso. Mientras tanto, hay opciones abiertas muy valiosas, y Google Académico permite filtrar por años, por ejemplo de 2021 a 2026, siempre revisando de dónde proviene cada documento. Al final mostró en vivo una base abierta con cerca de 1,800 revistas y alrededor de un millón de artículos disponibles.',
    ], figure: { src: '/articulos/003-bases-por-area.jpg', caption: 'Diapositiva: bases de datos especializadas por área del conocimiento. ERIC es la de investigación educativa.' },
      box: { title: '¿Dónde buscar?', items: [
        ['Multidisciplinarias de alto impacto (de pago)', 'Scopus y Web of Science; JCR y CiteScore miden el impacto de las revistas.'],
        ['Regionales de acceso abierto', 'SciELO y Redalyc, con revistas de Iberoamérica. Latindex registra y evalúa revistas, pero no es una base de artículos.'],
        ['Por área', 'ERIC (educación), PsycINFO (psicología), PubMed (salud), IEEE Xplore (ingeniería), EconLit (economía) y Business Source Complete (negocios).'],
        ['Google Académico', 'Útil y gratuito, con filtro por años, pero sin el control de una base especializada: hay que revisar de dónde viene cada documento.'],
      ] } },
    { heading: '9. La inteligencia artificial, con cautela', paragraphs: [
      'El tema surgió una y otra vez. El ponente distinguió dos tipos de razonamiento: el estadístico, basado en probabilidades, que es el de la inteligencia artificial, y el lógico, que es el humano. Por eso la IA «alucina»: puede inventar referencias o confundir temas. Contó que recibe trabajos hechos completamente con IA cuyos autores no saben qué están investigando.',
      'Aun así, no la descartó. Es una herramienta potente para resumir, sintetizar y ahorrar tiempo, y la norma APA ya permite citarla. Sugirió incluso entrenar un asistente propio con criterios definidos, en lugar de solo hacerle preguntas. La responsabilidad de validar sigue siendo del investigador. El invitado de Puerto Rico fue más tajante: los datos no se recolectan con IA, y el análisis debe ser del investigador. «Somos maestros», recordó, «y no promovemos conductas poco éticas».',
    ], quote: 'La inteligencia artificial es un amigo, pero un amigo al que hay que validar.',
      figure: { src: '/articulos/003-indices.jpg', caption: 'Diapositiva: índices multidisciplinarios de alto impacto y sistemas regionales de acceso abierto.' } },
    { heading: '10. Investigar como aporte al país', paragraphs: [
      'Hubo también espacio para la honestidad. Un formador de docentes reconoció que el Plan de Estudios 2022 pide investigar desde el primer año de la normal, con la observación de las prácticas, pero que muchas veces no hay tiempo ni preparación suficiente, y que eso le ha generado frustración. La respuesta apuntó a la investigación que nace de la experiencia en el aula.',
      'El investigador invitado lo resumió con una idea que me llevo: no ver la investigación como una materia que hay que aprobar, sino como una aportación personal al país, la forma de responder con hechos a quien diga que no hemos hecho nada.',
    ], figure: { src: '/articulos/003-reconocimientos.jpg', caption: 'Entrega de reconocimientos al cierre de la jornada académica.' } },
    { heading: '11. Lo que me llevo como maestro', paragraphs: [
      'Lo más valioso de esta sesión fue bajar la investigación a pasos concretos. Me queda claro que una buena pregunta no se inventa: se construye leyendo con calma lo que otros han encontrado, comparando y detectando lo que falta. Y que en mi salón, con mi grupo y en este ciclo escolar, hay preguntas que nadie ha respondido todavía.',
    ], box: { title: 'Para mi práctica', items: [
      ['Una mini matriz', 'Antes de probar una estrategia nueva con mi grupo, leer tres a cinco estudios recientes en ERIC, Redalyc o SciELO y anotar sus resultados en una tabla sencilla.'],
      ['Acotar el contexto', 'Mi pregunta no es sobre «la educación en México», sino sobre mi grupo, este ciclo escolar y un contenido concreto.'],
      ['Registrar lo que no funcionó', 'Un resultado negativo también orienta: me dice qué camino no repetir.'],
      ['La IA como apoyo', 'Puede ayudarme a resumir u organizar, pero cada cita y cada dato los verifico yo.'],
    ] } },
    { heading: '12. Reflexión final', paragraphs: [
      'El Dr. Torrico cerró con una frase que resume las dos jornadas: «Investigar no comienza con una respuesta. Inicia con la comprensión crítica de la realidad, construida a partir de lo que otros han descubierto y de aquello que todavía permanece por descubrir». Si el primer día me convenció de por qué investigar, este segundo día me enseñó cómo empezar. Ahora toca hacerlo.',
    ] },
  ],
  references: [
    'Torrico, A. (2026, 23 de octubre). La matriz de la cuestión: de la idea de investigación a los vacíos del conocimiento [Conferencia]. Jornada de Habilitación Docente «Horizontes de la investigación en la formación docente», Secretaría de Educación de Nuevo León, Benemérita Escuela Normal Miguel F. Martínez, Monterrey, N. L., México.',
    'Hernández Sampieri, R. (2026, 22 de octubre). ¿Para qué sirve la investigación? El planteamiento del problema define la ruta de la investigación: cuantitativa, cualitativa o mixta [Conferencia]. Jornada de Habilitación Docente «Horizontes de la investigación en la formación docente», Secretaría de Educación de Nuevo León, Benemérita Escuela Normal Miguel F. Martínez, Monterrey, N. L., México.',
  ],
};
