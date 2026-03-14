import { useEffect, useRef } from "react";

/**
 * AnimatedBackground
 * Full-screen canvas with slowly shifting gradient orbs.
 * Place as first child of .main div.
 */
export default function AnimatedBackground({ isPlaying }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const timeRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Orb definitions
    const orbs = [
      { x: 0.2, y: 0.3, r: 0.45, color: "#1DB954", speed: 0.0003 },
      { x: 0.8, y: 0.6, r: 0.40, color: "#0d4a28", speed: 0.0004 },
      { x: 0.5, y: 0.1, r: 0.35, color: "#1a3a5c", speed: 0.0002 },
      { x: 0.1, y: 0.8, r: 0.30, color: "#2d1b4e", speed: 0.0005 },
    ];

    const draw = (ts) => {
      timeRef.current = ts;
      const W = canvas.width;
      const H = canvas.height;
      const speed = isPlaying ? 1 : 0.3;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      orbs.forEach((orb, i) => {
        const t     = ts * orb.speed * speed;
        const cx    = (orb.x + Math.sin(t + i) * 0.15) * W;
        const cy    = (orb.y + Math.cos(t * 0.7 + i) * 0.12) * H;
        const rad   = orb.r * Math.min(W, H);

        const grad  = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        grad.addColorStop(0, orb.color + "28");
        grad.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        0,
        pointerEvents: "none",
        opacity:       0.85,
      }}
    />
  );
}