import { useState, useRef } from "react";
import { uploadSong } from "../services/api";
import { toast } from "../components/Toast";

export default function UploadSong({ onUploaded }) {
  const [form, setForm] = useState({
    title: "", artist: "", album: "", genre: "", duration: "", imageUrl: "", audioUrl: "",
  });
  const [loading, setLoading]         = useState(false);
  const [fetchingDur, setFetchingDur] = useState(false);
  const audioRef = useRef(null);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // ── Auto-fetch duration when audioUrl is entered ──────────────────────
  const handleAudioUrlBlur = () => {
    const url = form.audioUrl.trim();
    if (!url || form.duration) return;

    setFetchingDur(true);
    const audio = new Audio();
    audio.crossOrigin = "anonymous";

    audio.onloadedmetadata = () => {
      const secs = Math.round(audio.duration);
      if (isFinite(secs) && secs > 0) {
        set("duration", secs);
        toast(`Duration auto-detected: ${Math.floor(secs/60)}:${String(secs%60).padStart(2,"0")}`, "info");
      }
      setFetchingDur(false);
    };
    audio.onerror = () => {
      // Silently fail — user can type manually
      setFetchingDur(false);
    };
    audio.src = url;
  };

  const handleSubmit = async () => {
    const { title, artist, album, genre, duration, imageUrl, audioUrl } = form;
    if (!title || !artist || !audioUrl) {
      toast("Title, Artist and Audio URL are required", "warning");
      return;
    }
    setLoading(true);
    try {
      await uploadSong({ title, artist, album, genre, duration: Number(duration) || 0, imageUrl, audioUrl });
      toast(`"${title}" uploaded successfully! 🎵`, "success");
      setForm({ title:"", artist:"", album:"", genre:"", duration:"", imageUrl:"", audioUrl:"" });
      onUploaded?.();
    } catch (e) {
      toast("Upload failed. Check backend connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key:"title",    label:"Song Title *",   placeholder:"e.g. Blinding Lights" },
    { key:"artist",   label:"Artist *",        placeholder:"e.g. The Weeknd" },
    { key:"album",    label:"Album",           placeholder:"e.g. After Hours" },
    { key:"genre",    label:"Genre",           placeholder:"e.g. Pop, Hip-Hop" },
  ];

  return (
    <div className="upload-page">
      <h2 style={{ fontSize:"1.4rem", fontWeight:900, marginBottom:"1.25rem", letterSpacing:"-0.02em" }}>
        ⬆ Upload Song
      </h2>

      <div className="upload-card">
        {/* Basic fields */}
        {fields.map(f => (
          <div key={f.key}>
            <label style={{ fontSize:"0.78rem", opacity:0.5, fontWeight:700, display:"block", marginBottom:"0.3rem", textTransform:"uppercase", letterSpacing:"0.05em" }}>
              {f.label}
            </label>
            <input
              className="form-input"
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
            />
          </div>
        ))}

        {/* Image URL */}
        <div>
          <label style={{ fontSize:"0.78rem", opacity:0.5, fontWeight:700, display:"block", marginBottom:"0.3rem", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            Cover Image URL
          </label>
          <input className="form-input" placeholder="https://..." value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} />
          {form.imageUrl?.startsWith("http") && (
            <img src={form.imageUrl} alt="preview"
              onError={e => e.target.style.display="none"}
              style={{ width:60, height:60, borderRadius:6, objectFit:"cover", marginTop:"0.5rem" }} />
          )}
        </div>

        {/* Audio URL — with auto-duration */}
        <div>
          <label style={{ fontSize:"0.78rem", opacity:0.5, fontWeight:700, display:"block", marginBottom:"0.3rem", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            Audio URL *
          </label>
          <input
            className="form-input"
            placeholder="https://..."
            value={form.audioUrl}
            onChange={e => set("audioUrl", e.target.value)}
            onBlur={handleAudioUrlBlur}
          />
          {fetchingDur && (
            <p style={{ fontSize:"0.75rem", color:"#1DB954", marginTop:"0.3rem" }}>
              ⏳ Detecting duration...
            </p>
          )}
        </div>

        {/* Duration — auto-filled or manual */}
        <div>
          <label style={{ fontSize:"0.78rem", opacity:0.5, fontWeight:700, display:"block", marginBottom:"0.3rem", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            Duration (seconds) {fetchingDur ? "— detecting..." : form.duration ? "✅ auto-detected" : "— paste Audio URL above to auto-fill"}
          </label>
          <input
            className="form-input"
            placeholder="e.g. 213"
            type="number"
            value={form.duration}
            onChange={e => set("duration", e.target.value)}
            style={{ borderColor: form.duration ? "#1DB95460" : undefined }}
          />
        </div>

        <button
          className="upload-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Uploading..." : "⬆ Upload Song"}
        </button>
      </div>

      {/* How it works */}
      <div style={{ marginTop:"1.5rem", background:"#181818", borderRadius:"0.75rem", padding:"1rem 1.25rem" }}>
        <p style={{ fontSize:"0.8rem", fontWeight:700, marginBottom:"0.6rem", opacity:0.6 }}>ℹ How it works</p>
        {[
          "Upload your MP3 to Cloudinary or any CDN",
          "Paste the audio URL above — duration auto-detects",
          "Add a cover image URL (optional)",
          "Hit Upload — song appears instantly for all users",
        ].map((step, i) => (
          <p key={i} style={{ fontSize:"0.78rem", opacity:0.45, marginBottom:"0.35rem" }}>
            {i+1}. {step}
          </p>
        ))}
      </div>
    </div>
  );
}