import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const BookingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:8000/api/bookings/my-bookings",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(res.data.bookings);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter(b => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  const statusColor = (status) => {
    if (status === "confirmed") return { bg: "rgba(22,163,74,0.15)", color: "#4ade80", border: "rgba(22,163,74,0.3)" };
    if (status === "pending") return { bg: "rgba(234,179,8,0.15)", color: "#fbbf24", border: "rgba(234,179,8,0.3)" };
    return { bg: "rgba(239,68,68,0.15)", color: "#f87171", border: "rgba(239,68,68,0.3)" };
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCancelBooking = async (bookingId) => {
  if (!window.confirm(
    "Are you sure you want to cancel this booking? This cannot be undone."
  )) return;

  try {
    const token = localStorage.getItem("token");
    await axios.patch(
      `http://localhost:8000/api/bookings/${bookingId}/user-cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Refresh bookings list
    fetchBookings();
  } catch (err) {
    alert("Failed to cancel booking. Please try again.");
  }
};

  return (
    <div style={styles.root}>
      <div style={styles.bgGradient} />
      <div style={styles.bgGrid} />

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <div style={styles.navLogo} onClick={() => navigate("/courts")}>
            <span style={styles.navLogoIcon}>🏸</span>
            <span style={styles.navLogoText}>BadmintonBook</span>
          </div>
          <div style={styles.navLinks}>
            <button style={styles.navLink} onClick={() => navigate("/courts")}>
              Courts
            </button>
            <button style={{ ...styles.navLink, ...styles.navLinkActive }}>
              My Bookings
            </button>
          </div>
          <div style={styles.navRight}>
            <img
              src={user?.avatar}
              alt={user?.name}
              style={styles.navAvatar}
              onError={e => e.target.src = `https://ui-avatars.com/api/?name=${user?.name}&background=166534&color=fff`}
            />
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div style={styles.content}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>My Bookings</h1>
            <p style={styles.headerSubtitle}>
              Track all your court reservations
            </p>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <span style={styles.statNum}>
                {bookings.filter(b => b.status === "confirmed").length}
              </span>
              <span style={styles.statLabel}>Confirmed</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statNum}>{bookings.length}</span>
              <span style={styles.statLabel}>Total</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["all", "confirmed", "pending", "cancelled"].map(tab => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span style={{
                ...styles.tabCount,
                ...(activeTab === tab ? styles.tabCountActive : {}),
              }}>
                {tab === "all"
                  ? bookings.length
                  : bookings.filter(b => b.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⏳</div>
            <p style={styles.emptyText}>Loading bookings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🏸</div>
            <p style={styles.emptyTitle}>No bookings yet</p>
            <p style={styles.emptyText}>
              Find a court and book your first slot!
            </p>
            <button
              style={styles.bookNowBtn}
              onClick={() => navigate("/courts")}
            >
              Find Courts →
            </button>
          </div>
        ) : (
          <div style={styles.bookingsList}>
            {filtered.map((booking, i) => {
              const sc = statusColor(booking.status);
              return (
                <div
                  key={booking._id}
                  style={{
                    ...styles.bookingCard,
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  {/* Left accent */}
                  <div style={{
                    ...styles.cardAccent,
                    backgroundColor: sc.color,
                  }} />

                  <div style={styles.cardBody}>
                    <div style={styles.cardTop}>
                      <div>
                        <h3 style={styles.courtName}>{booking.courtName}</h3>
                        <div style={styles.slotTime}>
                          🕐 {booking.startTime} – {booking.endTime}
                        </div>
                      </div>
                      <div style={styles.cardRight}>
                        <div style={{
                          ...styles.statusBadge,
                          backgroundColor: sc.bg,
                          color: sc.color,
                          border: `1px solid ${sc.border}`,
                        }}>
                          {booking.status === "confirmed" ? "✅" :
                           booking.status === "pending" ? "⏳" : "❌"}
                          {" "}{booking.status}
                        </div>
                        <div style={styles.amount}>
                          ₹{booking.pricePerSlot}
                        </div>
                      </div>
                    </div>

                    <div style={styles.cardFooter}>
  <span style={styles.bookingDate}>
    📅 {new Date(booking.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}
  </span>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <span style={styles.bookingId}>
      #{booking._id.slice(-6).toUpperCase()}
    </span>
    {/* Show cancel button only for confirmed bookings */}
    {booking.status === 'confirmed' && (
      <button
        style={styles.cancelBookingBtn}
        onClick={() => handleCancelBooking(booking._id)}
      >
        Cancel Booking
      </button>
    )}
  </div>
</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#0a0f0a",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
  },
  bgGradient: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(22,163,74,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgGrid: {
    position: "fixed",
    inset: 0,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
  },
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    backgroundColor: "rgba(10,15,10,0.8)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  navInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  },
  navLogoIcon: {
    fontSize: "24px",
  },
  navLogoText: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "18px",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "-0.5px",
  },
  navLinks: {
    display: "flex",
    gap: "4px",
  },
  navLink: {
    backgroundColor: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  navLinkActive: {
    color: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  navAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "2px solid rgba(22,163,74,0.5)",
  },
  logoutBtn: {
    backgroundColor: "rgba(239,68,68,0.1)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "8px",
    padding: "6px 14px",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  content: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 24px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
  },
  headerTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "32px",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 6px 0",
    letterSpacing: "-1px",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
    margin: 0,
  },
  statsRow: {
    display: "flex",
    gap: "12px",
  },
  statBox: {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "12px 20px",
    textAlign: "center",
    minWidth: "80px",
  },
  statNum: {
    display: "block",
    fontFamily: "'Syne', sans-serif",
    fontSize: "24px",
    fontWeight: "700",
    color: "#16a34a",
  },
  statLabel: {
    display: "block",
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginTop: "2px",
  },
  tabs: {
    display: "flex",
    gap: "4px",
    marginBottom: "24px",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: "12px",
    padding: "4px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  tab: {
    flex: 1,
    backgroundColor: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.4)",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "all 0.2s",
  },
  tabActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#ffffff",
  },
  tabCount: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.4)",
    borderRadius: "20px",
    padding: "1px 7px",
    fontSize: "11px",
  },
  tabCountActive: {
    backgroundColor: "rgba(22,163,74,0.2)",
    color: "#4ade80",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "20px",
    color: "#ffffff",
    margin: "0 0 8px 0",
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
    margin: "0 0 24px 0",
  },
  bookNowBtn: {
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  bookingsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  bookingCard: {
    display: "flex",
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    overflow: "hidden",
    animation: "slideUp 0.4s ease forwards",
    transition: "all 0.2s ease",
  },
  cardAccent: {
    width: "4px",
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    padding: "20px 24px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  courtName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "18px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 6px 0",
  },
  slotTime: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "14px",
  },
  cardRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },
  statusBadge: {
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  amount: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#16a34a",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  bookingDate: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "12px",
  },
  bookingId: {
    color: "rgba(255,255,255,0.2)",
    fontSize: "11px",
    fontFamily: "monospace",
    letterSpacing: "1px",
  },
  cancelBookingBtn: {
  backgroundColor: "rgba(239,68,68,0.1)",
  color: "#f87171",
  border: "1px solid rgba(239,68,68,0.2)",
  borderRadius: "6px",
  padding: "4px 12px",
  fontSize: "12px",
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
}
};

export default BookingsPage;