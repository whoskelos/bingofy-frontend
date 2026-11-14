<script setup>
import { RouterLink } from "vue-router";
import BrandMark from "../components/common/BrandMark.vue";
</script>

<template>
  <main class="lost">
    <BrandMark />
    <h1 class="display">Esta página no existe</h1>
    <p>Comprueba el enlace o entra con el código de sala desde el inicio.</p>
    <RouterLink class="btn secondary" to="/">Volver al inicio</RouterLink>
  </main>
</template>

<style scoped>
.lost {
  display: grid;
  justify-items: start;
  gap: 1.2rem;
  width: min(34rem, 100%);
  margin: 0 auto;
  padding: calc(1.5rem + var(--safe-top)) 1.25rem calc(2rem + var(--safe-bottom));
}
h1 { font-size: clamp(3rem, 15vw, 4.6rem); margin-top: 0.8rem; }
p { color: var(--ink-soft); }
</style>
