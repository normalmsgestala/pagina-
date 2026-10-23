import React, { useState } from 'react';
import { ArrowLeft, LogOut, FlaskConical, Wrench, Truck, ShieldCheck, Lock } from 'lucide-react';
import { api, isMod, ROLE_LABEL, TEAM_LABEL, type Team, type User } from './lib/api';
import { useSession } from './lib/api';
import { SubmitPanel } from './components/panel/SubmitForms';
import { ModerationPanel, MySubmissions } from './components/panel/Moderation';
import { UsersPanel, ActivityPanel } from './components/panel/AdminPanels';

const TEAMS: { id: Team; icon: any; text: string }[] = [
  { id: 'investigacion', icon: FlaskConical, text: 'Subir documentación, artículos y fuentes bibliográficas.' },
  { id: 'mecanica', icon: Wrench, text: 'Subir evidencias del trabajo y actualizar el calendario.' },
  { id: 'logistica', icon: Truck, text: 'Subir evidencias del trabajo y actualizar el calendario.' },
];

const inputCls = 'mt-1 w-full rounded-lg border border-stone-300 bg-white p-3 text-sm focus:border-amber-600 focus:outline-none';

function Shell({ children, user, team, onLogout, onChangeTeam }: {
  children: React.ReactNode; user?: User | null; team?: Team | ''; onLogout?: () => void; onChangeTeam?: () => void;
}) {
  return <div className="min-h-screen bg-stone-50 text-stone-900">
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <a href="/" className="font-serif text-xl font-semibold tracking-wide">LEAF <span className="text-sm font-normal text-amber-800">Panel</span></a>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {user && <span className="text-stone-600">{user.fullName} · <strong>{ROLE_LABEL[user.role]}</strong>
            {team && <> · <button onClick={onChangeTeam} className="text-amber-800 underline" title="Cambiar de equipo">{TEAM_LABEL[team]}</button></>}</span>}
          {user && <button onClick={onLogout} className="inline-flex items-center gap-1 text-stone-600 hover:text-red-700"><LogOut size={15} /> Salir</button>}
          <a href="/" className="inline-flex items-center gap-1 text-stone-600 hover:text-amber-800"><ArrowLeft size={15} /> Ir a la página</a>
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
  </div>;
}

function Login({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await api('auth/login', { body: { username: username.trim(), password } }); onDone(); }
    catch (err: any) { setError(err.status === 503 ? 'El sistema de acceso aún no está activado. Avisa al administrador.' : err.message); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
    <Lock className="text-amber-800" size={22} />
    <h1 className="font-serif text-3xl">Entrar a LEAF</h1>
    <p className="text-sm text-stone-500">Acceso para estudiantes y maestros de la generación 2026–2030.</p>
    <label className="block text-xs font-semibold">Usuario<input autoComplete="username" required value={username} onChange={e => setUsername(e.target.value)} className={inputCls} placeholder="nombre.apellido" /></label>
    <label className="block text-xs font-semibold">Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className={inputCls} /></label>
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={busy} className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-50">{busy ? 'Entrando…' : 'Entrar'}</button>
    <p className="text-xs text-stone-400">¿Olvidaste tu contraseña? Pídele al administrador una nueva.</p>
  </form>;
}

function ChangePassword({ forced, onDone }: { forced: boolean; onDone: () => void }) {
  const [f, setF] = useState({ current: '', next: '', repeat: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (f.next !== f.repeat) { setError('Las contraseñas nuevas no coinciden'); return; }
    try { await api('auth/password', { body: { current: f.current, next: f.next } }); setOk(true); onDone(); }
    catch (err: any) { setError(err.message); }
  };
  return <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 rounded-2xl border border-stone-200 bg-white p-7">
    <h2 className="font-serif text-2xl">{forced ? 'Crea tu contraseña' : 'Cambiar contraseña'}</h2>
    {forced && <p className="text-sm text-stone-500">Es tu primer ingreso. Cambia la contraseña temporal por una que solo tú conozcas (mínimo 8 caracteres).</p>}
    <label className="block text-xs font-semibold">Contraseña actual<input type="password" autoComplete="current-password" required value={f.current} onChange={e => setF({ ...f, current: e.target.value })} className={inputCls} /></label>
    <label className="block text-xs font-semibold">Contraseña nueva<input type="password" autoComplete="new-password" minLength={8} required value={f.next} onChange={e => setF({ ...f, next: e.target.value })} className={inputCls} /></label>
    <label className="block text-xs font-semibold">Repite la nueva<input type="password" autoComplete="new-password" minLength={8} required value={f.repeat} onChange={e => setF({ ...f, repeat: e.target.value })} className={inputCls} /></label>
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {ok && <p className="text-sm text-emerald-700">Contraseña actualizada.</p>}
    <button className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white">Guardar contraseña</button>
  </form>;
}

function TeamPicker({ onPick }: { onPick: (t: Team) => void }) {
  return <div className="mx-auto max-w-3xl space-y-6 text-center">
    <h1 className="font-serif text-3xl sm:text-4xl">¿De qué equipo eres hoy?</h1>
    <p className="text-sm text-stone-500">Según tu equipo verás las opciones para publicar.</p>
    <div className="grid gap-4 sm:grid-cols-3">
      {TEAMS.map(t => <button key={t.id} onClick={() => onPick(t.id)} className="rounded-2xl border border-stone-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-amber-600 hover:shadow-md">
        <t.icon size={26} className="text-amber-800" />
        <p className="mt-4 font-serif text-2xl">{TEAM_LABEL[t.id]}</p>
        <p className="mt-2 text-sm leading-6 text-stone-500">{t.text}</p>
      </button>)}
    </div>
  </div>;
}

type Tab = 'publicar' | 'mios' | 'moderar' | 'usuarios' | 'actividad' | 'cuenta';

export default function PanelPage() {
  const { user, team, ready, refresh, setTeam } = useSession();
  const [picking, setPicking] = useState(false);
  const [tab, setTab] = useState<Tab | null>(null);
  const [error, setError] = useState('');

  const logout = async () => { try { await api('auth/logout', { method: 'POST', body: {} }); } catch {} setTab(null); refresh(); };
  const pickTeam = async (t: Team) => {
    try { await api('auth/team', { body: { team: t } }); setTeam(t); setPicking(false); setError(''); }
    catch (e: any) { setError(e.message); }
  };

  if (!ready) return <Shell><p className="text-center text-sm text-stone-500">Cargando…</p></Shell>;
  if (!user) return <Shell><Login onDone={refresh} /></Shell>;
  const shell = (c: React.ReactNode) => <Shell user={user} team={team} onLogout={logout} onChangeTeam={() => setPicking(true)}>{c}</Shell>;
  if (user.mustChange) return shell(<ChangePassword forced onDone={refresh} />);
  const needsTeam = user.role !== 'maestro';
  if (needsTeam && (!team || picking)) return shell(<>{error && <p className="mb-4 text-center text-sm text-red-700">{error}</p>}<TeamPicker onPick={pickTeam} /></>);

  const tabs: [Tab, string][] = [];
  if (user.role !== 'maestro') tabs.push(['publicar', 'Publicar'], ['mios', 'Mis envíos']);
  if (isMod(user.role)) tabs.push(['moderar', 'Moderación']);
  if (user.role === 'admin') tabs.push(['usuarios', 'Usuarios y permisos']);
  if (user.role === 'admin' || user.role === 'maestro') tabs.push(['actividad', 'Actividad y calificaciones']);
  tabs.push(['cuenta', 'Mi cuenta']);
  const current = tab && tabs.some(([t]) => t === tab) ? tab : tabs[0][0];

  return shell(<div className="space-y-8">
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">{team ? 'Equipo de ' + TEAM_LABEL[team] : ROLE_LABEL[user.role]}</p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Hola, {user.fullName.split(' ')[0]}.</h1>
      {isMod(user.role) && <p className="mt-2 flex items-center gap-2 text-sm text-stone-500"><ShieldCheck size={15} /> Para editar los módulos y textos de la página, ve a la página principal: verás el botón «Modo edición» arriba.</p>}
    </div>
    <nav className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
      {tabs.map(([t, l]) => <button key={t} onClick={() => setTab(t)}
        className={`rounded-full px-4 py-2 text-sm ${current === t ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200'}`}>{l}</button>)}
    </nav>
    {current === 'publicar' && <SubmitPanel user={user} team={team} />}
    {current === 'mios' && <MySubmissions />}
    {current === 'moderar' && <ModerationPanel />}
    {current === 'usuarios' && <UsersPanel me={user} />}
    {current === 'actividad' && <ActivityPanel />}
    {current === 'cuenta' && <ChangePassword forced={false} onDone={() => {}} />}
  </div>);
}
