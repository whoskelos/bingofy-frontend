<script setup>
import { computed } from "vue";
import { formatArtists } from "../../utils/tracks.js";

const props = defineProps({
  played: { type: Array, default: () => [] }
});

// La última canción arriba: es la que alguien va a querer comprobar
const recent = computed(() => [...props.played].reverse());
</script>

<template>
  <section class="history" aria-label="Canciones sonadas">
    <h2 class="history__title display">Ya sonaron</h2>
    <p v-if="played.length === 0" class="history__empty">Ninguna todavía.</p>
    <ol v-else class="history__list">
      <li v-for="track in recent" :key="track.id">
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
.history__title { font-size: 1.7em; }
.history__empty { color: var(--ink-soft); font-size: 1.1em; }
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
