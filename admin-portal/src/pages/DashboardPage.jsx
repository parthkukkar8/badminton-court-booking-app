import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const DashboardPage = () => {
  const { admin, login, logout } = useAuth();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Clean token from URL bar
      window.history.replaceState({}, "", "/dashboard");
    } else {
      // Check localStorage
      const savedToken = localStorage.getItem("adminToken");
      const savedAdmin = localStorage.getItem("admin");

      if (savedToken && savedAdmin) {
        hasProcessed.current = true;
        login(JSON.parse(savedAdmin), savedToken);
      } else {
        navigate("/");
      }
    }
  }, []);

  useEffect(() => {
    // Only fetch courts once admin is set in context
    if (admin) {
      fetchCourts();
    }
  }, [admin]);

  const fetchCourts = async () => {
    try {
      const res = await API.get("/courts/all");
      setCourts(res.data.courts);
    } catch (error) {
      console.error("Failed to fetch courts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courtId) => {
    if (!window.confirm("Are you sure you want to delete this court?")) return;
    try {
      await API.delete(`/courts/${courtId}`);
      setCourts(courts.filter((c) => c._id !== courtId));
    } catch (error) {
      alert("Failed to delete court");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!admin) {
    return (
      <div style={styles.loading}>
        ⚙️ Loading...
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.navLogo}>⚙️ Admin Portal</span>
        </div>
        <div style={styles.navRight}>
          <img src={admin?.avatar} alt="" style={styles.navAvatar}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${admin?.name}`;
            }}
          />
          <span style={styles.navName}>{admin?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>

        <div style={styles.headerRow}>
          <h2 style={styles.title}>🏸 All Courts ({courts.length})</h2>
          <button
            style={styles.addBtn}
            onClick={() => navigate("/add-court")}
          >
            + Add New Court
          </button>
        </div>

        {loading ? (
          <div style={styles.emptyMsg}>Loading courts...</div>
        ) : courts.length === 0 ? (
          <div style={styles.emptyMsg}>
            No courts added yet. Click "Add New Court" to get started.
          </div>
        ) : (
          <div style={styles.courtGrid}>
            {courts.map((court) => (
              <div key={court._id} style={styles.courtCard}>

                <div style={styles.courtHeader}>
                  <h3 style={styles.courtName}>{court.name}</h3>
                  <span style={court.isActive ? styles.badgeActive : styles.badgeInactive}>
                    {court.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p style={styles.courtDetail}>📍 {court.address}</p>
                <p style={styles.courtDetail}>💰 ₹{court.pricePerSlot} per slot</p>
                <p style={styles.courtDetail}>🕐 {court.slots.length} slots</p>

                <div style={styles.slotsPreview}>
                  {court.slots.slice(0, 4).map((slot, i) => (
                    <span key={i} style={styles.slotBadge}>
                      {slot.startTime}–{slot.endTime}
                    </span>
                  ))}
                  {court.slots.length > 4 && (
                    <span style={styles.moreBadge}>
                      +{court.slots.length - 4} more
                    </span>
                  )}
                </div>

                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(court._id)}
                >
                  🗑️ Delete Court
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    color: "#94a3b8",
    fontSize: "20px",
    backgroundColor: "#0f172a",
  },
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
  },
  navbar: {
    backgroundColor: "#1e293b",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #334155",
  },
  navLeft: {},
  navLogo: {
    color: "#f1f5f9",
    fontSize: "18px",
    fontWeight: "700",
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
  },
  navName: {
    color: "#94a3b8",
    fontSize: "14px",
  },
  logoutBtn: {
    backgroundColor: "#450a0a",
    color: "#fca5a5",
    border: "none",
    borderRadius: "6px",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "13px",
  },
  content: {
    padding: "32px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    color: "#f1f5f9",
    margin: 0,
  },
  addBtn: {
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  emptyMsg: {
    color: "#64748b",
    textAlign: "center",
    padding: "60px",
    border: "1px dashed #334155",
    borderRadius: "12px",
  },
  courtGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  courtCard: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #334155",
  },
  courtHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  courtName: {
    color: "#f1f5f9",
    margin: 0,
    fontSize: "16px",
  },
  badgeActive: {
    backgroundColor: "#14532d",
    color: "#86efac",
    borderRadius: "20px",
    padding: "2px 10px",
    fontSize: "12px",
  },
  badgeInactive: {
    backgroundColor: "#450a0a",
    color: "#fca5a5",
    borderRadius: "20px",
    padding: "2px 10px",
    fontSize: "12px",
  },
  courtDetail: {
    color: "#94a3b8",
    fontSize: "13px",
    margin: "0 0 8px 0",
  },
  slotsPreview: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "16px",
  },
  slotBadge: {
    backgroundColor: "#0f172a",
    color: "#38bdf8",
    borderRadius: "4px",
    padding: "2px 8px",
    fontSize: "11px",
  },
  moreBadge: {
    backgroundColor: "#0f172a",
    color: "#64748b",
    borderRadius: "4px",
    padding: "2px 8px",
    fontSize: "11px",
  },
  deleteBtn: {
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "1px solid #ef4444",
    borderRadius: "6px",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "13px",
    width: "100%",
  },
};

export default DashboardPage;