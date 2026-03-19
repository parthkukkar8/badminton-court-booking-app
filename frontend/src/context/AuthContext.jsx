import { createContext, useContext, useState } from "react";

// Create the context — think of it as a "global variable"
const AuthContext = createContext();

// This wraps your entire app and provides user data everywhere
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Call this after Google login succeeds
  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    // Save to localStorage so user stays logged in on refresh
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Call this on logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    // Everything inside AuthProvider can access user, token, login, logout
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — easy way to use auth in any component
export const useAuth = () => useContext(AuthContext);