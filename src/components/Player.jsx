import { useState, useRef, useEffect } from "react";
import {
  FaShuffle, FaBackwardStep, FaForwardStep,
  FaRepeat, FaVolumeHigh, FaVolumeXmark, FaHeart, FaRegHeart
} from "react-icons/fa6";
import "../styles/App.css";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Player({ song, songs, onSongChange, likedSongs, onToggleLike, onPlayingChange }) {
  const audioRef                      = useRef(null);
  const [playing, setPlaying]         = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [volume, setVolume]           = useState(80);
  const [shuffle, setShuffle]         = useState(false);
  const [repeat, setRepeat]           = useState(false);

  const isLiked = likedSongs?.some((s) => s.id === song?.id);

  const setPlay = (val) => { setPlaying(val); onPlayingChange?.(val); };

  useEffect(() => {
    if (song && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
      setPlay(true);
      setCurrentTime(0);
    }
  }, [song]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlay(false); }
    else         { audioRef.current.play();  setPlay(true); }
  };

  const handleNext = () => {
    if (!song || !songs.length) return;
    const idx  = songs.findIndex((s) => s.id === song.id);
    const next = shuffle
      ? songs[Math.floor(Math.random() * songs.length)]
      : songs[(idx + 1) % songs.length];
    onSongChange(next);
  };

  const handlePrev = () => {
    if (!song || !songs.length) return;
    if (currentTime > 3 && audioRef.current) { audioRef.current.currentTime = 0; return; }
    const idx  = songs.findIndex((s) => s.id === song.id);
    const prev = songs[(idx - 1 + songs.length) % songs.length];
    onSongChange(prev);
  };

  const imgSrc = song?.imageUrl?.startsWith("http")
    ? song.imageUrl
    : "https://via.placeholder.com/56x56/282828/fff?text=♪";

  return (
    <div className="musicplayer">
      <div className="album">
        {song ? (
          <>
            <div className="album-thumb">
              <img src={imgSrc} alt={song.title}
                onError={(e) => { e.target.src = "https://via.placeholder.com/56x56/282828/fff?text=♪"; }} />
            </div>
            <div className="album-info">
              <p className="album-title">{song.title}</p>
              <p className="album-artist">{song.artist}</p>
            </div>
            <button
              className={`like-btn ${isLiked ? "liked" : ""}`}
              onClick={() => onToggleLike?.(song)}
              title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
            </button>
          </>
        ) : (
          <p style={{ opacity: 0.3, fontSize: "0.85rem" }}>No song selected</p>
        )}
      </div>

      <div className="player">
        <div className="player-controls">
          <button className={`ctrl-btn ${shuffle ? "active" : ""}`} onClick={() => setShuffle(!shuffle)}><FaShuffle /></button>
          <button className="ctrl-btn" onClick={handlePrev}><FaBackwardStep /></button>
          <button className="play-pause-btn" onClick={handlePlayPause}>{playing ? "⏸" : "▶"}</button>
          <button className="ctrl-btn" onClick={handleNext}><FaForwardStep /></button>
          <button className={`ctrl-btn ${repeat ? "active" : ""}`} onClick={() => setRepeat(!repeat)}><FaRepeat /></button>
        </div>
        <div className="play-bar">
          <span className="curr-time">{formatTime(currentTime)}</span>
          <div className="progress-wrap">
            <input type="range" min={0} max={duration || 100} value={currentTime} step={0.1}
              onChange={(e) => { const v = Number(e.target.value); if (audioRef.current) audioRef.current.currentTime = v; setCurrentTime(v); }}
              className="progress-bar" />
          </div>
          <span className="tot-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="controls">
        <button className="ctrl-btn" style={{ fontSize: "1rem" }} onClick={() => { const v = volume === 0 ? 80 : 0; setVolume(v); if (audioRef.current) audioRef.current.volume = v / 100; }}>
          {volume === 0 ? <FaVolumeXmark /> : <FaVolumeHigh />}
        </button>
        <input type="range" min={0} max={100} value={volume} className="volume-bar"
          onChange={(e) => { const v = Number(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v / 100; }} />
      </div>

      {song && (
        <audio ref={audioRef} src={song.audioUrl}
          onTimeUpdate={() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); }}
          onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration); }}
          onEnded={handleNext}
          loop={repeat}
        />
      )}
    </div>
  );
}
