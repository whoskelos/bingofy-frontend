import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useRoomStore } from "../src/stores/room.js";

const state = {
  code: "ABC123",
  status: "playing",
  players: [{ id: "p1", name: "Ana", connected: true }],
  playersMax: 50,
  currentTrack: { id: "spotify:track:1", name: "Uno", artists: ["Sol"], albumImageUrl: null },
  currentIndex: 0,
  totalTracks: 10,
  played: [],
  winners: [],
  pendingConfirmation: true
};

describe("room store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("aplica room:state", () => {
    const room = useRoomStore();
    room.applyState(state);
    expect(room.code).toBe("ABC123");
    expect(room.status).toBe("playing");
    expect(room.players).toHaveLength(1);
    expect(room.currentTrack.name).toBe("Uno");
    expect(room.pendingConfirmation).toBe(true);
  });

  it("aplica song:started", () => {
    const room = useRoomStore();
    room.applyState({ ...state, status: "lobby", currentTrack: null });
    room.applySongStarted({
      track: { id: "spotify:track:2", name: "Dos", artists: ["Luz"] },
      index: 3,
      total: 12
    });
    expect(room.currentTrack.name).toBe("Dos");
    expect(room.currentIndex).toBe(3);
    expect(room.totalTracks).toBe(12);
    expect(room.status).toBe("playing");
    expect(room.pendingConfirmation).toBe(true);
  });

  it("aplica room:state con fase, motivo de pausa, cartón, ritmo y últimas canciones", () => {
    const room = useRoomStore();
    room.applyState({
      ...state,
      status: "paused",
      phase: "bingo",
      pausedReason: "line",
      rows: 3,
      cols: 5,
      pace: "fast",
      clipSeconds: 8,
      recent: [{ id: "b", name: "Dos" }, { id: "a", name: "Uno" }]
    });
    expect(room.phase).toBe("bingo");
    expect(room.pausedReason).toBe("line");
    expect(room.rows).toBe(3);
    expect(room.cols).toBe(5);
    expect(room.pace).toBe("fast");
    expect(room.clipSeconds).toBe(8);
    expect(room.recent.map((song) => song.id)).toEqual(["b", "a"]);
  });

  it("aplica line:won: pausa por línea, fase bingo y línea resaltada", () => {
    const room = useRoomStore();
    room.applyState(state);
    room.applyLineWon({ playerId: "p1", name: "Ana", cells: [0, 1, 2, 3, 4], songIndex: 7, at: "2026-11-14T00:00:00.000Z" });
    expect(room.winners).toEqual([
      { playerId: "p1", name: "Ana", pattern: "LINE", at: "2026-11-14T00:00:00.000Z", songIndex: 7 }
    ]);
    expect(room.status).toBe("paused");
    expect(room.pausedReason).toBe("line");
    expect(room.phase).toBe("bingo");
    expect(room.lineWon).toEqual({ playerId: "p1", name: "Ana", cells: [0, 1, 2, 3, 4] });

    room.applySongStarted({ track: { id: "x", name: "X", artists: [] }, index: 8, total: 10 });
    expect(room.status).toBe("playing");
    expect(room.pausedReason).toBeNull();
    expect(room.lineWon).toBeNull();
  });

  it("aplica bingo:won: termina la partida y no duplica la línea", () => {
    const room = useRoomStore();
    room.applyState(state);
    room.applyLineWon({ playerId: "p2", name: "Beto", cells: [0], songIndex: 3, at: "t1" });
    room.applyBingoWon({ playerId: "p1", name: "Ana", alsoWonLine: false, songIndex: 9, at: "t2" });
    expect(room.winners.map((winner) => [winner.name, winner.pattern])).toEqual([
      ["Beto", "LINE"],
      ["Ana", "FULL"]
    ]);
    expect(room.status).toBe("finished");
    expect(room.pausedReason).toBeNull();
    expect(room.lastWinner.name).toBe("Ana");
  });

  it("bingo:won con alsoWonLine añade también la línea del mismo jugador", () => {
    const room = useRoomStore();
    room.applyState(state);
    room.applyBingoWon({ playerId: "p1", name: "Ana", alsoWonLine: true, songIndex: 9, at: "t" });
    expect(room.winners.map((winner) => winner.pattern)).toEqual(["LINE", "FULL"]);
  });

  it("game:paused trae el motivo y game:ended el suyo", () => {
    const room = useRoomStore();
    room.applyState(state);
    room.applyPaused({ reason: "host" });
    expect(room.pausedReason).toBe("host");
    room.applyResumed();
    expect(room.status).toBe("playing");
    expect(room.pausedReason).toBeNull();
    room.applyEnded({ reason: "pool_exhausted" });
    expect(room.status).toBe("finished");
    expect(room.endReason).toBe("pool_exhausted");
  });
});
