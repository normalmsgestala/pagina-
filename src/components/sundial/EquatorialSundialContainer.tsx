import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SundialState, CameraPreset, EnvironmentType } from '../../types/sundial';
import {
  hourToHourAngle,
  hourAngleToHour,
  calculateDeclination,
  calculateSolarCoordinates,
  formatSolarHour,
  SCENARIO_PRESETS,
} from '../../utils/astronomy';
import { SundialScene } from './SundialScene';
import { TopBar } from './TopBar';
import { Mode1EarthRotation } from './Mode1EarthRotation';
import { Mode2SunAngles } from './Mode2SunAngles';
import { ClassroomOrientationPanel } from './ClassroomOrientationPanel';
import { StudentChallenges } from './StudentChallenges';
import { DidacticGuideModal } from './DidacticGuideModal';
import {
  Camera,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
  Compass,
} from 'lucide-react';

interface ShadowLogEntry {
  id: string;
  solarTime: string;
  civilTime: string;
  shadowAngle: string;
  azimuth: string;
  elevation: string;
  errorMin: string;
}

interface EquatorialSundialContainerProps {
  appletUrl?: string;
  defaultLatitude?: number;
  locationName?: string;
}

export const EquatorialSundialContainer: React.FC<EquatorialSundialContainerProps> = ({
  appletUrl = 'https://ai.studio/apps/e8b829a0-fea8-4941-9784-6d07e84792c7',
  defaultLatitude = 25.67,
  locationName = 'Monterrey, N.L. (Normal Profr. Moisés Sáenz 25.67° N)',
}) => {
  const initialDeclination = calculateDeclination(81);
  const initialH = 0;
  const initialCoords = calculateSolarCoordinates(defaultLatitude, initialDeclination, initialH);

  const [state, setState] = useState<SundialState>({
    mode: 'earth_rotation',
    latitude: defaultLatitude,
    locationName: locationName,
    orientationHeading: 0,
    tablePositionX: 0,
    tablePositionZ: 0,

    solarHour: 12.0,
    isPlaying: false,
    playSpeed: 1,
    dayOfYear: 81,

    hourAngle: initialH,
    solarDeclination: initialDeclination,
    solarElevation: initialCoords.elevation,
    solarAzimuth: initialCoords.azimuth,

    environment: 'classroom',
    showSunRays: true,
    showCelestialArcs: true,
    showCompassGrid: true,
    showShadowPath: true,
    showAngleCallouts: true,
    showEarthMiniGlobe: true,
    activeFace: 'upper',
  });

  const [activeTab, setActiveTab] = useState<'simulation' | 'classroom' | 'challenges' | 'theory'>('simulation');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('room');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [shadowLogs, setShadowLogs] = useState<ShadowLogEntry[]>([]);

  // Equation of time & Conventional clock comparison (required by Equipo 4 PDF)
  const timeComparison = useMemo(() => {
    const b = (2 * Math.PI * (state.dayOfYear - 81)) / 365;
    const eotMin = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
    // Misalignment error if sundial is not oriented to True North (0°)
    const headingErrorMin = (state.orientationHeading > 180 ? state.orientationHeading - 360 : state.orientationHeading) * 4;
    // Longitude offset for Monterrey (100.3°W vs 90°W central meridian = +41.2 min)
    const longitudeOffsetMin = 41.2;
    const totalOffsetHours = (longitudeOffsetMin - eotMin + headingErrorMin) / 60;
    const civilDecimalHour = (state.solarHour + totalOffsetHours + 24) % 24;

    return {
      eotMin,
      headingErrorMin,
      civilTimeStr: formatSolarHour(civilDecimalHour).timeStr.slice(0, 5),
      totalDiffMin: Math.round(longitudeOffsetMin - eotMin + headingErrorMin),
    };
  }, [state.dayOfYear, state.solarHour, state.orientationHeading]);

  // Playback timer
  useEffect(() => {
    if (!state.isPlaying) return;

    const interval = setInterval(() => {
      setState((prev) => {
        let nextHour = prev.solarHour + 0.05 * prev.playSpeed;
        if (nextHour >= 24) nextHour -= 24;

        const nextH = hourToHourAngle(nextHour);
        const coords = calculateSolarCoordinates(prev.latitude, prev.solarDeclination, nextH);

        return {
          ...prev,
          solarHour: nextHour,
          hourAngle: nextH,
          solarElevation: coords.elevation,
          solarAzimuth: coords.azimuth,
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [state.isPlaying, state.playSpeed]);

  const handleHourChange = useCallback((newHour: number) => {
    setState((prev) => {
      const cleanHour = Math.max(0, Math.min(24, newHour));
      const nextH = hourToHourAngle(cleanHour);
      const coords = calculateSolarCoordinates(prev.latitude, prev.solarDeclination, nextH);

      return {
        ...prev,
        solarHour: cleanHour,
        hourAngle: nextH,
        solarElevation: coords.elevation,
        solarAzimuth: coords.azimuth,
      };
    });
  }, []);

  const handleUpdateAngles = useCallback(
    (updates: {
      hourAngle?: number;
      solarElevation?: number;
      solarAzimuth?: number;
      solarDeclination?: number;
    }) => {
      setState((prev) => {
        const nextH = updates.hourAngle !== undefined ? updates.hourAngle : prev.hourAngle;
        const nextDecl = updates.solarDeclination !== undefined ? updates.solarDeclination : prev.solarDeclination;

        let nextElev = prev.solarElevation;
        let nextAz = prev.solarAzimuth;

        if (updates.hourAngle !== undefined || updates.solarDeclination !== undefined) {
          const coords = calculateSolarCoordinates(prev.latitude, nextDecl, nextH);
          nextElev = coords.elevation;
          nextAz = coords.azimuth;
        }

        if (updates.solarElevation !== undefined) nextElev = updates.solarElevation;
        if (updates.solarAzimuth !== undefined) nextAz = updates.solarAzimuth;

        const nextHour = hourAngleToHour(nextH);

        return {
          ...prev,
          hourAngle: nextH,
          solarDeclination: nextDecl,
          solarElevation: nextElev,
          solarAzimuth: nextAz,
          solarHour: nextHour,
        };
      });
    },
    []
  );

  const handleHeadingChange = useCallback((heading: number) => {
    setState((prev) => ({ ...prev, orientationHeading: heading }));
  }, []);

  const handleLatitudeChange = useCallback((latitude: number, name = 'Personalizada') => {
    setState((prev) => {
      const coords = calculateSolarCoordinates(latitude, prev.solarDeclination, prev.hourAngle);
      return {
        ...prev,
        latitude,
        locationName: name,
        solarElevation: coords.elevation,
        solarAzimuth: coords.azimuth,
      };
    });
  }, []);

  const handleEnvironmentChange = useCallback((environment: EnvironmentType) => {
    setState((prev) => ({ ...prev, environment }));
  }, []);

  const handleTablePosChange = useCallback((x: number, z: number) => {
    setState((prev) => ({ ...prev, tablePositionX: x, tablePositionZ: z }));
  }, []);

  const handleApplyPreset = useCallback((presetId: string) => {
    const sc = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (!sc) return;

    setState((prev) => {
      const coords = calculateSolarCoordinates(prev.latitude, sc.declination, sc.hourAngle);
      return {
        ...prev,
        solarHour: sc.hour,
        hourAngle: sc.hourAngle,
        solarDeclination: sc.declination,
        dayOfYear: sc.dayOfYear,
        solarElevation: coords.elevation,
        solarAzimuth: coords.azimuth,
      };
    });
  }, []);

  const { timeStr } = formatSolarHour(state.solarHour);
  const hSign = state.hourAngle >= 0 ? '+' : '';

  const currentHInt = Math.floor(((state.solarHour % 24) + 24) % 24);
  const currentMInt = Math.floor(((((state.solarHour % 24) + 24) % 24) - currentHInt) * 60);

  const handleRecordMeasurement = () => {
    const entry: ShadowLogEntry = {
      id: `log-${Date.now()}`,
      solarTime: timeStr.slice(0, 5),
      civilTime: timeComparison.civilTimeStr,
      shadowAngle: `${hSign}${state.hourAngle.toFixed(1)}°`,
      azimuth: `${state.solarAzimuth.toFixed(1)}°`,
      elevation: `${state.solarElevation.toFixed(1)}°`,
      errorMin: `${timeComparison.totalDiffMin >= 0 ? '+' : ''}${timeComparison.totalDiffMin} min`,
    };
    setShadowLogs((prev) => [entry, ...prev.slice(0, 7)]);
  };

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl overflow-hidden border transition-all ${
          highContrast ? 'border-yellow-400 bg-black text-yellow-300' : 'border-slate-800 bg-slate-950 text-slate-100'
        } shadow-xl ${
          isFullscreen
            ? 'fixed inset-0 z-50 rounded-none h-screen w-screen'
            : 'relative w-full h-[720px] lg:h-[760px]'
        } flex flex-col font-sans`}
      >
        {/* Top Header of Container */}
        <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-bold text-white font-display">
              Simulador Equipo 4: El Reloj Ecuatorial (Observar → Orientar → Medir → Comparar)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* High Contrast Accessibility Toggle (Requested by Equipo 4 PDF) */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 text-[11px] cursor-pointer ${
                highContrast
                  ? 'bg-yellow-400 text-black font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Recurso visual de alto contraste (Inclusión y Accesibilidad)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Alto Contraste</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px] cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isFullscreen ? 'Minimizar' : 'Pantalla Completa'}</span>
            </button>

            <a
              href={appletUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1 text-[11px]"
            >
              <span>AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Top Bar Navigation */}
        <TopBar
          mode={state.mode}
          onSelectMode={(newMode) => setState((prev) => ({ ...prev, mode: newMode }))}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenGuide={() => setIsGuideOpen(true)}
        />

        {/* Main Dual-Zone Sandbox Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left / Top Stage: 3D WebGL Canvas Viewport */}
          <div className="relative flex-1 h-[52vh] lg:h-full bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col">
            <div className="relative flex-1 w-full h-full">
              <SundialScene
                state={state}
                onRotateHeading={handleHeadingChange}
                cameraPreset={cameraPreset}
                onCameraPresetApplied={() => setCameraPreset('free')}
              />

              {/* TOP-LEFT HUD: Camera Quick Switcher */}
              <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1 p-1 bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-xl text-xs">
                <span className="text-[11px] text-slate-400 px-2 font-medium flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cámaras:</span>
                </span>

                {[
                  { id: 'room', label: '☀️ Sol y Reloj' },
                  { id: 'dial_closeup', label: '🔍 Cuadrante' },
                  { id: 'top_down', label: 'Cenital' },
                  { id: 'celestial', label: 'Esfera Celeste' },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setCameraPreset(cam.id as CameraPreset)}
                    className={`px-2.5 py-1 rounded-md text-xs transition cursor-pointer ${
                      cameraPreset === cam.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>

              {/* TOP-RIGHT HUD: Solar Time vs Conventional Clock Time & Digital Compass */}
              <div className="absolute top-3 right-3 z-10 px-3.5 py-2.5 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-lg text-right space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Hora Solar:</span>
                  <span className={`text-lg sm:text-xl font-extrabold font-mono ${highContrast ? 'text-yellow-300' : 'text-white'}`}>
                    {timeStr.slice(0, 5)}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Hora Convencional:</span>
                  <span className="text-xs font-bold font-mono text-sky-400">
                    {timeComparison.civilTimeStr} ({timeComparison.totalDiffMin >= 0 ? `+${timeComparison.totalDiffMin}` : timeComparison.totalDiffMin}m)
                  </span>
                </div>
                <div className="text-[10px] font-mono text-amber-400 flex items-center justify-end gap-2 pt-0.5 border-t border-slate-800">
                  <span>Sombra H: {hSign}{state.hourAngle.toFixed(0)}°</span>
                  <span>·</span>
                  <span>Brújula: {state.orientationHeading.toFixed(0)}° N</span>
                </div>
              </div>

              {/* BOTTOM FLOATING CONTROLLER */}
              <div className="absolute bottom-3 left-3 right-3 z-10 p-2.5 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">
                      Hora Solar y Sombra:
                    </span>
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {timeStr.slice(0, 5)}
                    </span>
                    <button
                      onClick={handleRecordMeasurement}
                      className="px-2.5 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition"
                      title="Registrar posición de sombra y hora para comparar"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Registrar Sombra y Hora</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Escribir hora:</span>
                    <input
                      type="time"
                      value={`${currentHInt.toString().padStart(2, '0')}:${currentMInt.toString().padStart(2, '0')}`}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && val.includes(':')) {
                          const [hh, mm] = val.split(':');
                          const h = parseInt(hh, 10);
                          const m = parseInt(mm, 10);
                          if (!isNaN(h)) {
                            handleHourChange(h + (isNaN(m) ? 0 : m / 60));
                          }
                        }
                      }}
                      className="bg-slate-800 text-white font-mono font-bold text-xs px-2 py-0.5 rounded border border-slate-600"
                    />
                  </div>
                </div>

                {/* Time Slider */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleHourChange(Math.max(0, state.solarHour - 1))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-mono text-slate-300 border border-slate-700 flex items-center cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>-1h</span>
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max="24"
                      step="0.05"
                      value={state.solarHour}
                      onChange={(e) => handleHourChange(parseFloat(e.target.value))}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5 px-1">
                      <span>06:00 (-90°)</span>
                      <span className="text-amber-400 font-bold">12:00 (0°)</span>
                      <span>18:00 (+90°)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleHourChange(Math.min(24, state.solarHour + 1))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-mono text-slate-300 border border-slate-700 flex items-center cursor-pointer"
                  >
                    <span>+1h</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleHourChange(12)}
                    className="hidden sm:flex px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/40 items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>12:00</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right / Bottom Zone: Control Deck */}
          <div className="w-full lg:w-[460px] xl:w-[500px] h-[48vh] lg:h-full overflow-y-auto bg-slate-900/95 border-t lg:border-t-0 p-4 lg:p-5 space-y-4">
            {activeTab === 'simulation' && state.mode === 'earth_rotation' && (
              <Mode1EarthRotation
                state={state}
                onChangeHour={handleHourChange}
                onTogglePlay={() => setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
                onChangeSpeed={(speed) => setState((prev) => ({ ...prev, playSpeed: speed }))}
                onChangeDayOfYear={(day) => {
                  const decl = calculateDeclination(day);
                  setState((prev) => ({ ...prev, dayOfYear: day, solarDeclination: decl }));
                }}
                onApplyPreset={handleApplyPreset}
              />
            )}

            {activeTab === 'simulation' && state.mode === 'sun_angles' && (
              <Mode2SunAngles state={state} onUpdateAngles={handleUpdateAngles} />
            )}

            {activeTab === 'classroom' && (
              <ClassroomOrientationPanel
                state={state}
                onChangeHeading={handleHeadingChange}
                onChangeLatitude={handleLatitudeChange}
                onChangeEnvironment={handleEnvironmentChange}
                onChangeTablePos={handleTablePosChange}
                onResetOrientation={() => handleHeadingChange(0)}
              />
            )}

            {activeTab === 'challenges' && <StudentChallenges state={state} />}
          </div>
        </div>

        <DidacticGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      </div>

      {/* Bitácora de Registro de Sombras y Comparación Hora Solar vs Convencional (Requerido por Equipo 4 PDF) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">
              Hoja de Registro: Comparación entre Hora Solar, Sombra y Hora Convencional
            </h4>
            <p className="text-xs text-stone-500">
              Pulsa «Registrar Sombra y Hora» en el simulador en distintos momentos del día para llenar tu tabla experimental.
            </p>
          </div>
          {shadowLogs.length > 0 && (
            <button
              onClick={() => setShadowLogs([])}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar registros</span>
            </button>
          )}
        </div>

        {shadowLogs.length === 0 ? (
          <div className="py-6 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
            Sin mediciones registradas aún. Usa el botón «Registrar Sombra y Hora» dentro del simulador.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-mono text-[11px]">
                  <th className="py-2 px-3">Hora Solar (Reloj)</th>
                  <th className="py-2 px-3">Hora Convencional</th>
                  <th className="py-2 px-3">Ángulo Sombra (H)</th>
                  <th className="py-2 px-3">Azimut Solar</th>
                  <th className="py-2 px-3">Elevación</th>
                  <th className="py-2 px-3">Diferencia / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {shadowLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold text-amber-900">{log.solarTime}</td>
                    <td className="py-2 px-3 text-sky-800">{log.civilTime}</td>
                    <td className="py-2 px-3">{log.shadowAngle}</td>
                    <td className="py-2 px-3">{log.azimuth}</td>
                    <td className="py-2 px-3">{log.elevation}</td>
                    <td className="py-2 px-3 text-stone-600">{log.errorMin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
