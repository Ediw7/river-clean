import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';

export default function KelolaTantangan() {
  const navigate = useNavigate();
  const [tantangan, setTantangan] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState(null);
  const [activeTab, setActiveTab] = useState('tantangan');

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

        const { data: tantanganData } = await supabase.from('tantangan').select('*').order('created_at', { ascending: false });
        setTantangan(tantanganData || []);

        // Query untuk leaderboard
        const { data: leaderboardData } = await supabase
          .rpc('get_leaderboard');
        setLeaderboard(leaderboardData || []);
      } catch (err) {
        setError('Gagal memuat data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleEdit = async (id, updatedData) => {
    try {
      const { error } = await supabase
        .from('tantangan')
        .update({
          judul: updatedData.judul,
          deskripsi: updatedData.deskripsi,
          poin: parseInt(updatedData.poin),
          jenis_tantangan: updatedData.jenis_tantangan,
          tanggal_mulai: updatedData.tanggal_mulai || null,
          tanggal_selesai: updatedData.tanggal_selesai || null,
          status: updatedData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      setTantangan(tantangan.map((item) =>
        item.id === id ? { ...item, ...updatedData, updated_at: new Date().toISOString() } : item
      ));
      setEditData(null);
    } catch (err) {
      setError('Gagal mengedit tantangan: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus tantangan ini?')) {
      try {
        const { error } = await supabase.from('tantangan').delete().eq('id', id);
        if (error) throw error;
        setTantangan(tantangan.filter((item) => item.id !== id));
      } catch (err) {
        setError('Gagal menghapus tantangan: ' + err.message);
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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Kelola Tantangan</h1>
            <div className="mb-4">
              <button
                onClick={() => setActiveTab('tantangan')}
                className={`mr-2 px-4 py-2 rounded ${activeTab === 'tantangan' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
              >
                Daftar Tantangan
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-4 py-2 rounded ${activeTab === 'leaderboard' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => navigate('/admin/tambahtantangan')}
                className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Tambah Tantangan
              </button>
            </div>
            {loading ? (
              <p className="text-center">Memuat data...</p>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                {activeTab === 'tantangan' ? (
                  tantangan.length === 0 ? (
                    <p className="text-center text-gray-500">Belum ada tantangan.</p>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2">Judul</th>
                          <th className="p-2">Deskripsi</th>
                          <th className="p-2">Poin</th>
                          <th className="p-2">Jenis Tantangan</th>
                          <th className="p-2">Tanggal Mulai</th>
                          <th className="p-2">Tanggal Selesai</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tantangan.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="p-2">{item.judul}</td>
                            <td className="p-2">{item.deskripsi || '-'}</td>
                            <td className="p-2">{item.poin}</td>
                            <td className="p-2">{item.jenis_tantangan}</td>
                            <td className="p-2">{item.tanggal_mulai ? new Date(item.tanggal_mulai).toLocaleDateString() : '-'}</td>
                            <td className="p-2">{item.tanggal_selesai ? new Date(item.tanggal_selesai).toLocaleDateString() : '-'}</td>
                            <td className="p-2">{item.status}</td>
                            <td className="p-2 space-x-2">
                              <button
                                onClick={() => setEditData(item)}
                                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                ) : (
                  leaderboard.length === 0 ? (
                    <p className="text-center text-gray-500">Belum ada partisipasi yang diverifikasi.</p>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2">Peringkat</th>
                          <th className="p-2">Nama Pengguna</th>
                          <th className="p-2">Total Poin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((item, index) => (
                          <tr key={item.nama_pengguna} className="border-b">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{item.nama_pengguna}</td>
                            <td className="p-2">{item.total_poin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <FooterAdmin />
      {editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Tantangan</h2>
            <input
              type="text"
              value={editData.judul}
              onChange={(e) => setEditData({ ...editData, judul: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Judul"
              required
            />
            <textarea
              value={editData.deskripsi || ''}
              onChange={(e) => setEditData({ ...editData, deskripsi: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Deskripsi (opsional)"
            />
            <input
              type="number"
              value={editData.poin}
              onChange={(e) => setEditData({ ...editData, poin: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Poin"
              required
            />
            <select
              value={editData.jenis_tantangan}
              onChange={(e) => setEditData({ ...editData, jenis_tantangan: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            >
              <option value="foto_kreatif">Foto Kreatif</option>
              <option value="kumpul_sampah">Kumpul Sampah</option>
              <option value="poster_edukasi">Poster Edukasi</option>
              <option value="misi_tim">Misi Tim</option>
              <option value="quest_harian">Quest Harian</option>
            </select>
            <input
              type="date"
              value={editData.tanggal_mulai || ''}
              onChange={(e) => setEditData({ ...editData, tanggal_mulai: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Tanggal Mulai"
            />
            <input
              type="date"
              value={editData.tanggal_selesai || ''}
              onChange={(e) => setEditData({ ...editData, tanggal_selesai: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Tanggal Selesai"
            />
            <select
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            >
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditData(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={() => handleEdit(editData.id, editData)}
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