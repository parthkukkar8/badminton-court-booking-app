import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CourtsPage from "./pages/CourtsPage";
import SlotsPage from "./pages/SlotsPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import BookingsPage from "./pages/BookingsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/courts" element={<CourtsPage />} />
          <Route path="/slots" element={<SlotsPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;