import { useCallback, useEffect, useState } from 'react';

export type Role = 'admin' | 'moderador' | 'editor' | 'maestro';
export type Team = 'investigacion' | 'mecanica' | 'logistica';
export type Kind = 'articulo' | 'podcast' | 'documento' | 'fuente' | 'evidencia';
export type Status = 'pending' | 'approved' | 'rejected';

export interface User { id: number; username: string; fullName: string; role: Role; mustChange: boolean }
export interface Post {
  id: number; kind: Kind; title: string; summary: string; url: string; moduleId: string;
  data: Record<string, any>; team: string; status: Status; authorName: string; authorId: number;
  reviewNote: string; createdAt: string; publishedAt: string | null;
}
export interface CalendarEvent {
  id: number | string; date: string; title: string; description: string; mediaUrls: string[];
  team?: string; status?: Status; authorName?: string; reviewNote?: string;
}

export const TEAM_LABEL: Record<Team, string> = { investigacion: 'Investigación', mecanica: 'Mecánica', logistica: 'Logística' };
export const ROLE_LABEL: Record<Role, string> = { admin: 'Administrador', moderador: 'Moderador', editor: 'Editor', maestro: 'Maestro' };
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
export const isMod = (r?: Role | null) => r === 'admin' || r === 'moderador';

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
