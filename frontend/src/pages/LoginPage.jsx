const LoginPage = () => {
  
  // When user clicks the button, send them to our backend
  // Backend will redirect to Google
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3001/api/auth/google";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* App Logo / Icon */}
        <div style={styles.logo}>🏸</div>

        {/* App Name */}
        <h1 style={styles.title}>BadmintonBook</h1>
        <p style={styles.subtitle}>
          Book courts, find players, play more.
        </p>

        {/* Google Login Button */}
        <button style={styles.googleBtn} onClick={handleGoogleLogin}>
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            style={styles.googleIcon}
          />
          Continue with Google
        </button>

        <p style={styles.terms}>
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "400px",
  },
  logo: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#166534",
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: "36px",
    textAlign: "center",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    width: "100%",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  googleIcon: {
    width: "20px",
    height: "20px",
  },
  terms: {
    marginTop: "24px",
    fontSize: "12px",
    color: "#9ca3af",
    textAlign: "center",
  },
};

export default LoginPage;