import { defineStore } from "pinia";
import { ref } from "vue";
import { joinRoom } from "../services/api.js";

const STORAGE_KEY = "bingofy.player";

function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // el navegador puede bloquear localStorage
  }
}

export const usePlayerStore = defineStore("player", () => {
  const roomCode = ref("");
  const playerId = ref("");
  const name = ref("");
  const card = ref(null);
  const rejection = ref("");
  const joining = ref(false);

  function syncCode(code) {
    const saved = readAll()[code] || {};
    roomCode.value = code;
    playerId.value = saved.playerId || "";
    name.value = saved.name || "";
    card.value = null;
    rejection.value = "";
  }

  function remember() {
    const all = readAll();
    all[roomCode.value] = { playerId: playerId.value, name: name.value };
    writeAll(all);
  }

  function clear() {
    const all = readAll();
    delete all[roomCode.value];
    writeAll(all);
    playerId.value = "";
    card.value = null;
    rejection.value = "";
  }

  async function join(code, playerName) {
    joining.value = true;
    rejection.value = "";
    try {
      const data = await joinRoom(code, playerName.trim());
      roomCode.value = code;
      playerId.value = data.playerId;
      name.value = playerName.trim();
      card.value = data.card;
      remember();
      return data;
    } finally {
      joining.value = false;
    }
  }

  function setCard(next) {
    card.value = next;
    rejection.value = "";
  }

  function toggleMark(index) {
    if (!card.value?.cells?.[index] || card.value.cells[index].free) {
      return null;
    }
    const marked = !card.value.marked[index];
    card.value.marked[index] = marked;
    return { cardId: card.value.id, index, marked };
  }

  function applyMarked(update) {
    if (!card.value || !update) {
      return;
    }
    card.value.marked[update.index] = update.marked;
  }

  function setRejection(reason) {
    rejection.value = reason || "";
  }

  return {
    roomCode,
    playerId,
    name,
    card,
    rejection,
    joining,
    syncCode,
    join,
    clear,
    setCard,
    toggleMark,
    applyMarked,
    setRejection
  };
});
