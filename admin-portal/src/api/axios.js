import axios from "axios";

const API = axios.create({
  // ← Changed to gateway port 8000
  baseURL: "http://localhost:8000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default API;