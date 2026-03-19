const CourtCard = ({ court, onSelect, userLocation }) => {
  const availableSlots = court.slots.filter((s) => !s.isBooked).length;

  // ─── Haversine Formula ───────────────────────────────────────
  // Calculates distance between two lat/lng points in kilometers
  // This is the same formula Google Maps uses internally
  const getDistance = (userLat, userLng, courtLng, courtLat) => {
    const R = 6371; // Earth's radius in kilometers

    // Convert degrees to radians
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(courtLat - userLat);
    const dLng = toRad(courtLng - userLng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLat)) *
        Math.cos(toRad(courtLat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    return distance;
  };
  // ─────────────────────────────────────────────────────────────

  // Calculate distance if user location is available
  let distanceText = null;
  if (userLocation && court.location?.coordinates) {
    const dist = getDistance(
      userLocation.latitude,
      userLocation.longitude,
      court.location.coordinates[0], // longitude (GeoJSON is [lng, lat])
      court.location.coordinates[1]  // latitude
    );

    // Format nicely:
    // Under 1km → show in meters e.g. "850 m"
    // Over 1km  → show in km e.g. "2.4 km"
    distanceText = dist < 1
      ? `${Math.round(dist * 1000)} m away`
      : `${dist.toFixed(1)} km away`;
  }

  return (
    <div style={styles.card}>

      {/* Court Header */}
      <div style={styles.header}>
        <span style={styles.icon}>🏸</span>
        <div style={{ flex: 1 }}>
          <h3 style={styles.name}>{court.name}</h3>
          <p style={styles.address}>📍 {court.address}</p>
        </div>

        {/* Distance Badge — top right of card */}
        {distanceText && (
          <div style={styles.distanceBadge}>
            🗺️ {distanceText}
          </div>
        )}
      </div>

      {/* Price and Slots Info */}
      <div style={styles.infoRow}>
        <div style={styles.infoBadge}>
          💰 ₹{court.pricePerSlot} / slot
        </div>
        <div style={
          availableSlots > 0
            ? styles.infoBadgeGreen
            : styles.infoBadgeRed
        }>
          {availableSlots > 0
            ? `✅ ${availableSlots} slots available`
            : "❌ Fully booked"}
        </div>
      </div>

      {/* Time Slots Preview */}
      <div style={styles.slotsRow}>
        {court.slots.slice(0, 4).map((slot, i) => (
          <span
            key={i}
            style={slot.isBooked ? styles.slotBooked : styles.slotAvailable}
          >
            {slot.startTime}–{slot.endTime}
          </span>
        ))}
        {court.slots.length > 4 && (
          <span style={styles.slotMore}>
            +{court.slots.length - 4} more
          </span>
        )}
      </div>

      {/* Book Button */}
      <button
        style={availableSlots > 0 ? styles.bookBtn : styles.bookBtnDisabled}
        onClick={() => availableSlots > 0 && onSelect(court)}
        disabled={availableSlots === 0}
      >
        {availableSlots > 0 ? "View & Book Slots" : "No Slots Available"}
      </button>

    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  header: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  icon: {
    fontSize: "32px",
  },
  name: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },
  address: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
  },
  distanceBadge: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: "20px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  infoRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  infoBadge: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "13px",
  },
  infoBadgeGreen: {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "13px",
  },
  infoBadgeRed: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "13px",
  },
  slotsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "16px",
  },
  slotAvailable: {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "12px",
  },
  slotBooked: {
    backgroundColor: "#f9fafb",
    color: "#9ca3af",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "12px",
    textDecoration: "line-through",
  },
  slotMore: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "12px",
  },
  bookBtn: {
    width: "100%",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  bookBtnDisabled: {
    width: "100%",
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    cursor: "not-allowed",
  },
};

export default CourtCard;
