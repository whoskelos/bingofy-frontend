import { computed, onScopeDispose, ref, toValue, watch } from "vue";

/*
  Cuenta atrás del corte de la canción.
  El servidor solo manda cuándo termina (clipEndsAt), no cuánto dura. La duración total
  se deduce del primer instante en que se ve cada corte y solo puede crecer, así que
  tras reconectar a mitad de un corte el arco se corrige con el siguiente.
*/
export function useClipCountdown(endsAtSource, activeSource = true) {
  const now = ref(Date.now());
  const totalMs = ref(0);
  let timer = null;

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    if (!timer) {
      timer = setInterval(() => {
        now.value = Date.now();
      }, 200);
    }
  }

  const endsAtMs = computed(() => {
    const value = toValue(endsAtSource);
    const time = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(time) ? time : null;
  });

  const running = computed(() => endsAtMs.value !== null && Boolean(toValue(activeSource)));

  const remainingMs = computed(() => {
    if (!running.value) {
      return null;
    }
    return Math.max(0, endsAtMs.value - now.value);
  });

  watch(endsAtMs, (value) => {
    now.value = Date.now();
    if (value !== null) {
      totalMs.value = Math.max(totalMs.value, value - now.value);
    }
  }, { immediate: true });

  watch(running, (value) => (value ? start() : stop()), { immediate: true });

  onScopeDispose(stop);

  const secondsLeft = computed(() => (remainingMs.value === null ? null : Math.ceil(remainingMs.value / 1000)));

  const progress = computed(() => {
    if (remainingMs.value === null || totalMs.value <= 0) {
      return null;
    }
    return Math.min(1, remainingMs.value / totalMs.value);
  });

  return { secondsLeft, progress };
}
