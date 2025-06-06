import { useState, useEffect } from 'react';
import { Camera, MapPin, Trash2, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Mock components for demonstration
const HeaderUser = () => <div className="fixed top-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 z-50"></div>;
const FooterUser = () => <div className="h-16 bg-gray-900/80 backdrop-blur-md border-t border-gray-700/50"></div>;

export default function Laporan() {
  const [formData, setFormData] = useState({
    foto_url: '',
    deskripsi: '',
    lokasi: '',
    jenis_sampah: '',
  });
  const [laporan, setLaporan] = useState([
    {
      id: 1,
      lokasi: 'Sungai Citarum, Bandung',
      jenis_sampah: 'Plastik dan Limbah Industri',
      deskripsi: 'Terdapat banyak sampah plastik dan limbah berwarna hitam dengan bau yang sangat menyengat. Air sungai berubah warna menjadi kehitaman.',
      status: 'Under Review',
      foto_url: 'https://via.placeholder.com/400x300/1f2937/60a5fa?text=River+Pollution',
      created_at: '2024-06-01T10:30:00Z'
    },
    {
      id: 2,
      lokasi: 'Sungai Ciliwung, Jakarta',
      jenis_sampah: 'Minyak dan Sampah Organik',
      deskripsi: 'Permukaan air tertutup lapisan minyak tipis dan sampah organik yang membusuk. Banyak ikan mati ditemukan mengapung.',
      status: 'Processed',
      created_at: '2024-05-28T14:20:00Z'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Simulate loading for demonstration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    
    try {
      if (formData.foto_url && !formData.foto_url.match(/^https?:\/\/.*\.(?:png|jpg|jpeg|gif)$/i)) {
        throw new Error('URL foto tidak valid. Harap masukkan URL gambar (png, jpg, jpeg, atau gif).');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport = {
        id: Date.now(),
        lokasi: formData.lokasi,
        jenis_sampah: formData.jenis_sampah,
        deskripsi: formData.deskripsi,
        foto_url: formData.foto_url || null,
        status: 'Under Review',
        created_at: new Date().toISOString()
      };
      
      setLaporan(prev => [newReport, ...prev]);
      setFormData({ foto_url: '', deskripsi: '', lokasi: '', jenis_sampah: '' });
    } catch (err) {
      setError(`Gagal mengirim laporan: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Under Review':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white flex items-center justify-center relative overflow-hidden">
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
              className="px-6 py-3 bg-gradient-to-r from-red-600/30 to-red-700/30 border border-red-500/50 rounded-xl text-red-200 hover:from-red-600/40 hover:to-red-700/40 transition-all duration-300 font-medium"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white flex flex-col relative overflow-x-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-teal-400/15 rounded-full blur-3xl animate-pulse delay-3000"></div>
        
        {/* Animated particles */}
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
            {/* Enhanced header */}
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

            {/* Enhanced form */}
            <div onSubmit={handleSubmit} className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl mb-16 hover:bg-gray-900/50 transition-all duration-500">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="group">
                    <label className="flex items-center text-gray-300 font-semibold mb-3">
                      <Camera className="w-5 h-5 mr-2 text-cyan-400" />
                      Link Foto (Opsional)
                    </label>
                    <input
                      type="text"
                      name="foto_url"
                      value={formData.foto_url}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 focus:bg-gray-800/70 transition-all duration-300 group-hover:border-gray-500/70"
                      placeholder="https://example.com/foto.jpg"
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
            </div>

            {/* Enhanced history section */}
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
                            {item.foto_url && (
                              <div className="flex-shrink-0">
                                <img
                                  src={item.foto_url}
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
                                </div>
                                
                                <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                                  item.status === 'Processed' 
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                  item.status === 'Under Review' 
                                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                    'bg-blue-500/20 text-blue-300 border border-blue-500/30'
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