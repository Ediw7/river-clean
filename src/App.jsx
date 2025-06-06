import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

import UserDashboard from './pages/user/Dashboard';
import KelolaLaporan from './pages/admin/KelolaLaporan';
import KelolaPeta from './pages/admin/KelolaPeta';
import KelolaAcara from './pages/admin/KelolaAcara';
import KelolaPengguna from './pages/admin/KelolaPengguna';
import KelolaTantangan from './pages/admin/KelolaTantangan';


import AdminDashboard from './pages/admin/Dashboard';
import UserLaporan from './pages/user/Laporan';



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
          path="/admin/laporan"
          element={
            <ProtectedRoute allowedRole="admin">
              <KelolaLaporan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/peta"
          element={
            <ProtectedRoute allowedRole="admin">
              <KelolaPeta />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/acara"
          element={
            <ProtectedRoute allowedRole="admin">
              <KelolaAcara />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pengguna"
          element={
            <ProtectedRoute allowedRole="admin">
              <KelolaPengguna />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tantangan"
          element={
            <ProtectedRoute allowedRole="admin">
              <KelolaTantangan />
            </ProtectedRoute>
          }
        />
      


        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

         <Route
          path="/user/laporan"
          element={
            <ProtectedRoute allowedRole="user">
              <UserLaporan />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>


  );
}

export default App;