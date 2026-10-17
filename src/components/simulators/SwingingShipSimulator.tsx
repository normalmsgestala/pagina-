import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ShieldCheck,
  XCircle,
  Eye,
  Compass,
} from 'lucide-react';
import { createPassengerMesh, createCartesianAxesGroup, updateArrowVector } from './threeHelpers';

export const SwingingShipSimulator: React.FC = () => {
  const [amplitudeDeg, setAmplitudeDeg] = useState<number>(38);
  const [length, setLength] = useState<number>(8.0);
  const [mass, setMass] = useState<number>(400);
  const [damping, setDamping] = useState<number>(0.05);
  const [drivingForceRatio, setDrivingForceRatio] = useState<number>(0.0);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showCartesian, setShowCartesian] = useState<boolean>(true);
  const [time, setTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);
  const g = 9.81;

  const omega0 = Math.sqrt(g / length);
  const omegaD = Math.sqrt(Math.max(0.01, omega0 * omega0 - damping * damping));
  const period = (2 * Math.PI) / omega0;
  const frequency = 1 / period;

  const diagnostic = useMemo(() => {
    if (amplitudeDeg <= 2) {
      return {
        hasError: true,
        type: 'no_oscillation' as const,
        title: 'ERROR: El barco 3D no oscila (Amplitud inicial θ₀ ≈ 0°)',
        detail:
          'Dato inválido: Sin ángulo inicial, la fuerza restauradora tangencial es cero (F_t = -mg·senθ = 0 N) y el barco permanece inmóvil.',
      };
    }
    if (damping >= 0.45) {
      return {
        hasError: true,
        type: 'overdamped_stuck' as const,
        title: `ERROR CRÍTICO: Sistema sobreamortiguado (γ = ${damping.toFixed(2)} s⁻¹ excesivo)`,
        detail:
          'La fricción en el pivote disipa toda la energía mecánica; el barco 3D se frena y no logra mantener su movimiento armónico.',
      };
    }
    if (amplitudeDeg >= 78 || drivingForceRatio >= 0.5) {
      return {
        hasError: true,
        type: 'structural_limit' as const,
        title: `¡PELIGRO ESTRUCTURAL! Ángulo o resonancia fuera de límite (θ₀ = ${amplitudeDeg}°)`,
        detail:
          'El barco 3D supera el límite de los soportes A-Frame (±75°) y golpea la estructura.',
      };
    }
    return {
      hasError: false,
      type: 'ok' as const,
      title: 'Oscilación Armónica 3D Estable y Ajustada al Modelo',
      detail: `El barco con sus pasajeros oscila con periodo T = ${period.toFixed(2)} s.`,
    };
  }, [amplitudeDeg, damping, drivingForceRatio, period]);

  const currentOscillation = useMemo(() => {
    const theta0Rad = (amplitudeDeg * Math.PI) / 180;
    const growthFactor =
      drivingForceRatio > 0 ? Math.exp(drivingForceRatio * 0.12 * time) : Math.exp(-damping * time);
    const rawExpRad = theta0Rad * growthFactor * Math.cos(omegaD * time);
    const expThetaRad = Math.max(-Math.PI * 0.62, Math.min(Math.PI * 0.62, rawExpRad));
    const angularVel = -theta0Rad * growthFactor * omegaD * Math.sin(omegaD * time);
    const tangentialVel = angularVel * length;

    const restoringForceMag = -mass * g * Math.sin(expThetaRad);
    const tx = Math.cos(expThetaRad);
    const ty = Math.sin(expThetaRad);

    const vx = tangentialVel * tx;
    const vy = tangentialVel * ty;
    const fx = restoringForceMag * tx;
    const fy = restoringForceMag * ty;

    return {
      expThetaDeg: (expThetaRad * 180) / Math.PI,
      expThetaRad,
      currentAmpDeg: Math.min(115, amplitudeDeg * growthFactor),
      tangentialVel,
      restoringForceMag,
      vx,
      vy,
      fx,
      fy,
    };
  }, [amplitudeDeg, length, mass, damping, drivingForceRatio, time, omegaD]);

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime((prev) => {
        const next = prev + dt;
        return next > 20 ? 0 : next;
      });
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  const sceneRefs = useRef<{
    pendulumPivot?: THREE.Group;
    armMesh?: THREE.Mesh;
    boatGroup?: THREE.Group;
    velArrow?: THREE.ArrowHelper;
    forceArrow?: THREE.ArrowHelper;
    gravArrow?: THREE.ArrowHelper;
    cartesianGroup?: THREE.Group;
  }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 300);
    camera.position.set(0, 6.2, 16.5);
    camera.lookAt(0, 4.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.3);
    sunLight.position.set(10, 20, 15);
    scene.add(sunLight);

    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    sunMesh.position.set(10, 13, -10);
    scene.add(sunMesh);

    const cartesianGroup = createCartesianAxesGroup(9);
    scene.add(cartesianGroup);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.4 });
    const legGeo = new THREE.CylinderGeometry(0.18, 0.24, 10.5, 12);
    [
      [-2.8, 4.6, -1.6, -0.28],
      [2.8, 4.6, -1.6, 0.28],
      [-2.8, 4.6, 1.6, -0.28],
      [2.8, 4.6, 1.6, 0.28],
    ].forEach(([lx, ly, lz, rz]) => {
      const leg = new THREE.Mesh(legGeo, frameMat);
      leg.position.set(lx, ly, lz);
      leg.rotation.z = rz;
      scene.add(leg);
    });

    const topCrossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 4.0, 12), frameMat);
    topCrossbar.rotation.x = Math.PI / 2;
    topCrossbar.position.set(0, 9.2, 0);
    scene.add(topCrossbar);

    const pendulumPivot = new THREE.Group();
    pendulumPivot.position.set(0, 9.2, 0);
    scene.add(pendulumPivot);

    const armMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 1, 12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.4 })
    );
    pendulumPivot.add(armMesh);

    const boatGroup = new THREE.Group();
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.75, 1.35),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    boatGroup.add(hull);

    [-0.9, 0, 0.9].forEach((px, idx) => {
      const p = createPassengerMesh(idx === 1 ? 0x10b981 : 0xf97316, true);
      p.position.set(px, 0.35, 0);
      boatGroup.add(p);
    });

    pendulumPivot.add(boatGroup);

    const velArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 2, 0x10b981);
    const forceArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), 2, 0x38bdf8);
    const gravArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), 2, 0xf43f5e);
    scene.add(velArrow, forceArrow, gravArrow);

    sceneRefs.current = {
      pendulumPivot,
      armMesh,
      boatGroup,
      velArrow,
      forceArrow,
      gravArrow,
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
    const { pendulumPivot, armMesh, boatGroup, velArrow, forceArrow, gravArrow, cartesianGroup } =
      sceneRefs.current;
    if (!pendulumPivot || !armMesh || !boatGroup || !velArrow || !forceArrow || !gravArrow) return;

    const arm3D = 3.2 + length * 0.32;
    armMesh.scale.set(1, arm3D, 1);
    armMesh.position.y = -arm3D / 2;
    boatGroup.position.y = -arm3D;
    pendulumPivot.rotation.z = currentOscillation.expThetaRad;

    if (cartesianGroup) cartesianGroup.visible = showCartesian;

    const boatWorldPos = new THREE.Vector3(
      arm3D * Math.sin(currentOscillation.expThetaRad),
      9.2 - arm3D * Math.cos(currentOscillation.expThetaRad),
      0
    );

    if (showVectors) {
      updateArrowVector(
        velArrow,
        boatWorldPos,
        new THREE.Vector3(currentOscillation.vx, currentOscillation.vy, 0),
        0.18
      );
      updateArrowVector(
        forceArrow,
        boatWorldPos,
        new THREE.Vector3(currentOscillation.fx, currentOscillation.fy, 0),
        0.0008
      );
      updateArrowVector(gravArrow, boatWorldPos, new THREE.Vector3(0, -mass * g, 0), 0.0005);
    } else {
      velArrow.visible = false;
      forceArrow.visible = false;
      gravArrow.visible = false;
    }
  }, [currentOscillation, length, mass, showVectors, showCartesian]);

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              diagnostic.hasError ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span className="font-bold text-white font-display">
            Simulador 3D Equipo 3: El Barco de Vaivén (Péndulo 3D con Pasajeros y Vectores Cartesianos)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer flex items-center gap-1 ${
              showVectors
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Vectores 3D</span>
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
          diagnostic.hasError
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : 'bg-emerald-950/40 border-slate-800 text-emerald-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {diagnostic.hasError ? (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <strong className="font-bold block">{diagnostic.title}</strong>
            <span className="text-[11px] opacity-90">{diagnostic.detail}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setAmplitudeDeg(38);
              setDamping(0.05);
              setDrivingForceRatio(0);
              setTime(0);
              setIsPlaying(true);
            }}
            className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold cursor-pointer"
          >
            ✓ Oscilación Correcta
          </button>
          <button
            onClick={() => {
              setAmplitudeDeg(38);
              setDamping(0.75);
              setDrivingForceRatio(0);
              setTime(0);
              setIsPlaying(true);
            }}
            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-semibold cursor-pointer"
          >
            ✗ Se Frena (Fricción excesiva)
          </button>
          <button
            onClick={() => {
              setAmplitudeDeg(92);
              setDamping(0.02);
              setDrivingForceRatio(0.6);
              setTime(0);
              setIsPlaying(true);
            }}
            className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[10px] font-semibold cursor-pointer"
          >
            ✗ Golpea Estructura (Resonancia)
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
              <span className="text-slate-400 font-bold uppercase">Plano Cartesiano (X, Y):</span>
              <span>
                <strong className="text-emerald-400">──► v⃗_t:</strong> ({currentOscillation.vx.toFixed(1)} î, {currentOscillation.vy.toFixed(1)} ĵ) m/s
              </span>
              <span>
                <strong className="text-sky-400">──► F⃗_rest:</strong> ({currentOscillation.fx.toFixed(0)} î, {currentOscillation.fy.toFixed(0)} ĵ) N
              </span>
              <span>
                <strong className="text-rose-400">──► W⃗:</strong> (0 î, -{(mass * g).toFixed(0)} ĵ) N
              </span>
              <span className="text-amber-400">
                θ(t) = {currentOscillation.expThetaDeg.toFixed(1)}°
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-slate-400 font-mono text-[11px] shrink-0">t = {time.toFixed(1)}s</span>
              <input
                type="range"
                min="0"
                max="20"
                step="0.1"
                value={time}
                onChange={(e) => {
                  setIsPlaying(false);
                  setTime(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pausar 3D' : 'Oscilar 3D'}</span>
              </button>
              <button
                onClick={() => {
                  setTime(0);
                  setIsPlaying(true);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 p-5 space-y-4 bg-slate-900/95 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Sliders className="w-4 h-4" />
            <span>Variables de Oscilación</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300 font-medium">Amplitud Inicial (θ₀):</label>
                <span className="font-mono text-amber-400">{amplitudeDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={amplitudeDeg}
                onChange={(e) => setAmplitudeDeg(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300 font-medium">Longitud del Brazo (L):</label>
                <span className="font-mono text-sky-400">{length.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="15.0"
                step="0.5"
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300 font-medium">Amortiguamiento / Fricción (γ):</label>
                <span className="font-mono text-rose-400">{damping.toFixed(2)} s⁻¹</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.90"
                step="0.02"
                value={damping}
                onChange={(e) => {
                  setDrivingForceRatio(0);
                  setDamping(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg accent-rose-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300 font-medium">Masa del Barco + Pasajeros (m):</label>
                <span className="font-mono text-purple-400">{mass} kg</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={mass}
                onChange={(e) => setMass(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Periodo Teórico (T):</span>
              <span className="text-amber-400 font-bold">{period.toFixed(2)} s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Frecuencia (f = 1/T):</span>
              <span className="text-emerald-400">{frequency.toFixed(3)} Hz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fuerza Restauradora |F⃗_t|:</span>
              <span className="text-sky-400">{Math.abs(currentOscillation.restoringForceMag).toFixed(0)} N</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
