import { useState, useRef, useEffect } from "react";
import {
  FaHouse, FaMagnifyingGlass, FaUpload,
  FaPlus, FaArrowRight, FaEllipsisVertical
} from "react-icons/fa6";
import { FaBars } from "react-icons/fa";
import "../styles/App.css";

function PlaylistMenu({ playlist, onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="pl-menu-wrap" ref={ref}>
      <button className="pl-dots-btn" title="More options"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        <FaEllipsisVertical />
      </button>
      {open && (
        <div className="pl-dropdown">
          <button className="pl-dropdown-item"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onRename(playlist); }}>
            ✏️ Rename
          </button>
          <button className="pl-dropdown-item danger"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(playlist); }}>
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  activePage, setActivePage,
  playlists, likedCount,
  onCreatePlaylist, onRenamePlaylist, onDeletePlaylist,
}) {
  return (
    <div className="sidebar">
      <div className="nav">
        {[
          { key: "home",   icon: <FaHouse />,          label: "Home" },
          { key: "search", icon: <FaMagnifyingGlass />, label: "Search" },
          { key: "upload", icon: <FaUpload />,          label: "Upload Song" },
        ].map(({ key, icon, label }) => (
          <div key={key} className={`navoption ${activePage === key ? "active" : ""}`}
            onClick={() => setActivePage(key)}>
            {icon}<span className="nav-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="library">
        <div className="library-header">
          <div className="navoption" style={{ opacity: 1, padding: "0.4rem 0.25rem", gap: "0.75rem" }}>
            <FaBars style={{ fontSize: "1.1rem" }} />
            <span className="nav-label">Your Library</span>
          </div>
          <div className="lib-icons">
            <FaPlus onClick={onCreatePlaylist} title="Create Playlist" style={{ cursor: "pointer" }} />
            <FaArrowRight style={{ cursor: "pointer" }} />
          </div>
        </div>

        {/* Liked Songs */}
        <div className={`playlist-item ${activePage === "liked" ? "active" : ""}`}
          onClick={() => setActivePage("liked")} style={{ marginBottom: "0.25rem" }}>
          <div className="playlist-thumb liked">♥</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="playlist-name">Liked Songs</p>
            <p className="playlist-meta">Playlist · {likedCount} songs</p>
          </div>
        </div>

        {/* Promo boxes */}
        {playlists.length === 0 && (
          <div className="lib-box" style={{ marginTop: "0.75rem" }}>
            <div className="box">
              <p className="box-p1">Create your first Playlist</p>
              <p className="box-p2">It's easy, we'll help you</p>
              <button className="badge" onClick={onCreatePlaylist}>Create Playlist</button>
            </div>
            <div className="box">
              <p className="box-p1">Let's find some podcasts to follow</p>
              <p className="box-p2">We'll keep you updated on new episodes</p>
              <button className="badge">Browse Podcasts</button>
            </div>
          </div>
        )}

        {/* User playlists — clicking opens the playlist */}
        {playlists.length > 0 && (
          <>
            <p className="playlist-label">Playlists</p>
            {playlists.map((pl, i) => (
              <div key={pl.id ?? i}
                className={`playlist-item ${activePage === `playlist-${pl.id}` ? "active" : ""}`}
                onClick={() => setActivePage(`playlist-${pl.id}`)}>
                <div className="playlist-thumb">♪</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="playlist-name">{pl.name}</p>
                  <p className="playlist-meta">Playlist · {pl.songs?.length ?? 0} songs</p>
                </div>
                <PlaylistMenu playlist={pl} onRename={onRenamePlaylist} onDelete={onDeletePlaylist} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
