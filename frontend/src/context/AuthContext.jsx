import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getProfile } from "../services/authService";

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

  const login = async ({ email, password, role, rememberMe }) => {
    try {
      const userData = await loginUser({ email, password, role });
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      setUser(userData);
      saveAuth(userData);
      return userData;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    saveAuth(null);
  };

  const register = async ({ name, email, role, password, section }) => {
    const newUser = await registerUser({ name, email, role, password, section });
    return newUser;
  }
  
  const refreshProfile = async () => {
    if (!user?.email || !user?.role) return;
    try {
      const profile = await getProfile(user.role, user.email);
      if (profile) {
        setUser(profile);
        saveAuth(profile);
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
