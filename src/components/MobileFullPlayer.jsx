import { useState, useRef, useEffect } from "react";
import {
  FaChevronDown, FaEllipsisVertical,
  FaShuffle, FaBackwardStep, FaForwardStep,
  FaRepeat, FaHeart, FaRegHeart, FaShareNodes, FaBars
} from "react-icons/fa6";

/**
 * MobileFullPlayer
 * Slides up from the mini player bar when tapped on mobile.
 *
 * Props:
 *   song          - current song object
 *   songs         - all songs array
 *   isPlaying     - bool
 *   likedSongs    - array
 *   onToggleLike  - fn(song)
 *   onClose       - fn()  → collapse back to mini player
 *   onNext        - fn()
 *   onPrev        - fn()
 *   onPlayPause   - fn()
 *   currentTime   - number (seconds)
 *   duration      - number (seconds)
 *   onSeek        - fn(value)
 *   shuffle       - bool
 *   onShuffle     - fn()
 *   repeat        - bool
 *   onRepeat      - fn()
 */
export default function MobileFullPlayer({
  song, isPlaying, likedSongs = [], onToggleLike,
  onClose, onNext, onPrev, onPlayPause,
  currentTime = 0, duration = 0, onSeek,
  shuffle, onShuffle, repeat, onRepeat,
}) {
  const [visible, setVisible] = useState(false);
  const startY   = useRef(null);
  const dragY    = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  const isLiked = likedSongs.some((s) => s.id === song?.id);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  // Swipe down to close
  const onTouchStart = (e) => { startY.current = e.touches[0].clientY; };
  const onTouchMove  = (e) => {
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) { setDragOffset(dy); }
  };
  const onTouchEnd = () => {
    if (dragOffset > 100) { handleClose(); }
    else { setDragOffset(0); }
  };

  function fmt(s) {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const imgSrc = song?.imageUrl?.startsWith("http")
    ? song.imageUrl
    : "https://via.placeholder.com/400x400/1a1a2e/fff?text=♪";

  return (
    <div
      style={{
        position:        "fixed",
        inset:           0,
        zIndex:          1000,
        background:      "transparent",
        display:         "flex",
        flexDirection:   "column",
        transform:       visible ? `translateY(${dragOffset}px)` : "translateY(100%)",
        transition:      dragOffset > 0 ? "none" : "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
        willChange:      "transform",
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Blurred album art background */}
      <div style={{
        position:   "absolute", inset: 0,
        background: `url(${imgSrc}) center/cover no-repeat`,
        filter:     "blur(40px) brightness(0.35) saturate(1.4)",
        transform:  "scale(1.1)",
        zIndex:     0,
      }} />

      {/* Dark overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%)",
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{
        position:       "relative",
        zIndex:         2,
        display:        "flex",
        flexDirection:  "column",
        height:         "100%",
        padding:        "0 1.5rem",
        paddingTop:     "env(safe-area-inset-top, 12px)",
        paddingBottom:  "env(safe-area-inset-bottom, 12px)",
      }}>

        {/* ── Top bar ── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "1rem 0 0.5rem",
        }}>
          {/* Down chevron — back to mini player */}
          <button onClick={handleClose} style={iconBtn}>
            <FaChevronDown size={22} />
          </button>

          <div style={{ textAlign: "center", flex: 1, margin: "0 0.75rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, opacity: 0.6, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.15rem" }}>
              Playing From Album
            </p>
            <p style={{ fontSize: "0.82rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {song?.album || song?.title || "Unknown"}
            </p>
          </div>

          <button style={iconBtn}>
            <FaEllipsisVertical size={20} />
          </button>
        </div>

        {/* ── Album art ── */}
        <div style={{
          flex:          "1 1 auto",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
          padding:       "1.5rem 0",
          minHeight:     0,
        }}>
          <img
            src={imgSrc}
            alt={song?.title}
            onError={(e) => { e.target.src = "https://via.placeholder.com/400x400/1a1a2e/fff?text=♪"; }}
            style={{
              width:        "min(72vw, 320px)",
              height:       "min(72vw, 320px)",
              borderRadius: "12px",
              objectFit:    "cover",
              boxShadow:    "0 24px 64px rgba(0,0,0,0.7)",
              transform:    isPlaying ? "scale(1)" : "scale(0.88)",
              transition:   "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
        </div>

        {/* ── Song info + like ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: "1.35rem", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.02em" }}>
              {song?.title || "No song"}
            </p>
            <p style={{ fontSize: "0.9rem", opacity: 0.6, marginTop: "0.2rem" }}>
              {song?.artist || "Unknown artist"}
            </p>
          </div>
          <button
            onClick={() => onToggleLike?.(song)}
            style={{ ...iconBtn, color: isLiked ? "#1DB954" : "rgba(255,255,255,0.5)", marginLeft: "1rem" }}
          >
            {isLiked ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ marginBottom: "0.4rem" }}>
          <div
            style={{ position: "relative", height: "4px", background: "rgba(255,255,255,0.2)", borderRadius: "2px", cursor: "pointer" }}
            onClick={(e) => {
              if (!duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              onSeek?.(ratio * duration);
            }}
          >
            <div style={{ height: "100%", width: `${progress}%`, background: "#fff", borderRadius: "2px", transition: "width 0.1s linear" }} />
            {/* Thumb */}
            <div style={{
              position:   "absolute",
              top:        "50%",
              left:       `${progress}%`,
              transform:  "translate(-50%, -50%)",
              width:      "14px", height: "14px",
              borderRadius: "50%",
              background: "#fff",
              boxShadow:  "0 2px 8px rgba(0,0,0,0.4)",
            }} />
          </div>
          {/* Hidden range for touch seeking */}
          <input
            type="range" min={0} max={duration || 100} value={currentTime} step={0.1}
            onChange={(e) => onSeek?.(Number(e.target.value))}
            style={{ position: "absolute", opacity: 0, width: "calc(100% - 3rem)", height: "20px", marginTop: "-12px", cursor: "pointer" }}
          />
        </div>

        {/* Time labels */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "0.72rem", opacity: 0.5 }}>{fmt(currentTime)}</span>
          <span style={{ fontSize: "0.72rem", opacity: 0.5 }}>{fmt(duration)}</span>
        </div>

        {/* ── Controls ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <button onClick={onShuffle} style={{ ...iconBtn, color: shuffle ? "#1DB954" : "rgba(255,255,255,0.7)" }}>
            <FaShuffle size={22} />
          </button>

          <button onClick={onPrev} style={{ ...iconBtn, color: "#fff" }}>
            <FaBackwardStep size={28} />
          </button>

          {/* Big play/pause */}
          <button
            onClick={onPlayPause}
            style={{
              width: 70, height: 70,
              borderRadius: "50%",
              background: "#fff",
              border: "none",
              color: "#000",
              fontSize: "1.6rem",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              transition: "transform 0.1s",
            }}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button onClick={onNext} style={{ ...iconBtn, color: "#fff" }}>
            <FaForwardStep size={28} />
          </button>

          <button onClick={onRepeat} style={{ ...iconBtn, color: repeat ? "#1DB954" : "rgba(255,255,255,0.7)" }}>
            <FaRepeat size={22} />
          </button>
        </div>

        {/* ── Bottom actions ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "0.5rem", opacity: 0.7 }}>
          <button style={iconBtn}><span style={{ fontSize: "1.2rem" }}>📱</span></button>
          <button style={iconBtn}><FaShareNodes size={20} /></button>
          <button style={iconBtn}><FaBars size={20} /></button>
        </div>

      </div>
    </div>
  );
}

const iconBtn = {
  background: "none",
  border:     "none",
  color:      "rgba(255,255,255,0.85)",
  cursor:     "pointer",
  padding:    "0.4rem",
  display:    "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  transition: "opacity 0.15s",
};