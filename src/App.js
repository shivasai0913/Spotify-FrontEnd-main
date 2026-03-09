import { useState, useEffect } from "react";

import Sidebar      from "./components/Sidebar";
import Player       from "./components/Player";
import NowPlaying   from "./components/NowPlaying";
import Home         from "./pages/Home";
import Search       from "./pages/Search";
import UploadSong   from "./pages/UploadSong";
import LikedSongs   from "./pages/LikedSongs";
import PlaylistPage from "./pages/PlaylistPage";

import {
  getAllSongs, getAllPlaylists,
  createPlaylist, deletePlaylist, renamePlaylist, addSongToPlaylist
} from "./services/api";
import "./styles/App.css";

export default function App() {
  const [page, setPage]               = useState("home");
  const [history, setHistory]         = useState(["home"]);
  const [histIdx, setHistIdx]         = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [songs, setSongs]             = useState([]);
  const [playlists, setPlaylists]     = useState([]);
  const [likedSongs, setLikedSongs]   = useState([]);

  useEffect(() => {
    getAllSongs().then((r) => setSongs(r.data)).catch(() => {});
    getAllPlaylists().then((r) => setPlaylists(r.data)).catch(() => {});
  }, []);

  // Auto-show NowPlaying panel when a song starts
  const handleSetCurrentSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setShowNowPlaying(true);
  };

  // ── Navigation ────────────────────────────────────────────────────────
  const navigate = (newPage) => {
    setPage(newPage);
    setHistory((h) => [...h.slice(0, histIdx + 1), newPage]);
    setHistIdx((i) => i + 1);
  };

  const goBack = () => {
    if (histIdx > 0) { setHistIdx((i) => i - 1); setPage(history[histIdx - 1]); }
  };

  const goForward = () => {
    if (histIdx < history.length - 1) { setHistIdx((i) => i + 1); setPage(history[histIdx + 1]); }
  };

  const activePage =
    page === "home"   ? "home"
    : page === "search" ? "search"
    : page === "upload" ? "upload"
    : page === "liked"  ? "liked"
    : typeof page === "object" && page.type === "playlist"
      ? `playlist-${page.id}`
      : "home";

  const setActivePage = (key) => {
    if (["home","search","upload","liked"].includes(key)) { navigate(key); }
    else if (key.startsWith("playlist-")) { navigate({ type: "playlist", id: key.replace("playlist-", "") }); }
  };

  // ── Like ──────────────────────────────────────────────────────────────
  const handleToggleLike = (song) => {
    const already = likedSongs.some((s) => s.id === song.id);
    setLikedSongs((prev) => already ? prev.filter((s) => s.id !== song.id) : [...prev, song]);
  };

  // ── Playlist CRUD ─────────────────────────────────────────────────────
  const handleCreatePlaylist = () => {
    const name = window.prompt("Enter playlist name:");
    if (!name?.trim()) return;
    createPlaylist({ name, description: "", songs: [] })
      .then((r) => setPlaylists((prev) => [...prev, r.data]))
      .catch(() => setPlaylists((prev) => [...prev, { id: Date.now(), name, songs: [] }]));
  };

  const handleRenamePlaylist = (playlist) => {
    const newName = window.prompt("Enter new name:", playlist.name);
    if (!newName?.trim() || newName === playlist.name) return;
    renamePlaylist(playlist.id, { ...playlist, name: newName })
      .then((r) => setPlaylists((prev) => prev.map((pl) => pl.id === playlist.id ? r.data : pl)))
      .catch(() => setPlaylists((prev) => prev.map((pl) => pl.id === playlist.id ? { ...pl, name: newName } : pl)));
  };

  const handleDeletePlaylist = (playlist) => {
    if (!window.confirm(`Delete "${playlist.name}"?`)) return;
    deletePlaylist(playlist.id).catch(() => {});
    setPlaylists((prev) => prev.filter((pl) => pl.id !== playlist.id));
    if (typeof page === "object" && page.type === "playlist" && String(page.id) === String(playlist.id))
      navigate("home");
  };

  const handleAddSong = (playlist, song) => {
    setPlaylists((prev) => prev.map((pl) =>
      pl.id === playlist.id ? { ...pl, songs: [...(pl.songs ?? []), song] } : pl
    ));
    addSongToPlaylist(playlist.id, song.id).catch(() => {});
  };

  const handleRemoveSong = (playlist, song) => {
    setPlaylists((prev) => prev.map((pl) =>
      pl.id === playlist.id ? { ...pl, songs: (pl.songs ?? []).filter((s) => s.id !== song.id) } : pl
    ));
  };

  // ── Page render ───────────────────────────────────────────────────────
  const renderPage = () => {
    if (page === "home")   return <Home   onPlay={handleSetCurrentSong} currentSong={currentSong} likedSongs={likedSongs} onToggleLike={handleToggleLike} />;
    if (page === "search") return <Search onPlay={handleSetCurrentSong} currentSong={currentSong} />;
    if (page === "upload") return <UploadSong onUploaded={() => getAllSongs().then((r) => setSongs(r.data)).catch(() => {})} />;
    if (page === "liked")  return <LikedSongs likedSongs={likedSongs} currentSong={currentSong} onPlay={handleSetCurrentSong} onUnlike={handleToggleLike} />;
    if (typeof page === "object" && page.type === "playlist") {
      const playlist = playlists.find((pl) => String(pl.id) === String(page.id));
      return <PlaylistPage playlist={playlist} allSongs={songs} currentSong={currentSong} onPlay={handleSetCurrentSong} onAddSong={handleAddSong} onRemoveSong={handleRemoveSong} />;
    }
    return <Home onPlay={handleSetCurrentSong} currentSong={currentSong} />;
  };

  return (
    <div className="main">
      {/* Sidebar */}
      <Sidebar
        activePage={activePage} setActivePage={setActivePage}
        playlists={playlists} likedCount={likedSongs.length}
        onCreatePlaylist={handleCreatePlaylist}
        onRenamePlaylist={handleRenamePlaylist}
        onDeletePlaylist={handleDeletePlaylist}
      />

      {/* Main content */}
      <div className="maincontent">
        <div className="sticky-nav">
          <div className="sticky-nav-icons">
            <button className="nav-arrow" onClick={goBack}>‹</button>
            <button className="nav-arrow" onClick={goForward}>›</button>
          </div>
          <div className="sticky-nav-options">
            <button className="badge hide">Explore Premium</button>
            <button className="badge dark-badge">⬇ Install App</button>
            {/* Now Playing toggle button */}
            {currentSong && (
              <button
                className={`now-playing-toggle ${showNowPlaying ? "active" : ""}`}
                onClick={() => setShowNowPlaying(!showNowPlaying)}
                title="Now Playing"
              >
                🎵
              </button>
            )}
            <div className="user-avatar">N</div>
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

      {/* Player */}
      <Player
        song={currentSong}
        songs={songs}
        onSongChange={handleSetCurrentSong}
        likedSongs={likedSongs}
        onToggleLike={handleToggleLike}
        onPlayingChange={setIsPlaying}
      />
    </div>
  );
}
