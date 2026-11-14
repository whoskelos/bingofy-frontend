<script setup>
defineProps({
  art: { type: String, default: "" },
  spinning: { type: Boolean, default: false },
  // 0 a 1. Si es null no se dibuja el arco de cuenta atrás.
  progress: { type: Number, default: null }
});
</script>

<template>
  <div class="vinyl" :class="{ 'is-spinning': spinning }" aria-hidden="true">
    <svg v-if="progress !== null" class="vinyl__ring" viewBox="0 0 100 100">
      <circle class="vinyl__track" cx="50" cy="50" r="48" pathLength="100" />
      <circle class="vinyl__arc" cx="50" cy="50" r="48" pathLength="100" :stroke-dasharray="`${Math.max(0, Math.min(1, progress)) * 100} 100`" />
    </svg>
    <div class="vinyl__disc">
      <div class="vinyl__label">
        <img v-if="art" :src="art" alt="" />
      </div>
      <span class="vinyl__hole"></span>
    </div>
  </div>
</template>

<style scoped>
.vinyl {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.vinyl__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  fill: none;
  stroke-width: 2.4;
}
.vinyl__track { stroke: var(--line); stroke-opacity: 0.6; }
.vinyl__arc {
  stroke: var(--mark);
  stroke-linecap: butt;
  transition: stroke-dasharray 260ms linear;
}

.vinyl__disc {
  position: absolute;
  inset: 5.5%;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle at center, transparent 0 0.9%, rgb(255 255 255 / 5%) 0.9% 1.1%),
    var(--disc);
  box-shadow: 0 0 0 0.6% rgb(255 255 255 / 12%);
  animation: spin 9s linear infinite;
  animation-play-state: paused;
}
.is-spinning .vinyl__disc { animation-play-state: running; }

/* Brillo fijo: el disco gira, la luz no */
.vinyl::after {
  content: "";
  position: absolute;
  inset: 5.5%;
  border-radius: 50%;
  background: conic-gradient(from 35deg, transparent 0 8%, rgb(255 255 255 / 11%) 14%, transparent 22% 58%, rgb(255 255 255 / 9%) 64%, transparent 72%);
  pointer-events: none;
}

.vinyl__label {
  position: absolute;
  inset: 28%;
  overflow: hidden;
  border-radius: 50%;
  background: var(--mark);
}
.vinyl__label img { width: 100%; height: 100%; object-fit: cover; display: block; }

.vinyl__hole {
  position: absolute;
  inset: 48.2%;
  border-radius: 50%;
  background: var(--bg);
  box-shadow: 0 0 0 2px rgb(0 0 0 / 35%);
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
