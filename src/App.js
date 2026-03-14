import { useState, useEffect } from "react";

import ThemeToggle       from "./components/ThemeToggle";
import UserManagement    from "./pages/UserManagement";
import Analytics         from "./pages/Analytics";
import Sidebar           from "./components/Sidebar";
import Player            from "./components/Player";
import NowPlaying        from "./components/NowPlaying";
import BottomNav         from "./components/BottomNav";
import MobileFilterChips from "./components/MobileFilterChips";
import LoginPage         from "./pages/LoginPage";
import { ToastContainer, toast } from "./components/Toast";
import Home              from "./pages/Home";
import Search            from "./pages/Search";
import UploadSong        from "./pages/UploadSong";
import LikedSongs        from "./pages/LikedSongs";
import PlaylistPage      from "./pages/PlaylistPage";
import AdminDashboard    from "./pages/AdminDashboard";
import { useRecentlyPlayed } from "./hooks/useRecentlyPlayed";

import {
  getAllSongs, getAllPlaylists,
  createPlaylist, deletePlaylist, renamePlaylist, addSongToPlaylist
} from "./services/api";
import { isLoggedIn, isAdmin, getName, logout } from "./services/auth";

import "./styles/App.css";
import "./styles/Mobile.css";

export default function App() {
  const [authed,   setAuthed]   = useState(isLoggedIn());
  const [admin,    setAdmin]    = useState(isAdmin());
  const [userName, setUserName] = useState(getName() || "");

  const [page, setPage]               = useState("home");
  const [history, setHistory]         = useState(["home"]);
  const [histIdx, setHistIdx]         = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [songs, setSongs]             = useState([]);
  const [playlists, setPlaylists]     = useState([]);
  const [likedSongs, setLikedSongs]   = useState([]);

  const { recentlyPlayed, addToRecent } = useRecentlyPlayed();

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
    : typeof page === "object" && page.type === "playlist"
      ? `playlist-${page.id}`
      : "home";

  const setActivePage = (key) => {
    if (["home","search","upload","liked","admin","users","analytics"].includes(key)) navigate(key);
    else if (key.startsWith("playlist-")) navigate({ type:"playlist", id: key.replace("playlist-","") });
  };

  const handleToggleLike = (song) => {
    const already = likedSongs.some(s => s.id === song.id);
    setLikedSongs(prev => already ? prev.filter(s => s.id !== song.id) : [...prev, song]);
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

  const handleAddSong = (pl, song) => {
    setPlaylists(prev => prev.map(p => p.id===pl.id ? {...p, songs:[...(p.songs??[]),song]} : p));
    addSongToPlaylist(pl.id, song.id).catch(()=>{});
  };

  const handleRemoveSong = (pl, song) => {
    setPlaylists(prev => prev.map(p => p.id===pl.id ? {...p, songs:(p.songs??[]).filter(s=>s.id!==song.id)} : p));
  };

  const adminOnly = (
    <div style={{padding:"3rem", textAlign:"center", opacity:0.5}}>
      <p style={{fontSize:"2rem", marginBottom:"0.5rem"}}>🔒</p>
      <p style={{fontSize:"1.2rem", fontWeight:700}}>Admin only</p>
      <p style={{fontSize:"0.9rem", marginTop:"0.5rem"}}>You don't have permission to view this page.</p>
    </div>
  );

  const renderPage = () => {
    if (page === "home")      return <Home onPlay={handleSetCurrentSong} currentSong={currentSong} isPlaying={isPlaying} likedSongs={likedSongs} onToggleLike={handleToggleLike} recentlyPlayed={recentlyPlayed} />;
    if (page === "search")    return <Search onPlay={handleSetCurrentSong} currentSong={currentSong} isPlaying={isPlaying} />;
    if (page === "liked")     return <LikedSongs likedSongs={likedSongs} currentSong={currentSong} isPlaying={isPlaying} onPlay={handleSetCurrentSong} onUnlike={handleToggleLike} />;
    if (page === "users")     return admin ? <UserManagement /> : adminOnly;
    if (page === "analytics") return admin ? <Analytics /> : adminOnly;
    if (page === "admin")     return admin ? <AdminDashboard currentSong={currentSong} isPlaying={isPlaying} onPlay={handleSetCurrentSong} /> : adminOnly;
    if (page === "upload")    return admin ? <UploadSong onUploaded={() => getAllSongs().then(r=>setSongs(r.data)).catch(()=>{})} /> : adminOnly;
    if (typeof page === "object" && page.type === "playlist") {
      const playlist = playlists.find(pl => String(pl.id) === String(page.id));
      return <PlaylistPage playlist={playlist} allSongs={songs} currentSong={currentSong} isPlaying={isPlaying} onPlay={handleSetCurrentSong} onAddSong={handleAddSong} onRemoveSong={handleRemoveSong} />;
    }
    return <Home onPlay={handleSetCurrentSong} currentSong={currentSong} isPlaying={isPlaying} likedSongs={likedSongs} onToggleLike={handleToggleLike} recentlyPlayed={recentlyPlayed} />;
  };

  const navBtnStyle = (isActive) => ({
    background:   isActive ? "rgba(29,185,84,0.15)" : "none",
    border:       "1px solid rgba(255,255,255,0.15)",
    color:        "#fff",
    borderRadius: "100px",
    padding:      "0.25rem 0.75rem",
    fontSize:     "0.75rem",
    fontFamily:   "Montserrat,sans-serif",
    fontWeight:   700,
    cursor:       "pointer",
    transition:   "background 0.2s",
  });

  return (
    <div className="main">

      <ToastContainer />

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        playlists={playlists}
        likedCount={likedSongs.length}
        onCreatePlaylist={handleCreatePlaylist}
        onRenamePlaylist={handleRenamePlaylist}
        onDeletePlaylist={handleDeletePlaylist}
        isAdmin={admin}
      />

      <div className="maincontent" style={{ position:"relative" }}>
        <div className="sticky-nav">

          {/* Back / Forward arrows */}
          <div className="sticky-nav-icons">
            <button className="nav-arrow" onClick={goBack}>‹</button>
            <button className="nav-arrow" onClick={goForward}>›</button>
          </div>

          <div className="sticky-nav-options">
            <button className="badge hide">Explore Premium</button>
            <button className="badge dark-badge hide">⬇ Install App</button>

            {/* Now Playing toggle */}
            {currentSong && (
              <button
                className={`now-playing-toggle ${showNowPlaying ? "active" : ""}`}
                onClick={() => setShowNowPlaying(!showNowPlaying)}
                title="Now Playing"
              >🎵</button>
            )}

            {/* Admin buttons */}
            {admin && (
              <div style={{ display:"flex", gap:"0.4rem", alignItems:"center", flexWrap:"wrap" }}>
                <button onClick={() => navigate("admin")}     style={navBtnStyle(page==="admin")}>🎛 Dashboard</button>
                <button onClick={() => navigate("users")}     style={navBtnStyle(page==="users")}>👥 Users</button>
                <button onClick={() => navigate("analytics")} style={navBtnStyle(page==="analytics")}>📊 Analytics</button>
                <span style={{
                  background:"#1DB954", color:"#000",
                  fontSize:"0.7rem", fontWeight:800,
                  padding:"0.2rem 0.6rem", borderRadius:"100px",
                  letterSpacing:"0.05em",
                }}>ADMIN</span>
              </div>
            )}

            {/* Avatar + Theme toggle + Logout */}
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <div className="user-avatar" title={userName}>
                {userName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                style={{
                  background:   "none",
                  border:       "1px solid rgba(255,255,255,0.2)",
                  color:        "rgba(255,255,255,0.7)",
                  borderRadius: "100px",
                  padding:      "0.25rem 0.75rem",
                  fontSize:     "0.75rem",
                  fontFamily:   "Montserrat,sans-serif",
                  fontWeight:   700,
                  cursor:       "pointer",
                }}
              >
                Logout
              </button>
            </div>

            {/* Mobile filter chips */}
            <MobileFilterChips />
          </div>
        </div>

        {renderPage()}
      </div>

      {/* Now Playing panel */}
      {currentSong && showNowPlaying && (
        <NowPlaying
          song={currentSong}
          isPlaying={isPlaying}
          likedSongs={likedSongs}
          onToggleLike={handleToggleLike}
          onClose={() => setShowNowPlaying(false)}
        />
      )}

      {/* Music player bar */}
      <Player
        song={currentSong}
        songs={songs}
        onSongChange={handleSetCurrentSong}
        likedSongs={likedSongs}
        onToggleLike={handleToggleLike}
        onPlayingChange={setIsPlaying}
      />

      {/* Mobile bottom nav */}
      <BottomNav
        activePage={activePage}
        onNavigate={setActivePage}
        isAdmin={admin}
      />

    </div>
  );
}