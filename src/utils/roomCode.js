export const ROOM_CODE_LENGTH = 6;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeRoomCode(value) {
  return String(value || "").trim().toUpperCase();
}

export function isValidRoomCode(value) {
  const code = normalizeRoomCode(value);
  if (code.length !== ROOM_CODE_LENGTH) {
    return false;
  }
  return [...code].every((char) => ALPHABET.includes(char));
}
