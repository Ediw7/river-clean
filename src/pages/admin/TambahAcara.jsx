import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';
import { Plus, Calendar, AlertTriangle } from 'lucide-react';

export default function TambahAcara() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    judul: '',
    lokasi: '',
    tanggal: '',
    waktu: '',
    no_cp: '',
    deskripsi: '',
    link_pendaftaran: '',
  });
  const [posterFile, setPosterFile] = useState(null);
  const [error, setError] = useState(null);

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
      } catch (err) {
        setError('Gagal memverifikasi role admin: ' + err.message);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    let posterUrl = null;
    try {
      if (posterFile) {
        const fileExtension = posterFile.name.split('.').pop();
        // PERBAIKAN DI SINI: Gunakan konkatenasi string biasa
        const fileName = Date.now() + '_' + Math.random().toString(36).substring(2, 15) + '.' + fileExtension;
        const filePath = 'posters/' + fileName; // PERBAIKAN DI SINI JUGA

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('acara-posters')
          .upload(filePath, posterFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Supabase Storage Upload Error:', uploadError);
          throw new Error('Gagal mengunggah poster: ' + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('acara-posters')
          .getPublicUrl(filePath);
        posterUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('acara_pembersihan').insert([{
        judul: formData.judul,
        lokasi: formData.lokasi,
        tanggal: formData.tanggal,
        waktu: formData.waktu || null,
        no_cp: formData.no_cp || null,
        deskripsi: formData.deskripsi || null,
        poster_url: posterUrl,
        link_pendaftaran: formData.link_pendaftaran || null, 
        updated_at: new Date().toISOString(),
      }]);

      if (insertError) {
        console.error('Supabase Insert Error:', insertError);
        console.error('Pesan error Supabase:', insertError.message);
        console.error('Detail error Supabase:', insertError.details);
        console.error('Hint error Supabase:', insertError.hint);
        throw insertError;
      }

      navigate('/admin/acara', { state: { success: 'Acara berhasil ditambahkan!' } });
    } catch (err) {
      setError('Gagal menyimpan acara: ' + err.message);
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
    <div className="h-screen overflow-hidden bg-white relative">
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderAdmin />
      </div>

      <div className="flex pt-16 h-full">
        <div className="fixed top-16 left-0 h-[calc(100%-4rem)] w-84 z-0">
          <SidebarAdmin />
        </div>

        <main className="ml-56 pt-4 pb-16 px-8 w-full overflow-y-auto h-full bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center mt-4 space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Tambah Acara Pembersihan
                  </h1>
                  <p className="text-slate-600">Buat acara baru untuk pembersihan lingkungan.</p>
                </div>
              </div>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Judul</label>
                  <input
                    type="text"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80"
                    placeholder="Contoh: Pembersihan Sungai Cekelum"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label>
                  <input
                    type="text"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80"
                    placeholder="Contoh: Sungai Cekelum, Jakamu"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Waktu (Opsional)</label>
                  <input
                    type="time"
                    value={formData.waktu}
                    onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80"
                    placeholder="Contoh: 09:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Kontak Person (Opsional)</label>
                  <input
                    type="text"
                    value={formData.no_cp}
                    onChange={(e) => setFormData({ ...formData, no_cp: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80"
                    placeholder="Contoh: +628123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi (Opsional)</label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80 min-h-[120px] resize-none"
                    placeholder="Deskripsi acara"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Link Pendaftaran (Opsional)</label>
                  <input
                    type="url"
                    value={formData.link_pendaftaran}
                    onChange={(e) => setFormData({ ...formData, link_pendaftaran: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80"
                    placeholder="Contoh: https://forms.gle/xyz123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Poster (Opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPosterFile(e.target.files[0])}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {posterFile && (
                    <div className="mt-4 text-center">
                        <img src={URL.createObjectURL(posterFile)} alt="Poster Preview" className="max-h-48 mx-auto rounded-lg shadow-md" />
                        <p className="text-xs text-slate-500 mt-2">Pratinjau poster</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/acara')}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
                  >
                    <span className="relative z-10">Simpan Acara</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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