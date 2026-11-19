import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import SongHistory from "../src/components/host/SongHistory.vue";

const songs = Array.from({ length: 12 }, (_, index) => ({
  id: `t${index}`,
  name: `Canción ${index}`,
  artists: ["Artista"],
  albumImageUrl: null
}));

describe("SongHistory", () => {
  it("sin límite enseña todas las canciones y su recuento", () => {
    const wrapper = mount(SongHistory, { props: { songs, showCount: true } });
    expect(wrapper.findAll("li")).toHaveLength(12);
    expect(wrapper.get("h2").text()).toContain("12");
  });

  it("con límite enseña solo las primeras (las más recientes)", () => {
    const wrapper = mount(SongHistory, { props: { songs, limit: 3, compact: true } });
    const items = wrapper.findAll("li");
    expect(items).toHaveLength(3);
    expect(items[0].text()).toContain("Canción 0");
  });

  it("sin canciones avisa de que no ha sonado ninguna", () => {
    const wrapper = mount(SongHistory, { props: { songs: [] } });
    expect(wrapper.text()).toContain("Ninguna todavía");
  });

  describe("buscador", () => {
    const catalog = [
      { id: "1", name: "Halo", artists: ["Beyoncé"], albumImageUrl: null },
      { id: "2", name: "Yellow", artists: ["Coldplay"], albumImageUrl: null },
      { id: "3", name: "Viva la Vida", artists: ["Coldplay"], albumImageUrl: null }
    ];

    it("no enseña el campo si no se pide", () => {
      const wrapper = mount(SongHistory, { props: { songs: catalog } });
      expect(wrapper.find("input").exists()).toBe(false);
    });

    it("filtra por título o artista, sin tildes ni mayúsculas", async () => {
      const wrapper = mount(SongHistory, { props: { songs: catalog, searchable: true } });
      await wrapper.get("input").setValue("BEYONCE");
      expect(wrapper.findAll("li")).toHaveLength(1);
      expect(wrapper.text()).toContain("Halo");
      expect(wrapper.get(".history__status").text()).toBe("1 de 3");

      await wrapper.get("input").setValue("coldplay vida");
      expect(wrapper.findAll("li")).toHaveLength(1);
      expect(wrapper.text()).toContain("Viva la Vida");
    });

    it("avisa cuando la canción no ha sonado", async () => {
      const wrapper = mount(SongHistory, { props: { songs: catalog, searchable: true } });
      await wrapper.get("input").setValue("thriller");
      expect(wrapper.findAll("li")).toHaveLength(0);
      expect(wrapper.text()).toContain("Esa canción no ha sonado");
    });

    it("Esc y el aspa borran la búsqueda y devuelven la lista", async () => {
      const wrapper = mount(SongHistory, { props: { songs: catalog, searchable: true } });
      await wrapper.get("input").setValue("halo");
      await wrapper.get("input").trigger("keydown.esc");
      expect(wrapper.get("input").element.value).toBe("");
      expect(wrapper.findAll("li")).toHaveLength(3);

      await wrapper.get("input").setValue("halo");
      await wrapper.get(".history__clear").trigger("click");
      expect(wrapper.findAll("li")).toHaveLength(3);
    });

    it("las canciones nuevas entran aunque haya un filtro activo", async () => {
      const wrapper = mount(SongHistory, { props: { songs: catalog, searchable: true } });
      await wrapper.get("input").setValue("coldplay");
      expect(wrapper.findAll("li")).toHaveLength(2);
      await wrapper.setProps({
        songs: [{ id: "4", name: "Clocks", artists: ["Coldplay"], albumImageUrl: null }, ...catalog]
      });
      expect(wrapper.findAll("li")).toHaveLength(3);
      expect(wrapper.get("input").element.value).toBe("coldplay");
    });
  });
});
