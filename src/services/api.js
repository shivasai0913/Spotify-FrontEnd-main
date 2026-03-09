import axios from "axios";

const BASE_URL = "https://spotify-backend-main.onrender.com/api";
//const BASE_URL = "http://localhost:8081/api";


// ── Songs ──────────────────────────────────────────────────────────────────
export const getAllSongs    = ()         => axios.get(`${BASE_URL}/songs`);
export const getSongById   = (id)       => axios.get(`${BASE_URL}/songs/${id}`);
export const searchSongs   = (title)    => axios.get(`${BASE_URL}/songs/search?title=${title}`);
export const deleteSong    = (id)       => axios.delete(`${BASE_URL}/songs/${id}`);
export const getStreamUrl  = (fileName) => `${BASE_URL}/songs/stream/${fileName}`;
export const uploadSong = (song) => {

  const formData = new FormData();

  formData.append("title", song.title);
  formData.append("artist", song.artist);
  formData.append("album", song.album);
  formData.append("genre", song.genre);
  formData.append("duration", song.duration);
  formData.append("imageUrl", song.imageUrl);
  formData.append("audioUrl", song.audioUrl);

  return axios.post(`${BASE_URL}/songs`, formData);
};
// ── Playlists ──────────────────────────────────────────────────────────────
export const getAllPlaylists    = ()           => axios.get(`${BASE_URL}/playlists`);
export const createPlaylist    = (data)       => axios.post(`${BASE_URL}/playlists`, data);
export const deletePlaylist    = (id)         => axios.delete(`${BASE_URL}/playlists/${id}`);
export const renamePlaylist    = (id, data)   => axios.put(`${BASE_URL}/playlists/${id}`, data);
export const addSongToPlaylist = (pid, sid)   => axios.post(`${BASE_URL}/playlists/${pid}/songs/${sid}`);
