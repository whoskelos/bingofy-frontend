<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AlertMessage from "../../components/common/AlertMessage.vue";
import AppButton from "../../components/common/AppButton.vue";
import BrandMark from "../../components/common/BrandMark.vue";
import LoadingState from "../../components/common/LoadingState.vue";
import RoomCode from "../../components/common/RoomCode.vue";
import { getRoom } from "../../services/api.js";
import { usePlayerStore } from "../../stores/player.js";
import { useRoomStore } from "../../stores/room.js";
import { errorCodeFrom, errorMessage } from "../../utils/errorMessages.js";

const route = useRoute();
const player = usePlayerStore();
const room = useRoomStore();
const name = ref(player.name);
const lookupError = ref("");
const joinError = ref("");
const checking = ref(true);
const code = computed(() => String(route.params.code || "").toUpperCase());
const blocked = computed(() => lookupError.value === "ROOM_NOT_FOUND" || lookupError.value === "ROOM_NOT_IN_LOBBY");

async function lookUp() {
  checking.value = true;
  lookupError.value = "";
  try {
    const state = await getRoom(code.value);
    room.applyState(state);
    if (state.status !== "lobby") {
      lookupError.value = "ROOM_NOT_IN_LOBBY";
    }
  } catch (error) {
    lookupError.value = errorCodeFrom(error) || "VALIDATION_ERROR";
  } finally {
    checking.value = false;
  }
}

onMounted(lookUp);
watch(code, lookUp);

async function submit() {
  joinError.value = "";
  try {
    const data = await player.join(code.value, name.value);
    if (data.room) {
      room.applyState(data.room);
    }
  } catch (error) {
    joinError.value = errorCodeFrom(error) || "VALIDATION_ERROR";
  }
}
</script>

<template>
  <main class="join">
    <BrandMark />
    <div class="join__room">
      <p class="label">Vas a entrar en la sala</p>
      <RoomCode class="join__code" :code="code" />
    </div>
    <h1 class="display">Elige tu nombre</h1>
    <LoadingState v-if="checking" />
    <AlertMessage v-if="lookupError || joinError" tone="danger">{{ errorMessage(lookupError || joinError) }}</AlertMessage>
    <RouterLink v-if="blocked" class="btn secondary join__back" to="/">Probar con otro código</RouterLink>
    <form v-if="!checking && !blocked" class="join__form" @submit.prevent="submit">
      <label class="field">
        <span>Nombre</span>
        <input v-model="name" name="name" maxlength="24" required autocomplete="nickname" />
      </label>
      <AppButton type="submit" :disabled="player.joining || name.trim().length === 0">Entrar</AppButton>
    </form>
  </main>
</template>

<style scoped>
.join {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
  gap: 1.4rem;
  width: min(34rem, 100%);
  margin: 0 auto;
  padding: calc(1.5rem + var(--safe-top)) 1.25rem calc(2rem + var(--safe-bottom));
}
.join__room { display: grid; gap: 0.5rem; margin-top: 0.8rem; }
.join__code { width: min(100%, 17rem); }
h1 { font-size: clamp(3rem, 15vw, 4.6rem); }
.join__form { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; }
.join__form .btn, .join__back { min-height: 3.4rem; }
.join__back { justify-self: start; }
</style>
