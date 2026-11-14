import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useClipCountdown } from "../src/composables/useClipCountdown.js";

describe("useClipCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-14T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup(endsAt, active = true) {
    const endsAtRef = ref(endsAt);
    const activeRef = ref(active);
    const scope = effectScope();
    const countdown = scope.run(() => useClipCountdown(endsAtRef, activeRef));
    return { endsAtRef, activeRef, scope, ...countdown };
  }

  it("devuelve null sin fin de corte", () => {
    const { secondsLeft, progress, scope } = setup("");
    expect(secondsLeft.value).toBeNull();
    expect(progress.value).toBeNull();
    scope.stop();
  });

  it("cuenta hacia atrás y el progreso baja de 1 a 0", async () => {
    const { secondsLeft, progress, scope } = setup("2026-11-14T12:00:20.000Z");
    expect(secondsLeft.value).toBe(20);
    expect(progress.value).toBe(1);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(secondsLeft.value).toBe(10);
    expect(progress.value).toBeCloseTo(0.5, 1);
    await vi.advanceTimersByTimeAsync(11_000);
    expect(secondsLeft.value).toBe(0);
    expect(progress.value).toBe(0);
    scope.stop();
  });

  it("se detiene cuando deja de estar activo", async () => {
    const { secondsLeft, activeRef, scope } = setup("2026-11-14T12:00:20.000Z");
    activeRef.value = false;
    await nextTick();
    expect(secondsLeft.value).toBeNull();
    scope.stop();
  });

  it("conserva la duración más larga vista para dibujar el arco del siguiente corte", async () => {
    const { progress, endsAtRef, scope } = setup("2026-11-14T12:00:20.000Z");
    await vi.advanceTimersByTimeAsync(20_000);
    endsAtRef.value = "2026-11-14T12:00:40.000Z";
    await nextTick();
    expect(progress.value).toBe(1);
    scope.stop();
  });
});
