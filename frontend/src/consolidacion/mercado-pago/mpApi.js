// src/mercado-pago/mpApi.js
import axios from "axios";

const API_BASE = (
  process.env.REACT_APP_URL_CONSOLIDACION || "http://localhost:8082"
).replace(/\/$/, "");
// Si además tu backend tuviera context-path, ej. /mycfo, agregalo acá:
const API_CTX = (process.env.REACT_APP_API_CONTEXT || "").replace(/\/$/, "");

const api = axios.create({
  baseURL: `${API_BASE}${API_CTX}/api/mp`,
});

console.log("MP baseURL =>", api.defaults.baseURL); // dejalo para verificar

export const mpApi = {
  getOauthUrl: async () => (await api.get("/oauth/url")).data,
  getStatus: async () => (await api.get("/status")).data,
  getPayments: async (params) => (await api.get("/payments", { params })).data,
  importById: async (paymentId) =>
    (await api.post("/import", { paymentId })).data,
  importByMonth: async (month, year) =>
    (await api.post("/import", { month, year })).data,
  facturar: async (ids) =>
    (await api.post("/facturar", { paymentIds: ids })).data,
};
