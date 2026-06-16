import { useEffect, useRef } from 'react';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  decay: number;
  type: 'circle' | 'star' | 'square';
}

const COLORS = [
  '#FF3366', // Hot pink
  '#FF9933', // Orange
  '#FFCC00', // Yellow
  '#33CC66', // Emerald
  '#3399FF', // Sky Blue
  '#9933FF', // Purple
  '#FF33CC'  // Magenta
];

export default function Confetti({ active, onComplete }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set size to window boundaries
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Populate particles
    const list: Particle[] = [];
    const count = 100;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      list.push({
        x: centerX + (Math.random() - 0.5) * 50,
        y: centerY + (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (1 + Math.random() * 3), // lift up slightly
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        radius: 4 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        alpha: 1.0,
        decay: 0.012 + Math.random() * 0.012,
        type: ['circle', 'star', 'square'][Math.floor(Math.random() * 3)] as any
      });
    }
    particlesRef.current = list;

    // Simulation loop
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // smooth gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.type === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'square') {
          ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
        } else {
          // Draw a standard star
          ctx.beginPath();
          const spikes = 5;
          const outerRadius = p.radius;
          const innerRadius = p.radius / 2;
          let rot = (Math.PI / 2) * 3;
          let x = 0;
          let y = 0;
          const step = Math.PI / spikes;

          ctx.moveTo(0, -outerRadius);
          for (let s = 0; s < spikes; s++) {
            x = Math.cos(rot) * outerRadius;
            y = Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = Math.cos(rot) * innerRadius;
            y = Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
          }
          ctx.lineTo(0, -outerRadius);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        requestRef.current = requestAnimationFrame(tick);
      } else {
        onComplete?.();
      }
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      id="confetti-effects-canvas"
      className="fixed inset-0 z-[100] pointer-events-none w-full h-full"
    />
  );
}
