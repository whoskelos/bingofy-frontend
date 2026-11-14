<template>
  <p class="brand">
    <svg class="brand__disc" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="var(--disc)" stroke="currentColor" stroke-width="1.5" />
      <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" stroke-opacity="0.3" />
      <circle cx="16" cy="16" r="5.6" fill="var(--mark)" />
      <circle cx="16" cy="16" r="1.3" fill="var(--bg)" />
    </svg>
    <span class="brand__name">Bingofy</span>
  </p>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  font-size: 1.5rem;
}
.brand__disc { width: 1.35em; height: 1.35em; flex: none; }
.brand__name {
  font-weight: 900;
  font-stretch: 66%;
  letter-spacing: 0.01em;
  line-height: 1;
}
</style>
