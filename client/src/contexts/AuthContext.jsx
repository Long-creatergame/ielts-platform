import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Auto-login from localStorage on app start
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setToken(savedToken);
        console.log("🔄 Auto-login from localStorage:", userData);
      } catch (error) {
        console.error("❌ Error parsing saved user data:", error);
        // Clear corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  const login = (userData, jwtToken) => {
    const userWithToken = { ...userData, token: jwtToken };
    setUser(userWithToken);
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userWithToken));
    console.log("✅ Login successful, user data saved to localStorage");
  };

  const loginUser = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
      return { success: true, user: data.user };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed';
      console.error('Login error:', error);
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      const payload = {
        ...userData,
        goal: Number(userData.goal) || 0,
        targetBand: Number(userData.targetBand) || 6.5,
      };
      const { data } = await api.post('/auth/register', payload);
      login(data.user, data.token);
      return { success: true, user: data.user };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Registration failed';
      console.error('Registration error:', error);
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("🚪 Logout successful, user data cleared from localStorage");
  };

  // Helper function để get user ID cho API calls
  const getUserId = () => {
    if (user?.id) return user.id;
    // For guest users, return a default guest ID that works with MongoDB
    return '000000000000000000000000';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginUser, register, logout, getUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Export hook để các component khác (Dashboard, Profile, ...) dùng được
export const useAuth = () => {
  return useContext(AuthContext);
};