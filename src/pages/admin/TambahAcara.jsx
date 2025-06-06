import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';

export default function TambahAcara() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    judul: '',
    lokasi: '',
    tanggal: '',
    deskripsi: '',
    poster_url: '', // Input langsung URL poster
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      if (!user) {
        setError('Silakan login terlebih dahulu');
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
      console.log('Inserting data into acara_pembersihan...');
      const { error: insertError } = await supabase.from('acara_pembersihan').insert([{
        judul: formData.judul,
        lokasi: formData.lokasi,
        tanggal: formData.tanggal,
        deskripsi: formData.deskripsi || null,
        poster_url: formData.poster_url || null, // Simpan URL atau null jika kosong
        updated_at: new Date().toISOString(),
      }]);
      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
      console.log('Data inserted successfully');
      navigate('/admin/acara', { state: { success: 'Acara berhasil ditambahkan!' } });
    } catch (err) {
      setError('Gagal menyimpan acara: ' + err.message);
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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Tambah Acara Pembersihan</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Judul</label>
                  <input
                    type="text"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Contoh: Pembersihan Sungai Ciliwung"
                    required
                  />
                </div>
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
                  <label className="block text-gray-700 mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Deskripsi (Opsional)</label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Deskripsi acara"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">URL Poster (Opsional)</label>
                  <input
                    type="url"
                    value={formData.poster_url}
                    onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Contoh: https://example.com/poster.jpg"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/kelolaacara')}
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