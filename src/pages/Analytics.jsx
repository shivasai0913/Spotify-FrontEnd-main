import { useState, useEffect } from "react";
import { getAllSongs } from "../services/api";
import { toast } from "../components/Toast";

export default function Analytics() {
  const [songs,   setSongs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [playCount, setPlayCount] = useState({});

  useEffect(() => {
    getAllSongs()
      .then(r => {
        setSongs(r.data);
        // Load play counts from localStorage
        const stored = JSON.parse(localStorage.getItem("spotify_play_counts") || "{}");
        setPlayCount(stored);
      })
      .catch(() => toast("Failed to load analytics", "error"))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived data ────────────────────────────────────────────────────
  const songsWithPlays = songs.map(s => ({
    ...s,
    plays: playCount[s.id] || 0,
  })).sort((a, b) => b.plays - a.plays);

  const top10 = songsWithPlays.slice(0, 10);
  const maxPlays = top10[0]?.plays || 1;

  // Genre breakdown
  const genreMap = {};
  songs.forEach(s => {
    const g = s.genre || "Unknown";
    genreMap[g] = (genreMap[g] || 0) + 1;
  });
  const genres = Object.entries(genreMap).sort((a,b) => b[1]-a[1]).slice(0,8);
  const maxGenre = genres[0]?.[1] || 1;

  // Artist breakdown
  const artistMap = {};
  songs.forEach(s => { if(s.artist) artistMap[s.artist] = (artistMap[s.artist]||0)+1; });
  const topArtists = Object.entries(artistMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const COLORS = ["#1DB954","#3b82f6","#f59e0b","#ec4899","#8b5cf6","#06b6d4","#f97316","#84cc16"];

  const shimmer = {
    background:"linear-gradient(90deg,#1e1e1e 25%,#2a2a2a 50%,#1e1e1e 75%)",
    backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite", borderRadius:"0.4rem",
  };

  const imgSrc = (song) => song?.imageUrl?.startsWith("http")
    ? song.imageUrl : "https://via.placeholder.com/40x40/282828/fff?text=♪";

  return (
    <div style={{ padding:"1.5rem" }}>

      {/* Header */}
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={{ fontSize:"1.6rem", fontWeight:900, letterSpacing:"-0.02em", marginBottom:"0.25rem" }}>
          📊 Analytics
        </h1>
        <p style={{ fontSize:"0.85rem", opacity:0.5 }}>Music library insights</p>
      </div>

      {/* Summary stats */}
      <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.75rem", flexWrap:"wrap" }}>
        {[
          { label:"Total Songs",   value: songs.length,                                          color:"#1DB954", icon:"🎵" },
          { label:"Total Artists", value: Object.keys(artistMap).length,                          color:"#3b82f6", icon:"🎤" },
          { label:"Total Genres",  value: Object.keys(genreMap).length,                           color:"#f59e0b", icon:"🎸" },
          { label:"Total Plays",   value: Object.values(playCount).reduce((a,b)=>a+b,0),          color:"#ec4899", icon:"▶️" },
        ].map(s => (
          <div key={s.label} style={{
            background:"#181818", borderRadius:"0.75rem",
            padding:"0.85rem 1.25rem", flex:"1", minWidth:110,
            borderLeft:`3px solid ${s.color}`,
          }}>
            <p style={{ fontSize:"1.4rem", fontWeight:900, color:s.color }}>{s.icon} {s.value}</p>
            <p style={{ fontSize:"0.75rem", opacity:0.5, marginTop:"0.1rem" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>

        {/* ── Most Played Songs ── */}
        <div style={{ background:"#181818", borderRadius:"0.75rem", padding:"1.25rem", gridColumn:"1 / -1" }}>
          <h2 style={{ fontSize:"1rem", fontWeight:800, marginBottom:"1.25rem", opacity:0.9 }}>
            🔥 Most Played Songs
          </h2>
          {loading && [...Array(5)].map((_,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.85rem" }}>
              <div style={{ ...shimmer, width:36, height:36, borderRadius:4, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ ...shimmer, height:12, width:"60%", marginBottom:"0.4rem" }} />
                <div style={{ ...shimmer, height:8,  width:"100%", borderRadius:"100px" }} />
              </div>
            </div>
          ))}
          {!loading && top10.length === 0 && (
            <p style={{ opacity:0.4, fontSize:"0.88rem", textAlign:"center", padding:"1rem" }}>
              No play data yet — start listening! 🎵
            </p>
          )}
          {!loading && top10.map((song, i) => (
            <div key={song.id} style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.75rem" }}>
              {/* Rank */}
              <span style={{ fontSize:"0.75rem", opacity:0.4, width:16, flexShrink:0, textAlign:"right" }}>
                {i+1}
              </span>
              {/* Thumb */}
              <img src={imgSrc(song)} alt={song.title}
                onError={e=>{ e.target.src="https://via.placeholder.com/36x36/282828/fff?text=♪"; }}
                style={{ width:36, height:36, borderRadius:4, objectFit:"cover", flexShrink:0 }} />
              {/* Info + bar */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.3rem" }}>
                  <span style={{ fontSize:"0.82rem", fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"60%" }}>
                    {song.title}
                  </span>
                  <span style={{ fontSize:"0.72rem", opacity:0.5, flexShrink:0 }}>
                    {song.plays} plays
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:2 }}>
                  <div style={{
                    height:"100%",
                    width: `${(song.plays / maxPlays) * 100}%`,
                    background: COLORS[i % COLORS.length],
                    borderRadius:2,
                    transition:"width 0.8s ease",
                    minWidth: song.plays > 0 ? "4px" : "0",
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Genre Breakdown ── */}
        <div style={{ background:"#181818", borderRadius:"0.75rem", padding:"1.25rem" }}>
          <h2 style={{ fontSize:"1rem", fontWeight:800, marginBottom:"1.25rem" }}>🎸 Songs by Genre</h2>
          {loading && [...Array(4)].map((_,i) => (
            <div key={i} style={{ marginBottom:"0.75rem" }}>
              <div style={{ ...shimmer, height:11, width:"50%", marginBottom:"0.35rem" }} />
              <div style={{ ...shimmer, height:8, width:"100%", borderRadius:"100px" }} />
            </div>
          ))}
          {!loading && genres.length === 0 && (
            <p style={{ opacity:0.4, fontSize:"0.85rem" }}>No genre data</p>
          )}
          {!loading && genres.map(([genre, count], i) => (
            <div key={genre} style={{ marginBottom:"0.85rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.3rem" }}>
                <span style={{ fontSize:"0.82rem", fontWeight:600 }}>{genre}</span>
                <span style={{ fontSize:"0.75rem", opacity:0.5 }}>{count} songs</span>
              </div>
              <div style={{ height:6, background:"rgba(255,255,255,0.08)", borderRadius:3 }}>
                <div style={{
                  height:"100%",
                  width:`${(count/maxGenre)*100}%`,
                  background:COLORS[i%COLORS.length],
                  borderRadius:3,
                  transition:"width 0.8s ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Top Artists ── */}
        <div style={{ background:"#181818", borderRadius:"0.75rem", padding:"1.25rem" }}>
          <h2 style={{ fontSize:"1rem", fontWeight:800, marginBottom:"1.25rem" }}>🎤 Top Artists</h2>
          {loading && [...Array(4)].map((_,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"0.65rem", marginBottom:"0.65rem" }}>
              <div style={{ ...shimmer, width:36, height:36, borderRadius:"50%" }} />
              <div>
                <div style={{ ...shimmer, height:12, width:80, marginBottom:"0.3rem" }} />
                <div style={{ ...shimmer, height:9,  width:50 }} />
              </div>
            </div>
          ))}
          {!loading && topArtists.map(([artist, count], i) => (
            <div key={artist} style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.65rem" }}>
              <div style={{
                width:36, height:36, borderRadius:"50%", flexShrink:0,
                background:COLORS[i%COLORS.length]+"33",
                border:`2px solid ${COLORS[i%COLORS.length]}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.85rem", fontWeight:800,
                color:COLORS[i%COLORS.length],
              }}>
                {i+1}
              </div>
              <div>
                <p style={{ fontSize:"0.88rem", fontWeight:700 }}>{artist}</p>
                <p style={{ fontSize:"0.72rem", opacity:0.5 }}>{count} song{count!==1?"s":""}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}