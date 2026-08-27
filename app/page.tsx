'use client';

import React, { useState, useEffect } from "react";
import { s, ASSETS, useReveal, useCounter } from "./styles";
import { GlobalStyle, CustomCursor, Navbar, Manifesto, Footer } from "./components/layout-frame";
import {
  Hero,
  Ticker,
  Metrics,
  StreamShowcase,
  ModelPerformance,
  SecurityCapabilitiesGrid,
  Pillars,
  BlueprintSpecs,
  DeveloperProfiles, // Added missing import
  ContactUs          // Added missing import
} from "./components/showcase-blocks";
import { InferenceSandbox } from "./components/playground-sandbox";

export default function EcoVisionLanding() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScrollEngine = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScrollEngine, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollEngine);
  }, []);

  const TICKER_ITEMS = [
    'YOLOv11 Edge Vision', 'Smart Solar Power', 'Sun Tracker System',
    'Fast Local AI Detection', 'Real-Time Video Processing', 'Private Neighborhood Analytics',
    'High-Yield Solar Panels', 'Automated Security Siren', 'Grid Independent Battery'
  ];

  const PILLARS_DATA = [
    {
      num: '01', label: 'Local AI Camera System',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 26, height: 26 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
      ),
      body: 'A YOLOv11 detector and an X3D-XS action classifier work together on the pole itself, catching both objects (weapons) and behavior (violence, robbery, vandalism) — validated at 95% accuracy on footage the models never trained on. Raw video is cleared immediately after judging it.',
      tags: ['YOLOv11 + X3D-XS AI', '95% Validated Accuracy', 'Local Compute', 'Privacy Protection']
    },
    {
      num: '02', label: '24/7 Solar Power Bank',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 26, height: 26 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      ),
      body: 'High-efficiency solar panels work alongside smart battery chargers. Energy reserves fill long-lasting internal batteries to guarantee non-stop operations through storms or dark nights.',
      tags: ['Solar Modules', 'Smart Charger', 'Long-Life Battery', 'Grid Independent']
    },
    {
      num: '03', label: 'Single-Axis Sun Tracking',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 26, height: 26 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.343l.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      ),
      body: 'Built-in electronic gears tilt the panels automatically to trace the sun path across seasons. Removing complex mechanics saves daily operating power while boosting battery charge speeds.',
      tags: ['Panel Motor', 'Sun Path Tracking', 'Efficiency Boost', 'Durable Build']
    }
  ];

  const BLUEPRINTS_DATA = [
    {
      eyebrow: 'On-Pole Video Processing Setup', title: 'Smart AI Tracking\nRun Fully On-Site.',
      body: 'EcoVision keeps computing close to home. Instead of risking private data drops across external internet networks, our on-pole models process structural safety and alert feeds locally.',
      bullets: ['High-accuracy image tracking loops minimize false alarms.', 'Custom programming runs perfectly on small embedded chips.', 'No private records ever leave the pole—only simple alerts are sent out.'],
      img: ASSETS.TECH_IMG_CAMERA, badge: 'AI Camera Component', reverse: false
    },
    {
      eyebrow: 'Off-Grid Electrical Infrastructure', title: 'Independent Power Setup.\nZero City Cord Connections.',
      body: 'Our system places heavy solar harvesting setups directly onto the frame of each pole. This design gives communities an independent network element capable of working during city blackouts.',
      bullets: ['Smart hardware fuses protect electrical circuits from heat surges.', 'Waterproof structural enclosures shield parts from harsh weather.', 'Modular slots make swapping out old batteries quick and simple.'],
      img: ASSETS.TECH_IMG_POWER, badge: 'Power Unit Blueprint', reverse: true
    },
    {
      eyebrow: 'Motorized Solar Trajectory Rails', title: 'Maximize Energy Harvest\nUsing Simple Tilting Rails.',
      body: 'Following the daily path of the sun on a calibrated tilting track. Corrective steps make sure the solar faces get direct sunlight during peak hours without the structural wear of dual-axis systems.',
      bullets: ['Sensor triggers schedule subtle movement adjustments.', 'Low-draw standby states prevent battery drain loops.', 'Heavy structural locking locks panels tight during high winds.'],
      img: ASSETS.TECH_IMG_SOLAR, badge: 'Mechanical Tracker Unit', reverse: false
    }
  ];

  const [metricLatency, refLatency] = useCounter(28);
  const [metricObjects, refObjects] = useCounter(210);
  const [metricPower, refPower] = useCounter(15);
  const [metricRange, refRange] = useCounter(180);

  // Held-out evaluation results — passed as x10 so the count-up animation
  // can land on one decimal place (e.g. 974 -> "97.4"). See ModelPerformance.
  const [metricAccuracy, refAccuracy] = useCounter(950);
  const [metricRecall, refRecall] = useCounter(974);
  const [metricFpr, refFpr] = useCounter(74);
  const [metricClips, refClips] = useCounter(758);

  useReveal();

  return (
    <div style={s.wrap}>
      <GlobalStyle/>
      <CustomCursor/>
      <div className="noise-overlay"/>

      <Navbar scrolled={scrolled} />
      <Hero />
      <Ticker items={TICKER_ITEMS} />
      
      <Metrics 
        latencyRef={refLatency} objectsRef={refObjects} powerRef={refPower} rangeRef={refRange}
        metricLatency={metricLatency} metricObjects={metricObjects} metricPower={metricPower} metricRange={metricRange}
      />
      
      <StreamShowcase />
      <ModelPerformance
        accuracyRef={refAccuracy} recallRef={refRecall} fprRef={refFpr} clipsRef={refClips}
        metricAccuracy={metricAccuracy} metricRecall={metricRecall} metricFpr={metricFpr} metricClips={metricClips}
      />
      <SecurityCapabilitiesGrid />
      <Pillars segments={PILLARS_DATA} />
      <BlueprintSpecs configurations={BLUEPRINTS_DATA} />
      <InferenceSandbox />
      <Manifesto />
      
      {/* Mounted profiles and contact boxes right before the footer layer */}
      <DeveloperProfiles />
      <ContactUs />
      
      <Footer />
    </div>
  );
}