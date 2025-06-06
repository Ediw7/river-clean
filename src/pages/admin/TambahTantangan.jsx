import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';

export default function TambahTantangan() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    poin: '',
    jenis_tantangan: 'foto_kreatif',
    tanggal_mulai: '',
    tanggal_selesai: '',
    status: 'aktif',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
      const { error: insertError } = await supabase.from('tantangan').insert([{
        judul: formData.judul,
        deskripsi: formData.deskripsi || null,
        poin: parseInt(formData.poin),
        jenis_tantangan: formData.jenis_tantangan,
        tanggal_mulai: formData.tanggal_mulai || null,
        tanggal_selesai: formData.tanggal_selesai || null,
        status: formData.status,
      }]);
      if (insertError) throw insertError;
      navigate('/admin/tantangan', { state: { success: 'Tantangan berhasil ditambahkan!' } });
    } catch (err) {
      setError('Gagal menambahkan tantangan: ' + err.message);
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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Tambah Tantangan</h1>
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
                    placeholder="Contoh: Foto Kreatif Bebas Sampah"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Deskripsi (Opsional)</label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Deskripsi tantangan"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Poin</label>
                  <input
                    type="number"
                    value={formData.poin}
                    onChange={(e) => setFormData({ ...formData, poin: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Contoh: 100"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Jenis Tantangan</label>
                  <select
                    value={formData.jenis_tantangan}
                    onChange={(e) => setFormData({ ...formData, jenis_tantangan: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="foto_kreatif">Foto Kreatif</option>
                    <option value="kumpul_sampah">Kumpul Sampah</option>
                    <option value="poster_edukasi">Poster Edukasi</option>
                    <option value="misi_tim">Misi Tim</option>
                    <option value="quest_harian">Quest Harian</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Tanggal Mulai (Opsional)</label>
                  <input
                    type="date"
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Tanggal Selesai (Opsional)</label>
                  <input
                    type="date"
                    value={formData.tanggal_selesai}
                    onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/kelolatantangan')}
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