import React, { useEffect, useMemo, useState } from 'react';
import { api, type FilaPanel, type Usuario } from './api';
import { MODULOS, getModulo } from './data';
import { estadoFases, porcentaje, type Entrega } from './progreso';
import { Tarjeta, Titulo, BotonP, Barra, inputCls, fechaCorta } from './ui';
import { crearXlsx, descargar, type Celda } from './xlsx';

type Pestana = 'resumen' | 'alumnos' | 'entregas' | 'materiales' | 'usuarios';

const ultimaActividad = (f: FilaPanel) => {
  const fechas = [...Object.values(f.progreso.sesiones).map((s) => s.actualizado), ...f.progreso.entregas.map((e) => e.fecha), f.progreso.certificado?.fecha].filter(Boolean) as string[];
  return fechas.sort().pop();
};

export function PanelDocente({ usuario }: { usuario: Usuario }) {
  const [filas, setFilas] = useState<FilaPanel[] | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tab, setTab] = useState<Pestana>('resumen');
  const [modulo, setModulo] = useState(MODULOS[0].id);
  const [escuela, setEscuela] = useState(''); const [rol, setRol] = useState(''); const [q, setQ] = useState('');
  const [detalle, setDetalle] = useState<FilaPanel | null>(null);
  const [err, setErr] = useState('');

  const cargar = async () => { try { setFilas(await api.panel()); setUsuarios(await api.usuarios()); } catch (x) { setErr((x as Error).message); } };
  useEffect(() => { void cargar(); }, []);

  const m = getModulo(modulo)!;
  const visibles = useMemo(() => (filas ?? []).filter((f) => f.modulo === modulo
    && (!escuela || f.usuario.escuela === escuela) && (!rol || f.usuario.rol === rol)
    && (!q || `${f.usuario.nombre} ${f.usuario.email}`.toLowerCase().includes(q.toLowerCase()))), [filas, modulo, escuela, rol, q]);
  const escuelas = useMemo(() => [...new Set((filas ?? []).map((f) => f.usuario.escuela))].sort(), [filas]);

  if (err) return <Tarjeta><p className="text-red-700">{err}</p></Tarjeta>;
  if (!filas) return <p className="text-stone-500">Cargando panel…</p>;

  const exportar = () => {
    const hojaAlumnos: Celda[][] = [['Nombre', 'Correo', 'Edad', 'Escuela', 'Ciudad', 'Estado', 'Rol', 'Registro', 'Módulo', 'Avance %', ...m.fases.map((f) => `Fase ${f.numero}`), 'Certificado', 'Última actividad']];
    const hojaFases: Celda[][] = [['Nombre', 'Correo', 'Fase', 'Nombre de la fase', 'Sesiones terminadas', 'Sesiones totales', 'Repaso mejor %', 'Intentos de repaso', 'Aprobada']];
    const hojaResp: Celda[][] = [['Nombre', 'Correo', 'Sesión', 'Pregunta', 'Respuesta', 'Simuladores usados', 'Sesión terminada']];
    const hojaEnt: Celda[][] = [['Nombre', 'Correo', 'Sesión', 'Archivo', 'Tipo', 'Fecha', 'Estado', 'Comentario', 'Enlace']];
    for (const f of visibles) {
      const u = f.usuario; const ef = estadoFases(m, f.progreso);
      hojaAlumnos.push([u.nombre, u.email, u.edad, u.escuela, u.ciudad, u.estado, u.rol, fechaCorta(u.creado), m.titulo, porcentaje(m, f.progreso),
        ...ef.map((e) => e.aprobada ? 'Aprobada' : e.abierta ? `En curso (${e.sesionesTerminadas}/${e.sesionesTotal})` : 'Cerrada'),
        f.progreso.certificado?.folio ?? '', fechaCorta(ultimaActividad(f))]);
      ef.forEach((e, i) => hojaFases.push([u.nombre, u.email, e.numero, m.fases[i].nombre, e.sesionesTerminadas, e.sesionesTotal, e.repaso === null ? '' : Math.round(e.repaso * 100), f.progreso.repasos[e.numero]?.intentos ?? 0, e.aprobada ? 'Sí' : 'No']));
      for (const fase of m.fases) for (const s of fase.sesiones) {
        const ps = f.progreso.sesiones[s.numero]; if (!ps) continue;
        const preguntas = [...s.ficha.preguntas.map((x) => ({ id: x.id, t: x.texto })), ...(s.numero === 3 ? m.plan.map((_, i) => ({ id: `plan${i + 1}`, t: `Actividad del plan ${i + 1}` })) : [])];
        for (const p of preguntas) if (ps.respuestas[p.id]) hojaResp.push([u.nombre, u.email, s.numero, p.t, ps.respuestas[p.id].replace(/\|/g, ', '), ps.simuladores.join(', '), ps.terminada ? 'Sí' : 'No']);
        if (!preguntas.some((p) => ps.respuestas[p.id])) hojaResp.push([u.nombre, u.email, s.numero, '', '', ps.simuladores.join(', '), ps.terminada ? 'Sí' : 'No']);
      }
      f.progreso.entregas.forEach((e) => hojaEnt.push([u.nombre, u.email, e.sesion, e.nombre, e.tipo, fechaCorta(e.fecha), e.estado, e.comentario ?? '', e.tipo === 'enlace' ? e.url ?? '' : '']));
    }
    descargar(crearXlsx([
      { nombre: 'Alumnos', filas: hojaAlumnos, anchos: [28, 30, 6, 30, 16, 16, 10, 14, 22, 10, 18, 18, 18, 18, 18, 18, 14] },
      { nombre: 'Fases', filas: hojaFases, anchos: [28, 30, 6, 16, 10, 10, 12, 10, 10] },
      { nombre: 'Respuestas', filas: hojaResp, anchos: [28, 30, 8, 60, 70, 30, 10] },
      { nombre: 'Entregas', filas: hojaEnt, anchos: [28, 30, 8, 30, 14, 14, 12, 40] },
    ]), `progreso-${m.id}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const pendientes = visibles.flatMap((f) => f.progreso.entregas.filter((e) => e.estado === 'pendiente').map((e) => ({ f, e })));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider font-mono">Panel docente</div>
          <h1 className="text-3xl font-bold font-display">Progreso de los módulos</h1>
        </div>
        <div className="flex gap-2">
          <BotonP variante="secundario" onClick={cargar}>Actualizar</BotonP>
          <BotonP onClick={exportar}>⬇ Descargar Excel</BotonP>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <select className={inputCls.replace("w-full", "w-auto")} value={modulo} onChange={(e) => setModulo(e.target.value)}>{MODULOS.map((x) => <option key={x.id} value={x.id}>{x.titulo}</option>)}</select>
        <select className={inputCls.replace("w-full", "w-auto")} value={escuela} onChange={(e) => setEscuela(e.target.value)}><option value="">Todas las escuelas</option>{escuelas.map((x) => <option key={x}>{x}</option>)}</select>
        <select className={inputCls.replace("w-full", "w-auto")} value={rol} onChange={(e) => setRol(e.target.value)}><option value="">Todos los roles</option><option value="alumno">Alumnos</option><option value="docente">Docentes</option><option value="otro">Otros</option></select>
        <input className={`${inputCls.replace("w-full", "")} flex-1 min-w-40`} placeholder="Buscar nombre o correo" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="flex gap-1 border-b border-stone-200 overflow-x-auto">
        {([['resumen', 'Resumen'], ['alumnos', `Alumnos (${visibles.length})`], ['entregas', `Entregas por revisar (${pendientes.length})`], ['materiales', 'Materiales del docente'], ...(usuario.admin ? [['usuarios', 'Permisos']] : [])] as [Pestana, string][]).map(([k, t]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px cursor-pointer ${tab === k ? 'border-amber-700 text-amber-800' : 'border-transparent text-stone-600'}`}>{t}</button>
        ))}
      </div>

      {tab === 'resumen' && <Resumen filas={visibles} modulo={modulo} pendientes={pendientes.length} />}
      {tab === 'alumnos' && <TablaAlumnos filas={visibles} modulo={modulo} onVer={setDetalle} />}
      {tab === 'entregas' && <Entregas items={pendientes} modulo={modulo} onCambio={cargar} />}
      {tab === 'materiales' && <Materiales modulo={modulo} />}
      {tab === 'usuarios' && usuario.admin && <Permisos usuarios={usuarios} yo={usuario} onCambio={cargar} />}
      {detalle && <Detalle f={detalle} onCerrar={() => setDetalle(null)} />}
    </div>
  );
}

function Resumen({ filas, modulo, pendientes }: { filas: FilaPanel[]; modulo: string; pendientes: number }) {
  const m = getModulo(modulo)!;
  const total = filas.length;
  const prom = total ? Math.round(filas.reduce((a, f) => a + porcentaje(m, f.progreso), 0) / total) : 0;
  const certs = filas.filter((f) => f.progreso.certificado).length;
  const porFase = m.fases.map((fase, i) => ({ fase, aprobados: filas.filter((f) => estadoFases(m, f.progreso)[i].aprobada).length }));
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = 260, pad = { l: 36, r: 12, t: 16, b: 52 };
  const maxY = Math.max(1, total);
  const bw = (W - pad.l - pad.r) / m.fases.length;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / maxY);
  const ticks = Array.from(new Set([0, Math.round(maxY / 2), maxY]));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Inscritos', total], ['Avance promedio', `${prom}%`], ['Certificados', certs], ['Entregas por revisar', pendientes]].map(([t, v]) => (
          <Tarjeta key={t as string} className="!p-4"><div className="text-xs text-stone-500">{t}</div><div className="text-3xl font-bold font-display">{v}</div></Tarjeta>
        ))}
      </div>
      <Tarjeta className="space-y-2">
        <Titulo sub={`De ${total} inscritos en «${m.titulo}»`}>Alumnos que aprobaron cada fase</Titulo>
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Alumnos que aprobaron cada fase">
            {ticks.map((t) => <g key={t}><line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e7e5e4" /><text x={pad.l - 6} y={y(t) + 4} fontSize="11" textAnchor="end" fill="#78716c">{t}</text></g>)}
            {porFase.map((d, i) => {
              const x = pad.l + i * bw + bw * 0.2, w = bw * 0.6, top = y(d.aprobados);
              const h = H - pad.b - top;
              return (
                <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  <rect x={pad.l + i * bw} y={pad.t} width={bw} height={H - pad.t - pad.b} fill="transparent" />
                  {h > 0 && <path d={`M${x},${H - pad.b} V${top + Math.min(4, h)} q0,-4 4,-4 h${w - 8} q4,0 4,4 V${H - pad.b} Z`} fill={hover === i ? '#92400e' : '#b45309'} />}
                  <text x={x + w / 2} y={top - 6} fontSize="12" textAnchor="middle" fill="#292524" fontWeight="600">{d.aprobados}</text>
                  <text x={x + w / 2} y={H - pad.b + 18} fontSize="11" textAnchor="middle" fill="#44403c">Fase {d.fase.numero}</text>
                  <text x={x + w / 2} y={H - pad.b + 33} fontSize="10" textAnchor="middle" fill="#78716c">{d.fase.nombre}</text>
                </g>
              );
            })}
            <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#a8a29e" />
          </svg>
          {hover !== null && (
            <div className="absolute top-0 right-0 bg-stone-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none">
              Fase {porFase[hover].fase.numero} · {porFase[hover].fase.nombre}: <b>{porFase[hover].aprobados}</b> de {total} ({total ? Math.round((porFase[hover].aprobados / total) * 100) : 0}%)
            </div>
          )}
        </div>
        <p className="text-xs text-stone-500">El detalle de cada alumno está en la pestaña "Alumnos" y en el Excel.</p>
      </Tarjeta>
    </div>
  );
}

function TablaAlumnos({ filas, modulo, onVer }: { filas: FilaPanel[]; modulo: string; onVer: (f: FilaPanel) => void }) {
  const m = getModulo(modulo)!;
  const [orden, setOrden] = useState<'nombre' | 'avance' | 'actividad'>('avance');
  const ordenadas = [...filas].sort((a, b) => orden === 'nombre' ? a.usuario.nombre.localeCompare(b.usuario.nombre)
    : orden === 'avance' ? porcentaje(m, b.progreso) - porcentaje(m, a.progreso)
    : (ultimaActividad(b) ?? '').localeCompare(ultimaActividad(a) ?? ''));
  if (!filas.length) return <Tarjeta><p className="text-stone-600">Aún no hay alumnos con avance en este módulo.</p></Tarjeta>;
  return (
    <Tarjeta className="!p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-stone-100 text-stone-600 text-xs uppercase">
          <tr>
            <th className="text-left p-3 cursor-pointer" onClick={() => setOrden('nombre')}>Alumno {orden === 'nombre' && '▾'}</th>
            <th className="text-left p-3">Escuela</th>
            <th className="text-left p-3 cursor-pointer min-w-36" onClick={() => setOrden('avance')}>Avance {orden === 'avance' && '▾'}</th>
            {m.fases.map((f) => <th key={f.numero} className="p-3 text-center">F{f.numero}</th>)}
            <th className="text-left p-3 cursor-pointer" onClick={() => setOrden('actividad')}>Última actividad {orden === 'actividad' && '▾'}</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {ordenadas.map((f) => {
            const ef = estadoFases(m, f.progreso); const pct = porcentaje(m, f.progreso);
            return (
              <tr key={f.usuario.id} className="border-t border-stone-100 hover:bg-amber-50/40">
                <td className="p-3"><div className="font-semibold">{f.usuario.nombre}</div><div className="text-xs text-stone-500">{f.usuario.email} · {f.usuario.edad} años · {f.usuario.rol}</div></td>
                <td className="p-3 text-xs">{f.usuario.escuela}<div className="text-stone-500">{f.usuario.ciudad}, {f.usuario.estado}</div></td>
                <td className="p-3"><div className="flex items-center gap-2"><Barra valor={pct} className="flex-1" /><span className="w-9 text-right font-semibold">{pct}%</span></div></td>
                {ef.map((e) => (
                  <td key={e.numero} className="p-3 text-center" title={`${e.sesionesTerminadas}/${e.sesionesTotal} sesiones · repaso ${e.repaso === null ? '—' : Math.round(e.repaso * 100) + '%'}`}>
                    {e.aprobada ? <span className="text-emerald-700 font-bold">✓</span> : e.abierta ? <span className="text-amber-700 text-xs">{e.sesionesTerminadas}/{e.sesionesTotal}</span> : <span className="text-stone-300">—</span>}
                  </td>
                ))}
                <td className="p-3 text-xs">{fechaCorta(ultimaActividad(f))}{f.progreso.certificado && <div className="text-emerald-700">Certificado</div>}</td>
                <td className="p-3"><button className="text-amber-800 font-semibold text-xs cursor-pointer" onClick={() => onVer(f)}>Ver</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Tarjeta>
  );
}

function Detalle({ f, onCerrar }: { f: FilaPanel; onCerrar: () => void }) {
  const m = getModulo(f.modulo)!;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onCerrar}>
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <Titulo sub={`${f.usuario.email} · ${f.usuario.escuela}`}>{f.usuario.nombre}</Titulo>
          <button className="text-2xl cursor-pointer" onClick={onCerrar}>×</button>
        </div>
        {m.fases.flatMap((fa) => fa.sesiones).map((s) => {
          const ps = f.progreso.sesiones[s.numero]; const ent = f.progreso.entregas.filter((e) => e.sesion === s.numero);
          if (!ps && !ent.length) return null;
          return (
            <div key={s.numero} className="border rounded-xl p-3 space-y-2">
              <div className="font-semibold">Sesión {s.numero}. {s.titulo} {ps?.terminada && <span className="text-emerald-700 text-xs">✓ terminada</span>}</div>
              {s.ficha.preguntas.filter((q) => ps?.respuestas[q.id]).map((q) => (
                <div key={q.id} className="text-sm"><div className="text-stone-500">{q.texto}</div><div className="whitespace-pre-wrap">{ps!.respuestas[q.id].replace(/\|/g, ', ')}</div></div>
              ))}
              {!!ps?.simuladores.length && <div className="text-xs text-indigo-700">Simuladores: {ps.simuladores.join(', ')}</div>}
              {ent.length > 0 && <div className="flex flex-wrap gap-2">{ent.map((e) => <a key={e.id} href={api.urlEntrega(e)} target="_blank" rel="noreferrer">{e.tipo.startsWith('image/') ? <img src={api.urlEntrega(e)} className="w-20 h-20 object-cover rounded border" alt="" /> : <span className="text-xs underline">{e.nombre}</span>}</a>)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Entregas({ items, modulo, onCambio }: { items: { f: FilaPanel; e: Entrega }[]; modulo: string; onCambio: () => void }) {
  const [com, setCom] = useState<Record<string, string>>({});
  if (!items.length) return <Tarjeta><p className="text-stone-600">No hay entregas pendientes. 🎉</p></Tarjeta>;
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map(({ f, e }) => (
        <Tarjeta key={e.id} className="space-y-2">
          <div className="text-sm"><b>{f.usuario.nombre}</b> · Sesión {e.sesion} · {fechaCorta(e.fecha)}</div>
          <a href={api.urlEntrega(e)} target="_blank" rel="noreferrer">
            {e.tipo.startsWith('image/') ? <img src={api.urlEntrega(e)} alt={e.nombre} className="w-full max-h-72 object-contain rounded-lg bg-stone-100" />
              : <span className="underline break-all text-amber-800">🎬 {e.url ?? e.nombre}</span>}
          </a>
          <input className={inputCls} placeholder="Comentario para el alumno (opcional)" value={com[e.id] ?? ''} onChange={(x) => setCom({ ...com, [e.id]: x.target.value })} />
          <div className="flex gap-2">
            <BotonP onClick={async () => { await api.revisarEntrega(f.usuario.id, modulo, e.id, 'revisada', com[e.id] ?? ''); onCambio(); }}>Revisada ✓</BotonP>
            <BotonP variante="secundario" onClick={async () => { await api.revisarEntrega(f.usuario.id, modulo, e.id, 'corregir', com[e.id] ?? ''); onCambio(); }}>Pedir corrección</BotonP>
          </div>
        </Tarjeta>
      ))}
    </div>
  );
}

function Materiales({ modulo }: { modulo: string }) {
  const m = getModulo(modulo)!;
  const [lista, setLista] = useState<{ modulo: string; archivo: string; tamano: number }[]>([]);
  const [msg, setMsg] = useState(''); const [sub, setSub] = useState('');
  const cargar = () => api.listaDocente().then(setLista).catch(() => {});
  useEffect(() => { void cargar(); }, []);
  return (
    <Tarjeta className="space-y-3">
      <Titulo sub="Solo los ve quien tiene acceso al panel docente. Si un archivo no está subido, súbelo aquí (PDF).">Materiales del docente · {m.titulo}</Titulo>
      <ul className="divide-y">{m.docente.map((d) => {
        const ya = lista.find((x) => x.modulo === m.id && x.archivo === d.archivo);
        return (
          <li key={d.archivo} className="py-2 flex flex-wrap items-center gap-3">
            <span className="flex-1">{d.titulo} <span className="text-xs text-stone-500">{ya ? `(${(ya.tamano / 1048576).toFixed(1)} MB)` : '(sin subir)'}</span></span>
            {ya && <a className="text-amber-800 font-semibold text-sm" href={api.urlDocente(m.id, d.archivo)} target="_blank" rel="noreferrer">Descargar ↗</a>}
            <label className="text-sm text-stone-700 cursor-pointer border border-stone-300 rounded-lg px-3 py-1.5 hover:border-amber-600">
              {sub === d.archivo ? 'Subiendo…' : ya ? 'Reemplazar' : 'Subir PDF'}
              <input type="file" accept="application/pdf" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]; e.target.value = ''; if (!f) return;
                setSub(d.archivo); setMsg('');
                try { await api.subirDocente(m.id, d.archivo, f); setMsg(`Listo: ${d.titulo}`); await cargar(); } catch (x) { setMsg((x as Error).message); }
                setSub('');
              }} />
            </label>
          </li>
        );
      })}</ul>
      {msg && <p className="text-sm text-stone-700">{msg}</p>}
    </Tarjeta>
  );
}

function Permisos({ usuarios, yo, onCambio }: { usuarios: Usuario[]; yo: Usuario; onCambio: () => void }) {
  return (
    <Tarjeta className="space-y-3">
      <Titulo sub="Da acceso al panel a otros docentes. Ellos verán el progreso y podrán revisar entregas y descargar el Excel.">Permisos del panel</Titulo>
      <ul className="divide-y">
        {usuarios.map((u) => (
          <li key={u.id} className="py-2 flex items-center gap-3">
            <div className="flex-1"><div className="font-semibold text-sm">{u.nombre} {u.admin && <span className="text-xs text-amber-800">(administrador)</span>}</div><div className="text-xs text-stone-500">{u.email} · {u.rol} · {u.escuela}</div></div>
            {!u.admin && u.id !== yo.id && (
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-amber-700" checked={u.staff} onChange={async (e) => { await api.ponerStaff(u.id, e.target.checked); onCambio(); }} />Panel docente</label>
            )}
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}
