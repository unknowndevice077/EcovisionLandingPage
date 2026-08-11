import React from 'react';
import { s, ASSETS } from '../styles';
import { MediaShowcaseProps, TechnicalSpecVisualProps, MetricSpecProps, PillarItemProps, SplitConfigProps } from '../types';

export function MediaShowcase({ label, sublabel, minHeight = 380, src, type = 'video' }: MediaShowcaseProps) {
  const isPlaceholder = !src;
  return (
    <div style={{ width: '100%', minHeight, background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', animation: 'edgePulse 8s ease-in-out infinite' }}>
      {!isPlaceholder ? (
        type === 'video' ? (
          <video autoPlay muted loop playsInline preload="metadata" poster={src.replace(/\.mp4$/i, '.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.75 }}>
            <source src={src} type="video/mp4"/>
          </video>
        ) : (
          <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.8 }}/>
        )
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(118,185,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(118,185,0,.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }}/>
          <div style={{ width: 64, height: 64, border: '1px solid rgba(118,185,0,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(118,185,0,.02)' }}>
            <svg viewBox="0 0 24 24" fill="var(--green)" style={{ width: 24, height: 24, marginLeft: type === 'video' ? 2 : 0 }}><path d={type === 'video' ? "M8 5v14l11-7z" : "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"}/></svg>
          </div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: 2, color: 'rgba(118,185,0,.4)', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.8 }}>
            ⚡ {label} SETUP REQUIRED <br/> <span style={{ color: 'var(--muted)' }}>{sublabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function TechnicalSpecVisual({ label, badge, src }: TechnicalSpecVisualProps) {
  const isPlaceholder = !src;
  return (
    <div style={{ position: 'relative', height: 480, border: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden' }}>
      {!isPlaceholder ? (
        <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}/>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(118,185,0,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(118,185,0,.02) 1px, transparent 1px)', backgroundSize: '24px 24px' }}/>
          <div style={{ fontFamily: 'var(--fm)', color: 'rgba(118,185,0,.25)', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', border: '1px dashed rgba(118,185,0,.15)', padding: '24px 32px' }}>
            🛰️ {label} NOT LINKED
          </div>
        </div>
      )}
      {[{ t: 0, l: 0, bw: '1px 0 0 1px' }, { t: 0, r: 0, bw: '1px 1px 0 0' }, { b: 0, l: 0, bw: '0 0 1px 1px' }, { b: 0, r: 0, bw: '0 1px 1px 0' }].map((c, i) => (
        <div key={i} style={{ position: 'absolute', width: 16, height: 16, borderColor: 'var(--green)', borderStyle: 'solid', borderWidth: c.bw, opacity: 0.5, ...(c.t !== undefined ? { top: c.t } : {}), ...(c.b !== undefined ? { bottom: c.b } : {}), ...(c.l !== undefined ? { left: c.l } : {}), ...(c.r !== undefined ? { right: c.r } : {}) }}/>
      ))}
      <div style={{ position: 'absolute', top: 20, left: 20, fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: 2, color: '#000', background: 'var(--green)', textTransform: 'uppercase', padding: '5px 10px', fontWeight: 700 }}>{badge}</div>
    </div>
  );
}

export function Hero() {
  return (
    <section style={s.hero} id="hero">
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        {!ASSETS.HERO_VIDEO ? (
          <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at 80% 40%, #030d03 0%, var(--bg) 75%)', position: 'relative' }}>
            <div className="matrix-grid"/>
            <div className="camera-blueprint-layer" />
            <svg style={{ position: 'absolute', right: '4%', bottom: 0, height: '92vh', width: 'auto', opacity: 0.18, zIndex: 1 }} viewBox="0 0 24 800" fill="none">
              <line x1="12" y1="800" x2="12" y2="160" stroke="var(--green)" strokeWidth="2.5" strokeDasharray="6 4" />
              <rect x="5" y="480" width="14" height="140" fill="rgba(118,185,0,0.08)" stroke="var(--green)" strokeWidth="1.5" />
              <line x1="12" y1="140" x2="48" y2="185" stroke="var(--accent)" strokeWidth="1.5" />
              <circle cx="48" cy="185" r="3.5" fill="var(--accent)" />
            </svg>
          </div>
        ) : (
          <video autoPlay muted loop playsInline preload="metadata" poster={ASSETS.HERO_VIDEO.replace(/\.mp4$/i, '.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }}>
            <source src={ASSETS.HERO_VIDEO} type="video/mp4"/>
          </video>
        )}
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(0deg, var(--bg) 0%, rgba(2,5,2,0.4) 60%, transparent 100%)' }}/>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(90deg, var(--bg) 0%, rgba(2,5,2,0.7) 50%, transparent 100%)' }}/>
      <div style={s.heroContent}>
        <div style={s.heroBadge}><span style={s.heroBadgeDot}/>EcoVision Smartpole • Local AI Detection Node</div>
        <h1 style={s.heroTitle}>EcoVision<br/><span style={s.heroSpan}>Driven by Edge AI.</span></h1>
        <p style={s.heroDesc}>Built with a smart solar panel system and local AI processing. The pole detects threats right on the spot without sending your private data anywhere, keeping neighborhoods safe 24/7.</p>
        <div style={s.heroCtas}>
          <a href="#pillars" style={s.btnPrimary}>Explore Core Features</a>
          <a href="#vision" style={s.btnGhost}>View System Blueprint</a>
        </div>
      </div>
      <div style={s.scrollHint}><div style={{ width: 1, height: 64, background: 'linear-gradient(var(--green), transparent)' }}/>Scroll Down</div>
    </section>
  );
}

export function Ticker({ items }: { items: string[] }) {
  return (
    <div style={s.ticker}>
      <div style={s.tickerTrack}>
        {items.concat(items).map((item, i) => (
          <span key={i} style={s.tickerItem}>{item} <span style={{ color: 'rgba(2,5,2,0.25)', fontStyle: 'normal', fontSize: 18 }}>//</span></span>
        ))}
      </div>
    </div>
  );
}

export function Metrics({ latencyRef, objectsRef, powerRef, rangeRef, metricLatency, metricObjects, metricPower, metricRange }: MetricSpecProps) {
  return (
    <div style={s.metricsBar} id="specs">
      {[
        { ref: latencyRef, val: metricLatency, unit: 'ms', label: 'Local AI Response Time', desc: 'The on-board AI checks video frames in milliseconds, avoiding any slow internet or network delays.' },
        { ref: objectsRef, val: metricObjects, unit: 'K+', label: 'Local Threat Matches', desc: 'Monitored safety events are processed completely on the pole without saving or leaking private user details.' },
        { ref: powerRef, val: metricPower, unit: 'W', label: 'Continuous Solar Energy', desc: 'High-efficiency solar panels and chargers keep the pole running completely independent of the city grid.' },
        { ref: rangeRef, val: metricRange, unit: '°', label: 'Solar Panel Adjustment', desc: 'The smart solar panel moves automatically on a single axis to follow the sun and capture maximum power.' }
      ].map((m, i) => (
        <div key={i} ref={m.ref} className={`reveal d${i}`} style={{ ...s.metricCell, borderRight: i === 3 ? 'none' : '1px solid var(--border)' }}>
          <div style={s.metricLbl}>{m.label}</div>
          <div style={s.metricVal}>{m.val.toLocaleString()}<span style={s.metricUnit}>{m.unit}</span></div>
          <div style={s.metricDesc}>{m.desc}</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(118, 185, 0, 0.15), transparent)' }}/>
        </div>
      ))}
    </div>
  );
}

export function StreamShowcase() {
  return (
    <section style={{ padding: '140px 0 0', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 10 }} id="action-matrix">
      <div style={s.secInner}>
        <div className="reveal" style={{ marginBottom: 72 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontWeight: 700 }}>
            <span style={{ display: 'block', width: 24, height: 2, background: 'var(--green)' }}/>
            Live AI Video Feeds
          </div>
          <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(44px, 5.5vw, 76px)', lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-1.5px', color: '#fff', marginBottom: 24, animation: 'textGlitch 12s infinite step-end' }}>
            Real-Time On-Pole Computer Vision.
          </h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(48%, 1fr))', gap: 24, padding: '0 24px' }}>
        
        <div style={{ position: 'relative', overflow: 'hidden' }} className="reveal">
          <MediaShowcase src={ASSETS.VIOLENCE_FEED} label="Violence / Assault Detection Feed" sublabel="Live Camera Stream • Physical Fight Detection System" minHeight={380}/>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px', zIndex: 20, background: 'linear-gradient(to top, var(--bg) 0%, transparent)' }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#ff3b30', marginBottom: 6, fontWeight: 700 }}>CAM_01 // LENS HIGH ALERT</div>
            <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase', color: '#fff' }}>Violence &amp; Assault Detection Feed</div>
          </div>
        </div>

        <div style={{ position: 'relative', overflow: 'hidden' }} className="reveal d1">
          <MediaShowcase src={ASSETS.WEAPON_FEED} label="Weapon / Gun Detection Feed" sublabel="Live Camera Stream • Dangerous Object Tracking Array" minHeight={380}/>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px', zIndex: 20, background: 'linear-gradient(to top, var(--bg) 0%, transparent)' }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#ffcc00', marginBottom: 6, fontWeight: 700 }}>CAM_02 // SEARCH FEED</div>
            <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase', color: '#fff' }}>Guns &amp; Weapons Detection Feed</div>
          </div>
        </div>

        <div style={{ position: 'relative', overflow: 'hidden' }} className="reveal">
          <MediaShowcase src={ASSETS.THEFT_FEED} label="Theft Detection Feed" sublabel="Live Camera Stream • Property and Asset Theft Monitor" minHeight={380}/>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px', zIndex: 20, background: 'linear-gradient(to top, var(--bg) 0%, transparent)' }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 6, fontWeight: 700 }}>CAM_03 // PERIMETER SAFE</div>
            <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase', color: '#fff' }}>Theft &amp; Asset Protection Feed</div>
          </div>
        </div>

        <div style={{ position: 'relative', overflow: 'hidden' }} className="reveal d1">
          <MediaShowcase src={ASSETS.VANDALISM_FEED} label="Vandalism Detection Feed" sublabel="Live Camera Stream • Surface Damage and Graffiti Monitor" minHeight={380}/>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px', zIndex: 20, background: 'linear-gradient(to top, var(--bg) 0%, transparent)' }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 6, fontWeight: 700 }}>CAM_04 // PUBLIC SPACE AUDIT</div>
            <div style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 22, textTransform: 'uppercase', color: '#fff' }}>Vandalism &amp; Property Damage Feed</div>
          </div>
        </div>

      </div>
    </section>
  );
}

export function SecurityCapabilitiesGrid() {
  const capabilities = [
    {
      title: "Assault Detection",
      badge: "Local AI",
      desc: "The camera instantly spots physical fights or violence, flagging dangerous activity right away to keep the public square secure.",
      svgBackdrop: (
        <svg viewBox="0 0 100 100" fill="none" stroke="var(--green)" strokeWidth="0.5" opacity="0.04" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <path d="M10 20 L30 80 M25 20 L45 80 M70 15 L30 85 M85 30 L50 90" strokeWidth="1" />
          <circle cx="38" cy="52" r="12" strokeDasharray="2 2" />
          <circle cx="55" cy="45" r="18" strokeDasharray="3 1" />
        </svg>
      )
    },
    {
      title: "Weapon Detection",
      badge: "Local AI",
      desc: "Scans for guns, knives, and other dangerous weapons in milliseconds, matching shapes locally to stop threats before they escalate.",
      svgBackdrop: (
        <svg viewBox="0 0 100 100" fill="none" stroke="var(--green)" strokeWidth="0.5" opacity="0.04" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <circle cx="50" cy="50" r="35" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="20" />
          <circle cx="50" cy="50" r="8" fill="var(--green)" opacity="0.1" />
          <line x1="50" y1="5" x2="50" y2="95" strokeWidth="0.75" strokeDasharray="4 2" />
          <line x1="5" y1="50" x2="95" y2="50" strokeWidth="0.75" strokeDasharray="4 2" />
        </svg>
      )
    },
    {
      title: "Theft Detection",
      badge: "Local AI",
      desc: "Monitors secure perimeters and flags suspicious behavior if items or property are suddenly removed or stolen from the area.",
      svgBackdrop: (
        <svg viewBox="0 0 100 100" fill="none" stroke="var(--green)" strokeWidth="0.5" opacity="0.04" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <rect x="15" y="15" width="70" height="70" strokeWidth="1" strokeDasharray="4 4" />
          <rect x="30" y="30" width="40" height="40" />
          <path d="M15 15 L30 30 M85 15 L70 30 M15 85 L30 70 M85 85 L70 70" />
          <circle cx="50" cy="50" r="4" fill="var(--green)" />
        </svg>
      )
    },
    {
      title: "Vandalism Detection",
      badge: "Local AI",
      desc: "Detects property destruction or spray-paint graffiti instantly by tracking visual surface changes on public walls and facilities.",
      svgBackdrop: (
        <svg viewBox="0 0 100 100" fill="none" stroke="var(--green)" strokeWidth="0.5" opacity="0.04" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <path d="M5 20 Q 25 80, 50 20 T 95 20" strokeWidth="1" />
          <path d="M5 50 Q 35 10, 50 80 T 95 50" strokeWidth="0.5" />
          <line x1="20" y1="0" x2="20" y2="100" strokeDasharray="1 3" />
          <line x1="80" y1="0" x2="80" y2="100" strokeDasharray="1 3" />
        </svg>
      )
    },
    {
      title: "Solar Tracker Efficiency",
      badge: "Power Module",
      desc: "An internal motor automatically tilts the solar panel array toward the sun all day long, boosting power collection by maximum margins.",
      svgBackdrop: (
        <svg viewBox="0 0 100 100" fill="none" stroke="var(--green)" strokeWidth="0.5" opacity="0.04" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <path d="M10 80 A 45 45 0 0 1 90 80" strokeWidth="1.5" strokeDasharray="5 3" />
          <line x1="50" y1="80" x2="50" y2="35" strokeWidth="2" />
          <circle cx="50" cy="35" r="4" fill="var(--green)" />
          <path d="M30 45 L70 25 M30 50 L70 30" strokeWidth="1" />
        </svg>
      )
    },
    {
      title: "Automated Siren Alert",
      badge: "Active Warning",
      desc: "An extra-loud warning siren sounds immediately when a crime is verified by the camera, scaring off bad actors right on the spot.",
      svgBackdrop: (
        <svg viewBox="0 0 100 100" fill="none" stroke="var(--green)" strokeWidth="0.5" opacity="0.04" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <path d="M20 50 A 10 10 0 0 1 30 40 M20 50 A 20 20 0 0 1 40 30 M20 50 A 30 30 0 0 1 50 20" strokeWidth="1" />
          <path d="M80 50 A 10 10 0 0 0 70 40 M80 50 A 20 20 0 0 0 60 30 M80 50 A 30 30 0 0 0 50 20" strokeWidth="1" />
          <rect x="44" y="45" width="12" height="25" rx="2" strokeWidth="1.5" />
          <circle cx="50" cy="40" r="5" fill="var(--green)" />
        </svg>
      )
    },
    {
      title: "Emergency Panic Button",
      badge: "Instant Assist",
      desc: "A built-in physical button on the pole for citizens. If someone feels threatened, pushing it instantly activates an emergency call for help.",
      svgBackdrop: (
        <svg viewBox="0 0 100 100" fill="none" stroke="var(--green)" strokeWidth="0.5" opacity="0.04" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <circle cx="50" cy="50" r="16" strokeWidth="2" />
          <circle cx="50" cy="50" r="28" strokeDasharray="6 3" />
          <circle cx="50" cy="50" r="40" strokeWidth="0.5" />
          <path d="M50 10 L50 20 M10 50 L20 50 M50 80 L50 90 M80 50 L90 50" />
        </svg>
      )
    }
  ];

  return (
    <section style={{ padding: '140px 0', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 10 }} id="capabilities">
      <div style={s.secInner}>
        <div className="reveal" style={{ marginBottom: 72 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontWeight: 700 }}>
            <span style={{ display: 'block', width: 24, height: 2, background: 'var(--green)' }}/>
            Safety Response Protocols
          </div>
          <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(44px, 5.5vw, 76px)', lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-1.5px', color: '#fff', marginBottom: 24, animation: 'textGlitch 12s infinite step-end' }}>
            Threat Detection &amp; Deterrence.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {capabilities.map((item, idx) => (
            <div key={idx} className="reveal" style={{ padding: '48px 36px', background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s, background 0.3s' }}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'rgba(10,22,10,0.4)'; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}>
              
              {item.svgBackdrop}

              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid var(--border)', color: 'var(--green)', background: '#020502', fontWeight: 700, display: 'inline-block', marginBottom: 24 }}>
                  {item.badge}
                </span>
                <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14, color: '#fff' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', fontWeight: 400 }}>
                  {item.desc}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pillars({ segments }: { segments: PillarItemProps[] }) {
  return (
    <section style={{ padding: '140px 0', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 10 }} id="pillars">
      <div style={s.secInner}>
        <div className="reveal">
          <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontWeight: 700 }}><span style={{ display: 'block', width: 24, height: 2, background: 'var(--green)' }}/>System Core Blueprints</div>
          <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(44px, 5.5vw, 76px)', lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-1.5px', color: '#fff', marginBottom: 24, animation: 'textGlitch 12s infinite step-end' }}>The Smartpole Foundations.</h2>
        </div>
        <div style={s.pillarsGrid}>
          {segments.map((p, i) => (
            <div key={i} className={`reveal d${i}`} style={s.pillarCard}
                 onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'rgba(10,22,10,0.6)'; e.currentTarget.style.transform = 'translate3d(0, -4px, 0)'; }}
                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={s.pillarNum}>{p.num}</div>
              <div style={s.pillarIcon}>{p.icon}</div>
              <h3 style={s.pillarTitle}>{p.label}</h3>
              <p style={s.pillarBody}>{p.body}</p>
              <div style={s.pillarTags}>{p.tags.map((t, j) => <span key={j} style={s.pillarTag}>{t}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BlueprintSpecs({ configurations }: { configurations: SplitConfigProps[] }) {
  return (
    <section style={{ padding: '140px 0', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 10 }} id="vision">
      <div style={s.secInner}>
        <div className="reveal" style={{ marginBottom: 96 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontWeight: 700 }}><span style={{ display: 'block', width: 24, height: 2, background: 'var(--green)' }}/>Hardware Subsystems Breakdown</div>
          <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(44px, 5.5vw, 76px)', lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-1.5px', color: '#fff', marginBottom: 24, animation: 'textGlitch 12s infinite step-end' }}>How the Hardware Components<br/>Work Together.</h2>
        </div>
        {configurations.map((split, i) => (
          <div key={i} style={{ ...s.techSplit, ...(split.reverse ? { direction: 'rtl' } : {}), marginBottom: i === configurations.length - 1 ? 0 : 120 }}>
            <div className="reveal" style={split.reverse ? { direction: 'ltr' } : {}}>
              <TechnicalSpecVisual src={split.img} badge={split.badge} label={`Hardware Part Layout — ${split.badge.toUpperCase()}`}/>
            </div>
            <div className="reveal d1" style={split.reverse ? { direction: 'ltr' } : {}}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontWeight: 700 }}><span style={{ display: 'block', width: 24, height: 2, background: 'var(--green)' }}/>{split.eyebrow}</div>
              <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(32px, 3.8vw, 48px)', lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-1.5px', color: '#fff', marginBottom: 24, animation: 'textGlitch 12s infinite step-end' }}>{split.title.split('\n').map((line, j) => <span key={j}>{line}<br/></span>)}</h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--muted)', marginBottom: 28, fontWeight: 400 }}>{split.body}</p>
              <ul style={s.techList}>
                {split.bullets.map((b, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}><span style={{ display: 'block', width: 14, height: 2, background: 'var(--green)', flexShrink: 0, marginTop: 10 }}/>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   👥 PROJECT DEVELOPERS PROFILES AREA
   ───────────────────────────────────────────────────────────────────────────── */
export function DeveloperProfiles() {
  const developers = [
    {
      name: "Fritz Rjhay Dela Cruz",
      title: "Lead System Architect",
      role: "AI & Model Training",
      img: "/rj.png",
      desc: "Created and trained the custom YOLOv11 AI model. Programmed the camera system to spot fights, weapons, theft, and vandalism instantly right on the pole.",
    },
    {
      name: "Angel Venice Torres",
      title: "Project Manager",
      role: "Leader",
      img: "/angel.jpg",
      desc: "Managed the overall schedule for the thesis, kept track of all deadlines, and helped out with every single part of the project whenever the team needed support.",
    },
    {
      name: "Florenz Elarde",
      title: "Hardware Maker",
      role: "Hardware Design & Wiring",
      img: "/florenz.jpg",
      desc: "Built the physical smartpole structure and wired the electrical system. Set up the solar panels, solar charger, battery bank, warning siren, and the panic button.",
    },
    {
      name: "Reiss Mea Peres",
      title: "Documentation & Assembly",
      role: "Technical Writing & Hardware Support",
      img: "/reiss.jpg",
      desc: "Wrote the technical thesis documents, project reports, and paperwork while helping assemble the physical hardware parts of the pole.",
    }
  ];

  return (
    <section style={{ padding: '140px 0', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 10 }} id="team">
      <div style={s.secInner}>
        <div className="reveal" style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontWeight: 700 }}>
            <span style={{ display: 'block', width: 24, height: 2, background: 'var(--green)' }}/>
            Project Developers
          </div>
          <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(44px, 5.5vw, 76px)', lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-1.5px', color: '#fff' }}>
            The Team Behind The Project.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {developers.map((dev, idx) => (
            <div key={idx} className="reveal" style={{ padding: '40px 32px', background: 'var(--surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
              
              {/* Profile Image Box Container */}
              <div style={{ width: '100%', height: '240px', background: '#020502', border: '1px solid var(--border)', marginBottom: '24px', overflow: 'hidden' }}>
                <img 
                  src={dev.img} 
                  alt={dev.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--green)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
                // {dev.role}
              </div>
              
              {/* Real Name Section */}
              <h3 style={{ fontFamily: 'var(--fh)', fontWeight: 800, fontSize: 26, textTransform: 'uppercase', color: '#fff', marginBottom: 2 }}>
                {dev.name}
              </h3>
              
              {/* Project Title Tag Section */}
              <div style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--muted)', marginBottom: 16, fontWeight: 600 }}>
                {dev.title}
              </div>

              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', fontWeight: 400 }}>
                {dev.desc}
              </p>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--border-glow), transparent)' }}/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ✉️ CONTACT US AREA
   ───────────────────────────────────────────────────────────────────────────── */
export function ContactUs() {
  return (
    <section style={{ padding: '140px 0', borderTop: '1px solid var(--border)', position: 'relative', zIndex: 10 }} id="contact">
      <div style={s.secInner}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 64, alignItems: 'start' }}>
          
          <div className="reveal">
            <div style={{ fontFamily: 'var(--fm)', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontWeight: 700 }}>
              <span style={{ display: 'block', width: 24, height: 2, background: 'var(--green)' }}/>
              System Communications
            </div>
            <h2 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(44px, 5.5vw, 76px)', lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-1.5px', color: '#fff', marginBottom: 24 }}>
              Get In Touch.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--muted)', maxWidth: 480 }}>
              Have questions about the 24/7 solar hardware setup, camera crime tracking systems, or emergency help button integration? Send us a message directly.
            </p>
          </div>

          <div className="reveal d1" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '48px' }}>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  placeholder="name@domain.com"
                  style={{ background: '#020502', border: '1px solid var(--border)', padding: '14px 18px', color: '#fff', fontFamily: 'var(--fb)', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--green)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Message Content
                </label>
                <textarea 
                  rows={4}
                  placeholder="Type your message about our smartpole hardware here..."
                  style={{ background: '#020502', border: '1px solid var(--border)', padding: '14px 18px', color: '#fff', fontFamily: 'var(--fb)', fontSize: 14, resize: 'none', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--green)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>

              <button type="submit" style={{ ...s.btnPrimary, width: '100%', textAlign: 'center', marginTop: 8 }}>
                Transmit Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}