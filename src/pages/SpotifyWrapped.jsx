import { useState, useEffect } from "react";
import { getAllSongs } from "../services/api";
import { getName } from "../services/auth";

export default function SpotifyWrapped() {
  const [songs,     setSongs]     = useState([]);
  const [playCounts, setPlayCounts] = useState({});
  const [step,      setStep]      = useState(0);
  const [loading,   setLoading]   = useState(true);

  const name = getName() || "Listener";

  useEffect(() => {
    getAllSongs().then(r => setSongs(r.data)).catch(() => {}).finally(() => setLoading(false));
    setPlayCounts(JSON.parse(localStorage.getItem("spotify_play_counts") || "{}"));
  }, []);

  const songsWithPlays = songs.map(s => ({ ...s, plays: playCounts[s.id] || 0 }));
  const topSongs   = [...songsWithPlays].sort((a,b) => b.plays - a.plays).slice(0, 5);
  const artistMap  = {};
  songsWithPlays.forEach(s => { if(s.artist) artistMap[s.artist] = (artistMap[s.artist]||0) + s.plays; });
  const topArtists = Object.entries(artistMap).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const totalPlays = Object.values(playCounts).reduce((a,b)=>a+b,0);
  const totalMins  = Math.round(totalPlays * 3.5);

  const cards = [
    // Card 0 — Intro
    {
      bg: "linear-gradient(135deg, #1DB954 0%, #0a4a1f 100%)",
      content: (
        <div style={cardInner}>
          <p style={label}>Your 2026 in music</p>
          <h1 style={{ fontSize:"3rem", fontWeight:900, lineHeight:1.1, margin:"1rem 0" }}>
            It's been<br/>a great<br/>year,<br/><span style={{color:"#000"}}>{name}.</span>
          </h1>
          <p style={{ fontSize:"1rem", opacity:0.8 }}>Tap to see your stats →</p>
        </div>
      )
    },
    // Card 1 — Minutes
    {
      bg: "linear-gradient(135deg, #450af5 0%, #8e8ee5 100%)",
      content: (
        <div style={cardInner}>
          <p style={label}>This year you listened for</p>
          <h1 style={{ fontSize:"5rem", fontWeight:900, lineHeight:1, margin:"0.5rem 0", color:"#c4efd9" }}>
            {totalMins.toLocaleString()}
          </h1>
          <p style={{ fontSize:"1.5rem", fontWeight:700 }}>minutes of music</p>
          <p style={{ fontSize:"0.9rem", opacity:0.6, marginTop:"1rem" }}>
            That's about {Math.round(totalMins/60)} hours 🎵
          </p>
        </div>
      )
    },
    // Card 2 — Top Song
    {
      bg: "linear-gradient(135deg, #e91e8c 0%, #6b0a3c 100%)",
      content: (
        <div style={cardInner}>
          <p style={label}>Your #1 song</p>
          {topSongs[0] ? (
            <>
              <img src={topSongs[0].imageUrl?.startsWith("http") ? topSongs[0].imageUrl : "https://via.placeholder.com/140/282828/fff?text=♪"}
                alt="" style={{ width:140, height:140, borderRadius:12, objectFit:"cover", margin:"1rem 0", boxShadow:"0 16px 48px rgba(0,0,0,0.5)" }} />
              <h2 style={{ fontSize:"1.6rem", fontWeight:900, textAlign:"center", marginBottom:"0.25rem" }}>{topSongs[0].title}</h2>
              <p style={{ opacity:0.7 }}>{topSongs[0].artist}</p>
              <p style={{ fontSize:"0.9rem", opacity:0.6, marginTop:"0.5rem" }}>Played {topSongs[0].plays} times</p>
            </>
          ) : (
            <p style={{ opacity:0.5, marginTop:"2rem" }}>Start listening to see your top song!</p>
          )}
        </div>
      )
    },
    // Card 3 — Top Artists
    {
      bg: "linear-gradient(135deg, #f59e0b 0%, #7c2d12 100%)",
      content: (
        <div style={cardInner}>
          <p style={label}>Your top artists</p>
          <div style={{ width:"100%", marginTop:"1rem" }}>
            {topArtists.length === 0 ? (
              <p style={{ opacity:0.5 }}>No data yet — start listening!</p>
            ) : topArtists.map(([artist, plays], i) => (
              <div key={artist} style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1rem" }}>
                <span style={{ fontSize:"2rem", fontWeight:900, opacity:0.3, width:32 }}>{i+1}</span>
                <div style={{
                  width:48, height:48, borderRadius:"50%", flexShrink:0,
                  background:`hsl(${i*80},60%,50%)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"1.2rem", fontWeight:800,
                }}>{artist[0]}</div>
                <div>
                  <p style={{ fontWeight:700, fontSize:"1rem" }}>{artist}</p>
                  <p style={{ fontSize:"0.78rem", opacity:0.6 }}>{plays} plays</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // Card 4 — Top 5 Songs
    {
      bg: "linear-gradient(135deg, #0d9488 0%, #042f2e 100%)",
      content: (
        <div style={cardInner}>
          <p style={label}>Your top 5 songs</p>
          <div style={{ width:"100%", marginTop:"0.75rem" }}>
            {topSongs.map((song, i) => (
              <div key={song.id} style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.65rem" }}>
                <span style={{ fontSize:"1.1rem", fontWeight:900, opacity:0.4, width:20 }}>{i+1}</span>
                <img src={song.imageUrl?.startsWith("http") ? song.imageUrl : "https://via.placeholder.com/36/282828/fff?text=♪"}
                  alt="" style={{ width:36, height:36, borderRadius:4, objectFit:"cover", flexShrink:0 }} />
                <div style={{ minWidth:0, flex:1 }}>
                  <p style={{ fontSize:"0.85rem", fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{song.title}</p>
                  <p style={{ fontSize:"0.72rem", opacity:0.6 }}>{song.artist}</p>
                </div>
                <span style={{ fontSize:"0.72rem", opacity:0.5, flexShrink:0 }}>{song.plays}x</span>
              </div>
            ))}
            {topSongs.length === 0 && <p style={{ opacity:0.5 }}>No plays yet!</p>}
          </div>
        </div>
      )
    },
    // Card 5 — Share
    {
      bg: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)",
      content: (
        <div style={cardInner}>
          <svg viewBox="0 0 24 24" fill="#1DB954" width="52" height="52">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <h1 style={{ fontSize:"2rem", fontWeight:900, margin:"1rem 0 0.5rem", textAlign:"center" }}>
            Your Wrapped is ready!
          </h1>
          <p style={{ opacity:0.6, textAlign:"center", fontSize:"0.9rem", marginBottom:"1.5rem" }}>
            {totalMins} mins · {totalPlays} plays · {topArtists.length} artists
          </p>
          <button
            onClick={() => setStep(0)}
            style={{ background:"#1DB954", border:"none", borderRadius:"100px",
              padding:"0.75rem 2rem", color:"#000", fontWeight:800,
              fontSize:"0.95rem", cursor:"pointer", fontFamily:"Montserrat,sans-serif" }}>
            Replay ↺
          </button>
        </div>
      )
    },
  ];

  if (loading) return <div style={{ padding:"3rem", textAlign:"center", opacity:0.4 }}>Loading your stats...</div>;

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"1.5rem", position:"relative" }}>
      {/* Card */}
      <div
        key={step}
        onClick={() => setStep(s => Math.min(s+1, cards.length-1))}
        style={{
          width:"100%", maxWidth:360,
          minHeight:520,
          background: cards[step].bg,
          borderRadius:"1.5rem",
          cursor: step < cards.length-1 ? "pointer" : "default",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"2rem 1.5rem",
          boxShadow:"0 24px 80px rgba(0,0,0,0.6)",
          animation:"cardIn 0.4s cubic-bezier(0.34,1.2,0.64,1)",
          color:"#fff",
          fontFamily:"Montserrat,sans-serif",
          userSelect:"none",
          position:"relative",
          overflow:"hidden",
        }}
      >
        {cards[step].content}
        {step < cards.length-1 && (
          <p style={{ position:"absolute", bottom:"1.25rem", fontSize:"0.72rem", opacity:0.5 }}>
            Tap to continue ({step+1}/{cards.length})
          </p>
        )}
      </div>

      {/* Dots */}
      <div style={{ display:"flex", gap:"6px", marginTop:"1.25rem" }}>
        {cards.map((_,i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            width: i===step ? "20px" : "6px", height:"6px",
            borderRadius:"3px",
            background: i===step ? "#1DB954" : "rgba(255,255,255,0.3)",
            transition:"width 0.3s, background 0.3s",
            cursor:"pointer",
          }} />
        ))}
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform:translateY(24px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

const cardInner = { display:"flex", flexDirection:"column", alignItems:"center", width:"100%", flex:1, justifyContent:"center" };
const label = { fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.15em", opacity:0.7, marginBottom:"0.25rem" };