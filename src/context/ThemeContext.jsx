import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("spotify_theme") || "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem("spotify_theme", theme);

    if (theme === "light") {
      root.style.setProperty("--bg-base",       "#ffffff");
      root.style.setProperty("--bg-main",       "#f0f0f0");
      root.style.setProperty("--bg-card",       "#e8e8e8");
      root.style.setProperty("--bg-elevated",   "#d8d8d8");
      root.style.setProperty("--bg-player",     "#f5f5f5");
      root.style.setProperty("--text-primary",  "#000000");
      root.style.setProperty("--text-secondary","#333333");
      root.style.setProperty("--text-muted",    "#666666");
      root.style.setProperty("--border",        "rgba(0,0,0,0.1)");
      root.style.setProperty("--hover",         "rgba(0,0,0,0.06)");
      root.style.setProperty("--accent",        "#1DB954");
    } else {
      root.style.setProperty("--bg-base",       "#000000");
      root.style.setProperty("--bg-main",       "#121212");
      root.style.setProperty("--bg-card",       "#181818");
      root.style.setProperty("--bg-elevated",   "#232323");
      root.style.setProperty("--bg-player",     "#181818");
      root.style.setProperty("--text-primary",  "#ffffff");
      root.style.setProperty("--text-secondary","#cccccc");
      root.style.setProperty("--text-muted",    "#aaaaaa");
      root.style.setProperty("--border",        "rgba(255,255,255,0.1)");
      root.style.setProperty("--hover",         "rgba(255,255,255,0.07)");
      root.style.setProperty("--accent",        "#1DB954");
    }

    // Smooth transition on all elements
    document.body.style.transition = "background 0.4s ease, color 0.4s ease";
    document.body.style.background = theme === "light" ? "#f0f0f0" : "#000";
    document.body.style.color      = theme === "light" ? "#000" : "#fff";
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);