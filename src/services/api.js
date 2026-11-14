import { getEnv } from "../config/env.js";
import { http } from "./http.js";

export function loginUrl() {
  return `${getEnv().apiBaseUrl}/auth/spotify/login`;
}

export async function getSession() {
  const { data } = await http.get("/auth/session");
  return data;
}

export async function getSpotifyToken() {
  const { data } = await http.get("/auth/spotify/token");
  return data.accessToken;
}

export async function getPlaylists() {
  const { data } = await http.get("/api/playlists");
  return data.playlists || [];
}

export async function createRoom(playlistIds) {
  const { data } = await http.post("/api/rooms", { playlistIds });
  return data.room;
}

export async function getRoom(code) {
  const { data } = await http.get(`/api/rooms/${encodeURIComponent(code)}`);
  return data.room;
}

export async function joinRoom(code, name) {
  const { data } = await http.post(`/api/rooms/${encodeURIComponent(code)}/join`, { name });
  return data;
}

export async function getCard(code, playerId) {
  const { data } = await http.get(`/api/rooms/${encodeURIComponent(code)}/card/${encodeURIComponent(playerId)}`);
  return data.card;
}
