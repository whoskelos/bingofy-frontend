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
  if (pattern === "FULL") {
    return "Cartón completo";
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
  const sdkId = sdkTrack.id || "";
  return expected.id === sdkId || expected.id === `spotify:track:${sdkId}`;
}
