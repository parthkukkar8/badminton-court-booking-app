import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CourtCard from "../components/CourtCard";
import API from "../api/axios";

const CourtsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (locationStatus === "granted" && userLocation) {
      fetchNearbyCourts(userLocation.latitude, userLocation.longitude);
    }
  }, [location.key]);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyCourts(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation]);

  const getLocation = () => {
    setLocationStatus("loading");
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location.");
      setLocationStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("granted");
      },
      (err) => {
        console.error("Location error:", err);
        setLocationStatus("denied");
        setError("Location access denied.");
      }
    );
  };

  const fetchNearbyCourts = async (latitude, longitude) => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/courts/nearby", {
        params: { latitude, longitude, maxDistance: 10000 },
      });
      setCourts(res.data.courts);
    } catch (err) {
      setError("Failed to fetch nearby courts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCourtSelect = (court) => {
    navigate("/slots", { state: court });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={styles.root}>
      {/* Background */}
      <div style={styles.bgGradient} />
      <div style={styles.bgGrid} />

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navInner}>
          <div style={styles.navLogo}>
            <span style={{ fontSize: "22px" }}>🏸</span>
            <span style={styles.navLogoText}>BadmintonBook</span>
          </div>
          <div style={styles.navLinks}>
            <button style={{ ...styles.navLink, ...styles.navLinkActive }}>
              Courts
            </button>
            <button
              style={styles.navLink}
              onClick={() => navigate("/bookings")}
            >
              My Bookings
            </button>
          </div>
          <div style={styles.navRight}>
            <img
              src={user?.avatar}
              alt={user?.name}
              style={styles.avatar}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${user?.name}&background=166534&color=fff`;
              }}
            />
            <span style={styles.userName}>{user?.name}</span>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.content}>

        {/* Location Loading */}
        {(locationStatus === "idle" || locationStatus === "loading") && (
          <div style={styles.statusBox}>
            <div style={styles.statusIcon}>📍</div>
            <h3 style={styles.statusTitle}>Finding your location...</h3>
            <p style={styles.statusText}>
              Please allow location access when prompted
            </p>
          </div>
        )}

        {/* Location Denied */}
        {locationStatus === "denied" && (
          <div style={styles.errorBox}>
            <div style={styles.statusIcon}>🚫</div>
            <h3 style={styles.statusTitle}>Location Access Blocked</h3>
            <p style={styles.statusText}>
              You have blocked location access. To see nearby courts,
              please reset the permission:
            </p>
            <div style={styles.instructionsBox}>
              <p style={styles.instructionStep}>
                1️⃣ Click the <strong>🔒 lock icon</strong> in the address bar
              </p>
              <p style={styles.instructionStep}>
                2️⃣ Find <strong>"Location"</strong> → change to{" "}
                <strong>"Allow"</strong>
              </p>
              <p style={styles.instructionStep}>
                3️⃣ <strong>Refresh the page</strong> and try again
              </p>
            </div>
            <button style={styles.retryBtn} onClick={getLocation}>
              🔄 I've allowed it, Try Again
            </button>
          </div>
        )}

        {/* Courts Section */}
        {locationStatus === "granted" && (
          <>
            {/* Header */}
            <div style={styles.header}>
              <div>
                <h1 style={styles.headerTitle}>Courts Near You</h1>
                <p style={styles.headerSubtitle}>
                  📍 Showing courts within 10km of your location
                </p>
              </div>
              <button
                style={styles.refreshBtn}
                onClick={() =>
                  fetchNearbyCourts(
                    userLocation.latitude,
                    userLocation.longitude
                  )
                }
              >
                🔄 Refresh
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div style={styles.loadingRow}>
                🔍 Searching nearby courts...
              </div>
            )}

            {/* No Courts */}
            {!loading && courts.length === 0 && (
              <div style={styles.emptyBox}>
                <div style={styles.statusIcon}>🏸</div>
                <h3 style={styles.statusTitle}>No courts found nearby</h3>
                <p style={styles.statusText}>
                  No badminton courts within 10km of your location yet.
                </p>
              </div>
            )}

            {/* Courts Grid */}
            {!loading && courts.length > 0 && (
              <>
                <p style={styles.foundText}>
                  Found {courts.length} court
                  {courts.length > 1 ? "s" : ""} near you
                </p>
                <div style={styles.grid}>
                  {courts.map((court) => (
                    <CourtCard
                      key={court._id}
                      court={court}
                      onSelect={handleCourtSelect}
                      userLocation={userLocation}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Banner */}
        <div style={styles.banner}>
          <span>🏸 Want to list your court?</span>
          <strong> Call us: 6283382129</strong>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
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
    background:
      "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(22,163,74,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgGrid: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
  },

  // Navbar
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    backgroundColor: "rgba(10,15,10,0.85)",
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
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "2px solid rgba(22,163,74,0.5)",
  },
  userName: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  logoutBtn: {
    backgroundColor: "rgba(239,68,68,0.1)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "8px",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
  },

  // Content
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 24px",
    position: "relative",
    zIndex: 1,
  },

  // Status boxes
  statusBox: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  errorBox: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: "20px",
    border: "1px solid rgba(239,68,68,0.15)",
  },
  statusIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  statusTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "20px",
    color: "#ffffff",
    margin: "0 0 8px 0",
  },
  statusText: {
    color: "rgba(255,255,255,0.4)",
    margin: "0 0 20px 0",
    fontSize: "14px",
  },
  instructionsBox: {
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "16px 24px",
    marginBottom: "20px",
    textAlign: "left",
    maxWidth: "420px",
    margin: "0 auto 20px auto",
  },
  instructionStep: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    margin: "8px 0",
    lineHeight: "1.6",
  },
  retryBtn: {
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 24px",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
    margin: 0,
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
  },
  refreshBtn: {
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "10px 18px",
    cursor: "pointer",
    fontSize: "13px",
    color: "rgba(255,255,255,0.6)",
    fontFamily: "'DM Sans', sans-serif",
  },

  // Courts
  loadingRow: {
    textAlign: "center",
    padding: "60px",
    color: "rgba(255,255,255,0.4)",
    fontSize: "15px",
  },
  emptyBox: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: "20px",
    border: "1px dashed rgba(22,163,74,0.2)",
  },
  foundText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "13px",
    marginBottom: "16px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "16px",
    marginBottom: "40px",
  },

  // Banner
  banner: {
    background:
      "linear-gradient(135deg, rgba(22,163,74,0.15) 0%, rgba(22,163,74,0.05) 100%)",
    border: "1px solid rgba(22,163,74,0.2)",
    borderRadius: "16px",
    padding: "20px 32px",
    textAlign: "center",
    fontSize: "15px",
    color: "rgba(255,255,255,0.7)",
    marginTop: "24px",
  },
};

export default CourtsPage;