import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';

export default function KelolaPeta() {
  const navigate = useNavigate();
  const [petaData, setPetaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    lokasi: '',
    status: 'bersih',
    jenis_limbah: '',
    heatmap_intensity: 1,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single();

      if (userError || userData?.role !== 'admin') {
        navigate('/login');
        return;
      }

      try {
        const { data } = await supabase
          .from('peta_status')
          .select('*')
          .order('updated_at', { ascending: false });

        setPetaData(data || []);
      } catch (err) {
        setError('Gagal memuat data peta: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('peta_status')
        .insert({
          lokasi: formData.lokasi,
          status: formData.status,
          jenis_limbah: formData.jenis_limbah,
          heatmap_intensity: parseInt(formData.heatmap_intensity),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      const { data } = await supabase
        .from('peta_status')
        .select('*')
        .order('updated_at', { ascending: false });

      setPetaData(data || []);
      setFormData({
        lokasi: '',
        status: 'bersih',
        jenis_limbah: '',
        heatmap_intensity: 1,
      });
    } catch (err) {
      setError('Gagal menambahkan data: ' + err.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <HeaderAdmin />
      <div className="flex flex-1">
        <SidebarAdmin />
        <main className="ml-64 p-8 w-full">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Kelola Peta Interaktif</h1>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Tambah Data Peta</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700">Lokasi</label>
                  <input
                    type="text"
                    name="lokasi"
                    value={formData.lokasi}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="bersih">Bersih</option>
                    <option value="tercemar">Tercemar</option>
                    <option value="kritis">Kritis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700">Jenis Limbah</label>
                  <input
                    type="text"
                    name="jenis_limbah"
                    value={formData.jenis_limbah}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Intensitas Heatmap (1-10)</label>
                  <input
                    type="number"
                    name="heatmap_intensity"
                    value={formData.heatmap_intensity}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Tambah
                </button>
              </form>
            </div>
            {loading ? (
              <p className="text-center">Memuat data peta...</p>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                {petaData.length === 0 ? (
                  <p className="text-center text-gray-500">Belum ada data peta.</p>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2">Lokasi</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Jenis Limbah</th>
                        <th className="p-2">Intensitas Heatmap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {petaData.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{item.lokasi}</td>
                          <td className="p-2">{item.status}</td>
                          <td className="p-2">{item.jenis_limbah || '-'}</td>
                          <td className="p-2">{item.heatmap_intensity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <FooterAdmin />
    </div>
  );
}