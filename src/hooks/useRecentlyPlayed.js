import { useState, useEffect } from "react";

const KEY      = "spotify_recently_played";
const MAX_SONGS = 10;

export function useRecentlyPlayed() {
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  const addToRecent = (song) => {
    if (!song) return;
    setRecentlyPlayed(prev => {
      // Remove duplicate if already exists
      const filtered = prev.filter(s => s.id !== song.id);
      // Add to front, keep max 10
      const updated = [song, ...filtered].slice(0, MAX_SONGS);
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecent = () => {
    localStorage.removeItem(KEY);
    setRecentlyPlayed([]);
  };

  return { recentlyPlayed, addToRecent, clearRecent };
}