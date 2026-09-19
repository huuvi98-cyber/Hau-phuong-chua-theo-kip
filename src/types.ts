export interface WaveTheme {
  id: string;
  name: string;
  skyColorTop: string;
  skyColorBottom: string;
  waveHighlight: string;
  waveLayer1: string; // Mid/back wave
  waveLayer2: string; // Main deep ocean
  waveLayer3: string; // Foreground shadow / deep abyss
  foamColor: string;
  textColor: string;
  accentColor: string;
}

export type WaveInteractionMode = 'floating-buoy' | 'wave-curve' | 'deep-current';

export interface WaveConfig {
  amplitude: number;     // Wave height (pixels / normalized)
  speed: number;         // Animation speed multiplier
  frequency: number;     // Wave density / length
  surgePower: number;    // "Lực xô": how strongly waves push letters horizontally
  waterLevel: number;    // Vertical offset percentage of wave surface (0.3 - 0.7)
  foamIntensity: number; // Foam & bubble particles quantity
  turbulence: number;    // Chaos / multi-frequency superposition
  steepness: number;     // Trochoidal / Gerstner sharpness
}

export interface FloatingLetter {
  char: string;
  lineIndex: number;
  charIndex: number;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  targetAngle: number;
  scale: number;
  width: number;
  height: number;
  submerged: number; // 0 to 1
}

export interface WaveRipple {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  intensity: number;
  decay: number;
  life: number;
}

export interface FoamParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color?: string;
}
