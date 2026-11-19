import { defineStore } from "pinia";
import { ref } from "vue";

export const useRoomStore = defineStore("room", () => {
  const code = ref("");
  const status = ref("lobby");
  const players = ref([]);
  const playersMax = ref(50);
  const currentTrack = ref(null);
  const currentIndex = ref(-1);
  const totalTracks = ref(0);
  const played = ref([]);
  const recent = ref([]);
  const winners = ref([]);
  const pendingConfirmation = ref(false);
  const clipEndsAt = ref(null);
  const clipRemainingMs = ref(null);
  // Fase de juego: "line" hasta que alguien canta línea, después "bingo"
  const phase = ref("line");
  // Por qué está en pausa: "host", "line" o "bingo"
  const pausedReason = ref(null);
  const endReason = ref(null);
  const rows = ref(3);
  const cols = ref(5);
  const pace = ref("normal");
  const clipSeconds = ref(12);
  const lastWinner = ref(null);
  // Línea ganadora recién cantada: { playerId, name, cells }. Se limpia al seguir.
  const lineWon = ref(null);

  function applyState(state) {
    if (!state) {
      return;
    }
    code.value = state.code || code.value;
    status.value = state.status || status.value;
    players.value = state.players || [];
    playersMax.value = state.playersMax || playersMax.value;
    currentTrack.value = state.currentTrack || null;
    currentIndex.value = Number.isInteger(state.currentIndex) ? state.currentIndex : currentIndex.value;
    totalTracks.value = state.totalTracks || 0;
    played.value = (state.played || []).filter(Boolean);
    recent.value = (state.recent || []).filter(Boolean);
    winners.value = state.winners || [];
    pendingConfirmation.value = Boolean(state.pendingConfirmation);
    clipEndsAt.value = state.clipEndsAt || null;
    clipRemainingMs.value = Number.isFinite(state.clipRemainingMs) ? state.clipRemainingMs : null;
    phase.value = state.phase || phase.value;
    pausedReason.value = state.pausedReason || null;
    rows.value = state.rows || rows.value;
    cols.value = state.cols || cols.value;
    pace.value = state.pace || pace.value;
    clipSeconds.value = state.clipSeconds || clipSeconds.value;
    if (status.value !== "paused" || pausedReason.value !== "line") {
      lineWon.value = null;
    }
  }

  function applySongStarted(payload) {
    if (!payload) {
      return;
    }
    currentTrack.value = payload.track || null;
    currentIndex.value = payload.index;
    totalTracks.value = payload.total;
    if (status.value !== "finished") {
      status.value = "playing";
    }
    pendingConfirmation.value = true;
    clipEndsAt.value = null;
    clipRemainingMs.value = null;
    pausedReason.value = null;
    lineWon.value = null;
  }

  function addWinner(winner) {
    const exists = winners.value.some((item) => item.playerId === winner.playerId && item.pattern === winner.pattern);
    if (!exists) {
      winners.value = [...winners.value, winner];
    }
  }

  // line:won: la línea se premia una vez, la sala queda en pausa y pasa a la fase bingo.
  function applyLineWon(payload) {
    if (!payload) {
      return;
    }
    lastWinner.value = { ...payload, pattern: "LINE" };
    addWinner({
      playerId: payload.playerId,
      name: payload.name,
      pattern: "LINE",
      at: payload.at,
      songIndex: payload.songIndex
    });
    lineWon.value = { playerId: payload.playerId, name: payload.name, cells: payload.cells || [] };
    phase.value = "bingo";
    status.value = "paused";
    pausedReason.value = "line";
    clipEndsAt.value = null;
    clipRemainingMs.value = null;
  }

  // bingo:won: cartón completo. Termina la partida; si nadie había cantado línea, se la lleva también.
  function applyBingoWon(payload) {
    if (!payload) {
      return;
    }
    lastWinner.value = { ...payload, pattern: "FULL" };
    if (payload.alsoWonLine) {
      addWinner({
        playerId: payload.playerId,
        name: payload.name,
        pattern: "LINE",
        at: payload.at,
        songIndex: payload.songIndex
      });
    }
    addWinner({
      playerId: payload.playerId,
      name: payload.name,
      pattern: "FULL",
      at: payload.at,
      songIndex: payload.songIndex
    });
    phase.value = "bingo";
    status.value = "finished";
    endReason.value = "bingo";
    pausedReason.value = null;
    lineWon.value = null;
    clipEndsAt.value = null;
    clipRemainingMs.value = null;
  }

  function applyPaused(payload) {
    status.value = "paused";
    pausedReason.value = payload?.reason || "host";
  }

  function applyResumed() {
    status.value = "playing";
    pausedReason.value = null;
  }

  function applyEnded(payload) {
    status.value = "finished";
    pausedReason.value = null;
    endReason.value = payload?.reason || endReason.value;
  }

  function setStatus(next) {
    status.value = next;
  }

  function reset() {
    code.value = "";
    status.value = "lobby";
    players.value = [];
    currentTrack.value = null;
    currentIndex.value = -1;
    totalTracks.value = 0;
    played.value = [];
    recent.value = [];
    winners.value = [];
    pendingConfirmation.value = false;
    clipEndsAt.value = null;
    clipRemainingMs.value = null;
    phase.value = "line";
    pausedReason.value = null;
    endReason.value = null;
    pace.value = "normal";
    lastWinner.value = null;
    lineWon.value = null;
  }

  return {
    code,
    status,
    players,
    playersMax,
    currentTrack,
    currentIndex,
    totalTracks,
    played,
    recent,
    winners,
    pendingConfirmation,
    clipEndsAt,
    clipRemainingMs,
    phase,
    pausedReason,
    endReason,
    rows,
    cols,
    pace,
    clipSeconds,
    lastWinner,
    lineWon,
    applyState,
    applySongStarted,
    applyLineWon,
    applyBingoWon,
    applyPaused,
    applyResumed,
    applyEnded,
    setStatus,
    reset
  };
});
