import { useEffect, useRef, useState } from "react";

/**
 * SongVisualizer
 * Animated waveform bars driven by real Web Audio API frequency data.
 * Falls back to a CSS animation if audio context is unavailable.
 *
 * Props:
 *   audioEl   - ref to the <audio> element (audioRef.current)
 *   isPlaying - bool
 *   barCount  - number of bars (default 40)
 *   height    - px height of visualizer (default 56)
 *   color     - bar color (default #1DB954)
 */
export default function SongVisualizer({
  audioEl,
  isPlaying,
  barCount = 40,
  height   = 56,
  color    = "#1DB954",
}) {
  const canvasRef    = useRef(null);
  const animRef      = useRef(null);
  const analyserRef  = useRef(null);
  const sourceRef    = useRef(null);
  const ctxRef       = useRef(null);
  const [ready, setReady] = useState(false);

  // ── Setup Web Audio ─────────────────────────────────────────────────
  useEffect(() => {
    if (!audioEl) return;

    try {
      if (!ctxRef.current) {
        ctxRef.current  = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (!sourceRef.current) {
        sourceRef.current = ctxRef.current.createMediaElementSource(audioEl);
      }
      if (!analyserRef.current) {
        analyserRef.current = ctxRef.current.createAnalyser();
        analyserRef.current.fftSize = 128;
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(ctxRef.current.destination);
      }
      setReady(true);
    } catch {
      // Silently fallback to CSS animation
      setReady(false);
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [audioEl]);

  // ── Draw loop ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas  = canvasRef.current;
    if (!canvas) return;
    const ctx     = canvas.getContext("2d");
    const w       = canvas.width;
    const h       = canvas.height;
    const bufLen  = analyserRef.current?.frequencyBinCount || barCount;
    const dataArr = analyserRef.current ? new Uint8Array(bufLen) : null;

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, w, h);

      if (analyserRef.current && dataArr && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArr);
      }

      const barW   = (w / barCount) - 1.5;
      const step   = Math.floor(bufLen / barCount);

      for (let i = 0; i < barCount; i++) {
        let barH;

        if (analyserRef.current && dataArr && isPlaying) {
          barH = (dataArr[i * step] / 255) * h;
          barH = Math.max(barH, 3);
        } else if (isPlaying) {
          // CSS-like sine wave fallback
          barH = (Math.sin(Date.now() / 200 + i * 0.4) * 0.5 + 0.5) * h * 0.7 + 3;
        } else {
          barH = 3;
        }

        const x = i * (barW + 1.5);
        const y = h - barH;

        // Gradient per bar
        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, color + "cc");
        grad.addColorStop(1, color + "44");

        ctx.fillStyle   = grad;
        ctx.beginPath();
        ctx.roundRect
          ? ctx.roundRect(x, y, barW, barH, 2)
          : ctx.rect(x, y, barW, barH);
        ctx.fill();
      }
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying, ready, barCount, color]);

  // Resume audio context on user interaction
  const handleClick = () => {
    if (ctxRef.current?.state === "suspended") {
      ctxRef.current.resume();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 8}
      height={height}
      onClick={handleClick}
      style={{
        width:   "100%",
        height:  `${height}px`,
        display: "block",
        cursor:  "pointer",
        opacity: isPlaying ? 1 : 0.35,
        transition: "opacity 0.4s",
      }}
    />
  );
}