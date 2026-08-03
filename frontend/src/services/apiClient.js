import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const getErrorMessage = (error) => {
  if (error.response) {
    const data = error.response.data;
    if (typeof data === "string" && data.trim()) return data.trim();
    if (data?.message) return data.message;
    if (data?.error) return data.error;

    const status = error.response.status;
    if (status === 401) return "Invalid email or password";
    if (status === 403) return "Access denied";
    if (status === 404) return "Resource not found";
    if (status === 409) return "Conflict - resource already exists";
    if (status >= 500) return "Server error. Please try again later.";
  }

  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Cannot connect to server. Please ensure the backend is running.";
  }

  return error.message || "An error occurred. Please try again.";
};

API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(getErrorMessage(error)))
);

export const authHeaders = (role, email) => ({
  headers: {
    "x-user-role": role || "",
    "x-user-email": email || "",
  },
});

export const jsonRequest = (method, path, data, config = {}) =>
  API.request({ method, url: path, data, ...config }).then((res) => res.data);

export const formRequest = (path, formData, config = {}) =>
  API.post(path, formData, {
    ...config,
    headers: {
      ...(config.headers || {}),
      "Content-Type": "multipart/form-data",
    },
  }).then((res) => res.data);

