import { describe, expect, it } from "vitest";
import {
  canClaim,
  canClaimLine,
  cardLocked,
  endReasonText,
  isClaimPause,
  phaseLabel,
  songNote
} from "../src/utils/gameStatus.js";

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

describe("reclamaciones", () => {
  it("se puede cantar en juego y en pausa, no en lobby ni al terminar", () => {
    expect(canClaim("playing")).toBe(true);
    expect(canClaim("paused")).toBe(true);
    expect(canClaim("lobby")).toBe(false);
    expect(canClaim("finished")).toBe(false);
  });

  it("la línea solo se puede cantar en la fase line", () => {
    expect(canClaimLine("playing", "line")).toBe(true);
    expect(canClaimLine("paused", "line")).toBe(true);
    expect(canClaimLine("playing", "bingo")).toBe(false);
    expect(canClaimLine("finished", "line")).toBe(false);
  });

  it("línea y bingo se siguen con Seguir; la pausa del host con Reanudar", () => {
    expect(isClaimPause("line")).toBe(true);
    expect(isClaimPause("bingo")).toBe(true);
    expect(isClaimPause("host")).toBe(false);
    expect(isClaimPause(null)).toBe(false);
  });
});

describe("textos", () => {
  it("songNote distingue el motivo de la pausa", () => {
    expect(songNote("paused", "line", null)).toBe("Pausa por línea");
    expect(songNote("paused", "bingo", null)).toBe("Pausa por bingo");
    expect(songNote("paused", "host", null)).toBe("En pausa");
    expect(songNote("playing", null, null)).toBe("Preparando la canción…");
    expect(songNote("playing", null, "2026-11-14T00:00:00.000Z")).toBe("");
  });

  it("phaseLabel y endReasonText", () => {
    expect(phaseLabel("line")).toBe("Línea");
    expect(phaseLabel("bingo")).toBe("Cartón completo");
    expect(endReasonText("pool_exhausted")).toMatch(/canciones/);
    expect(endReasonText("bingo")).toBe("");
  });
});

describe("pausa por conexión", () => {
  it("explica que no hay conexión con Spotify y no se cierra con Seguir", () => {
    expect(songNote("paused", "connection", null)).toBe("Sin conexión con Spotify");
    expect(isClaimPause("connection")).toBe(false);
  });
});
