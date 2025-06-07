import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Edit, Trash2, MapPin } from 'lucide-react';

// Custom icon untuk marker berdasarkan status
const getMarkerIcon = (status) => {
  const iconUrl = {
    bersih: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    tercemar: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    kritis: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  }[status] || 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';

  return new L.Icon({
    iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

export default function KelolaPeta() {
  const navigate = useNavigate();
  const [petaData, setPetaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editModal, setEditModal] = useState({ open: false, data: null });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Silakan login terlebih dahulu.');
        navigate('/login');
        return;
      }

      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.email)
          .single();

        if (userError || !userData || userData.role !== 'admin') {
          setError('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
          navigate('/login');
          return;
        }

        let query = supabase.from('peta_status').select('*').order('updated_at', { ascending: false });
        if (filterStatus !== 'all') {
          query = query.eq('status', filterStatus);
        }
        const { data } = await query;
        setPetaData(data || []);
      } catch (err) {
        setError('Gagal memuat data peta: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, filterStatus]);

  const handleEdit = async (id, updatedData) => {
    try {
      const { error } = await supabase
        .from('peta_status')
        .update({
          lokasi: updatedData.lokasi,
          status: updatedData.status,
          jenis_limbah: updatedData.jenis_limbah || null,
          heatmap_intensity: parseInt(updatedData.heatmap_intensity),
          latitude: parseFloat(updatedData.latitude),
          longitude: parseFloat(updatedData.longitude),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      setPetaData(petaData.map((item) =>
        item.id === id ? { ...item, ...updatedData, updated_at: new Date().toISOString() } : item
      ));
      setEditModal({ open: false, data: null });
    } catch (err) {
      setError('Gagal mengedit data: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      try {
        const { error } = await supabase.from('peta_status').delete().eq('id', id);
        if (error) throw error;
        setPetaData(petaData.filter((item) => item.id !== id));
      } catch (err) {
        setError('Gagal menghapus data: ' + err.message);
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-4 font-medium">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 font-medium"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-white relative">
      {/* Header fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderAdmin />
      </div>

      <div className="flex pt-16 h-full">
        {/* Sidebar fixed */}
        <div className="fixed top-16 left-0 h-[calc(100%-4rem)] w-84 z-40">
          <SidebarAdmin />
        </div>

        <main className="ml-56 pt-6 pb-16 px-8 w-full overflow-y-auto h-full bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Kelola Peta Pencemaran
                  </h1>
                  <p className="text-slate-600">Pantau dan kelola status pencemaran di berbagai lokasi.</p>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-slate-700">Filter Status:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-white/80 transition-all duration-300"
                  >
                    <option value="all">Semua Status</option>
                    <option value="bersih">Bersih</option>
                    <option value="tercemar">Tercemar</option>
                    <option value="kritis">Kritis</option>
                  </select>
                </div>
                <button
                  onClick={() => navigate('/admin/tambahpeta')}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-green-500/25"
                >
                  Tambah Lokasi
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Memuat peta...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg overflow-hidden">
                <MapContainer
                  center={[-6.1745, 106.8227]}
                  zoom={10}
                  style={{ height: '70vh', width: '100%' }}
                  className="rounded-2xl"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {petaData.map((item) =>
                    item.latitude && item.longitude && (
                      <Marker key={item.id} position={[item.latitude, item.longitude]} icon={getMarkerIcon(item.status)}>
                        <Popup className="rounded-xl">
                          <div className="p-4">
                            <p className="font-medium text-slate-700"><strong>Lokasi:</strong> {item.lokasi}</p>
                            <p className="text-slate-600"><strong>Status:</strong> {item.status}</p>
                            <p className="text-slate-600"><strong>Jenis Limbah:</strong> {item.jenis_limbah || '-'}</p>
                            <p className="text-slate-600"><strong>Intensitas Polusi:</strong> {item.heatmap_intensity}</p>
                            <p className="text-slate-600"><strong>Terakhir Diperbarui:</strong> {new Date(item.updated_at).toLocaleString()}</p>
                            <div className="mt-4 flex space-x-2">
                              <button
                                onClick={() => setEditModal({ open: true, data: item })}
                                className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 flex items-center space-x-1"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-600/25 flex items-center space-x-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  )}
                </MapContainer>
              </div>
            )}
          </div>
        </main>
      </div>
      <FooterAdmin />

      {/* Modal Edit */}
{editModal.open && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full max-w-2xl border border-white/50">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
          <Edit className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Edit Lokasi</h2>
      </div>
      
      {/* Grid 2 kolom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label>
          <input
            type="text"
            value={editModal.data.lokasi}
            onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, lokasi: e.target.value } })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
            placeholder="Lokasi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
          <select
            value={editModal.data.status}
            onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, status: e.target.value } })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
          >
            <option value="bersih">Bersih</option>
            <option value="tercemar">Tercemar</option>
            <option value="kritis">Kritis</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Limbah (opsional)</label>
          <input
            type="text"
            value={editModal.data.jenis_limbah || ''}
            onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, jenis_limbah: e.target.value } })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
            placeholder="Jenis Limbah"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Intensitas Polusi (1-10)</label>
          <input
            type="number"
            value={editModal.data.heatmap_intensity}
            onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, heatmap_intensity: e.target.value } })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
            placeholder="Intensitas Polusi"
            min="1"
            max="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Latitude</label>
          <input
            type="number"
            value={editModal.data.latitude}
            onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, latitude: e.target.value } })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
            placeholder="Latitude"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Longitude</label>
          <input
            type="number"
            value={editModal.data.longitude}
            onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, longitude: e.target.value } })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
            placeholder="Longitude"
          />
        </div>
      </div>

      {/* Tombol */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={() => setEditModal({ open: false, data: null })}
          className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-300"
        >
          Batal
        </button>
        <button
          onClick={() => handleEdit(editModal.data.id, editModal.data)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
        >
          Simpan
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}