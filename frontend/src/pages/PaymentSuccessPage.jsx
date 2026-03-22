import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccessPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { courtName, startTime, endTime, amount } = state || {};

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.checkmark}>✅</div>
        <h2 style={styles.title}>Booking Confirmed!</h2>
        <p style={styles.subtitle}>Your slot has been successfully booked</p>

        <div style={styles.summary}>
          <div style={styles.row}>
            <span style={styles.label}>Court</span>
            <span style={styles.value}>{courtName}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Slot</span>
            <span style={styles.value}>{startTime} – {endTime}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Amount Paid</span>
            <span style={styles.valueGreen}>₹{amount}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Status</span>
            <span style={styles.valueGreen}>Confirmed ✅</span>
          </div>
        </div>

        <button
          style={styles.btn}
          onClick={() => navigate("/courts")}
        >
          Book Another Court
        </button>

      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0fdf4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  checkmark: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: "24px",
  },
  summary: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  label: {
    color: "#6b7280",
    fontSize: "14px",
  },
  value: {
    color: "#111827",
    fontWeight: "500",
    fontSize: "14px",
  },
  valueGreen: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: "14px",
  },
  btn: {
    width: "100%",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default PaymentSuccessPage;