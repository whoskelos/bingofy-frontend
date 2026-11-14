import QRCode from "qrcode";
import { ref, toValue, watch } from "vue";
import { roomUrl } from "../utils/roomUrl.js";

export function useRoomQr(codeSource) {
  const url = ref("");
  const qrDataUrl = ref("");
  const error = ref("");

  watch(() => toValue(codeSource), async (code) => {
    if (!code) {
      url.value = "";
      qrDataUrl.value = "";
      return;
    }
    const nextUrl = roomUrl(code);
    url.value = nextUrl;
    try {
      qrDataUrl.value = await QRCode.toDataURL(nextUrl, {
        errorCorrectionLevel: "M",
        margin: 4,
        width: 640,
        color: { dark: "#000000", light: "#ffffff" }
      });
      error.value = "";
    } catch {
      qrDataUrl.value = "";
      error.value = "No se pudo generar el QR";
    }
  }, { immediate: true });

  return { url, qrDataUrl, error };
}
