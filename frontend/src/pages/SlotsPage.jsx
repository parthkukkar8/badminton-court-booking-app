import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3003");

const SlotsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state: courtFromNav } = useLocation();

  const [court, setCourt] = useState(courtFromNav);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courtFromNav) {
      navigate("/courts");
      return;
    }

    // ← Always fetch FRESH court data when page loads
    // This ensures slots show correct booked/available status
    fetchFreshCourtData(courtFromNav._id);
  }, []);

  const fetchFreshCourtData = async (courtId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8000/api/courts/${courtId}`
      );
      const freshCourt = res.data.court;
      setCourt(freshCourt);
      setSlots(freshCourt.slots);
    } catch (error) {
      console.error("Failed to fetch fresh court data:", error);
      // Fallback to navigation state if fetch fails
      setSlots(courtFromNav.slots);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!court) return;

    socket.emit("join-court", court._id);

    socket.on("slot-booked", ({ slotId }) => {
      setSlots((prev) =>
        prev.map((s) =>
          s._id === slotId ? { ...s, isBooked: true } : s
        )
      );
    });

    socket.on("slot-released", ({ slotId }) => {
  // Someone cancelled payment — slot is available again!
  setSlots((prev) =>
    prev.map((s) =>
      s._id === slotId ? { ...s, isBooked: false } : s
    )
  );
});

    return () => {
      socket.emit("leave-court", court._id);
      socket.off("slot-booked");
    socket.off("slot-released"); 

    };
  }, [court]);

 // Find handleBook function and update the success part:
const handleBook = async (slot) => {
  if (slot.isBooked) return;
  setSelectedSlot(slot);
  setBooking(true);
  setError("");

  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:8000/api/bookings/book",
      {
        courtId: court._id,
        courtName: court.name,
        slotId: slot._id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        pricePerSlot: court.pricePerSlot,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ← Navigate to payment page with booking details
    navigate("/payment", {
      state: {
        bookingId: res.data.booking._id,
        courtName: court.name,
        startTime: slot.startTime,
        endTime: slot.endTime,
        amount: court.pricePerSlot,
      },
    });

  } catch (err) {
    setError(
      err.response?.data?.message || "Failed to book slot. Try again."
    );
    setBooking(false);
  }
};

  // Show loading while fetching fresh data
  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f0fdf4",
        fontSize: "18px",
        color: "#16a34a",
      }}>
        🏸 Loading slots...
      </div>
    );
  }

  if (!court) return null;

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/courts")}>
          ← Back
        </button>
        <div>
          <h2 style={styles.courtName}>{court.name}</h2>
          <p style={styles.courtAddress}>📍 {court.address}</p>
        </div>
      </div>

      <div style={styles.priceRow}>
        <span style={styles.priceBadge}>
          💰 ₹{court.pricePerSlot} per slot
        </span>
        <span style={styles.liveBadge}>
          🔴 Live Updates On
        </span>
      </div>

      {booked && (
        <div style={styles.successBox}>
          ✅ Slot booked successfully! Payment coming in Phase 5.
        </div>
      )}

      {error && (
        <div style={styles.errorBox}>
          ❌ {error}
        </div>
      )}

      <h3 style={styles.slotsTitle}>Available Slots</h3>

      <div style={styles.slotsGrid}>
        {slots.map((slot) => (
          <button
            key={slot._id}
            style={
              slot.isBooked
                ? styles.slotBooked
                : selectedSlot?._id === slot._id && booking
                ? styles.slotLoading
                : styles.slotAvailable
            }
            onClick={() => !slot.isBooked && handleBook(slot)}
            disabled={slot.isBooked || booking}
          >
            <span style={styles.slotTime}>
              {slot.startTime} – {slot.endTime}
            </span>
            <span style={styles.slotStatus}>
              {slot.isBooked
                ? "❌ Booked"
                : selectedSlot?._id === slot._id && booking
                ? "⏳ Booking..."
                : "✅ Available"}
            </span>
          </button>
        ))}
      </div>

      <div style={styles.legend}>
        <span style={styles.legendItem}>
          <span style={styles.dotGreen}></span> Available
        </span>
        <span style={styles.legendItem}>
          <span style={styles.dotRed}></span> Booked
        </span>
      </div>

    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0fdf4",
    padding: "32px 16px",
    maxWidth: "700px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginBottom: "20px",
  },
  backBtn: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#374151",
    whiteSpace: "nowrap",
  },
  courtName: {
    margin: "0 0 4px 0",
    fontSize: "22px",
    color: "#111827",
  },
  courtAddress: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
  },
  priceRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    alignItems: "center",
  },
  priceBadge: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "6px 16px",
    fontSize: "14px",
    color: "#374151",
  },
  liveBadge: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "20px",
    padding: "6px 16px",
    fontSize: "13px",
    color: "#dc2626",
  },
  successBox: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: "12px",
    padding: "16px",
    color: "#166534",
    marginBottom: "20px",
    textAlign: "center",
    fontSize: "15px",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "16px",
    color: "#dc2626",
    marginBottom: "20px",
    textAlign: "center",
    fontSize: "15px",
  },
  slotsTitle: {
    color: "#111827",
    marginBottom: "16px",
    fontSize: "18px",
  },
  slotsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  },
  slotAvailable: {
    backgroundColor: "white",
    border: "2px solid #16a34a",
    borderRadius: "12px",
    padding: "16px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    alignItems: "center",
  },
  slotBooked: {
    backgroundColor: "#f9fafb",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    cursor: "not-allowed",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    alignItems: "center",
    opacity: 0.6,
  },
  slotLoading: {
    backgroundColor: "#fefce8",
    border: "2px solid #fbbf24",
    borderRadius: "12px",
    padding: "16px",
    cursor: "not-allowed",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    alignItems: "center",
  },
  slotTime: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },
  slotStatus: {
    fontSize: "12px",
    color: "#6b7280",
  },
  legend: {
    display: "flex",
    gap: "24px",
    justifyContent: "center",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#6b7280",
  },
  dotGreen: {
    width: "10px",
    height: "10px",
    backgroundColor: "#16a34a",
    borderRadius: "50%",
    display: "inline-block",
  },
  dotRed: {
    width: "10px",
    height: "10px",
    backgroundColor: "#dc2626",
    borderRadius: "50%",
    display: "inline-block",
  },
};

export default SlotsPage;
