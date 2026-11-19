<script setup>
import AppButton from "../common/AppButton.vue";

defineProps({
  // Se puede cantar algo (partida en curso o en pausa)
  disabled: { type: Boolean, default: false },
  // La línea solo se puede cantar mientras la fase es "line"
  lineDisabled: { type: Boolean, default: false }
});

defineEmits(["claim"]);
</script>

<template>
  <div class="claims">
    <AppButton type="button" variant="secondary" :disabled="disabled || lineDisabled" @click="$emit('claim', 'LINE')">
      Línea
    </AppButton>
    <AppButton type="button" :disabled="disabled" @click="$emit('claim', 'FULL')">¡Bingo!</AppButton>
  </div>
</template>

<style scoped>
.claims { display: grid; grid-template-columns: 1fr 1.3fr; gap: 0.7rem; }
.claims :deep(.btn) { min-height: 3.5rem; font-size: 1.2rem; padding-inline: 0.6rem; }
</style>
