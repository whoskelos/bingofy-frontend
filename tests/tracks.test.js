import { describe, expect, it } from "vitest";
import { sameTrack } from "../src/utils/tracks.js";

describe("sameTrack", () => {
  const expected = { id: "spotify:track:abc", uri: "spotify:track:abc" };

  it("reconoce la misma pista por uri o por id", () => {
    expect(sameTrack(expected, { uri: "spotify:track:abc" })).toBe(true);
    expect(sameTrack(expected, { id: "abc" })).toBe(true);
    expect(sameTrack(expected, { id: "otra", uri: "spotify:track:otra" })).toBe(false);
  });

  it("acepta la pista que Spotify ha reemplazado (linked_from)", () => {
    const relinked = { id: "xyz", uri: "spotify:track:xyz", linked_from: { id: "abc", uri: "spotify:track:abc" } };
    expect(sameTrack(expected, relinked)).toBe(true);
  });

  it("sin pista no hay coincidencia", () => {
    expect(sameTrack(expected, null)).toBe(false);
    expect(sameTrack(null, { id: "abc" })).toBe(false);
  });
});
