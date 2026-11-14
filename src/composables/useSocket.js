import { onScopeDispose, ref } from "vue";
import { createSocket } from "../services/socket.js";

export function useSocket(namespace, { onConnect } = {}) {
  const status = ref("connecting");
  const pending = [];
  let socket;
  let disposed = false;

  function on(event, handler) {
    if (socket) {
      socket.on(event, handler);
    }
    pending.push([event, handler]);
  }

  function emit(event, payload) {
    socket?.emit(event, payload);
  }

  socket = createSocket(namespace);
  for (const [event, handler] of pending) {
    socket.on(event, handler);
  }
  socket.on("connect", () => {
    status.value = "connected";
    onConnect?.(socket);
  });
  socket.on("disconnect", () => {
    status.value = "reconnecting";
  });
  socket.on("connect_error", () => {
    status.value = "disconnected";
  });
  socket.io.on("reconnect_attempt", () => {
    status.value = "reconnecting";
  });

  onScopeDispose(() => {
    disposed = true;
    socket?.disconnect();
  });

  return { status, on, emit, get connected() { return !disposed && status.value === "connected"; } };
}
