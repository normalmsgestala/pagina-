import React from 'react';
import { SundialState } from '../../types/sundial';
import { Compass, Sun, Sliders, Globe, Calculator, HelpCircle } from 'lucide-react';

interface Mode2SunAnglesProps {
  state: SundialState;
  onUpdateAngles: (updates: {
    hourAngle?: number;
    solarElevation?: number;
    solarAzimuth?: number;
    solarDeclination?: number;
  }) => void;
}

export const Mode2SunAngles: React.FC<Mode2SunAnglesProps> = ({
  state,
  onUpdateAngles,
}) => {
  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* Concept Header */}
      <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Modo 2: Geometría Esférica y Ángulos Solares</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Manipula directamente las coordenadas ecuatoriales celestes: el <strong>Ángulo Horario (H)</strong> 
          y la <strong>Declinación Solar (δ)</strong>, observando su transformación matemática instantánea en altura y azimut sobre el horizonte.
        </p>
      </div>

      {/* Sliders Deck */}
      <div className="space-y-5 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60">
        {/* Hour Angle H Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-100 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Ángulo Horario Solar (H):</span>
            </label>
            <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {state.hourAngle >= 0 ? `+${state.hourAngle.toFixed(1)}°` : `${state.hourAngle.toFixed(1)}°`}
            </span>
          </div>

          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={state.hourAngle}
            onChange={(e) => onUpdateAngles({ hourAngle: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>-90° (06:00 h)</span>
            <span className="text-amber-400 font-bold">0° (12:00 h)</span>
            <span>+90° (18:00 h)</span>
          </div>
        </div>

        {/* Solar Declination delta Slider */}
        <div className="space-y-2 pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-100 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Declinación Solar (δ):</span>
            </label>
            <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {state.solarDeclination >= 0 ? `+${state.solarDeclination.toFixed(2)}°` : `${state.solarDeclination.toFixed(2)}°`}
            </span>
          </div>

          <input
            type="range"
            min="-23.44"
            max="23.44"
            step="0.1"
            value={state.solarDeclination}
            onChange={(e) => onUpdateAngles({ solarDeclination: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>-23.44° (Invierno)</span>
            <span className="text-emerald-400">0.0° (Equinoccios)</span>
            <span>+23.44° (Verano)</span>
          </div>
        </div>

        {/* Elevation Angle Slider */}
        <div className="space-y-2 pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-100 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Elevación Solar (Altura h):</span>
            </label>
            <span className="font-mono font-bold text-sky-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {state.solarElevation.toFixed(1)}°
            </span>
          </div>

          <input
            type="range"
            min="-10"
            max="90"
            step="0.5"
            value={state.solarElevation}
            onChange={(e) => onUpdateAngles({ solarElevation: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        {/* Azimuth Angle Slider */}
        <div className="space-y-2 pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-100 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              <span>Azimut Solar (desde el Norte 0°):</span>
            </label>
            <span className="font-mono font-bold text-purple-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {state.solarAzimuth.toFixed(1)}°
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={state.solarAzimuth}
            onChange={(e) => onUpdateAngles({ solarAzimuth: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0° (N)</span>
            <span>90° (E)</span>
            <span>180° (S)</span>
            <span>270° (O)</span>
            <span>360° (N)</span>
          </div>
        </div>
      </div>

      {/* Mathematical Box */}
      <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          <span>Fórmulas de Trigonometría Esférica Aplicadas:</span>
        </div>
        <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-[11px] text-amber-300 space-y-1">
          <div>sin(h) = sin(φ)·sin(δ) + cos(φ)·cos(δ)·cos(H)</div>
          <div>cos(A) = [sin(δ) - sin(φ)·sin(h)] / [cos(φ)·cos(h)]</div>
          <div>H = (Hora Solar - 12) × 15°</div>
        </div>
      </div>
    </div>
  );
};
