<script setup>
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import PlayerGameView from "./PlayerGameView.vue";
import PlayerJoinView from "./PlayerJoinView.vue";
import { usePlayerStore } from "../../stores/player.js";

const route = useRoute();
const player = usePlayerStore();
const code = computed(() => String(route.params.code || "").toUpperCase());

watch(code, (value) => player.syncCode(value), { immediate: true });

const returning = computed(() => player.roomCode === code.value && Boolean(player.playerId));
</script>

<template>
  <PlayerGameView v-if="returning" :key="code" />
  <PlayerJoinView v-else :key="`join-${code}`" />
</template>
