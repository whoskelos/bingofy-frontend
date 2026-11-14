function normalizeUrl(value, name) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name}: debe ser una URL http(s) absoluta`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${name}: debe ser una URL http(s) absoluta`);
  }
  return url.toString().replace(/\/$/, "");
}

function readUrl(env, name) {
  const value = env[name];
  if (!value || value === "RELLENAR_A_MANO") {
    throw new Error(`${name}: falta. Defínela en .env o en .env.production.local.`);
  }
  return normalizeUrl(value, name);
}

export function urlsFromEnv(env, { origin = "" } = {}) {
  const apiBaseUrl = readUrl(env, "VITE_API_BASE_URL");
  const socketUrl = readUrl(env, "VITE_SOCKET_URL");
  const publicValue = env.VITE_PUBLIC_APP_URL;
  const publicAppUrl = publicValue && publicValue !== "RELLENAR_A_MANO"
    ? normalizeUrl(publicValue, "VITE_PUBLIC_APP_URL")
    : normalizeUrl(origin, "origen de la página");
  return { apiBaseUrl, socketUrl, publicAppUrl };
}

export function getEnv() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return urlsFromEnv(import.meta.env, { origin });
}
