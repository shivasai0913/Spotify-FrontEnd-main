import { useState, useRef, useEffect } from "react";
import {
  FaChevronDown, FaEllipsisVertical,
  FaShuffle, FaBackwardStep, FaForwardStep,
  FaRepeat, FaHeart, FaRegHeart, FaShareNodes, FaBars
} from "react-icons/fa6";

export default function MobileFullPlayer({
  song, isPlaying, likedSongs = [], onToggleLike,
  onClose, onNext, onPrev, onPlayPause,
  currentTime = 0, duration = 0, onSeek,
  shuffle, onShuffle, repeat, onRepeat,
}) {
  const [visible, setVisible]       = useState(false);
  const [dragOffset, setDragOffset] = useState(0);    // vertical drag to close
  const [swipeX, setSwipeX]         = useState(0);    // horizontal swipe distance
  const [exiting, setExiting]       = useState(false); // song exit animation active

  const startY    = useRef(null);
  const startX    = useRef(null);
  const isHoriz   = useRef(false);   // axis lock
  const VERT_THR  = 80;              // px to trigger close
  const HORIZ_THR = 60;              // px to trigger song change

  const isLiked = likedSongs.some((s) => s.id === song?.id);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  // ── Touch: axis-locked drag ──────────────────────────────────────────
  const onTouchStart = (e) => {
    startX.current  = e.touches[0].clientX;
    startY.current  = e.touches[0].clientY;
    isHoriz.current = false;
  };

  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Lock axis on first intentional move
    if (!isHoriz.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isHoriz.current = Math.abs(dx) > Math.abs(dy);
    }

    if (isHoriz.current) {
      e.preventDefault();
      // Rubber-band resistance past 120px
      const clamped = Math.sign(dx) * Math.min(Math.abs(dx), 120 + (Math.abs(dx) - 120) * 0.15);
      setSwipeX(clamped);
    } else if (dy > 0) {
      e.preventDefault();
      setDragOffset(dy * 0.6);
    }
  };

  const onTouchEnd = () => {
    if (isHoriz.current) {
      if      (swipeX < -HORIZ_THR) triggerSongChange("left");
      else if (swipeX >  HORIZ_THR) triggerSongChange("right");
      else setSwipeX(0); // snap back
    } else {
      if (dragOffset > VERT_THR) handleClose();
      else setDragOffset(0);
    }
    isHoriz.current = false;
  };

  // ── Slide art out → change song → slide art in ──────────────────────
  const triggerSongChange = (dir) => {
    setExiting(true);
    // Fly out to the correct side
    setSwipeX(dir === "left" ? -420 : 420);

    setTimeout(() => {
      // Change song
      if (dir === "left") onNext();
      else                onPrev();

      // Place art on the incoming side (instant, no transition)
      setSwipeX(dir === "left" ? 420 : -420);
      setExiting(false);

      // On next frame slide in to center
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSwipeX(0));
      });
    }, 240);
  };

  function fmt(s) {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const imgSrc   = song?.imageUrl?.startsWith("http")
    ? song.imageUrl
    : "https://via.placeholder.com/400x400/1a1a2e/fff?text=♪";

  // Art CSS transform & transition
  const artStyle = {
    width:        "min(72vw, 300px)",
    height:       "min(72vw, 300px)",
    borderRadius: "12px",
    objectFit:    "cover",
    boxShadow:    "0 24px 64px rgba(0,0,0,0.7)",
    willChange:   "transform",
    draggable:    false,
    transform: swipeX !== 0
      ? `translateX(${swipeX}px) scale(0.92)`
      : isPlaying ? "scale(1)" : "scale(0.88)",
    transition: exiting
      ? "transform 0.24s cubic-bezier(0.4,0,1,1)"    // fly out fast
      : swipeX !== 0
        ? "none"                                        // finger-tracking: no lag
        : "transform 0.38s cubic-bezier(0.34,1.56,0.64,1)", // snap in with spring
  };

  return (
    <div
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        1000,
        display:       "flex",
        flexDirection: "column",
        transform:     visible ? `translateY(${dragOffset}px)` : "translateY(100%)",
        transition:    dragOffset > 0 ? "none" : "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
        willChange:    "transform",
        touchAction:   "none",
      }}
    >
      {/* Blurred album art BG */}
      <div style={{
        position:   "absolute", inset: 0, zIndex: 0,
        background: `url(${imgSrc}) center/cover no-repeat`,
        filter:     "blur(42px) brightness(0.28) saturate(1.6)",
        transform:  "scale(1.12)",
        transition: "background 0.5s",
      }} />
      {/* Dark gradient overlay */}
      <div style={{
        position:   "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.96) 100%)",
      }} />

      {/* All content */}
      <div
        style={{
          position:      "relative",
          zIndex:        2,
          display:       "flex",
          flexDirection: "column",
          height:        "100%",
          padding:       "0 1.5rem",
          paddingTop:    "env(safe-area-inset-top, 14px)",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
          userSelect:    "none",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        {/* ── Top bar ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1rem 0 0.5rem" }}>
          <button onClick={handleClose} style={iconBtn}>
            <FaChevronDown size={22} />
          </button>
          <div style={{ textAlign:"center", flex:1, margin:"0 0.75rem" }}>
            <p style={{ fontSize:"0.68rem", fontWeight:700, opacity:0.5, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"0.2rem" }}>
              Playing From Album
            </p>
            <p style={{ fontSize:"0.82rem", fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {song?.album || song?.title || "Unknown"}
            </p>
          </div>
          <button style={iconBtn}><FaEllipsisVertical size={20} /></button>
        </div>

        {/* ── Album art ── */}
        <div style={{
          flex:           "1 1 auto",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "0.75rem 0",
          minHeight:      0,
          overflow:       "hidden",
        }}>
          <img
            src={imgSrc}
            alt={song?.title}
            onError={(e) => { e.target.src = "https://via.placeholder.com/400x400/1a1a2e/fff?text=♪"; }}
            style={artStyle}
          />
        </div>

        {/* Swipe indicator dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:"5px", marginBottom:"0.85rem" }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width:        i === 1 ? "20px" : "6px",
              height:       "4px",
              borderRadius: "2px",
              background:   i === 1 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
              transition:   "width 0.2s",
            }} />
          ))}
        </div>

        {/* ── Song info + like ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.1rem" }}>
          <div style={{ minWidth:0, flex:1 }}>
            <p style={{ fontSize:"1.3rem", fontWeight:800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", letterSpacing:"-0.02em" }}>
              {song?.title || "No song"}
            </p>
            <p style={{ fontSize:"0.88rem", opacity:0.55, marginTop:"0.2rem" }}>
              {song?.artist || "Unknown artist"}
            </p>
          </div>
          <button
            onClick={() => onToggleLike?.(song)}
            style={{ ...iconBtn, color: isLiked ? "#1DB954" : "rgba(255,255,255,0.45)", marginLeft:"1rem" }}
          >
            {isLiked ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ marginBottom:"0.35rem", position:"relative" }}>
          <div
            style={{ height:"4px", background:"rgba(255,255,255,0.18)", borderRadius:"2px", position:"relative", cursor:"pointer" }}
            onClick={(e) => {
              if (!duration) return;
              const rect  = e.currentTarget.getBoundingClientRect();
              onSeek?.((e.clientX - rect.left) / rect.width * duration);
            }}
          >
            <div style={{ height:"100%", width:`${progress}%`, background:"#fff", borderRadius:"2px", transition:"width 0.1s linear" }} />
            <div style={{
              position:"absolute", top:"50%", left:`${progress}%`,
              transform:"translate(-50%,-50%)",
              width:"14px", height:"14px", borderRadius:"50%",
              background:"#fff", boxShadow:"0 2px 8px rgba(0,0,0,0.4)",
            }} />
          </div>
          <input type="range" min={0} max={duration||100} value={currentTime} step={0.1}
            onChange={(e) => onSeek?.(Number(e.target.value))}
            style={{ position:"absolute", top:"-8px", left:0, width:"100%", height:"20px", opacity:0, cursor:"pointer" }}
          />
        </div>

        {/* Time labels */}
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <span style={{ fontSize:"0.7rem", opacity:0.45 }}>{fmt(currentTime)}</span>
          <span style={{ fontSize:"0.7rem", opacity:0.45 }}>{fmt(duration)}</span>
        </div>

        {/* ── Playback controls ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.75rem" }}>
          <button onClick={onShuffle} style={{ ...iconBtn, color: shuffle ? "#1DB954" : "rgba(255,255,255,0.6)" }}>
            <FaShuffle size={21} />
          </button>
          <button onClick={onPrev} style={{ ...iconBtn, color:"#fff" }}>
            <FaBackwardStep size={27} />
          </button>
          <button onClick={onPlayPause} style={{
            width:72, height:72, borderRadius:"50%",
            background:"#fff", border:"none", color:"#000",
            fontSize:"1.55rem", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 8px 28px rgba(0,0,0,0.45)",
            transition:"transform 0.1s",
          }}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={onNext} style={{ ...iconBtn, color:"#fff" }}>
            <FaForwardStep size={27} />
          </button>
          <button onClick={onRepeat} style={{ ...iconBtn, color: repeat ? "#1DB954" : "rgba(255,255,255,0.6)" }}>
            <FaRepeat size={21} />
          </button>
        </div>

        {/* ── Bottom actions ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingBottom:"0.25rem", opacity:0.6 }}>
          <button style={iconBtn}><span style={{ fontSize:"1.15rem" }}>📱</span></button>
          <button style={iconBtn}><FaShareNodes size={19} /></button>
          <button style={iconBtn}><FaBars size={19} /></button>
        </div>

      </div>
    </div>
  );
}

const iconBtn = {
  background:     "none",
  border:         "none",
  color:          "rgba(255,255,255,0.85)",
  cursor:         "pointer",
  padding:        "0.4rem",
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  borderRadius:   "50%",
};