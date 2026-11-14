<script setup>
defineProps({
  players: { type: Array, default: () => [] },
  playersMax: { type: Number, default: 50 }
});
</script>

<template>
  <section class="players" aria-label="Jugadores">
    <h2 class="players__title display">Jugadores <span>{{ players.length }}/{{ playersMax }}</span></h2>
    <p v-if="players.length === 0" class="players__empty">Todavía no ha entrado nadie. Escanea el QR para ser el primero.</p>
    <ul v-else class="players__list" :class="{ 'is-dense': players.length > 16, 'is-packed': players.length > 32 }">
      <li v-for="player in players" :key="player.id" :class="{ 'is-off': !player.connected }">
        <span class="players__name">{{ player.name }}</span>
        <span class="visually-hidden">{{ player.connected ? "en línea" : "desconectado" }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.players { display: grid; gap: 0.8em; align-content: start; }
.players__title { font-size: 2em; }
.players__title span { color: var(--ink-soft); font-weight: 700; margin-left: 0.2em; }
.players__empty { font-size: 1.15em; color: var(--ink-soft); max-width: 18em; }
.players__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 0.5em;
}
/* Cada jugador es una ficha; desconectado = ficha apagada con borde discontinuo */
.players__list li {
  padding: 0.25em 0.7em 0.3em;
  border-left: 0.3em solid var(--ok);
  border-radius: 0 4px 4px 0;
  background: var(--bg-raised);
}
.players__list li.is-off {
  border-left: 0.3em dashed var(--ink-soft);
  opacity: 0.6;
}
.players__list.is-dense .players__name { font-size: 1.15em; }
.players__list.is-packed .players__name { font-size: 0.85em; }
.players__list.is-packed { gap: 0.3em; }
.players__list.is-packed li { padding: 0.1em 0.5em 0.15em; }
.players__name { font-size: 1.4em; font-weight: 760; font-stretch: 80%; line-height: 1.15; }
</style>
