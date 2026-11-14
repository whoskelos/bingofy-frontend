import { describe, expect, it } from "vitest";
import { cardLocked } from "../src/utils/gameStatus.js";

describe("cardLocked", () => {
  it("bloquea el cartón antes de empezar y al terminar", () => {
    expect(cardLocked("lobby")).toBe(true);
    expect(cardLocked("finished")).toBe(true);
  });

  it("deja marcar durante la partida y en la pausa", () => {
    expect(cardLocked("playing")).toBe(false);
    expect(cardLocked("paused")).toBe(false);
  });
});
