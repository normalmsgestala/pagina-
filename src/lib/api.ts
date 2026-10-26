import { useCallback, useEffect, useState } from 'react';

export type Role = 'admin' | 'capitan' | 'moderador' | 'editor' | 'maestro';
export type Team = 'investigacion' | 'mecanica' | 'logistica';
export type Kind = 'articulo' | 'podcast' | 'documento' | 'fuente' | 'evidencia';
export type Status = 'pending' | 'approved' | 'rejected';

export interface User { id: number; username: string; fullName: string; role: Role; mustChange: boolean }
export interface Post {
  id: number; kind: Kind; title: string; summary: string; url: string; moduleId: string;
  data: Record<string, any>; team: string; status: Status; authorName: string; authorId: number;
  reviewNote: string; createdAt: string; publishedAt: string | null;
  review?: import('./articleRubric').ArticleEvaluation & { createdAt: string };
}
export interface CalendarEvent {
  id: number | string; date: string; title: string; description: string; mediaUrls: string[];
  team?: string; status?: Status; authorName?: string; reviewNote?: string;
}

export const TEAM_LABEL: Record<Team, string> = { investigacion: 'Investigación', mecanica: 'Mecánica', logistica: 'Logística' };
export const ROLE_LABEL: Record<Role, string> = { admin: 'Administrador', capitan: 'Capitán', moderador: 'Moderador', editor: 'Editor', maestro: 'Maestro' };
export const KIND_LABEL: Record<Kind, string> = {
  articulo: 'Artículo', podcast: 'Podcast', documento: 'Documento', fuente: 'Fuente bibliográfica', evidencia: 'Evidencia',
};
export const STATUS_LABEL: Record<Status, string> = { pending: 'En revisión', approved: 'Publicado', rejected: 'Rechazado' };
export const KINDS_BY_TEAM: Record<Team, Kind[]> = {
  investigacion: ['articulo', 'podcast', 'documento', 'fuente'],
  mecanica: ['articulo', 'podcast', 'evidencia'],
  logistica: ['articulo', 'podcast', 'evidencia'],
};
export const CALENDAR_TEAMS: Team[] = ['mecanica', 'logistica'];
export const isMod = (r?: Role | null) => r === 'admin' || r === 'capitan' || r === 'moderador';
/** Admin y capitanes: administran la página, usuarios y actividad. */
export const isLeader = (r?: Role | null) => r === 'admin' || r === 'capitan';
/** Solo admin y capitanes aprueban lo que se sube y editan la página directamente. */
export const isApprover = isLeader;

export interface Proposal {
  id: number; moduleId: string; field: string; sectionTitle: string; moduleTitle: string;
  before: string; contribution: string; after: string; mergedByAi: boolean; status: Status;
  authorId: number; authorName: string; reviewerName: string; reviewNote: string; createdAt: string; reviewedAt: string | null;
}

/** Número de aprobaciones pendientes (solo para capitanes y admin); se actualiza cada minuto. */
export function useApprovalCount(enabled: boolean) {
  const [count, setCount] = useState(0);
  const refresh = useCallback(() => {
    if (!enabled) { setCount(0); return; }
    api<{ count: number }>('approvals/count').then(r => setCount(r.count)).catch(() => {});
  }, [enabled]);
  useEffect(() => {
    refresh();
    if (!enabled) return;
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [refresh, enabled]);
  return { count, refresh };
}

export const CONSISTENCY_NOTE = 'Lo que subas debe concordar con lo que ya está en la página: mismo tema, mismos datos y sin contradecir lo publicado. La IA junta tu aporte con el contenido existente sin agregar información nueva, y un capitán revisa el antes y el después antes de publicarlo.';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch('/api/' + path, {
    method: opts.method || (opts.body !== undefined ? 'POST' : 'GET'),
    headers: opts.body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: 'same-origin',
  });
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : null;
  if (!res.ok) throw new ApiError(res.status, (data && data.error) || 'No se pudo conectar con el servidor');
  return data as T;
}

/** Sesión actual. `user` es null si no hay sesión; `ready` indica que ya se consultó. */
export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | ''>('');
  const [ready, setReady] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const r = await api<{ user: User | null; team: Team | '' }>('auth/me');
      setUser(r.user); setTeam(r.team || '');
    } catch { setUser(null); setTeam(''); }
    finally { setReady(true); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { user, team, ready, refresh, setUser, setTeam };
}

/** Lista pública de publicaciones aprobadas de un tipo. Falla en silencio si la API no está disponible. */
export function usePublicPosts(kind?: Kind) {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    let alive = true;
    api<{ posts: Post[] }>('posts' + (kind ? '?kind=' + kind : ''))
      .then(r => { if (alive) setPosts(r.posts); })
      .catch(() => {});
    return () => { alive = false; };
  }, [kind]);
  return posts;
}

export function formatDate(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso.replace(' ', 'T') + 'Z');
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}
export function formatDateTime(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  return isNaN(d.getTime()) ? iso : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
}

/** Referencia en formato APA 7 a partir de los campos del formulario de fuente bibliográfica. */
export function apaReference(d: Record<string, any>, title: string, url: string) {
  const authors = (d.authors || '').trim();
  const year = (d.year || 's.f.').trim();
  const source = (d.source || '').trim();
  const t = title.trim();
  const tail = url ? ' ' + url : '';
  switch (d.sourceType) {
    case 'revista': return `${authors} (${year}). ${t}. ${source}${d.volume ? ', ' + d.volume : ''}${d.pages ? ', ' + d.pages : ''}.${tail}`;
    case 'web': return `${authors || source} (${year}). ${t}. ${source && authors ? source + '.' : ''}${tail}`.replace(/\s+/g, ' ').trim();
    case 'video': return `${authors} (${year}). ${t} [Video]. ${source}.${tail}`;
    case 'tesis': return `${authors} (${year}). ${t} [Tesis]. ${source}.${tail}`;
    default: return `${authors} (${year}). ${t}. ${source}.${tail}`;
  }
}

export const ACTION_LABEL: Record<string, string> = {
  inicio_sesion: 'Inició sesión', cierre_sesion: 'Cerró sesión', seleccion_equipo: 'Eligió equipo',
  cambio_contrasena: 'Cambió contraseña', envio_articulo: 'Envió artículo', envio_podcast: 'Envió podcast',
  envio_documento: 'Subió documento', envio_fuente: 'Agregó fuente', envio_evidencia: 'Subió evidencia',
  envio_calendario: 'Agregó fecha al calendario', aprobacion: 'Aprobó', rechazo: 'Rechazó', edicion: 'Editó envío',
  eliminacion: 'Eliminó', edicion_pagina: 'Editó la página', alta_usuario: 'Creó usuario', cambio_rol: 'Cambió rol',
  reinicio_contrasena: 'Reinició contraseña', activacion_usuario: 'Activó usuario', desactivacion_usuario: 'Desactivó usuario',
};

// ---------- IA ----------
export type AiTask = 'corregir' | 'mejorar' | 'resumir' | 'palabras_clave' | 'apa' | 'sugerencias' | 'revisar' | 'pagina' | 'capitania' | 'libre' | 'actividad';
export const AI_TASK_LABEL: Record<AiTask, string> = {
  corregir: 'Corregir ortografía', mejorar: 'Mejorar redacción', resumir: 'Hacer resumen', palabras_clave: 'Sugerir palabras clave',
  apa: 'Formato APA', sugerencias: 'Darme sugerencias', revisar: 'Revisar envío', pagina: 'Redactar texto de la página',
  capitania: 'Ayúdame con mi capitanía', libre: 'Pedir cualquier cosa', actividad: 'Informe de actividad para calificar',
};
/** Tareas que puede usar cada rol (el servidor vuelve a validarlo). */
export const AI_TASKS_BY_ROLE: Record<Role, AiTask[]> = {
  editor: ['corregir', 'mejorar', 'resumir', 'palabras_clave', 'apa', 'sugerencias'],
  moderador: ['corregir', 'mejorar', 'resumir', 'palabras_clave', 'apa', 'sugerencias', 'revisar', 'pagina'],
  capitan: ['capitania', 'pagina', 'revisar', 'corregir', 'mejorar', 'resumir', 'palabras_clave', 'apa', 'sugerencias'],
  admin: ['corregir', 'mejorar', 'resumir', 'palabras_clave', 'apa', 'sugerencias', 'revisar', 'pagina', 'libre', 'actividad'],
  maestro: [],
};
/** Tareas cuyo resultado reemplaza el texto (las demás solo se muestran). */
export const AI_REPLACES: AiTask[] = ['corregir', 'mejorar', 'resumir', 'palabras_clave', 'apa', 'pagina'];
export const aiRun = (task: AiTask, text: string, instruction = '') =>
  api<{ result: string }>('ai', { body: { task, text, instruction } }).then(r => r.result);

export const ROLE_DUTIES: Record<Role, string[]> = {
  admin: ['Crear usuarios, cambiar roles y restablecer contraseñas.', 'Aprobar o rechazar todo lo que envían los equipos.',
    'Editar cualquier parte de la página con el «Modo edición».', 'Mover y configurar la gráfica de conexiones y trabajos.',
    'Consultar y descargar la actividad para calificar.', 'Usar la IA para cualquier tarea de la página.'],
  capitan: ['Cambiar el diseño de la página (colores, tipografías, textos de portada y orden de secciones) en «Diseño de la página».',
    'Aprobar o rechazar los aportes y envíos de tus compañeros viendo el antes y el después (pestaña «Aprobaciones»).',
    'Editar, mover, agregar y borrar contenido de la página con el «Modo edición».', 'Gestionar a los compañeros (excepto administrador y capitanes) y ver la actividad.',
    'Usar la IA para planear tu capitanía y modificar la página según lo que redactaste.',
    'Si algo sale mal, el administrador puede restaurar cualquiera de las últimas 10 versiones.'],
  moderador: ['Aportar a los apartados de la página; la IA junta tu aporte y un capitán lo aprueba.',
    'Enviar artículos, podcasts, documentos y evidencias; un capitán los aprueba.', 'Usar la IA para revisar textos y redactar contenido de la página.'],
  editor: ['Aportar a los apartados de cada proyecto con el botón «Aportar a este apartado».',
    'Enviar contenido según tu equipo; un capitán lo revisa antes de publicarse.', 'Ver el estado de tus envíos en «Mis envíos».',
    'Usar la IA solo para corregir y mejorar tu propio trabajo.'],
  maestro: ['Consultar la actividad de cada estudiante.', 'Descargar el registro para Excel y apoyar la calificación.'],
};
export const TEAM_DUTIES: Record<Team, string> = {
  investigacion: 'Subes documentación, artículos, podcasts y fuentes bibliográficas.',
  mecanica: 'Subes evidencias del trabajo, artículos y podcasts, y actualizas el calendario.',
  logistica: 'Subes evidencias del trabajo, artículos y podcasts, y actualizas el calendario.',
};
