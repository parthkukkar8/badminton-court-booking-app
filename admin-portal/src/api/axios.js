import axios from "axios";

// Base URL of our court service
const API = axios.create({
  baseURL: "http://localhost:3002/api",
});

// Before every request, attach the token from localStorage
// So we don't have to manually add it every time
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    // This is how our adminAuth middleware expects it
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;