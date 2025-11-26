'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  alpha: number;
  vx: number;
  vy: number;
}

interface StarfieldProps {
  starCount?: number;
  className?: string;
}

const randomStar = (width: number, height: number): Star => {
  const angle = Math.random() * Math.PI * 2;
  const baseSpeed = Math.random() * 0.4 + 0.25;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random() * 0.5 + 0.5,
    size: Math.random() * 1.8 + 0.5,
    speed: baseSpeed,
    alpha: Math.random() * 0.65 + 0.3,
    vx: Math.cos(angle) * baseSpeed,
    vy: Math.sin(angle) * baseSpeed,
  };
};

export function Starfield({ starCount = 200, className = '' }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('role', 'presentation');
    canvas.tabIndex = -1;
    canvas.style.pointerEvents = 'none';

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      starsRef.current = Array.from({ length: starCount }, () =>
        randomStar(innerWidth, innerHeight)
      );
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.2,
        0,
        canvas.width * 0.6,
        canvas.height * 0.8,
        Math.max(canvas.width, canvas.height)
      );
      gradient.addColorStop(0, 'rgba(99,102,241,0.18)');
      gradient.addColorStop(0.4, 'rgba(56,189,248,0.12)');
      gradient.addColorStop(1, 'rgba(15,23,42,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'lighter';

      for (const star of starsRef.current) {
        const hue = 210 + star.z * 40;
        const radius = star.size * star.z * 1.2;

        // outer glow
        const glow = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          radius * 2.5
        );
        glow.addColorStop(0, `hsla(${hue}, 90%, 80%, ${star.alpha * 0.35})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(star.x, star.y, radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // core
        ctx.fillStyle = `hsla(${hue}, 85%, 85%, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
        ctx.fill();

        star.x += star.vx * star.z;
        star.y += star.vy * star.z;

        star.alpha += (Math.random() - 0.5) * 0.025;
        star.alpha = Math.max(0.2, Math.min(0.85, star.alpha));

        if (
          star.y < -16 ||
          star.y > canvas.height + 16 ||
          star.x < -16 ||
          star.x > canvas.width + 16
        ) {
          Object.assign(star, randomStar(canvas.width, canvas.height));
          if (Math.random() < 0.5) {
            star.y = canvas.height + Math.random() * 20;
          }
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, [starCount]);

  return <canvas ref={canvasRef} className={`absolute inset-0 ${className}`} />;
}
