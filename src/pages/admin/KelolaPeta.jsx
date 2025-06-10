import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat'; 
import { Edit, Trash2, MapPin } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const getMarkerIcon = (status) => {
  const iconUrl = {
    bersih: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    tercemar: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    kritis: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  }[status] || 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'; // Default blue

  return new L.Icon({
    iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

function HeatmapLayer({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !L.heat) {
      console.warn('Leaflet.heat not loaded or map instance not available for heatmap.');
      return;
    }

   
    const heatPoints = data.map(item => [item.latitude, item.longitude, item.heatmap_intensity || 0]); 

    map.eachLayer((layer) => {
      if (layer._heat) { 
        map.removeLayer(layer);
      }
    });

    const heat = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,    
      maxZoom: 17, 
      gradient: { 0.0: 'blue', 0.2: 'cyan', 0.4: 'green', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, data]); 

  return null;
}


export default function KelolaPeta() {
  const navigate = useNavigate();
  const [petaData, setPetaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editModal, setEditModal] = useState({ open: false, data: null });

  const fetchData = useCallback(async () => {
    setLoading(true); 
    try {
      let query = supabase.from('peta_status').select('*').order('updated_at', { ascending: false });
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setPetaData(data || []);
    } catch (err) {
      setError('Gagal memuat data peta: ' + err.message);
      console.error('Error fetching peta data:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
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

        await fetchData();

      } catch (err) {
        setError('Gagal memuat halaman: ' + err.message);
        console.error('Auth check error:', err);
      } finally {
        setLoading(false); 
      }
    };

    checkAuthAndFetch();
  }, [navigate, fetchData]);

  const handleEdit = async (id, updatedData) => {
    const originalPetaData = [...petaData]; 

    setPetaData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, ...updatedData, updated_at: new Date().toISOString() } : item
      )
    );
    setEditModal({ open: false, data: null }); 

    try {
   
      const payload = {
        lokasi: updatedData.lokasi,
        status: updatedData.status,
        jenis_limbah: updatedData.jenis_limbah || null,
        heatmap_intensity: parseInt(updatedData.heatmap_intensity, 10) || 0, 
        latitude: parseFloat(updatedData.latitude),
        longitude: parseFloat(updatedData.longitude),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('peta_status')
        .update(payload)
        .eq('id', id);

      if (error) {
        console.error('Supabase UPDATE error:', error);
        console.error('Pesan error Supabase:', error.message);
        console.error('Detail error Supabase:', error.details);
        console.error('Hint error Supabase:', error.hint);
        throw error;
      }
    } catch (err) {
      setError('Gagal mengedit data: ' + err.message);
      setPetaData(originalPetaData);
      setEditModal({ open: true, data: originalPetaData.find(item => item.id === id) }); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      const originalPetaData = [...petaData]; 

      setPetaData(prevData => prevData.filter(item => item.id !== id));

      try {
        const { error } = await supabase.from('peta_status').delete().eq('id', id);
        if (error) {
          console.error('Supabase DELETE error:', error);
          console.error('Pesan error Supabase:', error.message);
          console.error('Detail error Supabase:', error.details);
          console.error('Hint error Supabase:', error.hint);
          throw error;
        }
      } catch (err) {
        setError('Gagal menghapus data: ' + err.message);
        setPetaData(originalPetaData); 
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

  const defaultMapCenter = [-6.1745, 106.8227]; 
  const defaultMapZoom = 10;
  const mapCenter = petaData.length > 0 && petaData[0].latitude && petaData[0].longitude
    ? [petaData[0].latitude, petaData[0].longitude]
    : defaultMapCenter;

  return (
    <div className="h-screen overflow-hidden bg-white relative">
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderAdmin />
      </div>

      <div className="flex pt-16 h-full">
        <div className="fixed top-16 left-0 h-[calc(100%-4rem)] w-84 z-40">
          <SidebarAdmin />
        </div>

        <main className="ml-56 pt-6 pb-16 px-8 w-full overflow-y-auto h-full bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
          <div className="max-w-6xl mx-auto">
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
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/25"
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
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg overflow-hidden p-4"> 
                <MapContainer
                  center={mapCenter}
                  zoom={defaultMapZoom}
                  scrollWheelZoom={true}
                  style={{ height: '70vh', width: '100%' }}
                  className="rounded-xl" 
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
                            <p className="text-slate-600"><strong>Status:</strong> <span className={`font-semibold ${
                              item.status === 'bersih' ? 'text-green-600' :
                              item.status === 'tercemar' ? 'text-yellow-600' :
                              item.status === 'kritis' ? 'text-red-600' : 'text-gray-600'
                            }`}>{item.status.toUpperCase()}</span></p>
                            <p className="text-slate-600"><strong>Jenis Limbah:</strong> {item.jenis_limbah || '-'}</p>
                            <p className="text-slate-600"><strong>Intensitas Polusi:</strong> {item.heatmap_intensity || '-'}</p>
                            <p className="text-slate-600"><strong>Terakhir Diperbarui:</strong> {new Date(item.updated_at).toLocaleString()}</p>
                            <div className="mt-4 flex space-x-2">
                              <button
                                onClick={() => setEditModal({ open: true, data: item })}
                                className="px-3 py-1.5 bg-yellow-500 text-white rounded-md text-sm font-medium transition-all duration-300 hover:bg-yellow-600 flex items-center space-x-1 justify-center"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium transition-all duration-300 hover:bg-red-700 flex items-center space-x-1 justify-center"
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
             
                  {petaData.length > 0 && <HeatmapLayer data={petaData} />}
                </MapContainer>
              </div>
            )}
          
            <div className="mt-8 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg overflow-hidden">
                <h2 className="text-xl font-bold text-slate-800 p-4 border-b border-slate-200">Daftar Lokasi</h2>
                {petaData.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">Tidak ada data lokasi yang tersedia.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lokasi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jenis Limbah</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Intensitas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Latitude</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Longitude</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Terakhir Diperbarui</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {petaData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.lokasi}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.status === 'bersih' ? 'bg-green-100 text-green-800' :
                                                item.status === 'tercemar' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.jenis_limbah || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.heatmap_intensity || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.latitude}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.longitude}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {new Date(item.updated_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setEditModal({ open: true, data: item })}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
          </div>
        </main>
      </div>
      <FooterAdmin />

      {/* Modal Edit */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full max-w-2xl border border-white/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Edit Lokasi Peta</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label>
                <input
                  type="text"
                  value={editModal.data.lokasi}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, lokasi: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="Nama Lokasi / Sungai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status Kebersihan</label>
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
                  placeholder="Contoh: Plastik, Kimia, Sampah Organik"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Intensitas Polusi (1-10)</label>
                <input
                  type="number"
                  value={editModal.data.heatmap_intensity}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, heatmap_intensity: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="Skala 1 (rendah) - 10 (tinggi)"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Latitude</label>
                <input
                  type="number"
                  step="any" 
                  value={editModal.data.latitude}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, latitude: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="-6.12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={editModal.data.longitude}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, longitude: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="106.12345"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditModal({ open: false, data: null })}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => handleEdit(editModal.data.id, editModal.data)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}