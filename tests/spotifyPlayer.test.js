import { effectScope } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/api.js", () => ({ getSpotifyToken: async () => "token" }));
const { useSpotifyPlayer } = await import("../src/composables/useSpotifyPlayer.js");

const TRACK = { id: "spotify:track:abc", uri: "spotify:track:abc" };

function playingState(uri, extra = {}) {
  return { paused: false, track_window: { current_track: { uri, id: uri.split(":").pop(), ...extra } } };
}

// Reproductor falso: guarda los listeners para poder lanzar eventos del SDK.
function installSpotify() {
  const fake = {
    listeners: {},
    state: null,
    connectResult: true,
    connects: 0,
    disconnects: 0,
    addListener(event, fn) {
      this.listeners[event] = fn;
    },
    emit(event, payload) {
      this.listeners[event]?.(payload);
    },
    async activateElement() {},
    async connect() {
      this.connects += 1;
      if (this.connectResult) {
        queueMicrotask(() => this.emit("ready", { device_id: `dev${this.connects}` }));
      }
      return this.connectResult;
    },
    disconnect() {
      this.disconnects += 1;
    },
    async getCurrentState() {
      return this.state;
    }
  };
  window.Spotify = { Player: function Player() { return fake; } };
  return fake;
}

describe("useSpotifyPlayer", () => {
  let fake;
  let scope;

  beforeEach(() => {
    vi.useFakeTimers();
    fake = installSpotify();
    scope = effectScope();
  });

  afterEach(() => {
    scope.stop();
    vi.useRealTimers();
    delete window.Spotify;
  });

  async function start(callbacks = {}) {
    const player = scope.run(() => useSpotifyPlayer(callbacks));
    await vi.advanceTimersByTimeAsync(0);
    await player.activate();
    await vi.advanceTimersByTimeAsync(0);
    return player;
  }

  it("confirma la canción preguntando por el estado si se pierde el evento", async () => {
    const onConfirm = vi.fn();
    const player = await start({ onConfirm });
    player.expectTrack(TRACK);
    fake.state = playingState(TRACK.uri);
    await vi.advanceTimersByTimeAsync(1100);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith(TRACK.id);

    // Ya confirmada: no vuelve a avisar
    await vi.advanceTimersByTimeAsync(3000);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("acepta la pista relinkada por Spotify", async () => {
    const onConfirm = vi.fn();
    const player = await start({ onConfirm });
    player.expectTrack(TRACK);
    fake.emit("player_state_changed", playingState("spotify:track:xyz", { linked_from: { id: "abc", uri: TRACK.uri } }));
    expect(onConfirm).toHaveBeenCalledWith(TRACK.id);
  });

  it("no confirma si está en pausa o suena otra pista", async () => {
    const onConfirm = vi.fn();
    const player = await start({ onConfirm });
    player.expectTrack(TRACK);
    fake.state = { ...playingState(TRACK.uri), paused: true };
    await vi.advanceTimersByTimeAsync(1100);
    fake.state = playingState("spotify:track:otra");
    await vi.advanceTimersByTimeAsync(1100);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("avisa de que la canción pendiente no se puede reproducir", async () => {
    const onFailed = vi.fn();
    const player = await start({ onFailed });
    player.expectTrack(TRACK);
    fake.emit("playback_error", {});
    expect(onFailed).toHaveBeenCalledWith(TRACK.id);
  });

  it("se reconecta solo con espera creciente cuando el dispositivo se desconecta", async () => {
    const player = await start();
    expect(player.ready.value).toBe(true);
    const connectsBefore = fake.connects;

    fake.connectResult = false;
    fake.emit("not_ready", {});
    expect(player.ready.value).toBe(false);

    await vi.advanceTimersByTimeAsync(1000);
    expect(fake.connects).toBe(connectsBefore + 1);
    await vi.advanceTimersByTimeAsync(2000);
    expect(fake.connects).toBe(connectsBefore + 2);

    // Vuelve la red: el siguiente intento recupera el reproductor
    fake.connectResult = true;
    await vi.advanceTimersByTimeAsync(4000);
    expect(player.ready.value).toBe(true);
  });

  it("la reconexión que pide el servidor funciona aunque parezca listo", async () => {
    const onDevice = vi.fn();
    const player = await start({ onDevice });
    onDevice.mockClear();
    expect(player.ready.value).toBe(true);

    await player.reconnect(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(fake.disconnects).toBeGreaterThan(0);
    expect(onDevice).toHaveBeenCalledTimes(1);
  });

  it("deja de reintentar tras varios fallos seguidos", async () => {
    await start();
    const before = fake.connects;
    fake.connectResult = false;
    fake.emit("not_ready", {});
    await vi.advanceTimersByTimeAsync(120_000);
    expect(fake.connects - before).toBe(5);
  });
});
