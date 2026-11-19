<script setup>
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import ConnectionStatus from "../../components/common/ConnectionStatus.vue";
import AlertMessage from "../../components/common/AlertMessage.vue";
import AppButton from "../../components/common/AppButton.vue";
import BrandMark from "../../components/common/BrandMark.vue";
import HostControls from "../../components/host/HostControls.vue";
import PlayerList from "../../components/host/PlayerList.vue";
import RoomQr from "../../components/host/RoomQr.vue";
import SongHistory from "../../components/host/SongHistory.vue";
import WinnerBanner from "../../components/host/WinnerBanner.vue";
import CurrentSong from "../../components/player/CurrentSong.vue";
import { useSocket } from "../../composables/useSocket.js";
import { useSpotifyPlayer } from "../../composables/useSpotifyPlayer.js";
import { useRoomStore } from "../../stores/room.js";
import { useSessionStore } from "../../stores/session.js";
import { errorMessage } from "../../utils/errorMessages.js";
import { endReasonText, isClaimPause, phaseLabel, songNote } from "../../utils/gameStatus.js";

const route = useRoute();
const room = useRoomStore();
const session = useSessionStore();
const code = computed(() => String(route.params.code || "").toUpperCase());

const playerMessages = {
  initialization_error: "Este navegador no puede reproducir Spotify.",
  playback_error: "Spotify no ha podido reproducir la canción.",
  autoplay_failed: "El navegador ha bloqueado el audio. Pulsa Activar reproductor."
};

const spotify = useSpotifyPlayer({
  onDevice(deviceId) {
    emit("device:register", { deviceId });
  },
  onConfirm(trackId) {
    emit("song:confirmed", { trackId });
  },
  onFailed(trackId) {
    emit("song:failed", { trackId });
  },
  onRecovered() {
    if (session.authError === "SPOTIFY_AUTH_FAILED" || session.authError === "SPOTIFY_TOKEN_EXPIRED") {
      session.clearAuthError();
    }
  },
  onError(error) {
    if (error === "SPOTIFY_TOKEN_EXPIRED" || error === "SPOTIFY_AUTH_FAILED" || error === "PREMIUM_REQUIRED") {
      session.setAuthError(error);
    }
  }
});

const { status, on, emit } = useSocket("/host", {
  onConnect(socket) {
    socket.emit("room:open", { code: code.value });
  }
});

on("room:state", room.applyState);
on("song:started", room.applySongStarted);
on("line:won", room.applyLineWon);
on("bingo:won", room.applyBingoWon);
on("game:paused", room.applyPaused);
on("game:resumed", room.applyResumed);
on("game:ended", room.applyEnded);
on("error", (payload) => session.setAuthError(payload?.code));
// El servidor no ha recibido confirmación de la canción: pide reconectar el reproductor.
on("player:reconnect", () => {
  spotify.reconnect(true);
});

watch(() => room.currentTrack, (track) => spotify.expectTrack(track), { immediate: true });

const playerStatus = computed(() => {
  if (spotify.errorCode.value && playerMessages[spotify.errorCode.value]) {
    return "con error";
  }
  if (spotify.reconnecting.value) {
    return "reconectando";
  }
  if (spotify.ready.value) {
    return "listo";
  }
  if (spotify.activated.value) {
    return "activando";
  }
  return "sin activar";
});

const playerTone = computed(() => {
  if (playerStatus.value === "listo") {
    return "ok";
  }
  return playerStatus.value === "con error" ? "bad" : "warn";
});

const note = computed(() => songNote(room.status, room.pausedReason, room.clipEndsAt));

// El host ve todas las canciones sonadas, la última arriba: sirve para validar un canto
const playedNewestFirst = computed(() => [...room.played].reverse());

const inGame = computed(() => room.status === "playing" || room.status === "paused");
// El banner solo se queda fijo en la pausa de la línea y al terminar la partida
const showWinners = computed(() => room.status === "finished" || (room.status === "paused" && isClaimPause(room.pausedReason)));
const endText = computed(() => (room.status === "finished" ? endReasonText(room.endReason) : ""));

const playerNotice = computed(() => {
  if (room.status === "paused" && room.pausedReason === "connection") {
    return "Varias canciones seguidas no han llegado a sonar. Comprueba la conexión y pulsa Reanudar para reintentar la canción actual.";
  }
  if (spotify.reconnecting.value || spotify.recovering.value) {
    return "Reconectando el reproductor de Spotify…";
  }
  if (session.authError === "SPOTIFY_AUTH_FAILED" || session.authError === "SPOTIFY_TOKEN_EXPIRED") {
    return "El reproductor de Spotify se ha desconectado. Actívalo otra vez en esta sala. Si no responde, reconecta la cuenta.";
  }
  if (session.authError && errorMessage(session.authError) !== errorMessage("")) {
    return errorMessage(session.authError);
  }
  if (spotify.activated.value && !spotify.ready.value) {
    return "El reproductor se ha dormido. Actívalo otra vez. La sala sigue abierta.";
  }
  return playerMessages[spotify.errorCode.value] || "";
});

const needsLogin = computed(() => {
  if (spotify.recovering.value || spotify.reconnecting.value) {
    return false;
  }
  return session.expired
    || session.authError === "SPOTIFY_AUTH_FAILED"
    || session.authError === "SPOTIFY_TOKEN_EXPIRED"
    || session.authError === "PREMIUM_REQUIRED";
});

function reconnect() {
  session.rememberReturn(route.fullPath);
  session.login();
}
</script>

<template>
  <main class="hall-screen">
    <header class="hall-head">
      <div class="hall-head__id">
        <BrandMark />
        <p class="hall-head__room">Sala {{ code }}</p>
        <p v-if="room.status !== 'lobby' && room.currentIndex >= 0" class="hall-head__song">Canción {{ room.currentIndex + 1 }}</p>
        <p v-if="inGame" class="hall-head__phase">Se juega: {{ phaseLabel(room.phase) }}</p>
      </div>
      <ConnectionStatus :socket-status="status" :player-status="playerStatus" :player-tone="playerTone" />
    </header>
    <AlertMessage v-if="playerNotice" tone="danger" class="hall-notice">
      {{ playerNotice }}
      <AppButton v-if="needsLogin" type="button" @click="reconnect">
        Reconectar Spotify
      </AppButton>
    </AlertMessage>
    <WinnerBanner v-if="showWinners" :winners="room.winners" />
    <section v-if="room.status === 'lobby'" class="lobby">
      <RoomQr :code="code">
        <PlayerList :players="room.players" :players-max="room.playersMax" />
      </RoomQr>
    </section>
    <section v-else class="live">
      <CurrentSong
        stage
        :track="room.currentTrack"
        :waiting="false"
        :playing="room.status === 'playing'"
        :note="note"
        :ends-at="room.clipEndsAt || ''"
      />
      <SongHistory :songs="playedNewestFirst" show-count searchable />
    </section>
    <footer class="hall-bar">
      <HostControls
        :status="room.status"
        :paused-reason="room.pausedReason || ''"
        :player-ready="spotify.ready.value"
        @activate="spotify.activate()"
        @start="emit('game:start', {})"
        @next="emit('game:next', {})"
        @pause="emit('game:pause', {})"
        @resume="emit('game:resume', {})"
        @continue="emit('game:continue', {})"
        @end="emit('game:end', {})"
      />
      <div v-if="room.status === 'finished'" class="finished">
        <p class="finished__title display">Partida terminada</p>
        <p v-if="endText" class="finished__reason">{{ endText }}</p>
        <RouterLink class="btn" to="/host" @click="room.reset()">Nueva partida</RouterLink>
      </div>
    </footer>
  </main>
</template>

<style scoped>
/* Móvil o ventana pequeña: una columna que hace scroll */
.hall-screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: calc(1rem + var(--safe-top)) 1rem calc(1rem + var(--safe-bottom));
  font-size: 1rem;
}
.hall-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1.5rem; }
.hall-head__id { display: flex; align-items: center; gap: 0.4rem 1.4rem; flex-wrap: wrap; }
.hall-head__room {
  font-size: 1.3em;
  font-weight: 800;
  font-stretch: 78%;
  padding: 0.05em 0.6em 0.1em;
  border-radius: 999px;
  background: var(--bg-raised);
  letter-spacing: 0.04em;
}
.hall-head__song { color: var(--ink-soft); font-weight: 650; }
.hall-head__phase {
  padding: 0.05em 0.7em 0.1em;
  border-radius: 999px;
  background: var(--mark);
  color: var(--mark-ink);
  font-weight: 750;
  font-stretch: 85%;
}
.hall-notice { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6em 1.2em; font-size: 1.05em; }
.hall-notice :deep(.btn) { font-size: 1em; min-height: 2.6em; }

.lobby, .live { display: grid; gap: 1.6rem; min-height: 0; flex: 1; align-content: start; }

.hall-bar { display: grid; gap: 0.8em; }
.finished { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6em 1.4em; }
.finished__title { font-size: 2.4em; }
.finished__reason { flex-basis: 100%; color: var(--ink-soft); font-size: 1.1em; order: 3; }

@media (max-width: 899px), (max-height: 519px) {
  .hall-bar {
    position: sticky;
    bottom: 0;
    margin: 0 -1rem;
    padding: 0.8rem 1rem calc(0.8rem + var(--safe-bottom));
    background: var(--bg);
    border-top: 2px solid var(--line);
  }
}

/* Pantalla del salón: portátil conectado a la tele. Todo escala con el ancho. */
@media (min-width: 900px) and (min-height: 520px) {
  .hall-screen {
    height: 100%;
    min-height: 0;
    font-size: clamp(16px, 1.35vw, 80px);
    padding: calc(2.2vh + var(--safe-top)) 2.4vw calc(2.4vh + var(--safe-bottom));
    gap: 2vh;
  }
  .hall-head { flex-wrap: nowrap; }
  .hall-head__id { flex-wrap: nowrap; gap: 1.4em; }
  .hall-head :deep(.status-row) { font-size: 1em; gap: 0.4em 1.8em; }
  .hall-head :deep(.brand) { font-size: 1.7em; }
  .hall-head__room { font-size: 1.3em; }
  .hall-head__song { font-size: 1.1em; }
  .hall-head__phase { font-size: 1.1em; }
  .lobby { grid-template-rows: minmax(0, 1fr); align-content: stretch; }
  .lobby > :first-child { height: 100%; }
  .hall-screen :deep(.winners__title) { font-size: 4.4em; }
  .hall-screen :deep(.winners__name) { font-size: 2.8em; }
  .hall-screen :deep(.winners__pattern) { font-size: 1.3em; }
  .live { grid-template-columns: minmax(0, 1fr) minmax(0, 20em); gap: 3vw; align-content: stretch; align-items: stretch; }
  .live > :nth-child(2) { padding-left: 2vw; border-left: 2px solid var(--line); }
  .hall-bar { gap: 1em; }
}
</style>
