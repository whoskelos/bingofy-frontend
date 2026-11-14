const REQUIRED = ["VITE_API_BASE_URL", "VITE_SOCKET_URL", "VITE_PUBLIC_APP_URL"];

function readUrl(name) {
  const value = import.meta.env[name];
  if (!value || value === "RELLENAR_A_MANO") {
    throw new Error(`${name}: falta. Copia .env.example a .env y rellena la URL.`);
  }
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

export function getEnv() {
  const missing = REQUIRED.filter((name) => !import.meta.env[name] || import.meta.env[name] === "RELLENAR_A_MANO");
  if (missing.length > 0) {
    throw new Error(missing.map((name) => `${name}: falta. Copia .env.example a .env y rellena la URL.`).join("\n"));
  }
  return {
    apiBaseUrl: readUrl("VITE_API_BASE_URL"),
    socketUrl: readUrl("VITE_SOCKET_URL"),
    publicAppUrl: readUrl("VITE_PUBLIC_APP_URL")
  };
}
