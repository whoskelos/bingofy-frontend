<script setup>
defineProps({
  type: { type: String, default: "button" },
  variant: { type: String, default: "primary" },
  disabled: { type: Boolean, default: false }
});
</script>

<template>
  <button :type="type" class="btn" :class="variant === 'primary' ? '' : variant" :disabled="disabled">
    <slot />
  </button>
</template>
