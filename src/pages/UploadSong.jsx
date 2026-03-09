import { useState } from "react";
import { uploadSong } from "../services/api";
import "../styles/App.css";

const FIELDS = [
  { name: "title", placeholder: "Song Title *", required: true },
  { name: "artist", placeholder: "Artist Name *", required: true },
  { name: "album", placeholder: "Album Name", required: false },
  { name: "genre", placeholder: "Genre (Pop, Hip-Hop...)", required: false },
  { name: "duration", placeholder: "Duration in seconds", required: false },
  { name: "imageUrl", placeholder: "Cover Image URL", required: false },
  { name: "audioUrl", placeholder: "MP3 Song URL (Cloudinary Link) *", required: true }
];

export default function UploadSong() {

  const [form, setForm] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    duration: "",
    imageUrl: "",
    audioUrl: ""
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpload = async () => {

    if (!form.title.trim() || !form.artist.trim() || !form.audioUrl.trim()) {
      return setMsg("❌ Title, Artist and Song URL are required.");
    }

    setLoading(true);
    setMsg("");

    try {

      await uploadSong({
        title: form.title,
        artist: form.artist,
        album: form.album,
        genre: form.genre,
        duration: form.duration,
        imageUrl: form.imageUrl,
        audioUrl: form.audioUrl
      });

      setMsg("✅ Song uploaded successfully!");

      setForm({
        title: "",
        artist: "",
        album: "",
        genre: "",
        duration: "",
        imageUrl: "",
        audioUrl: ""
      });

    } catch (err) {
      setMsg("❌ Upload failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">

      <h2 className="section-title" style={{ margin: "0 0 1.5rem" }}>
        🎵 Upload New Song
      </h2>

      <div className="upload-card">

        {FIELDS.map((f) => (
          <input
            key={f.name}
            name={f.name}
            placeholder={f.placeholder}
            value={form[f.name]}
            onChange={handleChange}
            className="form-input"
          />
        ))}

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "⬆ Upload Song"}
        </button>

        {msg && (
          <p className={msg.startsWith("✅") ? "success-msg" : "error-msg"}>
            {msg}
          </p>
        )}

      </div>

      <div
        style={{
          marginTop: "1.5rem",
          background: "#181818",
          borderRadius: "0.75rem",
          padding: "1rem 1.25rem",
          fontSize: "0.82rem",
          opacity: 0.6,
          lineHeight: 1.7,
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
          📋 How it works:
        </p>
        <p>1. Upload MP3 to Cloudinary</p>
        <p>2. Copy the Cloudinary song link</p>
        <p>3. Paste the link in "Song URL"</p>
        <p>4. Click Upload</p>
      </div>

    </div>
  );
}