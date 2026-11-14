import { describe, expect, it } from "vitest";
import { errorMessage, GENERIC_ERROR } from "../src/utils/errorMessages.js";

const codes = [
  "PREMIUM_REQUIRED",
  "SPOTIFY_AUTH_FAILED",
  "SPOTIFY_TOKEN_EXPIRED",
  "POOL_TOO_SMALL",
  "PLAYLIST_TOO_SMALL",
  "PLAYLIST_NOT_READABLE",
  "ROOM_NOT_FOUND",
  "ROOM_FULL",
  "ROOM_NOT_IN_LOBBY",
  "NOT_HOST",
  "INVALID_MARK",
  "INVALID_PATTERN",
  "VALIDATION_ERROR"
];

describe("errorMessages", () => {
  it("traduce cada código conocido", () => {
    for (const code of codes) {
      const message = errorMessage(code);
      expect(message).not.toBe(GENERIC_ERROR);
      expect(message.length).toBeGreaterThan(0);
    }
  });

  it("usa un mensaje genérico si el código es desconocido", () => {
    expect(errorMessage("ALGO_INTERNO")).toBe(GENERIC_ERROR);
    expect(errorMessage("")).toBe(GENERIC_ERROR);
  });
});
