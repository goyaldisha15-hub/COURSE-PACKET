/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { loginUser, registerUser } from "../services/authService";

const AuthContext = createContext();
const AUTH_STORAGE_KEY = "lms-auth-user";

const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveAuth = (user) => {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredAuth);

  const login = async ({ email, password, role }) => {
    const userData = await loginUser({ email, password, role });
    setUser(userData);
    saveAuth(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
    saveAuth(null);
  };

  const register = async ({ name, email, role, password, section }) => {
    const newUser = await registerUser({ name, email, role, password, section });
    return newUser;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
