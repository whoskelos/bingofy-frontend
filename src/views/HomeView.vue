<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppButton from "../components/common/AppButton.vue";
import AlertMessage from "../components/common/AlertMessage.vue";
import BrandMark from "../components/common/BrandMark.vue";
import { useSessionStore } from "../stores/session.js";
import { errorMessage } from "../utils/errorMessages.js";
import { isValidRoomCode, normalizeRoomCode, ROOM_CODE_LENGTH } from "../utils/roomCode.js";

const router = useRouter();
const session = useSessionStore();
const code = ref("");
const invalid = ref(false);

function submit() {
  const next = normalizeRoomCode(code.value);
  if (!isValidRoomCode(next)) {
    invalid.value = true;
    return;
  }
  invalid.value = false;
  router.push({ name: "sala", params: { code: next } });
}

function goHost() {
  session.rememberReturn("/host");
  router.push({ name: "host-setup" });
}
</script>

<template>
  <main class="home">
    <section class="home__join">
      <BrandMark />
      <div class="home__intro">
        <h1 class="display">Entra en la sala</h1>
        <p class="home__rule">Suena una canción y tú buscas su carátula en el cartón.</p>
      </div>
      <AlertMessage v-if="session.authError" tone="danger">{{ errorMessage(session.authError) }}</AlertMessage>
      <form class="home__form" @submit.prevent="submit">
        <label class="field">
          <span>Código de sala</span>
          <input
            v-model="code"
            class="home__code"
            name="code"
            placeholder="K7M2QX"
            autocomplete="off"
            autocapitalize="characters"
            spellcheck="false"
            :maxlength="ROOM_CODE_LENGTH"
            :aria-invalid="invalid"
          />
        </label>
        <AlertMessage v-if="invalid" tone="danger">
          El código tiene {{ ROOM_CODE_LENGTH }} caracteres, en mayúsculas, sin I, O, 0 ni 1.
        </AlertMessage>
        <AppButton type="submit">Entrar</AppButton>
      </form>
    </section>
    <aside class="home__host" aria-labelledby="host-title">
      <h2 id="host-title" class="display">¿Presentas tú la partida?</h2>
      <p>
        Abre Bingofy en el ordenador conectado a la tele. Necesitas Spotify Premium para que suene la música.
        Elige las playlists y enseña el QR a los jugadores.
      </p>
      <AppButton type="button" variant="ink" @click="goHost">Soy el host</AppButton>
    </aside>
  </main>
</template>

<style scoped>
.home {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: 1fr auto;
}

.home__join {
  display: grid;
  align-content: start;
  gap: 1.6rem;
  padding: calc(1.5rem + var(--safe-top)) 1.25rem 2rem;
  max-width: 40rem;
  width: 100%;
  margin: 0 auto;
}
.home__intro { display: grid; gap: 0.9rem; margin-top: 1.2rem; }
.home h1 { font-size: clamp(3.4rem, 17vw, 6rem); }
.home__rule { font-size: 1.15rem; color: var(--ink-soft); max-width: 24rem; }

.home__form { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; }
/* El código es lo único que se teclea: grande y con espacio entre letras */
.home__code {
  min-height: 4.6rem;
  text-align: center;
  text-transform: uppercase;
  font-size: 2.3rem;
  font-weight: 850;
  font-stretch: 72%;
  letter-spacing: 0.3em;
  padding-left: calc(1rem + 0.3em);
}
.home__code::placeholder { color: var(--line); opacity: 1; }
.home .home__form .btn { min-height: 3.4rem; }

.home__host {
  display: grid;
  gap: 1rem;
  justify-items: start;
  padding: 1.6rem 1.25rem calc(1.8rem + var(--safe-bottom));
  background: var(--mark);
  color: var(--mark-ink);
}
.home__host h2 { font-size: clamp(2.2rem, 9vw, 3rem); max-width: 14ch; }
.home__host p { max-width: 30rem; font-weight: 520; }

/* Portátil o tele: el host pesa lo mismo que el jugador */
@media (min-width: 900px) {
  .home { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); grid-template-rows: 1fr; }
  .home__join {
    margin: 0;
    max-width: none;
    padding: calc(2.5rem + var(--safe-top)) clamp(2rem, 6vw, 6rem) 3rem;
    align-content: center;
  }
  .home__join > * { max-width: 36rem; }
  .home h1 { font-size: clamp(4.5rem, 8vw, 8.5rem); }
  .home__host {
    align-content: center;
    padding: 3rem clamp(2rem, 5vw, 5rem);
    gap: 1.4rem;
  }
  .home__host h2 { font-size: clamp(3rem, 5vw, 5.4rem); }
  .home__host p { font-size: 1.25rem; }
  .home__host .btn { font-size: 1.3rem; min-height: 3.2rem; padding-inline: 2rem; }
}
</style>
