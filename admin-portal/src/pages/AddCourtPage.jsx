import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const AddCourtPage = () => {
  const navigate = useNavigate();

  // Form state — stores everything admin types
  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    pricePerSlot: "",
  });

  // Slots state — admin adds time slots one by one
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ startTime: "", endTime: "" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update form fields as admin types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add a new time slot to the list
  const addSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) {
      alert("Please enter both start and end time");
      return;
    }
    setSlots([...slots, { ...newSlot, isBooked: false }]);
    // Reset the input fields
    setNewSlot({ startTime: "", endTime: "" });
  };

  // Remove a slot from list
  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!form.name || !form.address || !form.latitude || !form.longitude || !form.pricePerSlot) {
      setError("Please fill all fields");
      return;
    }
    if (slots.length === 0) {
      setError("Please add at least one time slot");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/courts/add", {
        name: form.name,
        address: form.address,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        pricePerSlot: parseInt(form.pricePerSlot),
        slots,
      });

      alert("✅ Court added successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add court");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>➕ Add New Court</h2>

        {error && <div style={styles.error}>{error}</div>}

        {/* Court Name */}
        <label style={styles.label}>Court Name</label>
        <input
          style={styles.input}
          name="name"
          placeholder="e.g. Smash Badminton Arena"
          value={form.name}
          onChange={handleChange}
        />

        {/* Address */}
        <label style={styles.label}>Full Address</label>
        <input
          style={styles.input}
          name="address"
          placeholder="e.g. 123 MG Road, Bangalore"
          value={form.address}
          onChange={handleChange}
        />

        {/* Latitude & Longitude */}
        <label style={styles.label}>Location Coordinates</label>
        <div style={styles.row}>
          <input
            style={{ ...styles.input, flex: 1 }}
            name="latitude"
            placeholder="Latitude e.g. 12.9716"
            value={form.latitude}
            onChange={handleChange}
          />
          <input
            style={{ ...styles.input, flex: 1 }}
            name="longitude"
            placeholder="Longitude e.g. 77.5946"
            value={form.longitude}
            onChange={handleChange}
          />
        </div>

        {/* Helper text for coordinates */}
        <p style={styles.hint}>
          💡 Go to Google Maps → right click on the court location → copy coordinates
        </p>

        {/* Price */}
        <label style={styles.label}>Price Per Slot (₹)</label>
        <input
          style={styles.input}
          name="pricePerSlot"
          type="number"
          placeholder="e.g. 300"
          value={form.pricePerSlot}
          onChange={handleChange}
        />

        {/* Time Slots */}
        <label style={styles.label}>Time Slots</label>
        <div style={styles.row}>
          <input
            style={{ ...styles.input, flex: 1 }}
            placeholder="Start e.g. 06:00"
            value={newSlot.startTime}
            onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
          />
          <input
            style={{ ...styles.input, flex: 1 }}
            placeholder="End e.g. 07:00"
            value={newSlot.endTime}
            onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
          />
          <button style={styles.addSlotBtn} onClick={addSlot}>
            + Add
          </button>
        </div>

        {/* List of added slots */}
        {slots.length > 0 && (
          <div style={styles.slotsList}>
            {slots.map((slot, index) => (
              <div key={index} style={styles.slotItem}>
                <span>🕐 {slot.startTime} - {slot.endTime}</span>
                <button
                  style={styles.removeBtn}
                  onClick={() => removeSlot(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <button
          style={loading ? styles.btnDisabled : styles.btn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Adding Court..." : "✅ Add Court"}
        </button>

        <button
          style={styles.cancelBtn}
          onClick={() => navigate("/dashboard")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    display: "flex",
    justifyContent: "center",
    padding: "40px 16px",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "560px",
    height: "fit-content",
  },
  title: {
    color: "#f1f5f9",
    marginBottom: "24px",
    fontSize: "22px",
  },
  label: {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "6px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#f1f5f9",
    fontSize: "14px",
    marginBottom: "16px",
    boxSizing: "border-box",
  },
  row: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  hint: {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "-12px",
    marginBottom: "16px",
  },
  addSlotBtn: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    marginBottom: "16px",
  },
  slotsList: {
    marginBottom: "16px",
  },
  slotItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: "8px",
    padding: "10px 14px",
    marginBottom: "8px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontSize: "16px",
  },
  btn: {
    width: "100%",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "16px",
    cursor: "pointer",
    marginBottom: "12px",
  },
  btnDisabled: {
    width: "100%",
    backgroundColor: "#334155",
    color: "#64748b",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "16px",
    cursor: "not-allowed",
    marginBottom: "12px",
  },
  cancelBtn: {
    width: "100%",
    backgroundColor: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    backgroundColor: "#450a0a",
    color: "#fca5a5",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
    fontSize: "14px",
  },
};

export default AddCourtPage;