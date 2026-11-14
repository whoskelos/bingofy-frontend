import { getEnv } from "../config/env.js";

export function roomUrl(code, publicAppUrl = getEnv().publicAppUrl) {
  const base = String(publicAppUrl || "").replace(/\/+$/, "");
  return `${base}/sala/${encodeURIComponent(code)}`;
}

export function displayRoomUrl(url) {
  return String(url).replace(/^https?:\/\//, "");
}
