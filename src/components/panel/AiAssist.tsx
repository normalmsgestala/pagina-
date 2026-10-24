import React, { useState } from 'react';
import { Sparkles, Check, Copy, Loader2 } from 'lucide-react';
import { aiRun, AI_REPLACES, AI_TASK_LABEL, type AiTask } from '../../lib/api';

/**
 * Asistente de IA reutilizable. Trabaja sobre un texto (de un campo del formulario o pegado)
 * y solo ofrece las tareas permitidas para el rol; el servidor vuelve a validar el permiso.
 */
export function AiAssist({ tasks, getText, onApply, fields, targetFor, title = 'Asistente de IA', hint, allowEmptyText }: {
  tasks: AiTask[];
  getText?: (field: string) => string;
  onApply?: (field: string, value: string) => void;
  fields?: { id: string; label: string }[];
  /** Campo donde se pega el resultado de una tarea (por defecto, el mismo campo). */
  targetFor?: (task: AiTask, field: string) => string;
  title?: string;
  hint?: string;
  allowEmptyText?: boolean;
}) {
  const [field, setField] = useState(fields?.[0]?.id || '');
  const [pasted, setPasted] = useState('');
  const [instruction, setInstruction] = useState('');
  const [result, setResult] = useState<{ task: AiTask; text: string } | null>(null);
  const [busy, setBusy] = useState<AiTask | null>(null);
  const [error, setError] = useState('');
  const source = () => (fields && getText ? getText(field) : pasted);
  const target = (task: AiTask) => (targetFor ? targetFor(task, field) : field);
  const labelOf = (id: string) => fields?.find(f => f.id === id)?.label || id;

  const run = async (task: AiTask) => {
    setError(''); setResult(null);
    const text = source();
    if (!text.trim() && !allowEmptyText && task !== 'actividad' && !(task === 'libre' && instruction.trim()) && !(task === 'pagina' && instruction.trim())) {
      setError(fields ? 'Primero escribe algo en el campo seleccionado.' : 'Pega o escribe el texto con el que quieres ayuda.'); return;
    }
    setBusy(task);
    try { setResult({ task, text: await aiRun(task, text, instruction) }); }
    catch (e: any) { setError(e.message || 'La IA no respondió'); }
    finally { setBusy(null); }
  };

  if (!tasks.length) return null;
  return <div className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
    <p className="flex items-center gap-2 text-sm font-semibold text-violet-900"><Sparkles size={16} /> {title}</p>
    {hint && <p className="text-xs text-violet-900/70">{hint}</p>}
    <div className="grid gap-2 sm:grid-cols-2">
      {fields ? <label className="text-xs font-semibold text-stone-700">Trabajar sobre
        <select value={field} onChange={e => setField(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-sm font-normal">
          {fields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select></label>
        : <label className="text-xs font-semibold text-stone-700 sm:col-span-2">Texto
          <textarea rows={5} value={pasted} onChange={e => setPasted(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-sm font-normal" placeholder="Pega aquí el texto…" /></label>}
      <label className={`text-xs font-semibold text-stone-700 ${fields ? '' : 'sm:col-span-2'}`}>Indicación (opcional)
        <input value={instruction} maxLength={600} onChange={e => setInstruction(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-sm font-normal" placeholder="Ej. hazlo más formal" /></label>
    </div>
    <div className="flex flex-wrap gap-2">
      {tasks.map(t => <button type="button" key={t} disabled={!!busy} onClick={() => run(t)}
        className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-3 py-1.5 text-xs font-semibold text-violet-900 hover:bg-violet-100 disabled:opacity-50">
        {busy === t && <Loader2 size={13} className="animate-spin" />}{AI_TASK_LABEL[t]}</button>)}
    </div>
    {error && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}
    {result && <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">{AI_TASK_LABEL[result.task]} · revisa antes de usar</p>
      <p className="whitespace-pre-line text-sm text-stone-800">{result.text}</p>
      <div className="flex flex-wrap gap-3">
        {onApply && fields && AI_REPLACES.includes(result.task) && <button type="button" onClick={() => { onApply(target(result.task), result.text); setResult(null); }}
          className="inline-flex items-center gap-1 rounded-lg bg-violet-700 px-3 py-1.5 text-xs font-semibold text-white"><Check size={13} /> Usar en «{labelOf(target(result.task))}»</button>}
        <button type="button" onClick={() => navigator.clipboard?.writeText(result.text)} className="inline-flex items-center gap-1 text-xs text-stone-600 underline"><Copy size={12} /> Copiar</button>
      </div>
    </div>}
    <p className="text-[11px] text-stone-500">La IA puede equivocarse. Cada uso queda registrado en la actividad.</p>
  </div>;
}
