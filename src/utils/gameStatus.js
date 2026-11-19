// Pausas que el host cierra con "Seguir": tras una línea o un bingo.
export function isClaimPause(pausedReason) {
  return pausedReason === "line" || pausedReason === "bingo";
}

// Texto corto para el hueco de la cuenta atrás cuando no hay cuenta atrás.
export function songNote(status, pausedReason, clipEndsAt) {
  if (status === "paused") {
    if (pausedReason === "line") {
      return "Pausa por línea";
    }
    if (pausedReason === "connection") {
      return "Sin conexión con Spotify";
    }
    return pausedReason === "bingo" ? "Pausa por bingo" : "En pausa";
  }
  if (status === "playing" && !clipEndsAt) {
    return "Preparando la canción…";
  }
  return "";
}

export function cardLocked(status) {
  return status === "lobby" || status === "finished";
}

// Se puede cantar mientras la partida corre o está en pausa.
export function canClaim(status) {
  return status === "playing" || status === "paused";
}

// La línea solo se puede cantar en la fase "line".
export function canClaimLine(status, phase) {
  return canClaim(status) && phase === "line";
}

export function phaseLabel(phase) {
  return phase === "bingo" ? "Cartón completo" : "Línea";
}

export function endReasonText(reason) {
  if (reason === "pool_exhausted") {
    return "Se han acabado las canciones y nadie ha cantado bingo.";
  }
  if (reason === "idle") {
    return "La sala se ha cerrado por inactividad.";
  }
  return "";
}
