import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, KeyRound, UserPlus, RefreshCw, Copy } from 'lucide-react';
import { api, formatDateTime, ACTION_LABEL, ROLE_LABEL, TEAM_LABEL, type Role, type Team, type User } from '../../lib/api';

type AdminUser = User & { active: boolean; lastLogin: string | null };

/** Muestra una contraseña recién generada para que el admin la copie y la entregue. */
function PasswordNotice({ who, password, onClose }: { who: string; password: string; onClose: () => void }) {
  return <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
    <p>Contraseña de <strong>{who}</strong>:</p>
    <div className="mt-2 flex items-center gap-2"><code className="rounded bg-white px-3 py-1.5 text-base font-bold">{password}</code>
      <button onClick={() => navigator.clipboard?.writeText(password)} className="inline-flex items-center gap-1 text-xs underline"><Copy size={13} /> Copiar</button></div>
    <p className="mt-2 text-xs text-stone-600">Es su primer nombre + «-leaf». Puede cambiarla en «Mi cuenta» dentro de su panel.</p>
    <button onClick={onClose} className="mt-2 text-xs underline">Cerrar</button>
  </div>;
}

export function UsersPanel({ me }: { me: User }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [msg, setMsg] = useState('');
  const [notice, setNotice] = useState<{ who: string; password: string } | null>(null);
  const [form, setForm] = useState({ fullName: '', username: '', role: 'editor' as Role });
  const isAdmin = me.role === 'admin';
  /** Un capitán no puede nombrar admins ni capitanes, ni modificar sus cuentas. */
  const assignable = (r: Role) => isAdmin || (r !== 'admin' && r !== 'capitan');
  const locked = (u: AdminUser) => !isAdmin && u.id !== me.id && (u.role === 'admin' || u.role === 'capitan');
  const load = useCallback(() => { api<{ users: AdminUser[] }>('users').then(r => setUsers(r.users)).catch(e => setMsg(e.message)); }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (u: AdminUser, body: Record<string, unknown>) => {
    try {
      const r = await api<{ password?: string }>('users/' + u.id, { method: 'PATCH', body });
      if (r.password) setNotice({ who: u.fullName, password: r.password });
      setMsg(''); load();
    } catch (e: any) { setMsg(e.message); }
  };
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await api<{ username: string; password: string }>('users', { body: form });
      setNotice({ who: `${form.fullName} (${r.username})`, password: r.password });
      setForm({ fullName: '', username: '', role: 'editor' }); setMsg(''); load();
    } catch (err: any) { setMsg(err.message); }
  };

  return <div className="space-y-6">
    {notice && <PasswordNotice {...notice} onClose={() => setNotice(null)} />}
    {msg && <p className="text-sm text-red-700">{msg}</p>}
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 text-xs uppercase text-stone-500"><tr>
          <th className="p-3">Nombre</th><th className="p-3">Usuario</th><th className="p-3">Rol</th><th className="p-3">Último acceso</th><th className="p-3">Acciones</th></tr></thead>
        <tbody>{users.map(u => <tr key={u.id} className={`border-t border-stone-100 ${u.active ? '' : 'opacity-50'}`}>
          <td className="p-3">{u.fullName}</td>
          <td className="p-3 font-mono text-xs">{u.username}</td>
          <td className="p-3">
            <select value={u.role} disabled={u.id === me.id || locked(u)} onChange={e => patch(u, { role: e.target.value })} className="rounded border border-stone-300 p-1 text-xs">
              {(Object.keys(ROLE_LABEL) as Role[]).filter(r => assignable(r) || r === u.role).map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </td>
          <td className="whitespace-nowrap p-3 text-xs text-stone-500">{u.lastLogin ? formatDateTime(u.lastLogin) : 'Nunca'}</td>
          <td className="whitespace-nowrap p-3 text-xs">
            {!locked(u) && <><button onClick={() => confirm(`¿Restablecer la contraseña de ${u.fullName} a su nombre + «-leaf»?`) && patch(u, { resetPassword: true })} className="mr-3 inline-flex items-center gap-1 underline"><KeyRound size={12} /> Restablecer contraseña</button>
            {u.id !== me.id && <button onClick={() => patch(u, { active: !u.active })} className="underline">{u.active ? 'Desactivar' : 'Activar'}</button>}</>}
            {locked(u) && <span className="text-stone-400">Solo el administrador</span>}
          </td>
        </tr>)}</tbody>
      </table>
    </div>
    <form onSubmit={create} className="grid gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-4">
      <p className="flex items-center gap-2 text-sm font-semibold sm:col-span-4"><UserPlus size={16} /> Agregar usuario (por ejemplo, un maestro)</p>
      <input required placeholder="Nombre completo" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="rounded-lg border border-stone-300 p-2 text-sm sm:col-span-2" />
      <input required placeholder="usuario (ej. maestra.lopez)" pattern="[a-z0-9._\-]{3,60}" value={form.username} onChange={e => setForm({ ...form, username: e.target.value.toLowerCase() })} className="rounded-lg border border-stone-300 p-2 text-sm" />
      <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })} className="rounded-lg border border-stone-300 p-2 text-sm">
        {(Object.keys(ROLE_LABEL) as Role[]).filter(assignable).map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
      </select>
      <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white sm:col-span-4 sm:justify-self-start">Crear usuario (contraseña: nombre-leaf)</button>
      <p className="text-xs text-stone-500 sm:col-span-4"><strong>Administrador:</strong> todo, incluido restaurar versiones. <strong>Capitán:</strong> administra la página, envíos y compañeros (no puede restaurar versiones ni tocar a admins o capitanes). <strong>Moderador:</strong> aprueba envíos y edita la página. <strong>Editor:</strong> envía artículos, podcasts, documentos y evidencias según su equipo. <strong>Maestro:</strong> solo consulta la actividad para calificar.</p>
    </form>
  </div>;
}

interface ActivityRow { id: number; username: string; full_name: string; role: string; team: string; action: string; detail: string; created_at: string }
interface SummaryRow { username: string; full_name: string; role: string; sesiones: number; envios: number; articulos: number; podcasts: number; documentacion: number; evidencias: number; moderacion: number; aprobados: number; ultima: string | null }

export function ActivityPanel() {
  const [filters, setFilters] = useState({ user: '', team: '', action: '', from: '', to: '' });
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [tab, setTab] = useState<'resumen' | 'detalle'>('resumen');
  const [msg, setMsg] = useState('');
  const qs = useMemo(() => new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString(), [filters]);
  const load = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([api<{ activity: ActivityRow[] }>('activity?' + qs), api<{ summary: SummaryRow[] }>('activity/summary?' + qs)]);
      setRows(a.activity); setSummary(s.summary); setMsg('');
    } catch (e: any) { setMsg(e.message); }
  }, [qs]);
  useEffect(() => { load(); }, [load]);

  const f = (k: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFilters(p => ({ ...p, [k]: e.target.value }));
  const sel = 'rounded-lg border border-stone-300 bg-white p-2 text-xs';
  const cols: [keyof SummaryRow, string][] = [['sesiones', 'Sesiones'], ['articulos', 'Artículos'], ['podcasts', 'Podcasts'], ['documentacion', 'Documentos y fuentes'], ['evidencias', 'Evidencias y calendario'], ['moderacion', 'Moderación'], ['aprobados', 'Publicados']];

  return <div className="space-y-4">
    <div className="flex flex-wrap items-end gap-2">
      <select value={filters.user} onChange={f('user')} className={sel}><option value="">Todos los alumnos</option>{summary.map(s => <option key={s.username} value={s.username}>{s.full_name}</option>)}</select>
      <select value={filters.team} onChange={f('team')} className={sel}><option value="">Todos los equipos</option>{(Object.keys(TEAM_LABEL) as Team[]).map(t => <option key={t} value={t}>{TEAM_LABEL[t]}</option>)}</select>
      <select value={filters.action} onChange={f('action')} className={sel}><option value="">Todas las acciones</option><option value="envio_">Envíos</option><option value="inicio_sesion">Inicios de sesión</option><option value="aprobacion">Aprobaciones</option><option value="edicion_pagina">Ediciones de la página</option></select>
      <label className="text-[11px] text-stone-500">Desde<input type="date" value={filters.from} onChange={f('from')} className={sel + ' block'} /></label>
      <label className="text-[11px] text-stone-500">Hasta<input type="date" value={filters.to} onChange={f('to')} className={sel + ' block'} /></label>
      <button onClick={load} className="inline-flex items-center gap-1 p-2 text-xs text-stone-500"><RefreshCw size={13} /></button>
      <a href={'/api/activity?format=csv&limit=5000&' + qs} className="ml-auto inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white"><Download size={13} /> Descargar para Excel</a>
    </div>
    {msg && <p className="text-sm text-red-700">{msg}</p>}
    <div className="flex gap-2">{(['resumen', 'detalle'] as const).map(t => <button key={t} onClick={() => setTab(t)}
      className={`rounded-full px-4 py-1.5 text-sm ${tab === t ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white'}`}>{t === 'resumen' ? 'Resumen por alumno' : 'Registro detallado'}</button>)}</div>

    {tab === 'resumen' ? <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 text-[11px] uppercase text-stone-500"><tr><th className="p-3">Alumno</th>{cols.map(([, l]) => <th key={l} className="p-3 text-center">{l}</th>)}<th className="p-3">Última actividad</th></tr></thead>
        <tbody>{summary.map(s => <tr key={s.username} className="border-t border-stone-100">
          <td className="p-3">{s.full_name}<span className="block text-[11px] text-stone-400">{ROLE_LABEL[s.role as Role]}</span></td>
          {cols.map(([k]) => <td key={k} className="p-3 text-center tabular-nums">{Number(s[k]) || 0}</td>)}
          <td className="whitespace-nowrap p-3 text-xs text-stone-500">{s.ultima ? formatDateTime(s.ultima) : '—'}</td>
        </tr>)}</tbody>
      </table>
    </div> : <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 text-[11px] uppercase text-stone-500"><tr><th className="p-3">Fecha</th><th className="p-3">Alumno</th><th className="p-3">Equipo</th><th className="p-3">Acción</th><th className="p-3">Detalle</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.id} className="border-t border-stone-100">
          <td className="whitespace-nowrap p-3 text-xs text-stone-500">{formatDateTime(r.created_at)}</td>
          <td className="p-3">{r.full_name || r.username}</td>
          <td className="p-3 text-xs">{TEAM_LABEL[r.team as Team] || '—'}</td>
          <td className="p-3 text-xs font-semibold">{ACTION_LABEL[r.action] || r.action}</td>
          <td className="p-3 text-xs text-stone-600">{r.detail}</td>
        </tr>)}</tbody>
      </table>
      {!rows.length && <p className="p-6 text-center text-sm text-stone-500">Sin registros con estos filtros.</p>}
    </div>}
  </div>;
}
