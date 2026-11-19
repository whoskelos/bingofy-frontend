export function formatArtists(artists) {
  if (!Array.isArray(artists)) {
    return "";
  }
  return artists.filter(Boolean).join(", ");
}

export function patternLabel(pattern) {
  if (pattern === "LINE") {
    return "Línea";
  }
  return "Bingo";
}

export function sameTrack(expected, sdkTrack) {
  if (!expected || !sdkTrack) {
    return false;
  }
  if (expected.uri && sdkTrack.uri && expected.uri === sdkTrack.uri) {
    return true;
  }
  const ids = [sdkTrack.id, sdkTrack.linked_from?.id].filter(Boolean);
  if (expected.uri && sdkTrack.linked_from?.uri === expected.uri) {
    return true;
  }
  // Spotify puede reemplazar la pista por otra versión (relink): `linked_from` guarda la pedida.
  return ids.some((id) => expected.id === id || expected.id === `spotify:track:${id}`);
}

// Minúsculas y sin tildes, para que "beyonce" encuentre "Beyoncé".
export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

// Cada palabra de la búsqueda tiene que aparecer en el título o en algún artista.
export function matchesTrack(track, query) {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return true;
  }
  const haystack = normalizeText(`${track?.name ?? ""} ${formatArtists(track?.artists)}`);
  return words.every((word) => haystack.includes(word));
}
