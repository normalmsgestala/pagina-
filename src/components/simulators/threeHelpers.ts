import * as THREE from 'three';

/**
 * Creates a recognizable 3D human passenger figure (head, eyes, torso, arms, legs)
 */
export function createPassengerMesh(shirtColor = 0x38bdf8, hasHarness = true): THREE.Group {
  const person = new THREE.Group();

  // Torso
  const torsoGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.55, 12);
  const torsoMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.4 });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 0.28;
  torso.castShadow = true;
  person.add(torso);

  // Head
  const headGeo = new THREE.SphereGeometry(0.17, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.3 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 0.72;
  head.castShadow = true;
  person.add(head);

  // Eyes so you can see where the person is looking
  const eyeGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(0.14, 0.75, 0.06);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.14, 0.75, -0.06);
  person.add(leftEye, rightEye);

  // Arms raised or holding bar
  const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.42, 8);
  const armMat = new THREE.MeshStandardMaterial({ color: shirtColor });
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(0.1, 0.45, 0.24);
  leftArm.rotation.z = -0.6;
  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(0.1, 0.45, -0.24);
  rightArm.rotation.z = -0.6;
  person.add(leftArm, rightArm);

  // Safety Harness over shoulders if enabled
  if (hasHarness) {
    const harnessGeo = new THREE.TorusGeometry(0.22, 0.04, 8, 16, Math.PI);
    const harnessMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.3, roughness: 0.4 });
    const harness = new THREE.Mesh(harnessGeo, harnessMat);
    harness.position.set(0.05, 0.45, 0);
    harness.rotation.z = -Math.PI / 4;
    person.add(harness);
  }

  return person;
}

/**
 * Creates a Cartesian XYZ Coordinate Axes helper with grid & axis arrows
 */
export function createCartesianAxesGroup(size = 8): THREE.Group {
  const group = new THREE.Group();

  // Floor Grid (XZ plane)
  const gridXZ = new THREE.GridHelper(size * 2, 16, 0x334155, 0x1e293b);
  group.add(gridXZ);

  // Vertical XY backplane subtle grid
  const gridXY = new THREE.GridHelper(size * 2, 16, 0x334155, 0x0f172a);
  gridXY.rotation.x = Math.PI / 2;
  gridXY.position.z = -size;
  gridXY.position.y = size;
  group.add(gridXY);

  // X Axis (Red -> +X)
  const xArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0.05, 0),
    size,
    0xef4444,
    0.45,
    0.25
  );
  group.add(xArrow);

  // Y Axis (Green -> +Y Vertical)
  const yArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0.05, 0),
    size,
    0x10b981,
    0.45,
    0.25
  );
  group.add(yArrow);

  // Z Axis (Blue -> +Z Depth)
  const zArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0.05, 0),
    size,
    0x38bdf8,
    0.45,
    0.25
  );
  group.add(zArrow);

  return group;
}

/**
 * Updates a THREE.ArrowHelper safely with direction and length
 */
export function updateArrowVector(
  arrow: THREE.ArrowHelper,
  origin: THREE.Vector3,
  vec: THREE.Vector3,
  scale = 1
) {
  arrow.position.copy(origin);
  const len = vec.length() * scale;
  if (len < 0.05) {
    arrow.visible = false;
    return;
  }
  arrow.visible = true;
  const dir = vec.clone().normalize();
  arrow.setDirection(dir);
  const clampedLen = Math.min(8, Math.max(0.4, len));
  arrow.setLength(clampedLen, Math.min(0.55, clampedLen * 0.28), Math.min(0.32, clampedLen * 0.18));
}
