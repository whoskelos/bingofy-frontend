import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BingoButton from "../src/components/player/BingoButton.vue";

describe("BingoButton", () => {
  it("emite LINE con el botón de línea y FULL con el de bingo", async () => {
    const wrapper = mount(BingoButton);
    const [line, bingo] = wrapper.findAll("button");
    expect(line.text()).toBe("Línea");
    expect(bingo.text()).toBe("¡Bingo!");
    await line.trigger("click");
    await bingo.trigger("click");
    expect(wrapper.emitted("claim")).toEqual([["LINE"], ["FULL"]]);
  });

  it("con la línea ya cantada solo queda activo el bingo", () => {
    const wrapper = mount(BingoButton, { props: { lineDisabled: true } });
    const [line, bingo] = wrapper.findAll("button");
    expect(line.attributes("disabled")).toBeDefined();
    expect(bingo.attributes("disabled")).toBeUndefined();
  });

  it("sin partida en curso no se puede cantar nada", () => {
    const wrapper = mount(BingoButton, { props: { disabled: true } });
    for (const button of wrapper.findAll("button")) {
      expect(button.attributes("disabled")).toBeDefined();
    }
  });
});
