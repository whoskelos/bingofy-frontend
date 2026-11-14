const MESSAGES = {
  PREMIUM_REQUIRED: "Hace falta Spotify Premium para presentar la partida.",
  SPOTIFY_AUTH_FAILED: "Spotify no ha autorizado la sesión. Vuelve a conectar.",
  SPOTIFY_TOKEN_EXPIRED: "La sesión de Spotify ha caducado. Vuelve a conectar para seguir en la sala.",
  POOL_TOO_SMALL: "Las playlists elegidas no tienen canciones suficientes para la partida.",
  PLAYLIST_TOO_SMALL: "Una de las playlists no llega al mínimo de canciones válidas.",
  PLAYLIST_NOT_READABLE: "No se puede leer una de las playlists. Elige otra propia o colaborativa.",
  ROOM_NOT_FOUND: "No existe ninguna sala con ese código.",
  ROOM_FULL: "La sala está llena.",
  ROOM_NOT_IN_LOBBY: "La partida ya ha empezado y no admite nuevos jugadores.",
  NOT_HOST: "No hay una sesión de anfitrión activa.",
  INVALID_MARK: "Hay casillas marcadas de canciones que todavía no han sonado.",
  INVALID_PATTERN: "Ese bingo no está completo.",
  VALIDATION_ERROR: "Los datos enviados no son válidos."
};

export const GENERIC_ERROR = "No se ha podido completar la acción. Inténtalo de nuevo.";

export function errorMessage(code) {
  return MESSAGES[code] || GENERIC_ERROR;
}

export function errorCodeFrom(error) {
  return error?.response?.data?.error?.code || error?.code || "";
}
