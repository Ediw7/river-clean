import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';
import { Calendar, MapPin, Image, Edit, Trash2 } from 'lucide-react';

export default function KelolaAcara() {
  const navigate = useNavigate();
  const [acara, setAcara] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
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

        const { data } = await supabase.from('acara_pembersihan').select('*').order('created_at', { ascending: false });
        setAcara(data || []);
      } catch (err) {
        setError('Gagal memuat acara: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleEdit = async (id, updatedData) => {
    try {
      const { error } = await supabase
        .from('acara_pembersihan')
        .update({
          judul: updatedData.judul,
          lokasi: updatedData.lokasi,
          tanggal: updatedData.tanggal,
          deskripsi: updatedData.deskripsi,
          poster_url: updatedData.poster_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      setAcara(acara.map((item) =>
        item.id === id ? { ...item, ...updatedData, updated_at: new Date().toISOString() } : item
      ));
      setEditData(null);
    } catch (err) {
      setError('Gagal mengedit acara: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus acara ini?')) {
      try {
        const { error } = await supabase.from('acara_pembersihan').delete().eq('id', id);
        if (error) throw error;
        setAcara(acara.filter((item) => item.id !== id));
      } catch (err) {
        setError('Gagal menghapus acara: ' + err.message);
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-red-600" />
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
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Kelola Acara Pembersihan
                  </h1>
                  <p className="text-slate-600">Atur dan kelola acara pembersihan lingkungan.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/tambahacara')}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-green-500/25"
              >
                Tambah Acara
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Memuat acara...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg overflow-hidden">
                {acara.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-cyan-600" />
                    </div>
                    <p className="text-slate-500 text-lg">Belum ada acara.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                          <th className="p-4 font-semibold text-slate-700">Judul</th>
                          <th className="p-4 font-semibold text-slate-700">Lokasi</th>
                          <th className="p-4 font-semibold text-slate-700">Tanggal</th>
                          <th className="p-4 font-semibold text-slate-700">Deskripsi</th>
                          <th className="p-4 font-semibold text-slate-700">Poster</th>
                          <th className="p-4 font-semibold text-slate-700">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {acara.map((item, index) => (
                          <tr
                            key={item.id}
                            className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-blue-50/30 transition-all duration-300 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                            }`}
                          >
                            <td className="p-4 text-slate-700">{item.judul}</td>
                            <td className="p-4 text-slate-700 flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-slate-500" />
                              <span>{item.lokasi}</span>
                            </td>
                            <td className="p-4 text-slate-700">{new Date(item.tanggal).toLocaleDateString()}</td>
                            <td className="p-4 text-slate-700 max-w-xs">
                              <div className="truncate" title={item.deskripsi}>
                                {item.deskripsi || '-'}
                              </div>
                            </td>
                            <td className="p-4">
                              {item.poster_url ? (
                                <a
                                  href={item.poster_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block group"
                                >
                                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                                    <img
                                      src={item.poster_url}
                                      alt="Poster"
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                  </div>
                                </a>
                              ) : (
                                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                                  <Image className="w-6 h-6 text-slate-400" />
                                </div>
                              )}
                            </td>
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
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <FooterAdmin />
      {/* Modal Edit */}
{editData && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full max-w-4xl border border-white/50">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
          <Edit className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Edit Acara</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Judul</label>
          <input
            type="text"
            value={editData.judul}
            onChange={(e) => setEditData({ ...editData, judul: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
            placeholder="Judul"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label>
          <input
            type="text"
            value={editData.lokasi}
            onChange={(e) => setEditData({ ...editData, lokasi: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
            placeholder="Lokasi"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal</label>
          <input
            type="date"
            value={editData.tanggal}
            onChange={(e) => setEditData({ ...editData, tanggal: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">URL Poster (opsional)</label>
          <input
            type="url"
            value={editData.poster_url || ''}
            onChange={(e) => setEditData({ ...editData, poster_url: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
            placeholder="Contoh: https://example.com/poster.jpg"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi (opsional)</label>
          <textarea
            value={editData.deskripsi || ''}
            onChange={(e) => setEditData({ ...editData, deskripsi: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80 min-h-[120px] resize-none"
            placeholder="Deskripsi acara"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={() => setEditData(null)}
          className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-300"
        >
          Batal
        </button>
        <button
          onClick={() => handleEdit(editData.id, editData)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
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