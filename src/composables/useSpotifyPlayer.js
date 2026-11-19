import { onScopeDispose, ref } from "vue";
import { getSpotifyToken } from "../services/api.js";
import { sameTrack } from "../utils/tracks.js";

// Reconexiones automáticas seguidas antes de rendirse; cada una espera el doble que la anterior.
const MAX_AUTO_RECONNECTS = 5;
// Mientras haya una canción pendiente se pregunta al reproductor por su estado: si se pierde un
// evento player_state_changed, la canción se confirma igualmente.
const STATE_POLL_MS = 1000;

const SDK_URL = "https://sdk.scdn.co/spotify-player.js";

function loadSdk() {
  if (window.Spotify) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const previous = window.onSpotifyWebPlaybackSDKReady;
    window.onSpotifyWebPlaybackSDKReady = () => {
      previous?.();
      resolve();
    };
    if (document.querySelector("script[data-spotify-sdk]")) {
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.dataset.spotifySdk = "true";
    script.onerror = () => reject(new Error("initialization_error"));
    document.body.appendChild(script);
  });
}

export function useSpotifyPlayer({ onDevice, onConfirm, onError, onFailed, onRecovered } = {}) {
  const ready = ref(false);
  const reconnecting = ref(false);
  // Reconexión en marcha o programada: la pantalla no debe pedir nada al host mientras tanto
  const recovering = ref(false);
  const activated = ref(false);
  const deviceId = ref("");
  const errorCode = ref("");
  let player;
  let expected = null;
  let confirmedId = "";
  let retries = 0;
  let retryTimer = null;
  let pollTimer = null;

  function confirmFrom(state) {
    if (!state || state.paused || !expected) {
      return;
    }
    const current = state.track_window?.current_track;
    if (!sameTrack(expected, current) || confirmedId === expected.id) {
      return;
    }
    confirmedId = expected.id;
    stopPolling();
    // Si suena, el aviso de error anterior ya no vale
    errorCode.value = "";
    onConfirm?.(expected.id);
    onRecovered?.();
  }

  function stopPolling() {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  function startPolling() {
    if (pollTimer || !player) {
      return;
    }
    pollTimer = setInterval(async () => {
      if (!expected || confirmedId === expected.id) {
        stopPolling();
        return;
      }
      try {
        confirmFrom(await player.getCurrentState());
      } catch {
        // sin estado todavía: se vuelve a preguntar en un segundo
      }
    }, STATE_POLL_MS);
  }

  // Desconecta y vuelve a conectar el reproductor. Con `force` también si parece listo
  // (lo pide el servidor cuando una canción no suena).
  async function reconnect(force = false) {
    if (!player || !activated.value || reconnecting.value || (ready.value && !force)) {
      return false;
    }
    reconnecting.value = true;
    try {
      try {
        player.disconnect();
      } catch {
        // el reproductor ya estaba desconectado
      }
      const connected = await player.connect();
      if (!connected) {
        scheduleReconnect();
      }
      return connected;
    } catch {
      scheduleReconnect();
      return false;
    } finally {
      reconnecting.value = false;
    }
  }

  function scheduleReconnect() {
    if (!activated.value || retries >= MAX_AUTO_RECONNECTS) {
      recovering.value = false;
      return;
    }
    recovering.value = true;
    const delay = Math.min(1000 * 2 ** retries, 15000);
    retries += 1;
    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => reconnect(), delay);
  }

  function onBackOnline() {
    retries = 0;
    reconnect();
  }

  async function setup() {
    await loadSdk();
    player = new window.Spotify.Player({
      name: "Bingofy",
      volume: 0.8,
      getOAuthToken: async (callback) => {
        try {
          callback(await getSpotifyToken());
        } catch {
          errorCode.value = "SPOTIFY_TOKEN_EXPIRED";
          onError?.("SPOTIFY_TOKEN_EXPIRED");
        }
      }
    });

    player.addListener("ready", ({ device_id: id }) => {
      deviceId.value = id;
      ready.value = true;
      errorCode.value = "";
      retries = 0;
      clearTimeout(retryTimer);
      recovering.value = false;
      onDevice?.(id);
      onRecovered?.();
    });
    player.addListener("not_ready", () => {
      ready.value = false;
      scheduleReconnect();
    });
    player.addListener("player_state_changed", confirmFrom);
    player.addListener("initialization_error", () => {
      errorCode.value = "initialization_error";
      onError?.("initialization_error");
    });
    player.addListener("authentication_error", () => {
      ready.value = false;
      errorCode.value = "SPOTIFY_AUTH_FAILED";
      onError?.("SPOTIFY_AUTH_FAILED");
      scheduleReconnect();
    });
    player.addListener("account_error", () => {
      errorCode.value = "PREMIUM_REQUIRED";
      onError?.("PREMIUM_REQUIRED");
    });
    player.addListener("playback_error", () => {
      errorCode.value = "playback_error";
      onError?.("playback_error");
      if (expected && confirmedId !== expected.id) {
        onFailed?.(expected.id);
      }
    });
    player.addListener("autoplay_failed", () => {
      errorCode.value = "autoplay_failed";
      ready.value = false;
      onError?.("autoplay_failed");
    });
  }

  const starting = setup().catch(() => {
    errorCode.value = "initialization_error";
    onError?.("initialization_error");
  });

  function expectTrack(track) {
    expected = track;
    if (track?.id !== confirmedId) {
      confirmedId = "";
    }
    if (track && confirmedId !== track.id) {
      startPolling();
    } else {
      stopPolling();
    }
  }

  async function activate() {
    await starting;
    if (!player) {
      return false;
    }
    errorCode.value = "";
    await player.activateElement();
    activated.value = true;
    try {
      player.disconnect();
    } catch {
      // el reproductor todavía no tenía sesión
    }
    const connected = await player.connect();
    if (!connected) {
      ready.value = false;
      errorCode.value = "SPOTIFY_AUTH_FAILED";
      onError?.("SPOTIFY_AUTH_FAILED");
    }
    return connected;
  }

  window.addEventListener("online", onBackOnline);

  onScopeDispose(() => {
    window.removeEventListener("online", onBackOnline);
    clearTimeout(retryTimer);
    stopPolling();
    player?.disconnect();
  });

  return { ready, reconnecting, recovering, activated, deviceId, errorCode, expectTrack, activate, reconnect };
}
