'use client';

import React, { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   🖼️ ECOVISION PREMIUM LOGO & HARDWARE ASSET REGISTER
   ───────────────────────────────────────────────────────────────────────────── */
const ASSETS = {
  LOGO_IMG:    "REPLACE_WITH_YOUR_UPLOADED_LOGO_PATH", 
  HERO_VIDEO:  "REPLACE_HERO_VIDEO.mp4",      
  YOLO_VIDEO:  "REPLACE_YOLO_VIDEO.mp4",      
  POWER_VIDEO: "REPLACE_POWER_VIDEO.mp4",     
  SOLAR_VIDEO: "REPLACE_SOLAR_VIDEO.mp4",     
  TECH_IMG_1:  "REPLACE_ARCH_IMAGE.jpg",      
  TECH_IMG_2:  "REPLACE_YOLO_SCREENSHOT.jpg", 
  TECH_IMG_3:  "REPLACE_SOLAR_TRACKER.jpg",   
};

/* ─────────────────────────────────────────────────────────────────────────────
   ⚡ NVIDIA-TIER CRITICAL PERFORMANCE STYLING SYSTEMS (CORE ENGINE)
   ───────────────────────────────────────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300&family=Barlow+Condensed:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&display=swap');

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
      --fh:           'Barlow Condensed', sans-serif;
      --fb:           'Barlow', sans-serif;
      --fm:           'JetBrains Mono', monospace;
    }

    *, *::before, *::after { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }
    
    html { 
      scroll-behavior: smooth; 
      background: var(--bg);
    }
    
    body { 
      background: var(--bg); 
      color: var(--text); 
      font-family: var(--fb); 
      overflow-x: hidden; 
      cursor: none;
      -webkit-font-smoothing: antialiased;
    }
    
    a, button { 
      cursor: none; 
    }

    @keyframes gridScroll {
      from { transform: translateY(0); }
      to   { transform: translateY(40px); }
    }

    @keyframes edgePulse {
      0%, 100% { border-color: var(--border); box-shadow: 0 0 0px rgba(118,185,0,0); }
      50% { border-color: var(--green); box-shadow: 0 0 15px rgba(118,185,0,0.15); }
    }

    @keyframes textGlitch {
      0%, 100% { transform: none; opacity: 1; }
      92% { transform: skewX(-2deg) scaleY(0.98); opacity: 0.95; }
      95% { transform: skewX(3deg) scaleY(1.02); opacity: 0.9; }
      98% { transform: skewX(-1deg); opacity: 0.98; }
    }

    @keyframes tickerScroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }

    @keyframes microPulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }

    @keyframes blink {
      0%,100%{opacity:1} 50%{opacity:0}
    }

    @keyframes phGlow {
      from { opacity:.5; }
      to   { opacity:1; }
    }

    @keyframes fadeSlide {
      from { opacity:0; transform:translateY(6px); }
      to   { opacity:1; transform:none; }
    }

    .reveal {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reveal.visible { 
      opacity: 1; 
      transform: none; 
    }
    .reveal.d1 { transition-delay: 0.15s; }
    .reveal.d2 { transition-delay: 0.3s; }
    .reveal.d3 { transition-delay: 0.45s; }

    .noise-overlay {
      position: fixed; inset: 0; z-index: 1; pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.035'/%3E%3C/svg%3E");
      mix-blend-mode: overlay;
    }

    .matrix-grid {
      position: absolute; inset: 0;
      background: linear-gradient(rgba(118, 185, 0, 0.015) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(118, 185, 0, 0.015) 1px, transparent 1px);
      background-size: 50px 50px;
      transform: perspective(500px) rotateX(60deg);
      transform-origin: top;
      animation: gridScroll 12s linear infinite;
      mask-image: linear-gradient(to bottom, transparent, rgba(0,0,0,0.8));
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--green); }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────────────────────
   ⚡ INTERACTIVE HOVER INTERACTION CURSOR MODULE
   ───────────────────────────────────────────────────────────────────────────── */
function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0, afId: number;
    
    const onMove = (e: MouseEvent) => { 
      mx = e.clientX; 
      my = e.clientY; 
    };

    const updatePosition = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
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
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(afId);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 99999, pointerEvents: 'none', mixBlendMode: 'difference' }}>
      <div ref={ringRef} style={{
        position: 'absolute',
        width: isHovered ? 54 : 32,
        height: isHovered ? 54 : 32,
        border: '1px solid var(--green)',
        borderRadius: '50%',
        opacity: 0.7,
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s',
        boxShadow: isHovered ? '0 0 15px rgba(118, 185, 0, 0.4)' : 'none'
      }}/>
      <div ref={dotRef} style={{
        position: 'absolute',
        width: isHovered ? 4 : 8,
        height: isHovered ? 4 : 8,
        background: 'var(--green)',
        borderRadius: '50%',
        transition: 'width 0.2s, height 0.2s'
      }}/>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ⚡ STRICT DATA TYPE CONTROLS & INTERFACES
   ───────────────────────────────────────────────────────────────────────────── */
interface MediaShowcaseProps {
  label: string;
  sublabel: string;
  minHeight?: number;
  src: string;
  type?: 'video' | 'image';
}

interface TechnicalSpecVisualProps {
  label: string;
  badge: string;
  src: string;
}

interface StructuralWrapperProps {
  children: React.ReactNode;
}

interface SectionTitleProps {
  children: React.ReactNode;
  size?: string;
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

interface FullPremiumLogoProps {
  size?: number;
}

/* ── Scroll Reveal hook ── */
function useReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);
}

/* ── Counter hook ── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      
      let startTime: number | null = null;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeOutQuint = 1 - Math.pow(1 - progress, 5);
        setCount(Math.round(easeOutQuint * target));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, { threshold: 0.3 });

    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, elementRef] as const;
}

/* ─────────────────────────────────────────────────────────────────────────────
   ⚡ STABLE COMPONENT MEDIA CANVAS WRAPPERS
   ───────────────────────────────────────────────────────────────────────────── */
function MediaShowcase({ label, sublabel, minHeight = 380, src, type = 'video' }: MediaShowcaseProps) {
  const isPlaceholder = !src || src.startsWith('REPLACE_');
  
  return (
    <div style={{ width: '100%', minHeight, background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', animation: 'edgePulse 8s ease-in-out infinite' }}>
      {!isPlaceholder ? (
        type === 'video' ? (
          <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.75 }}>
            <source src={src} type="video/mp4"/>
          </video>
        ) : (
          <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.8 }}/>
        )
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(118,185,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(118,185,0,.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }}/>
          <div style={{ width: 64, height: 64, border: '1px solid rgba(118,185,0,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', background: 'rgba(118,185,0,.02)' }}>
            <svg viewBox="0 0 24 24" fill="var(--green)" style={{ width: 24, height: 24, marginLeft: type === 'video' ? 2 : 0 }}><path d={type === 'video' ? "M8 5v14l11-7z" : "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"}/></svg>
          </div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'rgba(118,185,0,.4)', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.8 }}>
            ⚡ {label} CONFIG REQUIRED <br/> <span style={{ color: 'var(--muted)' }}>{sublabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function TechnicalSpecVisual({ label, badge, src }: TechnicalSpecVisualProps) {
  const isPlaceholder = !src || src.startsWith('REPLACE_');
  return (
    <div style={{ position: 'relative', height: 480, border: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden' }}>
      {!isPlaceholder ? (
        <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65, transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }} className="tech-visual-src"/>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(118,185,0,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(118,185,0,.02) 1px, transparent 1px)', backgroundSize: '24px 24px' }}/>
          <div style={{ fontFamily: 'var(--fm)', color: 'rgba(118,185,0,.25)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', border: '1px dashed rgba(118,185,0,.15)', padding: '24px 32px' }}>
            🛰️ {label} UNBOUND
          </div>
        </div>
      )}
      {/* Structural Corner Frame Layout Matrix */}
      {[{ t: 0, l: 0, bw: '1px 0 0 1px' }, { t: 0, r: 0, bw: '1px 1px 0 0' }, { b: 0, l: 0, bw: '0 0 1px 1px' }, { b: 0, r: 0, bw: '0 1px 1px 0' }].map((c, i) => (
        <div key={i} style={{ position: 'absolute', width: 16, height: 16, borderColor: 'var(--green)', borderStyle: 'solid', borderWidth: c.bw, opacity: 0.5, ...(c.t !== undefined ? { top: c.t } : {}), ...(c.b !== undefined ? { bottom: c.b } : {}), ...(c.l !== undefined ? { left: c.l } : {}), ...(c.r !== undefined ? { right: c.r } : {}) }}/>
      ))}
      <div style={{ position: 'absolute', top: 20, left: 20, fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2, color: '#000', background: 'var(--green)', textTransform: 'uppercase', padding: '5px 10px', fontWeight: 700 }}>{badge}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ⚡ STRUCTURAL LABELS & TYPOGRAPHY TYPINGS
   ───────────────────────────────────────────────────────────────────────────── */
function Eyebrow({ children }: StructuralWrapperProps) {
  return (
    <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontWeight: 700 }}>
      <span style={{ display: 'block', width: 24, height: 2, background: 'var(--green)' }}/>
      {children}
    </div>
  );
}

function SectionTitle({ children, size = 'clamp(44px, 5.5vw, 76px)' }: SectionTitleProps) {
  return (
    <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: size, lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-1.5px', color: '#fff', marginBottom: 24, animation: 'textGlitch 12s infinite step-end' }}>
      {children}
    </h2>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ⚡ CORE EXECUTIVE LANDING PRESENTATION CORE MODULE
   ───────────────────────────────────────────────────────────────────────────── */
export default function EcoVisionLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwr' | 'ai' | 'solar'>('pwr');

  const [metricLatency, refLatency] = useCounter(28);
  const [metricObjects, refObjects] = useCounter(210);
  const [metricPower, refPower] = useCounter(15);
  const [metricRange, refRange] = useCounter(360);

  useReveal();

  useEffect(() => {
    const handleScrollEngine = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScrollEngine, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollEngine);
  }, []);

  const TICKER_ITEMS = [
    'YOLOv11 Edge Vision', 'Autonomous Power Management', 'Dual-Axis Solar Tracker',
    'INT8 Quantized NPU Inference', '28ms Latency Frame Loops', 'Zero PII Data Egress Architecture',
    'High-Yield Monocrystalline PV', 'n8n Automated Orchestration Pipelines', 'Edge Compute Isolation Layer'
  ];

  const PILLARS = [
    {
      num: '01', label: 'YOLOv11 Edge Intelligence',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 26, height: 26 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
      ),
      body: 'Custom-quantized INT8 neural pipeline architectures execute object classifications locally on dedicated hardware matrices. The localized system extracts deep object densities and purges raw video frame buffers instantly at inference time.',
      tags: ['YOLOv11', 'INT8 Quantized', '28ms Latency', 'NPU Processing', 'Privacy Safe']
    },
    {
      num: '02', label: 'Autonomous Power Array',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 26, height: 26 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      ),
      body: 'High-yield monocrystalline physical nodes integrated with state-of-the-art Maximum Power Point Tracking (MPPT) regulators. Energy budgets feed long-lifecycle LiFePO4 batteries to ensure isolated, permanent continuous execution.',
      tags: ['Monocrystalline PV', 'MPPT Charge Controllers', 'LiFePO4 Storage', 'Duty-Cycling', 'Grid Independent']
    },
    {
      num: '03', label: 'Dual-Axis Tracking Matrix',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 26, height: 26 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.343l.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      ),
      body: 'Electromechanical automation continuously structures orientation coordinates matching localized sun paths. Computing real-time azimuth and solar elevation angles boosts energy harvesting performance exponentially.',
      tags: ['Dual-Axis Servos', 'Real-time Ephemeris', 'Solar Arc Alignment', 'Efficiency Gain']
    }
  ];

  const TECH_SPLITS = [
    {
      eyebrow: 'Computer Vision Processing Architecture', title: 'Inference Executed\nLocally at the Edge.',
      body: 'EcoVision bypasses classical heavy cloud bandwidth reliance by hosting localized execution frameworks. Optimized deep learning models extract public structural safety, metrics distribution profiles, and hazard telemetry completely on-node.',
      bullets: ['Advanced INT8 model quantization guarantees sub-1% mAP tracking drift parameters.', 'Custom tensor compilation structures compute pipelines directly for embedded edge NPUs.', 'Zero PII transmission constraints — only clean metadata arrays arrive at external endpoints.'],
      img: ASSETS.TECH_IMG_2, badge: 'YOLOv11 Engine Module', reverse: false
    },
    {
      eyebrow: 'Sustainable Infrastructure Engineering', title: 'Isolated Foundations.\nZero Grid Reliance.',
      body: 'Our structural engineering paradigm integrates localized energy harvesting configurations directly underneath core processing units. This creates a fully decoupled infrastructure capable of continuous automation without traditional city grid dependencies.',
      bullets: ['Smart hardware telemetry protects sub-circuits against thermal or power anomalies.', 'Enclosures engineered and rated to withstand absolute continuous external outdoor environmental exposure.', 'Modular component housing slots afford rapid field-swappable computing array deployment profiles.'],
      img: ASSETS.TECH_IMG_1, badge: 'Hardware Infrastructure Layout', reverse: true
    },
    {
      eyebrow: 'Electromechanical Harvesting Optimization', title: 'Chasing Solar Rays\nWith Dual-Axis Servos.',
      body: 'The physical mounting deck tracks solar trajectories in real time based on coordinate sun-path positions. Dynamic corrective steps constantly face peak vector points, maximizing clean generation loops across changing seasons.',
      bullets: ['Integrated sensory monitors detect cloud density vectors to apply adjustments smoothly.', 'Adaptive execution budgets throttle motor frequencies during sustained low-light conditions.', 'High-strength mechanical locks engage automatically to defend systems from high-velocity wind loads.'],
      img: ASSETS.TECH_IMG_3, badge: 'Tracker Mechanical Tier', reverse: false
    }
  ];

  const TERMINAL_TABS = {
    pwr: [
      { ts: '08:42:01.204', tag: '[PWR_MGMT]', tagColor: 'var(--green)', val: 'Solar Bus Status: 14.2V | Charging Status: 100% | System Load: 12.4W | Core Temp: 28.4°C' },
      { ts: '08:42:03.811', tag: '[PWR_MGMT]', tagColor: 'var(--green)', val: 'MPPT Controller Target Profile: STABLE — Maximizing localized collector efficiency loops' },
      { ts: '08:42:08.002', tag: '[HARDWARE]', tagColor: '#ffb74d', val: 'LiFePO4 Array Voltage Profile: 13.8V | Connected Pack State of Charge: 97.4%' },
      { ts: '08:42:12.990', tag: '[PWR_MGMT]', tagColor: 'var(--green)', val: 'Subsystem Duty Cycle: 0.83 | Active Load Shedding Matrices: NONE' },
      { ts: '08:42:19.551', tag: '[PWR_MGMT]', tagColor: 'var(--green)', val: 'Solar Irradiance Array Readout: 780 W/m² | Computed Conversion Coefficient: 21.3%' },
      { ts: '08:42:22.008', tag: '[HARDWARE]', tagColor: '#ffb74d', val: 'Awaiting next power balance loop event telemetry sync...', cursor: true }
    ],
    ai: [
      { ts: '08:42:01.010', tag: '[AI_ENGINE]', tagColor: '#4fc3f7', val: 'YOLOv11 Tensor Pipeline State: ACTIVE — Frame processing synchronized smoothly at 32.4 FPS' },
      { ts: '08:42:01.044', tag: '[AI_ENGINE]', tagColor: '#4fc3f7', val: 'Compute Latency: 28ms | Secure Volatile Memory Buffer Flush Event: SUCCESSFUL' },
      { ts: '08:42:01.302', tag: '[DETECTION]', tagColor: '#4fc3f7', val: 'Current Classified Class Distributions: [person: 9, bicycle: 3, vehicle: 2]' },
      { ts: '08:42:01.889', tag: '[DETECTION]', tagColor: '#4fc3f7', val: 'Structural Crowd Density Matrix: LOW | Core Node Safety Anomaly Threshold Score: 0.04' },
      { ts: '08:42:02.114', tag: '[AI_ENGINE]', tagColor: '#4fc3f7', val: 'Hardware Processing Utilization Rate: 68% | Active Model Profile: yolov11n-quantized-INT8' },
      { ts: '08:42:02.991', tag: '[PRIVACY]', tagColor: '#a5d6a7', val: 'Raw pixel array cleared from device architecture — metadata count egress packet ready', cursor: true }
    ],
    solar: [
      { ts: '08:42:00.100', tag: '[TRACKER]', tagColor: '#ffd54f', val: 'Dual-Axis Mechanical Servos: ACTIVE | Azimuth Angle: 142.3° | Solar Elevation: 58.7°' },
      { ts: '08:42:00.800', tag: '[TRACKER]', tagColor: '#ffd54f', val: 'Sun-Tracking Ephemeris Computations: RUNNING | Next Angular Target Sweep Scheduled: 30s' },
      { ts: '08:42:01.400', tag: '[SENSORS]', tagColor: '#a5d6a7', val: 'Photo-reactive Light Intensity Metric: 780 W/m² | Cloud Attenuation Matrix Modifier: 8%' },
      { ts: '08:42:05.002', tag: '[TRACKER]', tagColor: '#ffd54f', val: 'Electromechanical Alignment Adjustment Dispatched: Δaz=0.4° | Δel=0.2°' },
      { ts: '08:42:10.320', tag: '[HARDWARE]', tagColor: '#ffb74d', val: 'Daily Cumulative Generation Index: 1.24 kWh | Projected Solar Peak Target Horizon: 3.6 kWh' },
      { ts: '08:42:15.001', tag: '[TRACKER]', tagColor: '#ffd54f', val: 'Performance Comparison Metric vs Static Deployments: +34.1% Net Yield Efficiency Gain', cursor: true }
    ]
  };

  const s = {
    wrap: { fontFamily: 'var(--fb)', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden', position: 'relative' } as const,
    nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 64px', height: 80, background: scrolled ? 'rgba(2, 5, 2, 0.95)' : 'rgba(2, 5, 2, 0.75)', backdropFilter: 'blur(30px) cubic-bezier(0.16, 1, 0.3, 1)', borderBottom: `1px solid ${scrolled ? 'var(--border-glow)' : 'var(--border)'}`, transition: 'background 0.4s, border-color 0.4s, height 0.4s' } as const,
    navLogo: { display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' } as const,
    navBrand: { fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 26, letterSpacing: '0.5px', color: '#fff', textTransform: 'uppercase' } as const,
    navSub: { fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--green)', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700 } as const,
    navLinks: { display: 'flex', gap: 40, listStyle: 'none', alignItems: 'center' } as const,
    navBtn: { padding: '12px 28px', background: 'var(--green)', color: '#020502', fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 14, letterSpacing: '1.5px', textTransform: 'uppercase', border: 'none', clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)', transition: 'background 0.25s, transform 0.25s' } as const,
    logoPh: { width: 44, height: 44, background: 'linear-gradient(135deg, var(--green), #3b5e00)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#fff', fontFamily: 'var(--fh)' } as const,
    hero: { position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 100, overflow: 'hidden' } as const,
    heroContent: { position: 'relative', zIndex: 10, padding: '0 80px', maxWidth: 1100 } as const,
    heroBadge: { display: 'inline-flex', alignItems: 'center', gap: 12, padding: '8px 18px', marginBottom: 32, border: '1px solid var(--border-glow)', background: 'rgba(118, 185, 0, 0.05)', fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--green)', fontWeight: 700 } as const,
    heroBadgeDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', animation: 'microPulse 1.8s infinite' } as const,
    heroTitle: { fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(56px, 8vw, 120px)', lineHeight: 0.9, letterSpacing: '-2px', textTransform: 'uppercase', marginBottom: 32, color: '#fff' } as const,
    heroSpan: { background: 'linear-gradient(90deg, var(--green), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' } as const,
    heroDesc: { fontSize: 19, lineHeight: 1.6, color: 'var(--muted)', maxWidth: 640, marginBottom: 48, fontWeight: 400 } as const,
    heroCtas: { display: 'flex', gap: 20, flexWrap: 'wrap' } as const,
    btnPrimary: { padding: '16px 40px', background: 'var(--green)', color: '#020502', fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 15, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', border: 'none', clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)', display: 'inline-block', transition: 'background 0.25s, transform 0.25s, box-shadow 0.25s', boxShadow: '0 4px 20px rgba(118,185,0,0.2)' } as const,
    btnGhost: { padding: '15px 40px', background: 'rgba(2,5,2,0.6)', color: 'var(--text)', fontFamily: 'var(--fh)', fontWeight: 700, fontSize: 15, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid var(--border)', backdropFilter: 'blur(10px)', display: 'inline-block', transition: 'border-color 0.25s, color 0.25s, background 0.25s' } as const,
    scrollHint: { position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '4px', color: 'rgba(118, 185, 0, 0.5)', textTransform: 'uppercase' } as const,
    ticker: { background: 'var(--green)', padding: '14px 0', overflow: 'hidden', position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(0,0,0,0.1)', borderTop: '1px solid rgba(0,0,0,0.1)' } as const,
    tickerTrack: { display: 'flex', width: 'max-content', animation: 'tickerScroll 28s linear infinite' } as const,
    tickerItem: { fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 13, letterSpacing: '3px', textTransform: 'uppercase', color: '#020502', padding: '0 32px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 32 } as const,
    metricsBar: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 10 } as const,
    metricCell: { padding: '48px 40px', borderRight: '1px solid var(--border)', position: 'relative', overflow: 'hidden' } as const,
    metricVal: { fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 56, letterSpacing: '-1.5px', color: '#fff', lineHeight: 1, marginBottom: 12 } as const,
    metricUnit: { color: 'var(--green)', fontSize: '55%', marginLeft: '4px', fontFamily: 'var(--fb)', fontWeight: 600 },
    metricLbl: { fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 12, fontWeight: 700 } as const,
    metricDesc: { fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, fontWeight: 400 } as const,
    secInner: { maxWidth: 1440, margin: '0 auto', padding: '0 80px' } as const,
    pillarsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 72 } as const,
    pillarCard: { padding: '64px 44px', background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', transition: 'border-color 0.4s, background 0.4s, transform 0.4s' } as const,
    pillarNum: { fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 96, color: 'rgba(118, 185, 0, 0.04)', lineHeight: 1, position: 'absolute', top: 20, right: 28, letterSpacing: '-4px', pointerEvents: 'none' } as const,
    pillarIcon: { width: 56, height: 56, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: 32, color: 'var(--green)', transition: 'all 0.3s' } as const,
    pillarTitle: { fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 28, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 18, color: '#fff' } as const,
    pillarBody: { fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', marginBottom: 32 } as const,
    pillarTags: { display: 'flex', flexWrap: 'wrap', gap: 8 } as const,
    pillarTag: { fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 12px', border: '1px solid var(--border)', color: 'var(--muted)', background: 'rgba(2,5,2,0.3)' } as const,
    techSplit: { display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 96, alignItems: 'center', marginBottom: 120 } as const,
    techList: { listStyle: 'none', marginTop: 32, display: 'flex', flexDirection: 'column', gap: 20 } as const,
    termWrap: { background: '#010401', border: '1px solid var(--border)', overflow: 'hidden', fontFamily: 'var(--fm)', marginTop: 64, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' } as const,
    termBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid var(--border)', background: 'rgba(118,185,0,0.02)' } as const,
    termTabs: { display: 'flex', gap: 4 } as const,
    termBody: { padding: 36, minHeight: 300, background: '#020502', overflowY: 'auto' } as const,
    termLine: { fontSize: 13, lineHeight: 2.2, display: 'flex', alignItems: 'flex-start', gap: 18, letterSpacing: '0.2px' } as const,
    manifesto: { padding: '160px 0', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden', textAlign: 'center' } as const,
    manifQuote: { fontFamily: 'var(--fh)', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(36px, 5.5vw, 72px)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-1.5px', color: '#fff', maxWidth: 1100, margin: '0 auto 48px', position: 'relative', zIndex: 1 } as const,
    manifChips: { display: 'flex', justifyCenter: 'center', gap: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 } as const,
    mChip: { fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', padding: '12px 28px', border: '1px solid rgba(118, 185, 0, 0.25)', color: 'var(--green)', background: 'rgba(118, 185, 0, 0.03)', clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)', fontWeight: 500 } as const,
    footer: { borderTop: '1px solid var(--border)', padding: '80px 80px 48px', background: 'var(--bg)' } as const,
    footTop: { display: 'flex', justifyCwontent: 'space-between', alignItems: 'center', paddingBottom: 48, borderBottom: '1px solid var(--border)', marginBottom: 40 } as const,
    footLinks: { display: 'flex', gap: 48 } as const,
    footBot: { display: 'flex', justifyCwontent: 'space-between', alignItems: 'center' } as const,
    footCopy: { fontSize: 12, color: 'rgba(130, 154, 130, 0.4)', fontFamily: 'var(--fm)' } as const,
    footVer: { fontFamily: 'var(--fm)', fontSize: 11, color: 'rgba(118, 185, 0, 0.5)', fontWeight: 700 } as const
  };

  const NavLink = ({ href, children }: NavLinkProps) => (
    <li>
      <a href={href} style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--fm)', transition: 'color 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
         onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')} 
         onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
        {children}
      </a>
    </li>
  );

  const FullPremiumLogo = ({ size = 44 }: FullPremiumLogoProps) => {
    if (ASSETS.LOGO_IMG && !ASSETS.LOGO_IMG.startsWith('REPLACE_')) {
      return <img src={ASSETS.LOGO_IMG} alt="EcoVision System Logo" style={{ width: size, height: size, objectFit: 'contain' }}/>;
    }
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
  };

  return (
    <div style={s.wrap}>
      <GlobalStyle/>
      <CustomCursor/>
      <div className="noise-overlay"/>

      {/* ══ NAVBAR ══ */}
      <nav style={s.nav}>
        <a href="#" style={s.navLogo}>
          <FullPremiumLogo size={46}/>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={s.navBrand}>EcoVision</span>
            <span style={s.navSub}>Smartpole Architecture</span>
          </div>
        </a>
        <ul style={s.navLinks}>
          <NavLink href="#specs">Specifications</NavLink>
          <NavLink href="#action-matrix">Vision Stream</NavLink>
          <NavLink href="#pillars">Core Pillars</NavLink>
          <NavLink href="#vision">Blueprint Specs</NavLink>
          <NavLink href="#logs">Node Telemetry</NavLink>
        </ul>
        <button style={s.navBtn} 
                onClick={() => document.getElementById('pillars')?.scrollIntoView({ behavior: 'smooth' })}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translate3d(0, -1px, 0)'; }} 
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.transform = 'none'; }}>
          Deploy Explorer
        </button>
      </nav>

      {/* ══ HERO ENVIRONMENT ══ */}
      <section style={s.hero} id="hero">
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
          {!ASSETS.HERO_VIDEO || ASSETS.HERO_VIDEO.startsWith('REPLACE_') ? (
            <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at 80% 40%, #081508 0%, var(--bg) 70%)', position: 'relative' }}>
              <div className="matrix-grid"/>
              <svg style={{ position: 'absolute', right: '6%', bottom: 0, height: '90vh', width: 'auto', opacity: 0.15, transition: 'opacity 0.5s' }} viewBox="0 0 160 800" fill="none">
                <line x1="80" y1="800" x2="80" y2="150" stroke="var(--green)" strokeWidth="3" strokeDasharray="8 4" />
                <rect x="65" y="450" width="30" height="180" fill="rgba(118,185,0,0.1)" stroke="var(--green)" strokeWidth="2" />
                <circle cx="80" cy="140" r="22" fill="var(--bg)" stroke="var(--green)" strokeWidth="4" />
                <circle cx="80" cy="140" r="6" fill="var(--accent)" />
                <path d="M 40 80 L 120 40 L 120 55 L 40 95 Z" fill="rgba(118,185,0,0.2)" stroke="var(--green)" strokeWidth="2" />
                <line x1="80" y1="140" x2="140" y2="200" stroke="var(--accent)" strokeWidth="2" />
                <circle cx="140" cy="200" r="4" fill="var(--accent)" />
              </svg>
            </div>
          ) : (
            <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }}>
              <source src={ASSETS.HERO_VIDEO} type="video/mp4"/>
            </video>
          )}
        </div>
        
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(0deg, var(--bg) 0%, rgba(2,5,2,0.4) 60%, transparent 100%)' }}/>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(90deg, var(--bg) 0%, rgba(2,5,2,0.7) 50%, transparent 100%)' }}/>

        <div style={s.heroContent}>
          <div style={s.heroBadge}>
            <span style={s.heroBadgeDot}/>
            EcoVision Smartpole Platform • Quantized Edge Processing
          </div>
          <h1 style={s.heroTitle}>
            Autonomous Infrastructure<br/>
            <span style={s.heroSpan}>Driven by Edge AI.</span>
          </h1>
          <p style={s.heroDesc}>
            Engineered with high-yield monocrystalline physical nodes and local YOLOv11 deep learning pipelines. Processing environment security distributions entirely inside embedded system nodes with absolute privacy parameters.
          </p>
          <div style={s.heroCtas}>
            <a href="#pillars" style={s.btnPrimary}
               onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translate3d(0, -2px, 0)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(118,185,0,0.4)'; }}
               onMouseLeave={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(118,185,0,0.2)'; }}>
              Analyze System Pillars
            </a>
            <a href="#vision" style={s.btnGhost}
               onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.background = 'rgba(118,185,0,0.02)'; }}
               onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(2,5,2,0.6)'; }}>
              Hardware Telemetry Blueprint
            </a>
          </div>
        </div>

        <div style={s.scrollHint}>
          <div style={{ width: 1, height: 64, background: 'linear-gradient(var(--green), transparent)' }}/>
          System Track
        </div>
      </section>

      {/* ══ RUNTIME CAPABILITIES STRIP ══ */}
      <div style={s.ticker}>
        <div style={s.tickerTrack}>
          {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, i) => (
            <span key={i} style={s.tickerItem}>
              {item} <span style={{ color: 'rgba(2,5,2,0.25)', fontStyle: 'normal', fontSize: 18 }}>//</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══ COUNTER DATA SPECS HORIZON ══ */}
      <div style={s.metricsBar} id="specs">
        {[
          { ref: refLatency, val: metricLatency, unit: 'ms', label: 'Edge Compute Latency', desc: 'Sub-50ms quantized INT8 YOLOv11 execution layer prevents external communication pipelines from introducing data transfer lags.' },
          { ref: refObjects, val: metricObjects, unit: 'K+', label: 'Local Object Profiles Traced', desc: 'Telemetry tracking metrics are compiled recursively and handled entirely on-node without writing to persistent logs.' },
          { ref: refPower, val: metricPower, unit: 'W', label: 'Continuous Solar Generation', desc: 'Dedicated monocrystalline physical cells paired with automated MPPT micro-regulators enforce off-grid performance.' },
          { ref: refRange, val: metricRange, unit: '°', label: 'Dual-Axis Tracking Envelope', desc: 'High-torque electronic servos actuate panel arrays to face exact solar coordinate vector positions across day arcs.' }
        ].map((m, i) => (
          <div key={i} ref={m.ref} className={`reveal d${i}`} style={{ ...s.metricCell, borderRight: i === 3 ? 'none' : '1px solid var(--border)' }}>
            <div style={s.metricLbl}>{m.label}</div>
            <div style={s.metricVal}>{m.val.toLocaleString()}<span style={s.metricUnit}>{m.unit}</span></div>
            <div style={s.metricDesc}>{m.desc}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(118,185,0,0.15), transparent)' }}/>
          </div>
        ))}
      </div>

      {/* ══ STREAM VIEWPORT SHOWCASE SECTION ══ */}
      <section style={{ padding: '140px 0 0', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 10 }} id="action-matrix">
        <div style={s.secInner}>
          <div className="reveal" style={{ marginBottom: 72 }}>
            <Eyebrow>Edge Vision Live Capture Arrays</Eyebrow>
            <SectionTitle>Real-Time Embedded Computer Vision.</SectionTitle>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, padding: '0 24px' }}>
          <div style={{ position: 'relative', overflow: 'hidden' }} className="reveal">
            <MediaShowcase src={ASSETS.YOLO_VIDEO} label="YOLOv11 Detection Environment Video" sublabel="Live Inference Frame Buffer Tracking Feed Loop • Quantized NPU Layout" minHeight={740}/>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '36px', zIndex: 20, background: 'linear-gradient(to top, var(--bg) 0%, transparent)' }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8, fontWeight: 700 }}>Inference Viewport Node Active</div>
              <div style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 28, textTransform: 'uppercase', color: '#fff', letterSpacing: '0.5px' }}>YOLOv11 Object Localization Vector Loops</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }} className="reveal d1">
              <MediaShowcase src={ASSETS.POWER_VIDEO} label="Micro-Grid Power Management Analytics" sublabel="Lithium Iron Phosphate Energy Profiles Monitor" minHeight={358}/>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px', zIndex: 20, background: 'linear-gradient(to top, var(--bg) 0%, transparent)' }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 6, fontWeight: 700 }}>Telemetry Subsystem</div>
                <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase', color: '#fff' }}>Autonomous Micro-Grid Harvesting</div>
              </div>
            </div>

            <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }} className="reveal d2">
              <MediaShowcase src={ASSETS.SOLAR_VIDEO} label="Electromechanical Tracker Positioning Flow" sublabel="Dual-Axis Tracking Alignment Automation Feed" minHeight={358}/>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px', zIndex: 20, background: 'linear-gradient(to top, var(--bg) 0%, transparent)' }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 6, fontWeight: 700 }}>Positioning Matrix</div>
                <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase', color: '#fff' }}>Dual-Axis Solar Trajectory Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ THREE ENGINEERING PILLARS ══ */}
      <section style={{ padding: '140px 0', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 10 }} id="pillars">
        <div style={s.secInner}>
          <div className="reveal">
            <Eyebrow>Core Technological Execution Blueprints</Eyebrow>
            <SectionTitle>The Core Smartpole Foundations.</SectionTitle>
          </div>
          
          <div style={s.pillarsGrid}>
            {PILLARS.map((p, i) => (
              <div key={i} className={`reveal d${i}`} style={s.pillarCard}
                   onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'rgba(10,22,10,0.6)'; e.currentTarget.style.transform = 'translate3d(0, -4px, 0)'; }}
                   onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={s.pillarNum}>{p.num}</div>
                <div style={s.pillarIcon}>{p.icon}</div>
                <h3 style={s.pillarTitle}>{p.label}</h3>
                <p style={s.pillarBody}>{p.body}</p>
                <div style={s.pillarTags}>
                  {p.tags.map((t, j) => <span key={j} style={s.pillarTag}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DEEP TECH COMPONENT SPECIFICATION BLOCKS ══ */}
      <section style={{ padding: '140px 0', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 10 }} id="vision">
        <div style={s.secInner}>
          <div className="reveal" style={{ marginBottom: 96 }}>
            <Eyebrow>Embedded Hardware Systems Blueprint</Eyebrow>
            <SectionTitle>Architecture Merges<br/>With Processing Logic.</SectionTitle>
          </div>

          {TECH_SPLITS.map((split, i) => (
            <div key={i} style={{ ...s.techSplit, ...(split.reverse ? { direction: 'rtl' } : {}), marginBottom: i === TECH_SPLITS.length - 1 ? 0 : 120 }}>
              <div className="reveal" style={split.reverse ? { direction: 'ltr' } : {}}>
                <TechnicalSpecVisual src={split.img} badge={split.badge} label={`Technical Architecture Blueprint Layer Asset Matrix — ${split.badge.toUpperCase()}`}/>
              </div>
              <div className="reveal d1" style={split.reverse ? { direction: 'ltr' } : {}}>
                <Eyebrow>{split.eyebrow}</Eyebrow>
                <SectionTitle size="clamp(32px, 3.8vw, 48px)">{split.title.split('\n').map((line, j) => <span key={j}>{line}<br/></span>)}</SectionTitle>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--muted)', marginBottom: 28, fontWeight: 400 }}>{split.body}</p>
                <ul style={s.techList}>
                  {split.bullets.map((b, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
                      <span style={{ display: 'block', width: 14, height: 2, background: 'var(--green)', flexShrink: 0, marginTop: 10 }}/>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SYSTEM CONSOLE METRIC LOGS TERMINAL ══ */}
      <section style={{ padding: '140px 0', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 10 }} id="logs">
        <div style={s.secInner}>
          <div className="reveal">
            <Eyebrow>Live System Metric Telemetry Logs</Eyebrow>
            <SectionTitle>Distributed Node Console.</SectionTitle>
          </div>

          <div className="reveal d1" style={s.termWrap}>
            <div style={s.termBar}>
              <div style={{ display: 'flex', gap: 8 }}>
                {['#ff5f56', '#ffbd2e', '#27c93f'].map((c, i) => <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, display: 'block' }}/>)}
              </div>
              <div style={s.termTabs}>
                {(['pwr', 'ai', 'solar'] as const).map(id => (
                  <button key={id} onClick={() => setActiveTab(id)}
                          style={{
                            padding: '8px 24px', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase',
                            border: `1px solid ${activeTab === id ? 'var(--border)' : 'transparent'}`,
                            background: activeTab === id ? 'rgba(118, 185, 0, 0.04)' : 'transparent',
                            color: activeTab === id ? 'var(--green)' : 'var(--muted)',
                            fontFamily: 'var(--fm)', fontWeight: activeTab === id ? 700 : 500, transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}>
                    {id === 'pwr' ? 'power_system.log' : id === 'ai' ? 'yolo11_inference.log' : 'electromechanical_tracker.log'}
                  </button>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '2px', color: 'var(--green)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }}/>
                Execution Node Online
              </div>
            </div>

            <div style={s.termBody}>
              <div key={activeTab} style={{ animation: 'fadeSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                {TERMINAL_TABS[activeTab].map((line, i) => (
                  <div key={i} style={s.termLine}>
                    <span style={{ color: 'rgba(118,185,0,0.3)', fontWeight: 500 }}>{line.ts}</span>
                    <span style={{ color: line.tagColor, fontWeight: 800 }}>{line.tag}</span>
                    <span style={{ color: 'var(--text)', flex: 1, fontWeight: 400 }}>
                      {line.val.split(/(\d+\.?\d*[%°a-zA-Z]*|\b[A-Z_]{4,}\b)/g).map((token, k) => 
                        /^\d+\.?\d*[%°a-zA-Z]*$|^(ACTIVE|ACTIVE_NODE_08|NPU|INT8|SUCCESS|STABLE|NONE|RUNNING|TRUE|FALSE)$/.test(token)
                          ? <b key={k} style={{ color: '#fff', fontWeight: 700, fontFamily: 'var(--fm)' }}>{token}</b>
                          : <span key={k}>{token}</span>
                      )}
                      {line.cursor && <span style={{ display: 'inline-block', width: 8, height: 15, background: 'var(--green)', animation: 'blink 0.8s step-end infinite', verticalAlign: 'middle', marginLeft: 6 }}/>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MANIFESTO DECK ══ */}
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

      {/* ══ APPLICATION FOOTER ══ */}
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
            {[['#specs', 'Specs Matrix'], ['#action-matrix', 'Inference Feed'], ['#pillars', 'System Pillars'], ['#vision', 'Blueprints']].map(([url, label]) => (
              <a key={url} href={url} style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--fm)', transition: 'color 0.2s' }}
                 onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                {label}
              </a>
            ))}
          </div>
        </div>
        <div style={s.footBot}>
          <div style={s.footCopy}>&copy; {new Date().getFullYear()} EcoVision Smartpole Infrastructure System Platform. All rights reserved across production nodes.</div>
          <div style={s.footVer}>v2.1.0 • YOLOv11 NPU Deployment Framework</div>
        </div>
      </footer>
    </div>
  );
}