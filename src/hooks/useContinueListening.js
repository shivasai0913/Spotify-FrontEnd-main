// useContinueListening.js
// Saves and restores the last played song + position across page reloads

const KEY_SONG = "spotify_last_song";
const KEY_TIME = "spotify_last_time";

export function saveLastSong(song, currentTime) {
  if (!song) return;
  try {
    localStorage.setItem(KEY_SONG, JSON.stringify(song));
    localStorage.setItem(KEY_TIME, String(Math.floor(currentTime || 0)));
  } catch {}
}

export function getLastSong() {
  try {
    const song = localStorage.getItem(KEY_SONG);
    const time = parseInt(localStorage.getItem(KEY_TIME) || "0", 10);
    return song ? { song: JSON.parse(song), time } : null;
  } catch {
    return null;
  }
}

export function clearLastSong() {
  localStorage.removeItem(KEY_SONG);
  localStorage.removeItem(KEY_TIME);
}