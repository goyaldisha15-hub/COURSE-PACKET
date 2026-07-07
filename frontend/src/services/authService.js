import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function loginUser({ email, password, role }) {
  try {
    const response = await apiClient.post("/auth/login", { email, password, role });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed. Please try again.", { cause: error });
  }
}

export async function registerUser({ name, email, password, role, section }) {
  try {
    const response = await apiClient.post("/auth/register", {
      name,
      email,
      password,
      role,
      section,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed. Please try again.", { cause: error });
  }
}

export async function getUsers(role, email) {
  try {
    const response = await apiClient.get("/admin/users", {
      headers: {
        "x-user-email": email,
        "x-user-role": role,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users", { cause: error });
  }
}
