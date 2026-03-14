/**
 * EqualizerBars — animated green bars shown on currently playing song
 * Props:
 *   isPlaying: bool
 *   size: "sm" | "md" (default "sm")
 */
export default function EqualizerBars({ isPlaying, size = "sm" }) {
  const barW = size === "md" ? 3 : 2;
  const gap  = size === "md" ? 2 : 1.5;
  const maxH = size === "md" ? 16 : 12;

  const bars = [
    { delay: "0s",    minH: 3,  maxH: maxH },
    { delay: "0.2s",  minH: 5,  maxH: maxH - 2 },
    { delay: "0.1s",  minH: 2,  maxH: maxH },
    { delay: "0.3s",  minH: 4,  maxH: maxH - 4 },
  ];

  return (
    <div style={{
      display:     "flex",
      alignItems:  "flex-end",
      gap:         `${gap}px`,
      height:      `${maxH}px`,
    }}>
      {bars.map((b, i) => (
        <div key={i} style={{
          width:           `${barW}px`,
          height:          isPlaying ? `${b.maxH}px` : `${b.minH}px`,
          background:      "#1DB954",
          borderRadius:    "1px",
          transformOrigin: "bottom",
          transition:      "height 0.2s",
          animation:       isPlaying
            ? `eq-bounce ${0.6 + i * 0.1}s ease-in-out infinite alternate`
            : "none",
          animationDelay:  b.delay,
        }} />
      ))}
      <style>{`
        @keyframes eq-bounce {
          from { height: 3px; }
          to   { height: ${maxH}px; }
        }
      `}</style>
    </div>
  );
}