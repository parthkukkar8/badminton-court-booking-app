import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { bookingId, courtName, startTime, endTime, amount } = state || {};

    const handlePayment = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            // STEP 1 — Create order on our backend
            const orderRes = await axios.post(
                "http://localhost:8000/api/payments/create-order",
                { bookingId, amount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { orderId, amount: orderAmount, currency } = orderRes.data;

            // STEP 2 — Open Razorpay checkout popup
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderAmount,
                currency,
                name: "BadmintonBook",
                description: `${courtName} — ${startTime} to ${endTime}`,
                order_id: orderId,

                // STEP 3 — Runs after user pays successfully
                handler: async (response) => {
                    try {
                        // Verify payment on our backend
                        await axios.post(
                            "http://localhost:8000/api/payments/verify",
                            {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                bookingId,
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        // Payment verified → go to success page
                        navigate("/payment-success", {
                            state: { courtName, startTime, endTime, amount },
                        });

                    } catch (err) {
                        setError("Payment verification failed. Contact support.");
                    }
                },

                // User closed the payment popup
               modal: {
  ondismiss: async () => {
    console.log('Payment dismissed, bookingId:', bookingId);
    try {
      const token = localStorage.getItem("token");
      if (!bookingId) {
        console.error('No bookingId found!');
        setLoading(false);
        return;
      }
      const res = await axios.patch(
        `http://localhost:8000/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Cancel response:', res.data);
    } catch (err) {
      console.error("Failed to release slot:", err.response?.data || err.message);
    }
    setLoading(false);
    setError("Payment cancelled. Slot has been released.");
  },
},


                // Pre-fill user details
                prefill: {
                    name: user.name || "",
                    email: user.email || "",
                    contact: "9999999999", // ← Makes UPI appear
                },

                theme: {
                    color: "#16a34a",
                },
            };

            // Open Razorpay checkout
            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (err) {
            setError("Failed to initiate payment. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
  try {
    const token = localStorage.getItem("token");

    if (bookingId) {
      console.log('Cancelling booking:', bookingId);
      await axios.patch(
        `http://localhost:3003/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Slot released');
    }
  } catch (err) {
    console.error("Failed to release slot:", err.message);
  }
  // Go back regardless of whether cancel API succeeded
  navigate(-1);
};

    if (!state) {
        navigate("/courts");
        return null;
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                <div style={styles.logo}>🏸</div>
                <h2 style={styles.title}>Complete Payment</h2>

                {/* Booking Summary */}
                <div style={styles.summary}>
                    <div style={styles.summaryRow}>
                        <span style={styles.summaryLabel}>Court</span>
                        <span style={styles.summaryValue}>{courtName}</span>
                    </div>
                    <div style={styles.summaryRow}>
                        <span style={styles.summaryLabel}>Slot</span>
                        <span style={styles.summaryValue}>{startTime} – {endTime}</span>
                    </div>
                    <div style={styles.divider} />
                    <div style={styles.summaryRow}>
                        <span style={styles.totalLabel}>Total Amount</span>
                        <span style={styles.totalValue}>₹{amount}</span>
                    </div>
                </div>

                {/* Payment Methods Info */}
                <div style={styles.methodsBox}>
                    <p style={styles.methodsTitle}>Accepted Payment Methods</p>
                    <div style={styles.methodsRow}>
                        <span style={styles.methodBadge}>📱 UPI</span>
                        <span style={styles.methodBadge}>💳 Cards</span>
                        <span style={styles.methodBadge}>🏦 Net Banking</span>
                        <span style={styles.methodBadge}>👛 Wallets</span>
                    </div>
                </div>

                {error && (
                    <div style={styles.errorBox}>❌ {error}</div>
                )}

                {/* Pay Button */}
                <button
                    style={loading ? styles.btnDisabled : styles.btn}
                    onClick={handlePayment}
                    disabled={loading}
                >
                    {loading ? "Opening Payment..." : `Pay ₹${amount}`}
                </button>
<button
  style={styles.cancelBtn}
  onClick={handleCancel}
>
  Cancel
</button>

                {/* Security Note */}
                <p style={styles.securityNote}>
                    🔒 Secured by Razorpay. Your payment info is safe.
                </p>

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
    },
    logo: {
        fontSize: "48px",
        marginBottom: "12px",
    },
    title: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#111827",
        marginBottom: "24px",
    },
    summary: {
        width: "100%",
        backgroundColor: "#f9fafb",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
    },
    summaryRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
    },
    summaryLabel: {
        color: "#6b7280",
        fontSize: "14px",
    },
    summaryValue: {
        color: "#111827",
        fontSize: "14px",
        fontWeight: "500",
    },
    divider: {
        height: "1px",
        backgroundColor: "#e5e7eb",
        margin: "12px 0",
    },
    totalLabel: {
        color: "#111827",
        fontSize: "16px",
        fontWeight: "600",
    },
    totalValue: {
        color: "#16a34a",
        fontSize: "20px",
        fontWeight: "700",
    },
    methodsBox: {
        width: "100%",
        marginBottom: "20px",
        textAlign: "center",
    },
    methodsTitle: {
        color: "#6b7280",
        fontSize: "13px",
        marginBottom: "8px",
    },
    methodsRow: {
        display: "flex",
        gap: "8px",
        justifyContent: "center",
        flexWrap: "wrap",
    },
    methodBadge: {
        backgroundColor: "#f3f4f6",
        color: "#374151",
        borderRadius: "20px",
        padding: "4px 12px",
        fontSize: "12px",
    },
    errorBox: {
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        padding: "12px",
        color: "#dc2626",
        fontSize: "14px",
        marginBottom: "16px",
        width: "100%",
        textAlign: "center",
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
        marginBottom: "12px",
    },
    btnDisabled: {
        width: "100%",
        backgroundColor: "#d1fae5",
        color: "#6b7280",
        border: "none",
        borderRadius: "8px",
        padding: "14px",
        fontSize: "16px",
        cursor: "not-allowed",
        marginBottom: "12px",
    },
    cancelBtn: {
        width: "100%",
        backgroundColor: "transparent",
        color: "#6b7280",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "14px",
        cursor: "pointer",
        marginBottom: "16px",
    },
    securityNote: {
        fontSize: "12px",
        color: "#9ca3af",
        textAlign: "center",
        margin: 0,
    },
};

export default PaymentPage;