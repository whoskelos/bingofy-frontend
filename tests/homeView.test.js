import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createPinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import HomeView from "../src/views/HomeView.vue";

async function mountHome() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: HomeView },
      { path: "/sala/:code", name: "sala", component: { template: "<div />" } },
      { path: "/host", name: "host-setup", component: { template: "<div />" } }
    ]
  });
  await router.push("/");
  const wrapper = mount(HomeView, {
    global: { plugins: [createPinia(), router] }
  });
  return { wrapper, router };
}

describe("HomeView", () => {
  it("rechaza un código con formato inválido", async () => {
    const { wrapper, router } = await mountHome();
    await wrapper.get("input").setValue("abc");
    await wrapper.get("form").trigger("submit");
    expect(wrapper.text()).toContain("El código tiene 6 caracteres");
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("rechaza caracteres que el backend no genera", async () => {
    const { wrapper, router } = await mountHome();
    await wrapper.get("input").setValue("IIIIII");
    await wrapper.get("form").trigger("submit");
    expect(router.currentRoute.value.path).toBe("/");
  });
});
