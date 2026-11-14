import { defineStore } from "pinia";
import { ref } from "vue";
import { getSession, loginUrl } from "../services/api.js";

const RETURN_KEY = "bingofy.hostReturn";

export const useSessionStore = defineStore("session", () => {
  const loggedIn = ref(false);
  const displayName = ref("");
  const isPremium = ref(false);
  const expired = ref(false);
  const authError = ref("");
  const loading = ref(false);

  async function fetchSession() {
    loading.value = true;
    try {
      const data = await getSession();
      loggedIn.value = Boolean(data.authenticated);
      displayName.value = data.displayName || "";
      isPremium.value = Boolean(data.premium);
      expired.value = Boolean(data.expired);
      return loggedIn.value && !expired.value;
    } catch {
      loggedIn.value = false;
      displayName.value = "";
      isPremium.value = false;
      return false;
    } finally {
      loading.value = false;
    }
  }

  function rememberReturn(path) {
    try {
      sessionStorage.setItem(RETURN_KEY, path);
    } catch {
      // sessionStorage puede fallar en modo privado
    }
  }

  function takeReturn() {
    try {
      const value = sessionStorage.getItem(RETURN_KEY) || "";
      sessionStorage.removeItem(RETURN_KEY);
      return value;
    } catch {
      return "";
    }
  }

  function clearReturn() {
    try {
      sessionStorage.removeItem(RETURN_KEY);
    } catch {
      // igual que rememberReturn
    }
  }

  function login() {
    window.location.assign(loginUrl());
  }

  function setAuthError(code) {
    authError.value = code || "";
    if (code === "SPOTIFY_TOKEN_EXPIRED") {
      expired.value = true;
    }
  }

  function clearAuthError() {
    authError.value = "";
    expired.value = false;
  }

  return {
    loggedIn,
    displayName,
    isPremium,
    expired,
    authError,
    loading,
    fetchSession,
    rememberReturn,
    takeReturn,
    clearReturn,
    login,
    setAuthError,
    clearAuthError
  };
});
