import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';
import { Trophy, Edit, Trash2 } from 'lucide-react';

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

        const { data: leaderboardData } = await supabase.rpc('get_leaderboard');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-red-600" />
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
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Kelola Tantangan
                  </h1>
                  <p className="text-slate-600">Atur tantangan dan pantau leaderboard.</p>
                </div>
              </div>

              {/* Tab & Button Row */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                {/* Tab Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveTab('tantangan')}
                    className={`px-6 py-2 rounded-xl ${activeTab === 'tantangan' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-gray-200 text-slate-700'} transition-all duration-300 hover:bg-gradient-to-r from-cyan-500 to-blue-600 hover:text-white`}
                  >
                    Daftar Tantangan
                  </button>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-6 py-2 rounded-xl ${activeTab === 'leaderboard' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-gray-200 text-slate-700'} transition-all duration-300 hover:bg-gradient-to-r from-cyan-500 to-blue-600 hover:text-white`}
                  >
                    Leaderboard
                  </button>
                </div>

                {/* Tambah Tantangan Button */}
                <button
                  onClick={() => navigate('/admin/tambahtantangan')}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-green-500/25"
                >
                  Tambah Tantangan
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Memuat data...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg overflow-hidden">
                {activeTab === 'tantangan' ? (
                  tantangan.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-cyan-600" />
                      </div>
                      <p className="text-slate-500 text-lg">Belum ada tantangan.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                            <th className="p-4 font-semibold text-slate-700">Judul</th>
                            <th className="p-4 font-semibold text-slate-700">Deskripsi</th>
                            <th className="p-4 font-semibold text-slate-700">Poin</th>
                            <th className="p-4 font-semibold text-slate-700">Jenis Tantangan</th>
                            <th className="p-4 font-semibold text-slate-700">Tanggal Mulai</th>
                            <th className="p-4 font-semibold text-slate-700">Tanggal Selesai</th>
                            <th className="p-4 font-semibold text-slate-700">Status</th>
                            <th className="p-4 font-semibold text-slate-700">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tantangan.map((item, index) => (
                            <tr
                              key={item.id}
                              className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-blue-50/30 transition-all duration-300 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                              }`}
                            >
                              <td className="p-4 text-slate-700">{item.judul}</td>
                              <td className="p-4 text-slate-700 max-w-xs">
                                <div className="truncate" title={item.deskripsi}>
                                  {item.deskripsi || '-'}
                                </div>
                              </td>
                              <td className="p-4 text-slate-700">{item.poin}</td>
                              <td className="p-4 text-slate-700">{item.jenis_tantangan}</td>
                              <td className="p-4 text-slate-700">{item.tanggal_mulai ? new Date(item.tanggal_mulai).toLocaleDateString() : '-'}</td>
                              <td className="p-4 text-slate-700">{item.tanggal_selesai ? new Date(item.tanggal_selesai).toLocaleDateString() : '-'}</td>
                              <td className="p-4 text-slate-700">{item.status}</td>
                              <td className="p-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setEditData(item)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 flex items-center space-x-1"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-600/25 flex items-center space-x-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  leaderboard.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-cyan-600" />
                      </div>
                      <p className="text-slate-500 text-lg">Belum ada partisipasi yang diverifikasi.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                            <th className="p-4 font-semibold text-slate-700">Peringkat</th>
                            <th className="p-4 font-semibold text-slate-700">Nama Pengguna</th>
                            <th className="p-4 font-semibold text-slate-700">Total Poin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.map((item, index) => (
                            <tr
                              key={item.nama_pengguna}
                              className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-blue-50/30 transition-all duration-300 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                              }`}
                            >
                              <td className="p-4 text-slate-700">{index + 1}</td>
                              <td className="p-4 text-slate-700">{item.nama_pengguna}</td>
                              <td className="p-4 text-slate-700">{item.total_poin}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <FooterAdmin />
      {editData && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg w-full max-w-3xl border border-white/50">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-9 h-9 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
          <Edit className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Edit Tantangan</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Judul</label>
          <input
            type="text"
            value={editData.judul}
            onChange={(e) => setEditData({ ...editData, judul: e.target.value })}
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            placeholder="Judul"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Poin</label>
          <input
            type="number"
            value={editData.poin}
            onChange={(e) => setEditData({ ...editData, poin: e.target.value })}
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            placeholder="Poin"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium text-slate-700 mb-1 block">Deskripsi (opsional)</label>
          <textarea
            value={editData.deskripsi || ''}
            onChange={(e) => setEditData({ ...editData, deskripsi: e.target.value })}
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none min-h-[90px]"
            placeholder="Deskripsi tantangan"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Jenis Tantangan</label>
          <select
            value={editData.jenis_tantangan}
            onChange={(e) => setEditData({ ...editData, jenis_tantangan: e.target.value })}
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          >
            <option value="foto_kreatif">Foto Kreatif</option>
            <option value="kumpul_sampah">Kumpul Sampah</option>
            <option value="poster_edukasi">Poster Edukasi</option>
            <option value="misi_tim">Misi Tim</option>
            <option value="quest_harian">Quest Harian</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
          <select
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          >
            <option value="aktif">Aktif</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Tanggal Mulai (opsional)</label>
          <input
            type="date"
            value={editData.tanggal_mulai || ''}
            onChange={(e) => setEditData({ ...editData, tanggal_mulai: e.target.value })}
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Tanggal Selesai (opsional)</label>
          <input
            type="date"
            value={editData.tanggal_selesai || ''}
            onChange={(e) => setEditData({ ...editData, tanggal_selesai: e.target.value })}
            className="w-full p-2.5 border border-slate-200 rounded-lg bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-5">
        <button
          onClick={() => setEditData(null)}
          className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg transition-all duration-200 hover:bg-slate-300 hover:scale-105"
        >
          Batal
        </button>
        <button
          onClick={() => handleEdit(editData.id, editData)}
          className="px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
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