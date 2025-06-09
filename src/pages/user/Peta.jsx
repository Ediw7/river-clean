import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MapPin, Loader2, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';
import { motion, AnimatePresence } from 'framer-motion';

// Import Leaflet dan Heatmap (manual initialization)
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat'; // Pastikan sudah terinstal: npm install leaflet.heat

// FIX DEFAULT LEAFLET ICON (penting agar marker default tampil)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Icons for different statuses
const getMarkerIcon = (status) => {
  const iconUrl = {
    bersih: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    tercemar: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png', // Yellow for tercemar
    kritis: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',    // Red for kritis
  }[status] || 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'; // Default blue

  return new L.Icon({
    iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};


export default function Peta() {
  const navigate = useNavigate();
  const [petaData, setPetaData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const mapRef = useRef(null); // Ref for the map container DOM element
  const mapInstanceRef = useRef(null); // Ref for the Leaflet map instance

  // useCallback untuk fetchData agar tidak dibuat ulang setiap render
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('peta_status')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPetaData(data || []);
    } catch (err) {
      setError('Gagal memuat data peta: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check Auth dan Fetch Data Awal
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      await fetchData(); // Panggil fetchData setelah otentikasi
    };
    checkAuthAndFetch();
  }, [navigate, fetchData]); // fetchData sebagai dependency

  // Initialize Leaflet map (diperbarui untuk bekerja dengan filteredData)
  useEffect(() => {
    // Hanya inisialisasi peta sekali dan jika data sudah dimuat
    if (!loading && filteredData.length > 0 && mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [filteredData[0].latitude || -6.2088, filteredData[0].longitude || 106.8456], // Set center based on first item
        zoom: 10,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }),
        ],
      });
    }

    // Update markers and heatmap whenever filteredData changes
    if (mapInstanceRef.current) {
      // Clear existing layers (markers and heatmap)
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer._heat) { // Check for Marker instances or heatmap layers
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      const heatPoints = [];
      filteredData.forEach((item) => {
        const lat = item.latitude || -6.2088; // Fallback coordinates
        const lng = item.longitude || 106.8456;
        const intensity = item.heatmap_intensity || 0.5;

        // Add marker with custom icon and popup
        L.marker([lat, lng], { icon: getMarkerIcon(item.status) }) // Menggunakan getMarkerIcon
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-cyan-300">${item.lokasi}</h3>
              <p>Status: <span class="font-semibold">${getStatusText(item.status)}</span></p>
              <p>Jenis Limbah: ${item.jenis_limbah || '-'}</p>
              <p>Intensitas: ${intensity || '-'}</p>
              <p>Terakhir Diperbarui: ${new Date(item.updated_at).toLocaleString()}</p>
            </div>
          `);

        // Add to heatmap
        heatPoints.push([lat, lng, intensity]);
      });

      // Add heatmap layer
      L.heatLayer(heatPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: { 0.0: 'blue', 0.2: 'cyan', 0.4: 'green', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red' }
      }).addTo(mapInstanceRef.current);
    }

    // Cleanup function for map instance
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, filteredData]); // Dependency pada filteredData agar peta terupdate saat filter

  // Logic filter dan search (filteredData sekarang menjadi state yang bergantung pada petaData)
  useEffect(() => {
    let filtered = petaData; // Mulai dari data asli (petaData)
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) =>
        item.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    setFilteredData(filtered); // Update filteredData, yang akan memicu useEffect peta
  }, [searchTerm, statusFilter, petaData]); // Re-run saat searchTerm, statusFilter, atau petaData berubah

  // Fungsi utilitas untuk warna status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'bersih': return 'bg-green-600';
      case 'tercemar': return 'bg-yellow-600'; // Tercemar -> Kuning
      case 'kritis': return 'bg-red-600';     // Kritis -> Merah
      default: return 'bg-gray-500';
    }
  };

  // Fungsi utilitas untuk teks status
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'bersih': return 'Bersih';
      case 'tercemar': return 'Tercemar';
      case 'kritis': return 'Kritis';
      default: return 'Tidak Diketahui';
    }
  };

  const handleCardClick = (item) => {
    if (mapInstanceRef.current && item.latitude && item.longitude) {
      // Set view peta ke lokasi item yang diklik
      mapInstanceRef.current.setView([item.latitude, item.longitude], 14); // Zoom level 14
      
      // Buka popup secara manual (karena kita tidak pakai React-Leaflet Popup Component)
      L.popup()
        .setLatLng([item.latitude, item.longitude])
        .setContent(`
          <div class="p-2">
            <h3 class="font-bold text-cyan-300">${item.lokasi}</h3>
            <p>Status: <span class="font-semibold">${getStatusText(item.status)}</span></p>
            <p>Jenis Limbah: ${item.jenis_limbah || '-'}</p>
            <p>Intensitas: ${item.heatmap_intensity || '-'}</p>
            <p>Terakhir Diperbarui: ${new Date(item.updated_at).toLocaleString()}</p>
          </div>
        `)
        .openOn(mapInstanceRef.current);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white flex flex-col relative overflow-hidden">
        <HeaderUser />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        <div className="flex flex-1 items-center justify-center pt-16">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl z-10 max-w-md mx-4">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-300 mb-4">Terjadi Kesalahan</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={() => fetchData()} // Panggil fetchData untuk coba lagi
                className="px-6 py-3 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 rounded-xl text-cyan-200 hover:from-cyan-600/40 hover:to-blue-600/40 transition-all duration-300 font-medium"
                aria-label="Coba Lagi"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
        <FooterUser />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white flex flex-col relative overflow-x-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-teal-400/15 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      <HeaderUser />

      <div className="flex flex-1 pt-24 relative z-10">
        <main className="p-6 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-md border border-cyan-400/30 rounded-2xl mb-6">
                <MapPin className="w-10 h-10 text-cyan-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
                Peta Interaktif Sungai
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Jelajahi status kebersihan sungai secara real-time dengan peta interaktif kami.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-cyan-300 animate-spin mb-4" />
                <p className="text-gray-300 text-lg">Memuat peta...</p>
              </div>
            ) : (
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
                {/* Filter and Search Bar */}
                <div className="p-6 border-b border-gray-700/50">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari lokasi sungai..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50"
                        aria-label="Cari lokasi"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="text-cyan-300" size={20} />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-800/50 border border-gray-700/50 rounded-lg py-2 px-4 text-gray-200 focus:outline-none focus:border-cyan-500/50"
                        aria-label="Filter status"
                      >
                        <option value="all">Semua Status</option>
                        <option value="bersih">Bersih</option>
                        <option value="tercemar">Tercemar</option>
                        <option value="kritis">Kritis</option> {/* Tambah status kritis */}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Map Container - Menggunakan ref */}
                <div
                  ref={mapRef}
                  className="h-96 w-full"
                  style={{ minHeight: '400px' }}
                ></div>

                {/* Data List */}
                <AnimatePresence>
                  {filteredData.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-8 text-center"
                    >
                      <p className="text-gray-400 text-lg">Tidak ada data peta yang sesuai.</p>
                      <button
                        onClick={() => navigate('/report')}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 rounded-xl text-cyan-200 hover:from-cyan-600/40 hover:to-blue-600/40 transition-all duration-300 font-medium"
                        aria-label="Laporkan Data Baru"
                      >
                        Laporkan Data Baru
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {filteredData.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                          onClick={() => handleCardClick(item)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                              <MapPin size={20} className="text-cyan-400" />
                              {item.lokasi}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(item.status)}`}
                            >
                              {getStatusText(item.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-300 space-y-2">
                            <p><span className="font-medium text-gray-200">Jenis Limbah:</span> {item.jenis_limbah || '-'}</p>
                            <p><span className="font-medium text-gray-200">Intensitas Heatmap:</span> {item.heatmap_intensity || '-'}</p>
                            <p><span className="font-medium text-gray-200">Terakhir Diperbarui:</span> {new Date(item.updated_at).toLocaleString()}</p>
                          </div>
                          {/* Tombol "Lihat Detail" dihapus sesuai permintaan */}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>

      <FooterUser />
    </div>
  );
}