<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AlertMessage from "../../components/common/AlertMessage.vue";
import AppButton from "../../components/common/AppButton.vue";
import BrandMark from "../../components/common/BrandMark.vue";
import LoadingState from "../../components/common/LoadingState.vue";
import { createRoom } from "../../services/api.js";
import { usePlaylistsStore } from "../../stores/playlists.js";
import { useSessionStore } from "../../stores/session.js";
import { errorCodeFrom, errorMessage } from "../../utils/errorMessages.js";

const router = useRouter();
const session = useSessionStore();
const playlists = usePlaylistsStore();
const creating = ref(false);
const createError = ref("");
// Ritmo de la sala: cuánto suena cada canción. Los segundos reales los fija el servidor.
const pace = ref("normal");
const paces = [
  { id: "fast", label: "Rápido", hint: "Canciones cortas" },
  { id: "normal", label: "Normal", hint: "Lo habitual" },
  { id: "relaxed", label: "Tranquilo", hint: "Más tiempo para buscar" }
];

const notice = computed(() => session.authError ? errorMessage(session.authError) : "");

const ready = computed(() => !session.loading && session.loggedIn && !session.expired && session.isPremium);

const summary = computed(() => {
  const count = playlists.selectedIds.length;
  if (count === 0) {
    return "Elige al menos una playlist.";
  }
  const lists = count === 1 ? "1 playlist" : `${count} playlists`;
  return `${lists} y ${playlists.poolSize} canciones válidas.`;
});

onMounted(async () => {
  const ok = await session.fetchSession();
  if (ok && session.isPremium) {
    await playlists.load();
  }
});

function connect() {
  session.rememberReturn("/host");
  session.login();
}

async function create() {
  creating.value = true;
  createError.value = "";
  try {
    const room = await createRoom(playlists.selectedIds, pace.value);
    await router.push({ name: "host-room", params: { code: room.code } });
  } catch (error) {
    createError.value = errorCodeFrom(error);
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <main class="setup">
    <div class="setup__side">
      <header class="setup__intro">
        <BrandMark />
        <h1 class="display">Prepara la sala</h1>
        <LoadingState v-if="session.loading" />
        <template v-else-if="!session.loggedIn || session.expired">
          <p class="setup__lead">La música suena en este navegador, así que necesitas una cuenta de Spotify Premium.</p>
          <AlertMessage v-if="notice" tone="danger">{{ notice }}</AlertMessage>
          <AppButton type="button" @click="connect">Conectar con Spotify</AppButton>
        </template>
        <template v-else-if="!session.isPremium">
          <AlertMessage tone="danger">{{ errorMessage("PREMIUM_REQUIRED") }}</AlertMessage>
        </template>
        <p v-else class="setup__lead">Hola, {{ session.displayName }}. Elige las playlists de las que saldrán las canciones.</p>
      </header>
      <div v-if="ready" class="setup__create">
        <p class="setup__summary" aria-live="polite">{{ summary }}</p>
        <fieldset class="pace">
          <legend class="pace__legend">Ritmo de las canciones</legend>
          <label v-for="option in paces" :key="option.id" class="pace__option">
            <input v-model="pace" type="radio" name="pace" :value="option.id" />
            <span class="pace__card">
              <strong>{{ option.label }}</strong>
              <span>{{ option.hint }}</span>
            </span>
          </label>
        </fieldset>
        <AlertMessage v-if="playlists.lowVariety">
          Hay poca variedad: las playlists elegidas suman entre 100 y 150 canciones. Añade otra para que se repitan menos.
        </AlertMessage>
        <AlertMessage v-if="createError" tone="danger">{{ errorMessage(createError) }}</AlertMessage>
        <AppButton type="button" :disabled="playlists.selectedIds.length === 0 || creating" @click="create">
          Crear sala
        </AppButton>
      </div>
    </div>

    <section v-if="ready" class="setup__lists" aria-label="Playlists">
      <AlertMessage v-if="playlists.errorCode" tone="danger">{{ errorMessage(playlists.errorCode) }}</AlertMessage>
      <LoadingState v-if="playlists.loading" />
      <ul v-else-if="playlists.items.length" class="playlist-list">
        <li v-for="playlist in playlists.items" :key="playlist.id">
          <button
            type="button"
            :aria-pressed="playlists.selectedIds.includes(playlist.id)"
            @click="playlists.toggle(playlist.id)"
          >
            <strong>{{ playlist.name }}</strong>
            <span>{{ playlist.validTracks }} canciones válidas</span>
            <svg class="check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </button>
        </li>
      </ul>
      <p v-else-if="!playlists.errorCode" class="setup__empty">
        No hay playlists con al menos 100 canciones válidas. Añade canciones a una playlist propia o colaborativa y recarga la página.
      </p>
    </section>
  </main>
</template>

<style scoped>
/* Móvil: intro, lista y, fija abajo, la acción de crear (display: contents deja que el orden mande) */
.setup {
  display: grid;
  gap: 1.6rem;
  width: min(80rem, 100%);
  margin: 0 auto;
  padding: calc(1.5rem + var(--safe-top)) 1.25rem 0;
}
.setup__side { display: contents; }
.setup__intro { display: grid; gap: 1.1rem; align-content: start; justify-items: start; padding-bottom: 0.5rem; }
.setup h1 { font-size: clamp(3.2rem, 15vw, 5.5rem); margin-top: 0.6rem; }
.setup__lead { font-size: 1.15rem; color: var(--ink-soft); max-width: 26rem; }
.setup__intro > .btn { min-width: min(100%, 16rem); }
.setup__lists { order: 1; padding-bottom: 1rem; }
.setup__create {
  order: 2;
  position: sticky;
  bottom: 0;
  z-index: 3;
  display: grid;
  gap: 0.7rem;
  margin: 0 -1.25rem;
  padding: 0.8rem 1.25rem calc(0.8rem + var(--safe-bottom));
  background: var(--bg);
  border-top: 2px solid var(--line);
}
.setup__create .btn { width: 100%; }
.setup__summary { font-size: 1.2rem; font-weight: 700; font-stretch: 84%; }
.setup__empty { font-size: 1.1rem; max-width: 30rem; }

/* Selector de ritmo: tres fundas, la elegida se rellena de amarillo como las playlists */
.pace { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; margin: 0; padding: 0; border: 0; min-width: 0; }
.pace__legend { grid-column: 1 / -1; padding: 0; margin-bottom: 0.3rem; font-weight: 700; font-stretch: 84%; }
.pace__option { position: relative; display: block; }
.pace__option input { position: absolute; opacity: 0; inset: 0; margin: 0; }
.pace__card {
  display: grid;
  gap: 0.15rem;
  height: 100%;
  padding: 0.55rem 0.6rem 0.6rem;
  border: 2px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-raised);
  transition: background-color 120ms, border-color 120ms;
}
.pace__card strong { font-size: 1.05rem; font-weight: 820; font-stretch: 76%; }
.pace__card span { color: var(--ink-soft); font-size: 0.8rem; line-height: 1.15; }
.pace__option input:checked + .pace__card { background: var(--mark); border-color: var(--mark); color: var(--mark-ink); }
.pace__option input:checked + .pace__card span { color: var(--mark-ink); }
.pace__option input:focus-visible + .pace__card { outline: 3px solid var(--accent); outline-offset: 3px; }

.playlist-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 10rem), 1fr));
  gap: 0.8rem;
}
/* Cada playlist es una funda: se rellena de amarillo al elegirla */
.playlist-list button {
  position: relative;
  width: 100%;
  min-height: 8.5rem;
  display: grid;
  align-content: space-between;
  gap: 0.8rem;
  padding: 0.9rem 0.9rem 0.8rem;
  border: 2px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-raised);
  text-align: left;
  transition: background-color 120ms, border-color 120ms;
}
.playlist-list strong {
  font-size: 1.55rem;
  font-weight: 860;
  font-stretch: 68%;
  line-height: 1;
  padding-right: 1.6rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.playlist-list span { color: var(--ink-soft); font-size: 0.95rem; font-weight: 560; }
.playlist-list .check {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  width: 1.5rem;
  height: 1.5rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: square;
  opacity: 0;
}
.playlist-list button[aria-pressed="true"] {
  background: var(--mark);
  border-color: var(--mark);
  color: var(--mark-ink);
}
.playlist-list button[aria-pressed="true"] span { color: var(--mark-ink); }
.playlist-list button[aria-pressed="true"] .check { opacity: 1; }

/* Portátil: resumen y acción siempre a la vista en la columna izquierda */
@media (min-width: 900px) {
  .setup {
    grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);
    align-items: start;
    gap: clamp(2rem, 5vw, 5rem);
    padding: calc(2.5rem + var(--safe-top)) clamp(2rem, 5vw, 4rem) 3rem;
  }
  .setup:not(:has(.setup__lists)) { grid-template-columns: minmax(18rem, 34rem); }
  .setup__side { display: grid; gap: 2rem; position: sticky; top: 2.5rem; }
  .setup__lead { font-size: 1.25rem; }
  .setup__lists { padding-bottom: 0; }
  .setup__create {
    position: static;
    z-index: auto;
    margin: 0;
    padding: 1.2rem 0 0;
    border-top: 2px solid var(--line);
    background: none;
  }
}
</style>
