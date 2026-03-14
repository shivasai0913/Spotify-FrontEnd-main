import { useState, useEffect } from "react";
import { getAllSongs, deleteSong } from "../services/api";
import { toast } from "../components/Toast";
import EqualizerBars from "../components/EqualizerBars";
import { SongRowSkeleton } from "../components/Skeletons";

export default function AdminDashboard({ currentSong, isPlaying, onPlay }) {
  const [songs, setSongs]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = () => {
    setLoading(true);
    getAllSongs()
      .then(r => setSongs(r.data))
      .catch(() => toast("Failed to load songs", "error"))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (song) => {
    if (!window.confirm(`Delete "${song.title}"?`)) return;
    setDeleting(song.id);
    try {
      await deleteSong(song.id);
      setSongs(prev => prev.filter(s => s.id !== song.id));
      toast(`"${song.title}" deleted`, "success");
    } catch {
      toast("Failed to delete song", "error");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = songs.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.artist?.toLowerCase().includes(search.toLowerCase()) ||
    s.album?.toLowerCase().includes(search.toLowerCase())
  );

  const imgSrc = (song) => song?.imageUrl?.startsWith("http")
    ? song.imageUrl
    : "https://via.placeholder.com/42x42/282828/fff?text=♪";

  return (
    <div style={{ padding: "1.5rem" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <div>
          <h1 style={{ fontSize:"1.6rem", fontWeight:900, letterSpacing:"-0.02em", marginBottom:"0.25rem" }}>
            🎛 Admin Dashboard
          </h1>
          <p style={{ fontSize:"0.85rem", opacity:0.5 }}>
            {songs.length} songs in library
          </p>
        </div>

        {/* Search */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", background:"#2a2a2a", borderRadius:"100px", padding:"0.5rem 1rem", minWidth:220 }}>
          <span style={{ opacity:0.5 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search songs..."
            style={{ background:"none", border:"none", outline:"none", color:"#fff", fontSize:"0.88rem", fontFamily:"Montserrat,sans-serif", width:"100%" }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
        {[
          { label:"Total Songs",   value: songs.length,                                    color:"#1DB954" },
          { label:"Total Artists", value: new Set(songs.map(s=>s.artist)).size,             color:"#3b82f6" },
          { label:"Total Albums",  value: new Set(songs.map(s=>s.album).filter(Boolean)).size, color:"#f59e0b" },
        ].map(stat => (
          <div key={stat.label} style={{
            background:"#181818", borderRadius:"0.75rem",
            padding:"0.85rem 1.25rem", flex:"1", minWidth:120,
            borderLeft:`3px solid ${stat.color}`,
          }}>
            <p style={{ fontSize:"1.4rem", fontWeight:900, color:stat.color }}>{stat.value}</p>
            <p style={{ fontSize:"0.75rem", opacity:0.5, marginTop:"0.1rem" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:"#181818", borderRadius:"0.75rem", overflow:"hidden" }}>

        {/* Table header */}
        <div style={{
          display:"grid", gridTemplateColumns:"40px 1fr 140px 100px 80px 80px",
          padding:"0.6rem 1rem", borderBottom:"1px solid rgba(255,255,255,0.08)",
          fontSize:"0.72rem", opacity:0.4, letterSpacing:"0.08em", textTransform:"uppercase",
        }}>
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span>Genre</span>
          <span style={{textAlign:"center"}}>Duration</span>
          <span style={{textAlign:"center"}}>Action</span>
        </div>

        {/* Loading skeletons */}
        {loading && [...Array(8)].map((_, i) => <SongRowSkeleton key={i} />)}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ padding:"3rem", textAlign:"center", opacity:0.4 }}>
            <p style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>🎵</p>
            <p style={{ fontWeight:700 }}>{search ? "No songs match your search" : "No songs yet"}</p>
          </div>
        )}

        {/* Song rows */}
        {!loading && filtered.map((song, idx) => {
          const isCurrentSong = currentSong?.id === song.id;
          const isBeingDeleted = deleting === song.id;

          return (
            <div
              key={song.id}
              style={{
                display:    "grid",
                gridTemplateColumns: "40px 1fr 140px 100px 80px 80px",
                alignItems: "center",
                padding:    "0.5rem 1rem",
                borderBottom:"1px solid rgba(255,255,255,0.04)",
                background: isCurrentSong ? "rgba(29,185,84,0.08)" : "transparent",
                opacity:    isBeingDeleted ? 0.4 : 1,
                transition: "background 0.2s, opacity 0.2s",
                gap:        "0.5rem",
                cursor:     "pointer",
              }}
              onMouseEnter={e => { if(!isCurrentSong) e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if(!isCurrentSong) e.currentTarget.style.background="transparent"; }}
            >
              {/* Number / Equalizer */}
              <div style={{ textAlign:"center", fontSize:"0.85rem", opacity:0.5 }}>
                {isCurrentSong
                  ? <EqualizerBars isPlaying={isPlaying} size="sm" />
                  : <span>{idx + 1}</span>
                }
              </div>

              {/* Title + artist */}
              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", minWidth:0 }}
                onClick={() => onPlay?.(song)}>
                <img
                  src={imgSrc(song)} alt={song.title}
                  onError={e => { e.target.src="https://via.placeholder.com/42x42/282828/fff?text=♪"; }}
                  style={{ width:42, height:42, borderRadius:4, objectFit:"cover", flexShrink:0 }}
                />
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:"0.88rem", fontWeight:700, color: isCurrentSong ? "#1DB954":"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {song.title}
                  </p>
                  <p style={{ fontSize:"0.75rem", opacity:0.5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {song.artist}
                  </p>
                </div>
              </div>

              {/* Album */}
              <p style={{ fontSize:"0.82rem", opacity:0.5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {song.album || "—"}
              </p>

              {/* Genre */}
              {song.genre ? (
                <span style={{
                  background:"rgba(29,185,84,0.12)", color:"#1DB954",
                  fontSize:"0.72rem", fontWeight:700, padding:"0.2rem 0.5rem",
                  borderRadius:"100px", whiteSpace:"nowrap",
                  display:"inline-block", maxWidth:"100%", overflow:"hidden", textOverflow:"ellipsis",
                }}>
                  {song.genre}
                </span>
              ) : <span style={{opacity:0.3, fontSize:"0.82rem"}}>—</span>}

              {/* Duration */}
              <p style={{ fontSize:"0.82rem", opacity:0.5, textAlign:"center" }}>
                {song.duration ? `${Math.floor(song.duration/60)}:${String(song.duration%60).padStart(2,"0")}` : "—"}
              </p>

              {/* Delete button */}
              <div style={{ textAlign:"center" }}>
                <button
                  onClick={() => handleDelete(song)}
                  disabled={isBeingDeleted}
                  style={{
                    background:"rgba(255,68,68,0.12)", border:"1px solid rgba(255,68,68,0.3)",
                    color:"#ff4444", borderRadius:"0.4rem", padding:"0.3rem 0.65rem",
                    fontSize:"0.78rem", fontWeight:700, cursor:"pointer",
                    fontFamily:"Montserrat,sans-serif", transition:"background 0.2s",
                  }}
                  onMouseEnter={e => e.target.style.background="rgba(255,68,68,0.25)"}
                  onMouseLeave={e => e.target.style.background="rgba(255,68,68,0.12)"}
                >
                  {isBeingDeleted ? "..." : "Delete"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}