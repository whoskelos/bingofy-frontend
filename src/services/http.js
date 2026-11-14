import axios from "axios";
import { getEnv } from "../config/env.js";

export const http = axios.create({
  withCredentials: true
});

http.interceptors.request.use((config) => {
  config.baseURL = getEnv().apiBaseUrl;
  return config;
});
