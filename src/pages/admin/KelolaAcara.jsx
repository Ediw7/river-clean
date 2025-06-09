import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';
import { Calendar, MapPin, Image, Edit, Trash2, Clock, Phone, AlertTriangle } from 'lucide-react'; // Tambah AlertTriangle

export default function KelolaAcara() {
  const navigate = useNavigate();
  const [acara, setAcara] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, data: null, newPosterFile: null }); // State untuk modal edit

  // Fungsi untuk mengambil data acara dari Supabase
  const fetchAcara = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('acara_pembersihan')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAcara(data || []);
    } catch (err) {
      setError('Gagal memuat acara: ' + err.message);
      console.error('Error fetching acara:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Dependensi kosong, hanya dijalankan sekali saat mount

  // Check autentikasi dan panggil fetchAcara
  useEffect(() => {
    const checkAuthAndFetch = async () => {
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

        await fetchAcara(); // Panggil fetch data setelah auth berhasil

      } catch (err) {
        setError('Gagal memverifikasi role admin atau memuat data: ' + err.message);
        console.error('Auth check error:', err);
      }
    };

    checkAuthAndFetch();
  }, [navigate, fetchAcara]); // fetchAcara sebagai dependency

  // Handler untuk mengedit acara
  const handleEdit = async () => {
    const { id, judul, lokasi, tanggal, waktu, no_cp, deskripsi, poster_url, newPosterFile } = editModal.data;
    const originalAcara = [...acara]; // Simpan state asli untuk rollback

    // Optimistic UI Update (update data di frontend sementara)
    const updatedAcaraItem = {
      ...editModal.data,
      updated_at: new Date().toISOString(),
    };
    // Jika ada file poster baru, buat URL preview sementara
    if (newPosterFile) {
        updatedAcaraItem.poster_url = URL.createObjectURL(newPosterFile);
    }

    setAcara(prevAcara =>
      prevAcara.map(item =>
        item.id === id ? { ...item, ...updatedAcaraItem } : item
      )
    );
    setEditModal({ open: false, data: null, newPosterFile: null }); // Tutup modal segera

    try {
      let finalPosterUrl = poster_url;
      if (newPosterFile) {
        // Upload poster baru ke Supabase Storage
        const fileExtension = newPosterFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`; // Nama file unik
        const filePath = `posters/${fileName}`; // Folder 'posters' di bucket Anda

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('acara-posters') // Ganti dengan nama bucket storage Anda
          .upload(filePath, newPosterFile, {
            cacheControl: '3600',
            upsert: false // Jangan menimpa jika nama file sudah ada (gunakan nama unik)
          });

        if (uploadError) {
          console.error('Supabase Storage Upload Error:', uploadError);
          throw new Error('Gagal mengunggah poster baru: ' + uploadError.message);
        }

        // Dapatkan URL publik dari poster yang baru diunggah
        const { data: publicUrlData } = supabase.storage
          .from('acara-posters')
          .getPublicUrl(filePath);
        finalPosterUrl = publicUrlData.publicUrl;

        // Jika ada poster lama dan berhasil diunggah poster baru, hapus poster lama dari storage
        if (poster_url && poster_url.includes('acara-posters')) { // Pastikan URL memang dari bucket Anda
            const oldFileNameWithFolder = poster_url.split('/public/acara-posters/')[1]; // Ambil path relatif
            const { error: deleteError } = await supabase.storage.from('acara-posters').remove([oldFileNameWithFolder]);
            if (deleteError) {
                console.warn('Gagal menghapus poster lama dari storage:', deleteError.message);
            }
        }
      }

      // Update data acara di database
      const { error: updateError } = await supabase
        .from('acara_pembersihan')
        .update({
          judul,
          lokasi,
          tanggal,
          waktu: waktu || null, // Pastikan waktu bisa null
          no_cp: no_cp || null, // Pastikan no_cp bisa null
          deskripsi,
          poster_url: finalPosterUrl, // Gunakan URL poster final
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        console.error('Supabase UPDATE error:', updateError);
        console.error('Pesan error Supabase:', updateError.message);
        console.error('Detail error Supabase:', updateError.details);
        console.error('Hint error Supabase:', updateError.hint);
        throw updateError;
      }

      // Final update UI setelah poster_url diketahui (jika ada upload baru)
      setAcara(prevAcara =>
        prevAcara.map(item =>
          item.id === id ? { ...item, poster_url: finalPosterUrl, updated_at: new Date().toISOString() } : item
        )
      );

    } catch (err) {
      setError('Gagal mengedit acara: ' + err.message);
      setAcara(originalAcara); // Rollback UI jika terjadi error
      // Buka kembali modal dengan data asli jika gagal
      setEditModal({ open: true, data: originalAcara.find(item => item.id === id), newPosterFile: null });
    }
  };

  // Handler untuk menghapus acara
  const handleDelete = async (id, posterUrl) => {
    if (window.confirm('Yakin ingin menghapus acara ini?')) {
      const originalAcara = [...acara]; // Simpan state asli

      // Optimistic UI Update: Hapus dari daftar di frontend
      setAcara(prevAcara => prevAcara.filter(item => item.id !== id));

      try {
        // Hapus poster dari storage jika ada dan merupakan URL dari bucket Anda
        if (posterUrl && posterUrl.includes('acara-posters')) {
          const fileNameWithFolder = posterUrl.split('/public/acara-posters/')[1]; // Ambil path relatif
          const { error: storageError } = await supabase.storage.from('acara-posters').remove([fileNameWithFolder]);
          if (storageError) {
            console.warn('Gagal menghapus poster dari storage:', storageError.message);
          }
        }

        const { error: dbError } = await supabase.from('acara_pembersihan').delete().eq('id', id);
        if (dbError) {
          console.error('Supabase DELETE error:', dbError);
          console.error('Pesan error Supabase:', dbError.message);
          console.error('Detail error Supabase:', dbError.details);
          console.error('Hint error Supabase:', dbError.hint);
          throw dbError;
        }
      } catch (err) {
        setError('Gagal menghapus acara: ' + err.message);
        setAcara(originalAcara); // Rollback UI
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" /> {/* Menggunakan AlertTriangle */}
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
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/25" // Gunakan cyan-blue gradient
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
                    <table className="min-w-full text-left"> {/* Tambah min-w-full */}
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                          <th className="p-4 font-semibold text-slate-700">Judul</th>
                          <th className="p-4 font-semibold text-slate-700">Lokasi</th>
                          <th className="p-4 font-semibold text-slate-700">Tanggal</th>
                          <th className="p-4 font-semibold text-slate-700">Waktu</th>
                          <th className="p-4 font-semibold text-slate-700">No. CP</th>
                          <th className="p-4 font-semibold text-slate-700">Deskripsi</th>
                          <th className="p-4 font-semibold text-slate-700">Poster</th>
                          <th className="p-4 font-semibold text-slate-700">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {acara.map((item, index) => (
                          <tr
                            key={item.id}
                            className={`border-b border-slate-100 hover:bg-slate-50 transition-all duration-300 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                            }`}
                          >
                            <td className="p-4 text-slate-700 whitespace-nowrap">{item.judul}</td>
                            <td className="p-4 text-slate-700">
                              <div className="flex items-center space-x-2 whitespace-nowrap"> 
                                <MapPin className="w-4 h-4 text-slate-500" />
                                <span>{item.lokasi}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-700 whitespace-nowrap">
                              {new Date(item.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </td>
                      
                            <td className="p-4 text-slate-700"> 
                              <div className="flex items-center space-x-2 whitespace-nowrap"> 
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span>{item.waktu ? item.waktu.substring(0, 5) : '-'}</span>
                              </div>
                            </td>
                   
                            <td className="p-4 text-slate-700">
                              <div className="flex items-center space-x-2 whitespace-nowrap"> 
                                <Phone className="w-4 h-4 text-slate-500" />
                                <span>{item.no_cp || '-'}</span>
                              </div>
                            </td>
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
                                      alt="Poster Acara"
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                      onError={(e) => { e.target.onerror = null; e.target.src='/placeholder-image.jpg'; }}
                                    />
                                  </div>
                                </a>
                              ) : (
                                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                                  <Image className="w-6 h-6 text-slate-400" />
                                </div>
                              )}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={() => setEditModal({ open: true, data: { ...item, tanggal: item.tanggal.substring(0, 10), waktu: item.waktu ? item.waktu.substring(0, 5) : '' }, newPosterFile: null })}
                                  className="group relative w-full px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl text-white text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 flex items-center space-x-1 justify-center"
                                >
                                    <span className="relative z-10 flex items-center space-x-1">
                                      <Edit className="w-4 h-4" />
                                      <span>Edit</span>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, item.poster_url)}
                                  className="group relative w-full px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-600/25 flex items-center space-x-1 justify-center"
                                >
                                    <span className="relative z-10 flex items-center space-x-1">
                                      <Trash2 className="w-4 h-4" />
                                      <span>Hapus</span>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
      {editModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full max-w-4xl border border-white/50">
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
                  value={editModal.data.judul}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, judul: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="Judul"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label>
                <input
                  type="text"
                  value={editModal.data.lokasi}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, lokasi: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="Lokasi"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal</label>
                <input
                  type="date"
                  value={editModal.data.tanggal}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, tanggal: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Waktu (opsional)</label>
                <input
                  type="time"
                  value={editModal.data.waktu || ''}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, waktu: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Kontak Person (opsional)</label>
                <input
                  type="text"
                  value={editModal.data.no_cp || ''}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, no_cp: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="Contoh: +628123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Poster URL (opsional)</label>
                <input
                  type="url"
                  value={editModal.data.poster_url || ''}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, poster_url: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="URL gambar poster"
                />
                 <p className="text-xs text-slate-500 mt-1">
                    Atau upload gambar baru:
                </p>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditModal({ ...editModal, newPosterFile: e.target.files[0] })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80 mt-2"
                />
                {editModal.data.poster_url && !editModal.newPosterFile && (
                    <div className="mt-2 text-center">
                        <img src={editModal.data.poster_url} alt="Current Poster" className="max-h-24 mx-auto rounded-lg shadow-md" />
                        <p className="text-xs text-slate-500 mt-1">Poster saat ini</p>
                    </div>
                )}
                {editModal.newPosterFile && (
                    <div className="mt-2 text-center">
                        <img src={URL.createObjectURL(editModal.newPosterFile)} alt="New Poster Preview" className="max-h-24 mx-auto rounded-lg shadow-md" />
                        <p className="text-xs text-slate-500 mt-1">Pratinjau poster baru</p>
                    </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi (opsional)</label>
                <textarea
                  value={editModal.data.deskripsi || ''}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, deskripsi: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80 min-h-[120px] resize-none"
                  placeholder="Deskripsi acara"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditModal({ open: false, data: null, newPosterFile: null })}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}