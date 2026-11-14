<script setup>
defineProps({
  tone: { type: String, default: "neutral" }
});
</script>

<template>
  <p class="alert" :class="tone" role="status">
    <slot />
  </p>
</template>
