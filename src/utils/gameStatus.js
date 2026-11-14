// Texto corto para el hueco de la cuenta atrás cuando no hay cuenta atrás.
export function songNote(status, pauseReason, clipEndsAt) {
  if (status === "paused") {
    return pauseReason === "bingo" ? "Pausa por bingo" : "En pausa";
  }
  if (status === "playing" && !clipEndsAt) {
    return "Preparando la canción…";
  }
  return "";
}

export function cardLocked(status) {
  return status === "lobby" || status === "finished";
}
