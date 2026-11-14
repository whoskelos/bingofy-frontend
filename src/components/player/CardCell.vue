<script setup>
import { formatArtists } from "../../utils/tracks.js";

defineProps({
  cell: { type: Object, required: true },
  marked: { type: Boolean, default: false },
  locked: { type: Boolean, default: false }
});

defineEmits(["toggle"]);
</script>

<template>
  <button
    type="button"
    class="cell"
    :class="{ 'is-marked': marked, 'is-free': cell.free, 'is-locked': locked }"
    :aria-pressed="marked"
    :disabled="cell.free || locked"
    @click="$emit('toggle')"
  >
    <span class="cell__frame">
      <!-- El nombre y el artista ya van en el texto de la casilla: la carátula es decorativa -->
      <img v-if="cell.albumImageUrl && !cell.free" :src="cell.albumImageUrl" alt="" loading="lazy" />
      <span v-if="cell.free" class="cell__free display">Libre</span>
      <span v-else class="cell__caption">
        <strong>{{ cell.name }}</strong>
        <span>{{ formatArtists(cell.artists) }}</span>
      </span>
      <!-- Mancha de rotulador de bingo: círculo amarillo con marca, no solo color -->
      <span v-if="marked && !cell.free" class="cell__dab" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
    </span>
  </button>
</template>

<style scoped>
.cell {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  padding: 0;
  border: 2px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-raised);
  color: #f4f6ff;
  text-align: left;
  touch-action: manipulation;
  overflow: hidden;
}
/* El marco mide la casilla: las unidades cq de dentro salen de aquí */
.cell__frame {
  position: absolute;
  inset: 0;
  container-type: size;
}
.cell img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 140ms;
}

/* Franja sólida bajo el texto para que se lea sobre cualquier carátula */
.cell__caption {
  position: absolute;
  inset: auto 0 0;
  display: grid;
  gap: 1px;
  padding: 1.6cqh 5cqw 5cqh;
  background: linear-gradient(to top, #080c36 62%, rgb(8 12 54 / 0%));
  padding-top: 14cqh;
}
.cell__caption strong {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: clamp(0.62rem, 15cqw, 0.95rem);
  font-weight: 800;
  font-stretch: 68%;
  line-height: 1.02;
}
.cell__caption span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #bcc6f6;
  font-size: clamp(0.56rem, 12cqw, 0.8rem);
  font-weight: 560;
  font-stretch: 82%;
  line-height: 1.1;
}

.cell__dab {
  position: absolute;
  top: 9%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 64cqw;
  aspect-ratio: 1;
  margin-left: -32cqw;
  border-radius: 50%;
  background: rgb(255 210 31 / 90%);
  color: #0f1a63;
  animation: dab 140ms ease-out;
}
.cell__dab svg {
  width: 56%;
  fill: none;
  stroke: currentColor;
  stroke-width: 3.4;
  stroke-linecap: square;
}

.is-marked { border-color: var(--mark); }
.is-marked img { filter: saturate(0.35) brightness(0.8); }

.is-free .cell__frame { display: grid; place-items: center; }
.is-free {
  border-color: var(--mark);
  background: var(--mark);
  color: var(--mark-ink);
}
.cell:disabled { opacity: 1; }
.cell.is-locked { cursor: not-allowed; }
.cell__free { font-size: clamp(1.1rem, 28cqw, 1.8rem); }

@keyframes dab {
  from { transform: scale(1.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
