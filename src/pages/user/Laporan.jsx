import { useState, useEffect } from 'react';
import { Camera, MapPin, Trash2, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';
import { supabase } from '../../lib/supabase';

export default function Laporan() {
  const [formData, setFormData] = useState({
    foto: null,
    deskripsi: '',
    lokasi: '',
    jenis_sampah: '',
  });
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userId = user.id;
      const { data, error } = await supabase
        .from('laporan_pencemaran')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLaporan(data);
    } catch (err) {
      console.error('Error fetching laporan:', err);
      setError('Gagal memuat riwayat laporan.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit triggered');
    
    if (!formData.lokasi || !formData.jenis_sampah || !formData.deskripsi) {
      setError('Semua field wajib diisi kecuali foto.');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    console.log('Form data:', formData);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User tidak login.');

      // Ambil data profil dari tabel users
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('nama, whatsapp_number')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      let fotoPath = null;
      if (formData.foto) {
        const fileExt = formData.foto.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        console.log('Uploading file:', fileName);
        const { error: uploadError, data } = await supabase.storage
          .from('laporan-foto')
          .upload(`public/${fileName}`, formData.foto, {
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadError) {
          console.error('Upload error:', uploadError);
          if (uploadError.message.includes('row-level security')) {
            throw new Error('Akses ditolak oleh kebijakan keamanan. Hubungi admin untuk memperbarui RLS.');
          }
          throw new Error('Gagal mengunggah foto: ' + uploadError.message);
        }
        fotoPath = data.path;
        console.log('Upload success, path:', fotoPath);
      }

      const newReport = {
        user_id: user.id,
        email: user.email,
        whatsapp_number: userProfile.whatsapp_number || null,
        nama: userProfile.nama || null,
        foto_path: fotoPath,
        deskripsi: formData.deskripsi,
        lokasi: formData.lokasi,
        jenis_sampah: formData.jenis_sampah,
        status: 'menunggu',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Inserting data:', newReport);
      const { error: insertError } = await supabase
        .from('laporan_pencemaran')
        .insert(newReport);
      if (insertError) {
        console.error('Insert error:', insertError);
        if (insertError.message.includes('row-level security')) {
          throw new Error('Akses ditolak oleh kebijakan keamanan tabel. Perbarui RLS.');
        }
        throw new Error('Gagal menyimpan laporan: ' + insertError.message);
      }

      console.log('Insert success');
      alert('Laporan berhasil dikirim!');
      setLaporan(prev => [newReport, ...prev]);
      setFormData({ foto: null, deskripsi: '', lokasi: '', jenis_sampah: '' });
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('ERROR:', err);
      setError(err.message || 'Terjadi kesalahan saat mengirim laporan.');
      alert(err.message || 'Terjadi kesalahan saat mengirim laporan.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'diverifikasi':
        return <CheckCircle className="w-4 h-4" />;
      case 'menunggu':
        return <Clock className="w-4 h-4" />;
      case 'ditolak':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white flex items-center justify-center relative overflow-hidden">
        <HeaderUser />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        <div className="bg-red-900/20 backdrop-blur-xl border border-red-800/50 rounded-2xl p-8 shadow-2xl z-10 max-w-md mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-300 mb-4">Terjadi Kesalahan</h2>
            <p className="text-red-200/80 mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-6 py-4 bg-gradient-to-r from-red-600/30 to-red-700/30 border border-red-500/50 rounded-xl text-red-200 hover:from-red-600/40 hover:to-red-700/40 transition-all duration-300 font-medium"
            >
              Coba Lagi
            </button>
          </div>
        </div>
        <FooterUser />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white flex flex-col relative overflow-x-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-teal-400/15 rounded-full blur-3xl animate-pulse delay-3000"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-cyan-400/40 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-emerald-400/60 rounded-full animate-ping delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-ping delay-2000"></div>
        </div>
      </div>
      <HeaderUser />
      <div className="flex flex-1 pt-24 relative z-10">
        <main className="p-6 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-md border border-cyan-400/30 rounded-2xl mb-6">
                <Camera className="w-10 h-10 text-cyan-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
                Lapor Pencemaran Sungai
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Laporkan pencemaran sungai yang Anda temukan untuk membantu menjaga kelestarian lingkungan
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl mb-16 hover:bg-gray-900/50 transition-all duration-500">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="group">
                    <label className="flex items-center text-gray-300 font-semibold mb-3">
                      <Camera className="w-5 h-5 mr-2 text-cyan-400" />
                      Unggah Foto (Opsional)
                    </label>
                    <input
                      type="file"
                      name="foto"
                      onChange={handleInputChange}
                      accept="image/png,image/jpeg,image/gif"
                      className="w-full p-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 focus:bg-gray-800/70 transition-all duration-300 group-hover:border-gray-500/70"
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center text-gray-300 font-semibold mb-3">
                      <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
                      Lokasi *
                    </label>
                    <input
                      type="text"
                      name="lokasi"
                      value={formData.lokasi}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 focus:bg-gray-800/70 transition-all duration-300 group-hover:border-gray-500/70"
                      required
                      placeholder="Contoh: Sungai Citarum, Bandung"
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center text-gray-300 font-semibold mb-3">
                      <Trash2 className="w-5 h-5 mr-2 text-orange-400" />
                      Jenis Sampah *
                    </label>
                    <input
                      type="text"
                      name="jenis_sampah"
                      value={formData.jenis_sampah}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-gray-800/70 transition-all duration-300 group-hover:border-gray-500/70"
                      required
                      placeholder="Contoh: Plastik, Minyak, Limbah Industri"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="group">
                    <label className="flex items-center text-gray-300 font-semibold mb-3">
                      <Send className="w-5 h-5 mr-2 text-blue-400" />
                      Deskripsi *
                    </label>
                    <textarea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-gray-800/70 transition-all duration-300 group-hover:border-gray-500/70 resize-none"
                      rows="8"
                      required
                      placeholder="Jelaskan detail pencemaran yang Anda temukan, seperti warna air, bau, dan kondisi sekitar..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-8 py-4 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 rounded-2xl text-cyan-200 font-bold hover:from-cyan-600/40 hover:to-blue-600/40 hover:border-cyan-400/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 group"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin"></div>
                        <span>Mengirim Laporan...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Kirim Laporan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  Riwayat Laporan Anda
                </h2>
                <p className="text-gray-400">Pantau status laporan yang telah Anda kirimkan</p>
              </div>

              {loading ? (
                <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-12 shadow-2xl">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-300 text-lg">Memuat laporan...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
                  {laporan.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Camera className="w-12 h-12 text-gray-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-300 mb-2">Belum ada laporan</h3>
                      <p className="text-gray-500">Mulai laporkan pencemaran yang Anda temukan</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {laporan.map((item, index) => (
                        <div 
                          key={item.id} 
                          className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:from-gray-800/70 hover:to-gray-800/50 hover:border-gray-600/70 transition-all duration-500 group"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                            {item.foto_path && (
                              <div className="flex-shrink-0">
                                <img
                                  src={`https://wwuorklatnmvtkhsjkzt.supabase.co/storage/v1/object/public/laporan-foto/${item.foto_path}`}
                                  alt="Laporan"
                                  className="w-full lg:w-48 h-48 object-cover rounded-xl border border-gray-600/50 group-hover:border-gray-500/70 transition-all duration-300"
                                  onError={(e) => (e.target.src = '/path/to/fallback-image.jpg')}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
                                    {item.lokasi}
                                  </h3>
                                  <div className="flex items-center text-orange-300 mb-2">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    <span className="font-medium">{item.jenis_sampah}</span>
                                  </div>
                                  <div className="flex items-center text-gray-400 mb-2">
                                    <span className="font-medium">Pelapor: {item.nama || 'Tidak diketahui'}</span>
                                  </div>
                                  <div className="flex items-center text-gray-400">
                                    <span className="font-medium">WA: {item.whatsapp_number || 'Tidak ada'}</span>
                                  </div>
                                </div>
                                <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                                  item.status === 'diverifikasi' 
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                  item.status === 'menunggu' 
                                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                    'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}>
                                  {getStatusIcon(item.status)}
                                  <span className="ml-2">{item.status}</span>
                                </div>
                              </div>
                              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                                <p className="text-gray-300 leading-relaxed">{item.deskripsi}</p>
                              </div>
                              {item.created_at && (
                                <div className="flex items-center text-gray-500 text-sm mt-4">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span>Dilaporkan: {new Date(item.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <FooterUser />
    </div>
  );
}