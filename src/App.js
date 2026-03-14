import { useState, useEffect, useRef } from "react";

import ThemeToggle           from "./components/ThemeToggle";
import UserManagement        from "./pages/UserManagement";
import Analytics             from "./pages/Analytics";
import Sidebar               from "./components/Sidebar";
import Player                from "./components/Player";
import NowPlaying            from "./components/NowPlaying";
import BottomNav             from "./components/BottomNav";
import MobileFilterChips     from "./components/MobileFilterChips";
import LoginPage             from "./pages/LoginPage";
import { ToastContainer, toast } from "./components/Toast";
import Home                  from "./pages/Home";
import Search                from "./pages/Search";
import UploadSong            from "./pages/UploadSong";
import LikedSongs            from "./pages/LikedSongs";
import PlaylistPage          from "./pages/PlaylistPage";
import AdminDashboard        from "./pages/AdminDashboard";
import SpotifyWrapped        from "./pages/SpotifyWrapped";
import { useRecentlyPlayed } from "./hooks/useRecentlyPlayed";

// ── Stunning components ───────────────────────────────────────────────────
import SplashScreen          from "./components/SplashScreen";
import PageTransition        from "./components/PageTransition";
import { ConfettiCanvas, triggerConfetti } from "./components/Confetti";
import AnimatedBackground    from "./components/AnimatedBackground";

// ── New feature components ────────────────────────────────────────────────
import FloatingNowPlaying    from "./components/FloatingNowPlaying";
import QueuePanel, { useQueue } from "./components/SongQueue";
import SleepTimer            from "./components/SleepTimer";
import KeyboardShortcuts     from "./components/KeyboardShortcuts";

import {
  getAllSongs, getAllPlaylists,
  createPlaylist, deletePlaylist, renamePlaylist, addSongToPlaylist
} from "./services/api";
import { isLoggedIn, isAdmin, getName, logout } from "./services/auth";

import "./styles/App.css";
import "./styles/Mobile.css";
import "./styles/Stunning.css";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [authed,     setAuthed]     = useState(isLoggedIn());
  const [admin,      setAdmin]      = useState(isAdmin());
  const [userName,   setUserName]   = useState(getName() || "");

  const [page, setPage]               = useState("home");
  const [history, setHistory]         = useState(["home"]);
  const [histIdx, setHistIdx]         = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [showQueue, setShowQueue]     = useState(false);
  const [songs, setSongs]             = useState([]);
  const [playlists, setPlaylists]     = useState([]);
  const [likedSongs, setLikedSongs]   = useState([]);

  // ── Feature hooks ─────────────────────────────────────────────────────
  const { recentlyPlayed, addToRecent }                   = useRecentlyPlayed();
  const { queue, addToQueue, removeFromQueue, clearQueue,
          moveUp, moveDown }                              = useQueue();

  // Ref to Player for keyboard shortcuts
  const playerRef = useRef(null);

  useEffect(() => {
    if (!authed) return;
    getAllSongs().then(r => setSongs(r.data)).catch(() => toast("Failed to load songs", "error"));
    getAllPlaylists().then(r => setPlaylists(r.data)).catch(() => {});
  }, [authed]);

  const handleLoginSuccess = (data) => {
    setAuthed(true);
    setAdmin(data.role === "ADMIN");
    setUserName(data.name);
    toast(`Welcome back, ${data.name}! 👋`, "success");
  };

  const handleLogout = () => {
    logout();
    setAuthed(false); setAdmin(false); setUserName("");
    setCurrentSong(null); setSongs([]); setPlaylists([]);
    setPage("home");
  };

  // ── Splash screen ──────────────────────────────────────────────────────
  if (showSplash) return (
    <>
      <ToastContainer />
      <SplashScreen onComplete={() => setShowSplash(false)} />
    </>
  );

  if (!authed) return (
    <>
      <ToastContainer />
      <LoginPage onLoginSuccess={handleLoginSuccess} />
    </>
  );

  const handleSetCurrentSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setShowNowPlaying(true);
    addToRecent(song);
  };

  const navigate = (newPage) => {
    setPage(newPage);
    setHistory(h => [...h.slice(0, histIdx + 1), newPage]);
    setHistIdx(i => i + 1);
  };

  const goBack    = () => { if (histIdx > 0) { setHistIdx(i=>i-1); setPage(history[histIdx-1]); } };
  const goForward = () => { if (histIdx < history.length-1) { setHistIdx(i=>i+1); setPage(history[histIdx+1]); } };

  const activePage =
    page === "home"        ? "home"
    : page === "search"    ? "search"
    : page === "upload"    ? "upload"
    : page === "liked"     ? "liked"
    : page === "admin"     ? "admin"
    : page === "users"     ? "users"
    : page === "analytics" ? "analytics"
    : page === "wrapped"   ? "wrapped"
    : typeof page === "object" && page.type === "playlist"
      ? `playlist-${page.id}`
      : "home";

  const setActivePage = (key) => {
    if (["home","search","upload","liked","admin","users","analytics","wrapped"].includes(key)) navigate(key);
    else if (key.startsWith("playlist-")) navigate({ type:"playlist", id: key.replace("playlist-","") });
  };

  // ── Like with confetti ────────────────────────────────────────────────
  const handleToggleLike = (song) => {
    const already = likedSongs.some(s => s.id === song.id);
    setLikedSongs(prev => already ? prev.filter(s => s.id !== song.id) : [...prev, song]);
    if (!already) triggerConfetti();
    toast(already ? "Removed from Liked Songs" : "Added to Liked Songs 💚", already ? "info" : "success");
  };

  const handleCreatePlaylist = () => {
    const name = window.prompt("Enter playlist name:");
    if (!name?.trim()) return;
    createPlaylist({ name, description:"", songs:[] })
      .then(r => { setPlaylists(prev => [...prev, r.data]); toast(`Playlist "${name}" created!`, "success"); })
      .catch(() => setPlaylists(prev => [...prev, { id:Date.now(), name, songs:[] }]));
  };

  const handleRenamePlaylist = (playlist) => {
    const newName = window.prompt("Enter new name:", playlist.name);
    if (!newName?.trim() || newName === playlist.name) return;
    renamePlaylist(playlist.id, { ...playlist, name:newName })
      .then(r => setPlaylists(prev => prev.map(pl => pl.id === playlist.id ? r.data : pl)))
      .catch(() => setPlaylists(prev => prev.map(pl => pl.id === playlist.id ? {...pl, name:newName} : pl)));
  };

  const handleDeletePlaylist = (playlist) => {
    if (!window.confirm(`Delete "${playlist.name}"?`)) return;
    deletePlaylist(playlist.id).catch(() => {});
    setPlaylists(prev => prev.filter(pl => pl.id !== playlist.id));
    toast(`Playlist "${playlist.name}" deleted`, "info");
    if (typeof page === "object" && page.type === "playlist" && String(page.id) === String(playlist.id))
      navigate("home");
  };

  const handleAddSong    = (pl, song) => { setPlaylists(prev => prev.map(p => p.id===pl.id ? {...p, songs:[...(p.songs??[]),song]} : p)); addSongToPlaylist(pl.id, song.id).catch(()=>{}); };
  const handleRemoveSong = (pl, song) => { setPlaylists(prev => prev.map(p => p.id===pl.id ? {...p, songs:(p.songs??[]).filter(s=>s.id!==song.id)} : p)); };

  // ── Keyboard shortcut handlers ────────────────────────────────────────
  const handlePlayPause  = () => playerRef.current?.handlePlayPause?.();
  const handleNext       = () => playerRef.current?.handleNext?.();
  const handlePrev       = () => playerRef.current?.handlePrev?.();
  const handleVolumeUp   = () => playerRef.current?.handleVolumeUp?.();
  const handleVolumeDown = () => playerRef.current?.handleVolumeDown?.();

  const adminOnly = (
    <div style={{padding:"3rem", textAlign:"center", opacity:0.5}}>
      <p style={{fontSize:"2rem", marginBottom:"0.5rem"}}>🔒</p>
      <p style={{fontSize:"1.2rem", fontWeight:700}}>Admin only</p>
    </div>
  );

  const renderPage = () => {
    if (page === "home")      return <Home onPlay={handleSetCurrentSong} currentSong={currentSong} isPlaying={isPlaying} likedSongs={likedSongs} onToggleLike={handleToggleLike} recentlyPlayed={recentlyPlayed} onAddToQueue={addToQueue} />;
    if (page === "search")    return <Search onPlay={handleSetCurrentSong} currentSong={currentSong} isPlaying={isPlaying} onAddToQueue={addToQueue} />;
    if (page === "liked")     return <LikedSongs likedSongs={likedSongs} currentSong={currentSong} isPlaying={isPlaying} onPlay={handleSetCurrentSong} onUnlike={handleToggleLike} />;
    if (page === "wrapped")   return <SpotifyWrapped />;
    if (page === "users")     return admin ? <UserManagement /> : adminOnly;
    if (page === "analytics") return admin ? <Analytics /> : adminOnly;
    if (page === "admin")     return admin ? <AdminDashboard currentSong={currentSong} isPlaying={isPlaying} onPlay={handleSetCurrentSong} /> : adminOnly;
    if (page === "upload")    return admin ? <UploadSong onUploaded={() => getAllSongs().then(r=>setSongs(r.data)).catch(()=>{})} /> : adminOnly;
    if (typeof page === "object" && page.type === "playlist") {
      const playlist = playlists.find(pl => String(pl.id) === String(page.id));
      return <PlaylistPage playlist={playlist} allSongs={songs} currentSong={currentSong} isPlaying={isPlaying} onPlay={handleSetCurrentSong} onAddSong={handleAddSong} onRemoveSong={handleRemoveSong} />;
    }
    return <Home onPlay={handleSetCurrentSong} currentSong={currentSong} isPlaying={isPlaying} likedSongs={likedSongs} onToggleLike={handleToggleLike} recentlyPlayed={recentlyPlayed} onAddToQueue={addToQueue} />;
  };

  const navBtnStyle = (isActive) => ({
    background:     isActive ? "rgba(29,185,84,0.15)" : "rgba(255,255,255,0.04)",
    border:         "1px solid rgba(255,255,255,0.12)",
    color:          "#fff",
    borderRadius:   "100px",
    padding:        "0.25rem 0.75rem",
    fontSize:       "0.75rem",
    fontFamily:     "Montserrat,sans-serif",
    fontWeight:     700,
    cursor:         "pointer",
    transition:     "background 0.2s",
    backdropFilter: "blur(8px)",
  });

  return (
    <div className="main" style={{ position:"relative" }}>

      {/* Animated gradient background */}
      <AnimatedBackground isPlaying={isPlaying} />

      {/* Confetti canvas */}
      <ConfettiCanvas />

      {/* Global toast */}
      <ToastContainer />

      {/* Global keyboard shortcuts */}
      <KeyboardShortcuts
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onVolumeUp={handleVolumeUp}
        onVolumeDown={handleVolumeDown}
      />

      <Sidebar
        activePage={activePage} setActivePage={setActivePage}
        playlists={playlists} likedCount={likedSongs.length}
        onCreatePlaylist={handleCreatePlaylist}
        onRenamePlaylist={handleRenamePlaylist}
        onDeletePlaylist={handleDeletePlaylist}
        isAdmin={admin}
      />

      <div className="maincontent" style={{ position:"relative", zIndex:1 }}>
        <div className="sticky-nav">
          <div className="sticky-nav-icons">
            <button className="nav-arrow" onClick={goBack}>‹</button>
            <button className="nav-arrow" onClick={goForward}>›</button>
          </div>

          <div className="sticky-nav-options">
            <button className="badge hide">Explore Premium</button>
            <button className="badge dark-badge hide">⬇ Install App</button>

            {currentSong && (
              <button className={`now-playing-toggle ${showNowPlaying?"active":""}`}
                onClick={() => setShowNowPlaying(!showNowPlaying)}>🎵</button>
            )}

            {/* Queue button */}
            {currentSong && (
              <button onClick={() => setShowQueue(q => !q)} style={{
                ...navBtnStyle(showQueue),
                fontSize:"0.8rem",
              }}>≡ Queue {queue.length > 0 && `(${queue.length})`}</button>
            )}

            {/* Wrapped button */}
            <button onClick={() => navigate("wrapped")} style={navBtnStyle(page==="wrapped")}>
              🎊 Wrapped
            </button>

            {admin && (
              <div style={{ display:"flex", gap:"0.4rem", alignItems:"center", flexWrap:"wrap" }}>
                <button onClick={() => navigate("admin")}     style={navBtnStyle(page==="admin")}>🎛 Dashboard</button>
                <button onClick={() => navigate("users")}     style={navBtnStyle(page==="users")}>👥 Users</button>
                <button onClick={() => navigate("analytics")} style={navBtnStyle(page==="analytics")}>📊 Analytics</button>
                <span style={{background:"#1DB954",color:"#000",fontSize:"0.7rem",fontWeight:800,padding:"0.2rem 0.6rem",borderRadius:"100px",letterSpacing:"0.05em"}}>
                  ADMIN
                </span>
              </div>
            )}

            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
              {/* Sleep timer */}
              <SleepTimer onStop={() => { playerRef.current?.pause?.(); setIsPlaying(false); }} />
              <div className="user-avatar" title={userName}>{userName?.charAt(0)?.toUpperCase()||"U"}</div>
              <ThemeToggle />
              <button onClick={handleLogout} style={{
                background:"rgba(255,255,255,0.05)", backdropFilter:"blur(8px)",
                border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.8)",
                borderRadius:"100px", padding:"0.25rem 0.75rem",
                fontSize:"0.75rem", fontFamily:"Montserrat,sans-serif", fontWeight:700, cursor:"pointer",
              }}>Logout</button>
            </div>

            <MobileFilterChips />
          </div>
        </div>

        {/* Page with transition */}
        <PageTransition pageKey={typeof page === "object" ? `playlist-${page.id}` : page}>
          {renderPage()}
        </PageTransition>
      </div>

      {/* Now Playing panel */}
      {currentSong && showNowPlaying && (
        <NowPlaying song={currentSong} isPlaying={isPlaying} likedSongs={likedSongs}
          onToggleLike={handleToggleLike} onClose={() => setShowNowPlaying(false)} />
      )}

      {/* Queue panel */}
      {showQueue && (
        <QueuePanel
          queue={queue}
          currentSong={currentSong}
          onRemove={removeFromQueue}
          onClear={clearQueue}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
          onClose={() => setShowQueue(false)}
        />
      )}

      {/* Floating Now Playing widget — shows on non-home pages */}
      <FloatingNowPlaying
        song={currentSong}
        isPlaying={isPlaying}
        likedSongs={likedSongs}
        onToggleLike={handleToggleLike}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        currentPage={activePage}
      />

      {/* Player */}
      <Player
        ref={playerRef}
        song={currentSong}
        songs={songs}
        onSongChange={handleSetCurrentSong}
        likedSongs={likedSongs}
        onToggleLike={handleToggleLike}
        onPlayingChange={setIsPlaying}
      />

      {/* Mobile bottom nav */}
      <BottomNav activePage={activePage} onNavigate={setActivePage} isAdmin={admin} />

    </div>
  );
}