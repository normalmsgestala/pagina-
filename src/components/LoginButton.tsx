import React, { useEffect, useState } from 'react';
import { Lock, LogIn, UserRound, X } from 'lucide-react';
import { api, type User } from '../lib/api';

const inputCls = 'mt-1 w-full rounded-lg border border-stone-300 bg-white p-3 text-sm focus:border-amber-600 focus:outline-none';

export function LoginForm({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await api('auth/login', { body: { username: username.trim().toLowerCase(), password } }); onDone(); }
    catch (err: any) { setError(err.status === 503 ? 'El sistema de acceso aún no está activado. Avisa al administrador.' : err.message); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="space-y-4">
    <Lock className="text-amber-800" size={22} />
    <h2 className="font-serif text-3xl">Entrar a LEAF</h2>
    <p className="text-sm text-stone-500">Acceso para estudiantes y maestros de la generación 2026–2030.</p>
    <label className="block text-xs font-semibold">Usuario<input autoFocus autoComplete="username" required value={username} onChange={e => setUsername(e.target.value)} className={inputCls} placeholder="nombre.apellido" /></label>
    <label className="block text-xs font-semibold">Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className={inputCls} /></label>
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={busy} className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-50">{busy ? 'Entrando…' : 'Entrar'}</button>
    <p className="text-xs text-stone-400">¿Olvidaste tu contraseña? Pídele al administrador que la restablezca.</p>
  </form>;
}

/** Botón de la esquina superior: abre el inicio de sesión o, si ya hay sesión, lleva al panel. */
export function LoginButton({ user: known }: { user?: User | null }) {
  const [user, setUser] = useState<User | null | undefined>(known);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (known !== undefined) { setUser(known); return; }
    api<{ user: User | null }>('auth/me').then(r => setUser(r.user)).catch(() => setUser(null));
  }, [known]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (user) return <a href="/panel" className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900">
    <UserRound size={13} /> Mi panel</a>;
  return <>
    <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900">
      <LogIn size={13} /> Iniciar sesión</button>
    {open && <div className="fixed inset-0 z-50 flex overflow-y-auto bg-stone-950/60 p-4" role="dialog" aria-modal="true" aria-label="Iniciar sesión" onClick={() => setOpen(false)}>
      <div className="relative m-auto w-full max-w-sm rounded-2xl bg-white p-7 text-left text-stone-900 shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={() => setOpen(false)} aria-label="Cerrar" className="absolute right-4 top-4 rounded-full p-1 text-stone-400 hover:bg-stone-100"><X size={18} /></button>
        <LoginForm onDone={() => { window.location.href = '/panel'; }} />
      </div>
    </div>}
  </>;
}
