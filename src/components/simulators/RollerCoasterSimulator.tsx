import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Sliders,
  XCircle,
  Eye,
  Compass,
} from 'lucide-react';
import { createPassengerMesh, createCartesianAxesGroup, updateArrowVector } from './threeHelpers';

export const RollerCoasterSimulator: React.FC = () => {
  const [initialHeight, setInitialHeight] = useState<number>(46); // meters (5 to 75)
  const [loopRadius, setLoopRadius] = useState<number>(12); // meters (5 to 22)
  const [mass, setMass] = useState<number>(250); // kg (100 to 500)
  const [friction, setFriction] = useState<number>(0.02); // 0 to 0.35
  const [restraintType, setRestraintType] = useState<'harness' | 'lapbelt' | 'none'>('harness');
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showCartesian, setShowCartesian] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 1 along track

  const mountRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);
  const g = 9.81;

  // 3D world coordinate generator for parameter s in [0, 1]
  // Maps s to (x, y, z) in 3D space (1 unit = 3 meters)
  const getTrackPoint3D = (s: number, h0: number, R: number) => {
    const valleyH = 2;
    if (s <= 0.35) {
      const u = s / 0.35; // 0 to 1
      const xMeters = -36 + u * 36; // -36m to 0m
      const yMeters = valleyH + ((h0 - valleyH) * (1 + Math.cos(Math.PI * u))) / 2;
      const zMeters = 0;
      const curvatureRadius = u > 0.8 ? 22 : 80;
      return { xMeters, yMeters, zMeters, inLoop: false, curvatureRadius, pitchAngle: -Math.sin(Math.PI * u) * 0.7 };
    } else if (s <= 0.70) {
      const u = (s - 0.35) / 0.35; // 0 to 1 around 2*PI vertical loop
      const angle = u * Math.PI * 2 - Math.PI / 2; // bottom (-PI/2) -> top (+PI/2) -> bottom
      const xMeters = R * Math.cos(angle);
      const yMeters = valleyH + R + R * Math.sin(angle);
      // Slight helix offset in Z so rising and falling rails don't collide
      const zMeters = (u - 0.5) * 3.0;
      return { xMeters, yMeters, zMeters, inLoop: true, curvatureRadius: R, pitchAngle: angle + Math.PI / 2 };
    } else {
      const u = (s - 0.70) / 0.30; // 0 to 1
      const xMeters = u * 38; // 0m to +38m
      const exitHill = 14 * Math.sin(Math.PI * u);
      const yMeters = valleyH + exitHill;
      const zMeters = 1.5;
      return { xMeters, yMeters, zMeters, inLoop: false, curvatureRadius: 25, pitchAngle: Math.cos(Math.PI * u) * 0.5 };
    }
  };

  // Diagnose physical errors & exact failure point along the track
  const simulationAnalysis = useMemo(() => {
    const minLoopHeightIdeal = 2 + 2.5 * loopRadius;
    const minSafeHeightWithFriction = minLoopHeightIdeal + friction * 75;
    const maxSafeHeight = 2 + loopRadius * 4.6;

    let failureType: 'none' | 'stalled_friction' | 'fall_in_loop' | 'derail_overspeed' | 'passenger_ejected' = 'none';
    let failureProgress = 1.0;
    let failureTitle = 'Diseño Físicamente Correcto y Seguro';
    let failureDetail =
      'La energía potencial inicial permite superar el rizo 3D con aceleración centrípeta suficiente (v² ≥ g·R) sin descarrilar.';

    if (friction >= 0.22 || initialHeight <= 8) {
      failureType = 'stalled_friction';
      failureProgress = Math.max(0.26, Math.min(0.44, (initialHeight / 45) * (1 - friction * 2.2)));
      failureTitle = 'ERROR CRÍTICO: El carrito se detiene y no avanza (Fricción excesiva / Altura insuficiente)';
      failureDetail = `Con h₀ = ${initialHeight} m y fricción μ = ${friction.toFixed(2)}, la energía mecánica se disipa en calor antes de subir el rizo 3D.`;
    } else if (initialHeight < minSafeHeightWithFriction) {
      failureType = 'fall_in_loop';
      failureProgress = 0.51;
      failureTitle = 'ERROR DE DISEÑO: Caída libre en el rizo 3D (Energía insuficiente: v_cima < √(g·R))';
      failureDetail = `Dato incorrecto: Para un rizo de R = ${loopRadius} m con μ = ${friction.toFixed(2)}, se requiere mínimo h₀ ≥ ${minSafeHeightWithFriction.toFixed(1)} m. El carrito se despega del riel y cae.`;
    } else if (initialHeight > maxSafeHeight) {
      failureType = 'derail_overspeed';
      failureProgress = 0.82;
      failureTitle = 'ERROR DE DISEÑO: ¡El carrito se sale del carril 3D por exceso de velocidad!';
      failureDetail = `Dato peligroso: La altura h₀ = ${initialHeight} m es excesiva para un rizo de R = ${loopRadius} m. El carrito sale disparado fuera de la vía.`;
    } else if (restraintType !== 'harness') {
      failureType = 'passenger_ejected';
      failureProgress = 0.52;
      failureTitle = 'ERROR DE SEGURIDAD: El personaje se desprende en la inversión por falta de arnés';
      failureDetail =
        'En un rizo invertido de 360°, la falta de arnés de hombros provoca que el pasajero 3D caiga del carrito al ponerse de cabeza.';
    }

    return {
      minSafeHeightWithFriction,
      maxSafeHeight,
      failureType,
      failureProgress,
      failureTitle,
      failureDetail,
      hasError: failureType !== 'none',
    };
  }, [initialHeight, loopRadius, friction, restraintType]);

  // Instantaneous 3D Physics & Cartesian Vectors (Vx, Vy, Ac_x, Ac_y, Fg)
  const currentPhysics = useMemo(() => {
    const isFailedNow = simulationAnalysis.hasError && progress >= simulationAnalysis.failureProgress;
    const effectiveProgress = isFailedNow ? simulationAnalysis.failureProgress : progress;

    const pt = getTrackPoint3D(effectiveProgress, initialHeight, loopRadius);
    const ptNext = getTrackPoint3D(Math.min(1, effectiveProgress + 0.01), initialHeight, loopRadius);

    const totalEnergy = mass * g * initialHeight;
    const workFriction = friction * mass * g * (effectiveProgress * 140);
    const potentialEnergy = mass * g * pt.yMeters;
    const kineticEnergy = Math.max(0, totalEnergy - potentialEnergy - workFriction);
    const velocity =
      isFailedNow && simulationAnalysis.failureType === 'stalled_friction'
        ? 0
        : Math.sqrt((2 * kineticEnergy) / mass);
    const centripetalAcc = pt.inLoop
      ? (velocity * velocity) / loopRadius
      : (velocity * velocity) / pt.curvatureRadius;
    const gForce = 1 + centripetalAcc / g;
    const loopTopSpeedMin = Math.sqrt(g * loopRadius);

    // Tangent unit vector in Cartesian XY
    const dx = ptNext.xMeters - pt.xMeters;
    const dy = ptNext.yMeters - pt.yMeters;
    const dz = ptNext.zMeters - pt.zMeters;
    const mag = Math.hypot(dx, dy, dz) || 1;
    const tx = dx / mag;
    const ty = dy / mag;
    const tz = dz / mag;

    // Velocity Cartesian components (m/s)
    const vx = velocity * tx;
    const vy = velocity * ty;

    // Centripetal normal vector pointing toward center of loop
    let nx = -ty;
    let ny = tx;
    if (pt.inLoop) {
      const cx = 0;
      const cy = 2 + loopRadius;
      const toCenterLen = Math.hypot(cx - pt.xMeters, cy - pt.yMeters) || 1;
      nx = (cx - pt.xMeters) / toCenterLen;
      ny = (cy - pt.yMeters) / toCenterLen;
    }

    // Actual 3D position of cart (including falling or flying off track!)
    let cartX = pt.xMeters;
    let cartY = pt.yMeters;
    let cartZ = pt.zMeters;
    let passengerDropY = 0;

    if (isFailedNow) {
      const over = progress - simulationAnalysis.failureProgress;
      if (simulationAnalysis.failureType === 'fall_in_loop') {
        cartY = Math.max(1.2, pt.yMeters - over * 140);
      } else if (simulationAnalysis.failureType === 'derail_overspeed') {
        cartX = pt.xMeters + over * 95;
        cartY = pt.yMeters + over * 85;
        cartZ = pt.zMeters + over * 35;
      } else if (simulationAnalysis.failureType === 'passenger_ejected') {
        passengerDropY = -over * 95;
      }
    }

    return {
      ...pt,
      cartX,
      cartY,
      cartZ,
      passengerDropY,
      tx,
      ty,
      tz,
      nx,
      ny,
      vx,
      vy,
      totalEnergy,
      potentialEnergy,
      kineticEnergy,
      thermalEnergy: Math.min(totalEnergy, Math.max(0, workFriction)),
      velocity,
      centripetalAcc,
      gForce,
      loopTopSpeedMin,
      isFailedNow,
    };
  }, [progress, initialHeight, loopRadius, mass, friction, simulationAnalysis]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      setProgress((prev) => {
        const maxStop = simulationAnalysis.hasError
          ? Math.min(1, simulationAnalysis.failureProgress + 0.16)
          : 1;
        const vFactor = Math.max(0.14, currentPhysics.velocity / 30);
        const next = prev + dt * 0.2 * vFactor;
        if (next >= maxStop) {
          setIsPlaying(false);
          return maxStop;
        }
        return next;
      });

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, currentPhysics.velocity, simulationAnalysis]);

  // Three.js Scene Setup & Real-Time Update Refs
  const sceneRefs = useRef<{
    cartGroup?: THREE.Group;
    passengerGroup?: THREE.Group;
    velArrow?: THREE.ArrowHelper;
    accArrow?: THREE.ArrowHelper;
    gravArrow?: THREE.ArrowHelper;
    cartesianGroup?: THREE.Group;
    trackMesh?: THREE.Mesh;
    pillarDrop?: THREE.Mesh;
    pillarLoop?: THREE.Mesh;
    scene?: THREE.Scene;
  }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(46, container.clientWidth / container.clientHeight, 0.1, 500);
    camera.position.set(0, 9, 32);
    camera.lookAt(0, 7, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting & 3D Sun Sphere
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.3);
    dirLight.position.set(16, 28, 18);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    sunMesh.position.set(15, 22, -12);
    scene.add(sunMesh);

    // Ground platform
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 30),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Cartesian Axes Group
    const cartesianGroup = createCartesianAxesGroup(14);
    scene.add(cartesianGroup);

    // Support Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.5 });
    const pillarDrop = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1, 12), pillarMat);
    const pillarLoop = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1, 12), pillarMat);
    scene.add(pillarDrop, pillarLoop);

    // 3D Roller Coaster Cart + Recognizable 3D Passenger Figure
    const cartGroup = new THREE.Group();
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.65, 1.05),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.3, metalness: 0.2 })
    );
    chassis.position.y = 0.35;
    chassis.castShadow = true;
    cartGroup.add(chassis);

    // 4 Wheels on the Cart
    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 16);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.6 });
    [
      [-0.5, 0.15, 0.55],
      [0.5, 0.15, 0.55],
      [-0.5, 0.15, -0.55],
      [0.5, 0.15, -0.55],
    ].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, wy, wz);
      cartGroup.add(w);
    });

    const passengerGroup = createPassengerMesh(0x38bdf8, true);
    passengerGroup.position.set(0, 0.5, 0);
    cartGroup.add(passengerGroup);
    scene.add(cartGroup);

    // 3D Physics Vector Arrows (Velocity = Green, Centripetal Acc = Cyan, Gravity = Rose)
    const velArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 2, 0x10b981);
    const accArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 2, 0x38bdf8);
    const gravArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), 2, 0xf43f5e);
    scene.add(velArrow, accArrow, gravArrow);

    sceneRefs.current = {
      cartGroup,
      passengerGroup,
      velArrow,
      accArrow,
      gravArrow,
      cartesianGroup,
      pillarDrop,
      pillarLoop,
      scene,
    };

    // Simple mouse drag orbit rotation
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let camTheta = 0.15;
    let camPhi = 0.28;
    let camDist = 31;

    const updateCam = () => {
      camera.position.x = camDist * Math.sin(camTheta) * Math.cos(camPhi);
      camera.position.y = Math.max(2, camDist * Math.sin(camPhi) + 4);
      camera.position.z = camDist * Math.cos(camTheta) * Math.cos(camPhi);
      camera.lookAt(0, 6.5, 0);
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
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camDist = Math.max(14, Math.min(50, camDist + e.deltaY * 0.02));
      updateCam();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

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
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Rebuild 3D Tubular Track whenever initialHeight or loopRadius changes
  useEffect(() => {
    const { scene, trackMesh, pillarDrop, pillarLoop } = sceneRefs.current;
    if (!scene) return;

    if (trackMesh) {
      scene.remove(trackMesh);
      trackMesh.geometry.dispose();
    }

    const scale = 1 / 3; // 3 meters = 1 Three.js unit
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const p = getTrackPoint3D(i / 120, initialHeight, loopRadius);
      pts.push(new THREE.Vector3(p.xMeters * scale, p.yMeters * scale, p.zMeters * scale));
    }

    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeGeometry(curve, 120, 0.16, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: simulationAnalysis.hasError ? 0xf43f5e : 0xf59e0b,
      metalness: 0.4,
      roughness: 0.3,
    });
    const newTrack = new THREE.Mesh(tubeGeo, tubeMat);
    newTrack.castShadow = true;
    scene.add(newTrack);
    sceneRefs.current.trackMesh = newTrack;

    // Update Support Pillars height
    if (pillarDrop && pillarLoop) {
      const dropH = initialHeight * scale;
      pillarDrop.scale.set(1, dropH, 1);
      pillarDrop.position.set(-36 * scale, dropH / 2, 0);

      const loopTopH = (2 + loopRadius * 2) * scale;
      pillarLoop.scale.set(1, loopTopH, 1);
      pillarLoop.position.set(0, loopTopH / 2, 0);
    }
  }, [initialHeight, loopRadius, simulationAnalysis.hasError]);

  // Update 3D Cart, Passenger, and Cartesian Vector Arrows every frame
  useEffect(() => {
    const { cartGroup, passengerGroup, velArrow, accArrow, gravArrow, cartesianGroup } = sceneRefs.current;
    if (!cartGroup || !velArrow || !accArrow || !gravArrow) return;

    const scale = 1 / 3;
    const pos = new THREE.Vector3(
      currentPhysics.cartX * scale,
      currentPhysics.cartY * scale,
      currentPhysics.cartZ * scale
    );
    cartGroup.position.copy(pos);
    cartGroup.rotation.z = currentPhysics.pitchAngle;

    if (passengerGroup) {
      passengerGroup.position.y = 0.5 + currentPhysics.passengerDropY * scale;
    }

    if (cartesianGroup) {
      cartesianGroup.visible = showCartesian;
    }

    if (showVectors) {
      const origin = pos.clone().add(new THREE.Vector3(0, 0.7, 0));
      updateArrowVector(
        velArrow,
        origin,
        new THREE.Vector3(currentPhysics.vx, currentPhysics.vy, 0),
        0.14
      );
      updateArrowVector(
        accArrow,
        origin,
        new THREE.Vector3(
          currentPhysics.nx * currentPhysics.centripetalAcc,
          currentPhysics.ny * currentPhysics.centripetalAcc,
          0
        ),
        0.06
      );
      updateArrowVector(gravArrow, origin, new THREE.Vector3(0, -g, 0), 0.22);
    } else {
      velArrow.visible = false;
      accArrow.visible = false;
      gravArrow.visible = false;
    }
  }, [currentPhysics, showVectors, showCartesian]);

  const kPct = Math.min(100, (currentPhysics.kineticEnergy / Math.max(1, currentPhysics.totalEnergy)) * 100);
  const uPct = Math.min(100, (currentPhysics.potentialEnergy / Math.max(1, currentPhysics.totalEnergy)) * 100);
  const thPct = Math.min(100, (currentPhysics.thermalEnergy / Math.max(1, currentPhysics.totalEnergy)) * 100);

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Top Bar */}
      <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              simulationAnalysis.hasError ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span className="font-bold text-white font-display">
            Simulador 3D Equipo 1: La Montaña Rusa (Carril 3D, Carrito con Pasajero y Vectores Cartesianos)
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

      {/* Live Error / Validation Banner */}
      <div
        className={`px-5 py-2.5 border-b text-xs flex flex-wrap items-center justify-between gap-2 ${
          simulationAnalysis.hasError
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : 'bg-emerald-950/40 border-slate-800 text-emerald-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {simulationAnalysis.hasError ? (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <strong className="font-bold block">{simulationAnalysis.failureTitle}</strong>
            <span className="text-[11px] opacity-90">{simulationAnalysis.failureDetail}</span>
          </div>
        </div>

        {/* Preset Quick-Test Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setInitialHeight(48);
              setLoopRadius(12);
              setFriction(0.02);
              setRestraintType('harness');
              setProgress(0);
              setIsPlaying(true);
            }}
            className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold cursor-pointer"
          >
            ✓ Diseño Correcto
          </button>
          <button
            onClick={() => {
              setInitialHeight(18);
              setLoopRadius(14);
              setFriction(0.04);
              setProgress(0);
              setIsPlaying(true);
            }}
            className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[10px] font-semibold cursor-pointer"
          >
            ✗ Caída en el Rizo (h₀ baja)
          </button>
          <button
            onClick={() => {
              setInitialHeight(28);
              setLoopRadius(12);
              setFriction(0.28);
              setProgress(0);
              setIsPlaying(true);
            }}
            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-semibold cursor-pointer"
          >
            ✗ No Avanza (Fricción alta)
          </button>
          <button
            onClick={() => {
              setInitialHeight(72);
              setLoopRadius(9);
              setFriction(0.0);
              setProgress(0);
              setIsPlaying(true);
            }}
            className="px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[10px] font-semibold cursor-pointer"
          >
            ✗ Sale del Carril (Exceso vel.)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 3D WebGL Viewport & Cartesian Vector Readout (8 cols) */}
        <div className="lg:col-span-8 p-4 flex flex-col justify-between bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-slate-800 space-y-4">
          {/* Pure Unobstructed 3D Viewport */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
            <div ref={mountRef} className="w-full h-[360px] cursor-grab active:cursor-grabbing" />
          </div>

          {/* Dedicated Cartesian Vector & Status Strip BELOW the 3D Viewport (Nothing covers the 3D figures) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-[11px] font-mono flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-slate-400 font-bold uppercase">Plano Cartesiano 3D:</span>
              <span>
                <strong className="text-emerald-400">──► v⃗:</strong> ({currentPhysics.vx.toFixed(1)} î, {currentPhysics.vy.toFixed(1)} ĵ) m/s
              </span>
              <span>
                <strong className="text-sky-400">──► a⃗_c:</strong> {currentPhysics.centripetalAcc.toFixed(1)} m/s²
              </span>
              <span>
                <strong className="text-rose-400">──► F⃗_g:</strong> (0 î, -{(mass * g).toFixed(0)} ĵ) N
              </span>
              <span className="text-slate-400">
                (x, y): ({currentPhysics.cartX.toFixed(1)}m, {currentPhysics.cartY.toFixed(1)}m)
              </span>
            </div>

            {currentPhysics.isFailedNow && (
              <span className="bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded">
                {simulationAnalysis.failureType === 'stalled_friction'
                  ? '¡DETENIDO POR FRICCIÓN!'
                  : simulationAnalysis.failureType === 'fall_in_loop'
                  ? '¡CAÍDA LIBRE EN EL RIZO!'
                  : simulationAnalysis.failureType === 'derail_overspeed'
                  ? '¡FUERA DEL CARRIL!'
                  : '¡PASAJERO SIN ARNÉS!'}
              </span>
            )}
          </div>

          {/* Energy Conservation Bars & Playback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-slate-300 block text-[11px] uppercase font-mono">
                Conservación de la Energía (kJ)
              </span>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-emerald-400">Cinética (Ec = ½mv²)</span>
                    <span className="font-mono">{(currentPhysics.kineticEnergy / 1000).toFixed(1)} kJ</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${kPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-sky-400">Potencial (Ep = mgh)</span>
                    <span className="font-mono">{(currentPhysics.potentialEnergy / 1000).toFixed(1)} kJ</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                    <div className="h-full bg-sky-500 transition-all" style={{ width: `${uPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-rose-400">Térmica / Fricción</span>
                    <span className="font-mono">{(currentPhysics.thermalEnergy / 1000).toFixed(1)} kJ</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                    <div className="h-full bg-rose-500 transition-all" style={{ width: `${thPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Posición en el carril 3D:</span>
                  <span className="font-mono text-white">{(progress * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.005"
                  value={progress}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setProgress(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (progress >= 0.98 || currentPhysics.isFailedNow) setProgress(0);
                    setIsPlaying(!isPlaying);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pausar' : 'Lanzar Carrito 3D'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setProgress(0);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Controls Deck (4 cols) */}
        <div className="lg:col-span-4 p-5 space-y-4 bg-slate-900/95 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Sliders className="w-4 h-4" />
            <span>Variables de Diseño y Vectores</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1 items-center">
                <label className="text-slate-300 font-medium">Altura Inicial (h₀):</label>
                <span className="font-mono text-amber-400">{initialHeight} m</span>
              </div>
              <input
                type="range"
                min="5"
                max="75"
                step="1"
                value={initialHeight}
                onChange={(e) => {
                  setProgress(0);
                  setInitialHeight(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 items-center">
                <label className="text-slate-300 font-medium">Radio del Rizo (R):</label>
                <span className="font-mono text-sky-400">{loopRadius} m</span>
              </div>
              <input
                type="range"
                min="5"
                max="22"
                step="0.5"
                value={loopRadius}
                onChange={(e) => {
                  setProgress(0);
                  setLoopRadius(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300 font-medium">Fricción en Riel (μ):</label>
                <span className="font-mono text-rose-400">{friction.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.32"
                step="0.01"
                value={friction}
                onChange={(e) => {
                  setProgress(0);
                  setFriction(parseFloat(e.target.value));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg accent-rose-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300 font-medium">Masa del Carrito (m):</label>
                <span className="font-mono text-emerald-400">{mass} kg</span>
              </div>
              <input
                type="range"
                min="100"
                max="500"
                step="10"
                value={mass}
                onChange={(e) => setMass(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Safety Restraint System */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="font-bold text-slate-300 block">Sistema de Sujeción del Personaje 3D:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'harness', label: 'Arnés Hombros' },
                { id: 'lapbelt', label: 'Cinturón' },
                { id: 'none', label: 'Sin Sujeción' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setProgress(0);
                    setRestraintType(item.id as any);
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium border text-[11px] transition cursor-pointer ${
                    restraintType === item.id
                      ? item.id === 'harness'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cartesian Vector Table */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <div className="text-slate-400 font-bold uppercase text-[10px]">
              Componentes en el Plano Cartesiano (X, Y):
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-400">v⃗ = (v_x, v_y):</span>
              <span className="text-white">
                ({currentPhysics.vx.toFixed(1)}, {currentPhysics.vy.toFixed(1)}) m/s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-400">a⃗_c = (a_x, a_y):</span>
              <span className="text-white">
                ({(currentPhysics.nx * currentPhysics.centripetalAcc).toFixed(1)},{' '}
                {(currentPhysics.ny * currentPhysics.centripetalAcc).toFixed(1)}) m/s²
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-400">Rango seguro h₀:</span>
              <span className="text-emerald-400">
                {simulationAnalysis.minSafeHeightWithFriction.toFixed(1)}m – {simulationAnalysis.maxSafeHeight.toFixed(1)}m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
