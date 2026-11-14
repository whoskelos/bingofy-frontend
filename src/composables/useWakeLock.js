import { onMounted, onUnmounted } from "vue";

export function useWakeLock() {
  let sentinel = null;
  let active = true;

  async function request() {
    if (!active || !("wakeLock" in navigator)) {
      return;
    }
    try {
      sentinel = await navigator.wakeLock.request("screen");
    } catch {
      sentinel = null;
    }
  }

  function onVisible() {
    if (document.visibilityState === "visible") {
      request();
    }
  }

  onMounted(() => {
    request();
    document.addEventListener("visibilitychange", onVisible);
  });

  onUnmounted(() => {
    active = false;
    document.removeEventListener("visibilitychange", onVisible);
    sentinel?.release?.().catch(() => {});
  });
}
