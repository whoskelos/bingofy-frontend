import { io } from "socket.io-client";
import { getEnv } from "../config/env.js";

export function createSocket(namespace) {
  const base = getEnv().socketUrl.replace(/\/$/, "");
  return io(`${base}${namespace}`, {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    forceNew: true
  });
}
