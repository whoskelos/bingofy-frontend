<script setup>
import { computed } from "vue";

const props = defineProps({
  code: { type: String, required: true }
});

const letters = computed(() => props.code.split(""));
</script>

<template>
  <p class="room-code" role="img" :aria-label="`Código de sala ${code}`" :style="{ '--len': letters.length }">
    <span v-for="(letter, index) in letters" :key="index" class="room-code__tile" aria-hidden="true">{{ letter }}</span>
  </p>
</template>

<style scoped>
/* Una ficha por carácter; el tamaño sale del ancho disponible */
.room-code {
  container-type: inline-size;
  display: grid;
  grid-template-columns: repeat(var(--len), minmax(0, 1fr));
  gap: 1.4cqw;
}
.room-code__tile {
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 5;
  border-radius: 6px;
  background: #f4f6ff;
  color: #0f1a63;
  box-shadow: 0 0.12em 0 #05082a;
  font-size: calc(100cqw / var(--len) * 0.95);
  font-weight: 900;
  font-stretch: 70%;
  line-height: 1;
}
</style>
