import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import {
  FileText,
  MapPin,
  Trash2,
  Edit,
  StickyNote,
  CheckCircle,
  XCircle,
  Image,
  AlertTriangle,
  Send,
} from 'lucide-react';

export default function KelolaLaporan() {
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [noteModal, setNoteModal] = useState({ open: false, data: null, note: '' });
  const [followUpModal, setFollowUpModal] = useState({ open: false, data: null, followUp: '' });

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

  const handleStatusChange = async (id, newStatus) => {
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
      setError('Gagal mengubah status: ' + err.message);
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

  const handleAddFollowUp = async (id, followUp) => {
    try {
      const { error } = await supabase
        .from('laporan_pencemaran')
        .update({ tindak_lanjut: followUp, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setLaporan(
        laporan.map((item) =>
          item.id === id ? { ...item, tindak_lanjut: followUp, updated_at: new Date().toISOString() } : item
        )
      );
      setFollowUpModal({ open: false, data: null, followUp: '' });
    } catch (err) {
      setError('Gagal menambahkan tindak lanjut: ' + err.message);
    }
  };

  const handleSendToTeam = async (id, item) => {
    try {
      const phoneNumber = '082325720215';
      const message = `Laporan ID ${id} - Lokasi: ${item.lokasi}. Deskripsi: ${item.deskripsi}. Jenis Sampah: ${item.jenis_sampah}. Foto: ${item.foto_url || 'Tidak ada foto'}. Harap segera ditangani oleh tim.`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      const { error } = await supabase
        .from('laporan_pencemaran')
        .update({ sent_to_team: true, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setLaporan(
        laporan.map((item) =>
          item.id === id ? { ...item, sent_to_team: true, updated_at: new Date().toISOString() } : item
        )
      );
    } catch (err) {
      setError('Gagal mengirim ke tim lapangan: ' + err.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
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
    <div className="h-screen overflow-hidden bg-white">
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
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Kelola Laporan Pencemaran
                  </h1>
                  <p className="text-slate-600">Atur dan verifikasi laporan pencemaran yang masuk.</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Memuat laporan...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg overflow-hidden">
                {laporan.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-cyan-600" />
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
                          <th className="p-4 font-semibold text-slate-700">Aksi Lanjut</th>
                          <th className="p-4 font-semibold text-slate-700">Tindak Lanjut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {laporan.map((item, index) => (
                          <tr
                            key={item.id}
                            className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-blue-50/30 transition-all duration-300 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                            }`}
                          >
                            <td className="p-4 text-slate-700">{item.email}</td>
                            <td className="p-4 text-slate-700 max-w-xs">
                              <div className="truncate" title={item.deskripsi}>
                                {item.deskripsi}
                              </div>
                            </td>
                            <td className="p-4 text-slate-700 flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-slate-500" />
                              <span>{item.lokasi}</span>
                            </td>
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
                                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                                    <img
                                      src={item.foto_url}
                                      alt="Foto Laporan"
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
                              <div className="flex flex-col space-y-2">
                                {item.status === 'menunggu' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(item.id, 'diverifikasi')}
                                      className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 flex items-center space-x-1"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Verifikasi</span>
                                    </button>

                                    <button
                                      onClick={() => handleStatusChange(item.id, 'ditolak')}
                                      className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 flex items-center space-x-1"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      <span>Tolak</span>
                                    </button>
                                  </>
                                )}

                                {item.status !== 'menunggu' && (
                                  <span
                                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                      item.status === 'diverifikasi'
                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                                        : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700'
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-4 text-slate-700 max-w-xs">
                              <div className="truncate" title={item.catatan_admin}>
                                {item.catatan_admin || '-'}
                              </div>
                            </td>
                            
                            <td className="p-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => setEditModal({ open: true, data: item })}
                                  className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 flex items-center space-x-1"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, item.foto_url)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-600/25 flex items-center space-x-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Hapus</span>
                                </button>
                                <button
                                  onClick={() => setNoteModal({ open: true, data: item, note: item.catatan_admin || '' })}
                                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 flex items-center space-x-1"
                                >
                                  <StickyNote className="w-4 h-4" />
                                  <span>Catatan</span>
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-2">
                                {item.status === 'diverifikasi' && (
                                  <>
                                    <button
                                      onClick={() => handleSendToTeam(item.id, item)}
                                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 flex items-center space-x-1"
                                    >
                                      <Send className="w-4 h-4" />
                                      <span>Kirim Tim</span>
                                    </button>
                                    <button
                                      onClick={() => setFollowUpModal({ open: true, data: item, followUp: item.tindak_lanjut || '' })}
                                      className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center space-x-1"
                                    >
                                      <StickyNote className="w-4 h-4" />
                                      <span>Tindak Lanjut</span>
                                    </button>
                                   </>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-slate-700 max-w-xs">
                              <div className="truncate" title={item.tindak_lanjut}>
                                {item.tindak_lanjut || '-'}
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
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-full max-w-md border border-white/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Edit Laporan</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                <input
                  type="text"
                  value={editModal.data.deskripsi}
                  onChange={(e) =>
                    setEditModal({ ...editModal, data: { ...editModal.data, deskripsi: e.target.value } })
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="Deskripsi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label>
                <input
                  type="text"
                  value={editModal.data.lokasi}
                  onChange={(e) =>
                    setEditModal({ ...editModal, data: { ...editModal.data, lokasi: e.target.value } })
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="Lokasi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Sampah</label>
                <input
                  type="text"
                  value={editModal.data.jenis_sampah}
                  onChange={(e) =>
                    setEditModal({ ...editModal, data: { ...editModal.data, jenis_sampah: e.target.value } })
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="Jenis Sampah"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setEditModal({ open: false, data: null })}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() =>
                  handleEdit(editModal.data.id, {
                    deskripsi: editModal.data.deskripsi,
                    lokasi: editModal.data.lokasi,
                    jenis_sampah: editModal.data.jenis_sampah,
                  })
                }
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catatan */}
      {noteModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-full max-w-md border border-white/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Tambah Catatan Admin</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Catatan</label>
              <textarea
                value={noteModal.note}
                onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80 min-h-[120px] resize-none"
                placeholder="Masukkan catatan admin..."
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setNoteModal({ open: false, data: null, note: '' })}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => handleAddNote(noteModal.data.id, noteModal.note)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tindak Lanjut */}
      {followUpModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-full max-w-md border border-white/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Tambah Tindak Lanjut</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tindak Lanjut</label>
              <textarea
                value={followUpModal.followUp}
                onChange={(e) => setFollowUpModal({ ...followUpModal, followUp: e.target.value })}
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80 min-h-[120px] resize-none"
                placeholder="Masukkan status tindak lanjut..."
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setFollowUpModal({ open: false, data: null, followUp: '' })}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => handleAddFollowUp(followUpModal.data.id, followUpModal.followUp)}
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