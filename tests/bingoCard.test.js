import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BingoCard from "../src/components/player/BingoCard.vue";

const card = {
  id: "card-1",
  rows: 2,
  cols: 2,
  cells: [
    { index: 0, trackId: "a", name: "Uno", artists: ["Sol"], albumImageUrl: null, free: false },
    { index: 1, trackId: "b", name: "Dos", artists: ["Luz"], albumImageUrl: null, free: false },
    { index: 2, trackId: null, name: null, artists: [], albumImageUrl: null, free: true },
    { index: 3, trackId: "c", name: "Tres", artists: ["Mar"], albumImageUrl: null, free: false }
  ],
  marked: [true, false, true, false]
};

describe("BingoCard", () => {
  it("bloquea todas las casillas cuando la partida ha terminado", async () => {
    const wrapper = mount(BingoCard, { props: { card, locked: true } });
    const cells = wrapper.findAll("button");
    expect(cells).toHaveLength(4);
    for (const cell of cells) {
      expect(cell.attributes("disabled")).toBeDefined();
    }
    await cells[1].trigger("click");
    expect(wrapper.emitted("toggle")).toBeUndefined();
  });

  it("dibuja la cuadrícula con las columnas del cartón", () => {
    const wide = {
      id: "card-2",
      rows: 3,
      cols: 5,
      cells: Array.from({ length: 15 }, (_, index) => ({
        index, trackId: `t${index}`, name: `C${index}`, artists: ["A"], albumImageUrl: null, free: false
      })),
      marked: Array(15).fill(false)
    };
    const wrapper = mount(BingoCard, { props: { card: wide } });
    expect(wrapper.findAll("button")).toHaveLength(15);
    expect(wrapper.get(".board").attributes("style")).toContain("--cols: 5");
  });

  it("resalta solo las casillas de la línea", () => {
    const wrapper = mount(BingoCard, { props: { card, highlight: [0, 1] } });
    const cells = wrapper.findAll("button");
    expect(cells[0].classes()).toContain("is-line");
    expect(cells[1].classes()).toContain("is-line");
    expect(cells[3].classes()).not.toContain("is-line");
  });
});
