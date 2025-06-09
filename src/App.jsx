import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

import Dashboard from './pages/admin/Dashboard';
import KelolaLaporan from './pages/admin/KelolaLaporan';
import KelolaPeta from './pages/admin/KelolaPeta';
import TambahPeta from './pages/admin/TambahPeta';
import KelolaAcara from './pages/admin/KelolaAcara';
import TambahAcara from './pages/admin/TambahAcara';
import KelolaPengguna from './pages/admin/KelolaPengguna';
import KelolaTantangan from './pages/admin/KelolaTantangan';
import TambahTantangan from './pages/admin/TambahTantangan';
import KelolaCompanion from './pages/admin/KelolaCompanion';

import UserDashboard from './pages/user/Dashboard';
import Laporan from './pages/user/Laporan';
import Peta from './pages/user/Peta';
import Acara from './pages/user/Acara';
import Tantangan from './pages/user/Tantangan';
import Companion from './pages/user/Companion';
import PesanDigital from './pages/user/PesanDigital';



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
              <Dashboard />
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
          path="/admin/tambahpeta"
          element={
            <ProtectedRoute allowedRole="admin">
              <TambahPeta />
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
          path="/admin/tambahacara"
          element={
            <ProtectedRoute allowedRole="admin">
              <TambahAcara />
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
          path="/admin/tambahtantangan"
          element={
            <ProtectedRoute allowedRole="admin">
              <TambahTantangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companion"
          element={
            <ProtectedRoute allowedRole="admin">
              <KelolaCompanion />
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
              <Laporan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/peta"
          element={
            <ProtectedRoute allowedRole="user">
              <Peta />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/acara"
          element={
            <ProtectedRoute allowedRole="user">
              <Acara />
            </ProtectedRoute>
          }
        />
      
        <Route
          path="/user/tantangan"
          element={
            <ProtectedRoute allowedRole="user">
              <Tantangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/companion"
          element={
            <ProtectedRoute allowedRole="user">
              <Companion />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/pesandigital"
          element={
            <ProtectedRoute allowedRole="user">
              <PesanDigital />
            </ProtectedRoute>
          }
        />






      </Routes>
    </Router>


  );
}

export default App;