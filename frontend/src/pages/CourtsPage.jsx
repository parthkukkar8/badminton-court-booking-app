import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CourtCard from "../components/CourtCard";
import API from "../api/axios";

const CourtsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Location state
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  // idle | loading | granted | denied

  // When page loads → ask for location
  useEffect(() => {
    getLocation();
  }, []);

  // When location is found → fetch courts
  useEffect(() => {
    if (location) {
      fetchNearbyCourts(location.latitude, location.longitude);
    }
  }, [location]);

  const getLocation = () => {
    setLocationStatus("loading");

    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location.");
      setLocationStatus("denied");
      return;
    }

    // Ask browser for user's current location
    navigator.geolocation.getCurrentPosition(
      // Success → got location
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus("granted");
      },
      // Error → user denied or something went wrong
      (err) => {
        console.error("Location error:", err);
        setLocationStatus("denied");
        setError(
          "Location access denied. Please allow location to see nearby courts."
        );
      }
    );
  };

  const fetchNearbyCourts = async (latitude, longitude) => {
    setLoading(true);
    setError("");

    try {
      // Call our court service
      // maxDistance = 10000 meters = 10km radius
      const res = await API.get("/courts/nearby", {
        params: {
          latitude,
          longitude,
          maxDistance: 10000,
        },
      });

      setCourts(res.data.courts);

    } catch (err) {
      setError("Failed to fetch nearby courts. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourtSelect = (court) => {
    // Phase 4 — will navigate to booking page
    alert(`Booking for ${court.name} coming in Phase 4!`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.logo}>🏸 BadmintonBook</span>
        </div>
        <div style={styles.navRight}>
          <img
            src={user?.avatar}
            alt={user?.name}
            style={styles.avatar}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${user?.name}`;
            }}
          />
          <span style={styles.userName}>{user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>

        {/* Location Status */}
        {locationStatus === "loading" && (
          <div style={styles.statusBox}>
            <div style={styles.statusIcon}>📍</div>
            <h3 style={styles.statusTitle}>Finding your location...</h3>
            <p style={styles.statusText}>
              Please allow location access when prompted
            </p>
          </div>
        )}

        {locationStatus === "denied" && (
          <div style={styles.errorBox}>
            <div style={styles.statusIcon}>🚫</div>
            <h3 style={styles.statusTitle}>Location Access Denied</h3>
            <p style={styles.statusText}>{error}</p>
            <button style={styles.retryBtn} onClick={getLocation}>
              Try Again
            </button>
          </div>
        )}

        {/* Courts List */}
        {locationStatus === "granted" && (
          <>
            {/* Header */}
            <div style={styles.header}>
              <div>
                <h2 style={styles.title}>Courts Near You</h2>
                <p style={styles.subtitle}>
                  📍 Showing courts within 10km of your location
                </p>
              </div>
              <button
                style={styles.refreshBtn}
                onClick={() => fetchNearbyCourts(
                  location.latitude,
                  location.longitude
                )}
              >
                🔄 Refresh
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div style={styles.loadingRow}>
                <span>🔍 Searching nearby courts...</span>
              </div>
            )}

            {/* No Courts Found */}
            {!loading && courts.length === 0 && (
              <div style={styles.emptyBox}>
                <div style={styles.statusIcon}>🏸</div>
                <h3 style={styles.statusTitle}>No courts found nearby</h3>
                <p style={styles.statusText}>
                  There are no badminton courts within 10km of your location yet.
                </p>
              </div>
            )}

            {/* Courts Grid */}
            {!loading && courts.length > 0 && (
              <>
                <p style={styles.foundText}>
                  Found {courts.length} court{courts.length > 1 ? "s" : ""} near you
                </p>
                <div style={styles.grid}>
                  {courts.map((court) => (
                    <CourtCard
                      key={court._id}
                      court={court}
                      onSelect={handleCourtSelect}
                      userLocation={location}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Call to Register Court Banner */}
        <div style={styles.banner}>
          <span>🏸 Want to list your court?</span>
          <strong> Call us: 6283382129</strong>
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0fdf4",
  },
  navbar: {
    backgroundColor: "white",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  navLeft: {},
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#166534",
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
    border: "2px solid #16a34a",
  },
  userName: {
    fontSize: "14px",
    color: "#374151",
    fontWeight: "500",
  },
  logoutBtn: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "6px",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "13px",
  },
  content: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "32px 16px",
  },
  statusBox: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  errorBox: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #fecaca",
  },
  statusIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  statusTitle: {
    fontSize: "20px",
    color: "#111827",
    margin: "0 0 8px 0",
  },
  statusText: {
    color: "#6b7280",
    margin: "0 0 20px 0",
  },
  retryBtn: {
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 24px",
    cursor: "pointer",
    fontSize: "14px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "24px",
    color: "#111827",
  },
  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },
  refreshBtn: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#374151",
  },
  loadingRow: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
    fontSize: "16px",
  },
  emptyBox: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px dashed #d1fae5",
  },
  foundText: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  banner: {
    backgroundColor: "#166534",
    color: "white",
    borderRadius: "12px",
    padding: "16px 24px",
    textAlign: "center",
    fontSize: "15px",
    marginTop: "24px",
  },
};

export default CourtsPage;