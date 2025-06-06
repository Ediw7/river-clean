import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';

export default function KelolaTantangan() {
  const navigate = useNavigate();
  const [tantangan, setTantangan] = useState([]);
  const [partisipasi, setPartisipasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    poin: 0,
    jenis_tantangan: 'foto_kreatif',
    tanggal_mulai: '',
    tanggal_selesai: '',
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
        const [tantanganData, partisipasiData] = await Promise.all([
          supabase.from('tantangan').select('*').order('created_at', { ascending: false }),
          supabase.from('partisipasi_tantangan').select('*, users(email), tantangan(judul)').order('created_at', { ascending: false }),
        ]);

        setTantangan(tantanganData.data || []);
        setPartisipasi(partisipasiData.data || []);
      } catch (err) {
        setError('Gagal memuat data: ' + err.message);
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
        .from('tantangan')
        .insert({
          judul: formData.judul,
          deskripsi: formData.deskripsi,
          poin: parseInt(formData.poin),
          jenis_tantangan: formData.jenis_tantangan,
          tanggal_mulai: formData.tanggal_mulai,
          tanggal_selesai: formData.tanggal_selesai,
        });

      if (error) throw error;

      const { data } = await supabase
        .from('tantangan')
        .select('*')
        .order('created_at', { ascending: false });

      setTantangan(data || []);
      setFormData({
        judul: '',
        deskripsi: '',
        poin: 0,
        jenis_tantangan: 'foto_kreatif',
        tanggal_mulai: '',
        tanggal_selesai: '',
      });
    } catch (err) {
      setError('Gagal menambahkan tantangan: ' + err.message);
    }
  };

  const handleVerifikasiPartisipasi = async (id, newStatus, poin) => {
    try {
      await supabase
        .from('partisipasi_tantangan')
        .update({ status: newStatus, poin_diperoleh: newStatus === 'diverifikasi' ? poin : 0 })
        .eq('id', id);
      setPartisipasi(partisipasi.map((item) =>
        item.id === id ? { ...item, status: newStatus, poin_diperoleh: newStatus === 'diverifikasi' ? poin : 0 } : item
      ));
    } catch (err) {
      setError('Gagal memperbarui status: ' + err.message);
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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Kelola Tantangan</h1>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Tambah Tantangan Baru</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700">Judul</label>
                  <input
                    type="text"
                    name="judul"
                    value={formData.judul}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Deskripsi</label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Poin</label>
                  <input
                    type="number"
                    name="poin"
                    value={formData.poin}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Jenis Tantangan</label>
                  <select
                    name="jenis_tantangan"
                    value={formData.jenis_tantangan}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="foto_kreatif">Foto Kreatif</option>
                    <option value="kumpul_sampah">Kumpul Sampah</option>
                    <option value="poster_edukasi">Poster Edukasi</option>
                    <option value="misi_tim">Misi Tim</option>
                    <option value="quest_harian">Quest Harian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700">Tanggal Mulai</label>
                  <input
                    type="date"
                    name="tanggal_mulai"
                    value={formData.tanggal_mulai}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Tanggal Selesai</label>
                  <input
                    type="date"
                    name="tanggal_selesai"
                    value={formData.tanggal_selesai}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Tambah Tantangan
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Daftar Tantangan</h2>
              {loading ? (
                <p className="text-center">Memuat tantangan...</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2">Judul</th>
                      <th className="p-2">Jenis</th>
                      <th className="p-2">Poin</th>
                      <th className="p-2">Tanggal Mulai</th>
                      <th className="p-2">Tanggal Selesai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tantangan.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-gray-500 p-2">
                          Belum ada tantangan.
                        </td>
                      </tr>
                    ) : (
                      tantangan.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{item.judul}</td>
                          <td className="p-2">{item.jenis_tantangan}</td>
                          <td className="p-2">{item.poin}</td>
                          <td className="p-2">{item.tanggal_mulai}</td>
                          <td className="p-2">{item.tanggal_selesai}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Partisipasi Tantangan</h2>
              {loading ? (
                <p className="text-center">Memuat partisipasi...</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2">Email</th>
                      <th className="p-2">Tantangan</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Poin</th>
                      <th className="p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partisipasi.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-gray-500 p-2">
                          Belum ada partisipasi.
                        </td>
                      </tr>
                    ) : (
                      partisipasi.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{item.users?.email}</td>
                          <td className="p-2">{item.tantangan?.judul}</td>
                          <td className="p-2">{item.status}</td>
                          <td className="p-2">{item.poin_diperoleh}</td>
                          <td className="p-2 space-x-2">
                            {item.status === 'menunggu' && (
                              <>
                                <button
                                  onClick={() =>
                                    handleVerifikasiPartisipasi(
                                      item.id,
                                      'diverifikasi',
                                      item.tantangan?.poin || 0
                                    )
                                  }
                                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                  Verifikasi
                                </button>
                                <button
                                  onClick={() => handleVerifikasiPartisipasi(item.id, 'ditolak', 0)}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
      <FooterAdmin />
    </div>
  );
}