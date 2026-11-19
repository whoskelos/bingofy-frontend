<script setup>
import { computed } from "vue";
import { patternLabel } from "../../utils/tracks.js";

const props = defineProps({
  winners: { type: Array, default: () => [] }
});

// Mientras solo hay línea, el titular es la línea; con un cartón completo, el bingo.
const title = computed(() => (props.winners.some((winner) => winner.pattern === "FULL") ? "¡Bingo!" : "¡Línea!"));
</script>

<template>
  <section v-if="winners.length" class="winners" aria-live="assertive">
    <h2 class="winners__title display">{{ title }}</h2>
    <ul class="winners__list">
      <li v-for="winner in winners" :key="`${winner.playerId}-${winner.pattern}`">
        <span class="winners__name">{{ winner.name }}</span>
        <span class="winners__pattern">{{ patternLabel(winner.pattern) }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* Bloque amarillo a todo el ancho: el momento más fuerte de la partida */
.winners {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4em 1.2em;
  padding: 0.5em 1em 0.6em;
  border-radius: 6px;
  background: var(--mark);
  color: var(--mark-ink);
  box-shadow: 0 0.2em 0 var(--mark-edge);
  animation: stamp 260ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
}
.winners__title { font-size: 3em; }
.winners__list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.3em 1.2em; }
.winners__list li { display: flex; align-items: baseline; gap: 0.5em; }
.winners__name { font-size: 1.7em; font-weight: 820; font-stretch: 75%; line-height: 1.1; }
.winners__pattern {
  padding: 0.1em 0.6em 0.15em;
  border-radius: 999px;
  background: var(--mark-ink);
  color: var(--mark);
  font-weight: 700;
  font-stretch: 85%;
}

@keyframes stamp {
  from { transform: scale(1.12); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
