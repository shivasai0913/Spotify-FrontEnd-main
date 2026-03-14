import { useState } from "react";
import { FaHeart, FaRegHeart, FaBackwardStep, FaForwardStep } from "react-icons/fa6";

/**
 * FloatingNowPlaying
 * A draggable mini player that floats over the page while browsing.
 * Only shows when a song is playing and user is NOT on home.
 */
export default function FloatingNowPlaying({
  song, isPlaying, likedSongs = [],
  onToggleLike, onPlayPause, onNext, onPrev, currentPage
}) {
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos]             = useState({ x: null, y: null });
  const [dragging, setDragging]   = useState(false);
  const [dragStart, setDragStart] = useState(null);

  if (!song) return null;
  // Only show when not on home page
  if (currentPage === "home") return null;

  const isLiked = likedSongs.some(s => s.id === song.id);
  const imgSrc  = song?.imageUrl?.startsWith("http")
    ? song.imageUrl
    : "https://via.placeholder.com/40x40/282828/fff?text=♪";

  // Drag handlers
  const onMouseDown = (e) => {
    setDragging(true);
    setDragStart({ mx: e.clientX, my: e.clientY, px: pos.x ?? 20, py: pos.y ?? 80 });
  };
  const onMouseMove = (e) => {
    if (!dragging || !dragStart) return;
    setPos({
      x: dragStart.px + (e.clientX - dragStart.mx),
      y: dragStart.py + (e.clientY - dragStart.my),
    });
  };
  const onMouseUp = () => { setDragging(false); setDragStart(null); };

  const style = {
    position:   "fixed",
    right:      pos.x !== null ? "auto" : "1.25rem",
    bottom:     pos.y !== null ? "auto" : "100px",
    left:       pos.x !== null ? `${pos.x}px` : "auto",
    top:        pos.y !== null ? `${pos.y}px` : "auto",
    zIndex:     500,
    background: "rgba(18,18,18,0.92)",
    backdropFilter: "blur(20px)",
    border:     "1px solid rgba(255,255,255,0.1)",
    borderRadius: minimized ? "100px" : "1rem",
    boxShadow:  "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(29,185,84,0.15)",
    transition: "border-radius 0.3s, width 0.3s, box-shadow 0.2s",
    cursor:     dragging ? "grabbing" : "grab",
    userSelect: "none",
    minWidth:   minimized ? "56px" : "260px",
    animation:  "floatIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
  };

  return (
    <div
      style={style}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {minimized ? (
        // Minimized — just album art
        <div
          style={{ width:56, height:56, borderRadius:"100px", overflow:"hidden", position:"relative" }}
          onClick={() => setMinimized(false)}
        >
          <img src={imgSrc} alt={song.title}
            style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          {isPlaying && (
            <div style={{
              position:"absolute", inset:0,
              background:"rgba(0,0,0,0.4)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"1.2rem",
            }}>⏸</div>
          )}
        </div>
      ) : (
        // Full widget
        <div style={{ padding:"0.75rem" }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.6rem" }}>
            <span style={{ fontSize:"0.65rem", opacity:0.45, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>
              Now Playing
            </span>
            <div style={{ display:"flex", gap:"0.25rem" }}>
              <button onClick={() => setMinimized(true)} style={iconBtn} title="Minimize">—</button>
            </div>
          </div>

          {/* Song info row */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.65rem", marginBottom:"0.75rem" }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <img src={imgSrc} alt={song.title}
                onError={e => { e.target.src="https://via.placeholder.com/40x40/282828/fff?text=♪"; }}
                style={{ width:44, height:44, borderRadius:"6px", objectFit:"cover",
                  boxShadow: isPlaying ? "0 0 12px rgba(29,185,84,0.5)" : "none",
                  transition:"box-shadow 0.3s",
                  animation: isPlaying ? "spin 8s linear infinite" : "none",
                }} />
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <p style={{ fontSize:"0.85rem", fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {song.title}
              </p>
              <p style={{ fontSize:"0.72rem", opacity:0.5, marginTop:"0.1rem" }}>{song.artist}</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onToggleLike?.(song); }}
              style={{ ...iconBtn, color: isLiked ? "#1DB954" : "rgba(255,255,255,0.4)", flexShrink:0 }}
            >
              {isLiked ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
            </button>
          </div>

          {/* Controls */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
            <button onClick={e => { e.stopPropagation(); onPrev?.(); }} style={iconBtn}>
              <FaBackwardStep size={14} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onPlayPause?.(); }}
              style={{
                width:34, height:34, borderRadius:"50%",
                background:"#fff", border:"none", color:"#000",
                fontSize:"0.8rem", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:900, flexShrink:0,
                boxShadow:"0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button onClick={e => { e.stopPropagation(); onNext?.(); }} style={iconBtn}>
              <FaForwardStep size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatIn {
          from { opacity:0; transform:translateY(20px) scale(0.9); }
          to   { opacity:1; transform:translateY(0)    scale(1);   }
        }
        @keyframes spin {
          from { border-radius: 6px; }
          to   { border-radius: 6px; }
        }
      `}</style>
    </div>
  );
}

const iconBtn = {
  background:"none", border:"none",
  color:"rgba(255,255,255,0.7)", cursor:"pointer",
  padding:"0.3rem", display:"flex", alignItems:"center", justifyContent:"center",
  borderRadius:"50%", transition:"color 0.15s",
};