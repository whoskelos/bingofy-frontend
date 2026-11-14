<script setup>
import { computed } from "vue";

const props = defineProps({
  socketStatus: { type: String, default: "connecting" },
  playerStatus: { type: String, default: "" },
  // ok, warn o bad. Define el color del punto del reproductor.
  playerTone: { type: String, default: "warn" }
});

const labels = {
  connecting: "Conectando",
  connected: "Conectado",
  reconnecting: "Reconectando",
  disconnected: "Sin conexión"
};

const socketTone = computed(() => {
  if (props.socketStatus === "connected") {
    return "ok";
  }
  return props.socketStatus === "disconnected" ? "bad" : "warn";
});
</script>

<template>
  <p class="status-row">
    <span class="status" :class="socketTone"><i aria-hidden="true"></i>Sala: {{ labels[socketStatus] || socketStatus }}</span>
    <span v-if="playerStatus" class="status" :class="playerTone"><i aria-hidden="true"></i>Reproductor: {{ playerStatus }}</span>
  </p>
</template>

<style scoped>
.status { display: inline-flex; align-items: center; gap: 0.5em; }
/* Punto lleno = bien, aro = en curso, cuadrado = fallo: no depende solo del color */
.status i {
  width: 0.7em;
  height: 0.7em;
  flex: none;
  border-radius: 50%;
  background: currentColor;
}
.status.ok i { color: var(--ok); }
.status.warn i { color: var(--warn); background: transparent; box-shadow: inset 0 0 0 0.16em currentColor; }
.status.bad i { color: var(--hot); border-radius: 1px; }
</style>
