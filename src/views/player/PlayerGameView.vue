<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import AlertMessage from "../../components/common/AlertMessage.vue";
import ConnectionStatus from "../../components/common/ConnectionStatus.vue";
import BingoButton from "../../components/player/BingoButton.vue";
import BingoCard from "../../components/player/BingoCard.vue";
import CurrentSong from "../../components/player/CurrentSong.vue";
import WinnerBanner from "../../components/host/WinnerBanner.vue";
import LoadingState from "../../components/common/LoadingState.vue";
import { useSocket } from "../../composables/useSocket.js";
import { useWakeLock } from "../../composables/useWakeLock.js";
import { usePlayerStore } from "../../stores/player.js";
import { useRoomStore } from "../../stores/room.js";
import { errorMessage } from "../../utils/errorMessages.js";
import { cardLocked, songNote } from "../../utils/gameStatus.js";

const route = useRoute();
const router = useRouter();
const player = usePlayerStore();
const room = useRoomStore();
const code = computed(() => String(route.params.code || "").toUpperCase());

useWakeLock();

const statusLabel = {
  lobby: "Esperando a que empiece",
  playing: "En juego",
  paused: "En pausa",
  finished: "Partida terminada"
};

const { status, on, emit } = useSocket("/player", {
  onConnect(socket) {
    socket.emit("room:join", { code: code.value, playerId: player.playerId });
  }
});

on("room:state", room.applyState);
on("player:card", player.setCard);
on("song:started", room.applySongStarted);
on("bingo:won", (payload) => {
  room.applyBingoWon(payload);
  player.setRejection("");
});
on("bingo:rejected", (payload) => player.setRejection(payload?.reason || payload?.code || ""));
on("card:marked", player.applyMarked);
on("game:paused", () => room.setStatus("paused"));
on("game:resumed", () => room.setStatus("playing"));
on("game:ended", () => room.setStatus("finished"));
on("error", (payload) => {
  if (payload?.code === "ROOM_NOT_FOUND") {
    player.clear();
  }
});

const note = computed(() => songNote(room.status, room.pauseReason, room.clipEndsAt));

const ended = computed(() => room.status === "finished");
const locked = computed(() => cardLocked(room.status));
const canClaim = computed(() => room.status === "playing" || room.status === "paused");

function toggle(index) {
  if (locked.value) {
    return;
  }
  const mark = player.toggleMark(index);
  if (mark) {
    emit("card:mark", mark);
  }
}

async function leave() {
  await router.push({ name: "home" });
  player.clear();
}

function claim(pattern) {
  if (!player.card || ended.value) {
    return;
  }
  player.setRejection("");
  emit("bingo:claim", { cardId: player.card.id, pattern });
}
</script>

<template>
  <main class="game">
    <header class="game__top">
      <CurrentSong
        :track="room.currentTrack"
        :waiting="room.status === 'lobby' || !room.currentTrack"
        :playing="room.status === 'playing'"
        :note="note"
        :ends-at="room.clipEndsAt || ''"
      />
    </header>
    <div class="game__body">
      <div class="game__meta">
        <p class="game__state">{{ statusLabel[room.status] || room.status }}</p>
        <ConnectionStatus :socket-status="status" />
      </div>
      <WinnerBanner :winners="room.winners" />
      <LoadingState v-if="!player.card" />
      <BingoCard v-else :card="player.card" :locked="locked" @toggle="toggle" />
    </div>
    <footer v-if="player.card" class="game__bar">
      <AlertMessage v-if="player.rejection && !ended" tone="danger">{{ errorMessage(player.rejection) }}</AlertMessage>
      <BingoButton v-if="!ended" :disabled="!canClaim" @claim="claim" />
      <button v-else type="button" class="btn secondary" @click="leave">Volver al inicio</button>
    </footer>
  </main>
</template>

<style scoped>
.game {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: min(36rem, 100%);
  margin: 0 auto;
}
.game__top {
  position: sticky;
  top: 0;
  z-index: 2;
  padding-top: var(--safe-top);
  background: var(--bg-raised);
}
.game__body { display: grid; align-content: start; gap: 0.8rem; padding: 0.8rem 0.7rem 1rem; }
.game__meta { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.2rem 1rem; }
.game__state { font-size: 1.25rem; font-weight: 800; font-stretch: 76%; }
.game__bar {
  position: sticky;
  bottom: 0;
  z-index: 2;
  display: grid;
  gap: 0.6rem;
  padding: 0.7rem 0.7rem calc(0.7rem + var(--safe-bottom));
  background: var(--bg);
  border-top: 2px solid var(--line);
}
</style>
