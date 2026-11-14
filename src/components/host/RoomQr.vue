<script setup>
import { computed } from "vue";
import { useClipboard } from "../../composables/useClipboard.js";
import { useRoomQr } from "../../composables/useRoomQr.js";
import { displayRoomUrl } from "../../utils/roomUrl.js";
import AppButton from "../common/AppButton.vue";
import RoomCode from "../common/RoomCode.vue";

const props = defineProps({
  code: { type: String, required: true }
});

const { url, qrDataUrl, error } = useRoomQr(() => props.code);
const { copied, copy } = useClipboard();
const visibleUrl = computed(() => displayRoomUrl(url.value));
</script>

<template>
  <section class="room-qr" aria-label="Entrada a la sala">
    <div class="room-qr__scan">
      <img
        v-if="qrDataUrl"
        class="room-qr__image"
        :src="qrDataUrl"
        :alt="`Código QR para unirse a la sala ${code}`"
        width="320"
        height="320"
      />
      <p v-else-if="error" class="alert danger">{{ error }}</p>
    </div>
    <div class="room-qr__text">
      <p class="room-qr__lead">Escanea el QR con la cámara del móvil o escribe el código en</p>
      <p class="room-qr__url">{{ visibleUrl }}</p>
      <RoomCode class="room-qr__code" :code="code" />
      <AppButton class="room-qr__copy" type="button" variant="secondary" @click="copy(url)">
        {{ copied ? "Enlace copiado" : "Copiar enlace" }}
      </AppButton>
    </div>
    <div v-if="$slots.default" class="room-qr__extra">
      <slot />
    </div>
  </section>
</template>

<style scoped>
/* Fila de arriba: QR y código. Fila de abajo, a todo el ancho: quién ha entrado. */
.room-qr {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 2.2em;
  row-gap: 1.2em;
  height: 100%;
  min-height: 0;
}
/* El QR siempre sobre blanco puro y margen amplio: se lee desde el sofá */
.room-qr__scan {
  height: 100%;
  max-height: 54vh;
  min-height: 10em;
  aspect-ratio: 1;
}
.room-qr__image {
  display: block;
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0.35em 0.35em 0 #05082a;
  image-rendering: pixelated;
}
.room-qr__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6em;
  min-width: 0;
}
.room-qr__lead { font-size: 1.1em; color: var(--ink-soft); max-width: 26em; }
.room-qr__url {
  font-size: 1.5em;
  font-weight: 760;
  font-stretch: 82%;
  overflow-wrap: anywhere;
  line-height: 1.1;
}
.room-qr__code { width: 100%; max-width: 32em; margin-top: 0.3em; }
.room-qr__copy { margin-top: 0.4em; font-size: 1em; }
.room-qr__extra {
  grid-column: 1 / -1;
  align-self: stretch;
  max-height: min(28vh, 12em);
  padding-top: 0.9em;
  border-top: 2px solid var(--line);
  overflow-y: auto;
  scrollbar-width: thin;
}

@media (max-width: 899px), (max-height: 519px) {
  .room-qr { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto; gap: 1.2rem; height: auto; }
  .room-qr__scan { width: min(100%, 20rem); height: auto; max-height: none; min-height: 0; }
  .room-qr__lead { font-size: 1rem; }
  .room-qr__url { font-size: 1.2rem; }
  .room-qr__extra { max-height: none; overflow: visible; }
}
</style>
