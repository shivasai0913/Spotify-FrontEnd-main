import { useState } from "react";

const BASE = "https://spotify-backend-main.onrender.com/api/auth";

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode]         = useState("login"); // "login" | "register" | "admin-setup"
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  const reset = () => { setError(""); setSuccess(""); };

  // ── Login ──────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    reset();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("role",  data.role);
      localStorage.setItem("name",  data.name);
      localStorage.setItem("email", data.email);
      onLoginSuccess(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Register (user) ────────────────────────────────────────────────────
  const handleRegister = async () => {
    reset();
    if (!name || !email || !password) { setError("Please fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      // Auto login after register
      const loginRes  = await fetch(`${BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("role",  loginData.role);
      localStorage.setItem("name",  loginData.name);
      localStorage.setItem("email", loginData.email);
      onLoginSuccess(loginData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Create Admin ───────────────────────────────────────────────────────
  const handleCreateAdmin = async () => {
    reset();
    if (!name || !email || !password || !adminSecret) {
      setError("Please fill in all fields including the secret key");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/create-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, secret: adminSecret }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create admin");
      setSuccess("✅ Admin account created! You can now log in.");
      setMode("login");
      setName(""); setEmail(""); setPassword(""); setAdminSecret("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "login")         handleLogin();
    else if (mode === "register") handleRegister();
    else                          handleCreateAdmin();
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={s.root}>
      <div style={s.bg} />
      <div style={s.bgGlow} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <svg viewBox="0 0 24 24" fill="#1DB954" width="52" height="52">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <h1 style={s.logoText}>Spotify</h1>
        </div>

        {/* Title */}
        <h2 style={s.title}>
          {mode === "login"       ? "Log in to Spotify"
          : mode === "register"   ? "Sign up for free"
          :                         "Create Admin Account"}
        </h2>

        {/* Success message */}
        {success && <div style={s.successBox}>{success}</div>}

        {/* Form */}
        <div style={s.form}>
          {(mode === "register" || mode === "admin-setup") && (
            <div style={s.field}>
              <label style={s.label}>Full Name</label>
              <input style={s.input} placeholder="Your name"
                value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKey} />
            </div>
          )}

          <div style={s.field}>
            <label style={s.label}>Email Address</label>
            <input style={s.input} type="email" placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey} />
          </div>

          {mode === "admin-setup" && (
            <div style={s.field}>
              <label style={s.label}>Admin Secret Key</label>
              <input style={{ ...s.input, borderColor: "#1DB95450" }}
                type="password" placeholder="Enter secret key"
                value={adminSecret} onChange={e => setAdminSecret(e.target.value)} onKeyDown={handleKey} />
              {/* <p style={{ fontSize:"0.72rem", opacity:0.5, marginTop:"0.3rem" }}>
                Secret key: <code style={{ color:"#1DB954", userSelect:"all" }}></code>
              </p> */}
            </div>
          )}

          {error && <p style={s.error}>⚠ {error}</p>}

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..."
              : mode === "login"    ? "Log In"
              : mode === "register" ? "Create Account"
              :                       "Create Admin"}
          </button>
        </div>

        {/* Divider */}
        <div style={s.divider}>
          <div style={s.divLine} /><span style={s.divText}>or</span><div style={s.divLine} />
        </div>

        {/* Navigation links */}
        <div style={{ display:"flex", flexDirection:"column", gap:"0.65rem", alignItems:"center" }}>
          {mode !== "login" && (
            <p style={s.linkText} onClick={() => { setMode("login"); reset(); }}>
              Already have an account? <span style={s.linkBold}>Log in</span>
            </p>
          )}
          {mode !== "register" && (
            <p style={s.linkText} onClick={() => { setMode("register"); reset(); }}>
              New user? <span style={s.linkBold}>Sign up here</span>
            </p>
          )}
          {mode !== "admin-setup" && (
            <p style={s.linkText} onClick={() => { setMode("admin-setup"); reset(); }}>
              <span style={{ ...s.linkBold, color:"#1DB954", fontSize:"0.78rem" }}>
                🔧 Create Admin Account
              </span>
            </p>
          )}
          {mode === "admin-setup" && (
            <p style={s.linkText} onClick={() => { setMode("login"); reset(); }}>
              <span style={s.linkBold}>← Back to Login</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    minHeight:"100vh", display:"flex",
    alignItems:"center", justifyContent:"center",
    position:"relative", overflow:"hidden", background:"#000",
  },
  bg: {
    position:"absolute", inset:0,
    background:"radial-gradient(ellipse at top, #1a4a2e 0%, #0a1a10 40%, #000 70%)",
    zIndex:0,
  },
  bgGlow: {
    position:"absolute", inset:0,
    background:"radial-gradient(ellipse at bottom right, #1DB95418 0%, transparent 60%)",
    zIndex:1,
  },
  card: {
    position:"relative", zIndex:2,
    background:"#121212", borderRadius:"1rem",
    padding:"2.5rem 2rem", width:"100%", maxWidth:"440px",
    margin:"1rem", boxShadow:"0 24px 80px rgba(0,0,0,0.8)",
  },
  logoWrap: {
    display:"flex", flexDirection:"column",
    alignItems:"center", marginBottom:"1.25rem", gap:"0.4rem",
  },
  logoText: { fontSize:"1.5rem", fontWeight:900, letterSpacing:"-0.02em" },
  title: {
    fontSize:"1.55rem", fontWeight:800,
    textAlign:"center", marginBottom:"1.5rem", letterSpacing:"-0.02em",
  },
  successBox: {
    background:"#1DB95420", border:"1px solid #1DB95450",
    borderRadius:"0.5rem", padding:"0.75rem 1rem",
    color:"#1DB954", fontSize:"0.88rem", fontWeight:600,
    marginBottom:"1rem", textAlign:"center",
  },
  form: { display:"flex", flexDirection:"column", gap:"1rem" },
  field: { display:"flex", flexDirection:"column", gap:"0.35rem" },
  label: { fontSize:"0.85rem", fontWeight:700, color:"#fff" },
  input: {
    background:"#2a2a2a", border:"1px solid #3a3a3a",
    borderRadius:"0.5rem", padding:"0.85rem 1rem",
    color:"#fff", fontSize:"0.95rem",
    fontFamily:"Montserrat, sans-serif", outline:"none",
    width:"100%", boxSizing:"border-box",
  },
  error: { color:"#ff4444", fontSize:"0.85rem", fontWeight:600, textAlign:"center" },
  btn: {
    background:"#1DB954", border:"none", borderRadius:"100px",
    padding:"0.9rem", color:"#000", fontSize:"1rem", fontWeight:800,
    cursor:"pointer", fontFamily:"Montserrat, sans-serif",
    marginTop:"0.25rem", letterSpacing:"0.02em", width:"100%",
  },
  divider: {
    display:"flex", alignItems:"center",
    gap:"0.75rem", margin:"1.25rem 0",
  },
  divLine: { flex:1, height:"1px", background:"rgba(255,255,255,0.1)" },
  divText: { fontSize:"0.8rem", opacity:0.4 },
  linkText: { fontSize:"0.85rem", opacity:0.65, textAlign:"center", cursor:"default", margin:0 },
  linkBold: { color:"#fff", fontWeight:700, cursor:"pointer", textDecoration:"underline" },
};