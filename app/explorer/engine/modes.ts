import type { WorldState } from './world';

/* What each part of the explorer shows: a camera shot (where the camera sits
 * and what it looks at) and the state of the world. The explorer eases into
 * these; the visitor can still drag to look around from there. */

export type ModeKey = 'explore' | 'power' | 'light' | 'sight' | 'response' | 'anatomy' | 'results' | 'team' | 'contact';

export type Shot = { cam: [number, number, number]; look: [number, number, number] };

const night: WorldState = {
  day: 0.1, sun: 0, lamp: 1.2, energy: 0, scan: 0.25, verify: 0, network: 0, explode: 0, turn: 0, city: 0, open: 0,
};

export const MODES: Record<ModeKey, { label: string; short: string; shot: Shot; state: WorldState }> = {
  explore:  { label: 'Explore the pole', short: 'Explore', shot: { cam: [6.8, 4.2, 12.5], look: [0, 3.5, 0.9] }, state: { ...night } },
  power:    { label: 'Power', short: 'Power', shot: { cam: [4.4, 7.6, 7.4], look: [0, 6.0, 0.9] }, state: { ...night, day: 1, sun: 0.35, lamp: 0, energy: 1, scan: 0 } },
  light:    { label: 'Light', short: 'Light', shot: { cam: [-7.8, 2.0, 11.8], look: [0, 3.0, 1.6] }, state: { ...night, lamp: 0.55, scan: 0 } },
  sight:    { label: 'Sight', short: 'Sight', shot: { cam: [-3.5, 6.2, -3.2], look: [0.5, 0.6, 9.4] }, state: { ...night, lamp: 1.1, scan: 1, verify: 1 } },
  response: { label: 'Response', short: 'Response', shot: { cam: [10, 34, 52], look: [0, 3, 4] }, state: { ...night, lamp: 0.9, scan: 0.4, network: 1 } },
  anatomy:  { label: 'Anatomy', short: 'Anatomy', shot: { cam: [6.0, 5.6, 11.0], look: [0, 4.3, 0.9] }, state: { ...night, lamp: 0.9, explode: 1, scan: 0 } },
  results:  { label: 'Results', short: 'Results', shot: { cam: [-6.8, 1.6, 8.0], look: [0, 4.4, 0.9] }, state: { ...night, day: 0.42, sun: 0.92, lamp: 0.8, scan: 0 } },
  team:     { label: 'The team', short: 'Team', shot: { cam: [44, 58, 92], look: [0, 0, 6] }, state: { ...night, city: 1, scan: 0 } },
  contact:  { label: 'Contact', short: 'Contact', shot: { cam: [26, 30, 52], look: [0, 2, 4] }, state: { ...night, city: 1, scan: 0 } },
};

export const DOCK: ModeKey[] = ['explore', 'power', 'light', 'sight', 'response', 'anatomy', 'results', 'team', 'contact'];

// Where the camera sits relative to a part when it's selected (world axes).
// Front parts are seen from the street side, the two boxes from behind.
export const PART_VIEW: Record<string, [number, number, number]> = {
  solar: [2.6, 1.3, 3.2],
  lamp: [3.2, 0.6, 3.4],
  pir: [1.2, -0.5, 2.8],
  camera: [1.8, 0.5, 2.6],
  siren: [-1.8, 0.9, -2.6],
  controller: [-2.0, 0.4, -2.8],
  battery: [2.0, 0.2, -3.0],
  panic: [1.4, 0.4, 2.4],
};

export const PART_FACTS: Record<string, string[]> = {
  solar: ['Single-axis tracking', 'Servo-driven', '2 LDRs + shade divider'],
  lamp: ['Adaptive LED', 'Dim until motion', 'Energy-efficient'],
  pir: ['Passive infrared', 'Wakes the lamp', 'Under the lamp head'],
  camera: ['CCTV stream (RTSP)', 'Custom-trained YOLO11 + X3D', 'Vision-language double-check'],
  siren: ['Alarm + strobe', 'Panic press or confirmed alert', 'Silenced from the dashboard'],
  controller: ['ESP32 microcontroller', 'Solar charge controller', 'Buck converters 12 V → 5 V → 3.3 V', 'Reports pole status'],
  battery: ['LiFePO4', '12 V · 50 Ah', 'Runs the night'],
  panic: ['One press, one incident', 'Camera snapshot attached', 'Can sound the siren'],
};
