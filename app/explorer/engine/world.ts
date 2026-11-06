import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { buildPole, type Pole } from '../../components/pole3d/buildPole';

/* The whole /reimagined world: a barangay street at the scale of the real
 * pole (1 unit = 1 m), with the city around it. Everything is generated --
 * there is no model file to download -- and everything the story animates is
 * driven by one WorldState per frame, so the scroll timeline stays the only
 * source of truth for what is on screen.
 */

export type WorldState = {
  day: number;      // 0 night .. 1 day
  sun: number;      // sun position along its arc, 0..1 (also drives panel tilt)
  lamp: number;     // street lamp level 0..2
  energy: number;   // solar energy flow visibility 0..1
  scan: number;     // AI scan: cone, rings, detection boxes 0..1
  verify: number;   // second-stage check highlight 0..1
  network: number;  // alert beams to barangay + police 0..1
  explode: number;  // exploded view 0..1
  turn: number;     // pole rotation, radians
  city: number;     // poles lighting up across the city 0..1
  open: number;     // controller box opened 0..1
};

export type World = {
  pole: Pole;
  update: (t: number, s: WorldState) => void;
  pedestriansInCone: () => number;
  triggerFight: () => void;
  dispose: () => void;
};

const GREEN = new THREE.Color('#76b900');
const BUILD_NIGHT = new THREE.Color('#2a302c'), BUILD_DAY = new THREE.Color('#ffffff');
const GROUND_NIGHT = new THREE.Color('#0f170d'), GROUND_DAY = new THREE.Color('#5f7d3e');
const WALK_NIGHT = new THREE.Color('#4f5652'), WALK_DAY = new THREE.Color('#ffffff');
const ROAD_NIGHT = new THREE.Color('#353b3a'), ROAD_DAY = new THREE.Color('#9a9d9b');
const rand = (() => {
  let seed = 7;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
})();

// ── sidewalk pavers and asphalt, drawn once on canvases ───────────────────
function paverTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#7d7f78';
  g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    const v = 150 + Math.floor(rand() * 30);
    g.fillStyle = `rgb(${v},${v + 2},${v - 6})`;
    g.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
  }
  for (let i = 0; i < 900; i++) {
    const v = Math.floor(90 + rand() * 90);
    g.fillStyle = `rgba(${v},${v},${v},0.25)`;
    g.fillRect(rand() * 256, rand() * 256, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}
function asphaltTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#5c5e5d';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5000; i++) {
    const v = Math.floor(50 + rand() * 80);
    g.fillStyle = `rgba(${v},${v},${v},0.5)`;
    g.fillRect(rand() * 256, rand() * 256, 1.5, 1.5);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

// ── sky: day/dusk/night gradient, sun, twinkling stars ─────────────────────
function makeSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { uDay: { value: 0 }, uTime: { value: 0 }, uSun: { value: new THREE.Vector3(0, 1, 0) } },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float uDay; uniform float uTime; uniform vec3 uSun;
      varying vec3 vDir;
      float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main() {
        vec3 d = normalize(vDir);
        float h = clamp(d.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 night = mix(vec3(0.020, 0.060, 0.030), vec3(0.002, 0.008, 0.006), pow(h, 0.55));
        vec3 dusk  = mix(vec3(0.95, 0.42, 0.18), vec3(0.10, 0.16, 0.30), pow(h, 0.7));
        vec3 day   = mix(vec3(0.95, 0.80, 0.60), vec3(0.22, 0.48, 0.78), pow(h, 0.5));
        vec3 col = uDay < 0.5 ? mix(night, dusk, uDay * 2.0) : mix(dusk, day, (uDay - 0.5) * 2.0);
        float sd = max(dot(d, normalize(uSun)), 0.0);
        col += vec3(1.0, 0.82, 0.55) * (pow(sd, 900.0) * 6.0 + pow(sd, 14.0) * 0.3) * smoothstep(0.15, 0.6, uDay);
        if (d.y > 0.0) {
          vec3 cell = floor(d * 260.0);
          float star = step(0.9978, hash(cell));
          float tw = 0.55 + 0.45 * sin(uTime * 2.5 + hash(cell + 3.0) * 40.0);
          col += vec3(0.85, 1.0, 0.85) * star * tw * (1.0 - smoothstep(0.0, 0.45, uDay)) * smoothstep(0.0, 0.25, d.y);
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), mat);
  mesh.renderOrder = -1;
  return { mesh, mat };
}

// ── ground scan rings around the pole ──────────────────────────────────────
function makeRings() {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uStrength: { value: 0 }, uColor: { value: GREEN.clone() } },
    vertexShader: /* glsl */`
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float uTime; uniform float uStrength; uniform vec3 uColor;
      varying vec2 vP;
      void main() {
        float d = length(vP);
        float wave = mod(uTime * 7.0, 34.0);
        float ring = exp(-pow((d - wave) * 1.6, 2.0)) + 0.6 * exp(-pow((d - mod(uTime * 7.0 + 17.0, 34.0)) * 1.6, 2.0));
        float grid = 0.0;
        vec2 gp = abs(fract(vP / 2.0) - 0.5);
        grid = smoothstep(0.47, 0.5, max(gp.x, gp.y)) * 0.18;
        float fade = 1.0 - smoothstep(4.0, 34.0, d);
        float a = (ring * 0.9 + grid) * fade * uStrength;
        gl_FragColor = vec4(uColor * a, a);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.03;
  return { mesh, mat };
}

// ── a label sprite ("PERSON 0.97") ─────────────────────────────────────────
function labelSprite(text: string, color = '#b6ff3a'): THREE.Sprite {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = 'rgba(2,8,2,0.85)';
  g.fillRect(0, 8, 256, 48);
  g.strokeStyle = color; g.lineWidth = 3;
  g.strokeRect(1.5, 9.5, 253, 45);
  g.fillStyle = color;
  g.font = 'bold 26px "JetBrains Mono", monospace';
  g.textBaseline = 'middle';
  g.fillText(text, 14, 33);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
  s.scale.set(1.2, 0.3, 1);
  return s;
}

export function buildWorld(scene: THREE.Scene, opts: { low: boolean }): World {
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => { disposables.push(x); return x; };

  scene.fog = new THREE.FogExp2(new THREE.Color('#020502'), 0.012);

  // lights
  const hemi = new THREE.HemisphereLight('#a9c4ff', '#1a2418', 0.9);
  scene.add(hemi);
  const sunLight = new THREE.DirectionalLight('#ffe2b0', 0);
  scene.add(sunLight);
  const moon = new THREE.DirectionalLight('#9dbcff', 0.8);
  moon.position.set(-30, 40, -20);
  scene.add(moon);
  // A studio light that comes up for the exploded view, so every part reads.
  const studio = new THREE.PointLight('#eaffd6', 0, 24, 1.3);
  studio.position.set(3.2, 5.6, 6.2);
  scene.add(studio);
  const rim = new THREE.DirectionalLight(GREEN, 1.2);
  rim.position.set(-8, 10, -12);
  scene.add(rim);

  const sky = makeSky();
  track(sky.mesh.geometry); track(sky.mat);
  scene.add(sky.mesh);

  // ── ground, road, sidewalks ──────────────────────────────────────────────
  const groundMat = track(new THREE.MeshStandardMaterial({ color: '#070a07', roughness: 0.95 }));
  const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(600, 600)), groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // One block of a real street (1 unit = 1 m), along x:
  //   shops | sidewalk z -4.2..2.0 (the pole's side) | curb | road 2..8 | curb | sidewalk 8..13.5 | shops
  const asphalt = track(asphaltTexture());
  const roadMat = track(new THREE.MeshStandardMaterial({ color: '#353b3a', map: asphalt, roughness: 0.82, metalness: 0.05 }));
  const pavers = track(paverTexture());
  const walkMat = track(new THREE.MeshStandardMaterial({ color: '#4f5652', map: pavers, roughness: 0.9 }));
  const curbMat = track(new THREE.MeshStandardMaterial({ color: '#b9bcb4', roughness: 0.8 }));
  const lineMat = track(new THREE.MeshStandardMaterial({ color: '#e8e4d2', emissive: '#e8e4d2', emissiveIntensity: 0.18, roughness: 0.6 }));
  const yellowMat = track(new THREE.MeshStandardMaterial({ color: '#e8b923', emissive: '#e8b923', emissiveIntensity: 0.15, roughness: 0.6 }));
  const roads = [
    { x: 0, z: 5, w: 260, d: 6 },
    { x: 0, z: -38, w: 260, d: 6 }, { x: 0, z: 46, w: 260, d: 6 },
    ...[-72, -36, 36, 72].map((x) => ({ x, z: 4, w: 6, d: 200 })),
  ];
  for (const r of roads) {
    const g = track(new THREE.BoxGeometry(r.w, 0.02, r.d));
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * r.w / 4, uv.getY(i) * r.d / 4);
    const m = new THREE.Mesh(g, roadMat);
    m.position.set(r.x, 0.01, r.z);
    scene.add(m);
  }
  const walkGeo = (w: number, d: number) => {
    const g = track(new THREE.BoxGeometry(w, 0.16, d));
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 2, uv.getY(i) * d / 2); // 50 cm pavers
    return g;
  };
  for (const [z0, z1] of [[-6.5, 2.0], [8.0, 13.5]]) {
    const walk = new THREE.Mesh(walkGeo(260, z1 - z0), walkMat);
    walk.position.set(0, 0.08, (z0 + z1) / 2);
    scene.add(walk);
  }
  for (const z of [2.0, 8.0]) {
    const curb = new THREE.Mesh(track(new THREE.BoxGeometry(260, 0.18, 0.18)), curbMat);
    curb.position.set(0, 0.09, z);
    scene.add(curb);
  }
  // lane markings: dashed centre line, solid edge lines, a crosswalk by the pole
  const dashGeo = track(new THREE.BoxGeometry(2.4, 0.025, 0.12));
  const dashes = new THREE.InstancedMesh(dashGeo, yellowMat, 54);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 54; i++) { m4.makeTranslation(-130 + i * 5, 0.025, 5); dashes.setMatrixAt(i, m4); }
  scene.add(dashes);
  for (const z of [2.35, 7.65]) {
    const edge = new THREE.Mesh(track(new THREE.BoxGeometry(260, 0.025, 0.1)), lineMat);
    edge.position.set(0, 0.025, z);
    scene.add(edge);
  }
  const stripeGeo = track(new THREE.BoxGeometry(0.5, 0.026, 5.4));
  const stripes = new THREE.InstancedMesh(stripeGeo, lineMat, 8);
  for (let i = 0; i < 8; i++) { m4.makeTranslation(-9.5 + i * 0.95, 0.026, 5); stripes.setMatrixAt(i, m4); }
  scene.add(stripes);

  // ── street furniture: trees in planters, benches, ordinary street lamps ──
  const trunkMat = track(new THREE.MeshStandardMaterial({ color: '#4a3726', roughness: 0.9 }));
  const leafMat = track(new THREE.MeshStandardMaterial({ color: '#2f5a26', roughness: 0.85, flatShading: true }));
  const planterMat = track(new THREE.MeshStandardMaterial({ color: '#6c706a', roughness: 0.9 }));
  const trunkGeo = track(new THREE.CylinderGeometry(0.1, 0.14, 2.6, 7)); trunkGeo.translate(0, 1.3, 0);
  const leafGeo = track(new THREE.IcosahedronGeometry(1.25, 1));
  const planterGeo = track(new THREE.BoxGeometry(1.2, 0.35, 1.2)); planterGeo.translate(0, 0.175, 0);
  [-26, -18, -12, 6, 12, 20, 28, -34, 34].forEach((x, i) => {
    for (const z of [-2.8, 12.1]) {
      if (z > 10 && i % 2) continue;
      const tg = new THREE.Group();
      const leaves = new THREE.Mesh(leafGeo, leafMat);
      leaves.position.y = 3.1; leaves.scale.set(1, 0.85 + rand() * 0.3, 1);
      tg.add(new THREE.Mesh(planterGeo, planterMat), new THREE.Mesh(trunkGeo, trunkMat), leaves);
      tg.position.set(x + (rand() - 0.5), 0.16, z);
      scene.add(tg);
    }
  });
  const benchMat = track(new THREE.MeshStandardMaterial({ color: '#6b4a2e', roughness: 0.8 }));
  const legMat = track(new THREE.MeshStandardMaterial({ color: '#222222', metalness: 0.6 }));
  for (const x of [-4.2, 9]) {
    const bench = new THREE.Group();
    const seat = new THREE.Mesh(track(new THREE.BoxGeometry(1.6, 0.06, 0.45)), benchMat); seat.position.y = 0.45;
    const back = new THREE.Mesh(track(new THREE.BoxGeometry(1.6, 0.4, 0.05)), benchMat); back.position.set(0, 0.7, -0.2);
    const legs = new THREE.Mesh(track(new THREE.BoxGeometry(1.4, 0.42, 0.1)), legMat); legs.position.y = 0.21;
    bench.add(seat, back, legs);
    bench.position.set(x, 0.16, -1.6);
    scene.add(bench);
  }
  // Ordinary street lamps up and down the block, so the street reads as lit.
  const sideGeo = track(new THREE.CylinderGeometry(0.05, 0.08, 5.5, 8)); sideGeo.translate(0, 2.75, 0);
  const sideHeadGeo = track(new THREE.BoxGeometry(0.26, 0.08, 0.7));
  const sideHeadMat = track(new THREE.MeshStandardMaterial({ color: '#fff4d8', emissive: '#ffe7b8', emissiveIntensity: 1.6 }));
  const sidePoleMat = track(new THREE.MeshStandardMaterial({ color: '#3d443e', metalness: 0.6, roughness: 0.4 }));
  const sidePoolGeo = track(new THREE.CircleGeometry(4.5, 32)); sidePoolGeo.rotateX(-Math.PI / 2);
  const sidePoolMat = track(new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }));
  for (const x of [-48, -32, -16, 16, 32, 48]) {
    for (const z of [1.4, 8.6]) {
      const dir = z < 5 ? 1 : -1;
      const g = new THREE.Group();
      const head = new THREE.Mesh(sideHeadGeo, sideHeadMat);
      head.position.set(0, 5.45, dir * 0.4);
      const pool = new THREE.Mesh(sidePoolGeo, sidePoolMat); pool.position.set(0, 0.03, dir * 1.2);
      g.add(new THREE.Mesh(sideGeo, sidePoleMat), head, pool);
      g.position.set(x + (z > 5 ? 8 : 0), 0.16, z);
      scene.add(g);
      if (Math.abs(x) === 16 && z < 5) {
        const l = new THREE.PointLight('#ffe2b0', 14, 15, 1.4);
        l.position.set(g.position.x, 5.2, z + dir * 0.5);
        scene.add(l);
      }
    }
  }

  // ── a few cars driving through ──────────────────────────────────────────
  const carColors = ['#9c1f1f', '#d8d8d2', '#1f3b6e', '#2c2c2c', '#c9a227'];
  const glassMat = track(new THREE.MeshStandardMaterial({ color: '#0c1418', roughness: 0.15, metalness: 0.6 }));
  const headMat = track(new THREE.MeshBasicMaterial({ color: '#cfc7a4' }));
  const tailMat = track(new THREE.MeshBasicMaterial({ color: '#ff2a2a' }));
  const carBody = track(new THREE.BoxGeometry(4.2, 0.75, 1.8));
  const carCab = track(new THREE.BoxGeometry(2.2, 0.6, 1.6));
  const carLampGeo = track(new THREE.BoxGeometry(0.05, 0.12, 0.35));
  const wheelGeo = track(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 14)); wheelGeo.rotateX(Math.PI / 2);
  const wheelMat = track(new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9 }));
  type Car = { g: THREE.Group; speed: number; off: number };
  const cars: Car[] = [];
  for (let i = 0; i < (opts.low ? 2 : 3); i++) {
    const dir = i % 2 ? -1 : 1;
    const g = new THREE.Group();
    const body = new THREE.Mesh(carBody, track(new THREE.MeshStandardMaterial({ color: carColors[i], metalness: 0.5, roughness: 0.35 })));
    body.position.y = 0.72;
    const cab = new THREE.Mesh(carCab, glassMat); cab.position.set(-0.2, 1.38, 0);
    g.add(body, cab);
    for (const zz of [-0.6, 0.6]) {
      const h = new THREE.Mesh(carLampGeo, headMat); h.position.set(2.11, 0.78, zz);
      const tl = new THREE.Mesh(carLampGeo, tailMat); tl.position.set(-2.11, 0.78, zz);
      g.add(h, tl);
    }
    for (const wx of [-1.35, 1.35]) for (const wz of [-0.85, 0.85]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat); w.position.set(wx, 0.34, wz); g.add(w);
    }
    g.rotation.y = dir > 0 ? 0 : Math.PI;
    g.position.z = dir > 0 ? 6.5 : 3.5;
    scene.add(g);
    cars.push({ g, speed: dir * (7 + rand() * 4), off: rand() * 220 });
  }

  // ── a quiet Philippine barangay: low houses, a sari-sari store, palms ──
  // Not a downtown: one-storey and a few two-storey houses with tin roofs,
  // empty lots between them, coconut palms, and the store across the street.
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const paint = (g: THREE.BufferGeometry, hex: string) => {
    const c = new THREE.Color(hex);
    const n = g.attributes.position.count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    return g;
  };
  const wallColors = ['#d9cfb4', '#b9d0c4', '#e0b48a', '#c7c9a0', '#e8dccb', '#a9bfd6', '#d6a5a0', '#bfae8f'];
  const roofColors = ['#7a3b2a', '#5b6a72', '#8c8f8a', '#3f5f7a', '#9a4a32', '#6f7c5a'];
  const bodyGeos: THREE.BufferGeometry[] = [], roofGeos: THREE.BufferGeometry[] = [], winGeos: THREE.BufferGeometry[] = [], doorGeos: THREE.BufferGeometry[] = [];
  const trunkGeos: THREE.BufferGeometry[] = [], frondGeos: THREE.BufferGeometry[] = [];
  const addPalm = (x: number, z: number) => {
    const h = 5.5 + rand() * 3.5, lean = (rand() - 0.5) * 0.35;
    const tr = new THREE.CylinderGeometry(0.11, 0.2, h, 6);
    tr.translate(0, h / 2, 0); tr.rotateZ(lean); tr.translate(x, 0, z);
    trunkGeos.push(tr);
    const tx = x - Math.sin(lean) * h, ty = Math.cos(lean) * h;
    for (let k = 0; k < 8; k++) {
      const fr = new THREE.BoxGeometry(2.3, 0.03, 0.42);
      fr.translate(1.1, 0, 0); fr.rotateZ(-0.45 - rand() * 0.35); fr.rotateY(k * Math.PI / 4 + rand() * 0.3);
      fr.translate(tx, ty, z);
      frondGeos.push(fr);
    }
  };
  const addHouse = (x: number, zFront: number, sign: number, w: number, d: number, storeys: number) => {
    const h = 2.9 * storeys;
    const body = paint(new THREE.BoxGeometry(w, h, d), pick(wallColors));
    body.translate(x, h / 2, zFront + sign * d / 2);
    bodyGeos.push(body);
    const r = (d + 0.8) / Math.sqrt(3);
    const roof = paint(new THREE.CylinderGeometry(r, r, w + 0.6, 3, 1), pick(roofColors));
    roof.rotateX(-Math.PI / 2); roof.rotateY(Math.PI / 2); roof.scale(1, 0.42, 1);
    roof.translate(x, h + r * 0.21, zFront + sign * d / 2);
    roofGeos.push(roof);
    for (let st = 0; st < storeys; st++) {
      const nW = Math.max(1, Math.floor(w / 2.6));
      for (let i = 0; i < nW; i++) {
        const wx = x - w / 2 + (i + 0.5) * (w / nW);
        if (st === 0 && i === 0) {
          const door = new THREE.BoxGeometry(0.9, 2, 0.06); door.translate(wx, 1, zFront - sign * 0.02); doorGeos.push(door);
          continue;
        }
        if (rand() < 0.35) continue; // lights off in that room
        const win = new THREE.BoxGeometry(0.9, 0.9, 0.06);
        win.translate(wx, st * 2.9 + 1.6, zFront - sign * 0.02);
        winGeos.push(win);
      }
    }
  };
  const crossGap = (x: number) => [-72, -36, 36, 72].some((c) => Math.abs(x - c) < 5.5);
  const xMax = opts.low ? 70 : 105;
  for (const [zFront, sign] of [[-6.5, -1], [13.5, 1]] as const) {
    let x = -xMax;
    while (x < xMax) {
      const w = 5 + rand() * 4;
      const cx = x + w / 2;
      const storeAhead = sign > 0 && cx > -9 && cx < 4;  // the sari-sari store's spot
      if (crossGap(cx) || storeAhead) { x += w + 1; continue; }
      if (rand() < 0.28) { addPalm(cx, zFront + sign * (2 + rand() * 3)); x += w + 2; continue; } // empty lot
      addHouse(cx, zFront, sign, w, 5.5 + rand() * 3, rand() < 0.28 ? 2 : 1);
      if (rand() < 0.5) addPalm(x + w + 1.2, zFront + sign * (3 + rand() * 4));
      x += w + 1.5 + rand() * 6;
    }
  }
  // further back: scattered houses and lots of palms
  for (let i = 0; i < (opts.low ? 40 : 90); i++) {
    const x = (rand() - 0.5) * 2 * xMax, z = rand() < 0.5 ? -16 - rand() * 18 : 22 + rand() * 18;
    if (crossGap(x) || Math.abs(z + 38) < 5 || Math.abs(z - 46) < 5) continue;
    if (rand() < 0.65) addPalm(x, z);
    else addHouse(x, z, z < 0 ? -1 : 1, 5 + rand() * 3, 6, 1);
  }
  const houseMat = track(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }));
  const roofMat = track(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.45, flatShading: true }));
  const buildingMat = track(new THREE.MeshStandardMaterial({ color: '#2a2418', emissive: '#ffc77a', emissiveIntensity: 1 }));
  const doorMat = track(new THREE.MeshStandardMaterial({ color: '#4a3424', roughness: 0.8 }));
  const palmTrunkMat = track(new THREE.MeshStandardMaterial({ color: '#6b5a44', roughness: 0.9 }));
  const palmLeafMat = track(new THREE.MeshStandardMaterial({ color: '#3f7a2e', roughness: 0.8, side: THREE.DoubleSide }));
  const merged: [THREE.BufferGeometry[], THREE.Material][] = [
    [bodyGeos, houseMat], [roofGeos, roofMat], [winGeos, buildingMat], [doorGeos, doorMat], [trunkGeos, palmTrunkMat], [frondGeos, palmLeafMat],
  ];
  for (const [geos, mat] of merged) {
    if (!geos.length) continue;
    scene.add(new THREE.Mesh(track(mergeGeometries(geos)), mat));
    geos.forEach((g) => g.dispose());
  }

  // The sari-sari store across the street, still open: lit counter, awning, sign.
  const store = new THREE.Group();
  const storeBody = new THREE.Mesh(track(new THREE.BoxGeometry(6, 3.1, 5)), track(new THREE.MeshStandardMaterial({ color: '#e2c48f', roughness: 0.85 })));
  storeBody.position.set(0, 1.55, 2.5);
  const counter = new THREE.Mesh(track(new THREE.BoxGeometry(3.4, 1.1, 0.08)), track(new THREE.MeshStandardMaterial({ color: '#332a1c', emissive: '#ffd79a', emissiveIntensity: 0.9 })));
  counter.position.set(-0.6, 1.55, -0.02);
  const grill = new THREE.Mesh(track(new THREE.BoxGeometry(3.5, 1.2, 0.04)), track(new THREE.MeshStandardMaterial({ color: '#2f3a2f', wireframe: true })));
  grill.position.set(-0.6, 1.55, -0.07);
  const awning = new THREE.Mesh(track(new THREE.BoxGeometry(6.6, 0.06, 1.6)), track(new THREE.MeshStandardMaterial({ color: '#9aa3a6', metalness: 0.5, roughness: 0.5 })));
  awning.position.set(0, 2.75, -0.7); awning.rotation.x = -0.18;
  const signC = document.createElement('canvas');
  signC.width = 512; signC.height = 96;
  const sg = signC.getContext('2d')!;
  sg.fillStyle = '#c8202a'; sg.fillRect(0, 0, 512, 96);
  sg.fillStyle = '#fff6d8'; sg.font = 'bold 44px Arial, sans-serif'; sg.textAlign = 'center'; sg.textBaseline = 'middle';
  sg.fillText("ALING NENA'S STORE", 256, 50);
  const signTex = track(new THREE.CanvasTexture(signC)); signTex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(track(new THREE.PlaneGeometry(3.6, 0.68)), track(new THREE.MeshStandardMaterial({ map: signTex, emissive: '#ffffff', emissiveMap: signTex, emissiveIntensity: 0.5 })));
  sign.position.set(0, 2.98, -1.42); sign.rotation.y = Math.PI;
  const bulb = new THREE.PointLight('#ffcf8a', 6, 7, 1.6);
  bulb.position.set(-0.6, 2.4, -0.9);
  store.add(storeBody, counter, grill, awning, sign, bulb);
  store.position.set(-2.5, 0.16, 13.5);
  store.rotation.y = 0;
  scene.add(store);

  // ── the hero pole ────────────────────────────────────────────────────────
  const pole = buildPole();
  // its built-in floor grid belongs to the standalone views, not a street
  pole.root.children.filter((c) => c.type === 'GridHelper').forEach((c) => (c.visible = false));
  pole.root.position.set(0, 0.14, 0.9);
  scene.add(pole.root);

  // ── scan rings ───────────────────────────────────────────────────────────
  const rings = makeRings();
  track(rings.mesh.geometry); track(rings.mat);
  rings.mesh.position.set(0, 0.16, 0.9);
  scene.add(rings.mesh);

  // ── energy flowing from the panel to the battery (moves with the pole) ──
  const flow = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 6.62, 0), new THREE.Vector3(0, 6.2, 0), new THREE.Vector3(0, 5.9, -0.06),
    new THREE.Vector3(0, 5.3, -0.2), new THREE.Vector3(0, 4.85, -0.22), new THREE.Vector3(0, 4.5, -0.24),
  ]);
  const N_FLOW = opts.low ? 90 : 180;
  const flowPos = new Float32Array(N_FLOW * 3);
  const flowGeo = track(new THREE.BufferGeometry());
  flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
  const flowMat = track(new THREE.PointsMaterial({
    color: '#c8ff5a', size: 0.07, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  const flowPts = new THREE.Points(flowGeo, flowMat);
  pole.root.add(flowPts);
  const flowSeeds = Array.from({ length: N_FLOW }, () => [rand(), (rand() - 0.5) * 0.08, (rand() - 0.5) * 0.08]);
  const tmpV = new THREE.Vector3();

  // ── pedestrians with detection boxes ────────────────────────────────────
  const bodyMat = track(new THREE.MeshStandardMaterial({ color: '#2b332b', roughness: 0.7 }));
  const bodyGeo = track(new THREE.CapsuleGeometry(0.19, 0.95, 4, 10));
  const headGeo = track(new THREE.SphereGeometry(0.13, 14, 10));
  const boxEdges = track(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.75, 1.95, 0.6)));
  const boxMat = track(new THREE.LineBasicMaterial({ color: '#b6ff3a', transparent: true, opacity: 0 }));
  type Walker = { g: THREE.Group; box: THREE.LineSegments; label: THREE.Sprite; z: number; speed: number; off: number };
  const walkers: Walker[] = [];
  const lanes = [
    { z: -0.5, speed: 1.15 }, { z: -1.3, speed: -0.95 }, { z: 8.7, speed: 1.0 },
    { z: 9.1, speed: -1.25 }, { z: -0.9, speed: 0.8 }, { z: 8.9, speed: 0.9 },
  ];
  lanes.forEach((ln, i) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.75;
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 1.5;
    g.add(body, head);
    const box = new THREE.LineSegments(boxEdges, boxMat);
    box.position.y = 0.98;
    g.add(box);
    const label = labelSprite(`PERSON ${(0.9 + rand() * 0.09).toFixed(2)}`);
    track(label.material); track((label.material as THREE.SpriteMaterial).map!);
    label.position.y = 2.25;
    g.add(label);
    scene.add(g);
    walkers.push({ g, box, label, z: ln.z, speed: ln.speed, off: i * 7.3 });
  });

  // ── now and then, a fist fight the camera flags ─────────────────────────
  // Two figures meet on the far sidewalk (inside the camera's view), trade
  // punches for a few seconds, get boxed in red as FIGHT, then split up.
  const fighterMats = ['#5a2b2b', '#2b3b5a'].map((c) => track(new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 })));
  const armGeo = track(new THREE.BoxGeometry(0.12, 0.6, 0.12)); armGeo.translate(0, -0.28, 0);
  const fightBoxMat = track(new THREE.LineBasicMaterial({ color: '#ff3b3b', transparent: true, opacity: 0 }));
  const fightBox = new THREE.LineSegments(track(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2, 2.1, 1.1))), fightBoxMat);
  const fightLabel = labelSprite('FIGHT 0.94', '#ff4b4b');
  track(fightLabel.material); track((fightLabel.material as THREE.SpriteMaterial).map!);
  fightLabel.scale.set(1.4, 0.35, 1);
  const fight = new THREE.Group();
  fightBox.position.y = 1.05; fightLabel.position.y = 2.45;
  fight.add(fightBox, fightLabel);
  const fighters = fighterMats.map((mat, k) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(bodyGeo, mat); body.position.y = 0.75;
    const head = new THREE.Mesh(headGeo, mat); head.position.y = 1.5;
    const arms = [-0.25, 0.25].map((z) => { const a = new THREE.Mesh(armGeo, mat); a.position.set(z, 1.25, 0.05); g.add(a); return a; });
    g.add(body, head);
    fight.add(g);
    return { g, arms, side: k ? 1 : -1 };
  });
  fight.visible = false;
  scene.add(fight);
  let fightAt = 6 + rand() * 4, fightX = 0, fightZ = 9.8, fighting = 0;
  const FIGHT_LEN = 9;

  // ── barangay hall, alert beams ──────────────────────────
  const hallMat = track(new THREE.MeshStandardMaterial({ color: '#1a231a', roughness: 0.6, emissive: '#76b900', emissiveIntensity: 0.06 }));
  const policeMat = track(new THREE.MeshStandardMaterial({ color: '#141b26', roughness: 0.6, emissive: '#3a7bff', emissiveIntensity: 0.08 }));
  const hall = new THREE.Group();
  const hallBody = new THREE.Mesh(track(new THREE.BoxGeometry(9, 4.5, 6)), hallMat);
  hallBody.position.y = 2.25;
  const hallRoof = new THREE.Mesh(track(new THREE.ConeGeometry(6.2, 2.4, 4)), hallMat);
  hallRoof.position.y = 5.7; hallRoof.rotation.y = Math.PI / 4; hallRoof.scale.set(1, 1, 0.75);
  hall.add(hallBody, hallRoof);
  hall.position.set(-30, 0, 18);
  scene.add(hall);
  const police = new THREE.Group();
  const policeBody = new THREE.Mesh(track(new THREE.BoxGeometry(10, 7, 7)), policeMat);
  policeBody.position.y = 3.5;
  const lightBar = new THREE.Mesh(track(new THREE.BoxGeometry(3, 0.35, 0.6)),
    track(new THREE.MeshStandardMaterial({ color: '#ff3355', emissive: '#ff2244', emissiveIntensity: 2 })));
  lightBar.position.y = 7.3;
  police.add(policeBody, lightBar);
  police.position.set(34, 0, -12);
  scene.add(police);

  const beaconMat = track(new THREE.MeshBasicMaterial({
    color: GREEN, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  const beaconGeo = track(new THREE.CylinderGeometry(0.5, 1.6, 40, 20, 1, true));
  const beacons = [hall, police].map((b) => {
    const m = new THREE.Mesh(beaconGeo, beaconMat);
    m.position.set(b.position.x, 20, b.position.z);
    scene.add(m);
    return m;
  });

  const arcMat = track(new THREE.MeshBasicMaterial({ color: '#c8ff5a', transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
  const pulseMat = track(new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  const pulseGeo = track(new THREE.SphereGeometry(0.28, 12, 8));
  const start = new THREE.Vector3(0, 6.6, 0.9);
  const arcs = [hall, police].map((b) => {
    const end = new THREE.Vector3(b.position.x, b === hall ? 7.5 : 8.2, b.position.z);
    const mid = start.clone().lerp(end, 0.5);
    mid.y += 14;
    const curve = new THREE.QuadraticBezierCurve3(start.clone(), mid, end);
    const geo = track(new THREE.TubeGeometry(curve, 96, 0.07, 6, false));
    const mesh = new THREE.Mesh(geo, arcMat);
    mesh.geometry.setDrawRange(0, 0);
    scene.add(mesh);
    const pulses = [0, 1, 2].map(() => { const p = new THREE.Mesh(pulseGeo, pulseMat); p.visible = false; scene.add(p); return p; });
    return { curve, mesh, total: geo.index ? geo.index.count : 0, pulses };
  });

  // ── city poles for the finale ───────────────────────────────────────────
  const spots: THREE.Vector3[] = [];
  for (let x = -112; x <= 112; x += 14) {
    if (Math.abs(x) > 2) spots.push(new THREE.Vector3(x, 0, 0.9));
    spots.push(new THREE.Vector3(x + 7, 0, 9.1));
    spots.push(new THREE.Vector3(x, 0, -34.9), new THREE.Vector3(x + 7, 0, 49.1));
  }
  for (const cx of [-72, -36, 36, 72]) for (let z = -84; z <= 92; z += 14) if (Math.abs(z - 5) > 6) spots.push(new THREE.Vector3(cx + 3.6, 0, z));
  const nSpots = opts.low ? Math.floor(spots.length * 0.6) : spots.length;
  const cityPoleGeo = track(new THREE.CylinderGeometry(0.06, 0.1, 5.6, 6));
  cityPoleGeo.translate(0, 2.8, 0);
  const cityPoles = new THREE.InstancedMesh(cityPoleGeo, track(new THREE.MeshStandardMaterial({ color: '#1c241c', metalness: 0.6, roughness: 0.4 })), nSpots);
  const cityLampGeo = track(new THREE.SphereGeometry(0.55, 10, 8));
  const cityLamps = new THREE.InstancedMesh(cityLampGeo, track(new THREE.MeshBasicMaterial({ color: '#efffb0' })), nSpots);
  const poolGeo = track(new THREE.CircleGeometry(4.2, 28));
  poolGeo.rotateX(-Math.PI / 2);
  const pools = new THREE.InstancedMesh(poolGeo, track(new THREE.MeshBasicMaterial({
    color: '#a8ff3a', transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending,
  })), nSpots);
  scene.add(pools);
  const order = spots.slice(0, nSpots).map((p, i) => ({ p, i, d: p.length() })).sort((a, b) => a.d - b.d);
  const maxD = order[order.length - 1].d;
  scene.add(cityPoles, cityLamps);
  let lastCity = -1;
  const setCity = (v: number) => {
    if (Math.abs(v - lastCity) < 0.002) return;
    lastCity = v;
    order.forEach(({ p, d }, k) => {
      const appear = THREE.MathUtils.clamp((v * 1.15 - d / maxD) * 6, 0, 1);
      const s = appear < 0.001 ? 0.0001 : appear;
      m4.compose(p, new THREE.Quaternion(), new THREE.Vector3(1, s, 1));
      cityPoles.setMatrixAt(k, m4);
      m4.compose(new THREE.Vector3(p.x, 5.7 * s, p.z), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
      cityLamps.setMatrixAt(k, m4);
      m4.compose(new THREE.Vector3(p.x, 0.05, p.z), new THREE.Quaternion(), new THREE.Vector3(s, 1, s));
      pools.setMatrixAt(k, m4);
    });
    cityPoles.instanceMatrix.needsUpdate = true;
    cityLamps.instanceMatrix.needsUpdate = true;
    pools.instanceMatrix.needsUpdate = true;
  };
  setCity(0);

  let inCone = 0;
  let lastT = 0, lampLevel = 0;
  const update = (t: number, s: WorldState) => {
    lastT = t;
    const night = 1 - s.day;
    // sky + light
    const sunAngle = THREE.MathUtils.lerp(-0.25, Math.PI + 0.25, s.sun);
    const sunDir = new THREE.Vector3(Math.cos(sunAngle), Math.sin(sunAngle) * 0.85 + 0.05, -0.45).normalize();
    sky.mat.uniforms.uDay.value = s.day;
    sky.mat.uniforms.uTime.value = t;
    sky.mat.uniforms.uSun.value.copy(sunDir);
    sunLight.position.copy(sunDir).multiplyScalar(60);
    sunLight.intensity = 3.2 * Math.max(0, s.day - 0.15);
    sunLight.color.setHSL(0.09, 0.8, 0.55 + 0.25 * s.day);
    hemi.intensity = 0.25 + 1.1 * s.day;
    moon.intensity = 0.4 * night;
    studio.intensity = 42 * s.explode;
    (scene.fog as THREE.FogExp2).density = 0.012 + 0.012 * s.explode;
    (scene.fog as THREE.FogExp2).color.setRGB(0.008 + 0.55 * s.day * 0.6, 0.02 + 0.5 * s.day * 0.55, 0.008 + 0.45 * s.day * 0.5);
    // Focus: while the pole is apart, the city falls back so the parts read.
    buildingMat.emissiveIntensity = (0.05 + 1.1 * Math.pow(night, 1.5)) * (1 - 0.85 * s.explode);
    houseMat.color.copy(BUILD_NIGHT).lerp(BUILD_DAY, s.day);
    roofMat.color.copy(BUILD_NIGHT).lerp(BUILD_DAY, s.day);
    groundMat.color.copy(GROUND_NIGHT).lerp(GROUND_DAY, s.day);
    walkMat.color.copy(WALK_NIGHT).lerp(WALK_DAY, s.day);
    roadMat.color.copy(ROAD_NIGHT).lerp(ROAD_DAY, s.day);

    // pole: the panel follows the sun while it's up; otherwise idles back to level
    pole.root.rotation.y = s.turn;
    const tilt = s.day > 0.2 ? THREE.MathUtils.clamp(-Math.cos(sunAngle) * 0.55, -0.55, 0.55) : 0;
    // PIR: someone close to the pole at night brightens the lamp
    let near = 0;
    for (const w of walkers) near = Math.max(near, 1 - Math.min(1, Math.abs(w.g.position.x) / 4) * (Math.abs(w.z + 0.9) < 1 ? 1 : 2));
    near = Math.max(near, fighting);
    // Adaptive lamp: a low glow on an empty street, full brightness the moment
    // the PIR sees someone, then a slow fade back down after they pass.
    if (s.lamp >= 1.9) near = 1;
    const wantLamp = s.lamp > 0 ? Math.min(2, s.lamp * 0.25 + near * 2) : 0;
    lampLevel += (wantLamp - lampLevel) * (wantLamp > lampLevel ? 0.25 : 0.03);
    const lamp = lampLevel;
    pole.update(t, s.explode, { tilt, lamp, cone: s.scan, open: s.open });

    // energy flow
    flowMat.opacity = s.energy * 0.95;
    for (let i = 0; i < N_FLOW; i++) {
      const [seed, dx, dz] = flowSeeds[i];
      flow.getPoint((seed + t * 0.22) % 1, tmpV);
      flowPos[i * 3] = tmpV.x + dx; flowPos[i * 3 + 1] = tmpV.y; flowPos[i * 3 + 2] = tmpV.z + dz;
    }
    flowGeo.attributes.position.needsUpdate = true;

    // scan
    rings.mat.uniforms.uTime.value = t;
    rings.mat.uniforms.uStrength.value = Math.max(s.scan, s.city * 0.6);
    inCone = 0;
    walkers.forEach((w) => {
      const x = ((w.off + t * w.speed) % 50 + 50) % 50 - 25;
      w.g.position.set(x, 0.14, w.z);
      w.g.rotation.y = w.speed > 0 ? Math.PI / 2 : -Math.PI / 2;
      w.g.children[0].position.y = 0.75 + Math.abs(Math.sin(t * 6 + w.off)) * 0.04;
      const seen = Math.abs(x) < 9 ? 1 : 0;
      inCone += seen;
      const a = s.scan * seen;
      w.box.visible = w.label.visible = a > 0.02;
      (w.label.material as THREE.SpriteMaterial).opacity = a;
    });
    boxMat.opacity = s.scan;

    // cars
    for (const c of cars) {
      c.g.position.x = (((c.off + t * c.speed) % 240) + 240) % 240 - 120;
      c.g.visible = s.explode < 0.3;
    }

    // fist fight: an occasional event while the street is live
    const ft = t - fightAt;
    if (ft > FIGHT_LEN) {
      fightAt = t + 12 + rand() * 12;
      fightX = -1.5 + rand() * 3;
      fightZ = 9.8; // always across the street, inside the camera's view
    }
    const live = ft >= 0 && ft <= FIGHT_LEN && s.explode < 0.2 && s.city < 0.2;
    fight.visible = live;
    fighting = 0;
    if (live) {
      fight.position.set(fightX, 0.14, fightZ);
      const approach = THREE.MathUtils.clamp(ft / 1.6, 0, 1), leave = THREE.MathUtils.clamp((ft - (FIGHT_LEN - 1.8)) / 1.8, 0, 1);
      const brawl = ft > 1.6 && ft < FIGHT_LEN - 1.8;
      fighting = brawl ? 1 : 0;
      fighters.forEach((f, k) => {
        const gap = THREE.MathUtils.lerp(3.2, 0.55, approach) + leave * 6;
        const lunge = brawl ? Math.max(0, Math.sin(t * 9 + k * Math.PI)) * 0.18 : 0;
        f.g.position.set(f.side * (gap / 2 - lunge), 0, Math.sin(t * 3 + k) * 0.08 * fighting);
        f.g.rotation.y = f.side < 0 ? Math.PI / 2 : -Math.PI / 2;
        if (leave > 0) f.g.rotation.y += Math.PI;
        f.g.rotation.z = brawl ? Math.sin(t * 7 + k) * 0.08 : 0;
        f.arms.forEach((a, j) => {
          const punch = brawl ? Math.max(0, Math.sin(t * 9 + k * Math.PI + j * 1.7)) : 0;
          a.rotation.x = -(0.25 + 1.35 * punch);
        });
      });
      const flag = (brawl ? 1 : 0) * Math.max(0.35, s.scan);
      fightBoxMat.opacity = flag;
      (fightLabel.material as THREE.SpriteMaterial).opacity = flag;
      fightBox.visible = fightLabel.visible = flag > 0.02;
      fightBox.scale.setScalar(1 + Math.sin(t * 8) * 0.02);
    }

    // network
    beaconMat.opacity = 0.18 * s.network;
    beacons.forEach((b) => (b.visible = s.network > 0.01));
    hallMat.emissiveIntensity = 0.06 + 0.5 * s.network;
    policeMat.emissiveIntensity = 0.08 + 0.6 * s.network;
    lightBar.visible = Math.sin(t * 10) > 0 || s.network < 0.5;
    arcs.forEach((a, k) => {
      const grow = THREE.MathUtils.clamp(s.network * 1.6 - k * 0.25, 0, 1);
      a.mesh.geometry.setDrawRange(0, Math.floor(a.total * grow / 3) * 3);
      a.pulses.forEach((p, j) => {
        p.visible = grow >= 1;
        if (p.visible) p.position.copy(a.curve.getPoint(((t * 0.45 + j / 3) % 1)));
      });
    });

    // city
    setCity(s.city);
  };

  const dispose = () => {
    pole.dispose();
    for (const d of disposables) d.dispose();
    dashes.dispose(); stripes.dispose(); cityPoles.dispose(); cityLamps.dispose(); pools.dispose();
  };

  const triggerFight = () => { fightAt = lastT; fightX = 0; fightZ = 9.8; };
  return { pole, update, pedestriansInCone: () => inCone, triggerFight, dispose };
}
