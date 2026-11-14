<script setup>
import AppButton from "../common/AppButton.vue";

defineProps({
  disabled: { type: Boolean, default: false }
});

defineEmits(["claim"]);
</script>

<template>
  <div class="claims">
    <AppButton type="button" :disabled="disabled" @click="$emit('claim', 'LINE')">¡Bingo!</AppButton>
    <AppButton type="button" variant="secondary" :disabled="disabled" @click="$emit('claim', 'FULL')">
      Cartón completo
    </AppButton>
  </div>
</template>

<style scoped>
.claims { display: grid; grid-template-columns: 1.3fr 1fr; gap: 0.7rem; }
.claims :deep(.btn) { min-height: 3.5rem; font-size: 1.2rem; padding-inline: 0.6rem; }
</style>
