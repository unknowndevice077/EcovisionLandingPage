'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import PoleCanvas, { type ExplodeState, type PartInfo } from './PoleCanvas';

/* Scroll-driven exploded view of the smartpole.
 *
 * A tall track with a pinned stage: as the visitor scrolls through it the
 * pole comes apart (first ~40%), each part is highlighted in turn with its
 * description (middle), then it reassembles (end). The model also turns a
 * little across the scroll so every side gets seen.
 *
 * Scroll position is read in a rAF-throttled listener and written into a ref
 * the canvas reads each frame -- no React re-render per scroll event. Only
 * the highlighted part's copy is React state, and it changes a handful of
 * times across the whole track.
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

export default function PoleExplodedView() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ExplodeState>({ explode: 0, turn: 0, active: null });
  const [parts, setParts] = useState<PartInfo[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const partsRef = useRef<PartInfo[]>([]);

  const onParts = useCallback((p: PartInfo[]) => {
    partsRef.current = p;
    setParts(p);
  }, []);

  useEffect(() => {
    let ticking = false;
    const read = () => {
      ticking = false;
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? clamp(-r.top / span) : 0;
      // Apart over 8-40%, hold, back together over 84-97%.
      const explode = ramp(p, 0.08, 0.4) * (1 - ramp(p, 0.84, 0.97));
      const list = partsRef.current;
      let key: string | null = null;
      if (list.length && p >= 0.42 && p < 0.84) {
        key = list[Math.min(list.length - 1, Math.floor(((p - 0.42) / 0.42) * list.length))].key;
      }
      stateRef.current = { explode, turn: p * 1.35, active: key };
      setActive((prev) => (prev === key ? prev : key));
      setProgress((prev) => (Math.abs(prev - p) < 0.01 ? prev : p));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(read);
      }
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const current = parts.find((p) => p.key === active) ?? null;
  const phase = progress < 0.4 ? 'apart' : progress < 0.84 ? 'parts' : 'together';

  return (
    <div ref={trackRef} className="pole3d-track">
      <div className="pole3d-stage">
        <PoleCanvas mode="exploded" state={stateRef} onParts={onParts} className="pole3d-canvas" />

        <div className="pole3d-copy">
          <div className="pole3d-eyebrow"><span />Exploded View</div>
          <h3 className="pole3d-title">
            {phase === 'together' ? <>Back in one piece.<br/>Ready for the street.</> : <>Every part,<br/>on one pole.</>}
          </h3>

          <div className="pole3d-card" aria-live="polite">
            {current ? (
              <>
                <div className="pole3d-card-label">{current.label}</div>
                <p className="pole3d-card-detail">{current.detail}</p>
              </>
            ) : (
              <p className="pole3d-card-detail">
                {phase === 'together'
                  ? 'Solar power, light, sensing, AI camera and alarm, all on a single grid-independent pole.'
                  : 'Keep scrolling to take the pole apart and see what each part does.'}
              </p>
            )}
          </div>

          <ol className="pole3d-list">
            {parts.map((p) => (
              <li key={p.key} className={p.key === active ? 'is-active' : ''}>{p.label}</li>
            ))}
          </ol>

          <div className="pole3d-progress" aria-hidden="true"><div style={{ transform: `scaleX(${progress})` }} /></div>
        </div>
      </div>

      <style>{`
        .pole3d-track { position: relative; height: 380vh; margin: 0 0 120px; }
        .pole3d-stage {
          /* starts under the fixed navbar, so nothing renders behind it */
          position: sticky; top: 0; height: 100vh; padding-top: 84px; box-sizing: border-box; display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(300px, 1fr); align-items: center; gap: 24px;
        }
        .pole3d-canvas {
          height: calc(100vh - 84px);
          /* fade the scene into the page instead of a hard edge at the column */
          -webkit-mask-image: linear-gradient(to right, transparent 0, #000 5%, #000 86%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0, #000 5%, #000 86%, transparent 100%);
        }
        .pole3d-copy { padding-right: 8px; }
        .pole3d-eyebrow {
          font-family: var(--fm); font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--green);
          display: flex; align-items: center; gap: 12px; margin-bottom: 18px; font-weight: 700;
        }
        .pole3d-eyebrow span { display: block; width: 24px; height: 2px; background: var(--green); }
        .pole3d-title {
          font-family: var(--fh); font-weight: 900; font-size: clamp(30px, 3.2vw, 46px); line-height: .95;
          text-transform: uppercase; letter-spacing: -1px; color: #fff; margin-bottom: 26px;
        }
        .pole3d-card {
          min-height: 128px; padding: 22px 24px; background: var(--surface); border: 1px solid var(--border);
          border-left: 2px solid var(--green); margin-bottom: 24px;
        }
        .pole3d-card-label {
          font-family: var(--fh); font-weight: 800; font-size: 20px; text-transform: uppercase; color: #fff; margin-bottom: 8px;
        }
        .pole3d-card-detail { font-size: 15px; line-height: 1.65; color: var(--muted); margin: 0; }
        .pole3d-list { list-style: none; padding: 0; margin: 0 0 22px; display: grid; gap: 6px; counter-reset: part; }
        .pole3d-list li {
          counter-increment: part; font-family: var(--fm); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--muted); opacity: .55; transition: opacity .25s, color .25s, transform .25s;
        }
        .pole3d-list li::before { content: counter(part, decimal-leading-zero) "  "; color: var(--green); }
        .pole3d-list li.is-active { opacity: 1; color: #fff; transform: translateX(6px); }
        .pole3d-progress { height: 2px; background: var(--border); overflow: hidden; }
        .pole3d-progress div { height: 100%; background: var(--green); transform-origin: left; }
        @media (max-width: 900px) {
          .pole3d-track { height: 420vh; }
          .pole3d-stage { grid-template-columns: 1fr; grid-template-rows: 58vh auto; align-items: start; gap: 8px; }
          .pole3d-canvas { height: 58vh; }
          .pole3d-title { font-size: 26px; margin-bottom: 14px; }
          .pole3d-card { min-height: 0; padding: 14px 16px; margin-bottom: 12px; }
          .pole3d-list { display: none; }
        }
      `}</style>
    </div>
  );
}
