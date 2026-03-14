import { useEffect, useState } from "react";

/**
 * KeyboardShortcuts
 * Global keyboard shortcuts for music control.
 * Place once in App.jsx — it renders nothing visible except a help tooltip.
 */
export default function KeyboardShortcuts({ onPlayPause, onNext, onPrev, onVolumeUp, onVolumeDown }) {
  const [showHelp, setShowHelp] = useState(false);
  const [lastKey,  setLastKey]  = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      // Don't intercept when typing in inputs
      if (["input","textarea","select"].includes(tag)) return;

      let handled = true;
      switch (e.key) {
        case " ":
        case "k":
          onPlayPause?.();
          setLastKey("Space / K — Play/Pause");
          break;
        case "ArrowRight":
        case "l":
          onNext?.();
          setLastKey("→ Next song");
          break;
        case "ArrowLeft":
        case "j":
          onPrev?.();
          setLastKey("← Previous song");
          break;
        case "ArrowUp":
          onVolumeUp?.();
          setLastKey("↑ Volume up");
          break;
        case "ArrowDown":
          onVolumeDown?.();
          setLastKey("↓ Volume down");
          break;
        case "?":
          setShowHelp(h => !h);
          handled = false;
          break;
        default:
          handled = false;
      }
      if (handled) e.preventDefault();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPlayPause, onNext, onPrev, onVolumeUp, onVolumeDown]);

  // Show last key hint briefly
  useEffect(() => {
    if (!lastKey) return;
    const t = setTimeout(() => setLastKey(null), 1500);
    return () => clearTimeout(t);
  }, [lastKey]);

  const shortcuts = [
    { key:"Space / K", action:"Play / Pause"    },
    { key:"→ / L",     action:"Next song"        },
    { key:"← / J",     action:"Previous song"    },
    { key:"↑",         action:"Volume up"        },
    { key:"↓",         action:"Volume down"      },
    { key:"?",         action:"Toggle this help" },
  ];

  return (
    <>
      {/* Last key indicator */}
      {lastKey && (
        <div style={{
          position:   "fixed",
          top:        "5rem",
          left:       "50%",
          transform:  "translateX(-50%)",
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          border:     "1px solid rgba(255,255,255,0.1)",
          borderRadius:"100px",
          padding:    "0.5rem 1.25rem",
          fontSize:   "0.82rem",
          fontWeight: 600,
          color:      "#fff",
          zIndex:     9000,
          pointerEvents:"none",
          animation:  "fadeInOut 1.5s ease forwards",
          whiteSpace: "nowrap",
        }}>
          ⌨️ {lastKey}
        </div>
      )}

      {/* Help modal */}
      {showHelp && (
        <div
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:8000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}
          onClick={() => setShowHelp(false)}
        >
          <div style={{
            background:"#1e1e1e", borderRadius:"1rem",
            padding:"2rem", minWidth:320,
            border:"1px solid rgba(255,255,255,0.1)",
            boxShadow:"0 24px 64px rgba(0,0,0,0.6)",
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize:"1.1rem", fontWeight:800, marginBottom:"1.25rem" }}>⌨️ Keyboard Shortcuts</h2>
            {shortcuts.map(s => (
              <div key={s.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.5rem 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                <kbd style={{
                  background:"#333", borderRadius:"0.35rem", padding:"0.2rem 0.6rem",
                  fontSize:"0.82rem", fontFamily:"monospace", fontWeight:700,
                  border:"1px solid rgba(255,255,255,0.15)",
                }}>{s.key}</kbd>
                <span style={{ fontSize:"0.85rem", opacity:0.7 }}>{s.action}</span>
              </div>
            ))}
            <p style={{ fontSize:"0.75rem", opacity:0.4, marginTop:"1rem", textAlign:"center" }}>Press ? to toggle · Click anywhere to close</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0%   { opacity:0; transform:translateX(-50%) translateY(-8px); }
          20%  { opacity:1; transform:translateX(-50%) translateY(0); }
          80%  { opacity:1; }
          100% { opacity:0; }
        }
      `}</style>
    </>
  );
}