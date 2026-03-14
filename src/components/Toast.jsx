import { useState,  useEffect } from "react";

// ── Toast Context hook ─────────────────────────────────────────────────────
let toastFn = null;

export function toast(message, type = "success") {
  if (toastFn) toastFn(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastFn = (message, type) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };
    return () => { toastFn = null; };
  }, []);

  const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  const colors = {
    success: "#1DB954",
    error:   "#ff4444",
    info:    "#3b82f6",
    warning: "#f59e0b",
  };

  return (
    <div style={{
      position:  "fixed",
      top:       "1rem",
      right:     "1rem",
      zIndex:    9999,
      display:   "flex",
      flexDirection: "column",
      gap:       "0.5rem",
      pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background:   "#1e1e1e",
          border:       `1px solid ${colors[t.type]}40`,
          borderLeft:   `3px solid ${colors[t.type]}`,
          borderRadius: "0.6rem",
          padding:      "0.75rem 1rem",
          display:      "flex",
          alignItems:   "center",
          gap:          "0.6rem",
          minWidth:     "260px",
          maxWidth:     "340px",
          boxShadow:    "0 8px 24px rgba(0,0,0,0.5)",
          animation:    "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          fontFamily:   "Montserrat, sans-serif",
        }}>
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>{icons[t.type]}</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>
            {t.message}
          </span>
          <div style={{
            position:   "absolute",
            bottom:     0, left: 0,
            height:     "2px",
            background: colors[t.type],
            borderRadius: "0 0 0 0.6rem",
            animation:  "toastBar 3.5s linear forwards",
          }} />
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}