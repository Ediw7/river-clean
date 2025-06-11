import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';
import {
  FileText, // Ini seharusnya tidak ada di sini, tapi saya biarkan untuk konteks.
  MapPin,
  Trash2,
  Edit,
  StickyNote,
  CheckCircle,
  XCircle,
  Image,
  AlertTriangle,
  Send,
  Calendar,
  Clock,
  Phone,
  Link,
  Search,
  Filter,
} from 'lucide-react';

export default function KelolaAcara() {
  const navigate = useNavigate();
  const [acara, setAcara] = useState([]);
  const [displayedAcara, setDisplayedAcara] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, data: null, newPosterFile: null });
  const [noteModal, setNoteModal] = useState({ open: false, data: null, note: '' }); // Tidak digunakan di KelolaAcara, bisa dihapus jika tidak ada konteks
  const [followUpModal, setFollowUpModal] = useState({ open: false, data: null, followUp: '' }); // Tidak digunakan di KelolaAcara, bisa dihapus jika tidak ada konteks
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  const fetchAcara = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('acara_pembersihan')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAcara(data || []);
      setDisplayedAcara(data || []);
    } catch (err) {
      setError('Gagal memuat acara: ' + err.message);
      console.error('Error fetching acara:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

        if (userError || !userData || userData.role !== 'admin') {
          setError('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
          navigate('/login');
          return;
        }

        await fetchAcara();

      } catch (err) {
        setError('Gagal memverifikasi role admin atau memuat data: ' + err.message); // PERBAIKAN DI SINI
        console.error('Auth check error:', err);
      }
    };

    checkAuthAndFetch();
  }, [navigate, fetchAcara]);

  // Logika filter dan sort
  useEffect(() => {
    let filtered = acara;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.judul || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (item.lokasi || '').toLowerCase().includes(lowerCaseSearchTerm) ||
        (item.deskripsi || '').toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (sortBy === 'created_at') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'judul') {
      filtered.sort((a, b) => (a.judul || '').localeCompare(b.judul || ''));
    } else if (sortBy === 'tanggal') {
      filtered.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    } else if (sortBy === 'lokasi') {
      filtered.sort((a, b) => (a.lokasi || '').localeCompare(b.lokasi || ''));
    }
    setDisplayedAcara(filtered);
  }, [searchTerm, sortBy, acara]);


  const handleEdit = async () => {
    const { id, judul, lokasi, tanggal, waktu, no_cp, deskripsi, poster_url, link_pendaftaran, newPosterFile } = editModal.data;
    const originalAcara = [...acara];

    const updatedAcaraItem = {
      ...editModal.data,
      updated_at: new Date().toISOString(),
    };
    if (newPosterFile) {
        updatedAcaraItem.poster_url = URL.createObjectURL(newPosterFile);
    }

    setAcara(prevAcara =>
      prevAcara.map(item =>
        item.id === id ? { ...item, ...updatedAcaraItem } : item
      )
    );
    setEditModal({ open: false, data: null, newPosterFile: null });

    try {
      let finalPosterUrl = poster_url;
      if (newPosterFile) {
        const fileExtension = newPosterFile.name.split('.').pop();
        const fileName = `<span class="math-inline">\{Date\.now\(\)\}\_</span>{Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
        const filePath = `posters/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('acara-posters')
          .upload(filePath, newPosterFile, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          console.error('Supabase Storage Upload Error:', uploadError);
          throw new Error('Gagal mengunggah poster baru: ' + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('acara-posters')
          .getPublicUrl(filePath);
        finalPosterUrl = publicUrlData.publicUrl;

        if (poster_url && poster_url.includes('acara-posters')) {
            const oldFileNameWithFolder = poster_url.split('/public/acara-posters/')[1];
            const { error: deleteError } = await supabase.storage.from('acara-posters').remove([oldFileNameWithFolder]);
            if (deleteError) {
                console.warn('Gagal menghapus poster lama dari storage:', deleteError.message);
            }
        }
      }

      const { error: updateError } = await supabase
        .from('acara_pembersihan')
        .update({
          judul,
          lokasi,
          tanggal,
          waktu: waktu || null,
          no_cp: no_cp || null,
          deskripsi,
          poster_url: finalPosterUrl,
          link_pendaftaran: link_pendaftaran || null, 
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        console.error('Supabase UPDATE error:', updateError);
        console.error('Pesan error Supabase:', updateError.message);
        throw updateError;
      }

      setAcara(prevAcara =>
        prevAcara.map(item =>
          item.id === id ? { ...item, poster_url: finalPosterUrl, updated_at: new Date().toISOString(), link_pendaftaran: link_pendaftaran } : item
        )
      );

    } catch (err) {
      setError('Gagal mengedit acara: ' + err.message);
      setAcara(originalAcara);
      setEditModal({ open: true, data: originalAcara.find(item => item.id === id), newPosterFile: null });
    }
  };

  const handleDelete = async (id, posterUrl) => {
    if (window.confirm('Yakin ingin menghapus acara ini?')) {
      const originalAcara = [...acara];
      setAcara(prevAcara => prevAcara.filter(item => item.id !== id));

      try {
        if (posterUrl && posterUrl.includes('acara-posters')) {
          const fileNameWithFolder = posterUrl.split('/public/acara-posters/')[1];
          const { error: storageError } = await supabase.storage.from('acara-posters').remove([fileNameWithFolder]);
          if (storageError) {
            console.warn('Gagal menghapus poster dari storage:', storageError.message);
          }
        }

        const { error: dbError } = await supabase.from('acara_pembersihan').delete().eq('id', id);
        if (dbError) {
          console.error('Supabase DELETE error:', dbError);
          console.error('Pesan error Supabase:', dbError.message);
          throw dbError;
        }
      } catch (err) {
        setError('Gagal menghapus acara: ' + err.message);
        setAcara(originalAcara);
      }
    }
  };

  const handleAddNote = async (id, note) => {
    console.log("handleAddNote not implemented for KelolaAcara");
  };
  const handleAddFollowUp = async (id, followUp) => {
    console.log("handleAddFollowUp not implemented for KelolaAcara");
  };
  const handleSendToTeam = async (id, item) => {
    console.log("handleSendToTeam not implemented for KelolaAcara");
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
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg hover:shadow-cyan-500/25"
              >
                Tambah Acara
              </button>
            </div>

            {/* Search and Sort */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari judul, lokasi, atau deskripsi acara..."
                  className="w-full pl-10 pr-4 py-2 bg-white/80 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              
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
                {displayedAcara.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-cyan-600" />
                    </div>
                    <p className="text-slate-500 text-lg">Belum ada acara.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                        <tr>
                          <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Judul</th>
                          <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Lokasi</th>
                          <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Tanggal</th>
                          <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Waktu</th>
                          <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">No. CP</th>
                          <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Link Pendaftaran</th>
                          <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Deskripsi</th>
                          <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Poster</th>
                          <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {displayedAcara.map((item, index) => {
                          const displayFotoPath = item.foto_path && item.foto_path.startsWith('public/')
                            ? item.foto_path.substring('public/'.length)
                            : item.foto_path;

                          return (
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
                              <td className="p-4 text-slate-700 whitespace-nowrap">{new Date(item.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
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
                                {item.link_pendaftaran ? (
                                    <a
                                        href={item.link_pendaftaran}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 truncate"
                                        title={item.link_pendaftaran}
                                    >
                                        <Link className="w-4 h-4 mr-1" />
                                        <span className="truncate">{item.link_pendaftaran.replace(/(^\w+:|^)\/\//, '').split('/')[0]}</span>
                                    </a>
                                ) : (
                                    <span>-</span>
                                )}
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
                                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
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
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => setEditModal({ open: true, data: { ...item, tanggal: item.tanggal.substring(0, 10), waktu: item.waktu ? item.waktu.substring(0, 5) : '' }, newPosterFile: null })}
                                    className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 flex items-center space-x-1 justify-center"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id, item.poster_url)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-600/25 flex items-center space-x-1 justify-center"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Hapus</span>
                                  </button>
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

      <FooterAdmin />
      {editModal.open && (
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Link Pendaftaran (Opsional)</label>
                <input
                  type="url"
                  value={editModal.data.link_pendaftaran || ''}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, link_pendaftaran: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300 bg-white/80"
                  placeholder="URL untuk pendaftaran eksternal"
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