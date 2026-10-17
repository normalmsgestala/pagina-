import React from 'react';
import { SundialState, EnvironmentType } from '../../types/sundial';
import { 
  Compass, 
  MapPin, 
  School, 
  RotateCcw, 
  Sun, 
  Trees, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';

interface ClassroomOrientationPanelProps {
  state: SundialState;
  onChangeHeading: (heading: number) => void;
  onChangeLatitude: (latitude: number, name?: string) => void;
  onChangeEnvironment: (env: EnvironmentType) => void;
  onChangeTablePos: (x: number, z: number) => void;
  onResetOrientation: () => void;
}

export const ClassroomOrientationPanel: React.FC<ClassroomOrientationPanelProps> = ({
  state,
  onChangeHeading,
  onChangeLatitude,
  onChangeEnvironment,
  onChangeTablePos,
  onResetOrientation,
}) => {
  const LATITUDE_PRESETS = [
    { name: 'Monterrey, N.L. (Normal Profr. Moisés Sáenz)', lat: 25.67 },
    { name: 'Ciudad de México, CDMX', lat: 19.43 },
    { name: 'Guadalajara, Jalisco', lat: 20.67 },
    { name: 'Trópico de Cáncer (México)', lat: 23.44 },
    { name: 'Ecuador Terrestre (Quito)', lat: 0.0 },
    { name: 'Buenos Aires, Argentina (Hemisferio Sur)', lat: -34.60 },
  ];

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* Header */}
      <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
          <Compass className="w-4 h-4 text-sky-400" />
          <span>Calibración de Orientación y Latitud Geográfica</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Para que el reloj funcione fielmente en el aula o patio escolar, el gnomon debe alinearse con el 
          <strong> Norte Geográfico verdadero</strong> y su ángulo sobre la horizontal debe ser idéntico a la <strong>latitud local (φ)</strong>.
        </p>
      </div>

      {/* Compass Orientation Heading Slider */}
      <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-100 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Rumbo de Orientación de la Mesa (Heading):</span>
          </label>
          <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
            {state.orientationHeading.toFixed(0)}° {state.orientationHeading === 0 ? '(Norte Verdadero)' : ''}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={state.orientationHeading}
          onChange={(e) => onChangeHeading(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />

        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>0° Norte</span>
          <span>90° Este</span>
          <span>180° Sur</span>
          <span>270° Oeste</span>
          <button
            onClick={onResetOrientation}
            className="text-amber-400 hover:text-amber-300 underline font-sans ml-2"
          >
            Alinear al Norte (0°)
          </button>
        </div>
      </div>

      {/* Geographic Latitude Selector */}
      <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-100 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Latitud Geográfica del Observador (φ):</span>
          </label>
          <span className="font-mono font-bold text-sky-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
            {state.latitude >= 0 ? `${state.latitude.toFixed(2)}° N` : `${Math.abs(state.latitude).toFixed(2)}° S`}
          </span>
        </div>

        <input
          type="range"
          min="-60"
          max="80"
          step="0.5"
          value={state.latitude}
          onChange={(e) => onChangeLatitude(parseFloat(e.target.value), 'Personalizada')}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />

        <div className="space-y-1.5 pt-2 border-t border-slate-700">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Institución y Ciudades Preset:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {LATITUDE_PRESETS.map((city) => (
              <button
                key={city.name}
                onClick={() => onChangeLatitude(city.lat, city.name)}
                className={`p-2 rounded-xl text-left border transition text-[11px] ${
                  Math.abs(state.latitude - city.lat) < 0.3
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Environment Selector */}
      <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
        <span className="font-bold text-slate-100 block">
          Entorno de Enseñanza:
        </span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'classroom', label: 'Laboratorio', icon: School },
            { id: 'courtyard', label: 'Patio Cívico', icon: Trees },
            { id: 'minimal', label: 'Minimalista', icon: Layers },
          ].map((env) => {
            const Icon = env.icon;
            return (
              <button
                key={env.id}
                onClick={() => onChangeEnvironment(env.id as EnvironmentType)}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  state.environment === env.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{env.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
