import { describe, expect, it } from "vitest";
import { roomUrl } from "../src/utils/roomUrl.js";

describe("roomUrl", () => {
  it("quita la barra final de la URL pública", () => {
    expect(roomUrl("ABC123", "https://tu-dominio.com/")).toBe("https://tu-dominio.com/sala/ABC123");
  });

  it("funciona si la URL pública no lleva barra", () => {
    expect(roomUrl("ABC123", "https://tu-dominio.com")).toBe("https://tu-dominio.com/sala/ABC123");
  });

  it("codifica caracteres especiales del código", () => {
    expect(roomUrl("A B/C", "https://tu-dominio.com")).toBe("https://tu-dominio.com/sala/A%20B%2FC");
  });

  it("usa la variable de entorno sin duplicar barras", () => {
    expect(roomUrl("ABC123")).toBe("http://127.0.0.1:5173/sala/ABC123");
  });
});
