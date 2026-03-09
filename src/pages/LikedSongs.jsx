import "../styles/App.css";

function formatTime(sec) {
  if (!sec || isNaN(sec)) return "--:--";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function LikedSongs({ likedSongs, currentSong, onPlay, onUnlike }) {
  const handlePlayAll = () => {
    if (likedSongs.length > 0) onPlay(likedSongs[0]);
  };

  return (
    <div className="liked-page">
      {/* Hero banner */}
      <div className="liked-hero">
        <div className="liked-hero-art">♥</div>
        <div className="liked-hero-info">
          <p className="liked-hero-type">Playlist</p>
          <h1 className="liked-hero-title">Liked Songs</h1>
          <p className="liked-hero-count">{likedSongs.length} song{likedSongs.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="liked-controls">
        <button className="liked-play-btn" onClick={handlePlayAll} title="Play all">
          ▶
        </button>
      </div>

      {/* Songs list */}
      {likedSongs.length === 0 ? (
        <div className="liked-empty">
          <div className="liked-empty-icon">♥</div>
          <h3>Songs you like will appear here</h3>
          <p>Click the ♥ icon on any song while it's playing to save it here!</p>
        </div>
      ) : (
        <div className="songs-table">
          {/* Table header */}
          <div className="songs-table-header">
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span>Duration</span>
          </div>

          {/* Song rows */}
          {likedSongs.map((song, idx) => {
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
                {/* # / playing indicator */}
                <div className={`song-row-num ${isPlaying ? "playing-indicator" : ""}`}>
                  {isPlaying ? "♫" : idx + 1}
                </div>

                {/* Title + artist */}
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

                {/* Album */}
                <div className="song-row-album">{song.album || "—"}</div>

                {/* Duration + unlike btn */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                  <span className="song-row-duration">
                    {formatTime(song.duration)}
                  </span>
                  <button
                    className="song-row-unlike"
                    title="Remove from Liked Songs"
                    onClick={(e) => { e.stopPropagation(); onUnlike(song); }}
                  >
                    ♥
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
