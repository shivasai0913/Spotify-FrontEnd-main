import "../styles/App.css";

function formatTime(sec) {
  if (!sec || isNaN(sec)) return "--:--";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Random gradient per playlist (based on id)
const GRADIENTS = [
  "linear-gradient(135deg, #1a6b3a, #1DB954)",
  "linear-gradient(135deg, #2d46b9, #5b8bf5)",
  "linear-gradient(135deg, #8b1a1a, #e05252)",
  "linear-gradient(135deg, #6b2fa0, #b36be0)",
  "linear-gradient(135deg, #a05a00, #f0a030)",
  "linear-gradient(135deg, #006b6b, #30d0d0)",
  "linear-gradient(135deg, #3a3a3a, #888)",
];

export default function PlaylistPage({
  playlist,
  allSongs,
  currentSong,
  onPlay,
  onAddSong,
  onRemoveSong,
}) {
  if (!playlist) {
    return (
      <div style={{ padding: "2rem", opacity: 0.5 }}>
        Playlist not found.
      </div>
    );
  }

  const gradient = GRADIENTS[(playlist.id ?? 0) % GRADIENTS.length];
  const playlistSongs = playlist.songs ?? [];

  // Songs NOT already in playlist (available to add)
  const availableToAdd = allSongs.filter(
    (s) => !playlistSongs.some((ps) => ps.id === s.id)
  );

  const handlePlayAll = () => {
    if (playlistSongs.length > 0) onPlay(playlistSongs[0]);
  };

  return (
    <div className="liked-page">

      {/* Hero */}
      <div className="liked-hero" style={{ background: gradient }}>
        <div className="liked-hero-art" style={{ background: gradient, fontSize: "2.5rem" }}>
          ♪
        </div>
        <div className="liked-hero-info">
          <p className="liked-hero-type">Playlist</p>
          <h1 className="liked-hero-title">{playlist.name}</h1>
          <p className="liked-hero-count">
            {playlistSongs.length} song{playlistSongs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="liked-controls">
        {playlistSongs.length > 0 && (
          <button className="liked-play-btn" onClick={handlePlayAll} title="Play all">
            ▶
          </button>
        )}
      </div>

      {/* Song rows */}
      {playlistSongs.length === 0 ? (
        <div className="liked-empty">
          <div className="liked-empty-icon">♪</div>
          <h3>This playlist is empty</h3>
          <p>Add songs from the list below!</p>
        </div>
      ) : (
        <div className="songs-table">
          <div className="songs-table-header">
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span>Duration</span>
          </div>

          {playlistSongs.map((song, idx) => {
            const isPlaying = currentSong?.id === song.id;
            const imgSrc = song.imageUrl?.startsWith("http")
              ? song.imageUrl
              : "https://via.placeholder.com/42x42/282828/fff?text=♪";

            return (
              <div
                key={song.id}
                className={`song-row ${isPlaying ? "playing" : ""}`}
                onClick={() => onPlay(song)}
              >
                <div className={`song-row-num ${isPlaying ? "playing-indicator" : ""}`}>
                  {isPlaying ? "♫" : idx + 1}
                </div>

                <div className="song-row-info">
                  <img
                    src={imgSrc}
                    alt={song.title}
                    className="song-row-thumb"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/42x42/282828/fff?text=♪"; }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p className="song-row-title">{song.title}</p>
                    <p className="song-row-artist">{song.artist}</p>
                  </div>
                </div>

                <div className="song-row-album">{song.album || "—"}</div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                  <span className="song-row-duration">{formatTime(song.duration)}</span>
                  {onRemoveSong && (
                    <button
                      className="song-row-unlike"
                      title="Remove from playlist"
                      style={{ color: "#ff6b6b" }}
                      onClick={(e) => { e.stopPropagation(); onRemoveSong(playlist, song); }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add songs section */}
      {availableToAdd.length > 0 && (
        <div style={{ padding: "0 1.5rem 2rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "1rem 0 0.75rem", opacity: 0.7 }}>
            Add songs to this playlist
          </h3>
          {availableToAdd.map((song) => {
            const imgSrc = song.imageUrl?.startsWith("http")
              ? song.imageUrl
              : "https://via.placeholder.com/42x42/282828/fff?text=♪";
            return (
              <div
                key={song.id}
                className="song-row"
                style={{ opacity: 0.75 }}
              >
                <div className="song-row-num" style={{ color: "#1DB954" }}>+</div>
                <div className="song-row-info">
                  <img src={imgSrc} alt={song.title} className="song-row-thumb"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/42x42/282828/fff?text=♪"; }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p className="song-row-title">{song.title}</p>
                    <p className="song-row-artist">{song.artist}</p>
                  </div>
                </div>
                <div className="song-row-album">{song.album || "—"}</div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => onAddSong(playlist, song)}
                    style={{
                      background: "none", border: "1px solid #1DB954",
                      color: "#1DB954", borderRadius: "100px",
                      padding: "0.3rem 0.9rem", fontSize: "0.78rem",
                      fontWeight: 700, cursor: "pointer",
                      fontFamily: "Montserrat, sans-serif",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) => { e.target.style.background = "rgba(29,185,84,0.15)"; }}
                    onMouseOut={(e) => { e.target.style.background = "none"; }}
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
