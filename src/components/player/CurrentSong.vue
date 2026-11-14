<script setup>
import { computed } from "vue";
import VinylDisc from "../common/VinylDisc.vue";
import { useClipCountdown } from "../../composables/useClipCountdown.js";
import { formatArtists } from "../../utils/tracks.js";

const props = defineProps({
  track: { type: Object, default: null },
  waiting: { type: Boolean, default: false },
  endsAt: { type: String, default: "" },
  // El disco gira solo mientras la partida está en marcha
  playing: { type: Boolean, default: false },
  // Texto para cuando no hay cuenta atrás (pausa, cargando)
  note: { type: String, default: "" },
  // Escenario grande para la pantalla del host
  stage: { type: Boolean, default: false }
});

const { secondsLeft, progress } = useClipCountdown(() => props.endsAt, () => !props.waiting);

const artists = computed(() => (props.track ? formatArtists(props.track.artists) : ""));
const showTrack = computed(() => !props.waiting && Boolean(props.track));
const spinning = computed(() => props.playing && showTrack.value);
const emptyText = computed(() => (props.waiting ? "Esperando a que empiece la partida." : "Todavía no hay canción."));
</script>

<template>
  <section class="song" :class="stage ? 'song--stage' : 'song--strip'" aria-label="Canción actual">
    <div class="song__disc">
      <VinylDisc
        :art="showTrack ? track.albumImageUrl : ''"
        :spinning="spinning"
        :progress="stage ? (progress ?? 0) : null"
      />
    </div>
    <div class="song__text" aria-live="polite">
      <template v-if="showTrack">
        <h2 class="song__title display">{{ track.name }}</h2>
        <p class="song__artist">{{ artists }}</p>
      </template>
      <p v-else class="song__empty">{{ emptyText }}</p>
    </div>
    <p v-if="secondsLeft != null" class="song__clock" role="timer" aria-label="Segundos restantes">
      <span class="song__seconds">{{ secondsLeft }}</span><span class="song__unit">s</span>
    </p>
    <p v-else-if="note && showTrack" class="song__note">{{ note }}</p>
    <span v-if="!stage && progress != null" class="song__bar" aria-hidden="true">
      <i :style="{ transform: `scaleX(${progress})` }"></i>
    </span>
  </section>
</template>

<style scoped>
.song { position: relative; }
.song__artist { color: var(--ink-soft); font-weight: 560; }
.song__empty { font-weight: 600; color: var(--ink-soft); }
.song__clock { display: flex; align-items: baseline; gap: 0.1em; font-variant-numeric: tabular-nums; }
.song__seconds { font-weight: 900; font-stretch: 66%; line-height: 0.85; }
.song__unit { font-weight: 700; font-stretch: 80%; color: var(--ink-soft); }
.song__note { font-weight: 700; color: var(--mark); }

/* Franja del móvil: siempre visible arriba */
.song--strip {
  display: grid;
  grid-template-columns: 3.6rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.2rem 0.8rem;
  padding: 0.55rem 0.75rem 0.7rem;
  background: var(--bg-raised);
  border-bottom: 2px solid var(--line);
}
.song--strip .song__title {
  font-size: 1.45rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.song--strip .song__artist {
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.song--strip .song__empty { font-size: 1rem; }
.song--strip .song__seconds { font-size: 2.3rem; }
.song--strip .song__unit { font-size: 1rem; }
.song--strip .song__note {
  grid-column: 1 / -1;
  font-size: 0.9rem;
  color: var(--ink);
}
.song__bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 4px;
  background: transparent;
  overflow: hidden;
}
.song__bar i {
  display: block;
  height: 100%;
  background: var(--mark);
  transform-origin: left center;
  transition: transform 220ms linear;
}

/* Escenario del host: el disco manda */
.song--stage {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    "disc text"
    "disc clock";
  grid-template-rows: auto auto;
  align-content: center;
  align-items: end;
  column-gap: 2em;
  min-height: 0;
}
.song--stage .song__disc {
  grid-area: disc;
  width: min(62vh, 34vw);
  min-width: 14em;
  align-self: center;
}
.song--stage .song__text { grid-area: text; align-self: end; display: grid; gap: 0.5em; }
.song--stage .song__title {
  font-size: 3em;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-wrap: pretty;
}
.song--stage .song__artist { font-size: 1.6em; line-height: 1.15; }
.song--stage .song__empty { font-size: 1.8em; max-width: 16em; }
.song--stage .song__clock { grid-area: clock; align-self: start; margin-top: 0.4em; gap: 0.15em; }
.song--stage .song__seconds { font-size: 7em; color: var(--mark); }
.song--stage .song__unit { font-size: 2em; }
.song--stage .song__note { grid-area: clock; align-self: start; margin-top: 0.6em; font-size: 2em; font-stretch: 80%; }

/* Host desde un teléfono o ventana pequeña: disco y cuenta atrás en una fila, título debajo */
@media (max-width: 899px), (max-height: 519px) {
  .song--stage {
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas:
      "disc clock"
      "text text";
    align-items: center;
    column-gap: 1.2rem;
    row-gap: 0.8rem;
  }
  .song--stage .song__disc { width: min(44vw, 12rem); min-width: 0; }
  .song--stage .song__text { align-self: start; }
  .song--stage .song__clock { align-self: center; margin-top: 0; }
  .song--stage .song__title { font-size: 2.4rem; }
  .song--stage .song__artist { font-size: 1.2rem; }
  .song--stage .song__seconds { font-size: 5rem; }
  .song--stage .song__unit { font-size: 1.6rem; }
  .song--stage .song__note { align-self: center; margin-top: 0; font-size: 1.3rem; }
}
</style>
