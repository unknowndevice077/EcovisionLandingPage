'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildPole, createStage } from './buildPole';

/* One WebGL canvas showing the smartpole.
 *
 *   mode="hero"     -- assembled, slowly turning, leaning toward the pointer.
 *   mode="exploded" -- driven from outside through `state`: how far apart the
 *                      parts are, how far the model has turned, and which part
 *                      is highlighted. Labels are pinned to each part.
 *
 * It renders only while on screen and the tab is visible, honours
 * prefers-reduced-motion (no idle turning), and frees every GPU resource on
 * unmount -- the page has two of these, and video elsewhere.
 */

export type ExplodeState = { explode: number; turn: number; active: string | null };
export type PartInfo = { key: string; label: string; detail: string };

type Props = {
  mode: 'hero' | 'exploded';
  state?: React.MutableRefObject<ExplodeState>;
  style?: React.CSSProperties;
  className?: string;
  /** Called once with the model's parts, so surrounding copy comes from the model itself. */
  onParts?: (parts: PartInfo[]) => void;
};

export default function PoleCanvas({ mode, state, style, className, onParts }: Props) {
  const onPartsRef = useRef(onParts);
  useEffect(() => { onPartsRef.current = onParts; }, [onParts]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.innerWidth < 900;
    const { renderer, scene, camera } = createStage(canvas, { shadows: !small });
    const pole = buildPole();
    scene.add(pole.root);
    onPartsRef.current?.(pole.parts.map(({ key, label, detail }) => ({ key, label, detail })));

    // Framing. The exploded view sits further back so parts flying out stay in frame.
    const target = new THREE.Vector3(0.25, mode === 'hero' ? 3.4 : 3.75, 0);
    const camPos = mode === 'hero' ? new THREE.Vector3(4.6, 4.3, 11.2) : new THREE.Vector3(5.4, 5.0, 12.8);
    camera.position.copy(camPos);
    camera.lookAt(target);

    // Labels (exploded view only): one element per part, positioned each frame.
    const labelEls = new Map<string, HTMLDivElement>();
    if (mode === 'exploded' && labelsRef.current) {
      for (const p of pole.parts) {
        const el = document.createElement('div');
        el.className = 'pole3d-label';
        el.innerHTML = `<span class="pole3d-dot"></span><span class="pole3d-text"></span>`;
        (el.querySelector('.pole3d-text') as HTMLElement).textContent = p.label;
        labelsRef.current.appendChild(el);
        labelEls.set(p.key, el);
      }
    }

    const resize = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Keep the whole pole in view on tall, narrow layouts.
      camera.fov = camera.aspect < 0.8 ? 40 : 32;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Pointer lean (hero only).
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (mode === 'hero' && !reduced) window.addEventListener('pointermove', onPointer, { passive: true });

    // Render only when visible.
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; }, { rootMargin: '100px' });
    io.observe(wrap);

    const clock = new THREE.Clock();
    let raf = 0;
    let lean = 0, tilt = 0;
    const world = new THREE.Vector3();

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!onScreen || document.hidden) return;
      const t = clock.getElapsedTime();

      if (mode === 'hero') {
        lean += ((pointer.x * 0.5) - lean) * 0.05;
        tilt += ((pointer.y * 0.08) - tilt) * 0.05;
        pole.root.rotation.y = (reduced ? 0.55 : 0.55 + t * 0.18) + lean;
        pole.root.rotation.x = tilt;
        pole.update(reduced ? 0 : t, 0);
      } else {
        const s = state?.current ?? { explode: 0, turn: 0, active: null };
        pole.root.rotation.y = 0.5 + s.turn;
        pole.update(reduced ? 0 : t, s.explode);
        // Pin labels to their parts.
        const w = wrap.clientWidth, h = wrap.clientHeight;
        const show = Math.min(1, Math.max(0, (s.explode - 0.45) / 0.3));
        for (const p of pole.parts) {
          const el = labelEls.get(p.key);
          if (!el) continue;
          world.copy(p.anchor);
          p.group.localToWorld(world);
          world.project(camera);
          const x = (world.x * 0.5 + 0.5) * w;
          const y = (-world.y * 0.5 + 0.5) * h;
          const isActive = s.active === p.key;
          el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
          el.style.opacity = String(show * (s.active && !isActive ? 0.45 : 1));
          el.classList.toggle('is-active', isActive);
        }
      }
      renderer.render(scene, camera);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      labelEls.forEach((el) => el.remove());
      pole.dispose();
      renderer.dispose();
    };
  }, [mode, state]);

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative', ...style }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden="true" />
      {mode === 'exploded' && <div ref={labelsRef} className="pole3d-labels" aria-hidden="true" />}
      <style>{`
        .pole3d-labels { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .pole3d-label {
          position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 8px;
          font-family: var(--fm); font-size: 10.5px; letter-spacing: 1.2px; text-transform: uppercase;
          color: var(--text, #e8eee0); white-space: nowrap; opacity: 0; transition: opacity .25s, color .25s;
          will-change: transform, opacity;
        }
        .pole3d-dot {
          width: 9px; height: 9px; border-radius: 50%; background: var(--green);
          box-shadow: 0 0 0 4px rgba(118,185,0,.18), 0 0 14px rgba(118,185,0,.7); flex-shrink: 0;
          transform: translate(-4.5px, 0);
        }
        .pole3d-text { padding: 4px 8px; background: rgba(2,5,2,.78); border: 1px solid rgba(118,185,0,.25); backdrop-filter: blur(6px); }
        .pole3d-label.is-active .pole3d-text { border-color: var(--green); color: #fff; background: rgba(20,40,5,.85); }
        .pole3d-label.is-active .pole3d-dot { background: var(--accent, #a8d400); }
        /* Phones: the labels don't fit beside the parts. Keep the dots; the
           card under the model names and describes the highlighted part. */
        @media (max-width: 900px) {
          .pole3d-text { display: none; }
          .pole3d-label.is-active .pole3d-dot { transform: translate(-4.5px, 0) scale(1.5); }
        }
      `}</style>
    </div>
  );
}
