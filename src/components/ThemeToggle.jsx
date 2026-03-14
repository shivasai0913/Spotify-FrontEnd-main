import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
      style={{
        position:       "relative",
        width:          "48px",
        height:         "26px",
        borderRadius:   "100px",
        border:         "none",
        background:     isDark ? "#333" : "#ddd",
        cursor:         "pointer",
        transition:     "background 0.3s",
        flexShrink:     0,
        display:        "flex",
        alignItems:     "center",
        padding:        "0 3px",
      }}
    >
      {/* Sliding knob */}
      <div style={{
        width:          "20px",
        height:         "20px",
        borderRadius:   "50%",
        background:     isDark ? "#1DB954" : "#fff",
        boxShadow:      "0 1px 4px rgba(0,0,0,0.3)",
        transform:      isDark ? "translateX(22px)" : "translateX(0)",
        transition:     "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.3s",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       "11px",
      }}>
        {isDark ? "🌙" : "☀️"}
      </div>
    </button>
  );
}