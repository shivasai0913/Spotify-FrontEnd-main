const BASE = "https://spotify-backend-main.onrender.com/api/auth";

// ── Login ────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");

  // Save to localStorage
  localStorage.setItem("token", data.token);
  localStorage.setItem("role",  data.role);
  localStorage.setItem("name",  data.name);
  localStorage.setItem("email", data.email);
  return data;
}

// ── Register ─────────────────────────────────────────────────────────────
export async function register(name, email, password) {
  const res = await fetch(`${BASE}/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

// ── Logout ────────────────────────────────────────────────────────────────
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
}

// ── Helpers ───────────────────────────────────────────────────────────────
export const getToken  = () => localStorage.getItem("token");
export const getRole   = () => localStorage.getItem("role");
export const getName   = () => localStorage.getItem("name");
export const isLoggedIn = () => !!localStorage.getItem("token");
export const isAdmin   = () => localStorage.getItem("role") === "ADMIN";

// ── Attach token to axios (call this once in api.js) ─────────────────────
export function getAuthHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}