import { useEffect, useState } from "react";
import { getAllSongs } from "../services/api";
import SongCard from "../components/SongCard";
import "../styles/App.css";

// Static chart cards matching your original HTML
const CHART_CARDS = [
  { id: "c1", title: "Top 50 - Global",   info: "Daily update of most played tracks", img: "/images/card1img.jpeg" },
  { id: "c2", title: "Top Songs - Global", info: "Weekly Music Charts",                img: "/images/card2img.jpeg" },
  { id: "c3", title: "Top Songs - India",  info: "Weekly Music Charts",                img: "/images/card3img.jpeg" },
];

// Recently played row — using your uploaded images
const RECENT_CARDS = [
  { id: "r1", title: "Top 50 - Global", info: "Your daily update of most played tracks", img: "/images/card1img.jpeg" },
  { id: "r2", title: "New Releases",    info: "Fresh drops just for you",                 img: "/images/card2img.jpeg" },
  { id: "r3", title: "Chill Vibes",     info: "Relax and unwind",                         img: "/images/card3img.jpeg" },
];

export default function Home({ onPlay, currentSong }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSongs()
      .then((res) => setSongs(res.data))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ── Recently Played ── */}
      <h2 className="section-title">Recently Played</h2>
      <div className="cards-container">
        {RECENT_CARDS.map((item) => (
          <div key={item.id} className="recent-card">
            <img
              src={item.img}
              alt={item.title}
              className="recent-img"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/56x56/282828/fff?text=♪";
              }}
            />
            <div>
              <p className="recent-title">{item.title}</p>
              <p className="recent-info">{item.info}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Trending Now Near You (from backend) ── */}
      <h2 className="section-title">Trending Now Near You</h2>
      {loading ? (
        <p style={{ padding: "0 1.5rem", opacity: 0.5, fontSize: "0.9rem" }}>
          Loading songs...
        </p>
      ) : songs.length === 0 ? (
        <p style={{ padding: "0 1.5rem", opacity: 0.5, fontSize: "0.9rem" }}>
          No songs yet — upload your first song!
        </p>
      ) : (
        <div className="cards-container">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onPlay={onPlay}
              isPlaying={currentSong?.id === song.id}
            />
          ))}
        </div>
      )}

      {/* ── Featured Charts (static) ── */}
      <h2 className="section-title">Featured Charts</h2>
      <div className="cards-container">
        {CHART_CARDS.map((item) => (
          <div key={item.id} className="card">
            <img
              src={item.img}
              alt={item.title}
              className="card-img"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/160x160/282828/fff?text=♪";
              }}
            />
            <p className="card-title">{item.title}</p>
            <p className="card-info">{item.info}</p>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="footer">
        <div className="line" />
      </div>
    </div>
  );
}
