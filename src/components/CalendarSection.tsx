import React, { useEffect, useState } from 'react';
import { CalendarDays, Plus, ChevronDown, Image as ImageIcon, Video } from 'lucide-react';
import { api, TEAM_LABEL, type CalendarEvent, type Team } from '../lib/api';

const launchEvent: CalendarEvent = { id: 'leaf-launch-2026', date: '2026-10-16', title: 'Inauguración de la página LEAF', description: 'Inicio del espacio digital de la generación 2026–2030.', mediaUrls: [] };

export function CalendarSection() {
  const [events, setEvents] = useState<CalendarEvent[]>([launchEvent]);
  useEffect(() => {
    api<{ events: CalendarEvent[] }>('calendar')
      .then(r => setEvents([...r.events, ...(r.events.some(e => e.date === launchEvent.date && e.title === launchEvent.title) ? [] : [launchEvent])]))
      .catch(() => {});
  }, []);

  return <section className="space-y-4 border-t border-stone-200 pt-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800"><CalendarDays size={15} /> Agenda de la generación</p>
        <h2 className="mt-2 font-display text-2xl font-bold">Calendario de actividades</h2>
        <p className="mt-1 text-sm text-stone-500">Fechas, recuerdos, fotografías y videos de LEAF 2026–2030.</p>
      </div>
      <a href="/panel" className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Agregar fecha</a>
    </div>
    <div className="space-y-3">
      {events.slice().sort((a, b) => b.date.localeCompare(a.date)).map(ev => <details key={ev.id} className="group rounded-xl border border-stone-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
          <span className="min-w-20 rounded-lg bg-stone-100 px-3 py-2 text-center text-xs font-bold text-stone-700">{new Date(ev.date + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span className="flex-1 font-semibold text-stone-800">{ev.title}</span>
          <ChevronDown size={16} className="text-stone-400 transition group-open:rotate-180" />
        </summary>
        <div className="space-y-3 border-t border-stone-100 p-4 text-sm text-stone-600">
          {ev.description && <p>{ev.description}</p>}
          {ev.mediaUrls.map((url, i) => <a key={url + i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-amber-800 underline"><ImageIcon size={14} /><Video size={14} /> Abrir foto o video {i + 1}</a>)}
          {ev.mediaUrls.length === 0 && <p className="text-xs text-stone-400">Todavía no hay fotos ni videos en esta fecha.</p>}
          {ev.authorName && <p className="text-xs text-stone-400">Registrado por {ev.authorName}{ev.team && TEAM_LABEL[ev.team as Team] ? ' · Equipo de ' + TEAM_LABEL[ev.team as Team] : ''}</p>}
        </div>
      </details>)}
    </div>
    <p className="text-xs text-stone-400">Las fechas las agregan los equipos de Mecánica y Logística desde el panel; se publican al aprobarlas un moderador.</p>
  </section>;
}
