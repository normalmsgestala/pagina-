// Estructura reutilizable de un módulo de aprendizaje.
// Para agregar un tema nuevo, se crea un archivo en src/modulos/data/ con esta forma
// y se agrega a la lista en src/modulos/data/index.ts.

export interface PlanItem {
  pregunta: string;
  que: string;
  como: string;
  cuando: string;
  donde: string;
  paraQue: string;
  conQue: string;
}

export interface Lectura {
  titulo?: string;
  parrafos: string[];
  fuente?: string; // de dónde viene la lectura (libro y página)
}

export interface PreguntaFicha {
  id: string;
  texto: string;
  tipo?: 'texto' | 'corta' | 'firma' | 'casillas';
  opciones?: string[]; // para 'casillas'
}

export interface Ficha {
  numero: number;
  titulo: string;
  pdf: string; // ruta dentro de /modulos/<id>/
  instruccion?: string;
  lectura?: Lectura;
  preguntas: PreguntaFicha[];
  dibujo?: string; // descripción del dibujo que se sube como foto
}

export interface Sesion {
  numero: number;
  titulo: string;
  inicio: string;
  desarrollo: string[];
  cierre: string;
  aprendePDA?: string;
  recursos: string[];
  ficha: Ficha;
  simuladores?: string[]; // ids de simuladores
  entrega: string; // qué foto sube el alumno
  seguridad?: boolean; // muestra una regla de seguridad
  seguridadTexto?: string; // texto propio; si falta, se usa la regla del Sol
}

export interface PreguntaRepaso {
  texto: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

export interface Fase {
  numero: number;
  nombre: string; // nombre corto STEAM
  nombreLargo: string;
  sesiones: Sesion[];
  repaso: PreguntaRepaso[];
}

export interface Modulo {
  id: string;
  titulo: string;
  subtitulo: string;
  materia: string;
  grado: string;
  campo: string;
  duracion: string;
  inicio: string; // fecha de apertura
  pda: string[];
  preguntaCentral: string;
  situacion: string[];
  preguntas: string[];
  plan: PlanItem[];
  recursos: { titulo: string; tipo: 'video' | 'pdf'; archivo: string; descripcion: string }[];
  fases: Fase[];
  evidencia: string;
  evaluacion: string[];
  docente: { titulo: string; archivo: string }[]; // archivos privados (R2)
}

export const APROBATORIO = 0.8;
