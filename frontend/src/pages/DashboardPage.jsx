import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const avatar = params.get("avatar");

    if (token) {
      hasProcessed.current = true;
      login({ name, email, avatar }, token);
      window.history.replaceState({}, "", "/courts");
      // ← Go straight to courts page after login
      navigate("/courts");
    } else {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        hasProcessed.current = true;
        login(JSON.parse(savedUser), savedToken);
        navigate("/courts");
      } else {
        navigate("/");
      }
    }
  }, []);

  // Show loading while redirecting
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f0fdf4",
      fontSize: "20px",
      color: "#16a34a",
    }}>
      🏸 Loading...
    </div>
  );
};

export default DashboardPage;