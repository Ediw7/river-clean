import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; // Pastikan path ini benar
import HeaderAdmin from '../../components/admin/HeaderAdmin'; // Pastikan path ini benar
import SidebarAdmin from '../../components/admin/SidebarAdmin'; // Pastikan path ini benar
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

  // Menggunakan useCallback untuk memoize fetchLaporan
  const fetchLaporan = useCallback(async () => {
    try {
        const { data, error } = await supabase
            .from('laporan_pencemaran')
            .select(
                `
                id,
                nama,
                email,
                whatsapp_number,
                deskripsi,
                lokasi,
                jenis_sampah,
                foto_path,
                status,
                catatan_admin,
                tindak_lanjut,
                sent_to_team,
                created_at,
                updated_at
                `
            )
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error saat memuat laporan:', error);
            // Tambahkan lebih banyak detail error jika ada
            console.error('Pesan error Supabase:', error.message);
            console.error('Detail error Supabase:', error.details);
            console.error('Hint error Supabase:', error.hint);
            throw error;
        }

        console.log('Data laporan berhasil dimuat:', data);
        console.log('Jumlah laporan:', data ? data.length : 0); // Tambahkan ini
        setLaporan(data || []);
    } catch (err) {
        console.error('Error detail fetchLaporan:', err);
        setError('Gagal memuat laporan: ' + (err.message || 'Unknown error'));
    } finally {
        setLoading(false);
    }
}, []);

  // Efek ini hanya akan menangani autentikasi dan memuat data awal.
  // Tidak ada lagi logika real-time subscription di sini.
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Silakan login terlebih dahulu.');
          navigate('/login');
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.email)
          .single();

        if (userError) {
          console.error('Error verifikasi user role:', userError);
          setError('Gagal memverifikasi role admin: ' + userError.message);
          navigate('/login');
          return;
        }

        if (!userData || userData.role !== 'admin') {
          setError('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
          navigate('/login');
          return;
        }

        // Panggil fetchLaporan untuk memuat data
        await fetchLaporan();

      } catch (err) {
        console.error('Kesalahan dalam checkAuthAndFetch:', err);
        setError('Gagal memuat halaman: ' + (err.message || 'Unknown error'));
        setLoading(false); // Pastikan loading diatur ke false jika ada error
      }
    };

    checkAuthAndFetch();

    // Tidak ada cleanup untuk real-time karena tidak ada subscription
  }, [navigate, fetchLaporan]); // fetchLaporan sebagai dependensi karena dipanggil di dalam efek

  // Fungsi ini bisa tetap ada jika Anda berencana menambahkan filter di masa depan
  const fetchLaporanWithFilter = async (statusFilter = null) => {
    try {
      let query = supabase
        .from('laporan_pencemaran')
        .select(
          `
            id,
            nama,
            email,
            whatsapp_number,
            deskripsi,
            lokasi,
            jenis_sampah,
            foto_path,
            status,
            catatan_admin,
            tindak_lanjut,
            sent_to_team,
            created_at,
            updated_at
          `
        )
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error saat memuat laporan dengan filter:', error);
        throw error;
      }

      setLaporan(data || []);
    } catch (err) {
      console.error('Error detail fetchLaporanWithFilter:', err);
      setError('Gagal memuat laporan: ' + (err.message || 'Unknown error'));
    }
  };


  const handleStatusChange = async (id, newStatus) => {
    try {
      const laporanItem = laporan.find((item) => item.id === id);
      const { error } = await supabase
        .from('laporan_pencemaran')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      // Setelah update, panggil fetchLaporan untuk me-refresh data
      // karena tidak ada real-time subscription lagi.
      await fetchLaporan();

      // Kirim pesan WhatsApp hanya jika status berubah dari 'menunggu'
      if (laporanItem.whatsapp_number && newStatus !== 'menunggu') {
        const message = `Halo ${laporanItem.nama || 'Pelapor'},\n\nStatus laporan Anda (ID: ${id}) telah diperbarui menjadi: *${newStatus}*.`;
        const whatsappUrl = `https://wa.me/${laporanItem.whatsapp_number.replace('+', '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (err) {
      setError('Gagal mengubah status: ' + err.message);
    }
  };

  const handleDelete = async (id, fotoPath) => {
    if (window.confirm('Yakin ingin menghapus laporan ini?')) {
      try {
        if (fotoPath) {
          const filePathInStorage = fotoPath.startsWith('public/')
            ? fotoPath.substring('public/'.length)
            : fotoPath;

          const { error: storageError } = await supabase.storage.from('laporan-foto').remove([filePathInStorage]);
          if (storageError) {
            console.warn('Gagal menghapus foto dari storage:', storageError.message);
          }
        }
        const { error } = await supabase.from('laporan_pencemaran').delete().eq('id', id);
        if (error) throw error;
        
        // Setelah delete, panggil fetchLaporan untuk me-refresh data.
        await fetchLaporan();

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
      
      // Setelah edit, panggil fetchLaporan untuk me-refresh data.
      await fetchLaporan();

      setEditModal({ open: false, data: null });
    } catch (err) {
      setError('Gagal mengedit laporan: ' + err.message);
    }
  };

  const handleAddNote = async (id, note) => {
    try {
      const laporanItem = laporan.find((item) => item.id === id);
      const { error } = await supabase
        .from('laporan_pencemaran')
        .update({ catatan_admin: note, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      
      // Setelah update, panggil fetchLaporan untuk me-refresh data.
      await fetchLaporan();

      setNoteModal({ open: false, data: null, note: '' });

      if (laporanItem.whatsapp_number) {
        const message = `Halo ${laporanItem.nama || 'Pelapor'},\n\nCatatan admin untuk laporan Anda (ID: ${id}): *${note}*.\nStatus laporan Anda saat ini: *${laporanItem.status}*.`;
        const whatsappUrl = `https://wa.me/${laporanItem.whatsapp_number.replace('+', '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (err) {
      setError('Gagal menambahkan catatan: ' + err.message);
    }
  };

  const handleAddFollowUp = async (id, followUp) => {
    try {
      const laporanItem = laporan.find((item) => item.id === id);
      const { error } = await supabase
        .from('laporan_pencemaran')
        .update({ tindak_lanjut: followUp, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      
      // Setelah update, panggil fetchLaporan untuk me-refresh data.
      await fetchLaporan();

      setFollowUpModal({ open: false, data: null, followUp: '' });

      if (laporanItem.whatsapp_number) {
        const message = `Halo ${laporanItem.nama || 'Pelapor'},\n\nTindak lanjut terbaru untuk laporan Anda (ID: ${id}): *${followUp}*.\nStatus laporan Anda saat ini: *${laporanItem.status}*.`;
        const whatsappUrl = `https://wa.me/${laporanItem.whatsapp_number.replace('+', '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (err) {
      setError('Gagal menambahkan tindak lanjut: ' + err.message);
    }
  };

  const handleSendToTeam = async (id, item) => {
    try {
      const phoneNumber = '082325720215'; // Ganti dengan nomor WhatsApp tim lapangan Anda
      
      const displayFotoPath = item.foto_path && item.foto_path.startsWith('public/')
        ? item.foto_path.substring('public/'.length)
        : item.foto_path;

      const imageUrl = item.foto_path
        ? `https://wwuorklatnmvtkhsjkzt.supabase.co/storage/v1/object/public/laporan-foto/${displayFotoPath}`
        : 'Tidak ada foto';

      const message = `*Laporan Pencemaran Baru untuk Tindak Lanjut*\n\n*ID Laporan:* ${id}\n*Lokasi:* ${item.lokasi}\n*Deskripsi:* ${item.deskripsi}\n*Jenis Sampah:* ${item.jenis_sampah}\n*Foto:* ${imageUrl}\n\n*Mohon segera ditindaklanjuti oleh tim lapangan.*`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      const { error } = await supabase
        .from('laporan_pencemaran')
        .update({ sent_to_team: true, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      
      // Setelah update, panggil fetchLaporan untuk me-refresh data.
      await fetchLaporan();

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
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderAdmin />
      </div>

      <div className="flex pt-16 h-full">
        <div className="fixed top-16 left-0 h-[calc(100%-4rem)] w-84 z-40">
          <SidebarAdmin />
        </div>

        <main className="ml-56 pt-6 pb-16 px-8 w-full overflow-y-auto h-full bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
          <div className="max-w-6xl mx-auto">
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
                          <th className="p-4 font-semibold text-slate-700">Nama Pelapor</th>
                          <th className="p-4 font-semibold text-slate-700">Email</th>
                          <th className="p-4 font-semibold text-slate-700">WA</th>
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
                        {laporan.map((item, index) => {
                          // Menyesuaikan fotoPath untuk tampilan gambar
                          const displayFotoPath = item.foto_path && item.foto_path.startsWith('public/')
                            ? item.foto_path.substring('public/'.length)
                            : item.foto_path;

                          return (
                            <tr
                              key={item.id}
                              className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-blue-50/30 transition-all duration-300 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                              }`}
                            >
                              <td className="p-4 text-slate-700">{item.nama || 'Tidak diketahui'}</td>
                              <td className="p-4 text-slate-700">{item.email}</td>
                              <td className="p-4 text-slate-700">{item.whatsapp_number || 'Tidak ada'}</td>
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
                                {item.foto_path ? (
                                  <a
                                    href={`https://wwuorklatnmvtkhsjkzt.supabase.co/storage/v1/object/public/laporan-foto/${displayFotoPath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block group"
                                  >
                                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                                      <img
                                        src={`https://wwuorklatnmvtkhsjkzt.supabase.co/storage/v1/object/public/laporan-foto/${displayFotoPath}`}
                                        alt="Foto Laporan"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        onError={(e) => (e.target.src = '/path/to/fallback-image.jpg')} // Fallback image if loading fails
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
                                    onClick={() => handleDelete(item.id, item.foto_path)}
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Modal */}
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

      {/* Note Modal */}
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

      {/* Follow-Up Modal */}
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