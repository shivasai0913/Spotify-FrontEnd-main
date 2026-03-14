import { useEffect, useRef } from "react";

/**
 * Confetti burst on like.
 * Call triggerConfetti() from anywhere.
 * Drop <ConfettiCanvas /> once in App.jsx just before </div>
 */

let canvasRef = null;

export function setConfettiCanvas(ref) {
  canvasRef = ref;
}

export function triggerConfetti() {
  const canvas = canvasRef;
  if (!canvas) return;

  const ctx    = canvas.getContext("2d");
  const W      = canvas.width  = window.innerWidth;
  const H      = canvas.height = window.innerHeight;

  const colors = ["#1DB954","#fff","#f59e0b","#ec4899","#3b82f6","#a78bfa","#f87171"];
  const shapes = ["circle","rect","heart"];

  const particles = Array.from({ length: 80 }, () => ({
    x:     W / 2 + (Math.random() - 0.5) * 200,
    y:     H - 100,
    vx:    (Math.random() - 0.5) * 12,
    vy:    -(Math.random() * 18 + 8),
    size:  Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    rot:   Math.random() * Math.PI * 2,
    rotV:  (Math.random() - 0.5) * 0.3,
    alpha: 1,
    gravity: 0.4,
  }));

  let frame;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    let alive = false;

    particles.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += p.gravity;
      p.vx  *= 0.99;
      p.rot += p.rotV;
      p.alpha -= 0.016;

      if (p.alpha <= 0) return;
      alive = true;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        // Heart shape
        const s = p.size / 10;
        ctx.beginPath();
        ctx.moveTo(0, s * 3);
        ctx.bezierCurveTo(-s*5, -s*2, -s*10, s*2, 0, s*7);
        ctx.bezierCurveTo(s*10, s*2, s*5, -s*2, 0, s*3);
        ctx.fill();
      }
      ctx.restore();
    });

    if (alive) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, W, H);
  };

  if (frame) cancelAnimationFrame(frame);
  draw();
}

export function ConfettiCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    setConfettiCanvas(ref.current);
    const onResize = () => {
      if (ref.current) {
        ref.current.width  = window.innerWidth;
        ref.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        9998,
        pointerEvents: "none",
        width:         "100%",
        height:        "100%",
      }}
    />
  );
}