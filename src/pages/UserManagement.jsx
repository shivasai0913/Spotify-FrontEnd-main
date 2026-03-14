import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "../components/Toast";

const BASE = "https://spotify-backend-main.onrender.com/api/admin";

export default function UserManagement() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [stats,   setStats]   = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${BASE}/users`),
        axios.get(`${BASE}/stats`),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch {
      toast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Remove user "${user.name}"?`)) return;
    try {
      await axios.delete(`${BASE}/users/${user.id}`);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast(`User "${user.name}" removed`, "success");
      fetchData();
    } catch {
      toast("Failed to delete user", "error");
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const shimmer = {
    background: "linear-gradient(90deg,#1e1e1e 25%,#2a2a2a 50%,#1e1e1e 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: "0.4rem",
  };

  return (
    <div style={{ padding: "1.5rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize:"1.6rem", fontWeight:900, letterSpacing:"-0.02em", marginBottom:"0.25rem" }}>
          👥 User Management
        </h1>
        <p style={{ fontSize:"0.85rem", opacity:0.5 }}>Manage all registered users</p>
      </div>

      {/* Stats cards */}
      <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
        {[
          { label:"Total Users",  value: stats?.totalUsers ?? "—", color:"#3b82f6", icon:"👤" },
          { label:"Regular Users",value: stats?.userCount  ?? "—", color:"#1DB954", icon:"🎵" },
          { label:"Admins",       value: stats?.adminCount ?? "—", color:"#f59e0b", icon:"⚡" },
        ].map(s => (
          <div key={s.label} style={{
            background:"#181818", borderRadius:"0.75rem",
            padding:"0.85rem 1.25rem", flex:"1", minWidth:110,
            borderLeft:`3px solid ${s.color}`,
          }}>
            <p style={{ fontSize:"1.5rem", fontWeight:900, color:s.color }}>
              {s.icon} {s.value}
            </p>
            <p style={{ fontSize:"0.75rem", opacity:0.5, marginTop:"0.1rem" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", background:"#2a2a2a", borderRadius:"100px", padding:"0.5rem 1rem", marginBottom:"1rem", maxWidth:340 }}>
        <span style={{ opacity:0.5 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{ background:"none", border:"none", outline:"none", color:"var(--text-primary,#fff)", fontSize:"0.88rem", fontFamily:"Montserrat,sans-serif", width:"100%" }} />
      </div>

      {/* Table */}
      <div style={{ background:"#181818", borderRadius:"0.75rem", overflow:"hidden" }}>

        {/* Header */}
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr 100px 80px",
          padding:"0.6rem 1rem", borderBottom:"1px solid rgba(255,255,255,0.08)",
          fontSize:"0.72rem", opacity:0.4, letterSpacing:"0.08em", textTransform:"uppercase",
        }}>
          <span>Name</span><span>Email</span><span>Role</span><span style={{textAlign:"center"}}>Action</span>
        </div>

        {/* Loading */}
        {loading && [...Array(5)].map((_,i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 100px 80px", padding:"0.75rem 1rem", gap:"0.75rem", alignItems:"center" }}>
            <div style={{ ...shimmer, height:13, width:"70%" }} />
            <div style={{ ...shimmer, height:13, width:"80%" }} />
            <div style={{ ...shimmer, height:22, width:60, borderRadius:"100px" }} />
            <div style={{ ...shimmer, height:28, width:60, margin:"0 auto", borderRadius:"0.4rem" }} />
          </div>
        ))}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ padding:"3rem", textAlign:"center", opacity:0.4 }}>
            <p style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>👤</p>
            <p style={{ fontWeight:700 }}>No users found</p>
          </div>
        )}

        {/* Rows */}
        {!loading && filtered.map((user, idx) => (
          <div key={user.id} style={{
            display:"grid", gridTemplateColumns:"1fr 1fr 100px 80px",
            alignItems:"center", padding:"0.65rem 1rem",
            borderBottom:"1px solid rgba(255,255,255,0.04)",
            transition:"background 0.15s", gap:"0.5rem",
            background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
          }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background=idx%2===0?"transparent":"rgba(255,255,255,0.01)"}
          >
            {/* Name + avatar */}
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", minWidth:0 }}>
              <div style={{
                width:32, height:32, borderRadius:"50%", flexShrink:0,
                background: user.role === "ADMIN" ? "#1DB954" : "#3b82f6",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.8rem", fontWeight:800,
                color: user.role === "ADMIN" ? "#000" : "#fff",
              }}>
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <span style={{ fontSize:"0.88rem", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {user.name}
              </span>
            </div>

            {/* Email */}
            <span style={{ fontSize:"0.82rem", opacity:0.55, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {user.email}
            </span>

            {/* Role badge */}
            <span style={{
              display:"inline-block",
              background: user.role === "ADMIN" ? "rgba(29,185,84,0.15)" : "rgba(59,130,246,0.15)",
              color:       user.role === "ADMIN" ? "#1DB954" : "#3b82f6",
              border:     `1px solid ${user.role === "ADMIN" ? "#1DB95440" : "#3b82f640"}`,
              fontSize:"0.72rem", fontWeight:800,
              padding:"0.2rem 0.6rem", borderRadius:"100px",
              letterSpacing:"0.05em",
            }}>
              {user.role}
            </span>

            {/* Delete */}
            <div style={{ textAlign:"center" }}>
              {user.role !== "ADMIN" && (
                <button onClick={() => handleDelete(user)} style={{
                  background:"rgba(255,68,68,0.1)", border:"1px solid rgba(255,68,68,0.3)",
                  color:"#ff4444", borderRadius:"0.4rem", padding:"0.3rem 0.65rem",
                  fontSize:"0.78rem", fontWeight:700, cursor:"pointer",
                  fontFamily:"Montserrat,sans-serif",
                }}>
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}