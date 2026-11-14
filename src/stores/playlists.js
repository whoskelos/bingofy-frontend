import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getPlaylists } from "../services/api.js";
import { errorCodeFrom } from "../utils/errorMessages.js";

export const usePlaylistsStore = defineStore("playlists", () => {
  const items = ref([]);
  const selectedIds = ref([]);
  const loading = ref(false);
  const errorCode = ref("");

  const selected = computed(() => items.value.filter((playlist) => selectedIds.value.includes(playlist.id)));
  const poolSize = computed(() => selected.value.reduce((total, playlist) => total + (playlist.validTracks || 0), 0));
  const lowVariety = computed(() => poolSize.value >= 100 && poolSize.value <= 150);

  async function load() {
    loading.value = true;
    errorCode.value = "";
    try {
      items.value = await getPlaylists();
    } catch (error) {
      items.value = [];
      errorCode.value = errorCodeFrom(error) || "VALIDATION_ERROR";
    } finally {
      loading.value = false;
    }
  }

  function toggle(id) {
    if (selectedIds.value.includes(id)) {
      selectedIds.value = selectedIds.value.filter((item) => item !== id);
      return;
    }
    selectedIds.value = [...selectedIds.value, id];
  }

  return { items, selectedIds, selected, poolSize, lowVariety, loading, errorCode, load, toggle };
});
