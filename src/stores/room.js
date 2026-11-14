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
  const winners = ref([]);
  const pendingConfirmation = ref(false);
  const clipEndsAt = ref(null);
  const clipRemainingMs = ref(null);
  const pauseReason = ref(null);
  const lastWinner = ref(null);

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
    winners.value = state.winners || [];
    pendingConfirmation.value = Boolean(state.pendingConfirmation);
    clipEndsAt.value = state.clipEndsAt || null;
    clipRemainingMs.value = Number.isFinite(state.clipRemainingMs) ? state.clipRemainingMs : null;
    pauseReason.value = state.pauseReason || null;
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
    pauseReason.value = null;
  }

  function applyBingoWon(payload) {
    if (!payload) {
      return;
    }
    lastWinner.value = payload;
    const exists = winners.value.some((winner) => winner.playerId === payload.playerId && winner.pattern === payload.pattern);
    if (!exists) {
      winners.value = [...winners.value, payload];
    }
    status.value = "paused";
    pauseReason.value = "bingo";
    clipEndsAt.value = null;
    clipRemainingMs.value = null;
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
    winners.value = [];
    pendingConfirmation.value = false;
    clipEndsAt.value = null;
    clipRemainingMs.value = null;
    pauseReason.value = null;
    lastWinner.value = null;
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
    winners,
    pendingConfirmation,
    clipEndsAt,
    clipRemainingMs,
    pauseReason,
    lastWinner,
    applyState,
    applySongStarted,
    applyBingoWon,
    setStatus,
    reset
  };
});
