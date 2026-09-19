import { WaveConfig, WaveRipple, FoamParticle } from '../types';

/**
 * Calculates the wave surface elevation (Y coordinate) and tangent angle (slope)
 * at coordinate X and time t using superposed harmonic ocean waves (Gerstner-like model).
 */
export function getWaveElevation(
  x: number,
  time: number,
  width: number,
  height: number,
  config: WaveConfig,
  layerOffset: number = 0,
  ripples: WaveRipple[] = []
): { y: number; slope: number; horizontalShift: number } {
  const baseWaterY = height * config.waterLevel;
  
  // Primary harmonic wave (long smooth rolling swell like the reference image)
  const k1 = (Math.PI * 2 * config.frequency) / width;
  const omega1 = config.speed * 1.6;
  const amp1 = config.amplitude * (1 + layerOffset * 0.2);
  
  // Secondary harmonic (adds oceanic character and rolling crests)
  const k2 = k1 * 2.1;
  const omega2 = omega1 * 1.45 + 0.5;
  const amp2 = amp1 * (0.28 * config.turbulence);

  // Tertiary ripple for ocean surface texture
  const k3 = k1 * 4.2;
  const omega3 = omega1 * 2.3 + 1.2;
  const amp3 = amp1 * (0.12 * config.turbulence);

  // Characteristic phase offset based on image reference:
  // In the image, right side rises higher, left side dips lower.
  // We can add a gentle overarching tilt or long sine swell:
  const macroSwell = Math.sin((x / width) * Math.PI * 0.9 + time * 0.3 + layerOffset * 1.5) * (amp1 * 0.55);

  const phi1 = time * omega1 + layerOffset * 2.2;
  const phi2 = -time * omega2 + layerOffset * 1.7;
  const phi3 = time * omega3 + layerOffset * 0.8;

  // Wave elevation
  let waveY =
    baseWaterY +
    macroSwell +
    Math.sin(k1 * x - phi1) * amp1 +
    Math.sin(k2 * x + phi2) * amp2 +
    Math.cos(k3 * x - phi3) * amp3;

  // Gerstner horizontal particle shift (creates trochoidal crests and pushes letters)
  let horizontalShift =
    -Math.cos(k1 * x - phi1) * amp1 * config.steepness * 0.6 -
    Math.sin(k2 * x + phi2) * amp2 * config.steepness * 0.4;

  // Derivative dy/dx for physical tangent/tilt angle
  let dYdX =
    (macroSwell ? ((Math.PI * 0.9) / width) * Math.cos((x / width) * Math.PI * 0.9 + time * 0.3 + layerOffset * 1.5) * (amp1 * 0.55) : 0) +
    k1 * Math.cos(k1 * x - phi1) * amp1 +
    k2 * Math.cos(k2 * x + phi2) * amp2 -
    k3 * Math.sin(k3 * x - phi3) * amp3;

  // Add interactive ripples created by user clicks/swells
  for (const ripple of ripples) {
    const dist = Math.abs(x - ripple.x);
    if (dist < ripple.radius) {
      const normDist = dist / ripple.radius;
      const rippleWave = Math.cos(normDist * Math.PI * 3.5) * (1 - normDist) * ripple.intensity;
      waveY += rippleWave;
      dYdX += -Math.sin(normDist * Math.PI * 3.5) * (1 - normDist) * (ripple.intensity / 20);
      horizontalShift += (x > ripple.x ? 1 : -1) * (1 - normDist) * (ripple.intensity * 0.4);
    }
  }

  const slopeAngle = Math.atan(dYdX);

  return {
    y: waveY,
    slope: slopeAngle,
    horizontalShift,
  };
}

/**
 * Creates foam splashes at a given location with realistic velocities.
 */
export function spawnFoamParticles(
  x: number,
  y: number,
  count: number,
  baseVx: number = 0,
  baseVy: number = -2
): FoamParticle[] {
  const particles: FoamParticle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() - 0.5) * Math.PI * 0.8 - Math.PI / 2;
    const speed = Math.random() * 3 + 1;
    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed + baseVx,
      vy: Math.sin(angle) * speed + baseVy,
      size: Math.random() * 3.5 + 1.5,
      alpha: Math.random() * 0.6 + 0.4,
      life: 0,
      maxLife: Math.floor(Math.random() * 35 + 25),
    });
  }
  return particles;
}
