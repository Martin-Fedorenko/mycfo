import axios from "axios";

const http = axios.create();

http.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const baseUrl = process.env.REACT_APP_URL_PRONOSTICO;
  if (config.url && baseUrl && config.url.startsWith(baseUrl)) {
    config.headers = config.headers ?? {};
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    const usuarioSub = sessionStorage.getItem("sub");
    if (usuarioSub) {
      config.headers["X-Usuario-Sub"] = usuarioSub;
    }
  }
  return config;
});

export default http;
