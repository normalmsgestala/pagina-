// API de "Módulos de aprendizaje" — Cloudflare Pages Functions + D1 (fotos y PDF guardados en D1).
// Rutas (todas bajo /api/modulos/): ping, /api/auth/*, /api/yo, /api/progreso, /api/repaso, /api/entregas,
//        /api/certificado, /api/admin/*, /api/docente/archivo
import { getModulo } from '../../../src/modulos/data';
import { puedeCertificado, type ProgresoModulo, type Entrega } from '../../../src/modulos/progreso';

// Tipos mínimos de Cloudflare (para no depender de @cloudflare/workers-types)
interface D1Result<T> { results: T[] }
interface D1Stmt { bind(...v: unknown[]): D1Stmt; first<T = Record<string, unknown>>(): Promise<T | null>; all<T = Record<string, unknown>>(): Promise<D1Result<T>>; run(): Promise<unknown> }
interface D1 { prepare(q: string): D1Stmt; batch(s: D1Stmt[]): Promise<unknown> }
interface Env { MODULOS_DB: D1; MODULOS_ADMIN_EMAILS?: string }
const PARTE = 1_500_000; // tamaño de cada pedazo guardado en D1 (límite por fila: 2 MB)
interface Ctx { request: Request; env: Env; params: { ruta?: string[] } }

const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const error = (msg: string, status = 400) => json({ error: msg }, status);
const ahora = () => new Date().toISOString();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const aleatorio = (n = 24) => hex(crypto.getRandomValues(new Uint8Array(n)).buffer);

async function hashPass(pass: string, salt: string) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 100000 }, k, 256);
  return hex(bits);
}
const igual = (a: string, b: string) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };

interface FilaUsuario { id: string; email: string; nombre: string; edad: number; escuela: string; ciudad: string; estado: string; rol: string; staff: number; admin: number; creado: string; pass_hash?: string; pass_salt?: string }
const publico = (u: FilaUsuario) => ({ id: u.id, email: u.email, nombre: u.nombre, edad: u.edad, escuela: u.escuela, ciudad: u.ciudad, estado: u.estado, rol: u.rol, staff: !!u.admin, admin: !!u.admin, creado: u.creado });
const esAdminEmail = (env: Env, email: string) => (env.MODULOS_ADMIN_EMAILS || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean).includes(email.toLowerCase());

async function usuarioDe(req: Request, env: Env): Promise<FilaUsuario | null> {
  const url = new URL(req.url);
  const t = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || url.searchParams.get('t');
  if (!t) return null;
  return await env.MODULOS_DB.prepare('SELECT u.* FROM tokens t JOIN usuarios u ON u.id = t.usuario WHERE t.token = ? AND t.expira > ?').bind(t, ahora()).first<FilaUsuario>();
}

async function crearToken(env: Env, usuario: string) {
  const token = aleatorio(32);
  const expira = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(); // 60 días
  await env.MODULOS_DB.prepare('INSERT INTO tokens (token, usuario, creado, expira) VALUES (?, ?, ?, ?)').bind(token, usuario, ahora(), expira).run();
  return token;
}

async function cargarProgreso(env: Env, usuario: string, modulo: string): Promise<ProgresoModulo> {
  const [ses, rep, ent, cert] = await Promise.all([
    env.MODULOS_DB.prepare('SELECT * FROM progreso_sesion WHERE usuario = ? AND modulo = ?').bind(usuario, modulo).all<{ sesion: number; terminada: number; respuestas: string; simuladores: string; actualizado: string }>(),
    env.MODULOS_DB.prepare('SELECT * FROM repasos WHERE usuario = ? AND modulo = ?').bind(usuario, modulo).all<{ fase: number; mejor: number; intentos: number }>(),
    env.MODULOS_DB.prepare('SELECT * FROM entregas WHERE usuario = ? AND modulo = ? ORDER BY fecha').bind(usuario, modulo).all<{ id: string; sesion: number; r2_key: string; nombre: string; tipo: string; estado: Entrega['estado']; comentario: string | null; fecha: string; url: string | null }>(),
    env.MODULOS_DB.prepare('SELECT folio, fecha FROM certificados WHERE usuario = ? AND modulo = ?').bind(usuario, modulo).first<{ folio: string; fecha: string }>(),
  ]);
  const p: ProgresoModulo = { sesiones: {}, repasos: {}, entregas: [], certificado: cert };
  for (const s of ses.results) p.sesiones[s.sesion] = { terminada: !!s.terminada, respuestas: JSON.parse(s.respuestas || '{}'), simuladores: JSON.parse(s.simuladores || '[]'), actualizado: s.actualizado };
  for (const r of rep.results) p.repasos[r.fase] = { mejor: r.mejor, intentos: r.intentos };
  p.entregas = ent.results.map((e) => ({ id: e.id, sesion: e.sesion, key: e.r2_key, nombre: e.nombre, tipo: e.tipo, estado: e.estado, comentario: e.comentario ?? undefined, fecha: e.fecha, url: e.url ?? undefined }));
  return p;
}

function folio() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const r = crypto.getRandomValues(new Uint8Array(8));
  const s = [...r].map((x) => a[x % a.length]).join('');
  return `LEAF-${s.slice(0, 4)}-${s.slice(4)}`;
}

const limpio = (v: unknown, max = 200) => String(v ?? '').trim().slice(0, max);

export const onRequest = async ({ request, env, params }: Ctx): Promise<Response> => {
  const ruta = (params.ruta ?? []).join('/');
  const metodo = request.method;
  const url = new URL(request.url);
  try {
    if (ruta === 'ping') return json({ ok: true });

    // ---------- Registro y acceso ----------
    if (ruta === 'auth/registro' && metodo === 'POST') {
      const b = await request.json() as Record<string, unknown>;
      const email = limpio(b.email, 120).toLowerCase();
      const pass = String(b.password ?? '');
      const edad = Number(b.edad);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return error('Escribe un correo válido.');
      if (pass.length < 6) return error('La contraseña debe tener al menos 6 caracteres.');
      if (!limpio(b.nombre) || !limpio(b.escuela) || !limpio(b.ciudad) || !limpio(b.estado)) return error('Llena todos los datos.');
      if (!(edad >= 8 && edad <= 99)) return error('Escribe una edad válida.');
      const rol = ['alumno', 'docente', 'otro'].includes(String(b.rol)) ? String(b.rol) : 'otro';
      if (await env.MODULOS_DB.prepare('SELECT 1 FROM usuarios WHERE email = ?').bind(email).first()) return error('Ese correo ya está registrado. Usa "Entrar".');
      const id = crypto.randomUUID(); const salt = aleatorio(16);
      const admin = esAdminEmail(env, email) ? 1 : 0;
      await env.MODULOS_DB.prepare('INSERT INTO usuarios (id, email, nombre, edad, escuela, ciudad, estado, rol, pass_hash, pass_salt, staff, admin, creado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
        .bind(id, email, limpio(b.nombre, 120), edad, limpio(b.escuela, 160), limpio(b.ciudad, 80), limpio(b.estado, 60), rol, await hashPass(pass, salt), salt, admin, admin, ahora()).run();
      const u = await env.MODULOS_DB.prepare('SELECT * FROM usuarios WHERE id = ?').bind(id).first<FilaUsuario>();
      return json({ token: await crearToken(env, id), usuario: publico(u!) });
    }
    if (ruta === 'auth/login' && metodo === 'POST') {
      const b = await request.json() as Record<string, unknown>;
      const u = await env.MODULOS_DB.prepare('SELECT * FROM usuarios WHERE email = ?').bind(limpio(b.email, 120).toLowerCase()).first<FilaUsuario>();
      if (!u || !igual(await hashPass(String(b.password ?? ''), u.pass_salt!), u.pass_hash!)) return error('Correo o contraseña incorrectos.', 401);
      if (esAdminEmail(env, u.email) && !u.admin) { await env.MODULOS_DB.prepare('UPDATE usuarios SET admin = 1, staff = 1 WHERE id = ?').bind(u.id).run(); u.admin = 1; u.staff = 1; }
      return json({ token: await crearToken(env, u.id), usuario: publico(u) });
    }

    const u = await usuarioDe(request, env);

    // ---------- Verificación pública de certificados ----------
    if (ruta === 'certificado/verificar') {
      const c = await env.MODULOS_DB.prepare('SELECT c.modulo, c.fecha, u.nombre FROM certificados c JOIN usuarios u ON u.id = c.usuario WHERE c.folio = ?').bind(limpio(url.searchParams.get('folio'), 20).toUpperCase()).first();
      return c ? json({ certificado: c }) : error('No existe', 404);
    }

    if (!u) return error('Inicia sesión.', 401);
    const staff = !!u.admin; // solo el administrador ve el panel docente

    if (ruta === 'yo') return json({ usuario: publico(u) });
    if (ruta === 'auth/salir' && metodo === 'POST') {
      const t = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
      if (t) await env.MODULOS_DB.prepare('DELETE FROM tokens WHERE token = ?').bind(t).run();
      return json({ ok: true });
    }
    if (ruta === 'auth/password' && metodo === 'POST') {
      const b = await request.json() as Record<string, string>;
      if (!igual(await hashPass(b.actual ?? '', u.pass_salt!), u.pass_hash!)) return error('La contraseña actual no es correcta.');
      if ((b.nueva ?? '').length < 6) return error('La nueva contraseña debe tener al menos 6 caracteres.');
      const salt = aleatorio(16);
      await env.MODULOS_DB.prepare('UPDATE usuarios SET pass_hash = ?, pass_salt = ? WHERE id = ?').bind(await hashPass(b.nueva, salt), salt, u.id).run();
      return json({ ok: true });
    }

    // ---------- Progreso del alumno ----------
    if (ruta === 'progreso' && metodo === 'GET') {
      const modulo = limpio(url.searchParams.get('modulo'), 80);
      if (!getModulo(modulo)) return error('Módulo no encontrado', 404);
      return json({ progreso: await cargarProgreso(env, u.id, modulo) });
    }
    if (ruta === 'progreso/sesion' && metodo === 'PUT') {
      const b = await request.json() as { modulo: string; sesion: number; respuestas?: Record<string, string>; terminada?: boolean; simulador?: string };
      const m = getModulo(b.modulo); const sesion = Number(b.sesion);
      if (!m || !m.fases.some((f) => f.sesiones.some((s) => s.numero === sesion))) return error('Sesión no válida');
      const prev = await env.MODULOS_DB.prepare('SELECT * FROM progreso_sesion WHERE usuario = ? AND modulo = ? AND sesion = ?').bind(u.id, m.id, sesion).first<{ terminada: number; respuestas: string; simuladores: string }>();
      const resp = { ...JSON.parse(prev?.respuestas || '{}') } as Record<string, string>;
      for (const [k, v] of Object.entries(b.respuestas ?? {})) resp[limpio(k, 20)] = String(v).slice(0, 5000);
      const sims = JSON.parse(prev?.simuladores || '[]') as string[];
      if (b.simulador && !sims.includes(b.simulador)) sims.push(limpio(b.simulador, 40));
      const terminada = b.terminada === undefined ? prev?.terminada ?? 0 : b.terminada ? 1 : 0;
      await env.MODULOS_DB.prepare(`INSERT INTO progreso_sesion (usuario, modulo, sesion, terminada, respuestas, simuladores, actualizado) VALUES (?,?,?,?,?,?,?)
        ON CONFLICT(usuario, modulo, sesion) DO UPDATE SET terminada = excluded.terminada, respuestas = excluded.respuestas, simuladores = excluded.simuladores, actualizado = excluded.actualizado`)
        .bind(u.id, m.id, sesion, terminada, JSON.stringify(resp), JSON.stringify(sims), ahora()).run();
      return json({ progreso: await cargarProgreso(env, u.id, m.id) });
    }
    if (ruta === 'repaso' && metodo === 'POST') {
      const b = await request.json() as { modulo: string; fase: number; aciertos: number; total: number };
      const m = getModulo(b.modulo); const fase = Number(b.fase);
      const f = m?.fases.find((x) => x.numero === fase);
      if (!m || !f) return error('Fase no válida');
      const total = f.repaso.length; const aciertos = Math.max(0, Math.min(total, Number(b.aciertos) | 0));
      await env.MODULOS_DB.prepare(`INSERT INTO repasos (usuario, modulo, fase, mejor, intentos, actualizado) VALUES (?,?,?,?,1,?)
        ON CONFLICT(usuario, modulo, fase) DO UPDATE SET mejor = MAX(mejor, excluded.mejor), intentos = intentos + 1, actualizado = excluded.actualizado`)
        .bind(u.id, m.id, fase, aciertos / total, ahora()).run();
      return json({ progreso: await cargarProgreso(env, u.id, m.id) });
    }

    // ---------- Entregas (fotos en D1; videos como enlace) ----------
    if (ruta === 'entregas' && metodo === 'POST') {
      const fd = await request.formData();
      const m = getModulo(String(fd.get('modulo'))); const sesion = Number(fd.get('sesion'));
      if (!m || !m.fases.some((f) => f.sesiones.some((x) => x.numero === sesion))) return error('Sesión no válida');
      const n = await env.MODULOS_DB.prepare('SELECT COUNT(*) AS n FROM entregas WHERE usuario = ? AND modulo = ? AND sesion = ?').bind(u.id, m.id, sesion).first<{ n: number }>();
      if ((n?.n ?? 0) >= 12) return error('Ya subiste muchas entregas para esta sesión.');
      const id = crypto.randomUUID();
      const enlace = limpio(fd.get('enlace'), 500);
      if (enlace) {
        if (!/^https:\/\/\S+$/.test(enlace)) return error('Pega un enlace que empiece con https://');
        await env.MODULOS_DB.prepare('INSERT INTO entregas (id, usuario, modulo, sesion, r2_key, nombre, tipo, tamano, estado, fecha, url) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
          .bind(id, u.id, m.id, sesion, '', 'Enlace a video', 'enlace', 0, 'pendiente', ahora(), enlace).run();
        return json({ progreso: await cargarProgreso(env, u.id, m.id) });
      }
      const archivo = fd.get('archivo') as unknown as File | null;
      if (!archivo || typeof archivo === 'string') return error('Falta el archivo');
      if (!archivo.type.startsWith('image/')) return error('Solo se aceptan fotos. Para un video, pega el enlace.');
      if (archivo.size > PARTE) return error('La foto pesa demasiado (máximo 1.5 MB).');
      await env.MODULOS_DB.batch([
        env.MODULOS_DB.prepare('INSERT INTO archivos (id, tipo, data) VALUES (?,?,?)').bind(id, archivo.type, await archivo.arrayBuffer()),
        env.MODULOS_DB.prepare('INSERT INTO entregas (id, usuario, modulo, sesion, r2_key, nombre, tipo, tamano, estado, fecha) VALUES (?,?,?,?,?,?,?,?,?,?)')
          .bind(id, u.id, m.id, sesion, id, limpio(archivo.name, 120), archivo.type, archivo.size, 'pendiente', ahora()),
      ]);
      return json({ progreso: await cargarProgreso(env, u.id, m.id) });
    }
    if (ruta === 'entregas/archivo') {
      const e = await env.MODULOS_DB.prepare('SELECT usuario, r2_key, tipo FROM entregas WHERE id = ?').bind(limpio(url.searchParams.get('id'), 60)).first<{ usuario: string; r2_key: string; tipo: string }>();
      if (!e || (e.usuario !== u.id && !staff)) return error('No encontrado', 404);
      const a = await env.MODULOS_DB.prepare('SELECT data FROM archivos WHERE id = ?').bind(e.r2_key).first<{ data: ArrayBuffer | number[] }>();
      if (!a) return error('No encontrado', 404);
      return new Response(new Uint8Array(a.data as ArrayBuffer), { headers: { 'content-type': e.tipo, 'cache-control': 'private, max-age=3600' } });
    }

    // ---------- Certificado ----------
    if (ruta === 'certificado' && metodo === 'POST') {
      const b = await request.json() as { modulo: string };
      const m = getModulo(b.modulo); if (!m) return error('Módulo no encontrado', 404);
      const ya = await env.MODULOS_DB.prepare('SELECT folio, fecha FROM certificados WHERE usuario = ? AND modulo = ?').bind(u.id, m.id).first<{ folio: string; fecha: string }>();
      if (ya) return json({ certificado: ya });
      const chk = puedeCertificado(m, await cargarProgreso(env, u.id, m.id));
      if (!chk.ok) return error(`Te falta: ${chk.falta.join('; ')}`);
      const c = { folio: folio(), fecha: ahora() };
      await env.MODULOS_DB.prepare('INSERT INTO certificados (folio, usuario, modulo, fecha) VALUES (?,?,?,?)').bind(c.folio, u.id, m.id, c.fecha).run();
      return json({ certificado: c });
    }

    // ---------- Panel docente ----------
    if (ruta.startsWith('admin/') || ruta.startsWith('docente/')) {
      if (!staff) return error('Solo el administrador puede ver el panel docente.', 403);

      if (ruta === 'admin/usuarios') {
        const r = await env.MODULOS_DB.prepare('SELECT * FROM usuarios ORDER BY creado DESC').all<FilaUsuario>();
        return json({ usuarios: r.results.map(publico) });
      }
      if (ruta === 'admin/panel') {
        const [us, ses, rep, ent, cer] = await Promise.all([
          env.MODULOS_DB.prepare('SELECT * FROM usuarios').all<FilaUsuario>(),
          env.MODULOS_DB.prepare('SELECT * FROM progreso_sesion').all<{ usuario: string; modulo: string; sesion: number; terminada: number; respuestas: string; simuladores: string; actualizado: string }>(),
          env.MODULOS_DB.prepare('SELECT * FROM repasos').all<{ usuario: string; modulo: string; fase: number; mejor: number; intentos: number }>(),
          env.MODULOS_DB.prepare('SELECT * FROM entregas ORDER BY fecha').all<{ id: string; usuario: string; modulo: string; sesion: number; r2_key: string; nombre: string; tipo: string; estado: Entrega['estado']; comentario: string | null; fecha: string; url: string | null }>(),
          env.MODULOS_DB.prepare('SELECT * FROM certificados').all<{ usuario: string; modulo: string; folio: string; fecha: string }>(),
        ]);
        const mapa = new Map<string, ProgresoModulo>();
        const get = (usr: string, mod: string) => { const k = `${usr}\u0000${mod}`; if (!mapa.has(k)) mapa.set(k, { sesiones: {}, repasos: {}, entregas: [], certificado: null }); return mapa.get(k)!; };
        for (const s of ses.results) get(s.usuario, s.modulo).sesiones[s.sesion] = { terminada: !!s.terminada, respuestas: JSON.parse(s.respuestas || '{}'), simuladores: JSON.parse(s.simuladores || '[]'), actualizado: s.actualizado };
        for (const r of rep.results) get(r.usuario, r.modulo).repasos[r.fase] = { mejor: r.mejor, intentos: r.intentos };
        for (const e of ent.results) get(e.usuario, e.modulo).entregas.push({ id: e.id, sesion: e.sesion, key: e.r2_key, nombre: e.nombre, tipo: e.tipo, estado: e.estado, comentario: e.comentario ?? undefined, fecha: e.fecha, url: e.url ?? undefined });
        for (const c of cer.results) get(c.usuario, c.modulo).certificado = { folio: c.folio, fecha: c.fecha };
        const usuarios = new Map(us.results.map((x) => [x.id, publico(x)]));
        const filas = [...mapa.entries()].map(([k, progreso]) => { const [usr, modulo] = k.split('\u0000'); return { usuario: usuarios.get(usr), modulo, progreso }; }).filter((f) => f.usuario);
        return json({ filas });
      }
      if (ruta === 'admin/entregas' && metodo === 'POST') {
        const b = await request.json() as { id: string; estado: string; comentario?: string };
        if (!['revisada', 'corregir', 'pendiente'].includes(b.estado)) return error('Estado no válido');
        await env.MODULOS_DB.prepare('UPDATE entregas SET estado = ?, comentario = ?, revisado_por = ? WHERE id = ?').bind(b.estado, limpio(b.comentario, 500), u.id, limpio(b.id, 60)).run();
        return json({ ok: true });
      }
      if (ruta === 'admin/staff' && metodo === 'POST') {
        if (!u.admin) return error('Solo el administrador puede dar permisos.', 403);
        const b = await request.json() as { usuario: string; staff: boolean };
        await env.MODULOS_DB.prepare('UPDATE usuarios SET staff = ? WHERE id = ? AND admin = 0').bind(b.staff ? 1 : 0, limpio(b.usuario, 60)).run();
        return json({ ok: true });
      }
      if (ruta === 'docente/archivo' && metodo === 'GET') {
        const m = getModulo(limpio(url.searchParams.get('modulo'), 80));
        const a = limpio(url.searchParams.get('archivo'), 120);
        if (!m || !m.docente.some((d) => d.archivo === a)) return error('No encontrado', 404);
        const partes = await env.MODULOS_DB.prepare('SELECT data, tipo FROM docente_archivos WHERE modulo = ? AND archivo = ? ORDER BY parte').bind(m.id, a).all<{ data: ArrayBuffer; tipo: string }>();
        if (!partes.results.length) return error('Este archivo aún no se ha subido. Súbelo desde Panel docente → Materiales del docente.', 404);
        const bufs = partes.results.map((x) => new Uint8Array(x.data));
        const out = new Uint8Array(bufs.reduce((t, x) => t + x.length, 0)); let o = 0;
        for (const x of bufs) { out.set(x, o); o += x.length; }
        return new Response(out, { headers: { 'content-type': partes.results[0].tipo || 'application/pdf', 'content-disposition': `inline; filename="${a}"`, 'cache-control': 'private, max-age=600' } });
      }
      if (ruta === 'docente/lista') {
        const r = await env.MODULOS_DB.prepare('SELECT modulo, archivo, SUM(LENGTH(data)) AS tamano FROM docente_archivos GROUP BY modulo, archivo').all<{ modulo: string; archivo: string; tamano: number }>();
        return json({ archivos: r.results });
      }
      if (ruta === 'docente/archivo' && metodo === 'POST') {
        const fd = await request.formData();
        const m = getModulo(String(fd.get('modulo'))); const a = String(fd.get('archivo_nombre'));
        const f = fd.get('archivo') as unknown as File | null;
        if (!m || !m.docente.some((d) => d.archivo === a) || !f || typeof f === 'string') return error('Archivo no válido');
        if (f.size > 40 * 1024 * 1024) return error('El archivo pesa más de 40 MB.');
        const buf = new Uint8Array(await f.arrayBuffer());
        const ops = [env.MODULOS_DB.prepare('DELETE FROM docente_archivos WHERE modulo = ? AND archivo = ?').bind(m.id, a)];
        for (let i = 0, parte = 0; i < buf.length; i += PARTE, parte++) ops.push(env.MODULOS_DB.prepare('INSERT INTO docente_archivos (modulo, archivo, parte, tipo, data) VALUES (?,?,?,?,?)').bind(m.id, a, parte, f.type || 'application/pdf', buf.slice(i, i + PARTE).buffer));
        await env.MODULOS_DB.batch(ops);
        return json({ ok: true });
      }
    }
    return error('Ruta no encontrada', 404);
  } catch (e) {
    return error(`Error del servidor: ${(e as Error).message}`, 500);
  }
};
