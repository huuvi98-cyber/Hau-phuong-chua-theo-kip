import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WaveTheme, WaveConfig, WaveInteractionMode, WaveRipple, FoamParticle, FloatingLetter } from '../types';
import { getWaveElevation, spawnFoamParticles } from '../utils/waveMath';
import { oceanSound } from '../utils/audio';

interface WaveCanvasProps {
  theme: WaveTheme;
  config: WaveConfig;
  mode: WaveInteractionMode;
  line1: string;
  line2: string;
  fontSize: number;
  letterSpacing: number;
  showDecorations: boolean;
  onCanvasReady?: (exportFn: () => void) => void;
}

export const WaveCanvas: React.FC<WaveCanvasProps> = ({
  theme,
  config,
  mode,
  line1,
  line2,
  fontSize,
  letterSpacing,
  showDecorations,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Animation state refs
  const timeRef = useRef<number>(0);
  const animFrameId = useRef<number | null>(null);
  const lettersRef = useRef<FloatingLetter[]>([]);
  const ripplesRef = useRef<WaveRipple[]>([]);
  const particlesRef = useRef<FoamParticle[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const mousePosRef = useRef<{ x: number; y: number; isDown: boolean }>({ x: -100, y: -100, isDown: false });

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 1200, height: 600 });

  // Initialize and measure container dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({ width: clientWidth, height: clientHeight });
        }
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    return () => ro.disconnect();
  }, []);

  // Compute text layout and floating letter positions
  const recalculateLetters = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    const lines = [line1.trim(), line2.trim()].filter(Boolean);

    // Responsive font scaling so text fits on narrow mobile displays
    let effectiveFontSize = fontSize;
    const maxAllowedWidth = width * (width < 640 ? 0.92 : 0.75);

    ctx.font = `900 ${effectiveFontSize}px "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif`;

    // Measure max line width
    let maxLineWidth = 0;
    lines.forEach((lineText) => {
      const chars = Array.from(lineText);
      let lw = 0;
      chars.forEach((c) => {
        lw += ctx.measureText(c).width + letterSpacing;
      });
      lw -= letterSpacing;
      if (lw > maxLineWidth) maxLineWidth = lw;
    });

    // Scale down font if too large for container
    if (maxLineWidth > maxAllowedWidth && maxLineWidth > 0) {
      const scale = maxAllowedWidth / maxLineWidth;
      effectiveFontSize = Math.max(22, Math.floor(fontSize * scale));
      ctx.font = `900 ${effectiveFontSize}px "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif`;
    }

    const newLetters: FloatingLetter[] = [];
    const lineSpacing = effectiveFontSize * 1.25;
    
    // Position text in ocean body (around 62% - 75% height, adjustable based on waterLevel)
    const textCenterY = height * Math.min(0.86, Math.max(0.48, config.waterLevel + 0.18));
    const totalBlockHeight = lines.length * lineSpacing;
    const startY = textCenterY - totalBlockHeight * 0.35;

    lines.forEach((lineText, lineIdx) => {
      const chars = Array.from(lineText);
      let totalLineWidth = 0;
      const charWidths = chars.map((char) => {
        const w = ctx.measureText(char).width;
        totalLineWidth += w + letterSpacing;
        return w;
      });
      totalLineWidth -= letterSpacing;

      // Align: slightly right-centered on desktop as in the reference image, or centered on mobile
      const startX = width > 768 
        ? Math.max(width * 0.25, width * 0.68 - totalLineWidth * 0.5)
        : (width - totalLineWidth) * 0.5;

      let currentX = startX;
      chars.forEach((char, charIdx) => {
        const w = charWidths[charIdx];
        const baseX = currentX + w / 2;
        const baseY = startY + lineIdx * lineSpacing;

        const existing = lettersRef.current.find(
          (l) => l.lineIndex === lineIdx && l.charIndex === charIdx && l.char === char
        );

        newLetters.push({
          char,
          lineIndex: lineIdx,
          charIndex: charIdx,
          baseX,
          baseY,
          x: existing ? existing.x : baseX,
          y: existing ? existing.y : baseY,
          vx: existing ? existing.vx : 0,
          vy: existing ? existing.vy : 0,
          angle: existing ? existing.angle : 0,
          vAngle: existing ? existing.vAngle : 0,
          targetAngle: 0,
          scale: 1,
          width: w,
          height: effectiveFontSize,
          submerged: 0.8,
        });

        currentX += w + letterSpacing;
      });
    });

    lettersRef.current = newLetters;
  }, [dimensions, line1, line2, fontSize, letterSpacing, config.waterLevel]);

  useEffect(() => {
    recalculateLetters();
  }, [recalculateLetters]);

  // Spawn dynamic wave surge when triggered
  const triggerSurge = useCallback((originX?: number, originY?: number, strengthMultiplier = 1) => {
    const { width, height } = dimensions;
    const x = originX ?? width * 0.1;
    const y = originY ?? height * config.waterLevel;

    ripplesRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      radius: 20,
      maxRadius: width * 0.9,
      intensity: 70 * strengthMultiplier,
      decay: 0.982,
      life: 1,
    });

    // Spawn splashes
    const foam = spawnFoamParticles(x, y, 40, 3, -4);
    particlesRef.current.push(...foam);

    // Give letters a physical impulse
    lettersRef.current.forEach((letter) => {
      const dx = letter.baseX - x;
      if (dx > -50 && dx < width * 0.7) {
        const factor = Math.max(0, 1 - Math.abs(dx) / (width * 0.6));
        letter.vx += (factor * 12 + 2) * strengthMultiplier;
        letter.vy -= (factor * 8 + 3) * strengthMultiplier;
        letter.vAngle += (Math.random() * 0.15 - 0.05) * strengthMultiplier;
      }
    });

    oceanSound.triggerSplash();
  }, [dimensions, config.waterLevel]);

  // Export high resolution PNG image
  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create high-res download
    const link = document.createElement('a');
    link.download = `do-hoa-song-bien-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  }, []);

  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady(handleExport);
    }
  }, [onCanvasReady, handleExport]);

  // Pointer event handlers for creating interactive ripples and waves
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePosRef.current = { x, y, isDown: true };

    triggerSurge(x, y, 1.2);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mousePosRef.current.isDown) {
      // Dragging wave
      ripplesRef.current.push({
        id: Date.now() + Math.random(),
        x,
        y,
        radius: 10,
        maxRadius: dimensions.width * 0.35,
        intensity: 24,
        decay: 0.96,
        life: 1,
      });

      // Small foam wake
      if (Math.random() > 0.4) {
        particlesRef.current.push(...spawnFoamParticles(x, y, 3, 0.5, -1));
      }
    }
    mousePosRef.current = { x, y, isDown: mousePosRef.current.isDown };
  };

  const handlePointerUp = () => {
    mousePosRef.current.isDown = false;
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    let running = true;

    const render = (now: number) => {
      if (!running) return;

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;
      timeRef.current += dt * config.speed;
      const t = timeRef.current;

      const { width, height } = dimensions;

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Draw Sky / Background Gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.7);
      skyGradient.addColorStop(0, theme.skyColorTop);
      skyGradient.addColorStop(1, theme.skyColorBottom);
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric foam / sea spray mist in the upper air
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 5; i++) {
        const mistX = (Math.sin(t * 0.2 + i * 1.7) * 0.5 + 0.5) * width;
        const mistY = 40 + i * 25 + Math.cos(t * 0.4 + i) * 15;
        const mistRad = 60 + i * 20;
        const radGrad = ctx.createRadialGradient(mistX, mistY, 0, mistX, mistY, mistRad);
        radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(mistX, mistY, mistRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Decorative Wave Motif in top-right (matching the reference image!)
      if (showDecorations) {
        ctx.save();
        const motifX = width > 768 ? width - 85 : width - 60;
        const motifY = 55;
        const motifWidth = 44;
        ctx.strokeStyle = theme.accentColor;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let row = 0; row < 3; row++) {
          const rowY = motifY + row * 9;
          ctx.beginPath();
          for (let step = 0; step <= motifWidth; step += 4) {
            const waveDelta = Math.sin((step / motifWidth) * Math.PI * 3 + t * 2 + row * 0.5) * 2.8;
            if (step === 0) {
              ctx.moveTo(motifX + step, rowY + waveDelta);
            } else {
              ctx.lineTo(motifX + step, rowY + waveDelta);
            }
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // Update ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += 90 * dt;
        r.intensity *= r.decay;
        r.life = r.intensity / 70;
        if (r.radius > r.maxRadius || r.intensity < 0.5) {
          ripplesRef.current.splice(i, 1);
        }
      }

      // 3. Draw Background Wave Layer (Deep/Back wave)
      const stepX = 6;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += stepX) {
        const { y } = getWaveElevation(x, t, width, height, config, -0.4, ripplesRef.current);
        ctx.lineTo(x, y - 25);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = theme.waveLayer1;
      ctx.fill();

      // 4. Draw Intermediate Wave Layer (Mid-swell with gradient)
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += stepX) {
        const { y } = getWaveElevation(x, t, width, height, config, 0.2, ripplesRef.current);
        ctx.lineTo(x, y - 8);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      const midWaveGrad = ctx.createLinearGradient(0, height * 0.3, 0, height);
      midWaveGrad.addColorStop(0, theme.waveLayer2);
      midWaveGrad.addColorStop(1, theme.waveLayer3);
      ctx.fillStyle = midWaveGrad;
      ctx.fill();

      // 5. Draw Primary Wave Layer (Crest wave matching the reference curve)
      const primaryPoints: { x: number; y: number; slope: number; shift: number }[] = [];
      for (let x = 0; x <= width + stepX; x += stepX) {
        const { y, slope, horizontalShift } = getWaveElevation(x, t, width, height, config, 0, ripplesRef.current);
        primaryPoints.push({ x: x + horizontalShift * 0.3, y, slope, shift: horizontalShift });
      }

      // Fill main ocean body below the primary wave
      ctx.beginPath();
      ctx.moveTo(0, height);
      primaryPoints.forEach((p, idx) => {
        if (idx === 0) ctx.lineTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.lineTo(width, height);
      ctx.closePath();

      const oceanGrad = ctx.createLinearGradient(0, height * config.waterLevel - 40, 0, height);
      oceanGrad.addColorStop(0, theme.waveLayer2);
      oceanGrad.addColorStop(0.3, theme.waveLayer3);
      oceanGrad.addColorStop(1, theme.waveLayer3);
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // 6. Draw White Foam Highlight along the primary wave crest line (like reference image)
      ctx.beginPath();
      primaryPoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = theme.waveHighlight;
      ctx.stroke();

      // Subtle translucent froth ribbon right below the crest
      ctx.beginPath();
      primaryPoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y + 3);
        else ctx.lineTo(p.x, p.y + 3);
      });
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();

      // 7. Render "Chữ Xô Theo Sóng" (Dynamic Text swaying, surging, undulating with waves)
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      lettersRef.current.forEach((letter) => {
        ctx.font = `900 ${letter.height}px "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif`;
        // Sample wave condition at the letter's current X position
        const wave = getWaveElevation(letter.x, t, width, height, config, 0, ripplesRef.current);
        
        let targetX = letter.baseX;
        let targetY = letter.baseY;
        let targetSlope = wave.slope;

        if (mode === 'floating-buoy') {
          // Floating physics:
          // The letter rests in the water, but is pushed by wave displacement
          // Vertical bobbing: follows the surface elevation fluctuation with slight phase delay
          const waveHeightOffset = (wave.y - height * config.waterLevel);
          targetY = letter.baseY + waveHeightOffset * 0.85;

          // Horizontal wave surge ("Lực xô theo sóng"):
          // In ocean waves, water surges forward at the crest and pulls back at the trough
          const surgeShift = wave.horizontalShift * config.surgePower * 1.5;
          targetX = letter.baseX + surgeShift;

          // Slope tilt: letter tilts with the wave surface angle plus inertia
          targetSlope = wave.slope * 1.4;

          // Damped spring physics towards target position
          const kSpring = 14.0;
          const damping = 0.82;

          const ax = (targetX - letter.x) * kSpring;
          const ay = (targetY - letter.y) * kSpring;

          letter.vx = (letter.vx + ax * dt) * damping;
          letter.vy = (letter.vy + ay * dt) * damping;

          letter.x += letter.vx * dt;
          letter.y += letter.vy * dt;

          // Angular roll physics ("xô nghiêng")
          const torque = (targetSlope - letter.angle) * 18.0 - (letter.vx * 0.008);
          letter.vAngle = (letter.vAngle + torque * dt) * 0.84;
          letter.angle += letter.vAngle * dt;

        } else if (mode === 'wave-curve') {
          // Ride the wave contour directly
          const offsetBelowCrest = (letter.lineIndex === 0 ? 55 : 125) * (fontSize / 64);
          targetY = wave.y + offsetBelowCrest;
          targetX = letter.baseX + wave.horizontalShift * 0.8;
          letter.x = targetX;
          letter.y = targetY;
          letter.angle = wave.slope * 1.1;
        } else {
          // Deep current sway (submerged, gently undulating like underwater kelp)
          const deepFactor = Math.sin(t * 1.5 + letter.charIndex * 0.4) * 8;
          targetY = letter.baseY + deepFactor;
          targetX = letter.baseX + Math.cos(t * 1.2 + letter.charIndex * 0.3) * 6;
          letter.x = targetX;
          letter.y = targetY;
          letter.angle = Math.sin(t * 1.5 + letter.charIndex * 0.3) * 0.12;
        }

        // Check if wave crashes over letter to spawn foam bubbles
        if (Math.abs(letter.y - wave.y) < 25 && Math.random() < 0.1 * config.foamIntensity) {
          particlesRef.current.push(...spawnFoamParticles(letter.x, wave.y, 2, letter.vx * 0.1, -1.5));
        }

        // Draw Letter with Transform
        ctx.save();
        ctx.translate(letter.x, letter.y);
        ctx.rotate(letter.angle);

        // Soft oceanic shadow under text for crisp legibility
        ctx.shadowColor = 'rgba(0, 30, 45, 0.28)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        // Render crisp bold glyph
        ctx.fillStyle = theme.textColor;
        ctx.fillText(letter.char, 0, 0);

        // Subtle specular highlight on top half of letter
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillText(letter.char, 0, -1);

        ctx.restore();
      });
      ctx.restore();

      // 8. Update and Draw Foam Particles & Splash Drops
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gentle gravity
        p.life++;
        const lifeProgress = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - lifeProgress);

        if (lifeProgress >= 1 || p.y > height) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - lifeProgress * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }

      // 9. Foreground Subtle Water Caustics / Glints
      ctx.save();
      const glintCount = Math.floor(width / 180);
      for (let g = 0; g < glintCount; g++) {
        const gx = ((g * 193 + t * 40) % (width + 60)) - 30;
        const { y: gy } = getWaveElevation(gx, t, width, height, config, 0.1);
        const glintY = gy + 40 + (g % 3) * 35;
        if (glintY < height - 10) {
          const glintAlpha = (Math.sin(t * 3 + g * 2) * 0.5 + 0.5) * 0.22;
          ctx.strokeStyle = `rgba(255, 255, 255, ${glintAlpha.toFixed(2)})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.ellipse(gx, glintY, 18, 2.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();

      ctx.restore();

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [dimensions, theme, config, mode, fontSize, showDecorations]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-white select-none"
      id="ocean-wave-container"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full block cursor-pointer touch-none"
        id="ocean-wave-canvas"
      />
    </div>
  );
};
