import axios from "axios";

const http = axios.create();

http.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem("accessToken");
  const baseUrl = process.env.REACT_APP_URL_PRONOSTICO;
  if (accessToken && config.url && baseUrl && config.url.startsWith(baseUrl)) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default http;
