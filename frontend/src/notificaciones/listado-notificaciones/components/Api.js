// src/config/api.js
import axios from "axios";

// CRA: process.env.REACT_APP_URL_NOTIFICACION
// Vite: import.meta.env.VITE_URL_NOTIFICACION
const BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_URL_NOTIFICACION) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_URL_NOTIFICACION) ||
  "http://localhost:8084"; // fallback a tu puerto del servicio de notificaciones

const api = axios.create({
  baseURL: BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const updatedConfig = { ...config };
  updatedConfig.headers = updatedConfig.headers ?? {};

  const accessToken = sessionStorage.getItem("accessToken");
  if (accessToken) {
    updatedConfig.headers.Authorization = `Bearer ${accessToken}`;
  }

  const usuarioSub = sessionStorage.getItem("sub");
  if (usuarioSub) {
    updatedConfig.headers["X-Usuario-Sub"] = usuarioSub;
  }

  return updatedConfig;
});

export default api;
