import { createContext, useContext, useState, useEffect } from "react";

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

  const register = async (userData) => {
    try {
      // FIXED: Use environment variable directly (already includes /api)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      const data = await response.json();
      login(data.user, data.token);
      return data;
    } catch (error) {
      throw error;
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
    <AuthContext.Provider value={{ user, token, login, register, logout, getUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Export hook để các component khác (Dashboard, Profile, ...) dùng được
export const useAuth = () => {
  return useContext(AuthContext);
};