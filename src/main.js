import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router/index.js";
import { getEnv } from "./config/env.js";
import "./styles/base.css";

const root = document.querySelector("#app");

try {
  getEnv();
  createApp(App).use(createPinia()).use(router).mount(root);
} catch (error) {
  root.replaceChildren();
  const message = document.createElement("p");
  message.className = "boot-error";
  message.textContent = error.message;
  root.append(message);
}
