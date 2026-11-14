<script setup>
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSessionStore } from "./stores/session.js";

const route = useRoute();
const router = useRouter();
const session = useSessionStore();

async function consumeOAuthQuery() {
  const error = typeof route.query.error === "string" ? route.query.error : "";
  const auth = route.query.auth;
  if (!auth && !error) {
    return;
  }
  if (error) {
    session.clearReturn();
    session.setAuthError(error);
    await router.replace({ path: route.path, query: {} });
    return;
  }
  const target = session.takeReturn() || "/host";
  await router.replace(target === route.fullPath ? { path: route.path, query: {} } : target);
}

onMounted(consumeOAuthQuery);
watch(() => [route.query.auth, route.query.error], consumeOAuthQuery);
</script>

<template>
  <div :class="{ hall: route.meta.hall, 'theme-night': route.meta.hall }">
    <router-view />
  </div>
</template>
