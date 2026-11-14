import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import SalaView from "../views/player/SalaView.vue";
import { useSessionStore } from "../stores/session.js";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    {
      path: "/host",
      name: "host-setup",
      component: () => import("../views/host/HostSetupView.vue")
    },
    {
      path: "/host/sala/:code",
      name: "host-room",
      meta: { hall: true },
      component: () => import("../views/host/HostRoomView.vue"),
      async beforeEnter() {
        const session = useSessionStore();
        const ok = await session.fetchSession();
        if (!ok) {
          return { name: "host-setup" };
        }
        return true;
      }
    },
    { path: "/sala/:code", name: "sala", component: SalaView },
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundView }
  ]
});
