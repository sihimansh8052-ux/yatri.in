import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:5000/api",
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("yatri_token");
  if (token && !config.url?.includes("/auth/")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (original?.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original?._retry && localStorage.getItem("yatri_token")) {
      original._retry = true;
      try {
        const { data } = await api.post<{ token: string }>("/auth/refresh", {
          refreshToken: localStorage.getItem("yatri_refresh")
        });
        localStorage.setItem("yatri_token", data.token);
        original.headers.Authorization = `Bearer ${data.token}`;
        return api(original);
      } catch (_refreshError) {
        localStorage.removeItem("yatri_token");
        localStorage.removeItem("yatri_refresh");
        window.dispatchEvent(new Event("yatri:logout"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
