import { useState } from "react";
import { searchSongs } from "../services/api";
import SongCard from "../components/SongCard";
import SearchBar from "../components/SearchBar";
import "../styles/App.css";

const CATEGORIES = [
  "Pop", "Hip-Hop", "Bollywood", "Telugu", "Tamil",
  "Lo-fi", "Rock", "Jazz", "Charts", "Podcasts",
];

export default function Search({ onPlay, currentSong }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (val) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    searchSongs(val)
      .then((res) => {
        setResults(res.data);
        setSearched(true);
      })
      .catch(() => {
        setResults([]);
        setSearched(true);
      });
  };

  return (
    <div className="search-page">
      <SearchBar value={query} onChange={handleSearch} />

      {/* Results */}
      {searched && results.length === 0 && (
        <p style={{ opacity: 0.5, fontSize: "0.9rem" }}>
          No results found for "{query}"
        </p>
      )}

      {results.length > 0 && (
        <>
          <h2 className="section-title" style={{ margin: "0 0 0.75rem" }}>
            Results for "{query}"
          </h2>
          <div className="cards-container">
            {results.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={onPlay}
                isPlaying={currentSong?.id === song.id}
              />
            ))}
          </div>
        </>
      )}

      {/* Browse Categories when not searching */}
      {!query && (
        <>
          <h2 className="section-title" style={{ margin: "0 0 0.75rem" }}>
            Browse Categories
          </h2>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="category-chip"
                onClick={() => handleSearch(cat)}
              >
                {cat}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
