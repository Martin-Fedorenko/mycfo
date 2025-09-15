// /mercado-pago/mpApi.js
const BASE_URL =
  import.meta?.env?.VITE_API_URL || process.env.REACT_APP_URL_REGISTRO || "";

async function request(path, { method = "GET", body, headers } = {}) {
  const url = `${BASE_URL}${path}`;
  const opts = { method, headers: { ...(headers || {}) } };

  // Solo seteamos JSON si hay body
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  // Si NO usás cookies/sesión en el back, podés quitar esta línea:
  // opts.credentials = "include";

  const res = await fetch(url, opts);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      data?.message || data?.error || text || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export const mpApi = {
  getStatus: () => request("/api/mp/status"),

  startOAuth: async () => {
    const res = await request("/api/mp/oauth/url");
    console.log("Respuesta /oauth/url:", res);
    const authUrl = res?.url || res?.authUrl;
    if (!authUrl)
      throw new Error("El backend no devolvió la URL de autorización");
    return authUrl;
  },

  unlink: () => request("/api/mp/unlink", { method: "POST" }),

  listPayments: (params = {}) => {
    const { from, to, q, page = 0, pageSize = 20 } = params;
    const sp = new URLSearchParams();
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    if (q) sp.set("q", q);
    sp.set("page", page);
    sp.set("size", pageSize);
    sp.set("sort", "fecha,DESC");
    return request(`/api/mp/payments?${sp.toString()}`);
  },

  importPaymentsByMonth: ({ month, year }) =>
    request("/api/mp/import", { method: "POST", body: { month, year } }),

  importPaymentById: (paymentId) =>
    request("/api/mp/import", { method: "POST", body: { paymentId } }),

  getConfig: () => request("/api/mp/config"),
  updateConfig: (cfg) =>
    request("/api/mp/config", { method: "PUT", body: cfg }),

  billPayments: (ids) =>
    request("/api/mp/facturar", { method: "POST", body: { paymentIds: ids } }),
};
