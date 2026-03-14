import { useEffect, useRef } from "react";

/**
 * PlayerParticles
 * Floating glowing particles inside the player bar when music is playing.
 * Place inside .musicplayer div.
 */
export default function PlayerParticles({ isPlaying }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const spawn = () => {
      if (!isPlaying) return;
      const W = canvas.width;
      const H = canvas.height;
      particles.current.push({
        x:     Math.random() * W,
        y:     H + 4,
        vx:    (Math.random() - 0.5) * 0.8,
        vy:    -(Math.random() * 1.2 + 0.4),
        size:  Math.random() * 3 + 1,
        alpha: 0.8,
        color: Math.random() > 0.6 ? "#1DB954" : "#ffffff",
      });
    };

    let spawnTimer = 0;

    const draw = (ts) => {
      animRef.current = requestAnimationFrame(draw);
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Spawn new particles
      if (isPlaying && ts - spawnTimer > 60) {
        spawnTimer = ts;
        spawn();
        if (Math.random() > 0.5) spawn();
      }

      // Update and draw particles
      particles.current = particles.current.filter(p => {
        p.x     += p.vx;
        p.y     += p.vy;
        p.alpha -= 0.008;

        if (p.alpha <= 0 || p.y < -10) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.color;
        ctx.shadowBlur  = 6;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return true;
      });

      // Fade out all particles when not playing
      if (!isPlaying && particles.current.length === 0) {
        cancelAnimationFrame(animRef.current);
      }
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "absolute",
        inset:         0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        zIndex:        0,
        opacity:       isPlaying ? 1 : 0,
        transition:    "opacity 1s ease",
        borderRadius:  "inherit",
      }}
    />
  );
}