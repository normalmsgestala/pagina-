import React from 'react';
import { SundialState } from '../../types/sundial';
import { SCENARIO_PRESETS, formatSolarHour, formatDayOfYear } from '../../utils/astronomy';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  Clock, 
  Sun, 
  Lightbulb, 
  CheckCircle2,
  Bookmark
} from 'lucide-react';

interface Mode1EarthRotationProps {
  state: SundialState;
  onChangeHour: (hour: number) => void;
  onTogglePlay: () => void;
  onChangeSpeed: (speed: number) => void;
  onChangeDayOfYear: (day: number) => void;
  onApplyPreset: (presetId: string) => void;
}

export const Mode1EarthRotation: React.FC<Mode1EarthRotationProps> = ({
  state,
  onChangeHour,
  onTogglePlay,
  onChangeSpeed,
  onChangeDayOfYear,
  onApplyPreset,
}) => {
  const { timeStr } = formatSolarHour(state.solarHour);
  const formattedDate = formatDayOfYear(state.dayOfYear);

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* Concept Header */}
      <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Modo 1: Rotación Terrestre y Paso del Tiempo</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Observa cómo el giro de la Tierra a razón de <strong>15° por hora</strong> (360° / 24h = 15°/h)
          hace que la sombra del gnomon polar barra uniformemente las 24 marcas equidistantes del cuadrante ecuatorial.
        </p>
      </div>

      {/* Animation & Playback Controls */}
      <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-100 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Control de Reproducción Continua:</span>
          </span>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
            {[0.5, 1, 2, 5].map((sp) => (
              <button
                key={sp}
                onClick={() => onChangeSpeed(sp)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  state.playSpeed === sp
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className={`flex-1 py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
              state.isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-md'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
            }`}
          >
            {state.isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pausar Rotación Solar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Iniciar Simulación del Día</span>
              </>
            )}
          </button>

          <button
            onClick={() => onChangeHour(12.0)}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl border border-slate-600 transition"
            title="Ir a Mediodía Solar (12:00)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date & Season (Day of Year) Selector */}
      <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-100 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Época del Año y Declinación (δ):</span>
          </label>
          <div className="text-right">
            <span className="font-semibold text-white block">{formattedDate}</span>
            <span className="font-mono text-[10px] text-emerald-400">
              δ = {state.solarDeclination >= 0 ? `+${state.solarDeclination.toFixed(1)}°` : `${state.solarDeclination.toFixed(1)}°`}
            </span>
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="365"
          value={state.dayOfYear}
          onChange={(e) => onChangeDayOfYear(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />

        {/* Season indicators */}
        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="text-slate-400">Cara Activa:</span>
          <span className={`font-semibold flex items-center gap-1 ${
            state.solarDeclination >= 0 ? 'text-amber-400' : 'text-sky-400'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {state.solarDeclination >= 0 ? 'Cara Superior (Primavera / Verano)' : 'Cara Inferior (Otoño / Invierno)'}
          </span>
        </div>
      </div>

      {/* Quick Scenario Presets */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Escenarios Didácticos Preparados:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SCENARIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset.id)}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-left transition space-y-0.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white group-hover:text-amber-400 transition text-[11px]">
                  {preset.name}
                </span>
                <Bookmark className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Teacher Didactic Callout */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200/90 flex gap-2.5">
        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 block mb-0.5">Fundamento Físico para Educación Secundaria:</strong>
          En cualquier reloj de sol plano horizontal, las líneas horarias tienen separaciones angulares desiguales que dependen de la latitud: 
          <code className="text-white font-mono bg-slate-900 px-1 rounded ml-1">tan(θ) = sin(φ)·tan(H)</code>.
          En cambio, en el <strong>reloj ecuatorial</strong>, ¡todas las horas miden exactamente <strong>15°</strong> siempre!
        </div>
      </div>
    </div>
  );
};
