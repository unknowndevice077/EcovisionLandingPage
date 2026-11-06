'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { buildWorld, type WorldState } from './engine/world';
import { MODES, DOCK, PART_VIEW, PART_FACTS, type ModeKey } from './engine/modes';
import { TEAM } from '../data/team';
import './explorer.css';

/* EcoVision as an interactive 3D explorer.
 *
 * The pole stands on its street; the visitor drags to spin it, zooms in, and
 * taps glowing hotspots to fly to a part. Everything else on the site lives in
 * panels opened from the dock: each one also moves the camera and changes the
 * world (day for Power, night and passers-by for Light, the scan for Sight...).
 *
 * React owns the UI; one rAF loop owns the 3D. They talk through `ctl`, a ref
 * the loop reads every frame, so a click never waits on a re-render.
 */

type PartInfo = { key: string; label: string; detail: string };

const STATS = [
  { v: 94, suffix: '%', label: 'of fights caught', note: '200 held-out fights' },
  { v: 0.4, suffix: '/hr', label: 'false alarms', note: '5 h of street cameras', dec: 1 },
  { v: 59, suffix: '%', label: 'of robberies flagged', note: '133 held-out events' },
  { v: 3880, suffix: '', label: 'clips we captured', note: 'Philippine street cameras' },
];

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const hourLabel = (h: number) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

export default function Explorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hotspotRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<ModeKey>('explore');
  const [part, setPart] = useState<string | null>(null);
  const [parts, setParts] = useState<PartInfo[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hour, setHour] = useState(9);
  const [tiltDeg, setTiltDeg] = useState(0);
  const [walkBy, setWalkBy] = useState(false);
  const [hint, setHint] = useState(true);
  const [stats, setStats] = useState(STATS.map(() => 0));

  // What the 3D loop needs to know, updated from React without re-running the loop.
  const pickRef = useRef<(key: string) => void>(() => {});
  const fightRef = useRef<() => void>(() => {});
  const ctl = useRef({ mode: 'explore' as ModeKey, part: null as string | null, hour: 9, walkBy: false, ready: false, fly: 0 });
  useEffect(() => { ctl.current.mode = mode; ctl.current.part = part; ctl.current.fly++; }, [mode, part]);
  useEffect(() => { ctl.current.hour = hour; }, [hour]);
  useEffect(() => { ctl.current.walkBy = walkBy; }, [walkBy]);
  useEffect(() => { ctl.current.ready = ready; }, [ready]);

  // ── the 3D world ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const low = window.innerWidth < 900 || (navigator.hardwareConcurrency || 8) <= 4;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, powerPreference: 'high-performance' });
    } catch {
      queueMicrotask(() => { setFailed(true); setReady(true); });
      return;
    }
    const report = (v: number) => queueMicrotask(() => setLoaded(v));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1200);
    report(0.3);
    const world = buildWorld(scene, { low });
    const poleParts = world.pole.parts;
    fightRef.current = world.triggerFight;
    queueMicrotask(() => setParts(poleParts.map(({ key, label, detail }) => ({ key, label, detail }))));
    report(0.65);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.5, 0.85);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // Drag to spin, scroll or pinch to zoom; no panning, never under the street.
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 2.2;
    controls.maxDistance = 150;
    controls.maxPolarAngle = 1.5;
    controls.rotateSpeed = 0.6;
    controls.autoRotateSpeed = 0.45;
    let lastUser = -1e9;
    controls.addEventListener('start', () => { lastUser = performance.now(); setHint(false); });

    // Click a part of the pole itself to open its introduction.
    poleParts.forEach((p) => p.group.traverse((o) => { o.userData.partKey = p.key; }));
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const partAt = (e: PointerEvent): string | null => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      for (const hit of ray.intersectObject(world.pole.root, true)) {
        const m = (hit.object as THREE.Mesh).material as THREE.Material | undefined;
        if (!hit.object.visible || !m || m.transparent) continue; // skip the view cone and glows
        return (hit.object.userData.partKey as string | undefined) ?? null;
      }
      return null;
    };
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return; }
      down = null;
      const key = partAt(e);
      if (key) pickRef.current(key);
    };
    let hoverT = 0;
    const onMove = (e: PointerEvent) => {
      if (e.buttons || performance.now() - hoverT < 50) return;
      hoverT = performance.now();
      canvas.style.cursor = partAt(e) ? 'pointer' : 'grab';
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointermove', onMove);

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.resolution.set(w / 2, h / 2);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    // Start high above the city; the intro flies down once the boot screen lifts.
    camera.position.set(22, 120, 70);
    controls.target.set(0, 0, 2);
    controls.update();
    renderer.compile(scene, camera);
    report(1);

    const minBoot = reduced ? 0 : 2200;
    const bootTimer = window.setTimeout(() => setReady(true), minBoot);

    // camera flights
    const fly = { on: false, start: 0, dur: 1600, p0: new THREE.Vector3(), p1: new THREE.Vector3(), t0: new THREE.Vector3(), t1: new THREE.Vector3() };
    const flyTo = (cam: THREE.Vector3, look: THREE.Vector3, dur: number) => {
      fly.p0.copy(camera.position); fly.t0.copy(controls.target);
      fly.p1.copy(cam); fly.t1.copy(look);
      fly.start = performance.now(); fly.dur = reduced ? 1 : dur; fly.on = true;
    };
    const shotFor = (c: typeof ctl.current) => {
      const cam = new THREE.Vector3(), look = new THREE.Vector3();
      const p = c.part ? poleParts.find((x) => x.key === c.part) : null;
      if (p) {
        p.group.getWorldPosition(look);
        const off = PART_VIEW[p.key] ?? [2, 0.5, 2.5];
        cam.set(look.x + off[0], look.y + off[1], look.z + off[2]);
      } else {
        const s = MODES[c.mode].shot;
        cam.set(...s.cam); look.set(...s.look);
      }
      // Phones: frame from a little further back so the pole fits the tall view.
      if (camera.aspect < 0.9) cam.sub(look).multiplyScalar(1.35).add(look);
      return { cam, look };
    };

    const state: WorldState = { ...MODES.explore.state };
    const target: WorldState = { ...MODES.explore.state };
    const keys = Object.keys(state) as (keyof WorldState)[];
    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3(), axis = new THREE.Vector3(), toCam = new THREE.Vector3(), toPart = new THREE.Vector3();
    let raf = 0, flyKey = -1, introDone = false, lastTilt = 999, shift = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const t = clock.getElapsedTime();
      const now = performance.now();
      const c = ctl.current;

      // camera: intro, then a flight whenever the mode or part changes
      if (c.ready && !introDone) {
        introDone = true;
        flyKey = c.fly;
        const s = shotFor(c);
        flyTo(s.cam, s.look, 3400);
      } else if (introDone && c.fly !== flyKey) {
        flyKey = c.fly;
        const s = shotFor(c);
        flyTo(s.cam, s.look, 1700);
      }
      if (fly.on) {
        const k = ease(Math.min(1, (now - fly.start) / fly.dur));
        camera.position.lerpVectors(fly.p0, fly.p1, k);
        controls.target.lerpVectors(fly.t0, fly.t1, k);
        if (k >= 1) fly.on = false;
      }
      controls.enabled = !fly.on && introDone;
      controls.autoRotate = !reduced && !fly.on && c.mode === 'explore' && !c.part && now - lastUser > 6000;
      controls.update();

      // Phones: an open panel is a bottom sheet over the lower half, so slide
      // the picture up to keep the subject in the part of the screen left.
      const sheet = camera.aspect < 0.9 && (c.part !== null || c.mode !== 'explore') ? 0.26 : 0;
      shift += (sheet - shift) * 0.08;
      const vw = window.innerWidth, vh = window.innerHeight;
      if (shift > 0.002) camera.setViewOffset(vw, vh, 0, shift * vh, vw, vh);
      else camera.clearViewOffset();

      // world: ease toward the mode's state
      Object.assign(target, MODES[c.mode].state);
      if (c.part && c.mode === 'explore') { target.scan = 0; target.lamp = 0.25; }
      target.open = c.part === 'controller' ? 1 : 0;
      if (c.mode === 'power') {
        const sun = (c.hour - 6) / 12;
        target.sun = sun;
        target.day = Math.min(1, Math.max(0, Math.sin(Math.PI * sun) * 1.8));
      }
      if (c.mode === 'light' && c.walkBy) target.lamp = 2;
      const rate = reduced ? 1 : 0.05;
      for (const k of keys) state[k] += (target[k] - state[k]) * rate;
      world.update(t, state);
      bloom.strength = 0.3 + 0.35 * (1 - state.day);

      // panel angle readout for the Power panel
      if (c.mode === 'power') {
        const sunAngle = THREE.MathUtils.lerp(-0.25, Math.PI + 0.25, state.sun);
        const deg = Math.round(THREE.MathUtils.radToDeg(state.day > 0.2 ? THREE.MathUtils.clamp(-Math.cos(sunAngle) * 0.55, -0.55, 0.55) : 0));
        if (deg !== lastTilt) { lastTilt = deg; setTiltDeg(deg); }
      }

      // hotspots: pinned to their parts, dimmed when the part faces away
      const showSpots = (c.mode === 'explore' || c.mode === 'anatomy') && !fly.on;
      const w = window.innerWidth, h = window.innerHeight;
      for (const p of poleParts) {
        const el = hotspotRefs.current[p.key];
        if (!el) continue;
        p.group.localToWorld(tmp.copy(p.anchor));
        axis.set(0.0, tmp.y, 0.9);
        toPart.subVectors(tmp, axis).setY(0).normalize();
        toCam.subVectors(camera.position, axis).setY(0).normalize();
        const facing = toPart.lengthSq() > 0 ? toPart.dot(toCam) : 1;
        tmp.project(camera);
        const onScreen = tmp.z < 1 && Math.abs(tmp.x) < 1.05 && Math.abs(tmp.y) < 1.05;
        if (!showSpots || !onScreen) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; continue; }
        el.style.transform = `translate(${((tmp.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-tmp.y * 0.5 + 0.5) * h).toFixed(1)}px)`;
        const vis = facing < -0.35 ? 0.25 : 1;
        el.style.opacity = String(c.part && c.part !== p.key ? vis * 0.5 : vis);
        el.style.pointerEvents = vis < 0.5 ? 'none' : 'auto';
        el.classList.toggle('is-on', c.part === p.key);
      }

      composer.render();
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(bootTimer);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointermove', onMove);
      controls.dispose();
      world.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  // results: count up when the panel opens
  useEffect(() => {
    if (mode !== 'results') return;
    let raf = 0;
    const s0 = performance.now();
    const tick = () => {
      const f = Math.min(1, (performance.now() - s0) / 1500);
      const e = 1 - Math.pow(1 - f, 3);
      setStats(STATS.map((st) => st.v * e));
      if (f < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  // Esc closes whatever is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (menuOpen) setMenuOpen(false);
      else if (part) setPart(null);
      else if (mode !== 'explore') setMode('explore');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, part, mode]);

  const go = (m: ModeKey) => { setPart(null); setMode(m); setMenuOpen(false); };
  const pick = (key: string) => { setPart(key); if (mode !== 'anatomy') setMode('explore'); setHint(false); };
  useEffect(() => { pickRef.current = pick; });
  const close = () => { if (part) setPart(null); else setMode('explore'); };
  const walk = () => { setWalkBy(true); window.setTimeout(() => setWalkBy(false), 4500); };

  const current = parts.find((p) => p.key === part) ?? null;
  const idx = current ? parts.indexOf(current) : -1;
  const panelOpen = !!current || mode !== 'explore';

  return (
    <div className="ex">
      <canvas ref={canvasRef} className="ex-canvas" aria-label="3D model of the EcoVision smart pole. Drag to look around." />
      {failed && <div className="ex-fallback" />}

      {/* boot */}
      <div className={`ex-boot ${ready ? 'is-done' : ''}`} aria-hidden={ready}>
        <div className="ex-boot-inner">
          <div className="ex-boot-mark">ECOVISION</div>
          <ul className="ex-boot-log">
            <li>&gt; solar array ............ online</li>
            <li>&gt; servo / LDR tracker .... aligned</li>
            <li>&gt; LiFePO4 12 V 50 Ah ..... charged</li>
            <li>&gt; detection models ....... loaded</li>
            <li>&gt; second-stage check ..... armed</li>
            <li>&gt; barangay + police link . connected</li>
          </ul>
          <div className="ex-boot-bar"><div style={{ transform: `scaleX(${loaded})` }} /></div>
        </div>
      </div>

      {/* top bar */}
      <header className={`ex-top ${ready ? 'is-in' : ''}`}>
        <button className="ex-logo" onClick={() => go('explore')}>ECO<span>VISION</span></button>
        <div className="ex-crumb" aria-live="polite">
          <span>{MODES[mode].short}</span>{current && <><i>/</i><b>{current.label.split(' · ')[0]}</b></>}
        </div>
        <div className="ex-top-right">
          <Link className="ex-classic" href="/classic">Classic site</Link>
          <button className={`ex-burger ${menuOpen ? 'is-x' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen}>
            <span /><span />
          </button>
        </div>
      </header>

      {/* hotspots */}
      <div className="ex-spots">
        {parts.map((p, i) => (
          <button key={p.key} ref={(el) => { hotspotRefs.current[p.key] = el; }} className="ex-spot" onClick={() => pick(p.key)}
                  aria-label={`Show ${p.label}`} style={{ ['--d' as string]: `${i * 0.18}s` }}>
            <i /><span>{p.label.split(' · ')[0]}</span>
          </button>
        ))}
      </div>

      {/* intro card (explore, nothing selected) */}
      <section className={`ex-intro ${ready && mode === 'explore' && !current ? 'is-in' : ''}`}>
        <div className="ex-kicker"><span />EcoVision Smartpole</div>
        <h1 className="ex-h1">Every street deserves <em>a guardian.</em></h1>
        <p>An energy-efficient, solar-powered smart pole that lights the street, watches over it and calls for help, with deep learning models we trained ourselves.</p>
        <div className="ex-intro-cta">
          <button className="ex-btn" onClick={() => go('power')}>Start the tour</button>
          <button className="ex-btn ex-ghost" onClick={() => go('anatomy')}>Take it apart</button>
        </div>
      </section>
      <div className={`ex-hint ${ready && hint && mode === 'explore' && !current ? 'is-in' : ''}`}>
        <span>Drag to look around</span><span>Scroll to zoom</span><span>Click any part of the pole</span>
      </div>

      {/* side panel */}
      <aside className={`ex-panel ${panelOpen ? 'is-open' : ''}`} aria-hidden={!panelOpen}>
        <button className="ex-close" onClick={close} aria-label="Close panel">×</button>
        <div className="ex-panel-body" key={current ? `p-${current.key}` : mode}>
          {current ? (
            <>
              <div className="ex-kicker"><span />Part {String(idx + 1).padStart(2, '0')} of {String(parts.length).padStart(2, '0')}</div>
              <h2 className="ex-h2">{current.label}</h2>
              <p>{current.detail}</p>
              <ul className="ex-chips">{(PART_FACTS[current.key] ?? []).map((f) => <li key={f}>{f}</li>)}</ul>
              <div className="ex-step">
                <button onClick={() => pick(parts[(idx - 1 + parts.length) % parts.length].key)}>← Previous part</button>
                <button onClick={() => pick(parts[(idx + 1) % parts.length].key)}>Next part →</button>
              </div>
            </>
          ) : mode === 'power' ? (
            <>
              <div className="ex-kicker"><span />Power</div>
              <h2 className="ex-h2">It runs on <em>sunlight.</em></h2>
              <p>Two light sensors on the panel compare which side is brighter, and a servo turns it on one axis to keep facing the sun. The day&rsquo;s energy fills a LiFePO4 battery for the night. Drag the time of day and watch it track.</p>
              <label className="ex-slider">
                <span>Time of day <b>{hourLabel(hour)}</b></span>
                <input type="range" min={6} max={18} step={0.25} value={hour} onChange={(e) => setHour(+e.target.value)} />
                <span className="ex-readout">Panel angle <b>{tiltDeg > 0 ? '+' : ''}{tiltDeg}°</b></span>
              </label>
              <ul className="ex-chips"><li>Solar panel</li><li>Servo + 2 LDRs</li><li>LiFePO4 12 V 50 Ah</li><li>Grid-independent</li></ul>
            </>
          ) : mode === 'light' ? (
            <>
              <div className="ex-kicker"><span />Light</div>
              <h2 className="ex-h2">It wakes when <em>you walk by.</em></h2>
              <p>At night the LED runs dim to save power. When the PIR motion sensor sees someone, it brightens: light where people are, not where they aren&rsquo;t.</p>
              <button className="ex-btn" onClick={walk} disabled={walkBy}>{walkBy ? 'Motion detected…' : 'Walk past the pole'}</button>
              <ul className="ex-chips"><li>Adaptive LED</li><li>PIR motion sensor</li><li>Energy-efficient</li></ul>
            </>
          ) : mode === 'sight' ? (
            <>
              <div className="ex-kicker"><span />Sight</div>
              <h2 className="ex-h2">It knows what it&rsquo;s <em>looking at.</em></h2>
              <p>The camera feed is processed locally by deep learning models we custom-trained: YOLO11 for people and weapons, X3D for fights, robbery and vandalism, using 3,880 clips we captured from Philippine street cameras. No footage goes to the cloud.</p>
              <div className="ex-console">
                <div><b>STAGE 1</b> detectors <em>candidate · physical contact · 0.31</em></div>
                <div><b>STAGE 2</b> vision-language check</div>
                <div className="ex-q">&ldquo;Is anyone fighting, punching, kicking or attacking another person?&rdquo;</div>
                <div className="ex-no"><b>NO</b> alert dropped · nobody woken up</div>
                <div className="ex-cap">Every alarm gets a second look before anyone is told.</div>
              </div>
              <button className="ex-btn ex-ghost ex-stage" onClick={() => fightRef.current()}>Stage a street fight</button>
            </>
          ) : mode === 'response' ? (
            <>
              <div className="ex-kicker"><span />Response</div>
              <h2 className="ex-h2">Help is one <em>signal away.</em></h2>
              <p>An alert reaches the barangay and the nearest police station at once. A person always makes the call, and every piece of evidence is fingerprinted the moment it&rsquo;s saved.</p>
              <ol className="ex-flow">
                <li><b>Detect</b>custom-trained models flag it</li>
                <li><b>Double-check</b>a second AI confirms it</li>
                <li><b>Alert</b>barangay + police, with snapshot, clip and map pin</li>
                <li><b>Decide</b>a person confirms or dismisses</li>
              </ol>
              <div className="ex-alert">
                <div className="ex-alert-head"><i />ALERT · CAM-03 · COGON</div>
                <dl>
                  <dt>Sent to</dt><dd>Barangay Cogon · Police Station 1</dd>
                  <dt>Evidence</dt><dd>SHA-256 fingerprinted</dd>
                  <dt>Status</dt><dd className="ex-wait">Awaiting a person to confirm</dd>
                </dl>
              </div>
            </>
          ) : mode === 'anatomy' ? (
            <>
              <div className="ex-kicker"><span />Anatomy</div>
              <h2 className="ex-h2">Every part, <em>on one pole.</em></h2>
              <p>The pole comes apart. Pick a part to fly to it, or tap the glowing points on the model.</p>
              <ol className="ex-parts">
                {parts.map((p, i) => (
                  <li key={p.key}><button onClick={() => pick(p.key)}><span>{String(i + 1).padStart(2, '0')}</span>{p.label}</button></li>
                ))}
              </ol>
            </>
          ) : mode === 'results' ? (
            <>
              <div className="ex-kicker"><span />Results</div>
              <h2 className="ex-h2">Measured, <em>not promised.</em></h2>
              <div className="ex-stats">
                {STATS.map((st, j) => (
                  <div key={st.label} className="ex-stat">
                    <b>{st.dec ? stats[j].toFixed(st.dec) : Math.round(stats[j]).toLocaleString()}<small>{st.suffix}</small></b>
                    <span>{st.label}</span><em>{st.note}</em>
                  </div>
                ))}
              </div>
              <p className="ex-small">On footage the models never trained on, with the vision-language double-check on a GPU. Accuracy on the deployment cameras themselves is not yet measured: no incident has been recorded on them.</p>
            </>
          ) : mode === 'team' ? (
            <>
              <div className="ex-kicker"><span />The team</div>
              <h2 className="ex-h2">The people <em>behind it.</em></h2>
              <div className="ex-team">
                {TEAM.map((m) => (
                  <div key={m.name} className="ex-member">
                    <div className="ex-photo"><Image src={m.img} alt={m.name} fill sizes="96px" style={{ objectFit: 'cover', objectPosition: m.pos ?? 'center' }} /></div>
                    <div>
                      <div className="ex-role">{m.role}</div>
                      <h3>{m.name}</h3>
                      <div className="ex-title-sm">{m.title}</div>
                      <p>{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : mode === 'contact' ? (
            <>
              <div className="ex-kicker"><span />Contact</div>
              <h2 className="ex-h2">Get <em>in touch.</em></h2>
              <p>Questions about the solar hardware, the AI or the panic button? Send us a message.</p>
              <form className="ex-form" onSubmit={(e) => e.preventDefault()}>
                <label>Email<input type="email" placeholder="name@domain.com" required /></label>
                <label>Message<textarea rows={5} placeholder="Your message about the smart pole" required /></label>
                <button type="submit" className="ex-btn">Send message</button>
              </form>
            </>
          ) : null}
          {!current && mode !== 'explore' && (() => {
            const i = DOCK.indexOf(mode);
            const prev = DOCK[i - 1], next = DOCK[i + 1];
            return (
              <div className="ex-step ex-flow">
                {prev ? <button onClick={() => go(prev)}>← {MODES[prev].short}</button> : <span />}
                {next ? <button className="is-next" onClick={() => go(next)}>Next: {MODES[next].label} →</button> : <button className="is-next" onClick={() => go('explore')}>Back to the pole ↺</button>}
              </div>
            );
          })()}
        </div>
      </aside>

      {/* dock */}
      <nav className={`ex-dock ${ready ? 'is-in' : ''} ${menuOpen ? 'is-hidden' : ''}`} aria-label="Sections">
        {DOCK.map((m) => (
          <button key={m} className={mode === m && !current ? 'is-on' : ''} onClick={() => go(m)}>{MODES[m].short}</button>
        ))}
      </nav>

      {/* menu */}
      <div className={`ex-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <ol>
          {DOCK.map((m, i) => (
            <li key={m} style={{ ['--i' as string]: i }}>
              <button onClick={() => go(m)}><span>{String(i + 1).padStart(2, '0')}</span>{MODES[m].label}</button>
            </li>
          ))}
        </ol>
        <div className="ex-menu-foot">
          <Link href="/classic">Classic site</Link>
          <Link href="/classic#playground">Live AI sandbox</Link>
        </div>
      </div>
    </div>
  );
}
