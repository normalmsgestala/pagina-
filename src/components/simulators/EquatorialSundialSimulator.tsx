import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ShieldCheck,
  XCircle,
  Plus,
  Trash2,
  Eye,
  Compass,
} from 'lucide-react';
import {
  hourToHourAngle,
  calculateDeclination,
  calculateSolarCoordinates,
  formatSolarHour,
} from '../../utils/astronomy';
import { createPassengerMesh, createCartesianAxesGroup, updateArrowVector } from './threeHelpers';

interface ShadowLogEntry {
  id: string;
  solarTime: string;
  civilTime: string;
  shadowAngle: string;
  dialReading: string;
  errorStatus: string;
}

interface EquatorialSundialSimulatorProps {
  appletUrl?: string;
  defaultLatitude?: number;
}

export const EquatorialSundialSimulator: React.FC<EquatorialSundialSimulatorProps> = ({
  defaultLatitude = 25.67,
}) => {
  const [siteLatitude, setSiteLatitude] = useState<number>(defaultLatitude);
  const [gnomonTilt, setGnomonTilt] = useState<number>(defaultLatitude);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [solarHour, setSolarHour] = useState<number>(10.0);
  const [dayOfYear, setDayOfYear] = useState<number>(81);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showCartesian, setShowCartesian] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [shadowLogs, setShadowLogs] = useState<ShadowLogEntry[]>([]);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);

  const sundialPhysics = useMemo(() => {
    const declination = calculateDeclination(dayOfYear);
    const hourAngle = hourToHourAngle(solarHour);
    const coords = calculateSolarCoordinates(siteLatitude, declination, hourAngle);

    const isNight = coords.elevation <= 0;
    const tiltErrorDeg = gnomonTilt - siteLatitude;
    const headingErrorDeg = compassHeading > 180 ? compassHeading - 360 : compassHeading;

    const angularErrorDeg =
      headingErrorDeg * Math.sin((siteLatitude * Math.PI) / 180) +
      tiltErrorDeg * Math.sin((hourAngle * Math.PI) / 180) * 0.65;

    const measuredHourAngle = hourAngle + angularErrorDeg;
    const dialMeasuredHour = 12 + measuredHourAngle / 15;
    const timeErrorMinutes = Math.round((angularErrorDeg / 15) * 60);

    // 3D Sun unit vector in Cartesian coordinates (+X = East, +Y = Zenith/Up, -Z = North, +Z = South)
    const elevRad = (coords.elevation * Math.PI) / 180;
    const azRad = (coords.azimuth * Math.PI) / 180;
    const sx = Math.cos(elevRad) * Math.sin(azRad);
    const sy = Math.sin(elevRad);
    const sz = -Math.cos(elevRad) * Math.cos(azRad);

    // Gnomon axis unit vector in 3D Cartesian
    const tiltRad = (gnomonTilt * Math.PI) / 180;
    const headRad = (compassHeading * Math.PI) / 180;
    const gx = Math.cos(tiltRad) * Math.sin(headRad);
    const gy = Math.sin(tiltRad);
    const gz = -Math.cos(tiltRad) * Math.cos(headRad);

    const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
    const eotMin = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
    const longitudeOffsetMin = 41.2;
    const civilDecimalHour = (solarHour + (longitudeOffsetMin - eotMin) / 60 + 24) % 24;

    let errorType: 'none' | 'night_no_shadow' | 'wrong_heading' | 'wrong_tilt' = 'none';
    let errorTitle = 'Instrumento 3D Correctamente Orientado y Calibrado (Lectura Exacta)';
    let errorDetail = `El gnomon 3D está inclinado a φ = ${gnomonTilt.toFixed(1)}° N y alineado a 0° Norte Verdadero. La sombra avanza a 15°/hora.`;

    if (isNight) {
      errorType = 'night_no_shadow';
      errorTitle = `ERROR DE HORARIO: ¡Es de noche, el Sol 3D está bajo el horizonte (${coords.elevation.toFixed(1)}°)!`;
      errorDetail =
        'Dato inválido: El Sol está bajo el plano horizontal XY/XZ. El reloj ecuatorial 3D no recibe luz solar ni proyecta sombra.';
    } else if (Math.abs(headingErrorDeg) > 4) {
      errorType = 'wrong_heading';
      errorTitle = `ERROR DE ORIENTACIÓN: Brújula desalineada del Norte (${compassHeading}° ≠ 0° N)`;
      errorDetail = `Dato mal calibrado: El eje del gnomon no apunta al Polo Norte Celeste. La sombra se desvía ${angularErrorDeg.toFixed(1)}° (${timeErrorMinutes >= 0 ? `+${timeErrorMinutes}` : timeErrorMinutes} min).`;
    } else if (Math.abs(tiltErrorDeg) > 3) {
      errorType = 'wrong_tilt';
      errorTitle = `ERROR DE INCLINACIÓN: Ángulo del gnomon (${gnomonTilt.toFixed(1)}°) ≠ Latitud local (${siteLatitude.toFixed(1)}°)`;
      errorDetail = `Dato incorrecto: El cuadrante 3D no es paralelo al ecuador celeste (diferencia de ${tiltErrorDeg.toFixed(1)}°).`;
    }

    return {
      declination,
      hourAngle,
      measuredHourAngle,
      elevation: coords.elevation,
      azimuth: coords.azimuth,
      sx,
      sy,
      sz,
      gx,
      gy,
      gz,
      isNight,
      tiltErrorDeg,
      headingErrorDeg,
      angularErrorDeg,
      timeErrorMinutes,
      trueSolarStr: formatSolarHour(solarHour).timeStr.slice(0, 5),
      dialReadingStr: isNight ? '--:--' : formatSolarHour((dialMeasuredHour + 24) % 24).timeStr.slice(0, 5),
      civilTimeStr: formatSolarHour(civilDecimalHour).timeStr.slice(0, 5),
      errorType,
      errorTitle,
      errorDetail,
      hasError: errorType !== 'none',
    };
  }, [siteLatitude, gnomonTilt, compassHeading, solarHour, dayOfYear]);

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setSolarHour((prev) => {
        const next = prev + dt * 1.4;
        if (next >= 18.5) {
          setIsPlaying(false);
          return 18.0;
        }
        return next;
      });
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  const sceneRefs = useRef<{
    sundialHeadingGroup?: THREE.Group;
    dialTiltGroup?: THREE.Group;
    shadowNeedle?: THREE.Mesh;
    sunSphere?: THREE.Mesh;
    sunLight?: THREE.DirectionalLight;
    sunVectorArrow?: THREE.ArrowHelper;
    gnomonVectorArrow?: THREE.ArrowHelper;
    shadowVectorArrow?: THREE.ArrowHelper;
    cartesianGroup?: THREE.Group;
  }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 300);
    camera.position.set(6.5, 5.5, 9.5);
    camera.lookAt(0, 1.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    scene.add(sunLight);

    // 3D Glowing Sun Sphere moving across the sky
    const sunSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    scene.add(sunSphere);

    const cartesianGroup = createCartesianAxesGroup(7);
    scene.add(cartesianGroup);

    // 3D Student Observer Figure standing beside the sundial
    const observerPerson = createPassengerMesh(0x10b981, false);
    observerPerson.scale.set(1.6, 1.6, 1.6);
    observerPerson.position.set(-2.5, 0, -0.5);
    observerPerson.rotation.y = 0.6;
    scene.add(observerPerson);

    // Pedestal Base
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.6, 1.4, 20),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    );
    pedestal.position.y = 0.7;
    scene.add(pedestal);

    // Sundial Heading Group (rotates around Y when compassHeading != 0)
    const sundialHeadingGroup = new THREE.Group();
    sundialHeadingGroup.position.set(0, 1.45, 0);
    scene.add(sundialHeadingGroup);

    // Dial Tilt Group (tilts so gnomon points at angle gnomonTilt above North horizon -Z)
    const dialTiltGroup = new THREE.Group();
    sundialHeadingGroup.add(dialTiltGroup);

    // Equatorial Circular Dial Plate
    const dialPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.75, 1.75, 0.1, 32),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
    );
    dialTiltGroup.add(dialPlate);

    // Gnomon Rod (perpendicular to equatorial plate, along local Y axis)
    const gnomonRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.8, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.2 })
    );
    dialTiltGroup.add(gnomonRod);

    // Shadow Line projected on the dial plate
    const shadowNeedle = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.14, 1.65),
      new THREE.MeshBasicMaterial({ color: 0x0f172a })
    );
    shadowNeedle.position.y = 0.06;
    dialTiltGroup.add(shadowNeedle);

    // 3D Cartesian Vector Arrows: Sun Ray S⃗ (Yellow), Gnomon Axis G⃗ (Cyan), Shadow Vector (Rose)
    const sunVectorArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 3, 0xfbbf24);
    const gnomonVectorArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 3, 0x38bdf8);
    const shadowVectorArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 2, 0xf43f5e);
    scene.add(sunVectorArrow, gnomonVectorArrow, shadowVectorArrow);

    sceneRefs.current = {
      sundialHeadingGroup,
      dialTiltGroup,
      shadowNeedle,
      sunSphere,
      sunLight,
      sunVectorArrow,
      gnomonVectorArrow,
      shadowVectorArrow,
      cartesianGroup,
    };

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const {
      sundialHeadingGroup,
      dialTiltGroup,
      shadowNeedle,
      sunSphere,
      sunLight,
      sunVectorArrow,
      gnomonVectorArrow,
      shadowVectorArrow,
      cartesianGroup,
    } = sceneRefs.current;

    if (
      !sundialHeadingGroup ||
      !dialTiltGroup ||
      !shadowNeedle ||
      !sunSphere ||
      !sunLight ||
      !sunVectorArrow ||
      !gnomonVectorArrow ||
      !shadowVectorArrow
    )
      return;

    if (cartesianGroup) cartesianGroup.visible = showCartesian;

    // Rotate sundial by compassHeading and tilt so gnomon aligns with gnomonTilt
    sundialHeadingGroup.rotation.y = (-compassHeading * Math.PI) / 180;
    dialTiltGroup.rotation.x = ((90 - gnomonTilt) * Math.PI) / 180;

    // Position 3D Sun in the sky along solar vector (sx, sy, sz)
    const sunDist = 6.2;
    const sunPos = new THREE.Vector3(
      sundialPhysics.sx * sunDist,
      1.45 + sundialPhysics.sy * sunDist,
      sundialPhysics.sz * sunDist
    );
    sunSphere.position.copy(sunPos);
    sunSphere.visible = !sundialPhysics.isNight;
    sunLight.position.copy(sunPos);
    sunLight.intensity = sundialPhysics.isNight ? 0.1 : 1.4;

    // Rotate shadow on dial face
    shadowNeedle.visible = !sundialPhysics.isNight;
    shadowNeedle.rotation.y = (-sundialPhysics.measuredHourAngle * Math.PI) / 180;

    const dialOrigin = new THREE.Vector3(0, 1.45, 0);
    if (showVectors) {
      updateArrowVector(
        sunVectorArrow,
        dialOrigin,
        new THREE.Vector3(sundialPhysics.sx, sundialPhysics.sy, sundialPhysics.sz),
        3.6
      );
      updateArrowVector(
        gnomonVectorArrow,
        dialOrigin,
        new THREE.Vector3(sundialPhysics.gx, sundialPhysics.gy, sundialPhysics.gz),
        3.2
      );
      const shRad = (sundialPhysics.measuredHourAngle * Math.PI) / 180;
      updateArrowVector(
        shadowVectorArrow,
        dialOrigin,
        new THREE.Vector3(Math.sin(shRad), 0, Math.cos(shRad)),
        2.2
      );
      sunVectorArrow.visible = !sundialPhysics.isNight;
      shadowVectorArrow.visible = !sundialPhysics.isNight;
    } else {
      sunVectorArrow.visible = false;
      gnomonVectorArrow.visible = false;
      shadowVectorArrow.visible = false;
    }
  }, [sundialPhysics, compassHeading, gnomonTilt, showVectors, showCartesian]);

  const handleRecordLog = () => {
    const entry: ShadowLogEntry = {
      id: `log-${Date.now()}`,
      solarTime: sundialPhysics.trueSolarStr,
      civilTime: sundialPhysics.civilTimeStr,
      shadowAngle: sundialPhysics.isNight ? 'Sin sombra' : `${sundialPhysics.measuredHourAngle.toFixed(1)}°`,
      dialReading: sundialPhysics.dialReadingStr,
      errorStatus: sundialPhysics.isNight
        ? 'Noche (Sin Sol)'
        : sundialPhysics.timeErrorMinutes === 0
        ? '0 min (Exacto)'
        : `${sundialPhysics.timeErrorMinutes > 0 ? '+' : ''}${sundialPhysics.timeErrorMinutes} min (Desviado)`,
    };
    setShadowLogs((prev) => [entry, ...prev.slice(0, 5)]);
  };

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl border overflow-hidden shadow-xl ${
          highContrast ? 'bg-black text-yellow-300 border-yellow-400' : 'bg-slate-950 text-slate-100 border-slate-800'
        }`}
      >
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                sundialPhysics.hasError ? 'bg-rose-500 animate-ping' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="font-bold text-white font-display">
              Simulador 3D Equipo 4: El Reloj Ecuatorial (Sol 3D, Reloj, Observador y Vectores Cartesianos)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVectors(!showVectors)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer flex items-center gap-1 ${
                showVectors
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Vectores S⃗, G⃗</span>
            </button>
            <button
              onClick={() => setShowCartesian(!showCartesian)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer flex items-center gap-1 ${
                showCartesian
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Plano Cartesiano XYZ</span>
            </button>
          </div>
        </div>

        <div
          className={`px-5 py-2.5 border-b text-xs flex flex-wrap items-center justify-between gap-2 ${
            sundialPhysics.hasError
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/40 border-slate-800 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {sundialPhysics.hasError ? (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <div>
              <strong className="font-bold block">{sundialPhysics.errorTitle}</strong>
              <span className="text-[11px] opacity-90">{sundialPhysics.errorDetail}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setSiteLatitude(25.67);
                setGnomonTilt(25.67);
                setCompassHeading(0);
                setSolarHour(10.0);
              }}
              className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold cursor-pointer"
            >
              ✓ Calibración Exacta
            </button>
            <button
              onClick={() => {
                setCompassHeading(45);
                setSolarHour(11.0);
              }}
              className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[10px] font-semibold cursor-pointer"
            >
              ✗ Brújula Mal Orientada (+45°)
            </button>
            <button
              onClick={() => {
                setGnomonTilt(55);
                setCompassHeading(0);
                setSolarHour(14.5);
              }}
              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-semibold cursor-pointer"
            >
              ✗ Inclinación Errónea (55° ≠ φ)
            </button>
            <button
              onClick={() => {
                setSolarHour(22.0);
              }}
              className="px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[10px] font-semibold cursor-pointer"
            >
              ✗ Horario Nocturno (Sin Sombra)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 p-4 bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-4">
            {/* Pure Unobstructed 3D Viewport */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <div ref={mountRef} className="w-full h-[360px]" />
            </div>

            {/* Dedicated Cartesian Vector Strip BELOW the 3D Viewport (Nothing covers the 3D figures) */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-[11px] font-mono flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-slate-400 font-bold uppercase">Plano Cartesiano (X, Y, Z):</span>
                <span>
                  <strong className="text-amber-400">──► S⃗ (Sol):</strong> ({sundialPhysics.sx.toFixed(2)} î, {sundialPhysics.sy.toFixed(2)} ĵ, {sundialPhysics.sz.toFixed(2)} k̂)
                </span>
                <span>
                  <strong className="text-sky-400">──► G⃗ (Gnomon):</strong> ({sundialPhysics.gx.toFixed(2)} î, {sundialPhysics.gy.toFixed(2)} ĵ, {sundialPhysics.gz.toFixed(2)} k̂)
                </span>
                <span>
                  <strong className="text-rose-400">──► Sombra H:</strong>{' '}
                  {sundialPhysics.isNight ? 'SIN SOMBRA' : `${sundialPhysics.measuredHourAngle.toFixed(1)}° (15°/h)`}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 flex-1 min-w-[220px]">
                <span className="font-mono text-amber-400 font-bold shrink-0">
                  Hora: {sundialPhysics.trueSolarStr}
                </span>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.25"
                  value={solarHour}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setSolarHour(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRecordLog}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar Sombra</span>
                </button>
                <button
                  onClick={() => {
                    if (solarHour >= 18) setSolarHour(6.5);
                    setIsPlaying(!isPlaying);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pausar Sol 3D' : 'Animar Sol 3D'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setSiteLatitude(25.67);
                    setGnomonTilt(25.67);
                    setCompassHeading(0);
                    setSolarHour(12.0);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-5 space-y-4 bg-slate-900/95 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Sliders className="w-4 h-4" />
              <span>Variables Gnomónicas y Orientación</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-300 font-medium">Orientación Brújula (0° = Norte):</label>
                  <span className="font-mono text-emerald-400">{compassHeading}°</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  step="1"
                  value={compassHeading}
                  onChange={(e) => setCompassHeading(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-300 font-medium">Inclinación del Gnomon (α):</label>
                  <span className="font-mono text-amber-400">{gnomonTilt.toFixed(1)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="70"
                  step="0.5"
                  value={gnomonTilt}
                  onChange={(e) => setGnomonTilt(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-300 font-medium">Latitud Geográfica Local (φ):</label>
                  <span className="font-mono text-sky-400">{siteLatitude.toFixed(2)}° N</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="65"
                  step="0.5"
                  value={siteLatitude}
                  onChange={(e) => setSiteLatitude(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg accent-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-300 font-medium">Estación del Año (Declinación δ):</label>
                  <span className="font-mono text-purple-400">{sundialPhysics.declination.toFixed(1)}°</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[
                    { day: 81, label: 'Equinoccio' },
                    { day: 172, label: 'Solst. Verano' },
                    { day: 355, label: 'Solst. Invierno' },
                  ].map((st) => (
                    <button
                      key={st.day}
                      onClick={() => setDayOfYear(st.day)}
                      className={`py-1 px-2 rounded border text-[10px] font-medium cursor-pointer ${
                        dayOfYear === st.day
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Hora Solar Verdadera:</span>
                <span className="text-white font-bold">{sundialPhysics.trueSolarStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hora Marcada en Reloj:</span>
                <span className={sundialPhysics.hasError ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {sundialPhysics.dialReadingStr}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hora Reloj Convencional:</span>
                <span className="text-sky-400">{sundialPhysics.civilTimeStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Error de lectura:</span>
                <span className={sundialPhysics.hasError ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {sundialPhysics.isNight
                    ? 'SIN SOL'
                    : `${sundialPhysics.timeErrorMinutes > 0 ? '+' : ''}${sundialPhysics.timeErrorMinutes} min`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bitácora Experimental */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">
              Bitácora Experimental: Comparación Hora Solar, Lectura del Reloj y Error de Orientación
            </h4>
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
          <div className="py-4 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
            Sin mediciones registradas aún. Usa el botón «Registrar Sombra» en el simulador.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-mono text-[11px]">
                  <th className="py-2 px-3">Hora Solar Real</th>
                  <th className="py-2 px-3">Lectura en Cuadrante</th>
                  <th className="py-2 px-3">Hora Convencional</th>
                  <th className="py-2 px-3">Ángulo Sombra</th>
                  <th className="py-2 px-3">Diagnóstico / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {shadowLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold text-stone-900">{log.solarTime}</td>
                    <td className="py-2 px-3 font-bold text-amber-800">{log.dialReading}</td>
                    <td className="py-2 px-3 text-sky-800">{log.civilTime}</td>
                    <td className="py-2 px-3">{log.shadowAngle}</td>
                    <td className="py-2 px-3 font-semibold text-rose-700">{log.errorStatus}</td>
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
