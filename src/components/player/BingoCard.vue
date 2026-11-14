<script setup>
import CardCell from "./CardCell.vue";

defineProps({
  card: { type: Object, required: true },
  locked: { type: Boolean, default: false }
});

defineEmits(["toggle"]);
</script>

<template>
  <div class="board" :style="{ '--board': card.size }" role="group" aria-label="Cartón">
    <CardCell
      v-for="cell in card.cells"
      :key="cell.index"
      :cell="cell"
      :marked="Boolean(card.marked[cell.index])"
      :locked="locked"
      @toggle="$emit('toggle', cell.index)"
    />
  </div>
</template>

<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(var(--board), minmax(0, 1fr));
  gap: 0.3rem;
}
</style>
