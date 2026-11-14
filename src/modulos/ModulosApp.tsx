import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, esDemo, type Usuario, type Registro } from './api';
import { MODULOS, getModulo } from './data';
import type { Modulo, Sesion, Fase } from './types';
import { APROBATORIO } from './types';
import { estadoFases, porcentaje, puedeCertificado, progresoVacio, sesionEvidenciaFinal, type ProgresoModulo } from './progreso';
import { SIMULADORES } from './simuladores';
import { Tarjeta, Titulo, BotonP, Barra, Campo, inputCls, Seguridad, fechaCorta, comprimirImagen } from './ui';
import { PanelDocente } from './PanelDocente';

const BASE = import.meta.env.BASE_URL;
export const archivoPublico = (m: Modulo, a: string) => `${BASE}modulos/${m.id}/${a}`;
const HOME = BASE;

// ---------------- Rutas con # ----------------
function useRuta(): [string[], (r: string) => void] {
  const leer = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [r, setR] = useState(leer());
  useEffect(() => { const f = () => { setR(leer()); window.scrollTo(0, 0); }; window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);
  return [r, (x: string) => { window.location.hash = `#/${x}`; }];
}

const ESTADOS_MX = ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas', 'Otro país'];

export default function ModulosApp() {
  const [ruta, ir] = useRuta();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => { (async () => { setDemo(await esDemo()); setUsuario(await api.yo()); setCargando(false); })(); }, []);

  const [seccion, a, b, c] = ruta;
  let vista: React.ReactNode;
  if (cargando) vista = <p className="text-stone-500">Cargando…</p>;
  else if (seccion === 'verificar') vista = <Verificar folioInicial={a} />;
  else if (!usuario) vista = seccion === 'registro' ? <FormRegistro onOk={(u) => { setUsuario(u); ir(''); }} /> : <Bienvenida irRegistro={() => ir('registro')} onOk={(u) => { setUsuario(u); ir(''); }} />;
  else if (seccion === 'docente') vista = usuario.staff ? <PanelDocente usuario={usuario} /> : <p>No tienes acceso al panel docente.</p>;
  else if (seccion === 'cuenta') vista = <Cuenta usuario={usuario} />;
  else if (seccion === 'tema' && a) {
    const m = getModulo(a);
    vista = !m ? <p>No encontré ese tema.</p> : <Tema m={m} usuario={usuario} sub={b} n={c ? Number(c) : undefined} ir={ir} />;
  } else vista = <Catalogo usuario={usuario} ir={ir} />;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans antialiased">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-stone-200/80 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <a href={HOME} className="text-sm font-bold font-display text-stone-900 hover:text-amber-900 shrink-0">Campus LEAF</a>
            <span className="text-stone-300">/</span>
            <a href="#/" className="text-sm font-semibold text-amber-800 truncate">Módulos de aprendizaje</a>
          </div>
          {usuario && (
            <nav className="flex items-center gap-3 text-xs font-medium text-stone-600">
              {usuario.staff && <a href="#/docente" className="hover:text-amber-800">Panel docente</a>}
              <a href="#/cuenta" className="hover:text-amber-800 hidden sm:inline">{usuario.nombre.split(' ')[0]}</a>
              <button className="hover:text-amber-800 cursor-pointer" onClick={async () => { await api.salir(); setUsuario(null); ir(''); }}>Salir</button>
            </nav>
          )}
        </div>
      </header>
      {demo && (
        <div className="bg-sky-50 border-b border-sky-200 text-sky-900 text-xs text-center px-3 py-1.5 print:hidden">
          Modo demostración: no hay servidor conectado, así que los datos solo se guardan en este navegador. En Cloudflare se guardan en la base de datos.
        </div>
      )}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">{vista}</main>
      <footer className="text-center text-xs text-stone-500 py-6 print:hidden">Campus LEAF · Módulos de aprendizaje autodidactas</footer>
    </div>
  );
}

// ---------------- Acceso ----------------
function Bienvenida({ irRegistro, onOk }: { irRegistro: () => void; onOk: (u: Usuario) => void }) {
  const [email, setEmail] = useState(''); const [pass, setPass] = useState('');
  const [err, setErr] = useState(''); const [env, setEnv] = useState(false);
  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div className="space-y-4">
        <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider font-mono">Cursos autodidactas · Proyectos STEAM</div>
        <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight leading-tight">Módulos de aprendizaje</h1>
        <p className="text-stone-600 text-lg leading-relaxed">Aprende a tu ritmo con proyectos de 5 fases. Cada fase tiene sesiones, fichas de trabajo, simuladores y un repaso. Al terminar recibes tu certificado.</p>
        <div className="space-y-3 pt-2">
          {MODULOS.map((m) => (
            <div key={m.id} className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <div className="text-xs text-amber-900 font-semibold">{m.materia} · {m.grado}</div>
              <div className="font-display font-bold text-lg">{m.titulo}</div>
              <div className="text-sm text-stone-700">{m.preguntaCentral}</div>
            </div>
          ))}
        </div>
      </div>
      <Tarjeta className="space-y-4">
        <Titulo sub="Si ya tienes tu usuario, escribe tu correo y contraseña.">Entrar</Titulo>
        <form className="space-y-3" onSubmit={async (e) => { e.preventDefault(); setErr(''); setEnv(true); try { onOk(await api.login(email, pass)); } catch (x) { setErr((x as Error).message); } setEnv(false); }}>
          <Campo label="Correo"><input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Campo>
          <Campo label="Contraseña"><input className={inputCls} type="password" required value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" /></Campo>
          {err && <p className="text-sm text-red-700">{err}</p>}
          <BotonP className="w-full" disabled={env}>Entrar</BotonP>
        </form>
        <div className="border-t border-stone-200 pt-4 text-center space-y-2">
          <p className="text-sm text-stone-600">¿Es tu primera vez?</p>
          <BotonP variante="secundario" className="w-full" onClick={irRegistro}>Crear mi usuario</BotonP>
        </div>
      </Tarjeta>
    </div>
  );
}

function FormRegistro({ onOk }: { onOk: (u: Usuario) => void }) {
  const [d, setD] = useState<Registro>({ nombre: '', edad: 13, escuela: '', ciudad: '', estado: 'Nuevo León', rol: 'alumno', email: '', password: '' });
  const [pass2, setPass2] = useState(''); const [acepto, setAcepto] = useState(false);
  const [err, setErr] = useState(''); const [env, setEnv] = useState(false);
  const set = (k: keyof Registro) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setD({ ...d, [k]: k === 'edad' ? Number(e.target.value) : e.target.value });
  return (
    <Tarjeta className="max-w-2xl mx-auto space-y-5">
      <Titulo sub="Con este usuario guardas tu avance, tus fichas y tus entregas.">Crear mi usuario</Titulo>
      <form className="grid sm:grid-cols-2 gap-4" onSubmit={async (e) => {
        e.preventDefault(); setErr('');
        if (d.password.length < 6) return setErr('La contraseña debe tener al menos 6 caracteres.');
        if (d.password !== pass2) return setErr('Las contraseñas no coinciden.');
        setEnv(true); try { onOk(await api.registro(d)); } catch (x) { setErr((x as Error).message); } setEnv(false);
      }}>
        <div className="sm:col-span-2"><Campo label="Nombre completo"><input className={inputCls} required value={d.nombre} onChange={set('nombre')} autoComplete="name" /></Campo></div>
        <Campo label="Edad"><input className={inputCls} type="number" min={8} max={99} required value={d.edad} onChange={set('edad')} /></Campo>
        <Campo label="Soy">
          <select className={inputCls} value={d.rol} onChange={set('rol')}>
            <option value="alumno">Alumno(a)</option><option value="docente">Docente</option><option value="otro">Otro</option>
          </select>
        </Campo>
        <div className="sm:col-span-2"><Campo label="Escuela de donde vienes"><input className={inputCls} required value={d.escuela} onChange={set('escuela')} /></Campo></div>
        <Campo label="Ciudad o municipio"><input className={inputCls} required value={d.ciudad} onChange={set('ciudad')} /></Campo>
        <Campo label="Estado">
          <select className={inputCls} value={d.estado} onChange={set('estado')}>{ESTADOS_MX.map((x) => <option key={x}>{x}</option>)}</select>
        </Campo>
        <div className="sm:col-span-2"><Campo label="Correo"><input className={inputCls} type="email" required value={d.email} onChange={set('email')} autoComplete="email" /></Campo></div>
        <Campo label="Contraseña"><input className={inputCls} type="password" required value={d.password} onChange={set('password')} autoComplete="new-password" /></Campo>
        <Campo label="Repite tu contraseña"><input className={inputCls} type="password" required value={pass2} onChange={(e) => setPass2(e.target.value)} autoComplete="new-password" /></Campo>
        <label className="sm:col-span-2 flex gap-2 items-start text-sm text-stone-700">
          <input type="checkbox" className="mt-1 accent-amber-700" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} required />
          <span>Acepto que mis datos y mi avance se usen solo para dar seguimiento a mi aprendizaje en estos módulos. {d.edad < 18 && 'Como soy menor de edad, mi mamá, papá o tutor sabe que me registro.'}</span>
        </label>
        {err && <p className="sm:col-span-2 text-sm text-red-700">{err}</p>}
        <div className="sm:col-span-2 flex gap-3 justify-end">
          <a href="#/" className="px-4 py-2.5 text-sm text-stone-600">Ya tengo usuario</a>
          <BotonP disabled={env || !acepto}>Crear usuario</BotonP>
        </div>
      </form>
    </Tarjeta>
  );
}

function Cuenta({ usuario }: { usuario: Usuario }) {
  const [a, setA] = useState(''); const [n, setN] = useState(''); const [msg, setMsg] = useState('');
  return (
    <Tarjeta className="max-w-xl space-y-4">
      <Titulo>Mi cuenta</Titulo>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-stone-500">Nombre</dt><dd>{usuario.nombre}</dd>
        <dt className="text-stone-500">Correo</dt><dd>{usuario.email}</dd>
        <dt className="text-stone-500">Escuela</dt><dd>{usuario.escuela}</dd>
        <dt className="text-stone-500">Lugar</dt><dd>{usuario.ciudad}, {usuario.estado}</dd>
      </dl>
      <form className="space-y-3 border-t pt-4" onSubmit={async (e) => { e.preventDefault(); try { await api.cambiarPassword(a, n); setMsg('Contraseña cambiada.'); setA(''); setN(''); } catch (x) { setMsg((x as Error).message); } }}>
        <div className="font-semibold text-sm">Cambiar contraseña</div>
        <input className={inputCls} type="password" placeholder="Contraseña actual" value={a} onChange={(e) => setA(e.target.value)} required />
        <input className={inputCls} type="password" placeholder="Nueva contraseña (mínimo 6)" minLength={6} value={n} onChange={(e) => setN(e.target.value)} required />
        <BotonP>Guardar</BotonP>{msg && <span className="ml-3 text-sm text-stone-600">{msg}</span>}
      </form>
    </Tarjeta>
  );
}

// ---------------- Catálogo ----------------
function Catalogo({ usuario, ir }: { usuario: Usuario; ir: (r: string) => void }) {
  const [prog, setProg] = useState<Record<string, ProgresoModulo>>({});
  useEffect(() => { MODULOS.forEach(async (m) => { const p = await api.progreso(m.id); setProg((x) => ({ ...x, [m.id]: p })); }); }, []);
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider font-mono">Hola, {usuario.nombre.split(' ')[0]}</div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">Módulos de aprendizaje</h1>
        <p className="text-stone-600">Elige un tema. Avanzas fase por fase; para abrir la siguiente necesitas terminar sus sesiones y sacar al menos 80 % en el repaso.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        {MODULOS.map((m) => {
          const p = prog[m.id]; const pct = p ? porcentaje(m, p) : 0;
          return (
            <Tarjeta key={m.id} className="space-y-3 flex flex-col">
              <div className="text-xs font-semibold text-amber-900">{m.materia} · {m.grado}</div>
              <h3 className="text-xl font-bold font-display">{m.titulo}</h3>
              <p className="text-stone-700 text-sm flex-1">{m.preguntaCentral}</p>
              <div className="text-xs text-stone-500">{m.duracion}</div>
              <div className="flex items-center gap-3"><Barra valor={pct} className="flex-1" /><span className="text-sm font-semibold w-10 text-right">{pct}%</span></div>
              <BotonP onClick={() => ir(`tema/${m.id}`)}>{pct > 0 ? 'Continuar' : 'Empezar'}</BotonP>
            </Tarjeta>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- Tema ----------------
function useProgreso(m: Modulo) {
  const [p, setP] = useState<ProgresoModulo | null>(null);
  useEffect(() => { api.progreso(m.id).then(setP).catch(() => setP(progresoVacio())); }, [m.id]);
  return [p, setP] as const;
}

function Tema({ m, usuario, sub, n, ir }: { m: Modulo; usuario: Usuario; sub?: string; n?: number; ir: (r: string) => void }) {
  const [p, setP] = useProgreso(m);
  if (!p) return <p className="text-stone-500">Cargando tu avance…</p>;
  const fases = estadoFases(m, p);
  if (sub === 'sesion' && n) {
    const fase = m.fases.find((f) => f.sesiones.some((s) => s.numero === n));
    const s = fase?.sesiones.find((x) => x.numero === n);
    if (!fase || !s) return <p>No encontré esa sesión.</p>;
    if (!fases[fase.numero - 1].abierta) return <Bloqueada m={m} fase={fase} />;
    return <PaginaSesion m={m} fase={fase} s={s} p={p} setP={setP} ir={ir} />;
  }
  if (sub === 'repaso' && n) {
    const fase = m.fases[n - 1];
    if (!fase) return <p>No encontré esa fase.</p>;
    if (!fases[n - 1].abierta) return <Bloqueada m={m} fase={fase} />;
    return <Repaso m={m} fase={fase} p={p} setP={setP} ir={ir} />;
  }
  if (sub === 'certificado') return <Certificado m={m} usuario={usuario} p={p} setP={setP} />;
  return <PortadaTema m={m} p={p} ir={ir} />;
}

function Bloqueada({ m, fase }: { m: Modulo; fase: Fase }) {
  return (
    <Tarjeta className="max-w-xl space-y-3">
      <Titulo>🔒 La fase {fase.numero} todavía está cerrada</Titulo>
      <p className="text-stone-700">Primero termina las sesiones de la fase anterior y saca al menos 80 % en su repaso.</p>
      <a className="text-amber-800 font-semibold" href={`#/tema/${m.id}`}>← Volver al tema</a>
    </Tarjeta>
  );
}

function PortadaTema({ m, p, ir }: { m: Modulo; p: ProgresoModulo; ir: (r: string) => void }) {
  const fases = estadoFases(m, p);
  const pct = porcentaje(m, p);
  const cert = puedeCertificado(m, p);
  const [abierta, setAbierta] = useState<number | null>(null);
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-[#0b1023] text-white p-6 sm:p-10 space-y-4 relative overflow-hidden">
        <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider font-mono">{m.materia} · {m.grado} · {m.campo}</div>
        <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight leading-tight">{m.titulo}</h1>
        <p className="text-lg text-indigo-100">{m.subtitulo}</p>
        <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
          <div className="text-xs uppercase tracking-wider text-amber-300 font-semibold">Pregunta central</div>
          <p className="text-xl sm:text-2xl font-display font-semibold">{m.preguntaCentral}</p>
        </div>
        <div className="flex items-center gap-3 max-w-md"><Barra valor={pct} className="flex-1 bg-white/20" /><span className="font-semibold">{pct}%</span></div>
      </section>

      <Tarjeta className="space-y-3">
        <Titulo>La situación</Titulo>
        {m.situacion.map((t, i) => <p key={i} className="text-stone-700 leading-relaxed">{t}</p>)}
      </Tarjeta>

      <section className="space-y-4">
        <Titulo sub="Avanza en orden. Cada fase se abre cuando terminas la anterior.">Tu camino: 5 fases</Titulo>
        <ol className="relative space-y-4 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
          {m.fases.map((f, i) => {
            const e = fases[i];
            const icono = e.aprobada ? '✓' : e.abierta ? String(f.numero) : '🔒';
            const ver = abierta === f.numero || (abierta === null && e.abierta && !e.aprobada);
            return (
              <li key={f.numero} className="relative pl-14">
                <span className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 border-stone-50 ${e.aprobada ? 'bg-emerald-600 text-white' : e.abierta ? 'bg-amber-600 text-white' : 'bg-stone-300 text-stone-600'}`}>{icono}</span>
                <div className={`rounded-2xl border p-4 ${e.abierta ? 'bg-white border-stone-200' : 'bg-stone-100 border-stone-200 opacity-75'}`}>
                  <button className="w-full text-left cursor-pointer" onClick={() => setAbierta(ver ? -1 : f.numero)}>
                    <div className="text-xs font-semibold text-amber-800">Fase {f.numero} · {f.nombre}</div>
                    <div className="font-semibold text-stone-900">{f.nombreLargo}</div>
                    <div className="text-xs text-stone-500 mt-1">{e.sesionesTerminadas} de {e.sesionesTotal} sesiones · Repaso: {e.repaso === null ? 'sin hacer' : `${Math.round(e.repaso * 100)}%`}{e.aprobada ? ' · Aprobada' : ''}</div>
                  </button>
                  {ver && e.abierta && (
                    <div className="mt-3 space-y-2">
                      {f.sesiones.map((s) => {
                        const hecha = p.sesiones[s.numero]?.terminada;
                        return (
                          <a key={s.numero} href={`#/tema/${m.id}/sesion/${s.numero}`} className="flex items-center gap-3 rounded-xl border border-stone-200 px-3 py-2.5 hover:border-amber-500">
                            <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${hecha ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'}`}>{hecha ? '✓' : s.numero}</span>
                            <span className="flex-1 text-sm"><b>Sesión {s.numero}.</b> {s.titulo}</span>
                            {s.simuladores?.length ? <span className="text-xs text-indigo-700">simulador</span> : null}
                          </a>
                        );
                      })}
                      <a href={`#/tema/${m.id}/repaso/${f.numero}`} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${e.sesionesTerminadas === e.sesionesTotal ? 'border-amber-500 bg-amber-50' : 'border-dashed border-stone-300'}`}>
                        <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center bg-amber-600 text-white">?</span>
                        <span className="flex-1 text-sm"><b>Repaso de la fase {f.numero}</b> {e.sesionesTerminadas < e.sesionesTotal && <span className="text-stone-500">(puedes practicar; cuenta para abrir la siguiente fase cuando termines las sesiones)</span>}</span>
                      </a>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <Tarjeta className="space-y-3">
        <Titulo sub="Las vas a responder a lo largo del proyecto.">Preguntas de investigación</Titulo>
        <ol className="list-decimal pl-5 space-y-1 text-stone-800">{m.preguntas.map((q) => <li key={q}>{q}</li>)}</ol>
      </Tarjeta>

      <section className="space-y-3">
        <Titulo sub="Ya está resuelto. Solo tienes que seguirlo.">Mi plan de investigación</Titulo>
        <div className="grid md:grid-cols-2 gap-4">
          {m.plan.map((x, i) => (
            <Tarjeta key={i} className="space-y-2 text-sm">
              <div className="font-semibold text-stone-900">Pregunta {i + 1}. {x.pregunta}</div>
              <p><b>¿Qué?</b> {x.que}</p><p><b>¿Cómo?</b> {x.como}</p>
              <p><b>¿Cuándo?</b> {x.cuando}. <b>¿Dónde?</b> {x.donde}.</p>
              <p><b>¿Para qué?</b> {x.paraQue}</p><p><b>¿Con qué?</b> {x.conQue}</p>
            </Tarjeta>
          ))}
        </div>
        <Seguridad />
      </section>

      <section className="space-y-3">
        <Titulo>Recursos del tema</Titulo>
        <div className="grid md:grid-cols-2 gap-4">
          {m.recursos.map((r) => (
            <Tarjeta key={r.archivo} className="space-y-2">
              <div className="font-semibold">{r.titulo}</div>
              <p className="text-sm text-stone-600">{r.descripcion}</p>
              {r.tipo === 'video'
                ? <video controls preload="metadata" className="w-full rounded-xl bg-black" src={archivoPublico(m, r.archivo)} />
                : <a className="text-amber-800 font-semibold text-sm" href={archivoPublico(m, r.archivo)} target="_blank" rel="noreferrer">Abrir PDF ↗</a>}
            </Tarjeta>
          ))}
        </div>
      </section>

      <Tarjeta className="space-y-3">
        <Titulo>Evidencia final: mi telescopio</Titulo>
        <p className="text-stone-700">{m.evidencia}</p>
        <div className="font-semibold text-sm pt-2">¿Cómo se evalúa?</div>
        <ul className="list-disc pl-5 text-sm text-stone-700 space-y-1">{m.evaluacion.map((e) => <li key={e}>{e}</li>)}</ul>
      </Tarjeta>

      <Tarjeta className="space-y-3 border-amber-300">
        <Titulo>Mi certificado</Titulo>
        {cert.ok || p.certificado
          ? <BotonP onClick={() => ir(`tema/${m.id}/certificado`)}>Ver mi certificado</BotonP>
          : <><p className="text-sm text-stone-600">Para recibirlo te falta:</p><ul className="list-disc pl-5 text-sm text-stone-700">{cert.falta.map((f) => <li key={f}>{f}</li>)}</ul></>}
      </Tarjeta>
    </div>
  );
}

// ---------------- Sesión ----------------
function PaginaSesion({ m, fase, s, p, setP, ir }: { m: Modulo; fase: Fase; s: Sesion; p: ProgresoModulo; setP: (p: ProgresoModulo) => void; ir: (r: string) => void }) {
  const prog = p.sesiones[s.numero];
  const [resp, setResp] = useState<Record<string, string>>(prog?.respuestas ?? {});
  const [guardado, setGuardado] = useState<'ok' | 'guardando' | 'error'>('ok');
  const tmr = useRef<number>(0);
  const pendiente = useRef<Record<string, string>>({});
  const todas = m.fases.flatMap((f) => f.sesiones);
  const idx = todas.findIndex((x) => x.numero === s.numero);
  const siguiente = todas[idx + 1];
  const finFase = fase.sesiones[fase.sesiones.length - 1].numero === s.numero;

  const guardar = useCallback(async () => {
    const r = pendiente.current; pendiente.current = {};
    if (!Object.keys(r).length) return;
    setGuardado('guardando');
    try { setP(await api.guardarSesion(m.id, s.numero, { respuestas: r })); setGuardado('ok'); } catch { setGuardado('error'); pendiente.current = { ...r, ...pendiente.current }; }
  }, [m.id, s.numero, setP]);
  useEffect(() => () => { window.clearTimeout(tmr.current); void guardar(); }, [guardar]);

  const cambiar = (id: string, v: string) => {
    setResp((x) => ({ ...x, [id]: v })); pendiente.current[id] = v; setGuardado('guardando');
    window.clearTimeout(tmr.current); tmr.current = window.setTimeout(guardar, 900);
  };

  const entregas = p.entregas.filter((e) => e.sesion === s.numero);
  const contestadas = s.ficha.preguntas.filter((q) => (resp[q.id] ?? '').trim().length > 0).length;
  const listo = contestadas >= Math.ceil(s.ficha.preguntas.length / 2) || entregas.length > 0;
  const esFinal = s.numero === sesionEvidenciaFinal(m);

  return (
    <div className="space-y-6">
      <a href={`#/tema/${m.id}`} className="text-sm text-amber-800 font-semibold">← {m.titulo}</a>
      <div className="space-y-1">
        <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider font-mono">Fase {fase.numero} · {fase.nombre} · Sesión {s.numero}</div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">{s.titulo}</h1>
      </div>

      {s.seguridad && <Seguridad />}

      <div className="grid md:grid-cols-3 gap-4">
        <Tarjeta className="space-y-2"><div className="text-xs font-bold text-amber-800 uppercase">Inicio</div><p className="text-stone-800">{s.inicio}</p></Tarjeta>
        <Tarjeta className="space-y-2"><div className="text-xs font-bold text-amber-800 uppercase">Desarrollo</div>
          {s.desarrollo.length > 1 ? <ul className="space-y-1.5 text-stone-800 list-disc pl-4">{s.desarrollo.map((d) => <li key={d}>{d}</li>)}</ul> : <p className="text-stone-800">{s.desarrollo[0]}</p>}
        </Tarjeta>
        <Tarjeta className="space-y-2"><div className="text-xs font-bold text-amber-800 uppercase">Cierre</div><p className="text-stone-800">{s.cierre}</p></Tarjeta>
      </div>

      {s.aprendePDA && (
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-5">
          <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Lo que aprendo del PDA</div>
          <p className="text-indigo-950 mt-1">{s.aprendePDA}</p>
        </div>
      )}
      <p className="text-sm text-stone-600"><b>Necesitas:</b> {s.recursos.join(' · ')}</p>
      {s.numero === 1 && (
        <Tarjeta className="space-y-2">
          <div className="font-semibold">Video: Leo y Clara, lo que los ojos no ven</div>
          <video controls preload="metadata" className="w-full rounded-xl bg-black" src={archivoPublico(m, 'Video_Leo_y_Clara.mp4')} />
          <a className="text-sm text-amber-800 font-semibold" href={archivoPublico(m, 'Historieta_Leo_y_Clara.pdf')} target="_blank" rel="noreferrer">Descargar la historieta para pegar en tu libreta ↗</a>
        </Tarjeta>
      )}
      {s.numero === 8 && <a className="inline-block text-sm text-amber-800 font-semibold" href={archivoPublico(m, 'Instructivo_telescopio_casero.pdf')} target="_blank" rel="noreferrer">Abrir el instructivo del telescopio casero ↗</a>}

      {(s.simuladores ?? []).map((id) => { const sim = SIMULADORES[id]; if (!sim) return null; const C = sim.Componente; return (
        <Tarjeta key={id} className="space-y-3 border-indigo-200">
          <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Simulador</div>
          <h3 className="text-lg font-bold font-display">{sim.titulo}</h3>
          <p className="text-sm text-stone-700">{sim.instruccion}</p>
          <C onUse={() => { api.guardarSesion(m.id, s.numero, { simulador: id }).then(setP).catch(() => {}); }} />
          <div className="text-sm text-stone-700 border-t pt-3"><b>Piensa:</b> {sim.reflexion.join(' ')}</div>
        </Tarjeta>
      ); })}

      <Tarjeta className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold font-display">Ficha {s.ficha.numero} · {s.ficha.titulo}</h3>
          <a className="text-sm text-amber-800 font-semibold" href={archivoPublico(m, s.ficha.pdf)} target="_blank" rel="noreferrer">Descargar PDF para imprimir ↗</a>
        </div>
        <p className="text-sm text-stone-600">Puedes contestarla aquí (se guarda sola) o imprimirla, contestarla a mano y subir la foto abajo.</p>
        {s.ficha.instruccion && <p className="text-stone-800">{s.ficha.instruccion}</p>}
        {s.ficha.lectura && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
            {s.ficha.lectura.titulo && <div className="font-semibold">Lectura: {s.ficha.lectura.titulo}</div>}
            {s.ficha.lectura.parrafos.map((t, i) => <p key={i} className="text-stone-800 leading-relaxed">{t}</p>)}
          </div>
        )}
        {s.numero === 3 && (
          <div className="rounded-xl border border-stone-200 p-4 space-y-2">
            <div className="font-semibold text-sm">Marca cada actividad de tu plan cuando la termines:</div>
            {m.plan.map((x, i) => {
              const id = `plan${i + 1}`;
              return <label key={id} className="flex gap-2 text-sm items-start"><input type="checkbox" className="mt-1 accent-amber-700" checked={resp[id] === 'sí'} onChange={(e) => cambiar(id, e.target.checked ? 'sí' : '')} /><span><b>Pregunta {i + 1}:</b> {x.que}</span></label>;
            })}
          </div>
        )}
        <div className="space-y-4">
          {s.ficha.preguntas.map((q) => (
            <div key={q.id} className="space-y-1">
              <div className="text-sm font-semibold text-stone-800">{q.texto}</div>
              {q.tipo === 'casillas' ? (
                <div className="flex flex-wrap gap-3">{q.opciones!.map((o) => {
                  const sel = (resp[q.id] ?? '').split('|').filter(Boolean);
                  return <label key={o} className="flex gap-1.5 text-sm items-center"><input type="checkbox" className="accent-amber-700" checked={sel.includes(o)} onChange={(e) => cambiar(q.id, (e.target.checked ? [...sel, o] : sel.filter((x) => x !== o)).join('|'))} />{o}</label>;
                })}</div>
              ) : q.tipo === 'corta' || q.tipo === 'firma' ? (
                <input className={inputCls} value={resp[q.id] ?? ''} onChange={(e) => cambiar(q.id, e.target.value)} placeholder={q.tipo === 'firma' ? 'Escribe tu nombre como firma' : ''} />
              ) : (
                <textarea className={`${inputCls} min-h-24`} value={resp[q.id] ?? ''} onChange={(e) => cambiar(q.id, e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <div className="text-xs text-stone-500">{guardado === 'guardando' ? 'Guardando…' : guardado === 'error' ? 'No se pudo guardar. Revisa tu internet; se volverá a intentar.' : 'Tus respuestas están guardadas.'}</div>
      </Tarjeta>

      <SubirEntrega m={m} s={s} entregas={entregas} setP={setP} esFinal={esFinal} />

      <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900 text-white">
        <div className="text-sm">
          {prog?.terminada ? '✓ Ya terminaste esta sesión.' : listo ? '¿Terminaste el inicio, el desarrollo y el cierre?' : 'Para terminar, contesta al menos la mitad de tu ficha o sube la foto de tu ficha.'}
        </div>
        <div className="flex gap-2">
          {!prog?.terminada && <BotonP disabled={!listo} onClick={async () => { await guardar(); setP(await api.guardarSesion(m.id, s.numero, { terminada: true })); }}>Terminé esta sesión</BotonP>}
          {prog?.terminada && (finFase
            ? <BotonP onClick={() => ir(`tema/${m.id}/repaso/${fase.numero}`)}>Ir al repaso de la fase {fase.numero} →</BotonP>
            : siguiente && <BotonP onClick={() => ir(`tema/${m.id}/sesion/${siguiente.numero}`)}>Siguiente sesión →</BotonP>)}
        </div>
      </div>
    </div>
  );
}

function SubirEntrega({ m, s, entregas, setP, esFinal }: { m: Modulo; s: Sesion; entregas: ProgresoModulo['entregas']; setP: (p: ProgresoModulo) => void; esFinal: boolean }) {
  const [subiendo, setSubiendo] = useState(false); const [err, setErr] = useState('');
  const [enlace, setEnlace] = useState('');
  const input = useRef<HTMLInputElement>(null);
  return (
    <Tarjeta className="space-y-3">
      <h3 className="text-lg font-bold font-display">{esFinal ? 'Mi evidencia final' : 'Mis entregas'}</h3>
      <p className="text-sm text-stone-700"><b>Sube:</b> {s.entrega}. {s.ficha.dibujo && <span className="block mt-1">{s.ficha.dibujo}</span>}</p>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
        const files = Array.from(e.target.files ?? []); e.target.value = ''; if (!files.length) return;
        setErr(''); setSubiendo(true);
        try {
          for (const f of files) {
            let blob = await comprimirImagen(f);
            if (blob.size > 1_400_000) blob = await comprimirImagen(f, 1200, 0.7);
            setP(await api.subirEntrega(m.id, s.numero, blob, f.name.replace(/\.\w+$/, '') + '.jpg'));
          }
        } catch (x) { setErr((x as Error).message); }
        setSubiendo(false);
      }} />
      <BotonP variante="secundario" disabled={subiendo} onClick={() => input.current?.click()}>{subiendo ? 'Subiendo…' : '📷 Subir foto'}</BotonP>
      {esFinal && (
        <form className="space-y-2 border-t pt-3" onSubmit={async (e) => {
          e.preventDefault(); setErr('');
          if (!/^https:\/\/\S+$/.test(enlace.trim())) return setErr('Pega un enlace que empiece con https://');
          setSubiendo(true);
          try { setP(await api.subirEnlace(m.id, s.numero, enlace.trim())); setEnlace(''); } catch (x) { setErr((x as Error).message); }
          setSubiendo(false);
        }}>
          <div className="text-sm font-semibold text-stone-800">¿Grabaste un video de tu presentación?</div>
          <p className="text-xs text-stone-600">Súbelo a Google Drive o a YouTube (como "no listado"), copia el enlace para compartir y pégalo aquí.</p>
          <div className="flex gap-2"><input className={inputCls} value={enlace} onChange={(e) => setEnlace(e.target.value)} placeholder="https://drive.google.com/..." /><BotonP disabled={subiendo}>Enviar</BotonP></div>
        </form>
      )}
      {err && <p className="text-sm text-red-700">{err}</p>}
      {entregas.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {entregas.map((e) => (
            <a key={e.id} href={api.urlEntrega(e)} target="_blank" rel="noreferrer" className="block w-28 text-xs">
              {e.tipo.startsWith('image/') ? <img src={api.urlEntrega(e)} alt={e.nombre} className="w-28 h-28 object-cover rounded-lg border" /> : <div className="w-28 h-28 rounded-lg border bg-stone-100 flex flex-col items-center justify-center text-2xl">🎬<span className="text-[10px] text-stone-600">Ver video</span></div>}
              <span className={`block mt-1 ${e.estado === 'revisada' ? 'text-emerald-700' : e.estado === 'corregir' ? 'text-red-700' : 'text-stone-500'}`}>{e.estado === 'revisada' ? 'Revisada ✓' : e.estado === 'corregir' ? 'Corregir' : 'Pendiente de revisión'}</span>
              {e.comentario && <span className="block text-stone-700">“{e.comentario}”</span>}
            </a>
          ))}
        </div>
      )}
    </Tarjeta>
  );
}

// ---------------- Repaso ----------------
function Repaso({ m, fase, p, setP, ir }: { m: Modulo; fase: Fase; p: ProgresoModulo; setP: (p: ProgresoModulo) => void; ir: (r: string) => void }) {
  const mezclar = useCallback(() => fase.repaso.map((q) => {
    const orden = q.opciones.map((_, i) => i).sort(() => Math.random() - 0.5);
    return { ...q, opciones: orden.map((i) => q.opciones[i]), correcta: orden.indexOf(q.correcta) };
  }).sort(() => Math.random() - 0.5), [fase]);
  const [preg, setPreg] = useState(mezclar);
  const [i, setI] = useState(0); const [sel, setSel] = useState<number | null>(null); const [ok, setOk] = useState(0);
  const [fin, setFin] = useState(false);
  const e = estadoFases(m, p)[fase.numero - 1];
  const q = preg[i];
  const reiniciar = () => { setPreg(mezclar()); setI(0); setSel(null); setOk(0); setFin(false); };

  if (fin) {
    const pct = ok / preg.length; const aprobo = pct >= APROBATORIO;
    const e2 = estadoFases(m, p)[fase.numero - 1];
    return (
      <Tarjeta className="max-w-xl mx-auto text-center space-y-4">
        <div className="text-5xl">{aprobo ? '🎉' : '💪'}</div>
        <Titulo>{ok} de {preg.length} correctas ({Math.round(pct * 100)}%)</Titulo>
        <p className="text-stone-700">{aprobo ? (e2.aprobada ? `¡Aprobaste la fase ${fase.numero}!${fase.numero < m.fases.length ? ' Ya se abrió la siguiente fase.' : ''}` : '¡Muy bien! Cuando termines todas las sesiones de esta fase, se abrirá la siguiente.') : 'Necesitas 80 % para aprobar. Repasa tus fichas e inténtalo otra vez.'}</p>
        <div className="flex gap-2 justify-center flex-wrap">
          <BotonP variante="secundario" onClick={reiniciar}>Intentar otra vez</BotonP>
          <BotonP onClick={() => ir(`tema/${m.id}`)}>Volver al tema</BotonP>
        </div>
      </Tarjeta>
    );
  }
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <a href={`#/tema/${m.id}`} className="text-sm text-amber-800 font-semibold">← {m.titulo}</a>
      <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider font-mono">Repaso · Fase {fase.numero} · {fase.nombre}</div>
      {e.repaso !== null && <p className="text-sm text-stone-600">Tu mejor resultado: {Math.round(e.repaso * 100)}%</p>}
      <Barra valor={(i / preg.length) * 100} />
      <Tarjeta className="space-y-4">
        <div className="text-xs text-stone-500">Pregunta {i + 1} de {preg.length}</div>
        <h2 className="text-xl font-bold font-display">{q.texto}</h2>
        <div className="space-y-2">
          {q.opciones.map((o, k) => {
            const estilo = sel === null ? 'border-stone-300 hover:border-amber-500' : k === q.correcta ? 'border-emerald-600 bg-emerald-50' : k === sel ? 'border-red-500 bg-red-50' : 'border-stone-200 opacity-60';
            return <button key={k} disabled={sel !== null} onClick={() => { setSel(k); if (k === q.correcta) setOk(ok + 1); }} className={`w-full text-left rounded-xl border-2 px-4 py-3 cursor-pointer ${estilo}`}>{o}</button>;
          })}
        </div>
        {sel !== null && (
          <div className="space-y-3">
            <p className={`text-sm ${sel === q.correcta ? 'text-emerald-800' : 'text-red-800'}`}><b>{sel === q.correcta ? '¡Correcto!' : 'No es esa.'}</b> {q.explicacion}</p>
            <BotonP onClick={async () => {
              if (i + 1 < preg.length) { setI(i + 1); setSel(null); }
              else { setP(await api.repaso(m.id, fase.numero, ok, preg.length)); setFin(true); }
            }}>{i + 1 < preg.length ? 'Siguiente' : 'Ver mi resultado'}</BotonP>
          </div>
        )}
      </Tarjeta>
    </div>
  );
}

// ---------------- Certificado ----------------
function Certificado({ m, usuario, p, setP }: { m: Modulo; usuario: Usuario; p: ProgresoModulo; setP: (p: ProgresoModulo) => void }) {
  const cert = puedeCertificado(m, p);
  const [c, setC] = useState(p.certificado ?? null); const [err, setErr] = useState('');
  useEffect(() => { if (!c && cert.ok) api.certificado(m.id).then((x) => { setC(x); setP({ ...p, certificado: x }); }).catch((x) => setErr(x.message)); }, []); // eslint-disable-line
  const urlVerif = useMemo(() => `${window.location.origin}${window.location.pathname}#/verificar/${c?.folio ?? ''}`, [c]);
  if (!cert.ok && !c) return <Tarjeta><Titulo>Todavía no terminas</Titulo><ul className="list-disc pl-5 mt-3">{cert.falta.map((f) => <li key={f}>{f}</li>)}</ul></Tarjeta>;
  if (!c) return <p>{err || 'Generando tu certificado…'}</p>;
  return (
    <div className="space-y-4">
      <div className="flex gap-2 print:hidden">
        <a href={`#/tema/${m.id}`} className="text-sm text-amber-800 font-semibold self-center flex-1">← {m.titulo}</a>
        <BotonP onClick={() => window.print()}>Descargar PDF</BotonP>
      </div>
      <p className="text-xs text-stone-500 print:hidden">Al presionar "Descargar PDF" elige "Guardar como PDF" y orientación horizontal.</p>
      <div className="certificado bg-white aspect-[11/8.5] w-full border-[10px] border-double border-amber-700 p-6 sm:p-12 flex flex-col items-center justify-center text-center gap-2 sm:gap-4">
        <div className="text-xs sm:text-sm tracking-[0.3em] uppercase text-amber-800 font-semibold">Campus LEAF · Módulos de aprendizaje</div>
        <div className="text-2xl sm:text-5xl font-display font-bold text-stone-900">Certificado</div>
        <div className="text-sm sm:text-base text-stone-600">Se otorga a</div>
        <div className="text-2xl sm:text-4xl font-display font-semibold text-amber-900 border-b-2 border-amber-300 px-6 pb-1">{usuario.nombre}</div>
        <div className="text-sm sm:text-base text-stone-700 max-w-xl">por terminar las 5 fases del proyecto STEAM</div>
        <div className="text-lg sm:text-2xl font-display font-bold">«{m.titulo}»</div>
        <div className="text-xs sm:text-sm text-stone-600">{m.materia} · {m.grado} · {m.duracion.split('·')[0].trim()}</div>
        <div className="flex gap-8 sm:gap-16 pt-2 sm:pt-6 text-xs sm:text-sm text-stone-700">
          <div><div className="font-semibold">{fechaCorta(c.fecha)}</div><div className="text-stone-500">Fecha</div></div>
          <div><div className="font-mono font-semibold">{c.folio}</div><div className="text-stone-500">Folio</div></div>
        </div>
        <div className="text-[10px] sm:text-xs text-stone-500 break-all">Verifica este certificado en: {urlVerif}</div>
      </div>
      <style>{`@media print { @page { size: letter landscape; margin: 0.4in; } body { background: #fff; } .certificado { aspect-ratio: auto; height: 7.4in; } }`}</style>
    </div>
  );
}

function Verificar({ folioInicial }: { folioInicial?: string }) {
  const [f, setF] = useState(folioInicial ?? ''); const [r, setR] = useState<Awaited<ReturnType<typeof api.verificar>> | 'no' | null>(null);
  const buscar = async (x: string) => { const v = await api.verificar(x); setR(v ?? 'no'); };
  useEffect(() => { if (folioInicial) void buscar(folioInicial); }, [folioInicial]);
  return (
    <Tarjeta className="max-w-lg mx-auto space-y-4">
      <Titulo sub="Escribe el folio que aparece en el certificado.">Verificar un certificado</Titulo>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void buscar(f); }}>
        <input className={inputCls} value={f} onChange={(e) => setF(e.target.value.toUpperCase())} placeholder="LEAF-XXXX-XXXX" />
        <BotonP>Verificar</BotonP>
      </form>
      {r === 'no' && <p className="text-red-700">No existe un certificado con ese folio.</p>}
      {r && r !== 'no' && <p className="text-emerald-800">✓ Certificado válido: <b>{r.nombre}</b> terminó «{getModulo(r.modulo)?.titulo ?? r.modulo}» el {fechaCorta(r.fecha)}.</p>}
    </Tarjeta>
  );
}
