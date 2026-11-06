import * as THREE from 'three';

/* The EcoVision smartpole, built from primitives -- no model file to download.
 *
 * Every hardware part is its own group with:
 *   - an explode offset (where it moves to in the exploded view),
 *   - a label anchor (the point its on-screen label is pinned to),
 *   - the copy shown for it.
 * The same model serves the hero (assembled, idling) and the blueprint
 * section (exploded by scroll), so both always show the same hardware.
 */

export type PolePart = {
  key: string;
  label: string;
  detail: string;
  group: THREE.Group;
  home: THREE.Vector3;
  explode: THREE.Vector3;
  anchor: THREE.Vector3; // label point, in the part's local space
};

/** Optional outside control, for scenes that direct the pole (the /reimagined
 *  story). Anything left undefined keeps the idle animation. */
export type PoleControl = {
  tilt?: number;   // solar panel angle, radians
  lamp?: number;   // 0 = off, 1 = normal, 2 = full brightness
  cone?: number;   // detection cone strength, 0..1
  open?: number;   // controller box opened up to show its boards, 0..1
};

export type Pole = {
  root: THREE.Group;
  parts: PolePart[];
  /** Advance idle animations. t = seconds, explode = 0 (assembled) .. 1 (apart). */
  update: (t: number, explode: number, ctl?: PoleControl) => void;
  dispose: () => void;
};

const GREEN = new THREE.Color('#76b900');
const ACCENT = new THREE.Color('#a8d400');

function solarTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 320;
  const g = c.getContext('2d')!;
  g.fillStyle = '#0a1426';
  g.fillRect(0, 0, c.width, c.height);
  const cols = 8, rows = 5, pad = 6;
  const cw = (c.width - pad * (cols + 1)) / cols;
  const ch = (c.height - pad * (rows + 1)) / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = pad + x * (cw + pad), py = pad + y * (ch + pad);
      const grad = g.createLinearGradient(px, py, px + cw, py + ch);
      grad.addColorStop(0, '#1d3a6b');
      grad.addColorStop(1, '#0f2142');
      g.fillStyle = grad;
      g.fillRect(px, py, cw, ch);
      g.strokeStyle = 'rgba(160,200,255,0.18)';
      g.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        g.beginPath();
        g.moveTo(px + (cw * i) / 4, py);
        g.lineTo(px + (cw * i) / 4, py + ch);
        g.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function buildPole(): Pole {
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => { disposables.push(x); return x; };

  const metal = track(new THREE.MeshStandardMaterial({ color: '#1c241c', metalness: 0.75, roughness: 0.38 }));
  const metalLight = track(new THREE.MeshStandardMaterial({ color: '#3a443a', metalness: 0.7, roughness: 0.35 }));
  const concrete = track(new THREE.MeshStandardMaterial({ color: '#2a2d2a', metalness: 0, roughness: 0.95 }));
  const enclosure = track(new THREE.MeshStandardMaterial({ color: '#d7dbd2', metalness: 0.1, roughness: 0.55 }));
  const darkPlastic = track(new THREE.MeshStandardMaterial({ color: '#101310', metalness: 0.2, roughness: 0.5 }));
  const glowGreen = track(new THREE.MeshStandardMaterial({ color: GREEN, emissive: GREEN, emissiveIntensity: 1.6 }));
  const glowRed = track(new THREE.MeshStandardMaterial({ color: '#ff3b30', emissive: '#ff2a1f', emissiveIntensity: 1.2 }));
  const ledMat = track(new THREE.MeshStandardMaterial({ color: '#fffbe6', emissive: '#fff4cc', emissiveIntensity: 2.2 }));
  const glass = track(new THREE.MeshStandardMaterial({ color: '#0a0f14', metalness: 0.9, roughness: 0.08 }));
  const panelTex = track(solarTexture());
  const panelMat = track(new THREE.MeshStandardMaterial({ map: panelTex, metalness: 0.45, roughness: 0.25 }));
  const coneMat = track(new THREE.MeshBasicMaterial({
    color: GREEN, transparent: true, opacity: 0.13, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  }));

  const box = (w: number, h: number, d: number) => track(new THREE.BoxGeometry(w, h, d));
  const cyl = (rt: number, rb: number, h: number, seg = 32) => track(new THREE.CylinderGeometry(rt, rb, h, seg));
  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  const parts: PolePart[] = [];
  const part = (key: string, label: string, detail: string, home: [number, number, number],
                explode: [number, number, number], anchor: [number, number, number]) => {
    const group = new THREE.Group();
    group.position.set(...home);
    root.add(group);
    const p: PolePart = {
      key, label, detail, group,
      home: new THREE.Vector3(...home), explode: new THREE.Vector3(...explode), anchor: new THREE.Vector3(...anchor),
    };
    parts.push(p);
    return p;
  };

  // ── fixed structure: footing and pole (they don't move) ──────────────────
  const footing = mesh(cyl(0.42, 0.48, 0.28), concrete);
  footing.position.y = 0.14;
  root.add(footing);
  const POLE_H = 5.6;
  const pole = mesh(cyl(0.065, 0.11, POLE_H), metal);
  pole.position.y = 0.28 + POLE_H / 2;
  root.add(pole);
  const cap = mesh(cyl(0.09, 0.09, 0.06), metalLight);
  cap.position.y = 0.28 + POLE_H + 0.03;
  root.add(cap);
  // a thin glowing seam up the pole -- the brand accent
  const seam = mesh(box(0.012, POLE_H * 0.92, 0.012), glowGreen);
  seam.position.set(0, 0.28 + POLE_H / 2, 0.085);
  root.add(seam);

  const TOP = 0.28 + POLE_H;

  // ── solar panel on a single-axis tracker ─────────────────────────────────
  // The mount is a claw, not a straight post: a short mast, arms out to both
  // sides, then straight up again, carrying the panel's axle between the two
  // tips. A servo on one tip turns the axle; two LDRs on the panel, split by
  // a small shade divider, tell it which way the sun is brighter.
  const solar = part('solar', 'Solar panel · servo & LDR tracker',
    'Two light sensors (LDRs) on the panel compare which side is brighter, and a servo turns it on one axis to follow the sun.',
    [0, TOP, 0], [0, 0.85, 0], [0.8, 0.75, 0]);
  const CLAW_W = 0.56, CLAW_H = 0.42, MAST_H = 0.22;
  const mast = mesh(cyl(0.04, 0.05, MAST_H), metalLight);
  mast.position.y = MAST_H / 2;
  solar.group.add(mast);
  const clawBar = mesh(box(0.05, 0.05, CLAW_W * 2 + 0.05), metalLight);
  clawBar.position.y = MAST_H;
  solar.group.add(clawBar);
  for (const z of [-CLAW_W, CLAW_W]) {
    const upright = mesh(box(0.05, CLAW_H, 0.05), metalLight);
    upright.position.set(0, MAST_H + CLAW_H / 2, z);
    solar.group.add(upright);
  }
  const AXLE_Y = MAST_H + CLAW_H;
  const axle = mesh(cyl(0.025, 0.025, CLAW_W * 2), metalLight);
  axle.rotation.x = Math.PI / 2;
  axle.position.y = AXLE_Y;
  solar.group.add(axle);
  // Servo on the near tip, its horn on the axle.
  const servoMat = track(new THREE.MeshStandardMaterial({ color: '#1f3fae', metalness: 0.2, roughness: 0.45 }));
  const servo = mesh(box(0.1, 0.13, 0.08), servoMat);
  servo.position.set(0, AXLE_Y - 0.02, CLAW_W + 0.07);
  solar.group.add(servo);
  const servoHorn = mesh(box(0.11, 0.02, 0.012), enclosure);
  servoHorn.position.set(0, AXLE_Y, CLAW_W + 0.115);
  solar.group.add(servoHorn);

  const tracker = new THREE.Group();          // turns about the axle (z)
  tracker.position.y = AXLE_Y;
  solar.group.add(tracker);
  const frame = mesh(box(1.5, 0.05, CLAW_W * 2 - 0.12), metalLight);
  frame.position.y = 0.05;
  tracker.add(frame);
  const panel = mesh(box(1.44, 0.02, CLAW_W * 2 - 0.18), panelMat);
  panel.position.y = 0.085;
  tracker.add(panel);
  // LDR pair either side of a shade divider, on the panel's top edge.
  const ldrBase = mesh(box(0.16, 0.025, 0.1), darkPlastic);
  ldrBase.position.set(0, 0.11, -(CLAW_W - 0.16));
  tracker.add(ldrBase);
  const divider = mesh(box(0.012, 0.09, 0.1), darkPlastic);
  divider.position.set(0, 0.165, -(CLAW_W - 0.16));
  tracker.add(divider);
  const ldrMat = track(new THREE.MeshStandardMaterial({ color: '#c2412a', emissive: '#5a1408', emissiveIntensity: 0.6, roughness: 0.3 }));
  for (const x of [-0.045, 0.045]) {
    const ldr = mesh(cyl(0.022, 0.022, 0.015, 20), ldrMat);
    ldr.position.set(x, 0.13, -(CLAW_W - 0.16));
    tracker.add(ldr);
  }

  // ── LED lamp on its arm ──────────────────────────────────────────────────
  const lamp = part('lamp', 'Adaptive LED lamp',
    'The street light. It runs dim and brightens when the motion sensor sees someone.',
    [0, TOP - 0.35, 0], [0, 0.45, 1.1], [1.75, 0, 0]);
  lamp.group.rotation.y = -Math.PI / 2; // arm reaches out over the street, head right above the camera
  const arm = mesh(box(1.5, 0.055, 0.055), metal);
  arm.position.set(0.75, 0, 0);
  arm.rotation.z = 0.08;
  lamp.group.add(arm);
  const head = mesh(box(0.62, 0.09, 0.28), metal);
  head.position.set(1.55, 0.04, 0);
  lamp.group.add(head);
  const ledFace = mesh(box(0.54, 0.012, 0.22), ledMat);
  ledFace.position.set(1.55, -0.012, 0);
  lamp.group.add(ledFace);
  const lampLight = new THREE.PointLight('#fff1c8', 2.2, 9, 1.6);
  lampLight.position.set(1.55, -0.25, 0);
  lamp.group.add(lampLight);
  // the actual street light: a wide cone down onto the sidewalk and road
  const lampSpot = new THREE.SpotLight('#ffe9c4', 0, 18, 1.05, 0.65, 1.3);
  lampSpot.position.set(1.55, -0.05, 0);
  lampSpot.target.position.set(2.6, -6, 0);
  lamp.group.add(lampSpot, lampSpot.target);

  // ── PIR motion sensor ────────────────────────────────────────────────────
  // Under the lamp head, looking down at the street it lights.
  const pir = part('pir', 'PIR motion sensor',
    'Senses movement below the pole so the lamp only runs bright when someone is there.',
    [0, TOP - 0.44, 1.2], [0.5, -0.35, 0.9], [0.1, -0.06, 0]);
  const pirBody = mesh(box(0.12, 0.06, 0.12), enclosure);
  pir.group.add(pirBody);
  const dome = mesh(track(new THREE.SphereGeometry(0.05, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2)), track(
    new THREE.MeshStandardMaterial({ color: '#f4f6ef', roughness: 0.2, transparent: true, opacity: 0.9 })));
  dome.rotation.x = Math.PI;
  dome.position.y = -0.03;
  pir.group.add(dome);

  // ── AI camera with its detection cone ────────────────────────────────────
  // Under the lamp arm, on the pole, looking out over the sidewalk and street.
  const CAM_Y = TOP - 0.95;
  const camera = part('camera', 'AI camera',
    'Its feed is analysed locally by the EcoVision AI: YOLO11 for people and weapons, X3D for fights, robbery and vandalism.',
    [0, CAM_Y, 0.1], [0, -0.15, 1.5], [0.2, 0.15, 0.5]);
  const bracket = mesh(box(0.06, 0.06, 0.28), metal);
  bracket.position.z = 0.1;
  camera.group.add(bracket);
  const camPivot = new THREE.Group();
  camPivot.position.set(0, -0.02, 0.26);
  camPivot.rotation.x = 0.42; // tilted down at the street
  camera.group.add(camPivot);
  const housing = mesh(box(0.17, 0.17, 0.44), enclosure);
  housing.position.z = 0.16;
  camPivot.add(housing);
  const hood = mesh(box(0.21, 0.02, 0.5), enclosure);
  hood.position.set(0, 0.095, 0.2);
  camPivot.add(hood);
  const lens = mesh(cyl(0.055, 0.055, 0.04), glass);
  lens.rotation.x = Math.PI / 2;
  lens.position.z = 0.39;
  camPivot.add(lens);
  const recDot = mesh(track(new THREE.SphereGeometry(0.014, 12, 8)), glowRed);
  recDot.position.set(0.06, 0.05, 0.385);
  camPivot.add(recDot);
  // The field of view: a translucent cone that sweeps, like a detection scan.
  const sweep = new THREE.Group();
  sweep.position.z = 0.4;
  camPivot.add(sweep);
  const CONE_LEN = 3.2;
  const cone = new THREE.Mesh(track(new THREE.ConeGeometry(1.05, CONE_LEN, 40, 1, true)), coneMat);
  cone.rotation.x = -Math.PI / 2;
  cone.position.z = CONE_LEN / 2;
  sweep.add(cone);

  // ── siren and strobe ─────────────────────────────────────────────────────
  // On top of the controller box, behind the camera.
  const siren = part('siren', 'Siren & strobe',
    'Sounds on a confirmed alert or a panic press, and can be silenced from the dashboard.',
    [0, CAM_Y + 0.52, -0.16], [-0.3, 0.6, -1.2], [0.22, 0.12, -0.3]);
  siren.group.rotation.y = Math.PI;
  const sirenMount = mesh(box(0.06, 0.06, 0.2), metal);
  sirenMount.position.z = 0.08;
  siren.group.add(sirenMount);
  const horn = mesh(cyl(0.14, 0.08, 0.24), darkPlastic);
  horn.rotation.x = -Math.PI / 2;   // bell facing the street
  horn.position.z = 0.3;
  siren.group.add(horn);
  const strobe = mesh(cyl(0.06, 0.06, 0.08), glowRed);
  strobe.position.set(0, 0.13, 0.26);
  siren.group.add(strobe);

  // ── ESP32 controller and solar charger ───────────────────────────────────
  const ctrl = part('controller', 'ESP32 controller & solar charger',
    'Drives the siren, button and lamp, manages charging, and reports the pole’s status to the dashboard.',
    [0, CAM_Y + 0.2, -0.12], [-0.9, 0.35, -1.1], [-0.15, 0.1, 0.08]);
  ctrl.group.rotation.y = Math.PI;   // behind the camera, facing outward
  const ctrlBox = mesh(box(0.3, 0.36, 0.14), enclosure);
  ctrlBox.position.z = 0.04;
  ctrl.group.add(ctrlBox);
  const ctrlLed = mesh(box(0.05, 0.012, 0.01), glowGreen);
  ctrlLed.position.set(0.07, 0.12, 0.115);
  ctrl.group.add(ctrlLed);
  // What's inside the box. Hidden until the box is clicked; then the lid
  // fades and the boards slide out, each with its own tag.
  const boardsOut = new THREE.Group();
  boardsOut.visible = false;
  ctrl.group.add(boardsOut);
  const pcb = (color: string) => track(new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15 }));
  const chipMat = track(new THREE.MeshStandardMaterial({ color: '#16181a', roughness: 0.4, metalness: 0.4 }));
  const coilMat = track(new THREE.MeshStandardMaterial({ color: '#3b3b3b', roughness: 0.6, metalness: 0.5 }));
  const tag = (text: string) => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 96;
    const g = c.getContext('2d')!;
    g.fillStyle = 'rgba(4,10,4,0.88)'; g.fillRect(0, 10, 512, 76);
    g.strokeStyle = '#b6ff3a'; g.lineWidth = 3; g.strokeRect(1.5, 11.5, 509, 73);
    g.fillStyle = '#e9ffd0'; g.font = 'bold 34px "JetBrains Mono", monospace'; g.textBaseline = 'middle';
    g.fillText(text, 18, 49);
    const tex = track(new THREE.CanvasTexture(c));
    tex.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })));
    sp.scale.set(0.24, 0.045, 1);
    sp.renderOrder = 10;
    return sp;
  };
  type Board = { g: THREE.Group; to: THREE.Vector3 };
  const boards: Board[] = [];
  const addBoard = (label: string, color: string, w: number, h: number, to: [number, number, number], extra: (g: THREE.Group) => void) => {
    const g = new THREE.Group();
    const base = mesh(box(w, h, 0.012), pcb(color));
    g.add(base);
    extra(g);
    const t = tag(label);
    t.position.set(0, h / 2 + 0.06, 0.02);
    g.add(t);
    boardsOut.add(g);
    boards.push({ g, to: new THREE.Vector3(...to) });
  };
  addBoard('ESP32 MICROCONTROLLER', '#1b1d22', 0.11, 0.06, [0, 0.3, 0.32], (g) => {
    const can = mesh(box(0.04, 0.045, 0.008), track(new THREE.MeshStandardMaterial({ color: '#b8bcc2', metalness: 0.8, roughness: 0.3 })));
    can.position.set(-0.02, 0, 0.01); g.add(can);
    const usb = mesh(box(0.016, 0.01, 0.008), chipMat); usb.position.set(0.05, 0, 0.01); g.add(usb);
  });
  addBoard('SOLAR CHARGE CONTROLLER', '#1f6b35', 0.17, 0.11, [-0.3, 0.05, 0.36], (g) => {
    const chip = mesh(box(0.035, 0.035, 0.01), chipMat); chip.position.set(-0.03, 0.01, 0.01); g.add(chip);
    const cap = mesh(cyl(0.012, 0.012, 0.03, 14), track(new THREE.MeshStandardMaterial({ color: '#2a3fa0', roughness: 0.4 })));
    cap.rotation.x = Math.PI / 2; cap.position.set(0.04, 0.02, 0.02); g.add(cap);
    const term = mesh(box(0.14, 0.018, 0.02), track(new THREE.MeshStandardMaterial({ color: '#2f8f3c', roughness: 0.5 })));
    term.position.set(0, -0.04, 0.012); g.add(term);
  });
  for (const [k, side] of [[1, 1], [2, -1]] as const) {
    addBoard(`BUCK CONVERTER ${k === 1 ? '12V>5V' : '5V>3.3V'}`, '#1f3fae', 0.09, 0.05, [0.3 * side + (side > 0 ? 0 : 0), -0.2 - (k - 1) * 0.12, 0.34], (g) => {
      const coil = mesh(cyl(0.014, 0.014, 0.014, 16), coilMat);
      coil.rotation.x = Math.PI / 2; coil.position.set(-0.015, 0, 0.012); g.add(coil);
      const pot = mesh(box(0.012, 0.018, 0.012), track(new THREE.MeshStandardMaterial({ color: '#2c5bd8' })));
      pot.position.set(0.025, 0.01, 0.01); g.add(pot);
    });
  }
  const ctrlBoxMat = ctrlBox.material as THREE.MeshStandardMaterial;
  let openNow = 0;

  // ── LiFePO4 battery ──────────────────────────────────────────────────────
  const batt = part('battery', 'LiFePO4 battery · 12 V 50 Ah',
    'Stores the day’s solar energy so the light, camera link and siren keep running all night.',
    [0, CAM_Y - 0.42, -0.16], [0.95, -0.2, -1.15], [0.24, 0.15, 0.1]);
  batt.group.rotation.y = Math.PI;   // behind the camera, under the controller
  const battBox = mesh(box(0.44, 0.72, 0.24), enclosure);
  battBox.position.z = 0.04;
  batt.group.add(battBox);
  const battStripe = mesh(box(0.44, 0.04, 0.01), glowGreen);
  battStripe.position.set(0, 0.22, 0.165);
  batt.group.add(battStripe);
  for (const y of [0.1, -0.05, -0.2]) {
    const vent = mesh(box(0.3, 0.012, 0.005), darkPlastic);
    vent.position.set(0, y, 0.163);
    batt.group.add(vent);
  }

  // ── panic button ─────────────────────────────────────────────────────────
  const panic = part('panic', 'Panic button',
    'One press raises an incident with a snapshot from the camera and can trigger the siren.',
    [0, 1.2, 0.13], [-0.4, -0.05, 1.0], [0.1, 0.12, 0.1]);
  const panicBox = mesh(box(0.18, 0.24, 0.08), track(new THREE.MeshStandardMaterial({ color: '#f2c200', roughness: 0.5 })));
  panicBox.position.z = 0.02;
  panic.group.add(panicBox);
  const button = mesh(cyl(0.05, 0.055, 0.04), glowRed);
  button.rotation.x = Math.PI / 2;
  button.position.z = 0.075;
  panic.group.add(button);

  // ── ground: a dim grid disc ──────────────────────────────────────────────
  const grid = new THREE.GridHelper(9, 36, GREEN, new THREE.Color('#1b3510'));
  const gridMat = grid.material as THREE.Material;
  gridMat.transparent = true;
  gridMat.opacity = 0.28;
  track(grid.geometry);
  track(gridMat);
  root.add(grid);
  const groundGlow = new THREE.Mesh(track(new THREE.CircleGeometry(1.8, 48)), track(new THREE.MeshBasicMaterial({
    color: ACCENT, transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending,
  })));
  groundGlow.rotation.x = -Math.PI / 2;
  groundGlow.position.y = 0.005;
  root.add(groundGlow);

  const tmp = new THREE.Vector3();
  const update = (t: number, explode: number, ctl?: PoleControl) => {
    // Sun tracking: a slow east-west tilt.
    tracker.rotation.z = ctl?.tilt ?? Math.sin(t * 0.25) * 0.42;
    servoHorn.rotation.z = tracker.rotation.z;
    // Detection scan.
    sweep.rotation.y = Math.sin(t * 0.8) * 0.45;
    coneMat.opacity = (0.09 + 0.05 * (0.5 + 0.5 * Math.sin(t * 3.1))) * (ctl?.cone ?? 1);
    recDot.visible = Math.sin(t * 4) > -0.2;
    // Strobe and button glow.
    (strobe.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + 1.4 * Math.max(0, Math.sin(t * 2.4));
    lampLight.intensity = ctl?.lamp !== undefined ? 0.35 * ctl.lamp : 1.6 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.6));
    lampSpot.intensity = ctl?.lamp !== undefined ? 24 * ctl.lamp * (1 - explode) : 0;
    ledMat.emissiveIntensity = ctl?.lamp !== undefined ? 0.15 + 1.4 * ctl.lamp : 2.2;
    // Explode: ease each part out along its own offset.
    const e = explode * explode * (3 - 2 * explode);
    for (const p of parts) {
      tmp.copy(p.explode).multiplyScalar(e);
      p.group.position.copy(p.home).add(tmp);
    }
    cone.visible = explode < 0.35 && (ctl?.cone ?? 1) > 0.01;
    // Controller opened up: lid goes see-through, boards slide out.
    openNow += ((ctl?.open ?? 0) - openNow) * 0.12;
    boardsOut.visible = openNow > 0.01;
    const lidSee = openNow > 0.01;
    if (lidSee !== ctrlBoxMat.transparent) { ctrlBoxMat.transparent = lidSee; ctrlBoxMat.needsUpdate = true; }
    ctrlBoxMat.opacity = 1 - 0.75 * openNow;
    const k = openNow * openNow * (3 - 2 * openNow);
    for (const b of boards) {
      b.g.position.set(b.to.x * k * 1.3, b.to.y * k * 1.3, 0.04 + b.to.z * k);
      b.g.scale.setScalar(0.4 + 1.4 * k);
    }
  };

  const dispose = () => {
    for (const d of disposables) d.dispose();
  };

  return { root, parts, update, dispose };
}

/** Shared renderer setup: transparent background, soft lighting, shadows off
 *  on small screens. Returns everything a scene component needs. */
export function createStage(canvas: HTMLCanvasElement, opts: { shadows: boolean }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = opts.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight('#cfe8b0', '#050805', 0.9));
  const sun = new THREE.DirectionalLight('#fff6e0', 2.0);
  sun.position.set(4, 8, 5);
  sun.castShadow = opts.shadows;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -4;
  sun.shadow.camera.right = 4;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -1;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(GREEN, 2.4);
  rim.position.set(-5, 4, -4);
  scene.add(rim);

  return { renderer, scene, camera };
}
