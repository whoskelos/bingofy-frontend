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

  it("aplica bingo:won y deja la sala en pausa", () => {
    const room = useRoomStore();
    room.applyState(state);
    room.applyBingoWon({ playerId: "p1", name: "Ana", pattern: "LINE", at: "2026-11-14T00:00:00.000Z" });
    expect(room.winners).toEqual([
      { playerId: "p1", name: "Ana", pattern: "LINE", at: "2026-11-14T00:00:00.000Z" }
    ]);
    expect(room.status).toBe("paused");
    expect(room.lastWinner.name).toBe("Ana");
  });
});
