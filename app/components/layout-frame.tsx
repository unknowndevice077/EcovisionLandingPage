import React from 'react';
import { s } from '../styles';
import { NavLinkProps } from '../types';

export const GlobalStyle = () => (
  <style>{`
    :root {
      --bg:           #020502;
      --surface:      #060d06;
      --surface-card: #0a160a;
      --border:       #142414;
      --border-glow:  #223f22;
      --green:        #76b900;
      --green-rgb:    118, 185, 0;
      --green2:       #5a8f00;
      --greendim:     #1b3300;
      --accent:       #a8d400;
      --text:         #f0f5f0;
      --muted:        #829a82;
      --fh:           var(--font-barlow-condensed), sans-serif;
      --fb:           var(--font-barlow), sans-serif;
      --fm:           var(--font-jetbrains-mono), monospace;

      /* Layout tokens read by app/styles.ts (s.nav, s.secInner, s.pillarsGrid,
         etc.) so the same object-style constants can respond to viewport size
         without duplicating every layout rule as inline JS breakpoints. */
      --gutter:      80px;
      --nav-pad:     64px;
      --pillars-cols: repeat(3, 1fr);
      --tech-cols:   1.1fr 0.9fr;
      --tech-gap:    96px;
      --metrics-cols: repeat(4, 1fr);
      --contact-cols: repeat(auto-fit, minmax(450px, 1fr));
      --sandbox-cols: 1fr 380px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; background: var(--bg); }
    body { background: var(--bg); color: var(--text); font-family: var(--fb); overflow-x: hidden; cursor: none; -webkit-font-smoothing: antialiased; }
    a, button { cursor: none; }

    /* Touch devices have no hover/pointer precision for the custom cursor to
       track, so it never repaints and sits frozen at 0,0 -- restore the
       native cursor instead of a stray HUD dot in the corner. */
    @media (hover: none), (pointer: coarse) {
      body, a, button { cursor: auto; }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
      }
    }

    /* ── Responsive layout tokens ─────────────────────────────────────────
       Everything below only re-assigns the variables above; the object
       styles in styles.ts and their var(--x) values do the rest. */
    @media (max-width: 1080px) {
      :root { --gutter: 48px; --nav-pad: 28px; --tech-gap: 56px; }
    }
    @media (max-width: 900px) {
      :root {
        --pillars-cols: repeat(2, 1fr);
        --tech-cols: 1fr;
        --metrics-cols: repeat(2, 1fr);
        --contact-cols: 1fr;
        --sandbox-cols: 1fr;
      }
      .tech-split { direction: ltr !important; }
    }
    @media (max-width: 640px) {
      :root {
        --gutter: 20px;
        --nav-pad: 16px;
        --pillars-cols: 1fr;
        --metrics-cols: 1fr;
      }
      .metric-cell { border-right: none !important; border-bottom: 1px solid var(--border); }
      .metric-cell:last-child { border-bottom: none; }
    }

    /* ── Mobile nav ────────────────────────────────────────────────────── */
    .nav-toggle { display: none; width: 40px; height: 40px; align-items: center; justify-content: center; background: none; border: 1px solid var(--border); color: var(--green); flex-shrink: 0; }
    @media (max-width: 900px) {
      .nav-toggle { display: flex; }
      .nav-deploy-btn { display: none; }
      /* align-items and gap are also set inline via s.navLinks (needed for
         the desktop row layout), which always wins over a plain class rule
         -- !important is required here to actually reflow it as a column. */
      .nav-links {
        position: absolute; top: 100%; left: 0; right: 0;
        flex-direction: column; align-items: stretch !important; gap: 0 !important;
        background: rgba(2, 5, 2, 0.98); border-bottom: 1px solid var(--border);
        max-height: 0; overflow: hidden; padding: 0 24px;
        transition: max-height 0.3s ease, padding 0.3s ease;
      }
      .nav-links.open { max-height: 480px; padding: 12px 24px 28px; }
      .nav-links li { width: 100%; }
      .nav-links li a { display: block; padding: 16px 0; border-bottom: 1px solid var(--border); }
    }
    @keyframes gridScroll { from { transform: translateY(0); } to { transform: translateY(40px); } }
    @keyframes edgePulse { 0%, 100% { border-color: var(--border); box-shadow: 0 0 0px rgba(118,185,0,0); } 50% { border-color: var(--green); box-shadow: 0 0 15px rgba(118,185,0,0.15); } }
    @keyframes textGlitch { 0%, 100% { transform: none; opacity: 1; } 92% { transform: skewX(-2deg) scaleY(0.98); opacity: 0.95; } 95% { transform: skewX(3deg) scaleY(1.02); opacity: 0.9; } 98% { transform: skewX(-1deg); opacity: 0.98; } }
    @keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes microPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes phGlow { from { opacity:.5; } to { opacity:1; } }
    @keyframes fadeSlide { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
    @keyframes playgroundLaser { 0% { top: 0%; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
    .reveal { opacity: 0; transform: translateY(40px); transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .reveal.visible { opacity: 1; transform: none; }
    .reveal.d1 { transition-delay: 0.15s; }
    .reveal.d2 { transition-delay: 0.3s; }
    .reveal.d3 { transition-delay: 0.45s; }
    .noise-overlay { position: fixed; inset: 0; z-index: 1; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.035'/%3E%3C/svg%3E"); mix-blend-mode: overlay; }
    .matrix-grid { position: absolute; inset: 0; background: linear-gradient(rgba(118, 185, 0, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(118, 185, 0, 0.015) 1px, transparent 1px); background-size: 50px 50px; transform: perspective(500px) rotateX(60deg); transform-origin: top; animation: gridScroll 12s linear infinite; mask-image: linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)); }
    .camera-blueprint-layer { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 20 a30 30 0 0 1 0 60 a30 30 0 0 1 0 -60' stroke='%2376b900' stroke-width='0.5' fill='none' /%3E%3Cpath d='M50 25 a25 25 0 0 1 0 50 a25 25 0 0 1 0 -50' stroke='%2376b900' stroke-width='0.25' opacity='0.5' fill='none' /%3E%3Cpath d='M25 50 h5 M70 50 h5 M50 25 v5 M50 70 v5' stroke='%2376b900' stroke-width='0.25' fill='none' /%3E%3Cpath d='M35 35 L 65 65 M35 65 L 65 35' stroke='%2376b900' stroke-width='0.1' opacity='0.3' fill='none' /%3E%3Ccircle cx='50' cy='50' r='5' fill='%2376b900' opacity='0.2'/%3E%3C/svg%3E"); background-size: 140px 140px; opacity: 0.06; mask-image: radial-gradient(circle at 80% 40%, black 0%, transparent 75%); }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--green); }
  `}</style>
);

export function FullPremiumLogo({ size = 44 }: { size?: number }) {
  return (
    <div style={{ ...s.logoPh, width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" style={{ width: '85%', height: '85%' }}>
        <path d="M10 50 C 30 20, 70 20, 90 50 C 70 80, 30 80, 10 50 Z" stroke="var(--green)" strokeWidth="5" fill="none" />
        <circle cx="50" cy="50" r="18" stroke="var(--green)" strokeWidth="4" fill="rgba(118,185,0,0.1)" />
        <circle cx="50" cy="50" r="6" fill="var(--green)" />
        <rect x="70" y="22" width="12" height="12" fill="var(--accent)" transform="rotate(15 70 22)" />
      </svg>
    </div>
  );
}

// Reads (hover: hover) and pointer: fine as external browser state via
// useSyncExternalStore rather than setState-in-an-effect, so the server
// snapshot (assume desktop) and the real client snapshot can differ without
// a hydration-mismatch warning, and the render/subscribe split is the one
// react-hooks actually wants for syncing from an external system.
function useHoverCapable() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    () => true // server snapshot: render the desktop cursor markup during SSR
  );
}

export function CustomCursor() {
  const dotRef  = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  // Touch devices never fire mousemove, so the ring/dot would otherwise sit
  // frozen at their initial 0,0 position -- a stray HUD artifact in the
  // corner of the screen on every phone visit. Skip mounting them entirely.
  const enabled = useHoverCapable();

  React.useEffect(() => {
    if (!enabled) return;
    let mx = 0, my = 0, rx = 0, ry = 0, afId: number;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const updatePosition = () => {
      rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
      if (dotRef.current)  dotRef.current.style.transform  = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      afId = requestAnimationFrame(updatePosition);
    };
    const handleHoverStart = () => setIsHovered(true);
    const handleHoverEnd = () => setIsHovered(false);
    window.addEventListener('mousemove', onMove, { passive: true });
    afId = requestAnimationFrame(updatePosition);
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], .clickable-node');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleHoverStart);
      el.addEventListener('mouseleave', handleHoverEnd);
    });
    return () => {
      window.removeEventListener('mousemove', onMove); cancelAnimationFrame(afId);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleHoverStart); el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 99999, pointerEvents: 'none', mixBlendMode: 'difference' }}>
      <div ref={ringRef} style={{ position: 'absolute', width: isHovered ? 54 : 32, height: isHovered ? 54 : 32, border: '1px solid var(--green)', borderRadius: '50%', opacity: 0.7, transition: 'width 0.25s, height 0.25s', boxShadow: isHovered ? '0 0 15px rgba(118, 185, 0, 0.4)' : 'none' }}/>
      <div ref={dotRef} style={{ position: 'absolute', width: isHovered ? 4 : 8, height: isHovered ? 4 : 8, background: 'var(--green)', borderRadius: '50%' }}/>
    </div>
  );
}

function NavLink({ href, children, onNavigate }: NavLinkProps & { onNavigate?: () => void }) {
  return (
    <li>
      <a href={href} onClick={onNavigate} style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--fm)', transition: 'color 0.2s' }}
         onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
        {children}
      </a>
    </li>
  );
}

export function Navbar({ scrolled }: { scrolled: boolean }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const closeMenu = () => setMobileOpen(false);

  return (
    <nav style={{ ...s.nav, background: scrolled ? 'rgba(2, 5, 2, 0.95)' : 'rgba(2, 5, 2, 0.75)', borderBottom: `1px solid ${scrolled ? 'var(--border-glow)' : 'var(--border)'}` }}>
      <a href="#" style={s.navLogo} onClick={closeMenu}>
        <FullPremiumLogo size={46}/>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <span style={s.navBrand}>EcoVision</span>
          <span style={s.navSub}>Smartpole Architecture</span>
        </div>
      </a>
      <ul className={`nav-links${mobileOpen ? ' open' : ''}`} style={s.navLinks}>
        <NavLink href="#specs" onNavigate={closeMenu}>Specifications</NavLink>
        <NavLink href="#action-matrix" onNavigate={closeMenu}>Vision Stream</NavLink>
        <NavLink href="#performance" onNavigate={closeMenu}>Model Performance</NavLink>
        <NavLink href="#pillars" onNavigate={closeMenu}>Core Pillars</NavLink>
        <NavLink href="#vision" onNavigate={closeMenu}>Blueprint Specs</NavLink>
        <NavLink href="#playground" onNavigate={closeMenu}>Inference Sandbox</NavLink>
      </ul>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="nav-deploy-btn" style={s.navBtn} onClick={() => document.getElementById('pillars')?.scrollIntoView({ behavior: 'smooth' })}>
          Deploy Explorer
        </button>
        <button
          className="nav-toggle"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(open => !open)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} style={{ width: 20, height: 20 }}>
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
    </nav>
  );
}

export function Manifesto() {
  return (
    <section style={s.manifesto}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(118,185,0,0.06), transparent)' }}/>
      <div style={{ ...s.secInner, position: 'relative', zIndex: 1 }}>
        <blockquote className="reveal" style={s.manifQuote}>
          "Tracking target environment states<br/>
          <span style={{ color: 'var(--green)', fontStyle: 'normal' }}>should never compromise</span><br/>
          the privacy of citizens."
        </blockquote>
        <div className="reveal d1" style={s.manifChips}>
          {['Decentralizing Smart Cities', 'Preserving Civic Privacy', 'Powering Open Intelligence'].map((chip, idx) => (
            <span key={idx} style={s.mChip}>{chip}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.footTop}>
        <a href="#" style={s.navLogo}>
          <FullPremiumLogo size={42}/>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 22, color: '#fff', letterSpacing: '0.5px' }}>EcoVision</div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--green)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700 }}>Project Core Presentation</div>
          </div>
        </a>
        <div style={s.footLinks}>
          {[['#specs', 'Specs Matrix'], ['#action-matrix', 'Inference Feed'], ['#pillars', 'System Pillars'], ['#playground', 'AI Sandbox']].map(([url, label]) => (
            <a key={url} href={url} style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--fm)' }}>
              {label}
            </a>
          ))}
        </div>
      </div>
      <div style={s.footBot}>
        <div style={s.footCopy}>&copy; {new Date().getFullYear()} EcoVision Smartpole Infrastructure System Platform. All rights reserved.</div>
        <div style={s.footVer}>v2.1.0 • YOLOv11 Local AI Framework</div> {/* Simplified jargon */}
      </div>
    </footer>
  );
}