<script setup>
import AppButton from "../common/AppButton.vue";
import { isClaimPause } from "../../utils/gameStatus.js";

defineProps({
  status: { type: String, required: true },
  pausedReason: { type: String, default: "" },
  playerReady: { type: Boolean, default: false }
});

const emit = defineEmits(["activate", "start", "next", "pause", "resume", "continue", "end"]);
</script>

<template>
  <section class="controls" aria-label="Controles de la partida">
    <AppButton v-if="status !== 'finished' && !playerReady" type="button" variant="secondary" @click="emit('activate')">
      Activar reproductor
    </AppButton>
    <AppButton v-if="status === 'lobby'" type="button" :disabled="!playerReady" @click="emit('start')">
      Empezar partida
    </AppButton>
    <p v-if="status === 'lobby' && !playerReady" class="controls__hint">
      Pulsa Activar reproductor y espera a que esté listo para empezar. La sala no se cierra.
    </p>
    <p v-else-if="status !== 'finished' && !playerReady" class="controls__hint">
      El reproductor se ha desconectado. Actívalo otra vez para seguir con esta partida.
    </p>
    <AppButton v-if="status === 'playing'" type="button" @click="emit('next')">Siguiente</AppButton>
    <AppButton v-if="status === 'playing'" type="button" variant="secondary" @click="emit('pause')">Pausa</AppButton>
    <AppButton v-if="status === 'paused' && isClaimPause(pausedReason)" type="button" @click="emit('continue')">
      {{ pausedReason === 'line' ? 'Seguir con el bingo' : 'Seguir' }}
    </AppButton>
    <AppButton v-if="status === 'paused' && !isClaimPause(pausedReason)" type="button" @click="emit('resume')">
      Reanudar
    </AppButton>
    <!-- Terminar queda lejos del resto para que nadie lo pulse sin querer -->
    <AppButton
      v-if="status === 'playing' || status === 'paused'"
      class="controls__end"
      type="button"
      variant="danger"
      @click="emit('end')"
    >
      Terminar
    </AppButton>
  </section>
</template>

<style scoped>
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 0.8em 1em; }
.controls :deep(.btn) { min-height: 3em; font-size: 1.25em; padding-inline: 1.6em; }
.controls__hint { flex-basis: 100%; color: var(--ink-soft); font-size: 1.05em; order: 5; }
.controls__end { margin-left: auto; }

@media (max-width: 899px), (max-height: 519px) {
  .controls :deep(.btn) { font-size: 1.1rem; }
  .controls :deep(.btn) { flex: 1 1 8rem; }
  .controls__end { margin-left: 0; }
}
</style>
