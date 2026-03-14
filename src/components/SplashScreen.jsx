import { useState, useEffect } from "react";

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState("enter"); // enter → pulse → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("pulse"), 600);
    const t2 = setTimeout(() => setPhase("exit"),  2200);
    const t3 = setTimeout(() => onComplete(),       2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div style={{
      position:       "fixed",
      inset:          0,
      zIndex:         9999,
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      background:     "#000",
      opacity:        phase === "exit" ? 0 : 1,
      transform:      phase === "exit" ? "scale(1.05)" : "scale(1)",
      transition:     "opacity 0.6s ease, transform 0.6s ease",
    }}>

      {/* Animated rings */}
      {[1,2,3].map(i => (
        <div key={i} style={{
          position:     "absolute",
          width:        `${120 + i * 80}px`,
          height:       `${120 + i * 80}px`,
          borderRadius: "50%",
          border:       `1px solid rgba(29,185,84,${0.15 - i * 0.04})`,
          animation:    `ringPulse ${1.5 + i * 0.3}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}

      {/* Logo container */}
      <div style={{
        position:   "relative",
        display:    "flex",
        flexDirection: "column",
        alignItems: "center",
        gap:        "1.25rem",
        transform:  phase === "enter" ? "translateY(30px)" : "translateY(0)",
        opacity:    phase === "enter" ? 0 : 1,
        transition: "transform 0.7s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease",
      }}>

        {/* Spotify icon with glow */}
        <div style={{
          width:        "90px",
          height:       "90px",
          borderRadius: "50%",
          background:   "#1DB954",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          boxShadow:    "0 0 60px rgba(29,185,84,0.6), 0 0 120px rgba(29,185,84,0.3)",
          animation:    phase === "pulse" ? "logoPulse 0.8s ease-in-out infinite alternate" : "none",
        }}>
          <svg viewBox="0 0 24 24" fill="#000" width="52" height="52">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>

        {/* App name with letter animation */}
        <div style={{ display:"flex", gap:"2px" }}>
          {"SPOTIFY".split("").map((letter, i) => (
            <span key={i} style={{
              fontSize:      "2.2rem",
              fontWeight:    900,
              color:         "#fff",
              letterSpacing: "0.08em",
              fontFamily:    "Montserrat, sans-serif",
              opacity:       phase === "enter" ? 0 : 1,
              transform:     phase === "enter" ? "translateY(20px)" : "translateY(0)",
              transition:    `opacity 0.4s ease ${0.3 + i * 0.06}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + i * 0.06}s`,
            }}>{letter}</span>
          ))}
        </div>

        <p style={{
          fontSize:   "0.85rem",
          opacity:    phase === "pulse" ? 0.6 : 0,
          color:      "#1DB954",
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontFamily: "Montserrat, sans-serif",
          transition: "opacity 0.5s ease 0.5s",
        }}>
          Music for everyone
        </p>
      </div>

      {/* Loading bar */}
      <div style={{
        position:     "absolute",
        bottom:       "3rem",
        width:        "120px",
        height:       "2px",
        background:   "rgba(255,255,255,0.1)",
        borderRadius: "1px",
        overflow:     "hidden",
      }}>
        <div style={{
          height:     "100%",
          background: "#1DB954",
          borderRadius: "1px",
          animation:  "loadBar 2s ease forwards",
          boxShadow:  "0 0 8px rgba(29,185,84,0.8)",
        }} />
      </div>

      <style>{`
        @keyframes ringPulse {
          from { transform: scale(0.95); opacity: 0.5; }
          to   { transform: scale(1.05); opacity: 1; }
        }
        @keyframes logoPulse {
          from { box-shadow: 0 0 40px rgba(29,185,84,0.5), 0 0 80px rgba(29,185,84,0.2); }
          to   { box-shadow: 0 0 80px rgba(29,185,84,0.9), 0 0 160px rgba(29,185,84,0.4); }
        }
        @keyframes loadBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}