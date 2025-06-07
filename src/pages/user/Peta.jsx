import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MapPin, Loader2, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

export default function Peta() {
  const navigate = useNavigate();
  const [petaData, setPetaData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { data } = await supabase
          .from('peta_status')
          .select('*')
          .order('updated_at', { ascending: false });

        setPetaData(data || []);
        setFilteredData(data || []);
      } catch (err) {
        setError('Gagal memuat data peta: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!loading && petaData.length > 0 && !mapInstanceRef.current) {
      // Initialize Leaflet map
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [-6.2088, 106.8456], // Default: Jakarta, Indonesia
        zoom: 10,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }),
        ],
      });

      // Add markers and heatmap
      const heatPoints = [];
      petaData.forEach((item) => {
        const lat = item.latitude || -6.2088; // Fallback coordinates
        const lng = item.longitude || 106.8456;
        const intensity = item.heatmap_intensity || 0.5;

        // Add marker with popup
        L.marker([lat, lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-cyan-300">${item.lokasi}</h3>
              <p>Status: <span class="font-semibold">${getStatusText(item.status)}</span></p>
              <p>Jenis Limbah: ${item.jenis_limbah || '-'}</p>
              <p>Intensitas: ${intensity}</p>
            </div>
          `);

        // Add to heatmap
        heatPoints.push([lat, lng, intensity]);
      });

      // Add heatmap layer
      L.heatLayer(heatPoints, { radius: 25, blur: 15, maxZoom: 17 }).addTo(mapInstanceRef.current);

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, [loading, petaData]);

  useEffect(() => {
    // Filter and search logic
    let filtered = petaData;
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
    setFilteredData(filtered);
  }, [searchTerm, statusFilter, petaData]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'bersih': return 'bg-green-500';
      case 'tercemar': return 'bg-red-500';
      case 'sedang': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'bersih': return 'Bersih';
      case 'tercemar': return 'Tercemar';
      case 'sedang': return 'Sedang';
      default: return 'Tidak Diketahui';
    }
  };

  const handleCardClick = (item) => {
    if (mapInstanceRef.current && item.latitude && item.longitude) {
      mapInstanceRef.current.setView([item.latitude, item.longitude], 14);
      L.popup()
        .setLatLng([item.latitude, item.longitude])
        .setContent(`
          <div class="p-2">
            <h3 class="font-bold text-cyan-300">${item.lokasi}</h3>
            <p>Status: <span class="font-semibold">${getStatusText(item.status)}</span></p>
            <p>Jenis Limbah: ${item.jenis_limbah || '-'}</p>
            <p>Intensitas: ${item.heatmap_intensity}</p>
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
                onClick={() => setError(null)}
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
                        <option value="sedang">Sedang</option>
                        <option value="tercemar">Tercemar</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Map Container */}
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
                            <p><span className="font-medium text-gray-200">Intensitas Heatmap:</span> {item.heatmap_intensity}</p>
                            <p><span className="font-medium text-gray-200">Terakhir Diperbarui:</span> {new Date(item.updated_at).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/peta/${item.id}`);
                            }}
                            className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 rounded-lg text-cyan-200 hover:from-cyan-600/40 hover:to-blue-600/40 transition-all duration-300 text-sm font-medium"
                            aria-label={`Lihat Detail ${item.lokasi}`}
                          >
                            Lihat Detail
                          </button>
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