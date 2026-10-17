import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Eye,
  Compass,
} from 'lucide-react';
import { createPassengerMesh, createCartesianAxesGroup, updateArrowVector } from './threeHelpers';

export const BumperCarsSimulator: React.FC = () => {
  const [m1, setM1] = useState<number>(180);
  const [v1i, setV1i] = useState<number>(6.0);
  const [m2, setM2] = useState<number>(180);
  const [v2i, setV2i] = useState<number>(-4.0);
  const [restitution, setRestitution] = useState<number>(0.85);
  const [restraint, setRestraint] = useState<'none' | 'seatbelt' | 'childseat'>('seatbelt');
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showCartesian, setShowCartesian] = useState<boolean>(true);

  const [simTime, setSimTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);
  const collisionTime = 1.8;

  const collisionPhysics = useMemo(() => {
    const p1i = m1 * v1i;
    const p2i = m2 * v2i;
    const pTotal = p1i + p2i;

    const willCollide = v1i > v2i && !(v1i === 0 && v2i === 0);
    const isZeroMotion = v1i === 0 && v2i === 0;

    const v1f = willCollide
      ? (m1 * v1i + m2 * v2i - m2 * restitution * (v1i - v2i)) / (m1 + m2)
      : v1i;
    const v2f = willCollide
      ? (m1 * v1i + m2 * v2i + m1 * restitution * (v1i - v2i)) / (m1 + m2)
      : v2i;

    const p1f = m1 * v1f;
    const p2f = m2 * v2f;
    const impulseOn1 = willCollide ? p1f - p1i : 0;
    const impulseOn2 = willCollide ? p2f - p2i : 0;
    const impulseMag = Math.abs(impulseOn1);

    const passengerMass = restraint === 'childseat' ? 22 : 65;
    const deltaVPassenger = willCollide ? Math.abs(v1f - v1i) : 0;
    const passengerImpulse = passengerMass * deltaVPassenger;

    const dtPassenger = restraint === 'none' ? 0.035 : restraint === 'seatbelt' ? 0.14 : 0.18;
    const peakForcePassenger = willCollide ? (passengerImpulse / dtPassenger) * 1.5 : 0;

    let errorType: 'none' | 'no_motion' | 'no_collision' | 'bad_crash' = 'none';
    let errorTitle = 'Colisión 3D Controlada y Conservación de Momentum Verificada';
    let errorDetail = `Los carritos 3D colisionan en t = 1.8 s conservando p_total = (${pTotal.toFixed(0)} î) kg·m/s.`;

    if (isZeroMotion) {
      errorType = 'no_motion';
      errorTitle = 'ERROR DE DATOS: Los carritos 3D no avanzan (v₁ᵢ = 0 m/s y v₂ᵢ = 0 m/s)';
      errorDetail = 'Ambos vehículos tienen velocidad inicial cero en el eje X; no existe momentum ni colisión.';
    } else if (!willCollide) {
      errorType = 'no_collision';
      errorTitle = `ERROR DE TRAYECTORIA: ¡No chocan en 3D! (v₁ᵢ = ${v1i.toFixed(1)} m/s ≤ v₂ᵢ = ${v2i.toFixed(1)} m/s)`;
      errorDetail =
        'Dato mal configurado: El Carrito 1 (izquierda) es más lento o se aleja del Carrito 2 (derecha). Los vehículos se separan sin tocarse.';
    } else if (restraint === 'none' || peakForcePassenger > 9000) {
      errorType = 'bad_crash';
      errorTitle = `¡CHOQUE PELIGROSO / SIN SUJECIÓN! Fuerza pico = ${(peakForcePassenger / 1000).toFixed(2)} kN`;
      errorDetail =
        restraint === 'none'
          ? 'Sin cinturón de seguridad, el tiempo de frenado Δt es de apenas 35 ms y el personaje 3D sale proyectado hacia adelante por inercia.'
          : 'Velocidad relativa de impacto excesiva sobre los ocupantes.';
    }

    return {
      p1i,
      p2i,
      pTotal,
      v1f,
      v2f,
      p1f,
      p2f,
      impulseOn1,
      impulseOn2,
      impulseMag,
      dtPassenger,
      peakForcePassenger,
      willCollide,
      errorType,
      errorTitle,
      errorDetail,
      hasError: errorType !== 'none',
    };
  }, [m1, v1i, m2, v2i, restitution, restraint]);

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setSimTime((prev) => {
        const next = prev + dt;
        if (next >= 3.6) {
          setIsPlaying(false);
          return 3.6;
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

  const carState3D = useMemo(() => {
    const scale = 0.45;
    if (!collisionPhysics.willCollide) {
      const x1 = Math.max(-9, Math.min(9, -3.5 + v1i * simTime * scale));
      const x2 = Math.max(-9, Math.min(9, 3.5 + v2i * simTime * scale));
      return { x1, x2, v1Now: v1i, v2Now: v2i, collided: false, passengerThrowX: 0, passengerThrowY: 0 };
    }

    if (simTime <= collisionTime) {
      const dt = simTime - collisionTime;
      const x1 = -0.95 + v1i * dt * scale;
      const x2 = 0.95 + v2i * dt * scale;
      return { x1, x2, v1Now: v1i, v2Now: v2i, collided: false, passengerThrowX: 0, passengerThrowY: 0 };
    } else {
      const dt = simTime - collisionTime;
      const x1 = -0.95 + collisionPhysics.v1f * dt * scale;
      const x2 = 0.95 + collisionPhysics.v2f * dt * scale;
      const passengerThrowX =
        restraint === 'none' ? Math.min(2.2, dt * 4.5) : Math.sin(Math.min(Math.PI, dt * 8)) * 0.2;
      const passengerThrowY = restraint === 'none' ? Math.sin(Math.min(Math.PI, dt * 3.5)) * 0.85 : 0;
      return {
        x1,
        x2,
        v1Now: collisionPhysics.v1f,
        v2Now: collisionPhysics.v2f,
        collided: true,
        passengerThrowX,
        passengerThrowY,
      };
    }
  }, [simTime, v1i, v2i, collisionPhysics, restraint]);

  const sceneRefs = useRef<{
    car1Group?: THREE.Group;
    car2Group?: THREE.Group;
    passenger1?: THREE.Group;
    v1Arrow?: THREE.ArrowHelper;
    v2Arrow?: THREE.ArrowHelper;
    j1Arrow?: THREE.ArrowHelper;
    j2Arrow?: THREE.ArrowHelper;
    cartesianGroup?: THREE.Group;
  }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 300);
    camera.position.set(0, 4.8, 12.5);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.3);
    sunLight.position.set(8, 16, 10);
    scene.add(sunLight);

    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    sunMesh.position.set(9, 10, -8);
    scene.add(sunMesh);

    const cartesianGroup = createCartesianAxesGroup(8);
    scene.add(cartesianGroup);

    // Arena Track Rail in 3D
    const trackRail = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.15, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    trackRail.position.y = 0.08;
    scene.add(trackRail);

    // Helper to build a 3D Bumper Car with Rubber Bumper Ring, Wheels & Passenger
    const buildBumperCar = (bodyColor: number, shirtColor: number) => {
      const car = new THREE.Group();

      // Rubber bumper torus
      const bumper = new THREE.Mesh(
        new THREE.BoxGeometry(1.75, 0.32, 1.15),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
      );
      bumper.position.y = 0.3;
      car.add(bumper);

      // Colored body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.5, 0.95),
        new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.3, metalness: 0.2 })
      );
      body.position.y = 0.55;
      car.add(body);

      const person = createPassengerMesh(shirtColor, true);
      person.position.set(0, 0.65, 0);
      car.add(person);

      return { car, person };
    };

    const { car: car1Group, person: passenger1 } = buildBumperCar(0x0284c7, 0xfde047);
    const { car: car2Group } = buildBumperCar(0xe11d48, 0x38bdf8);
    scene.add(car1Group, car2Group);

    // 3D Vector Arrows (Velocity/Momentum p1 = Cyan, p2 = Rose, Impulse J = Yellow)
    const v1Arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 2, 0x38bdf8);
    const v2Arrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), 2, 0xf43f5e);
    const j1Arrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), 2, 0xfbbf24);
    const j2Arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 2, 0xfbbf24);
    scene.add(v1Arrow, v2Arrow, j1Arrow, j2Arrow);

    sceneRefs.current = {
      car1Group,
      car2Group,
      passenger1,
      v1Arrow,
      v2Arrow,
      j1Arrow,
      j2Arrow,
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
    const { car1Group, car2Group, passenger1, v1Arrow, v2Arrow, j1Arrow, j2Arrow, cartesianGroup } =
      sceneRefs.current;
    if (!car1Group || !car2Group || !passenger1 || !v1Arrow || !v2Arrow || !j1Arrow || !j2Arrow) return;

    car1Group.position.set(carState3D.x1, 0, 0);
    car2Group.position.set(carState3D.x2, 0, 0);

    passenger1.position.set(carState3D.passengerThrowX, 0.65 + carState3D.passengerThrowY, 0);

    if (cartesianGroup) cartesianGroup.visible = showCartesian;

    if (showVectors) {
      updateArrowVector(
        v1Arrow,
        new THREE.Vector3(carState3D.x1, 1.55, 0),
        new THREE.Vector3(carState3D.v1Now, 0, 0),
        0.32
      );
      updateArrowVector(
        v2Arrow,
        new THREE.Vector3(carState3D.x2, 1.55, 0),
        new THREE.Vector3(carState3D.v2Now, 0, 0),
        0.32
      );

      const nearImpact = collisionPhysics.willCollide && Math.abs(simTime - collisionTime) < 0.35;
      if (nearImpact) {
        updateArrowVector(
          j1Arrow,
          new THREE.Vector3(carState3D.x1, 2.1, 0),
          new THREE.Vector3(collisionPhysics.impulseOn1, 0, 0),
          0.0012
        );
        updateArrowVector(
          j2Arrow,
          new THREE.Vector3(carState3D.x2, 2.1, 0),
          new THREE.Vector3(collisionPhysics.impulseOn2, 0, 0),
          0.0012
        );
      } else {
        j1Arrow.visible = false;
        j2Arrow.visible = false;
      }
    } else {
      v1Arrow.visible = false;
      v2Arrow.visible = false;
      j1Arrow.visible = false;
      j2Arrow.visible = false;
    }
  }, [carState3D, collisionPhysics, simTime, showVectors, showCartesian]);

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              collisionPhysics.hasError ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span className="font-bold text-white font-display">
            Simulador 3D Equipo 5: Carritos Chocones (Carritos 3D con Pasajeros y Vectores en Plano Cartesiano)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer flex items-center gap-1 ${
              showVectors
                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Vectores v⃗, p⃗, J⃗</span>
          </button>
          <button
            onClick={() => setShowCartesian(!showCartesian)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer flex items-center gap-1 ${
              showCartesian
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
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
          collisionPhysics.hasError
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : 'bg-emerald-950/40 border-slate-800 text-emerald-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {collisionPhysics.hasError ? (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <strong className="font-bold block">{collisionPhysics.errorTitle}</strong>
            <span className="text-[11px] opacity-90">{collisionPhysics.errorDetail}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setM1(180);
              setV1i(6.0);
              setM2(180);
              setV2i(-4.0);
              setRestraint('seatbelt');
              setSimTime(0);
              setIsPlaying(true);
            }}
            className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold cursor-pointer"
          >
            ✓ Colisión Correcta
          </button>
          <button
            onClick={() => {
              setV1i(-3.0);
              setV2i(4.0);
              setSimTime(0);
              setIsPlaying(true);
            }}
            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-semibold cursor-pointer"
          >
            ✗ No Chocan (Se alejan)
          </button>
          <button
            onClick={() => {
              setV1i(0);
              setV2i(0);
              setSimTime(0);
              setIsPlaying(false);
            }}
            className="px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[10px] font-semibold cursor-pointer"
          >
            ✗ No Avanza (v = 0)
          </button>
          <button
            onClick={() => {
              setV1i(11.0);
              setV2i(-9.0);
              setRestraint('none');
              setSimTime(0);
              setIsPlaying(true);
            }}
            className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[10px] font-semibold cursor-pointer"
          >
            ✗ Choque Mal / Sin Cinturón
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 p-4 bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-4">
          {/* Pure Unobstructed 3D Viewport */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
            <div ref={mountRef} className="w-full h-[350px]" />
          </div>

          {/* Dedicated Cartesian Vector Strip BELOW the 3D Viewport (Nothing covers the 3D figures) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-[11px] font-mono flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-slate-400 font-bold uppercase">Eje Cartesiano X (î):</span>
              <span>
                <strong className="text-sky-400">──► p⃗₁ (Azul):</strong> ({(m1 * carState3D.v1Now).toFixed(0)} î, 0 ĵ) kg·m/s
              </span>
              <span>
                <strong className="text-rose-400">──► p⃗₂ (Rojo):</strong> ({(m2 * carState3D.v2Now).toFixed(0)} î, 0 ĵ) kg·m/s
              </span>
              <span>
                <strong className="text-amber-400">──► J⃗₁ (Impulso):</strong> ({collisionPhysics.impulseOn1.toFixed(0)} î) N·s
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Data-Logging: Fuerza de Impacto en Pasajero 3D
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">¿Ocurre colisión?:</span>
                  <span className={collisionPhysics.willCollide ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {collisionPhysics.willCollide ? 'SÍ (v₁ᵢ > v₂ᵢ)' : 'NO (No se alcanzan)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fuerza pico sobre pasajero:</span>
                  <span className={restraint === 'none' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {(collisionPhysics.peakForcePassenger / 1000).toFixed(2)} kN
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">v⃗₁f / v⃗₂f (Eje X):</span>
                  <span className="text-white">
                    ({collisionPhysics.v1f.toFixed(2)} î) | ({collisionPhysics.v2f.toFixed(2)} î) m/s
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                {!collisionPhysics.willCollide ? (
                  <span className="text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    Los vectores de velocidad hacen que los carritos se alejen sin chocar.
                  </span>
                ) : restraint === 'none' ? (
                  <span className="text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    Sin cinturón: el personaje 3D sale proyectado fuera del asiento.
                  </span>
                ) : (
                  <span className="text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    Con sujeción: el personaje 3D permanece protegido durante el impulso.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (simTime >= 3.5) setSimTime(0);
                    setIsPlaying(!isPlaying);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pausar 3D' : 'Simular Colisión 3D'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setSimTime(0);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 p-5 space-y-4 bg-slate-900/95 text-xs">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <Sliders className="w-4 h-4" />
            <span>Parámetros de Colisión y Seguridad</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between mb-0.5">
                <label className="text-slate-300">Masa Carrito 1 (m₁):</label>
                <span className="font-mono text-sky-400">{m1} kg</span>
              </div>
              <input
                type="range"
                min="80"
                max="350"
                step="10"
                value={m1}
                onChange={(e) => setM1(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <label className="text-slate-300">Velocidad Inicial 1 (v⃗₁ᵢ en X):</label>
                <span className="font-mono text-sky-400">
                  ({v1i >= 0 ? `+${v1i.toFixed(1)}` : v1i.toFixed(1)} î) m/s
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="12"
                step="0.5"
                value={v1i}
                onChange={(e) => {
                  setSimTime(0);
                  setV1i(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <label className="text-slate-300">Masa Carrito 2 (m₂):</label>
                <span className="font-mono text-rose-400">{m2} kg</span>
              </div>
              <input
                type="range"
                min="80"
                max="350"
                step="10"
                value={m2}
                onChange={(e) => setM2(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-rose-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <label className="text-slate-300">Velocidad Inicial 2 (v⃗₂ᵢ en X):</label>
                <span className="font-mono text-rose-400">
                  ({v2i >= 0 ? `+${v2i.toFixed(1)}` : v2i.toFixed(1)} î) m/s
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="6"
                step="0.5"
                value={v2i}
                onChange={(e) => {
                  setSimTime(0);
                  setV2i(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg accent-rose-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <label className="text-slate-300">Elasticidad del Choque (e):</label>
                <span className="font-mono text-amber-400">{restitution.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={restitution}
                onChange={(e) => setRestitution(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="font-bold text-slate-300 block">Sujeción del Personaje 3D:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'none', label: 'Sin Sujeción' },
                { id: 'seatbelt', label: 'Con Cinturón' },
                { id: 'childseat', label: 'Retención Infantil' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRestraint(r.id as any)}
                  className={`py-1.5 px-2 rounded-lg font-medium border text-[10px] transition cursor-pointer ${
                    restraint === r.id
                      ? r.id === 'none'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                        : 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
