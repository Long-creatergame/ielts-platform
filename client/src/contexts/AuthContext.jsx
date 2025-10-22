import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  const login = (userData, jwtToken) => {
    setUser({ ...userData, token: jwtToken });
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
  };

  const register = async (userData) => {
    try {
      // Use environment variable with /api suffix
      const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api`;
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
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