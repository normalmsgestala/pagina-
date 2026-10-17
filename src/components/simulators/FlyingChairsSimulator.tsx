import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  Sliders,
  ShieldCheck,
  XCircle,
  Eye,
  Compass,
} from 'lucide-react';
import { createPassengerMesh, createCartesianAxesGroup, updateArrowVector } from './threeHelpers';

export const FlyingChairsSimulator: React.FC = () => {
  const [omega, setOmega] = useState<number>(1.8); // Angular velocity rad/s (0.0 to 4.5)
  const [topRadius, setTopRadius] = useState<number>(2.5); // Top carousel radius R0 (1.0 to 4.5 m)
  const [chainLength, setChainLength] = useState<number>(3.5); // Chain length L (2.0 to 5.5 m)
  const [chairMass, setChairMass] = useState<number>(65); // Mass m in kg (30 to 160 kg)
  const [maxCableTension] = useState<number>(2200);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showCartesian, setShowCartesian] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);
  const g = 9.81;

  // Solve equilibrium angle theta iteratively: tan(theta) = (omega^2 * (R0 + L * sin(theta))) / g
  const mechanics = useMemo(() => {
    if (omega <= 0.15) {
      const weight = chairMass * g;
      return {
        thetaRad: 0,
        thetaDeg: 0,
        effectiveRadius: topRadius,
        linearSpeed: 0,
        centripetalForce: 0,
        weight,
        tension: weight,
        tensionX: 0,
        tensionY: weight,
        currentSpeedKmh: 0,
        failureType: 'stalled_no_rotation' as const,
        failureTitle: 'ERROR: El carrusel 3D no gira ni abre ángulo (ω ≈ 0 rad/s)',
        failureDetail:
          'Dato insuficiente: Sin velocidad angular (ω = 0), la fuerza centrípeta es nula (Fc = 0 N) y las sillas con los personajes cuelgan verticalmente.',
      };
    }

    let theta = 0.2;
    for (let i = 0; i < 20; i++) {
      const rEff = topRadius + chainLength * Math.sin(theta);
      theta = Math.atan((omega * omega * rEff) / g);
    }

    const effectiveRadius = topRadius + chainLength * Math.sin(theta);
    const linearSpeed = omega * effectiveRadius;
    const centripetalForce = chairMass * omega * omega * effectiveRadius;
    const weight = chairMass * g;
    const tension = Math.sqrt(weight * weight + centripetalForce * centripetalForce);
    const thetaDeg = (theta * 180) / Math.PI;
    const currentSpeedKmh = linearSpeed * 3.6;

    let failureType: 'none' | 'stalled_no_rotation' | 'cable_snapped' | 'excessive_angle' = 'none';
    let failureTitle = 'Operación 3D Estable y Vectores en Equilibrio';
    let failureDetail = `El ángulo de apertura θ = ${thetaDeg.toFixed(1)}° y la tensión T = ${tension.toFixed(0)} N mantienen el equilibrio circular.`;

    if (tension > maxCableTension) {
      failureType = 'cable_snapped';
      failureTitle = `¡ERROR CRÍTICO! Ruptura de cadena 3D y silla fuera de órbita (T = ${tension.toFixed(0)} N > ${maxCableTension} N)`;
      failureDetail = `Dato inválido: La tensión supera la resistencia del cable (${maxCableTension} N). La silla con el personaje se desprende y sale disparada tangencialmente.`;
    } else if (thetaDeg >= 68) {
      failureType = 'excessive_angle';
      failureTitle = `¡ERROR DE DISEÑO! Inestabilidad rotacional por ángulo extremo (θ = ${thetaDeg.toFixed(1)}° > 68°)`;
      failureDetail = 'Velocidad angular excesiva: las sillas giran casi horizontalmente.';
    }

    return {
      thetaRad: theta,
      thetaDeg,
      effectiveRadius,
      linearSpeed,
      centripetalForce,
      weight,
      tension,
      tensionX: -centripetalForce, // points inward (-X in local radial frame)
      tensionY: weight, // points upward (+Y balances weight)
      currentSpeedKmh,
      failureType,
      failureTitle,
      failureDetail,
    };
  }, [omega, topRadius, chainLength, chairMass, maxCableTension]);

  const hasError = mechanics.failureType !== 'none';
  const isSnapped = mechanics.failureType === 'cable_snapped';

  useEffect(() => {
    if (!isPlaying || mechanics.failureType === 'stalled_no_rotation') {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setRotationAngle((prev) => (prev + omega * dt) % (Math.PI * 2));
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, omega, mechanics.failureType]);

  // Three.js Scene Setup
  const sceneRefs = useRef<{
    canopyGroup?: THREE.Group;
    chairs?: {
      anchor: THREE.Vector3;
      cableLine: THREE.Line;
      seatGroup: THREE.Group;
      baseAngle: number;
    }[];
    tensionArrow?: THREE.ArrowHelper;
    fcArrow?: THREE.ArrowHelper;
    weightArrow?: THREE.ArrowHelper;
    velArrow?: THREE.ArrowHelper;
    cartesianGroup?: THREE.Group;
  }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 300);
    camera.position.set(0, 7.5, 17);
    camera.lookAt(0, 4.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.3);
    sunLight.position.set(12, 22, 14);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // 3D Sun sphere
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    sunMesh.position.set(11, 14, -10);
    scene.add(sunMesh);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(16, 36),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const cartesianGroup = createCartesianAxesGroup(9);
    scene.add(cartesianGroup);

    // Central Tower Mast
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.65, 8.2, 20),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.4 })
    );
    tower.position.y = 4.1;
    scene.add(tower);

    // Rotating Top Canopy + 6 Suspended 3D Chairs with 3D Passengers
    const canopyGroup = new THREE.Group();
    canopyGroup.position.y = 8.0;
    scene.add(canopyGroup);

    const roofDisk = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 0.35, 24),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.3, roughness: 0.4 })
    );
    canopyGroup.add(roofDisk);

    const chairs: {
      anchor: THREE.Vector3;
      cableLine: THREE.Line;
      seatGroup: THREE.Group;
      baseAngle: number;
    }[] = [];

    for (let i = 0; i < 6; i++) {
      const baseAngle = (i * Math.PI * 2) / 6;
      const seatGroup = new THREE.Group();

      // Seat L-shape
      const seatBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.12, 0.65),
        new THREE.MeshStandardMaterial({ color: i === 0 ? 0xe11d48 : 0x0284c7 })
      );
      const seatBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.65, 0.65),
        new THREE.MeshStandardMaterial({ color: i === 0 ? 0xe11d48 : 0x0284c7 })
      );
      seatBack.position.set(-0.26, 0.3, 0);
      seatGroup.add(seatBase, seatBack);

      // 3D Person sitting in chair
      const person = createPassengerMesh(i === 0 ? 0xfbbf24 : 0x38bdf8, true);
      person.position.set(0, 0.08, 0);
      seatGroup.add(person);

      const cableGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -3, 0),
      ]);
      const cableLine = new THREE.Line(
        cableGeo,
        new THREE.LineBasicMaterial({ color: i === 0 ? 0xfbbf24 : 0x94a3b8 })
      );

      canopyGroup.add(cableLine, seatGroup);
      chairs.push({
        anchor: new THREE.Vector3(),
        cableLine,
        seatGroup,
        baseAngle,
      });
    }

    // 3D Vector Arrows attached to Highlighted Chair #0 (Red Chair)
    // Tension T (Yellow), Centripetal Force Tx = Fc (Cyan), Weight mg (Rose), Tangential Velocity v (Green)
    const tensionArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 2, 0xfbbf24);
    const fcArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), 2, 0x38bdf8);
    const weightArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), 2, 0xf43f5e);
    const velArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 2, 0x10b981);
    scene.add(tensionArrow, fcArrow, weightArrow, velArrow);

    sceneRefs.current = {
      canopyGroup,
      chairs,
      tensionArrow,
      fcArrow,
      weightArrow,
      velArrow,
      cartesianGroup,
    };

    // Mouse Orbit
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let camTheta = 0.25;
    let camPhi = 0.25;
    let camDist = 17.5;

    const updateCam = () => {
      camera.position.x = camDist * Math.sin(camTheta) * Math.cos(camPhi);
      camera.position.y = Math.max(2, camDist * Math.sin(camPhi) + 3.5);
      camera.position.z = camDist * Math.cos(camTheta) * Math.cos(camPhi);
      camera.lookAt(0, 4.2, 0);
    };
    updateCam();

    const onDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      camTheta -= (e.clientX - prevX) * 0.007;
      camPhi = Math.max(0.05, Math.min(1.15, camPhi + (e.clientY - prevY) * 0.006));
      prevX = e.clientX;
      prevY = e.clientY;
      updateCam();
    };
    const onUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

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
      dom.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update 3D Chairs, Chains, and 3D Vector Arrows on Cartesian Plane
  useEffect(() => {
    const { canopyGroup, chairs, tensionArrow, fcArrow, weightArrow, velArrow, cartesianGroup } =
      sceneRefs.current;
    if (!canopyGroup || !chairs || !tensionArrow || !fcArrow || !weightArrow || !velArrow) return;

    canopyGroup.rotation.y = rotationAngle;
    if (cartesianGroup) cartesianGroup.visible = showCartesian;

    const dx = chainLength * Math.sin(mechanics.thetaRad);
    const dy = chainLength * Math.cos(mechanics.thetaRad);

    chairs.forEach((ch, idx) => {
      const a = ch.baseAngle;
      const ax = topRadius * Math.cos(a);
      const az = topRadius * Math.sin(a);

      // If cable snapped on Chair #0, throw Chair #0 far out radially!
      const extraSnapDist = idx === 0 && isSnapped ? 3.5 : 0;
      const sx = (topRadius + dx + extraSnapDist) * Math.cos(a);
      const sz = (topRadius + dx + extraSnapDist) * Math.sin(a);
      const sy = idx === 0 && isSnapped ? -dy - 1.5 : -dy;

      ch.seatGroup.position.set(sx, sy, sz);
      ch.seatGroup.rotation.y = -a;
      ch.seatGroup.rotation.z = mechanics.thetaRad;

      const pts = [new THREE.Vector3(ax, 0, az), new THREE.Vector3(sx, sy, sz)];
      ch.cableLine.geometry.setFromPoints(pts);
      ch.cableLine.visible = !(idx === 0 && isSnapped);
    });

    // World position of Primary Chair #0 for 3D Vector Arrows
    const worldAngle = rotationAngle;
    const chairRadius = topRadius + dx + (isSnapped ? 3.5 : 0);
    const chairWorldPos = new THREE.Vector3(
      chairRadius * Math.cos(worldAngle),
      8.0 - dy - (isSnapped ? 1.5 : 0),
      -chairRadius * Math.sin(worldAngle)
    );

    if (showVectors) {
      // Radial unit vector pointing inward toward axis (0, y, 0)
      const radialInward = new THREE.Vector3(-Math.cos(worldAngle), 0, Math.sin(worldAngle)).normalize();
      // Tangential velocity unit vector
      const tangentDir = new THREE.Vector3(Math.sin(worldAngle), 0, Math.cos(worldAngle)).normalize();
      // Cable Tension vector (inward + upward)
      const tensionVec = radialInward
        .clone()
        .multiplyScalar(mechanics.centripetalForce)
        .add(new THREE.Vector3(0, mechanics.weight, 0));

      updateArrowVector(tensionArrow, chairWorldPos, tensionVec, 0.0022);
      updateArrowVector(
        fcArrow,
        chairWorldPos,
        radialInward.clone().multiplyScalar(mechanics.centripetalForce),
        0.0022
      );
      updateArrowVector(weightArrow, chairWorldPos, new THREE.Vector3(0, -mechanics.weight, 0), 0.0022);
      updateArrowVector(velArrow, chairWorldPos, tangentDir.clone().multiplyScalar(mechanics.linearSpeed), 0.22);
    } else {
      tensionArrow.visible = false;
      fcArrow.visible = false;
      weightArrow.visible = false;
      velArrow.visible = false;
    }
  }, [rotationAngle, topRadius, chainLength, mechanics, isSnapped, showVectors, showCartesian]);

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              hasError ? 'bg-rose-500 animate-ping' : 'bg-sky-400 animate-pulse'
            }`}
          />
          <span className="font-bold text-white font-display">
            Simulador 3D Equipo 2: Sillas Voladoras (Carrusel 3D, Personajes y Vectores en Plano Cartesiano)
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
            <span>Vectores T⃗, F⃗c, m·g⃗, v⃗</span>
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

      {/* Diagnostic / Error Banner */}
      <div
        className={`px-5 py-2.5 border-b text-xs flex flex-wrap items-center justify-between gap-2 ${
          hasError
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : 'bg-emerald-950/40 border-slate-800 text-emerald-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {hasError ? (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <strong className="font-bold block">{mechanics.failureTitle}</strong>
            <span className="text-[11px] opacity-90">{mechanics.failureDetail}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setOmega(1.8);
              setChairMass(65);
              setTopRadius(2.5);
              setChainLength(3.5);
              setIsPlaying(true);
            }}
            className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold cursor-pointer"
          >
            ✓ Giro Seguro
          </button>
          <button
            onClick={() => {
              setOmega(0);
              setIsPlaying(false);
            }}
            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-semibold cursor-pointer"
          >
            ✗ Sin Giro (ω = 0)
          </button>
          <button
            onClick={() => {
              setOmega(3.8);
              setChairMass(135);
              setIsPlaying(true);
            }}
            className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[10px] font-semibold cursor-pointer"
          >
            ✗ Ruptura de Cadena (Sale disparada)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 3D Viewport (8 cols) */}
        <div className="lg:col-span-8 p-4 bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-4">
          {/* Pure Unobstructed 3D Viewport */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
            <div ref={mountRef} className="w-full h-[360px] cursor-grab active:cursor-grabbing" />
          </div>

          {/* Dedicated Cartesian Vector Strip BELOW the 3D Viewport (Nothing covers the 3D figures) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-[11px] font-mono flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-slate-400 font-bold uppercase">Vectores Silla Roja:</span>
              <span>
                <strong className="text-amber-400">──► T⃗:</strong> ({mechanics.tensionX.toFixed(0)} î, +{mechanics.tensionY.toFixed(0)} ĵ) N
              </span>
              <span>
                <strong className="text-sky-400">──► F⃗_c:</strong> -{mechanics.centripetalForce.toFixed(0)} î N
              </span>
              <span>
                <strong className="text-rose-400">──► W⃗:</strong> -{mechanics.weight.toFixed(0)} ĵ N
              </span>
              <span>
                <strong className="text-emerald-400">──► v⃗_t:</strong> {mechanics.linearSpeed.toFixed(1)} k̂ m/s
              </span>
            </div>

            {isSnapped && (
              <span className="bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded">
                ¡CADENA ROTA! SILLA FUERA DE ÓRBITA
              </span>
            )}
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-300">
              <strong className="text-white">Ecuación Vectorial en el Plano Cartesiano:</strong>{' '}
              <span className="font-mono text-amber-300">
                ∑F_x = -T·sen(θ) = -m·ω²·r &nbsp;|&nbsp; ∑F_y = T·cos(θ) - m·g = 0
              </span>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pausar Giro 3D' : 'Girar Carrusel 3D'}</span>
            </button>
          </div>
        </div>

        {/* Right Controls Deck (4 cols) */}
        <div className="lg:col-span-4 p-5 space-y-4 bg-slate-900/95 text-xs">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <Sliders className="w-4 h-4" />
            <span>Variables de Movimiento Circular</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300 font-medium">Velocidad Angular (ω):</label>
                <span className="font-mono text-amber-400">{omega.toFixed(2)} rad/s</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="4.2"
                step="0.05"
                value={omega}
                onChange={(e) => setOmega(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300 font-medium">Radio Superior (R₀):</label>
                <span className="font-mono text-sky-400">{topRadius.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.5"
                step="0.1"
                value={topRadius}
                onChange={(e) => setTopRadius(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300 font-medium">Longitud de Cadena (L):</label>
                <span className="font-mono text-emerald-400">{chainLength.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="5.5"
                step="0.1"
                value={chainLength}
                onChange={(e) => setChainLength(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300 font-medium">Masa Silla + Personaje (m):</label>
                <span className="font-mono text-purple-400">{chairMass} kg</span>
              </div>
              <input
                type="range"
                min="30"
                max="160"
                step="5"
                value={chairMass}
                onChange={(e) => setChairMass(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Ángulo de apertura (θ):</span>
              <span className="text-amber-400 font-bold">{mechanics.thetaDeg.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Radio de giro (r):</span>
              <span className="text-sky-400">{mechanics.effectiveRadius.toFixed(2)} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Magnitud Tensión |T⃗|:</span>
              <span className={isSnapped ? 'text-rose-400 font-bold' : 'text-white'}>
                {mechanics.tension.toFixed(1)} N
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Componente T_x (F_c):</span>
              <span className="text-sky-400">{mechanics.tensionX.toFixed(1)} N</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Componente T_y (m·g):</span>
              <span className="text-emerald-400">+{mechanics.tensionY.toFixed(1)} N</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
