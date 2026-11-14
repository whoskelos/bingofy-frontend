import { describe, expect, it } from "vitest";
import { urlsFromEnv } from "../src/config/env.js";

describe("urlsFromEnv", () => {
  it("lee las URLs de las variables", () => {
    expect(urlsFromEnv({
      VITE_API_BASE_URL: "https://api.ejemplo.com/",
      VITE_SOCKET_URL: "https://api.ejemplo.com",
      VITE_PUBLIC_APP_URL: "https://app.ejemplo.com"
    })).toEqual({
      apiBaseUrl: "https://api.ejemplo.com",
      socketUrl: "https://api.ejemplo.com",
      publicAppUrl: "https://app.ejemplo.com"
    });
  });

  it("usa el origen de la página si no hay URL pública", () => {
    expect(urlsFromEnv({
      VITE_API_BASE_URL: "https://api.ejemplo.com",
      VITE_SOCKET_URL: "https://api.ejemplo.com"
    }, { origin: "https://app.ejemplo.com/" }).publicAppUrl).toBe("https://app.ejemplo.com");
  });

  it("falla si falta la URL del backend", () => {
    expect(() => urlsFromEnv({})).toThrow(/VITE_API_BASE_URL/);
  });
});
