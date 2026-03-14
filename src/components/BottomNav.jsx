import { useState, useEffect, useRef } from "react";
import { FaHouse, FaMagnifyingGlass, FaBookOpen,  FaPlus } from "react-icons/fa6";
import { getName, getRole, logout } from "../services/auth";

export default function BottomNav({ activePage, onNavigate, isAdmin }) {
  const [showProfile, setShowProfile] = useState(false);
  const popupRef = useRef(null);

  const name  = getName() || "User";
  const email = localStorage.getItem("email") || "";
  const initial = name.charAt(0).toUpperCase();

  // Close popup when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    if (showProfile) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showProfile]);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const items = [
    { id: "home",    icon: <FaHouse />,          label: "Home"        },
    { id: "search",  icon: <FaMagnifyingGlass />, label: "Search"      },
    { id: "library", icon: <FaBookOpen />,        label: "Your Library"},
    { id: "upload",  icon: <FaPlus />,            label: isAdmin ? "Upload" : "Create" },
  ];

  return (
    <>
      {/* Profile popup — slides up above bottom nav */}
      {showProfile && (
        <div
          ref={popupRef}
          style={{
            position:      "fixed",
            bottom:        "64px",
            left:          "50%",
            transform:     "translateX(-50%)",
            width:         "calc(100% - 2rem)",
            maxWidth:      "360px",
            background:    "#282828",
            borderRadius:  "1rem",
            zIndex:        500,
            boxShadow:     "0 -8px 32px rgba(0,0,0,0.6)",
            overflow:      "hidden",
            animation:     "slideUp 0.2s ease",
          }}
        >
          {/* User info header */}
          <div style={{
            padding:        "1.25rem 1.25rem 1rem",
            borderBottom:   "1px solid rgba(255,255,255,0.08)",
            display:        "flex",
            alignItems:     "center",
            gap:            "0.85rem",
          }}>
            <div style={{
              width:          "48px", height: "48px",
              borderRadius:   "50%",
              background:     isAdmin ? "#1DB954" : "#535353",
              display:        "flex", alignItems: "center", justifyContent: "center",
              fontWeight:     800, fontSize: "1.2rem", flexShrink: 0,
              color:          isAdmin ? "#000" : "#fff",
            }}>
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.15rem" }}>{name}</p>
              <p style={{ fontSize: "0.78rem", opacity: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>
              {isAdmin && (
                <span style={{
                  display:       "inline-block",
                  background:    "#1DB954",
                  color:         "#000",
                  fontSize:      "0.65rem",
                  fontWeight:    800,
                  padding:       "0.1rem 0.5rem",
                  borderRadius:  "100px",
                  marginTop:     "0.25rem",
                  letterSpacing: "0.05em",
                }}>ADMIN</span>
              )}
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: "0.5rem 0" }}>
            <button onClick={() => { onNavigate("liked"); setShowProfile(false); }} style={menuItem}>
              <span>💚</span> Liked Songs
            </button>
            {isAdmin && (
              <button onClick={() => { onNavigate("upload"); setShowProfile(false); }} style={menuItem}>
                <span>⬆️</span> Upload Song
              </button>
            )}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "0.4rem 0" }} />
            <button onClick={handleLogout} style={{ ...menuItem, color: "#ff4444" }}>
              <span>🚪</span> Log Out
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="bottom-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate?.(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        {/* Profile avatar button */}
        <button
          className="bottom-nav-item"
          onClick={() => setShowProfile(!showProfile)}
          style={{ position: "relative" }}
        >
          <div style={{
            width:          "26px", height: "26px",
            borderRadius:   "50%",
            background:     isAdmin ? "#1DB954" : "#535353",
            display:        "flex", alignItems: "center", justifyContent: "center",
            fontSize:       "0.75rem", fontWeight: 800,
            color:          isAdmin ? "#000" : "#fff",
            border:         showProfile ? "2px solid #fff" : "2px solid transparent",
            transition:     "border 0.2s",
          }}>
            {initial}
          </div>
          <span>Profile</span>
        </button>
      </nav>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}

const menuItem = {
  display:        "flex",
  alignItems:     "center",
  gap:            "0.75rem",
  width:          "100%",
  background:     "none",
  border:         "none",
  color:          "#fff",
  fontSize:       "0.92rem",
  fontWeight:     600,
  fontFamily:     "Montserrat, sans-serif",
  padding:        "0.75rem 1.25rem",
  textAlign:      "left",
  cursor:         "pointer",
  transition:     "background 0.15s",
};