import { useEffect, useState } from "react";
import { getAllPlaylists, createPlaylist, addSongToPlaylist } from "../services/api";
import "../styles/App.css";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [name, setName]           = useState("");
  const [desc, setDesc]           = useState("");
  const [msg, setMsg]             = useState("");

  useEffect(() => {
    getAllPlaylists()
      .then((res) => setPlaylists(res.data))
      .catch(() => {});
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return setMsg("❌ Playlist name is required");
    createPlaylist({ name, description: desc, songs: [] })
      .then((res) => {
        setPlaylists([...playlists, res.data]);
        setName("");
        setDesc("");
        setMsg("✅ Playlist created!");
        setTimeout(() => setMsg(""), 2500);
      })
      .catch(() => setMsg("❌ Failed to create. Is backend running?"));
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 className="section-title" style={{ margin: "0 0 1.5rem" }}>
        Your Playlists
      </h2>

      {/* Create Playlist Form */}
      <div className="upload-card" style={{ maxWidth: "480px", marginBottom: "2rem" }}>
        <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Create New Playlist</h3>
        <input
          className="form-input"
          placeholder="Playlist name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="form-input"
          placeholder="Description (optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button className="upload-btn" onClick={handleCreate}>
          + Create Playlist
        </button>
        {msg && (
          <p className={msg.startsWith("✅") ? "success-msg" : "error-msg"}>
            {msg}
          </p>
        )}
      </div>

      {/* Playlists List */}
      {playlists.length === 0 ? (
        <p style={{ opacity: 0.4, fontSize: "0.9rem" }}>
          No playlists yet. Create one above!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "600px" }}>
          {playlists.map((pl) => (
            <div
              key={pl.id}
              style={{
                background: "#181818",
                borderRadius: "0.75rem",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div className="playlist-thumb" style={{ width: "52px", height: "52px", fontSize: "1.4rem" }}>
                ♪
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>{pl.name}</p>
                <p style={{ fontSize: "0.8rem", opacity: 0.5 }}>
                  Playlist · {pl.songs?.length ?? 0} songs
                  {pl.description && ` · ${pl.description}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
