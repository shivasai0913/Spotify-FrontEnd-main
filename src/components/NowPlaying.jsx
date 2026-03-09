import { useState } from "react";
import { FaHeart, FaRegHeart, FaEllipsis, FaXmark } from "react-icons/fa6";
import "../styles/App.css";

export default function NowPlaying({ song, isPlaying, likedSongs, onToggleLike, onClose }) {
  const [tab, setTab] = useState("about"); // "about" | "lyrics"

  if (!song) return null;

  const isLiked = likedSongs?.some((s) => s.id === song.id);

  const imgSrc = song.imageUrl?.startsWith("http")
    ? song.imageUrl
    : null;

  // Pull a dominant gradient from the image or fall back to a nice default
  const gradient = "linear-gradient(180deg, #1a3a4a 0%, #121212 60%)";

  return (
    <div className="now-playing-panel">

      {/* Header */}
      <div className="np-header">
        <span className="np-header-title" title={song.title}>
          {song.title}
        </span>
        <button className="np-close-btn" onClick={onClose} title="Close">
          <FaXmark />
        </button>
      </div>

      {/* Album art */}
      <div className="np-art-wrap" style={{ background: gradient }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={song.title}
            className="np-art"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="np-art-placeholder">♪</div>
        )}
      </div>

      {/* Song info + actions */}
      <div className="np-info-row">
        <div className="np-info">
          <p className="np-title">{song.title}</p>
          <p className="np-artist">{song.artist || "Unknown Artist"}</p>
        </div>
        <div className="np-actions">
          <button
            className={`np-like-btn ${isLiked ? "liked" : ""}`}
            onClick={() => onToggleLike && onToggleLike(song)}
            title={isLiked ? "Remove from Liked" : "Save to Liked Songs"}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
          </button>
          <button className="np-like-btn" title="More options">
            <FaEllipsis />
          </button>
        </div>
      </div>

      {/* Now playing indicator */}
      {isPlaying && (
        <div className="np-playing-bar">
          <div className="np-bar b1" />
          <div className="np-bar b2" />
          <div className="np-bar b3" />
          <div className="np-bar b4" />
          <span className="np-playing-text">Now Playing</span>
        </div>
      )}

      {/* Tabs */}
      <div className="np-tabs">
        <button
          className={`np-tab ${tab === "about" ? "active" : ""}`}
          onClick={() => setTab("about")}
        >
          About
        </button>
        <button
          className={`np-tab ${tab === "lyrics" ? "active" : ""}`}
          onClick={() => setTab("lyrics")}
        >
          Lyrics
        </button>
      </div>

      {/* Tab content */}
      <div className="np-tab-content">
        {tab === "about" && (
          <div className="np-about">
            <div className="np-about-row">
              <span className="np-about-label">Artist</span>
              <span className="np-about-value">{song.artist || "—"}</span>
            </div>
            <div className="np-about-row">
              <span className="np-about-label">Album</span>
              <span className="np-about-value">{song.album || "—"}</span>
            </div>
            <div className="np-about-row">
              <span className="np-about-label">Genre</span>
              <span className="np-about-value">{song.genre || "—"}</span>
            </div>
          </div>
        )}

        {tab === "lyrics" && (
          <div className="np-lyrics">
            <p className="np-lyrics-placeholder">
              🎵 Lyrics not available.<br />
              <span style={{ opacity: 0.4, fontSize: "0.8rem" }}>
                Enjoy the music!
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
