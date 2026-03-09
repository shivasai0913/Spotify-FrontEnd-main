import "../styles/App.css";

export default function SongCard({ song, onPlay, isPlaying, likedSongs, onToggleLike }) {
  const isLiked = likedSongs?.some((s) => s.id === song.id);

  const imgSrc =
    song.imageUrl?.startsWith("http")
      ? song.imageUrl
      : "https://via.placeholder.com/160x160/282828/fff?text=♪";

  return (
    <div className="card" onClick={() => onPlay(song)}>
      <img
        src={imgSrc}
        alt={song.title}
        className="card-img"
        onError={(e) => { e.target.src = "https://via.placeholder.com/160x160/282828/fff?text=♪"; }}
      />

      <button
        className={`card-play-btn ${isPlaying ? "playing" : ""}`}
        onClick={(e) => { e.stopPropagation(); onPlay(song); }}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      <p className="card-title">{song.title}</p>
      <p className="card-info">{song.artist || ""}</p>
    </div>
  );
}
