<script setup>
import { computed, ref } from "vue";
import { formatArtists, matchesTrack } from "../../utils/tracks.js";

const props = defineProps({
  // Canciones confirmadas, de la más reciente a la más antigua
  songs: { type: Array, default: () => [] },
  // Cuántas se enseñan: todas en la pantalla del host (sirve para validar), 3 en el móvil
  limit: { type: Number, default: Infinity },
  compact: { type: Boolean, default: false },
  // Enseña cuántas han sonado junto al título
  showCount: { type: Boolean, default: false },
  // Campo para filtrar por título o artista
  searchable: { type: Boolean, default: false }
});

const query = ref("");
const searching = computed(() => props.searchable && query.value.trim() !== "");

// La última canción arriba: es la que alguien va a querer comprobar
const matches = computed(() => (searching.value ? props.songs.filter((track) => matchesTrack(track, query.value)) : props.songs));
const visible = computed(() => matches.value.slice(0, props.limit));

const status = computed(() => {
  if (!searching.value) {
    return "";
  }
  return matches.value.length === 0 ? "" : `${matches.value.length} de ${props.songs.length}`;
});

function clear() {
  query.value = "";
}
</script>

<template>
  <section class="history" :class="{ 'history--compact': compact, 'history--search': searchable }" aria-label="Canciones sonadas">
    <h2 class="history__title display">
      Ya sonaron<span v-if="showCount && songs.length" class="history__count"> · {{ songs.length }}</span>
    </h2>
    <div v-if="searchable" class="history__search">
      <div class="history__field">
        <input
          v-model="query"
          type="search"
          name="song-search"
          class="history__input"
          placeholder="Buscar canción o artista"
          aria-label="Buscar entre las canciones que ya sonaron"
          autocomplete="off"
          spellcheck="false"
          enterkeyhint="search"
          @keydown.esc="clear"
        />
        <button v-if="query" type="button" class="history__clear" aria-label="Borrar la búsqueda" @click="clear">×</button>
      </div>
      <p class="history__status" aria-live="polite">{{ status }}</p>
    </div>
    <p v-if="songs.length === 0" class="history__empty">Ninguna todavía.</p>
    <p v-else-if="visible.length === 0" class="history__none" role="status">
      Esa canción no ha sonado.
    </p>
    <ol v-else class="history__list">
      <li v-for="track in visible" :key="track.id">
        <img v-if="track.albumImageUrl" :src="track.albumImageUrl" alt="" width="48" height="48" />
        <span v-else class="history__blank" aria-hidden="true"></span>
        <span class="history__text">
          <strong>{{ track.name }}</strong>
          <span>{{ formatArtists(track.artists) }}</span>
        </span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.history { display: grid; grid-template-rows: auto 1fr; gap: 0.6em; min-height: 0; align-content: start; }
.history--search { grid-template-rows: auto auto minmax(0, 1fr); }
.history__title { font-size: 1.7em; }
.history--compact .history__title { font-size: 1.25em; }
.history--compact .history__list { overflow: visible; }
.history__count { color: var(--ink-soft); font-stretch: 80%; }
.history__empty { color: var(--ink-soft); font-size: 1.1em; }

.history__search { display: grid; gap: 0.3em; }
.history__field { position: relative; }
.history__input {
  width: 100%;
  min-width: 0;
  padding: 0.5em 2.3em 0.55em 0.8em;
  border: 2px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-raised);
  font-size: 1.05em;
}
.history__input:focus-visible { border-color: var(--accent); outline-offset: 2px; }
/* El aspa propia sustituye a la del navegador, que no existe en todos */
.history__input::-webkit-search-cancel-button { display: none; }
.history__clear {
  position: absolute;
  top: 50%;
  right: 0.3em;
  width: 1.9em;
  height: 1.9em;
  transform: translateY(-50%);
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink-soft);
  font-size: 1.2em;
  line-height: 1;
}
.history__clear:hover { color: var(--ink); }
/* Reserva la línea para que la lista no salte al empezar a escribir */
.history__status { min-height: 1.3em; color: var(--ink-soft); font-size: 0.95em; font-weight: 600; }

/* Sin resultados: es la respuesta que el host busca al validar, así que se lee de lejos */
.history__none {
  padding: 0.5em 0.8em 0.6em;
  border-left: 0.25em solid var(--hot);
  background: var(--bg-raised);
  font-size: 1.25em;
  font-weight: 760;
  font-stretch: 80%;
}

.history__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.55em;
  align-content: start;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
}
.history__list li { display: grid; grid-template-columns: 2.6em minmax(0, 1fr); gap: 0.7em; align-items: center; }
.history__list img, .history__blank { width: 2.6em; height: 2.6em; border-radius: 2px; object-fit: cover; background: var(--line); }
.history__text { display: grid; line-height: 1.15; min-width: 0; }
.history__text strong {
  font-size: 1.1em;
  font-weight: 720;
  font-stretch: 84%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.history__text span {
  color: var(--ink-soft);
  font-size: 0.95em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
