import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    // On app load, check if admin was already logged in
    const saved = localStorage.getItem("admin");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("adminToken") || null;
  });

  const login = (adminData, accessToken) => {
    setAdmin(adminData);
    setToken(accessToken);
    localStorage.setItem("admin", JSON.stringify(adminData));
    localStorage.setItem("adminToken", accessToken);
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);