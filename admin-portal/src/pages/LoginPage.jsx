import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login, admin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if redirected back from Google with token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const avatar = params.get("avatar");
    const error = params.get("error");

    if (error === "not_admin") {
      alert("❌ Access denied! This email is not authorized as admin.");
      window.history.replaceState({}, "", "/");
      return;
    }

    if (token) {
      login({ name, email, avatar }, token);
      window.history.replaceState({}, "", "/");
      navigate("/dashboard");
      return;
    }

    // Already logged in → go straight to dashboard
    if (admin) {
      navigate("/dashboard");
    }
  }, []);

  const handleGoogleLogin = () => {
    // We'll use a special query param to tell auth service
    // this request is coming from admin portal
    window.location.href =
      "http://localhost:3001/api/auth/google?portal=admin";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.logo}>⚙️</div>
        <h1 style={styles.title}>Admin Portal</h1>
        <p style={styles.subtitle}>BadmintonBook Court Management</p>

        <div style={styles.warning}>
          🔒 Restricted Access — Authorized Personnel Only
        </div>

        <button style={styles.googleBtn} onClick={handleGoogleLogin}>
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            style={styles.googleIcon}
          />
          Continue with Google
        </button>

        <p style={styles.note}>
          Only authorized admin accounts can access this portal.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    width: "100%",
    maxWidth: "400px",
  },
  logo: {
    fontSize: "56px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#f1f5f9",
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: "24px",
    textAlign: "center",
  },
  warning: {
    backgroundColor: "#1e3a5f",
    border: "1px solid #3b82f6",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#93c5fd",
    fontSize: "13px",
    marginBottom: "32px",
    textAlign: "center",
    width: "100%",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    width: "100%",
    justifyContent: "center",
  },
  googleIcon: {
    width: "20px",
    height: "20px",
  },
  note: {
    marginTop: "20px",
    fontSize: "12px",
    color: "#64748b",
    textAlign: "center",
  },
};

export default LoginPage;