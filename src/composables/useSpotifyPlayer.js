import { onScopeDispose, ref } from "vue";
import { getSpotifyToken } from "../services/api.js";
import { sameTrack } from "../utils/tracks.js";

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

export function useSpotifyPlayer({ onDevice, onConfirm, onError, onRecovered } = {}) {
  const ready = ref(false);
  const activated = ref(false);
  const deviceId = ref("");
  const errorCode = ref("");
  let player;
  let expected = null;
  let confirmedId = "";

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
      onDevice?.(id);
      onRecovered?.();
    });
    player.addListener("not_ready", () => {
      ready.value = false;
    });
    player.addListener("player_state_changed", (state) => {
      if (!state || state.paused || !expected) {
        return;
      }
      const current = state.track_window?.current_track;
      if (!sameTrack(expected, current) || confirmedId === expected.id) {
        return;
      }
      confirmedId = expected.id;
      onConfirm?.(expected.id);
    });
    player.addListener("initialization_error", () => {
      errorCode.value = "initialization_error";
      onError?.("initialization_error");
    });
    player.addListener("authentication_error", () => {
      ready.value = false;
      errorCode.value = "SPOTIFY_AUTH_FAILED";
      onError?.("SPOTIFY_AUTH_FAILED");
    });
    player.addListener("account_error", () => {
      errorCode.value = "PREMIUM_REQUIRED";
      onError?.("PREMIUM_REQUIRED");
    });
    player.addListener("playback_error", () => {
      errorCode.value = "playback_error";
      onError?.("playback_error");
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

  onScopeDispose(() => {
    player?.disconnect();
  });

  return { ready, activated, deviceId, errorCode, expectTrack, activate };
}
