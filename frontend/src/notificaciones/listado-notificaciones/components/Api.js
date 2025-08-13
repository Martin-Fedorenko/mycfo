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

export default api;
