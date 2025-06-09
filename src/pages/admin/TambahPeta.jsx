import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';
import { MapPin, Plus } from 'lucide-react';

export default function TambahPeta() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lokasi: '',
    status: 'bersih',
    jenis_limbah: '',
    heatmap_intensity: 1,
    latitude: '',
    longitude: '',
  });
  const [error, setError] = useState(null);

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
      } catch (err) {
        setError('Gagal memverifikasi role admin: ' + err.message);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Pastikan konversi tipe data yang benar untuk Supabase
      const payload = {
        lokasi: formData.lokasi,
        status: formData.status,
        jenis_limbah: formData.jenis_limbah || null,
        heatmap_intensity: parseInt(formData.heatmap_intensity, 10), // Pastikan integer
        latitude: parseFloat(formData.latitude),                     // Pastikan float
        longitude: parseFloat(formData.longitude),                   // Pastikan float
      };

      const { error } = await supabase.from('peta_status').insert([payload]);
      if (error) {
        console.error("Supabase INSERT error:", error);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        console.error("Error hint:", error.hint);
        throw error;
      }
      navigate('/admin/peta', { state: { success: 'Lokasi berhasil ditambahkan!' } });
    } catch (err) {
      setError('Gagal menambahkan data: ' + err.message);
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
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Tambah Lokasi Peta
                  </h1>
                  <p className="text-slate-600">Tambahkan lokasi baru untuk pemantauan pencemaran.</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label>
                  <input
                    type="text"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                    placeholder="Contoh: Sungai Ciliwung, Jakarta"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  >
                    <option value="bersih">Bersih</option>
                    <option value="tercemar">Tercemar</option>
                    <option value="kritis">Kritis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Limbah (Opsional)</label>
                  <input
                    type="text"
                    value={formData.jenis_limbah}
                    onChange={(e) => setFormData({ ...formData, jenis_limbah: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                    placeholder="Contoh: Plastik"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Intensitas Polusi (1-10)</label>
                  <input
                    type="number"
                    value={formData.heatmap_intensity}
                    onChange={(e) => setFormData({ ...formData, heatmap_intensity: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                    min="1"
                    max="10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                    placeholder="Contoh: -6.1745"
                    step="any" // Memungkinkan angka desimal
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                    placeholder="Contoh: 106.8227"
                    step="any" // Memungkinkan angka desimal
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/peta')}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    // Menggunakan gaya gradien yang konsisten dengan tombol Login
                    className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
                  >
                    <span className="relative z-10">Simpan Lokasi</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
      <FooterAdmin />
    </div>
  );
}