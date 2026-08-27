import React, { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   🎬 REPLACEABLE MEDIA REGISTRY — the ONLY place video/image paths live.

   To swap in new footage or photos: drop the file into /public (or paste a
   full https:// URL from a CDN / Vercel Blob store) and update the matching
   line below — nothing else in the codebase needs to change.

   Leave a value as "" to show the built-in "SETUP REQUIRED" placeholder
   graphic instead of a broken/blank video or image tag.
   ───────────────────────────────────────────────────────────────────────────── */
export const ASSETS = {
  // Hero section — big autoplaying background loop behind the headline
  HERO_VIDEO: "/AssaultDetected.mp4",

  // "Live AI Video Feeds" showcase grid (StreamShowcase). Every entry below
  // is real footage from the actual system (recordings/ + static/screenshots/,
  // auto-saved the moment a detector fired) -- not stock or benchmark clips.
  VIOLENCE_FEED:  "/AssaultDetected.mp4",   // AUTO_ASSAULT recording, trimmed to the confirmed-alert window
  WEAPON_FEED:    "",  // no real weapon incident has been recorded yet -- see WeaponDetection note below
  ROBBERY_FEED:   "/RobberyDetection.mp4",  // AUTO_ROBBERY recording, trimmed to the confirmed-alert window
  VANDALISM_FEED: "/VandalismDetection.jpg", // the video's visible per-track boxes only show ASSAULT (other
                                              // bystanders independently tracked) -- the vandalism call itself
                                              // is scene-level and only renders on the evidence snapshot, so
                                              // that snapshot (VANDALISM 88.8%) is used here instead, as an image.

  // Hardware breakdown photos (BlueprintSpecs, "How the Hardware Works" section)
  TECH_IMG_CAMERA: "",  // e.g. "/camera-hardware.jpg"
  TECH_IMG_POWER:  "",  // e.g. "/power-unit.jpg"
  TECH_IMG_SOLAR:  "",  // e.g. "/solar-tracker.jpg"
};

/* ─────────────────────────────────────────────────────────────────────────────
   ⚡ UTILITY INTERACTION HOOKS
   ───────────────────────────────────────────────────────────────────────────── */
export function useReveal() {
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

/** Plays a muted background <video> only while it's scrolled into view, and
 * pauses it otherwise, so below-the-fold showcase clips don't all decode and
 * play at once on page load. */
export function useInViewVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export function useCounter(target: number, duration = 2000) {
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
   🎨 HARDWARE INTERFACE LAYOUT STYLES MAP
   ───────────────────────────────────────────────────────────────────────────── */
export const s = {
  wrap: { fontFamily: 'var(--fb)', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden', position: 'relative' } as const,
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--nav-pad)', height: 80, transition: 'background 0.4s, border-color 0.4s, height 0.4s' } as const,
  navLogo: { display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' } as const,
  navBrand: { fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 26, letterSpacing: '0.5px', color: '#fff', textTransform: 'uppercase' } as const,
  navSub: { fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--green)', letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700 } as const,
  navLinks: { display: 'flex', gap: 40, listStyle: 'none', alignItems: 'center' } as const,
  navBtn: { padding: '12px 28px', background: 'var(--green)', color: '#020502', fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 14, letterSpacing: '1.5px', textTransform: 'uppercase', border: 'none', clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)', transition: 'background 0.25s, transform 0.25s' } as const,
  logoPh: { width: 44, height: 44, background: 'linear-gradient(135deg, var(--green), #3b5e00)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#fff', fontFamily: 'var(--fh)' } as const,
  hero: { position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 100, overflow: 'hidden' } as const,
  heroContent: { position: 'relative', zIndex: 10, padding: '0 var(--gutter)', maxWidth: 1100 } as const,
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
  metricsBar: { display: 'grid', gridTemplateColumns: 'var(--metrics-cols)', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 10 } as const,
  metricCell: { padding: '48px 40px', borderRight: '1px solid var(--border)', position: 'relative', overflow: 'hidden' } as const,
  metricVal: { fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 56, letterSpacing: '-1.5px', color: '#fff', lineHeight: 1, marginBottom: 12 } as const,
  metricUnit: { color: 'var(--green)', fontSize: '55%', marginLeft: '4px', fontFamily: 'var(--fb)', fontWeight: 600 },
  metricLbl: { fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 12, fontWeight: 700 } as const,
  metricDesc: { fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, fontWeight: 400 } as const,
  secInner: { maxWidth: 1440, margin: '0 auto', padding: '0 var(--gutter)' } as const,
  pillarsGrid: { display: 'grid', gridTemplateColumns: 'var(--pillars-cols)', gap: 24, marginTop: 72 } as const,
  pillarCard: { padding: '64px 44px', background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', transition: 'border-color 0.4s, background 0.4s, transform 0.4s' } as const,
  pillarNum: { fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 96, color: 'rgba(118, 185, 0, 0.04)', lineHeight: 1, position: 'absolute', top: 20, right: 28, letterSpacing: '-4px', pointerEvents: 'none' } as const,
  pillarIcon: { width: 56, height: 56, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: 32, color: 'var(--green)', transition: 'all 0.3s' } as const,
  pillarTitle: { fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 28, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 18, color: '#fff' } as const,
  pillarBody: { fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', marginBottom: 32 } as const,
  pillarTags: { display: 'flex', flexWrap: 'wrap', gap: 8 } as const,
  pillarTag: { fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 12px', border: '1px solid var(--border)', color: 'var(--muted)', background: 'rgba(2,5,2,0.3)' } as const,
  techSplit: { display: 'grid', gridTemplateColumns: 'var(--tech-cols)', gap: 'var(--tech-gap)', alignItems: 'center', marginBottom: 120 } as const,
  techList: { listStyle: 'none', marginTop: 32, display: 'flex', flexDirection: 'column', gap: 20 } as const,
  termWrap: { background: '#010401', border: '1px solid var(--border)', overflow: 'hidden', fontFamily: 'var(--fm)', marginTop: 64, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative' } as const,
  manifesto: { padding: '160px 0', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden', textAlign: 'center' } as const,
  manifQuote: { fontFamily: 'var(--fh)', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(36px, 5.5vw, 72px)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-1.5px', color: '#fff', maxWidth: 1100, margin: '0 auto 48px', position: 'relative', zIndex: 1 } as const,
  manifChips: { display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 } as const,
  mChip: { fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', padding: '12px 28px', border: '1px solid rgba(118, 185, 0, 0.25)', color: 'var(--green)', background: 'rgba(118, 185, 0, 0.03)', clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)', fontWeight: 500 } as const,
  footer: { borderTop: '1px solid var(--border)', padding: '80px var(--gutter) 48px', background: 'var(--bg)' } as const,
  footTop: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24, paddingBottom: 48, borderBottom: '1px solid var(--border)', marginBottom: 40 } as const,
  footLinks: { display: 'flex', flexWrap: 'wrap', gap: 32 } as const,
  footBot: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 } as const,
  footCopy: { fontSize: 12, color: 'rgba(130, 154, 130, 0.4)', fontFamily: 'var(--fm)' } as const,
  footVer: { fontFamily: 'var(--fm)', fontSize: 11, color: 'rgba(118, 185, 0, 0.5)', fontWeight: 700 } as const,
  contactGrid: { display: 'grid', gridTemplateColumns: 'var(--contact-cols)', gap: 64, alignItems: 'start' } as const,
  sandboxGrid: { display: 'grid', gridTemplateColumns: 'var(--sandbox-cols)', gap: 2, background: 'var(--border)', border: '1px solid var(--border)', marginTop: 48, boxShadow: '0 25px 60px rgba(0,0,0,0.6)' } as const
};