import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SundialState, CameraPreset } from '../../types/sundial';

interface SundialSceneProps {
  state: SundialState;
  onRotateHeading?: (heading: number) => void;
  cameraPreset: CameraPreset;
  onCameraPresetApplied: () => void;
}

export const SundialScene: React.FC<SundialSceneProps> = ({
  state,
  onRotateHeading,
  cameraPreset,
  onCameraPresetApplied,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Dynamic objects in scene
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const sunBeamLineRef = useRef<THREE.Line | null>(null);
  const sundialGroupRef = useRef<THREE.Group | null>(null);
  const gnomonMeshRef = useRef<THREE.Mesh | null>(null);
  const dialPlateMeshRef = useRef<THREE.Mesh | null>(null);
  const celestialArcRef = useRef<THREE.Line | null>(null);

  // Camera Orbit state
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef(new THREE.Spherical(10, Math.PI / 3, Math.PI / 4));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 1.2, 0));

  // Build texture for equatorial dial plate
  const createDialTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Background circle
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, 1024, 1024);

    // Radial gradient
    const grad = ctx.createRadialGradient(512, 512, 100, 512, 512, 500);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.8, '#fde68a');
    grad.addColorStop(1, '#d97706');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(512, 512, 500, 0, Math.PI * 2);
    ctx.fill();

    // Concentric brass rings
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(512, 512, 495, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 512, 430, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(512, 512, 330, 0, Math.PI * 2);
    ctx.stroke();

    // 24 Hour subdivisions (15° each)
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillStyle = '#78350f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const romanHours = [
      'XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI',
      'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII'
    ];

    for (let h = 0; h < 24; h++) {
      const angle = (h - 12) * 15 * (Math.PI / 180);
      const cos = Math.cos(angle - Math.PI / 2);
      const sin = Math.sin(angle - Math.PI / 2);

      // Major hour ticks
      ctx.lineWidth = h % 6 === 0 ? 8 : 4;
      ctx.strokeStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(512 + cos * 430, 512 + sin * 430);
      ctx.lineTo(512 + cos * 490, 512 + sin * 490);
      ctx.stroke();

      // Number label
      const tx = 512 + cos * 380;
      const ty = 512 + sin * 380;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(angle);
      ctx.fillText(romanHours[h], 0, 0);
      ctx.restore();

      // 15-minute subdivisions
      for (let m = 1; m < 4; m++) {
        const subAngle = angle + (m * 3.75) * (Math.PI / 180);
        const scos = Math.cos(subAngle - Math.PI / 2);
        const ssin = Math.sin(subAngle - Math.PI / 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(512 + scos * 450, 512 + ssin * 450);
        ctx.lineTo(512 + scos * 490, 512 + ssin * 490);
        ctx.stroke();
      }
    }

    // Center gnomon collar indicator
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(512, 512, 35, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  };

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Background color based on environment
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 8);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    // Directional Sun Light
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Glowing Sun Mesh
    const sunGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Corona halo around sun
    const haloGeo = new THREE.RingGeometry(0.7, 1.2, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    sunMesh.add(haloMesh);

    // Sun beam ray line to sundial origin
    const rayGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1.5, 0),
    ]);
    const rayMat = new THREE.LineDashedMaterial({
      color: 0xfbbf24,
      dashSize: 0.2,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.45,
    });
    const rayLine = new THREE.Line(rayGeo, rayMat);
    rayLine.computeLineDistances();
    scene.add(rayLine);
    sunBeamLineRef.current = rayLine;

    // Room / Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Compass Rose on the floor
    const compassGroup = new THREE.Group();
    compassGroup.position.set(0, 0.01, 0);

    const ringGeo = new THREE.RingGeometry(3.5, 3.55, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x475569, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    compassGroup.add(ring);

    // North arrow indicator
    const arrowGeo = new THREE.ConeGeometry(0.25, 0.8, 16);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const northArrow = new THREE.Mesh(arrowGeo, arrowMat);
    northArrow.position.set(0, 0.05, -3.9);
    northArrow.rotation.x = Math.PI / 2;
    compassGroup.add(northArrow);

    scene.add(compassGroup);

    // Pedagogical Wooden Demonstration Table
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0, 0, 0);

    // Table top
    const tableTopGeo = new THREE.BoxGeometry(4.2, 0.14, 3.2);
    const tableTopMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.2,
    });
    const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTop.position.y = 0.93;
    tableTop.receiveShadow = true;
    tableTop.castShadow = true;
    tableGroup.add(tableTop);

    // 4 Table legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.93, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const legPositions = [
      [-1.9, 0.465, -1.4],
      [1.9, 0.465, -1.4],
      [-1.9, 0.465, 1.4],
      [1.9, 0.465, 1.4],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      tableGroup.add(leg);
    });

    scene.add(tableGroup);

    // EQUATORIAL SUNDIAL ASSEMBLY
    const sundialGroup = new THREE.Group();
    sundialGroup.position.set(0, 1.0, 0);
    sundialGroupRef.current = sundialGroup;

    // Brass Base Pedestal
    const basePedestalGeo = new THREE.CylinderGeometry(0.9, 1.05, 0.08, 32);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.75,
      roughness: 0.35,
    });
    const basePedestal = new THREE.Mesh(basePedestalGeo, brassMat);
    basePedestal.position.y = 0.04;
    basePedestal.receiveShadow = true;
    basePedestal.castShadow = true;
    sundialGroup.add(basePedestal);

    // Tilting Wedge / Quadrant Bracket
    const bracketGeo = new THREE.BoxGeometry(0.2, 0.45, 0.8);
    const bracket = new THREE.Mesh(bracketGeo, brassMat);
    bracket.position.set(0, 0.3, 0);
    bracket.castShadow = true;
    sundialGroup.add(bracket);

    // EQUATORIAL DIAL PLATE (Circular disc with 24h markings)
    const dialRadius = 1.35;
    const dialThickness = 0.05;
    const dialTexture = createDialTexture();
    const dialGeo = new THREE.CylinderGeometry(dialRadius, dialRadius, dialThickness, 64);

    const dialTopMat = new THREE.MeshStandardMaterial({
      map: dialTexture,
      roughness: 0.4,
      metalness: 0.3,
    });
    const dialSideMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.8,
      roughness: 0.3,
    });

    const dialMaterials = [dialSideMat, dialTopMat, dialTopMat];
    const dialPlate = new THREE.Mesh(dialGeo, dialMaterials);
    dialPlate.position.set(0, 0.6, 0);
    dialPlate.receiveShadow = true;
    dialPlate.castShadow = true;
    sundialGroup.add(dialPlate);
    dialPlateMeshRef.current = dialPlate;

    // CENTRAL GNOMON / POLAR STYLE (Brass needle through center)
    const gnomonLen = 2.4;
    const gnomonGeo = new THREE.CylinderGeometry(0.022, 0.022, gnomonLen, 32);
    const gnomonMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      metalness: 0.9,
      roughness: 0.2,
    });
    const gnomon = new THREE.Mesh(gnomonGeo, gnomonMat);
    gnomon.position.set(0, 0.6, 0);
    gnomon.castShadow = true;
    gnomon.receiveShadow = true;
    sundialGroup.add(gnomon);
    gnomonMeshRef.current = gnomon;

    scene.add(sundialGroup);

    // Diurnal Arc of Sun (Celestial Path line)
    const arcPoints: THREE.Vector3[] = [];
    for (let h = 5; h <= 19; h += 0.25) {
      arcPoints.push(new THREE.Vector3(0, 0, 0));
    }
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.5 });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    scene.add(arcLine);
    celestialArcRef.current = arcLine;

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth camera interpolation towards spherical position
      const targetPos = new THREE.Vector3().setFromSpherical(sphericalRef.current).add(targetLookAtRef.current);
      camera.position.lerp(targetPos, 0.08);
      camera.lookAt(targetLookAtRef.current);

      renderer.render(scene, camera);
    };
    animate();

    // Mouse / Touch Drag Handlers for Orbiting Camera
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.clientX, y: e.clientY };

      sphericalRef.current.theta -= dx * 0.006;
      sphericalRef.current.phi -= dy * 0.006;
      sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi));
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius += e.deltaY * 0.006;
      sphericalRef.current.radius = Math.max(2.5, Math.min(22, sphericalRef.current.radius));
    };

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMousePos.current.x;
      const dy = e.touches[0].clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      sphericalRef.current.theta -= dx * 0.008;
      sphericalRef.current.phi -= dy * 0.008;
      sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi));
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.addEventListener('touchmove', onTouchMove, { passive: true });
    dom.addEventListener('touchend', onTouchEnd);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
    };
  }, []);

  // Update Sundial Tilt based on Latitude and Heading
  useEffect(() => {
    if (!sundialGroupRef.current || !dialPlateMeshRef.current || !gnomonMeshRef.current) return;

    const latRad = (state.latitude * Math.PI) / 180;
    const headingRad = (state.orientationHeading * Math.PI) / 180;

    // Apply orientation heading
    sundialGroupRef.current.rotation.y = headingRad;

    // The gnomon must point to the celestial pole (tilt = latitude angle with horizontal).
    // In Three.js default cylinder is along Y axis.
    // Tilting backwards along X axis by (PI/2 - latRad):
    // When lat = 90° (North pole): tilt = 0 (gnomon vertical).
    // When lat = 0° (Equator): tilt = PI/2 (gnomon horizontal pointing North).
    const gnomonTilt = Math.PI / 2 - latRad;
    gnomonMeshRef.current.rotation.x = -gnomonTilt;

    // The equatorial dial plate is strictly perpendicular to the gnomon!
    // Therefore dial plate tilt from horizontal = latRad (90° - (90° - latRad)).
    dialPlateMeshRef.current.rotation.x = -gnomonTilt;
  }, [state.latitude, state.orientationHeading]);

  // Update Sun Position and Shadows based on Solar Coordinates
  useEffect(() => {
    if (!sunLightRef.current || !sunMeshRef.current || !sunBeamLineRef.current) return;

    const r = 14; // Distance of sun in scene
    const elevRad = (state.solarElevation * Math.PI) / 180;
    // Azimuth: 0 = North (-Z), 90 = East (+X), 180 = South (+Z), 270 = West (-X)
    const azRad = (state.solarAzimuth * Math.PI) / 180;

    // Cartesian conversion
    const sunY = r * Math.sin(elevRad);
    const sunX = r * Math.cos(elevRad) * Math.sin(azRad);
    const sunZ = -r * Math.cos(elevRad) * Math.cos(azRad);

    const sundialTarget = new THREE.Vector3(0, 1.6, 0);

    sunLightRef.current.position.set(sunX, sunY, sunZ);
    sunLightRef.current.target.position.copy(sundialTarget);
    sunLightRef.current.target.updateMatrixWorld();

    sunMeshRef.current.position.set(sunX, sunY, sunZ);
    sunMeshRef.current.lookAt(sundialTarget);

    // Update ray line
    const positions = sunBeamLineRef.current.geometry.attributes.position as THREE.BufferAttribute;
    positions.setXYZ(0, sunX, sunY, sunZ);
    positions.setXYZ(1, sundialTarget.x, sundialTarget.y, sundialTarget.z);
    positions.needsUpdate = true;
    sunBeamLineRef.current.visible = state.showSunRays && state.solarElevation > 0;

    // Intensity adjustment if sun is below horizon
    if (state.solarElevation <= 0) {
      sunLightRef.current.intensity = 0.05;
      sunMeshRef.current.visible = false;
    } else {
      sunLightRef.current.intensity = 2.2 * Math.min(1, Math.max(0.2, Math.sin(elevRad)));
      sunMeshRef.current.visible = true;
    }
  }, [state.solarElevation, state.solarAzimuth, state.showSunRays]);

  // Update Diurnal Celestial Arc for current day and latitude
  useEffect(() => {
    if (!celestialArcRef.current) return;

    const points: THREE.Vector3[] = [];
    const r = 14;
    const phi = (state.latitude * Math.PI) / 180;
    const delta = (state.solarDeclination * Math.PI) / 180;

    for (let h = 5; h <= 19; h += 0.25) {
      const H = (h - 12) * 15 * (Math.PI / 180);
      const sinElev = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(H);
      const elev = Math.asin(Math.max(-1, Math.min(1, sinElev)));

      const cosElev = Math.cos(elev);
      let az = 180;
      if (Math.abs(cosElev) > 0.0001) {
        const cosAz = (Math.sin(delta) - Math.sin(phi) * sinElev) / (Math.cos(phi) * cosElev);
        const azBase = Math.acos(Math.max(-1, Math.min(1, cosAz))) * (180 / Math.PI);
        az = Math.sin(H) > 0 ? 360 - azBase : azBase;
      }

      const azRad = (az * Math.PI) / 180;
      const py = r * Math.sin(elev);
      const px = r * Math.cos(elev) * Math.sin(azRad);
      const pz = -r * Math.cos(elev) * Math.cos(azRad);

      points.push(new THREE.Vector3(px, py, pz));
    }

    celestialArcRef.current.geometry.setFromPoints(points);
    celestialArcRef.current.visible = state.showCelestialArcs;
  }, [state.latitude, state.solarDeclination, state.showCelestialArcs]);

  // Handle Camera Presets
  useEffect(() => {
    if (cameraPreset === 'free') return;

    if (cameraPreset === 'room') {
      sphericalRef.current.set(9.5, Math.PI / 3.2, Math.PI / 4);
      targetLookAtRef.current.set(0, 1.4, 0);
    } else if (cameraPreset === 'dial_closeup') {
      // Look closely at the equatorial dial plate
      sphericalRef.current.set(3.2, Math.PI / 4, 0.2);
      targetLookAtRef.current.set(0, 1.6, 0);
    } else if (cameraPreset === 'top_down') {
      // Directly above the gnomon polar axis
      sphericalRef.current.set(4.5, 0.05, 0);
      targetLookAtRef.current.set(0, 1.6, 0);
    } else if (cameraPreset === 'celestial') {
      // Wide angle showing celestial sphere
      sphericalRef.current.set(18, Math.PI / 2.8, Math.PI / 3);
      targetLookAtRef.current.set(0, 1.2, 0);
    }

    onCameraPresetApplied();
  }, [cameraPreset, onCameraPresetApplied]);

  return (
    <div className="relative w-full h-full min-h-[380px] overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-slate-900/70 backdrop-blur-xs px-2 py-1 rounded pointer-events-none font-mono">
        Arrastra con el ratón o dedo para rotar la cámara 3D
      </div>
    </div>
  );
};
