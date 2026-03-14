import { useState, useRef, useEffect } from "react";
import {
  FaShuffle, FaBackwardStep, FaForwardStep,
  FaRepeat, FaVolumeHigh, FaVolumeXmark, FaHeart, FaRegHeart
} from "react-icons/fa6";
import MobileFullPlayer from "./MobileFullPlayer";
import SongVisualizer   from "./SongVisualizer";
import "../styles/App.css";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Track play counts in localStorage
function incrementPlayCount(songId) {
  if (!songId) return;
  const counts = JSON.parse(localStorage.getItem("spotify_play_counts") || "{}");
  counts[songId] = (counts[songId] || 0) + 1;
  localStorage.setItem("spotify_play_counts", JSON.stringify(counts));
}

export default function Player({ song, songs, onSongChange, likedSongs, onToggleLike, onPlayingChange }) {
  const audioRef                      = useRef(null);
  const [playing, setPlaying]         = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [volume, setVolume]           = useState(80);
  const [shuffle, setShuffle]         = useState(false);
  const [repeat, setRepeat]           = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(true);
  const countedRef = useRef(null); // track which song we already counted

  const isLiked = likedSongs?.some((s) => s.id === song?.id);

  const setPlay = (val) => { setPlaying(val); onPlayingChange?.(val); };

useEffect(() => {
  if (song && audioRef.current) {
    audioRef.current.load();
    // Resume any suspended audio context first
    if (window.AudioContext || window.webkitAudioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
    }
    audioRef.current.play().catch((err) => {
      console.warn("Autoplay blocked:", err);
    });
    setPlay(true);
    setCurrentTime(0);
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSeek = (val) => {
    if (audioRef.current) audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  // Count play after 30 seconds of listening
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);
    if (song && t > 30 && countedRef.current !== song.id) {
      countedRef.current = song.id;
      incrementPlayCount(song.id);
    }
  };

  const imgSrc = song?.imageUrl?.startsWith("http")
    ? song.imageUrl
    : "https://via.placeholder.com/56x56/282828/fff?text=♪";

  const isMobile = () => window.innerWidth <= 700;

  return (
    <>
      <div className="musicplayer">

        {/* Album — tap on mobile to open full player */}
        <div
          className="album"
          onClick={() => { if (song && isMobile()) setShowFullPlayer(true); }}
          style={{ cursor: song ? "pointer" : "default" }}
        >
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
                onClick={(e) => { e.stopPropagation(); onToggleLike?.(song); }}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
              </button>
            </>
          ) : (
            <p style={{ opacity: 0.3, fontSize: "0.85rem" }}>No song selected</p>
          )}
        </div>

        {/* Player controls + visualizer */}
        <div className="player">
          {/* Visualizer bar — click to toggle */}
          {song && showVisualizer && (
            <div
              style={{ width:"100%", cursor:"pointer", marginBottom:"2px" }}
              title="Click to hide visualizer"
              onClick={() => setShowVisualizer(false)}
            >
              <SongVisualizer
                audioEl={audioRef.current}
                isPlaying={playing}
                barCount={50}
                height={36}
                color="#1DB954"
              />
            </div>
          )}
          {song && !showVisualizer && (
            <div className="play-bar">
              <span className="curr-time">{formatTime(currentTime)}</span>
              <div className="progress-wrap">
                <input type="range" min={0} max={duration || 100} value={currentTime} step={0.1}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="progress-bar" />
              </div>
              <span className="tot-time">{formatTime(duration)}</span>
            </div>
          )}
          {!song && (
            <div className="play-bar">
              <span className="curr-time">{formatTime(currentTime)}</span>
              <div className="progress-wrap">
                <input type="range" min={0} max={100} value={0} className="progress-bar" readOnly />
              </div>
              <span className="tot-time">00:00</span>
            </div>
          )}

          <div className="player-controls">
            <button className={`ctrl-btn ${shuffle ? "active" : ""}`} onClick={() => setShuffle(!shuffle)}><FaShuffle /></button>
            <button className="ctrl-btn" onClick={handlePrev}><FaBackwardStep /></button>
            <button className="play-pause-btn" onClick={handlePlayPause}>{playing ? "⏸" : "▶"}</button>
            <button className="ctrl-btn" onClick={handleNext}><FaForwardStep /></button>
            <button className={`ctrl-btn ${repeat ? "active" : ""}`} onClick={() => setRepeat(!repeat)}><FaRepeat /></button>
            {/* Toggle visualizer button */}
            {song && (
              <button className="ctrl-btn" onClick={() => setShowVisualizer(v => !v)} title="Toggle visualizer"
                style={{ fontSize:"0.8rem", opacity: showVisualizer ? 1 : 0.4 }}>
                〰
              </button>
            )}
          </div>
        </div>

        {/* Volume */}
        <div className="controls">
          <button className="ctrl-btn" style={{ fontSize: "1rem" }}
            onClick={() => { const v = volume === 0 ? 80 : 0; setVolume(v); if (audioRef.current) audioRef.current.volume = v / 100; }}>
            {volume === 0 ? <FaVolumeXmark /> : <FaVolumeHigh />}
          </button>
          <input type="range" min={0} max={100} value={volume} className="volume-bar"
            onChange={(e) => { const v = Number(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v / 100; }} />
        </div>

        {song && (
          <audio ref={audioRef} src={song.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration); }}
            onEnded={handleNext}
            loop={repeat}
          />
        )}
      </div>

      {/* Mobile full screen player */}
      {showFullPlayer && song && (
        <MobileFullPlayer
          song={song} isPlaying={playing}
          likedSongs={likedSongs} onToggleLike={onToggleLike}
          onClose={() => setShowFullPlayer(false)}
          onNext={handleNext} onPrev={handlePrev} onPlayPause={handlePlayPause}
          currentTime={currentTime} duration={duration} onSeek={handleSeek}
          shuffle={shuffle} onShuffle={() => setShuffle(!shuffle)}
          repeat={repeat}   onRepeat={() => setRepeat(!repeat)}
        />
      )}
    </>
  );
}