<script setup>
import CardCell from "./CardCell.vue";

defineProps({
  card: { type: Object, required: true },
  locked: { type: Boolean, default: false },
  // Índices de la línea ganadora que hay que resaltar
  highlight: { type: Array, default: () => [] }
});

defineEmits(["toggle"]);
</script>

<template>
  <div class="board" :style="{ '--cols': card.cols, '--rows': card.rows }" role="group" aria-label="Cartón">
    <CardCell
      v-for="cell in card.cells"
      :key="cell.index"
      :cell="cell"
      :marked="Boolean(card.marked[cell.index])"
      :locked="locked"
      :highlighted="highlight.includes(cell.index)"
      @toggle="$emit('toggle', cell.index)"
    />
  </div>
</template>

<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: 0.3rem;
}
</style>
