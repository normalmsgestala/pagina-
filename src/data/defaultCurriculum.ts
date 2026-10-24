import type { Semester, GuideSection } from '../types/curriculum';

const createDefaultGuideSections = (teamSpecificSubtitle: string): GuideSection[] => [
  {
    id: 'sec-1',
    number: '1',
    title: '1. Portada y Datos de Identificación',
    subtitles: [
      'Nombre de la Escuela Normal Superior',
      'Licenciatura en Enseñanza y Aprendizaje de la Física',
      'Nombre del Proyecto y Equipo',
      'Integrantes del Equipo y Semestre',
    ],
    content: '',
  },
  {
    id: 'sec-2',
    number: '2',
    title: '2. Introducción y Contextualización',
    subtitles: [
      'Planteamiento del fenómeno físico',
      'Importancia educativa en el Parque Temático de la Física',
      'Vinculación con el contexto comunitario y seguridad',
    ],
    content: '',
  },
  {
    id: 'sec-3',
    number: '3',
    title: '3. Propósitos de Aprendizaje e Interdisciplinariedad',
    subtitles: [
      'Propósito General del Proyecto',
      'Mecánica',
      'Álgebra para Física',
      'Tecnologías y Pedagogías Emergentes',
      'Didáctica de las Ciencias Experimentales',
    ],
    content: '',
  },
  {
    id: 'sec-4',
    number: '4',
    title: '4. Marco Teórico y Antecedentes Históricos',
    subtitles: [
      'Historia y evolución del instrumento / atracción',
      'Leyes y principios físicos fundamentales',
      'Conceptos clave para educación secundaria',
    ],
    content: '',
  },
  {
    id: 'sec-5',
    number: '5',
    title: '5. Modelación Matemática y Ecuaciones del Sistema',
    subtitles: [
      teamSpecificSubtitle,
      'Deducción de fórmulas y variables de control',
      'Análisis gráfico y representación algebraica',
    ],
    content: '',
  },
  {
    id: 'sec-6',
    number: '6',
    title: '6. Diseño y Construcción del Prototipo / Maqueta Funcional',
    subtitles: [
      'Lista de materiales y especificaciones técnicas',
      'Planos, bocetos y geometría del prototipo',
      'Procedimiento de construcción paso a paso',
    ],
    content: '',
  },
  {
    id: 'sec-7',
    number: '7',
    title: '7. Integración Tecnológica, Simulación y Toma de Datos',
    subtitles: [
      'Uso del Simulador Interactivo / Software (Tracker, GeoGebra, PhET)',
      'Bitácora de mediciones experimentales vs. valores teóricos',
      'Cálculo de error experimental y gráficas de resultados',
    ],
    content: '',
  },
  {
    id: 'sec-8',
    number: '8',
    title: '8. Secuencia Didáctica y Transposición para Secundaria',
    subtitles: [
      'Inicio: Pregunta detonadora y activación de conocimientos previos',
      'Desarrollo: Actividad práctica con el prototipo y simulador (Observar, Medir, Comparar)',
      'Cierre: Reflexión, inclusión, accesibilidad y evaluación formativa',
    ],
    content: '',
  },
  {
    id: 'sec-9',
    number: '9',
    title: '9. Evaluación, Rúbrica, Conclusiones y Referencias',
    subtitles: [
      'Evaluación del criterio y nivel esperado',
      'Conclusiones individuales y por equipo',
      'Fuentes de consulta y bibliografía en formato APA',
    ],
    content: '',
  },
];

export const INITIAL_CURRICULUM: Semester[] = [
  {
    number: 1,
    name: 'Primer Semestre',
    projectIntegratorTitle: 'El Parque Temático de la Escuela Normal Superior: Una Física en Movimiento',
    projectIntegratorPurpose:
      'Diseñar y construir un entorno interactivo y lúdico basado en atracciones mecánicas y astronómicas, transformando conceptos abstractos de la física en experiencias de aprendizaje activo para la formación docente en la Escuela Normal Superior.',
    articulatedSubjects: [
      'Mecánica',
      'Álgebra para Física',
      'Didáctica de las Ciencias Experimentales',
      'Tecnologías y Pedagogías Emergentes',
    ],
    academicYear: '2026',
    description:
      'Proyecto Integrador: El Parque Temático de la Física (50%). Articulación de mecánica, álgebra, tecnologías y didáctica a través de 5 proyectos por equipos.',
    status: 'active',
    modules: [
      {
        id: 'sem1-eq1',
        semesterNumber: 1,
        order: 1,
        teamName: 'Equipo 1',
        title: 'Equipo 1: La Montaña Rusa',
        shortName: 'La Montaña Rusa',
        category: 'Cinemática y Conservación de Energía',
        subjectPurposes: {
          mecanica: 'Aplicar principios de conservación de energía y aceleración centrípeta.',
          algebra: 'Modelar funciones cuadráticas de velocidad y posición en rieles.',
          tecnologias: 'Emplear sensores y Tracker para capturar datos cinemáticos.',
          didactica: 'Explicar el ciclo energético de forma lúdica a nivel básico.',
        },
        rubric: {
          criterio: 'Rigor físico-matemático y precisión en el diseño del circuito.',
          nivelEsperado: 'Maqueta funcional con error experimental menor al 10% y ecuaciones correctas.',
        },
        guideSections: createDefaultGuideSections(
          'Funciones cuadráticas de posición, energía potencial (Ep = mgh), cinética (Ec = ½mv²) y aceleración centrípeta en el rizo'
        ),
        theoryContent: '',
        historyContent: '',
        simulatorConfig: {
          type: 'roller-coaster',
          title: 'Simulador Interactivo: La Montaña Rusa (Energía, Rizo y Seguridad)',
          description:
            'Simulación de conservación de la energía mecánica, pérdida por fricción, fuerza G, radio del rizo y sistemas de sujeción.',
        },
        resources: [],
        notes: [],
        lastUpdated: '2026-10-05',
      },
      {
        id: 'sem1-eq2',
        semesterNumber: 1,
        order: 2,
        teamName: 'Equipo 2',
        title: 'Equipo 2: Sillas Voladoras',
        shortName: 'Sillas Voladoras',
        category: 'Vectores y Movimiento Circular',
        subjectPurposes: {
          mecanica: 'Estudiar el movimiento circular uniforme y la fuerza centrípeta.',
          algebra: 'Resolver sistemas de vectores de tensión y ángulos de inclinación.',
          tecnologias: 'Simulación y modelación geométrica interactiva en GeoGebra.',
          didactica: 'Crear una estación donde los alumnos infieran la inercia rotacional.',
        },
        rubric: {
          criterio: 'Coherencia analítica y estabilidad estructural del carrusel.',
          nivelEsperado: 'Demostración matemática clara del ángulo de apertura respecto a la velocidad angular.',
        },
        guideSections: createDefaultGuideSections(
          'Descomposición vectorial de la tensión (Tx = T·senθ, Ty = T·cosθ) y relación tan(θ) = ω²·r / g'
        ),
        theoryContent: '',
        historyContent: '',
        simulatorConfig: {
          type: 'flying-chairs',
          title: 'Simulador Interactivo: Sillas Voladoras (MCU y Vectores GeoGebra)',
          description:
            'Modelación geométrica de vectores de tensión, ángulo de inclinación θ respecto a la velocidad angular ω y seguridad vial en curvas.',
        },
        resources: [],
        notes: [],
        lastUpdated: '2026-10-05',
      },
      {
        id: 'sem1-eq3',
        semesterNumber: 1,
        order: 3,
        teamName: 'Equipo 3',
        title: 'Equipo 3: El Barco de Vaivén',
        shortName: 'El Barco de Vaivén',
        category: 'Ecuaciones y Movimiento Armónico',
        subjectPurposes: {
          mecanica: 'Analizar el movimiento armónico simple y el péndulo físico.',
          algebra: 'Emplear funciones senoidales y ecuaciones diferenciales básicas.',
          tecnologias: 'Uso de herramientas de video-análisis digital (Tracker).',
          didactica: 'Diseñar dinámicas de resonancia y frecuencia perceptible.',
        },
        rubric: {
          criterio: 'Ajuste del modelo matemático al comportamiento oscilatorio real.',
          nivelEsperado: 'Gráficas experimentales alineadas con la teoría de amortiguamiento armónico.',
        },
        guideSections: createDefaultGuideSections(
          'Funciones senoidales θ(t) = θ₀·e^(-γt)·cos(ωt), periodo del péndulo y amortiguamiento'
        ),
        theoryContent: '',
        historyContent: '',
        simulatorConfig: {
          type: 'swinging-ship',
          title: 'Simulador Interactivo: El Barco de Vaivén (MAS y Gráficas Tracker)',
          description:
            'Análisis del péndulo físico, periodo, frecuencia y gráficas senoidales comparando el modelo ideal vs. amortiguado.',
        },
        resources: [],
        notes: [],
        lastUpdated: '2026-10-05',
      },
      {
        id: 'sem1-eq4',
        semesterNumber: 1,
        order: 4,
        teamName: 'Equipo 4',
        title: 'Equipo 4: El Reloj Ecuatorial',
        shortName: 'El Reloj Ecuatorial',
        category: 'Astronomía de Posición y Gnomónica',
        subjectPurposes: {
          mecanica: 'Comprender la cinemática de rotación terrestre y vectores solares.',
          algebra: 'Aplicar trigonometría esférica y relaciones angulares espaciales.',
          tecnologias: 'Integración de guías digitales de orientación y software astronómico.',
          didactica: 'Enseñar la medición ancestral del tiempo mediante astronomía de posición.',
        },
        rubric: {
          criterio: 'Precisión en la orientación gnomónica y fundamentación celeste.',
          nivelEsperado: 'Instrumento funcional adaptado a la latitud local con lectura horaria exacta.',
        },
        guideSections: createDefaultGuideSections(
          'Trigonometría esférica, inclinación del gnomon según la latitud φ, razón angular de 15°/hora y Ecuación del Tiempo'
        ),
        theoryContent: '',
        historyContent: '',
        simulatorConfig: {
          type: 'equatorial-sundial',
          appletUrl: 'https://ai.studio/apps/e8b829a0-fea8-4941-9784-6d07e84792c7',
          title: 'Simulador 3D de Reloj Ecuatorial (Observar, Orientar, Medir y Comparar)',
          description:
            'Simulación interactiva 3D con orientación al norte, ajuste de latitud, registro de sombras, comparación con hora convencional y modo de alto contraste.',
        },
        resources: [],
        notes: [],
        lastUpdated: '2026-10-05',
      },
      {
        id: 'sem1-eq5',
        semesterNumber: 1,
        order: 5,
        teamName: 'Equipo 5',
        title: 'Equipo 5: Carritos Chocones',
        shortName: 'Carritos Chocones',
        category: 'Dinámica, Impulso y Cantidad de Movimiento',
        subjectPurposes: {
          mecanica: 'Aplicar leyes de conservación del momento lineal e impulso.',
          algebra: 'Manejo de vectores de velocidad bidimensional antes y después del choque.',
          tecnologias: 'Simulación en PhET y registro automatizado de colisiones (Data-Logging).',
          didactica: 'Demostrar choques elásticos e inelásticos de manera vivencial.',
        },
        rubric: {
          criterio: 'Comprobación experimental de la conservación del momento en colisiones.',
          nivelEsperado: 'Balances de momentum cuantitativamente comprobados y explicados.',
        },
        guideSections: createDefaultGuideSections(
          'Conservación del momento lineal (p = m·v), teorema impulso-momento (J = F·Δt) y coeficiente de restitución (e)'
        ),
        theoryContent: '',
        historyContent: '',
        simulatorConfig: {
          type: 'bumper-cars',
          title: 'Simulador Interactivo: Carritos Chocones (Colisiones, Momentum y Data-Logging)',
          description:
            'Simulación de choques elásticos e inelásticos, conservación del momentum, impulso y fuerza de impacto con cinturón o retención infantil.',
        },
        resources: [],
        notes: [],
        lastUpdated: '2026-10-05',
      },
    ],
    emergentTechVideos: [
      {
        id: 'vid-eq1',
        teamNumber: 1,
        teamName: 'Equipo 1',
        projectTitle: 'La Montaña Rusa',
        videoTitle: '',
        videoUrl: '',
      },
      {
        id: 'vid-eq2',
        teamNumber: 2,
        teamName: 'Equipo 2',
        projectTitle: 'Sillas Voladoras',
        videoTitle: '',
        videoUrl: '',
      },
      {
        id: 'vid-eq3',
        teamNumber: 3,
        teamName: 'Equipo 3',
        projectTitle: 'El Barco de Vaivén',
        videoTitle: '',
        videoUrl: '',
      },
      {
        id: 'vid-eq4',
        teamNumber: 4,
        teamName: 'Equipo 4',
        projectTitle: 'El Reloj Ecuatorial',
        videoTitle: '',
        videoUrl: '',
      },
      {
        id: 'vid-eq5',
        teamNumber: 5,
        teamName: 'Equipo 5',
        projectTitle: 'Carritos Chocones',
        videoTitle: '',
        videoUrl: '',
      },
    ],
  },
  {
    number: 2,
    name: 'Segundo Semestre',
    academicYear: '2027',
    description: '',
    status: 'upcoming',
    modules: [],
  },
  {
    number: 3,
    name: 'Tercer Semestre',
    academicYear: '2027',
    description: '',
    status: 'upcoming',
    modules: [],
  },
  {
    number: 4,
    name: 'Cuarto Semestre',
    academicYear: '2028',
    description: '',
    status: 'upcoming',
    modules: [],
  },
  {
    number: 5,
    name: 'Quinto Semestre',
    academicYear: '2028',
    description: '',
    status: 'upcoming',
    modules: [],
  },
  {
    number: 6,
    name: 'Sexto Semestre',
    academicYear: '2029',
    description: '',
    status: 'upcoming',
    modules: [],
  },
  {
    number: 7,
    name: 'Séptimo Semestre',
    academicYear: '2029',
    description: '',
    status: 'upcoming',
    modules: [],
  },
  {
    number: 8,
    name: 'Octavo Semestre',
    academicYear: '2030',
    description: '',
    status: 'upcoming',
    modules: [],
  },
];

export const STORAGE_KEY = 'ensms_fisica_parque_tematico_2026_v6';
