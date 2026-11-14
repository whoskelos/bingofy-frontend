import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import RoomQr from "../src/components/host/RoomQr.vue";

vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn(async (text) => `data:image/png,${text}`)
  }
}));

describe("RoomQr", () => {
  it("muestra el QR, la URL con el código y el código en grande", async () => {
    const wrapper = mount(RoomQr, { props: { code: "ABC123" } });
    await flushPromises();
    const image = wrapper.get("img");
    expect(image.attributes("src")).toContain("http://127.0.0.1:5173/sala/ABC123");
    expect(image.attributes("alt")).toContain("ABC123");
    expect(wrapper.text()).toContain("127.0.0.1:5173/sala/ABC123");
    expect(wrapper.text()).toContain("ABC123");
  });
});
