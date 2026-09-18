import React, { useEffect, useRef } from 'react';
import { romanticAudio } from '../utils/romanticAudio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  growth: number;
  type: 'heart' | 'sparkle';
}

const HEART_COLORS = [
  '#ff1493', // Deep Pink
  '#ff2a6d', // Electric Rose
  '#f43f5e', // Rose 500
  '#e11d48', // Rose 600
  '#fb7185', // Soft Blush
  '#ec4899', // Pink 500
  '#db2777', // Pink 600
  '#fda4af', // Light Rose
  '#ffd166', // Golden Glow Sparkle
  '#fff0f5', // Gentle Pearl Pink
];

export const HeartExplosionEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Heart Path2D based on standard 24x24 heart SVG
    const heartPath = new Path2D(
      'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
    );

    // Responsive Canvas Resize for crisp Retina displays
    const updateCanvasDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);

    // Main Particle Physics & Render Loop
    const renderLoop = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply physics
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96; // Air resistance
        p.vy = p.vy * 0.96 + 0.11; // Gravity & terminal buoyancy
        p.rotation += p.rotationSpeed;

        // Size expansion then smooth shrinkage
        if (p.growth > 0) {
          p.scale = Math.min(1.2, p.scale + 0.16);
          p.growth -= 0.16;
        } else {
          p.scale = Math.max(0.2, p.scale - 0.015);
        }

        p.alpha -= p.decay;

        if (p.alpha <= 0.01) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'heart') {
          const currentSize = p.baseSize * p.scale;
          const scaleFactor = currentSize / 24;
          ctx.scale(scaleFactor, scaleFactor);
          ctx.translate(-12, -12); // Center heart path
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fill(heartPath);
        } else {
          // 4-point golden/white sparkle star
          const radius = p.baseSize * 0.45 * p.scale;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          for (let s = 0; s < 4; s++) {
            const angle = (s * Math.PI) / 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            ctx.lineTo(cos * radius, sin * radius);
            const midAngle = angle + Math.PI / 4;
            ctx.lineTo(Math.cos(midAngle) * (radius * 0.3), Math.sin(midAngle) * (radius * 0.3));
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (particles.length > 0) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
      } else {
        animFrameIdRef.current = null;
      }
    };

    // Spawn heart explosion at coordinate (x, y)
    const triggerHeartExplosion = (x: number, y: number, count = 22) => {
      // Play delicate harmonic harp ping
      romanticAudio.playHeartSpark();

      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const isHeart = Math.random() < 0.72;
        const angle = Math.random() * Math.PI * 2;
        // Radial burst velocity with slight upward pop bias
        const speed = 2.5 + Math.random() * 7.5;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - (1.2 + Math.random() * 2.2);

        const baseSize = isHeart ? 14 + Math.random() * 18 : 10 + Math.random() * 12;
        const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];

        newParticles.push({
          x,
          y,
          vx,
          vy,
          baseSize,
          size: baseSize,
          color,
          alpha: 1,
          decay: 0.014 + Math.random() * 0.018, // Lifespan ~50-70 frames
          rotation: (Math.random() - 0.5) * 1.5,
          rotationSpeed: (Math.random() - 0.5) * 0.16,
          scale: 0.3,
          growth: 1.0,
          type: isHeart ? 'heart' : 'sparkle',
        });
      }

      particlesRef.current.push(...newParticles);

      // Start loop if not already running
      if (!animFrameIdRef.current) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
      }
    };

    // Global listener for clicking anywhere on page background / interactive canvas
    const handlePointerDown = (e: PointerEvent) => {
      // If clicking inside a text input, textarea, or select, don't interrupt standard typing
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
          return;
        }
      }

      triggerHeartExplosion(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    />
  );
};
