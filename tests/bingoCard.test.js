import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BingoCard from "../src/components/player/BingoCard.vue";

const card = {
  id: "card-1",
  size: 2,
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
});
