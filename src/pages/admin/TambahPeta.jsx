import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';

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
      const { error } = await supabase.from('peta_status').insert([{
        lokasi: formData.lokasi,
        status: formData.status,
        jenis_limbah: formData.jenis_limbah || null,
        heatmap_intensity: parseInt(formData.heatmap_intensity),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      }]);
      if (error) throw error;
      navigate('/admin/kelolapeta', { state: { success: 'Lokasi berhasil ditambahkan!' } });
    } catch (err) {
      setError('Gagal menambahkan data: ' + err.message);
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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Tambah Lokasi Peta</h1>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Lokasi</label>
                  <input
                    type="text"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Contoh: Sungai Ciliwung, Jakarta"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="bersih">Bersih</option>
                    <option value="tercemar">Tercemar</option>
                    <option value="kritis">Kritis</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Jenis Limbah (Opsional)</label>
                  <input
                    type="text"
                    value={formData.jenis_limbah}
                    onChange={(e) => setFormData({ ...formData, jenis_limbah: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Contoh: Plastik"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Intensitas Polusi (1-10)</label>
                  <input
                    type="number"
                    value={formData.heatmap_intensity}
                    onChange={(e) => setFormData({ ...formData, heatmap_intensity: e.target.value })}
                    className="w-full p-2 border rounded"
                    min="1"
                    max="10"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Contoh: -6.1745"
                    step="any"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Contoh: 106.8227"
                    step="any"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/kelolapeta')}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Simpan
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