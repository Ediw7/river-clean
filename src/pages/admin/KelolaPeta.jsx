import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
        <button onClick={() => navigate('/login')} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Login
        </button>
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
    
      <main className="ml-56 p-8 overflow-y-auto w-full relative z-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Kelola Peta Pencemaran</h1>
            <div className="mb-4 flex justify-between items-center">
              <div>
                <label className="mr-2">Filter Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="all">Semua Status</option>
                  <option value="bersih">Bersih</option>
                  <option value="tercemar">Tercemar</option>
                  <option value="kritis">Kritis</option>
                </select>
              </div>
              <button
                onClick={() => navigate('/admin/tambahpeta')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Tambah Lokasi
              </button>
            </div>
            {loading ? (
              <p className="text-center">Memuat peta...</p>
            ) : (
              <MapContainer center={[-6.1745, 106.8227]} zoom={10} style={{ height: '70vh', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {petaData.map((item) => (
                  item.latitude && item.longitude && (
                    <Marker key={item.id} position={[item.latitude, item.longitude]} icon={getMarkerIcon(item.status)}>
                      <Popup>
                        <div>
                          <p><strong>Lokasi:</strong> {item.lokasi}</p>
                          <p><strong>Status:</strong> {item.status}</p>
                          <p><strong>Jenis Limbah:</strong> {item.jenis_limbah || '-'}</p>
                          <p><strong>Intensitas Polusi:</strong> {item.heatmap_intensity}</p>
                          <p><strong>Terakhir Diperbarui:</strong> {new Date(item.updated_at).toLocaleString()}</p>
                          <div className="mt-2 space-x-2">
                            <button
                              onClick={() => setEditModal({ open: true, data: item })}
                              className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            )}
          </div>
        </main>
      </div>
      <FooterAdmin />
      {/* Modal Edit */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Lokasi</h2>
            <input
              type="text"
              value={editModal.data.lokasi}
              onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, lokasi: e.target.value } })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Lokasi"
            />
            <select
              value={editModal.data.status}
              onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, status: e.target.value } })}
              className="w-full p-2 mb-2 border rounded"
            >
              <option value="bersih">Bersih</option>
              <option value="tercemar">Tercemar</option>
              <option value="kritis">Kritis</option>
            </select>
            <input
              type="text"
              value={editModal.data.jenis_limbah || ''}
              onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, jenis_limbah: e.target.value } })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Jenis Limbah (opsional)"
            />
            <input
              type="number"
              value={editModal.data.heatmap_intensity}
              onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, heatmap_intensity: e.target.value } })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Intensitas Polusi (1-10)"
              min="1"
              max="10"
            />
            <input
              type="number"
              value={editModal.data.latitude}
              onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, latitude: e.target.value } })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Latitude"
            />
            <input
              type="number"
              value={editModal.data.longitude}
              onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, longitude: e.target.value } })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Longitude"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditModal({ open: false, data: null })}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={() => handleEdit(editModal.data.id, editModal.data)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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