import axios from "axios";

const DEFAULT_API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://revoraglobal.com/api"
    : "http://localhost:5000/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const isFormDataPayload =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormDataPayload && config.headers) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
        config.headers.delete("content-type");
      } else {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    }

    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
