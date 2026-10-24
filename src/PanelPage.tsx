import React, { useState } from 'react';
import { ArrowLeft, LogOut, FlaskConical, Wrench, Truck, KeyRound, CheckCircle2 } from 'lucide-react';
import { api, isMod, isLeader, AI_TASKS_BY_ROLE, ROLE_DUTIES, ROLE_LABEL, TEAM_DUTIES, TEAM_LABEL, type Team, type User } from './lib/api';
import { useSession } from './lib/api';
import { LoginForm } from './components/LoginButton';
import { SubmitPanel } from './components/panel/SubmitForms';
import { ModerationPanel, MySubmissions } from './components/panel/Moderation';
import { UsersPanel, ActivityPanel } from './components/panel/AdminPanels';
import { ActivityChart } from './components/panel/ActivityChart';
import { AiAssist } from './components/panel/AiAssist';
import { CaptainWizard, CaptainTab, CaptainsOverview, VersionsPanel, useCaptainProfile } from './components/panel/CaptainPanels';

const TEAMS: { id: Team; icon: any }[] = [
  { id: 'investigacion', icon: FlaskConical },
  { id: 'mecanica', icon: Wrench },
  { id: 'logistica', icon: Truck },
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

function ChangePassword() {
  const [f, setF] = useState({ current: '', next: '', repeat: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setOk(false);
    if (f.next !== f.repeat) { setError('Las contraseñas nuevas no coinciden'); return; }
    try { await api('auth/password', { body: { current: f.current, next: f.next } }); setOk(true); setF({ current: '', next: '', repeat: '' }); }
    catch (err: any) { setError(err.message); }
  };
  return <form onSubmit={submit} className="max-w-sm space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
    <h2 className="flex items-center gap-2 font-serif text-2xl"><KeyRound size={20} className="text-amber-800" /> Cambiar contraseña</h2>
    <p className="text-sm text-stone-500">Tu contraseña inicial es tu primer nombre seguido de «-leaf». Te recomendamos cambiarla por una que solo tú conozcas (mínimo 8 caracteres).</p>
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
        <p className="mt-2 text-sm leading-6 text-stone-500">{TEAM_DUTIES[t.id]}</p>
      </button>)}
    </div>
  </div>;
}

/** Pestaña de inicio: qué hace cada quien, accesos rápidos y la gráfica del grupo. */
function Home({ user, team, go }: { user: User; team: Team | ''; go: (t: Tab) => void }) {
  return <div className="space-y-6">
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">Tu función como {ROLE_LABEL[user.role].toLowerCase()}</p>
        {team && <p className="mt-2 text-sm text-stone-700"><strong>Equipo de {TEAM_LABEL[team]}:</strong> {TEAM_DUTIES[team]}</p>}
        <ul className="mt-3 space-y-2 text-sm text-stone-700">
          {ROLE_DUTIES[user.role].map(d => <li key={d} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-700" />{d}</li>)}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {user.role !== 'maestro' && <button onClick={() => go('publicar')} className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white">Publicar algo</button>}
          {isMod(user.role) && <button onClick={() => go('moderar')} className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold">Revisar envíos</button>}
          {isMod(user.role) && <a href="/" className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold">Editar la página (Modo edición)</a>}
          {user.role === 'capitan' && <button onClick={() => go('capitania')} className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold">Mi capitanía</button>}
          {user.role === 'admin' && <button onClick={() => go('versiones')} className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold">Versiones anteriores</button>}
          {(user.role === 'admin' || user.role === 'maestro' || user.role === 'capitan') && <button onClick={() => go('actividad')} className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold">Actividad y calificaciones</button>}
        </div>
      </section>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        <p className="flex items-center gap-2 font-semibold"><KeyRound size={16} /> Tu contraseña</p>
        <p className="mt-2 leading-6">Entraste con tu contraseña inicial (tu primer nombre + «-leaf»). Cualquiera que conozca tu nombre podría adivinarla y lo que haga quedaría registrado a tu nombre.</p>
        <button onClick={() => go('cuenta')} className="mt-3 rounded-full bg-amber-800 px-4 py-2 text-xs font-semibold text-white">Cambiar mi contraseña</button>
      </section>
    </div>
    <ActivityChart />
  </div>;
}

function AiTab({ user }: { user: User }) {
  const tasks = AI_TASKS_BY_ROLE[user.role];
  const hint = user.role === 'admin'
    ? 'Como administrador puedes pedirle cualquier tarea de edición o gestión, incluido un informe de actividad para calificar.'
    : user.role === 'capitan'
      ? 'Como capitán, la IA conoce lo que redactaste sobre tu capitanía y tu equipo, y te ayuda a planear y a modificar la página.'
      : 'Como moderador, la IA te ayuda a revisar envíos y a redactar o mejorar textos de la página.';
  return <div className="max-w-3xl"><AiAssist tasks={tasks} hint={hint} title="Asistente de IA" allowEmptyText={user.role === 'capitan'} /></div>;
}

type Tab = 'inicio' | 'publicar' | 'mios' | 'moderar' | 'ia' | 'capitania' | 'usuarios' | 'actividad' | 'versiones' | 'capitanes' | 'cuenta';

export default function PanelPage() {
  const { user, team, ready, refresh, setTeam } = useSession();
  const captain = useCaptainProfile(user?.role === 'capitan');
  const [picking, setPicking] = useState(false);
  const [tab, setTab] = useState<Tab>('inicio');
  const [error, setError] = useState('');

  const logout = async () => { try { await api('auth/logout', { method: 'POST', body: {} }); } catch {} setTab('inicio'); refresh(); };
  const pickTeam = async (t: Team) => {
    try { await api('auth/team', { body: { team: t } }); setTeam(t); setPicking(false); setError(''); }
    catch (e: any) { setError(e.message); }
  };

  if (!ready) return <Shell><p className="text-center text-sm text-stone-500">Cargando…</p></Shell>;
  if (!user) return <Shell><div className="mx-auto max-w-sm rounded-2xl border border-stone-200 bg-white p-7 shadow-sm"><LoginForm onDone={refresh} /></div></Shell>;
  const shell = (c: React.ReactNode) => <Shell user={user} team={team} onLogout={logout} onChangeTeam={() => setPicking(true)}>{c}</Shell>;
  if (user.role === 'capitan') {
    if (captain.profile === undefined) return shell(<p className="text-center text-sm text-stone-500">Cargando…</p>);
    if (captain.profile === null) return shell(<CaptainWizard me={user} onDone={captain.reload} />);
  }
  if (user.role !== 'maestro' && user.role !== 'capitan' && (!team || picking)) return shell(<>{error && <p className="mb-4 text-center text-sm text-red-700">{error}</p>}<TeamPicker onPick={pickTeam} /></>);

  const tabs: [Tab, string][] = [['inicio', 'Inicio']];
  if (user.role !== 'maestro') tabs.push(['publicar', 'Publicar'], ['mios', 'Mis envíos']);
  if (isMod(user.role)) tabs.push(['moderar', 'Moderación'], ['ia', 'Asistente de IA']);
  if (user.role === 'capitan') tabs.push(['capitania', 'Mi capitanía']);
  if (isLeader(user.role)) tabs.push(['usuarios', 'Usuarios y permisos']);
  if (user.role === 'admin' || user.role === 'maestro' || user.role === 'capitan') tabs.push(['actividad', 'Actividad y calificaciones']);
  if (user.role === 'admin') tabs.push(['versiones', 'Versiones anteriores'], ['capitanes', 'Capitanes']);
  tabs.push(['cuenta', 'Mi cuenta']);
  const current = tabs.some(([t]) => t === tab) ? tab : 'inicio';

  return shell(<div className="space-y-8">
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">{team ? 'Equipo de ' + TEAM_LABEL[team] : ROLE_LABEL[user.role]}</p>
      <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Hola, {user.fullName.split(' ')[0]}.</h1>
    </div>
    <nav className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
      {tabs.map(([t, l]) => <button key={t} onClick={() => setTab(t)}
        className={`rounded-full px-4 py-2 text-sm ${current === t ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200'}`}>{l}</button>)}
    </nav>
    {current === 'inicio' && <Home user={user} team={team} go={setTab} />}
    {current === 'publicar' && <SubmitPanel user={user} team={team} />}
    {current === 'mios' && <MySubmissions />}
    {current === 'moderar' && <ModerationPanel />}
    {current === 'ia' && <AiTab user={user} />}
    {current === 'usuarios' && <UsersPanel me={user} />}
    {current === 'actividad' && <ActivityPanel />}
    {current === 'capitania' && captain.profile && <CaptainTab me={user} profile={captain.profile} onChanged={captain.reload} />}
    {current === 'versiones' && <VersionsPanel />}
    {current === 'capitanes' && <CaptainsOverview />}
    {current === 'cuenta' && <ChangePassword />}
  </div>);
}
