import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';


export default function KelolaLaporan() {
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [noteModal, setNoteModal] = useState({ open: false, data: null, note: '' });

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

        if (userError) {
          setError('Gagal memverifikasi role admin: ' + userError.message);
          navigate('/login');
          return;
        }

        if (!userData || userData.role !== 'admin') {
          setError('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
          navigate('/login');
          return;
        }

        const { data } = await supabase
          .from('laporan_pencemaran')
          .select('*')
          .order('created_at', { ascending: false });

        setLaporan(data || []);
      } catch (err) {
        setError('Gagal memuat laporan: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleVerifikasi = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('laporan_pencemaran')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setLaporan(laporan.map((item) =>
        item.id === id ? { ...item, status: newStatus, updated_at: new Date().toISOString() } : item
      ));
    } catch (err) {
      setError('Gagal memperbarui status: ' + err.message);
    }
  };

  const handleDelete = async (id, fotoUrl) => {
    if (window.confirm('Yakin ingin menghapus laporan ini?')) {
      try {
        if (fotoUrl) {
          const filePath = fotoUrl.split('/').pop();
          const { error: storageError } = await supabase.storage.from('laporan').remove([filePath]);
          if (storageError) throw storageError;
        }
        const { error } = await supabase.from('laporan_pencemaran').delete().eq('id', id);
        if (error) throw error;
        setLaporan(laporan.filter((item) => item.id !== id));
      } catch (err) {
        setError('Gagal menghapus laporan: ' + err.message);
      }
    }
  };

  const handleEdit = async (id, updatedData) => {
    try {
      const { error } = await supabase
        .from('laporan_pencemaran')
        .update({ ...updatedData, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setLaporan(
        laporan.map((item) =>
          item.id === id ? { ...item, ...updatedData, updated_at: new Date().toISOString() } : item
        )
      );
      setEditModal({ open: false, data: null });
    } catch (err) {
      setError('Gagal mengedit laporan: ' + err.message);
    }
  };

  const handleAddNote = async (id, note) => {
    try {
      const { error } = await supabase
        .from('laporan_pencemaran')
        .update({ catatan_admin: note, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setLaporan(
        laporan.map((item) =>
          item.id === id ? { ...item, catatan_admin: note, updated_at: new Date().toISOString() } : item
        )
      );
      setNoteModal({ open: false, data: null, note: '' });
    } catch (err) {
      setError('Gagal menambahkan catatan: ' + err.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 text-center p-8 bg-white/80 backdrop-blur-md border border-red-200 rounded-3xl shadow-2xl">
          <p className="text-red-600 text-lg mb-4 font-medium">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/25"
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

        <main className="ml-56 p-8 overflow-y-auto w-full relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header with gradient text */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  Kelola Laporan
                </span>
                <span className="text-slate-800"> Pencemaran</span>
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-cyan-500 border-r-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 text-lg">Memuat laporan...</p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
                {laporan.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📋</span>
                    </div>
                    <p className="text-slate-500 text-lg">Belum ada laporan.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                          <th className="p-4 font-semibold text-slate-700">Email</th>
                          <th className="p-4 font-semibold text-slate-700">Deskripsi</th>
                          <th className="p-4 font-semibold text-slate-700">Lokasi</th>
                          <th className="p-4 font-semibold text-slate-700">Jenis Sampah</th>
                          <th className="p-4 font-semibold text-slate-700">Foto</th>
                          <th className="p-4 font-semibold text-slate-700">Status</th>
                          <th className="p-4 font-semibold text-slate-700">Catatan Admin</th>
                          <th className="p-4 font-semibold text-slate-700">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {laporan.map((item, index) => (
                          <tr key={item.id} className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-blue-50/30 transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                            <td className="p-4 text-slate-700">{item.email}</td>
                            <td className="p-4 text-slate-700 max-w-xs">
                              <div className="truncate" title={item.deskripsi}>
                                {item.deskripsi}
                              </div>
                            </td>
                            <td className="p-4 text-slate-700">{item.lokasi}</td>
                            <td className="p-4">
                              <span className="inline-flex px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-full text-sm font-medium">
                                {item.jenis_sampah}
                              </span>
                            </td>
                            <td className="p-4">
                              {item.foto_url ? (
                                <a
                                  href={item.foto_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block group"
                                >
                                  <img
                                    src={item.foto_url}
                                    alt="Foto Laporan"
                                    className="w-16 h-16 object-cover rounded-xl cursor-pointer transition-transform duration-300 group-hover:scale-110 shadow-md"
                                  />
                                </a>
                              ) : (
                                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                                  <span className="text-slate-400 text-xs">No Image</span>
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                item.status === 'diverifikasi' 
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                                  : item.status === 'ditolak'
                                  ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700'
                                  : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-4 text-slate-700 max-w-xs">
                              <div className="truncate" title={item.catatan_admin}>
                                {item.catatan_admin || '-'}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-2">
                                {item.status === 'menunggu' && (
                                  <>
                                    <button
                                      onClick={() => handleVerifikasi(item.id, 'diverifikasi')}
                                      className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                                    >
                                      ✓ Verifikasi
                                    </button>
                                    <button
                                      onClick={() => handleVerifikasi(item.id, 'ditolak')}
                                      className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                                    >
                                      ✗ Tolak
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDelete(item.id, item.foto_url)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-600/25"
                                >
                                  🗑️ Hapus
                                </button>
                                <button
                                  onClick={() => setEditModal({ open: true, data: item })}
                                  className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => setNoteModal({ open: true, data: item, note: item.catatan_admin || '' })}
                                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
                                >
                                  📝 Catatan
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

      {/* Modal Edit */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200/50">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              ✏️ Edit Laporan
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                <input
                  type="text"
                  value={editModal.data.deskripsi}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, deskripsi: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="Deskripsi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label>
                <input
                  type="text"
                  value={editModal.data.lokasi}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, lokasi: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="Lokasi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Sampah</label>
                <input
                  type="text"
                  value={editModal.data.jenis_sampah}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, jenis_sampah: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="Jenis Sampah"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setEditModal({ open: false, data: null })}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => handleEdit(editModal.data.id, {
                  deskripsi: editModal.data.deskripsi,
                  lokasi: editModal.data.lokasi,
                  jenis_sampah: editModal.data.jenis_sampah,
                })}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                💾 Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catatan */}
      {noteModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200/50">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              📝 Tambah Catatan Admin
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Catatan</label>
              <textarea
                value={noteModal.note}
                onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80 min-h-[120px] resize-none"
                placeholder="Masukkan catatan admin..."
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setNoteModal({ open: false, data: null, note: '' })}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => handleAddNote(noteModal.data.id, noteModal.note)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                💾 Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

