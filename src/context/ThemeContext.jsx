import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("spotify_theme") || "dark"
  );

  useEffect(() => {
    const html = document.documentElement;

    // Set data-theme on <html> — CSS uses [data-theme="light"] selectors
    html.setAttribute("data-theme", theme);
    localStorage.setItem("spotify_theme", theme);

    document.body.style.transition = "background 0.4s ease, color 0.4s ease";

    if (theme === "light") {
      document.body.style.background = "#f0f0f0";
      document.body.style.color      = "#000";
    } else {
      document.body.style.background = "#000";
      document.body.style.color      = "#fff";
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);