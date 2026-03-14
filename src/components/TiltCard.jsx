import { useRef } from "react";

/**
 * TiltCard — wraps any card with a 3D tilt on hover/touch
 * Usage: <TiltCard>{your card content}</TiltCard>
 */
export default function TiltCard({ children, style, className }) {
  const ref      = useRef(null);
  const frameRef = useRef(null);

  const handleMove = (clientX, clientY) => {
    const el   = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x    = (clientX - rect.left) / rect.width  - 0.5;
    const y    = (clientY - rect.top)  / rect.height - 0.5;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      el.style.transform = `
        perspective(600px)
        rotateY(${x * 14}deg)
        rotateX(${-y * 14}deg)
        scale(1.04)
      `;
      // Shine overlay
      const shine = el.querySelector(".tilt-shine");
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(255,255,255,0.12) 0%, transparent 65%)`;
      }
    });
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
    const shine = el.querySelector(".tilt-shine");
    if (shine) shine.style.background = "transparent";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transition:    "transform 0.15s ease",
        transformStyle:"preserve-3d",
        willChange:    "transform",
        position:      "relative",
        overflow:      "hidden",
      }}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseLeave={handleLeave}
      onTouchMove={(e) => {
        const t = e.touches[0];
        handleMove(t.clientX, t.clientY);
      }}
      onTouchEnd={handleLeave}
    >
      {/* Shine overlay */}
      <div
        className="tilt-shine"
        style={{
          position:      "absolute",
          inset:         0,
          pointerEvents: "none",
          borderRadius:  "inherit",
          zIndex:        10,
          transition:    "background 0.1s",
        }}
      />
      {children}
    </div>
  );
}