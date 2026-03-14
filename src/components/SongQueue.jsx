import { useState } from "react";
import { FaXmark, FaBars, FaTrash } from "react-icons/fa6";

/**
 * useQueue hook — manages the song queue
 */
export function useQueue() {
  const [queue, setQueue] = useState([]);

  const addToQueue = (song) => {
    setQueue(prev => {
      if (prev.some(s => s.id === song.id)) return prev;
      return [...prev, song];
    });
  };

  const removeFromQueue = (songId) => {
    setQueue(prev => prev.filter(s => s.id !== songId));
  };

  const clearQueue = () => setQueue([]);

  const shiftQueue = () => {
    setQueue(prev => prev.slice(1));
    return queue[0] || null;
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    setQueue(prev => {
      const arr = [...prev];
      [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
      return arr;
    });
  };

  const moveDown = (idx) => {
    setQueue(prev => {
      if (idx >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]];
      return arr;
    });
  };

  return { queue, addToQueue, removeFromQueue, clearQueue, shiftQueue, moveUp, moveDown };
}

/**
 * QueuePanel — slide-in panel showing the queue
 */
export default function QueuePanel({ queue, onRemove, onClear, onMoveUp, onMoveDown, onClose, currentSong }) {
  const imgSrc = (song) => song?.imageUrl?.startsWith("http")
    ? song.imageUrl
    : "https://via.placeholder.com/40x40/282828/fff?text=♪";

  return (
    <div style={{
      position:   "fixed",
      right:      0, top:0, bottom:0,
      width:      "min(340px, 100vw)",
      background: "rgba(18,18,18,0.97)",
      backdropFilter: "blur(24px)",
      borderLeft: "1px solid rgba(255,255,255,0.08)",
      zIndex:     600,
      display:    "flex",
      flexDirection: "column",
      animation:  "slideInRight 0.3s cubic-bezier(0.34,1.2,0.64,1)",
    }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1.25rem 1rem", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <h2 style={{ fontSize:"1.1rem", fontWeight:800 }}>Queue</h2>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          {queue.length > 0 && (
            <button onClick={onClear} style={{ ...btn, fontSize:"0.75rem", color:"#ff4444" }}>
              <FaTrash size={12} /> Clear
            </button>
          )}
          <button onClick={onClose} style={btn}><FaXmark size={18} /></button>
        </div>
      </div>

      {/* Current song */}
      {currentSong && (
        <div style={{ padding:"0.75rem 1rem", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ fontSize:"0.68rem", opacity:0.4, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.5rem" }}>Now Playing</p>
          <div style={{ display:"flex", alignItems:"center", gap:"0.65rem" }}>
            <img src={imgSrc(currentSong)} alt={currentSong.title}
              style={{ width:40, height:40, borderRadius:4, objectFit:"cover",
                boxShadow:"0 0 12px rgba(29,185,84,0.4)" }} />
            <div>
              <p style={{ fontSize:"0.88rem", fontWeight:700, color:"#1DB954" }}>{currentSong.title}</p>
              <p style={{ fontSize:"0.75rem", opacity:0.5 }}>{currentSong.artist}</p>
            </div>
          </div>
        </div>
      )}

      {/* Queue list */}
      <div style={{ flex:1, overflowY:"auto", padding:"0.5rem 0" }}>
        {queue.length === 0 ? (
          <div style={{ padding:"3rem", textAlign:"center", opacity:0.35 }}>
            <p style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>🎵</p>
            <p style={{ fontWeight:700 }}>Queue is empty</p>
            <p style={{ fontSize:"0.82rem", marginTop:"0.35rem" }}>Right-click songs to add</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize:"0.68rem", opacity:0.4, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", padding:"0.5rem 1rem 0.25rem" }}>
              Next Up — {queue.length} song{queue.length !== 1 ? "s" : ""}
            </p>
            {queue.map((song, idx) => (
              <div key={song.id} style={{
                display:"flex", alignItems:"center", gap:"0.65rem",
                padding:"0.5rem 1rem", transition:"background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
              >
                <span style={{ fontSize:"0.75rem", opacity:0.3, width:16, textAlign:"right", flexShrink:0 }}>{idx+1}</span>
                <img src={imgSrc(song)} alt={song.title}
                  onError={e => { e.target.src="https://via.placeholder.com/36x36/282828/fff?text=♪"; }}
                  style={{ width:36, height:36, borderRadius:4, objectFit:"cover", flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:"0.85rem", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{song.title}</p>
                  <p style={{ fontSize:"0.72rem", opacity:0.5 }}>{song.artist}</p>
                </div>
                <div style={{ display:"flex", gap:"0.2rem", flexShrink:0 }}>
                  <button onClick={() => onMoveUp(idx)} style={iconBtn} title="Move up">↑</button>
                  <button onClick={() => onMoveDown(idx)} style={iconBtn} title="Move down">↓</button>
                  <button onClick={() => onRemove(song.id)} style={{ ...iconBtn, color:"#ff4444" }} title="Remove">
                    <FaXmark size={12} />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity:0; }
          to   { transform: translateX(0);    opacity:1; }
        }
      `}</style>
    </div>
  );
}

const btn = {
  background:"none", border:"none", color:"rgba(255,255,255,0.6)",
  cursor:"pointer", padding:"0.3rem", display:"flex", alignItems:"center",
  gap:"0.3rem", fontFamily:"Montserrat,sans-serif", fontSize:"0.82rem",
  fontWeight:600, borderRadius:"0.4rem", transition:"color 0.15s",
};
const iconBtn = {
  background:"none", border:"none", color:"rgba(255,255,255,0.5)",
  cursor:"pointer", padding:"0.25rem 0.3rem", fontSize:"0.8rem",
  borderRadius:"0.3rem", transition:"color 0.15s",
};