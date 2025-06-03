import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Verifikasi from './pages/admin/Verifikasi';
import Acara from './pages/admin/Acara';
import Konten from './pages/admin/Konten';
import Tantangan from './pages/admin/Tantangan';
import Dashboard from './pages/user/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifikasi"
          element={
            <ProtectedRoute allowedRole="admin">
              <Verifikasi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/acara"
          element={
            <ProtectedRoute allowedRole="admin">
              <Acara />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/konten"
          element={
            <ProtectedRoute allowedRole="admin">
              <Konten />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tantangan"
          element={
            <ProtectedRoute allowedRole="admin">
              <Tantangan />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;