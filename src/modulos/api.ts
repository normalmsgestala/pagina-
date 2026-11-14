// Cliente de datos. Usa el servidor de Cloudflare (/api) cuando existe.
// Si no hay servidor (por ejemplo en GitHub Pages o en desarrollo local), funciona en
// "modo demostración" guardando todo en este navegador.
import type { ProgresoModulo, Entrega } from './progreso';
import { progresoVacio } from './progreso';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  edad: number;
  escuela: string;
  ciudad: string;
  estado: string;
  rol: string; // alumno | docente | otro (dato del registro)
  staff: boolean; // puede ver el panel docente
  admin: boolean;
  creado: string;
}

export interface Registro {
  nombre: string; edad: number; escuela: string; ciudad: string; estado: string; rol: string; email: string; password: string;
}

export interface FilaPanel {
  usuario: Usuario;
  modulo: string;
  progreso: ProgresoModulo;
  ultimo?: string;
}

const API = '/api/modulos';
const TOKEN_KEY = 'leaf-modulos-token';
let modoDemo: boolean | null = null;

export const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t: string | null) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export async function esDemo(): Promise<boolean> {
  if (modoDemo !== null) return modoDemo;
  try {
    const r = await fetch(`${API}/ping`);
    const j = r.ok && r.headers.get('content-type')?.includes('json') ? await r.json() : null;
    modoDemo = !(j && j.ok);
  } catch {
    modoDemo = true;
  }
  return modoDemo;
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  if (opts.body && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const r = await fetch(`${API}${path}`, { ...opts, headers });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `Error ${r.status}`);
  return j as T;
}

// ---------------- Modo demostración (localStorage) ----------------
const DK = 'leaf-modulos-demo';
interface DemoDB {
  usuarios: (Usuario & { password: string })[];
  progreso: Record<string, ProgresoModulo>; // `${userId}:${modulo}`
  folios: Record<string, { usuario: string; modulo: string; fecha: string }>;
}
const leer = (): DemoDB => {
  try { return JSON.parse(localStorage.getItem(DK) || '') as DemoDB; } catch { return { usuarios: [], progreso: {}, folios: {} }; }
};
const guardar = (db: DemoDB) => localStorage.setItem(DK, JSON.stringify(db));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const demoUser = (): (Usuario & { password: string }) | undefined => leer().usuarios.find((u) => u.id === getToken());
const sinPass = (u: Usuario & { password?: string }): Usuario => { const { password, ...r } = u; void password; return r; };

export function folio(): string {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += a[Math.floor(Math.random() * a.length)];
  return `LEAF-${s.slice(0, 4)}-${s.slice(4)}`;
}

// ---------------- API pública ----------------
export const api = {
  async registro(d: Registro): Promise<Usuario> {
    if (await esDemo()) {
      const db = leer();
      if (db.usuarios.some((u) => u.email === d.email.toLowerCase())) throw new Error('Ese correo ya está registrado.');
      const primero = db.usuarios.length === 0;
      const u = { ...d, email: d.email.toLowerCase(), id: uid(), staff: primero, admin: primero, creado: new Date().toISOString() };
      db.usuarios.push(u); guardar(db); setToken(u.id);
      return sinPass(u);
    }
    const r = await req<{ token: string; usuario: Usuario }>('/auth/registro', { method: 'POST', body: JSON.stringify(d) });
    setToken(r.token); return r.usuario;
  },
  async login(email: string, password: string): Promise<Usuario> {
    if (await esDemo()) {
      const u = leer().usuarios.find((x) => x.email === email.toLowerCase() && x.password === password);
      if (!u) throw new Error('Correo o contraseña incorrectos.');
      setToken(u.id); return sinPass(u);
    }
    const r = await req<{ token: string; usuario: Usuario }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setToken(r.token); return r.usuario;
  },
  async yo(): Promise<Usuario | null> {
    if (!getToken()) return null;
    if (await esDemo()) { const u = demoUser(); return u ? sinPass(u) : null; }
    try { return (await req<{ usuario: Usuario }>('/yo')).usuario; } catch { setToken(null); return null; }
  },
  async salir() {
    if (!(await esDemo())) await req('/auth/salir', { method: 'POST' }).catch(() => {});
    setToken(null);
  },
  async cambiarPassword(actual: string, nueva: string) {
    if (await esDemo()) {
      const db = leer(); const u = db.usuarios.find((x) => x.id === getToken());
      if (!u || u.password !== actual) throw new Error('La contraseña actual no es correcta.');
      u.password = nueva; guardar(db); return;
    }
    await req('/auth/password', { method: 'POST', body: JSON.stringify({ actual, nueva }) });
  },

  async progreso(modulo: string): Promise<ProgresoModulo> {
    if (await esDemo()) return leer().progreso[`${getToken()}:${modulo}`] ?? progresoVacio();
    return (await req<{ progreso: ProgresoModulo }>(`/progreso?modulo=${encodeURIComponent(modulo)}`)).progreso;
  },
  async guardarSesion(modulo: string, sesion: number, datos: { respuestas?: Record<string, string>; terminada?: boolean; simulador?: string }): Promise<ProgresoModulo> {
    if (await esDemo()) {
      const db = leer(); const k = `${getToken()}:${modulo}`;
      const p = db.progreso[k] ?? progresoVacio();
      const s = p.sesiones[sesion] ?? { terminada: false, respuestas: {}, simuladores: [] };
      if (datos.respuestas) s.respuestas = { ...s.respuestas, ...datos.respuestas };
      if (datos.terminada !== undefined) s.terminada = datos.terminada;
      if (datos.simulador && !s.simuladores.includes(datos.simulador)) s.simuladores.push(datos.simulador);
      s.actualizado = new Date().toISOString();
      p.sesiones[sesion] = s; db.progreso[k] = p; guardar(db); return p;
    }
    return (await req<{ progreso: ProgresoModulo }>('/progreso/sesion', { method: 'PUT', body: JSON.stringify({ modulo, sesion, ...datos }) })).progreso;
  },
  async repaso(modulo: string, fase: number, aciertos: number, total: number): Promise<ProgresoModulo> {
    if (await esDemo()) {
      const db = leer(); const k = `${getToken()}:${modulo}`;
      const p = db.progreso[k] ?? progresoVacio();
      const prev = p.repasos[fase] ?? { mejor: 0, intentos: 0 };
      p.repasos[fase] = { mejor: Math.max(prev.mejor, aciertos / total), intentos: prev.intentos + 1 };
      db.progreso[k] = p; guardar(db); return p;
    }
    return (await req<{ progreso: ProgresoModulo }>('/repaso', { method: 'POST', body: JSON.stringify({ modulo, fase, aciertos, total }) })).progreso;
  },
  async subirEntrega(modulo: string, sesion: number, archivo: Blob, nombre: string): Promise<ProgresoModulo> {
    if (await esDemo()) {
      if (archivo.size > 1_500_000) throw new Error('La foto pesa demasiado.');
      const url = await new Promise<string>((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result as string); fr.readAsDataURL(archivo); });
      const db = leer(); const k = `${getToken()}:${modulo}`;
      const p = db.progreso[k] ?? progresoVacio();
      const e: Entrega = { id: uid(), sesion, key: uid(), nombre, tipo: archivo.type, estado: 'pendiente', fecha: new Date().toISOString(), url };
      p.entregas.push(e); db.progreso[k] = p; guardar(db); return p;
    }
    const fd = new FormData();
    fd.append('modulo', modulo); fd.append('sesion', String(sesion)); fd.append('archivo', archivo, nombre);
    return (await req<{ progreso: ProgresoModulo }>('/entregas', { method: 'POST', body: fd })).progreso;
  },
  async subirEnlace(modulo: string, sesion: number, enlace: string): Promise<ProgresoModulo> {
    if (await esDemo()) {
      const db = leer(); const k = `${getToken()}:${modulo}`;
      const p = db.progreso[k] ?? progresoVacio();
      p.entregas.push({ id: uid(), sesion, key: '', nombre: 'Enlace a video', tipo: 'enlace', estado: 'pendiente', fecha: new Date().toISOString(), url: enlace });
      db.progreso[k] = p; guardar(db); return p;
    }
    const fd = new FormData();
    fd.append('modulo', modulo); fd.append('sesion', String(sesion)); fd.append('enlace', enlace);
    return (await req<{ progreso: ProgresoModulo }>('/entregas', { method: 'POST', body: fd })).progreso;
  },
  /** URL para ver un archivo entregado (incluye el token). */
  urlEntrega(e: Entrega) {
    return e.url ?? `${API}/entregas/archivo?id=${encodeURIComponent(e.id)}&t=${encodeURIComponent(getToken() || '')}`;
  },
  async certificado(modulo: string): Promise<{ folio: string; fecha: string }> {
    if (await esDemo()) {
      const db = leer(); const k = `${getToken()}:${modulo}`;
      const p = db.progreso[k] ?? progresoVacio();
      if (!p.certificado) {
        const f = folio(); const fecha = new Date().toISOString();
        p.certificado = { folio: f, fecha }; db.folios[f] = { usuario: getToken()!, modulo, fecha };
        db.progreso[k] = p; guardar(db);
      }
      return p.certificado!;
    }
    return (await req<{ certificado: { folio: string; fecha: string } }>('/certificado', { method: 'POST', body: JSON.stringify({ modulo }) })).certificado;
  },
  async verificar(f: string): Promise<{ nombre: string; modulo: string; fecha: string } | null> {
    if (await esDemo()) {
      const db = leer(); const x = db.folios[f.trim().toUpperCase()];
      if (!x) return null;
      return { nombre: db.usuarios.find((u) => u.id === x.usuario)?.nombre ?? '', modulo: x.modulo, fecha: x.fecha };
    }
    try { return (await req<{ certificado: { nombre: string; modulo: string; fecha: string } }>(`/certificado/verificar?folio=${encodeURIComponent(f.trim())}`)).certificado; } catch { return null; }
  },

  // ---------- Panel docente ----------
  async panel(): Promise<FilaPanel[]> {
    if (await esDemo()) {
      const db = leer();
      return Object.entries(db.progreso).map(([k, p]) => {
        const [uidx, modulo] = k.split(':');
        const u = db.usuarios.find((x) => x.id === uidx);
        return u ? { usuario: sinPass(u), modulo, progreso: p } : null;
      }).filter(Boolean) as FilaPanel[];
    }
    return (await req<{ filas: FilaPanel[] }>('/admin/panel')).filas;
  },
  async usuarios(): Promise<Usuario[]> {
    if (await esDemo()) return leer().usuarios.map(sinPass);
    return (await req<{ usuarios: Usuario[] }>('/admin/usuarios')).usuarios;
  },
  async revisarEntrega(usuario: string, modulo: string, id: string, estado: Entrega['estado'], comentario: string) {
    if (await esDemo()) {
      const db = leer(); const p = db.progreso[`${usuario}:${modulo}`];
      const e = p?.entregas.find((x) => x.id === id); if (e) { e.estado = estado; e.comentario = comentario; guardar(db); }
      return;
    }
    await req('/admin/entregas', { method: 'POST', body: JSON.stringify({ id, estado, comentario }) });
  },
  async ponerStaff(usuario: string, staff: boolean) {
    if (await esDemo()) {
      const db = leer(); const u = db.usuarios.find((x) => x.id === usuario); if (u) { u.staff = staff; guardar(db); } return;
    }
    await req('/admin/staff', { method: 'POST', body: JSON.stringify({ usuario, staff }) });
  },
  async listaDocente(): Promise<{ modulo: string; archivo: string; tamano: number }[]> {
    if (await esDemo()) return [];
    return (await req<{ archivos: { modulo: string; archivo: string; tamano: number }[] }>('/docente/lista')).archivos;
  },
  async subirDocente(modulo: string, archivo: string, f: File) {
    if (await esDemo()) throw new Error('En modo demostración no se pueden subir materiales.');
    const fd = new FormData();
    fd.append('modulo', modulo); fd.append('archivo_nombre', archivo); fd.append('archivo', f, archivo);
    await req('/docente/archivo', { method: 'POST', body: fd });
  },
  urlDocente(modulo: string, archivo: string) {
    return `${API}/docente/archivo?modulo=${encodeURIComponent(modulo)}&archivo=${encodeURIComponent(archivo)}&t=${encodeURIComponent(getToken() || '')}`;
  },
};
