import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CourtsPage from "./pages/CourtsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* NEW */}
          <Route path="/courts" element={<CourtsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;