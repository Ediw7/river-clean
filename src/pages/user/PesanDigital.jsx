import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, MapPin, Send, Loader2, AlertCircle, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';
import { motion, AnimatePresence } from 'framer-motion';

export default function PesanDigital() {
  const navigate = useNavigate();
  const [pesan, setPesan] = useState([]);
  const [formData, setFormData] = useState({ pesan: '', lokasi: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const maxMessageLength = 280;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { data } = await supabase
          .from('pesan_digital')
          .select('*')
          .order('created_at', { ascending: false });

        setPesan(data || []);
      } catch (err) {
        setError('Gagal memuat pesan: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'pesan' && value.length > maxMessageLength) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('pesan_digital').insert({
        user_id: user.id,
        email: user.email,
        pesan: formData.pesan,
        lokasi: formData.lokasi,
      });

      if (error) throw error;

      setPesan([
        {
          user_id: user.id,
          email: user.email,
          pesan: formData.pesan,
          lokasi: formData.lokasi,
          created_at: new Date().toISOString(),
        },
        ...pesan,
      ]);
      setFormData({ pesan: '', lokasi: '' });
      setToast({ type: 'success', message: 'Pesan berhasil dikirim!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal mengirim pesan: ' + err.message });
    } finally {
      setFormLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const filteredPesan = pesan
    .filter((item) =>
      item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'created_at') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'lokasi') {
        return (a.lokasi || '').localeCompare(b.lokasi || '');
      }
      return 0;
    });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white flex flex-col relative overflow-hidden">
        <HeaderUser />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        <div className="flex flex-1 items-center justify-center pt-16">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl z-10 max-w-md mx-4">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-300 mb-4">Terjadi Kesalahan</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={() => setError(null)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 rounded-xl text-cyan-200 hover:from-cyan-600/40 hover:to-blue-600/40 transition-all duration-300 font-medium"
                aria-label="Coba Lagi"
              >
                Coba Lagi
              </button>
            </div>
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
      </div>

      <HeaderUser />

      <div className="flex flex-1 pt-24 relative z-10">
        <main className="p-6 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-md border border-cyan-400/30 rounded-2xl mb-6">
                <MessageSquare className="w-10 h-10 text-cyan-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
                Pesan dalam Botol Digital
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Kirim pesan virtualmu dan lihat pesan dari komunitas untuk menjaga sungai tetap bersih!
              </p>
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-6 mb-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <MessageSquare size={20} className="text-cyan-400" />
                    Pesan
                  </label>
                  <textarea
                    name="pesan"
                    value={formData.pesan}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-all duration-300"
                    rows={4}
                    required
                    placeholder="Tulis pesanmu untuk sungai..."
                    aria-label="Pesan"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    {formData.pesan.length}/{maxMessageLength} karakter
                  </p>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <MapPin size={20} className="text-cyan-400" />
                    Lokasi (Opsional)
                  </label>
                  <input
                    type="text"
                    name="lokasi"
                    value={formData.lokasi}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-all duration-300"
                    placeholder="Masukkan lokasi sungai..."
                    aria-label="Lokasi"
                  />
                </div>
                <button
                  type="submit"
                  disabled={formLoading || !formData.pesan}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                    formLoading || !formData.pesan
                      ? 'bg-gray-600/50 cursor-not-allowed border border-gray-700/50'
                      : 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 hover:from-cyan-600/40 hover:to-blue-600/40 hover:scale-105 hover:shadow-xl'
                  }`}
                  aria-label="Kirim Pesan"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Kirim Pesan
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Toast Notification */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
                    toast.type === 'success'
                      ? 'bg-green-500/80 text-white'
                      : 'bg-red-500/80 text-white'
                  }`}
                >
                  {toast.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search and Sort */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari pesan atau lokasi..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50"
                  aria-label="Cari pesan"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-cyan-300" size={20} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-lg py-2 px-4 text-gray-200 focus:outline-none focus:border-cyan-500/50"
                  aria-label="Urutkan berdasarkan"
                >
                  <option value="created_at">Terbaru</option>
                  <option value="lokasi">Lokasi</option>
                </select>
              </div>
            </div>

            {/* Messages */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-cyan-300 animate-spin mb-4" />
                <p className="text-gray-300 text-lg">Memuat pesan...</p>
              </div>
            ) : (
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-6">
                <AnimatePresence>
                  {filteredPesan.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8"
                    >
                      <p className="text-gray-400 text-lg">Belum ada pesan yang sesuai.</p>
                      <button
                        onClick={() => setFormData({ pesan: '', lokasi: '' })}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 rounded-xl text-cyan-200 hover:from-cyan-600/40 hover:to-blue-600/40 transition-all duration-300 font-medium"
                        aria-label="Tulis Pesan Baru"
                      >
                        Tulis Pesan Baru
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {filteredPesan.map((item) => (
                        <motion.div
                          key={item.id || item.created_at} // Use created_at as fallback if id is missing
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                              <MessageSquare size={20} className="text-cyan-400" />
                              Pesan
                            </h3>
                            <span className="text-xs text-gray-400">
                              {new Date(item.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-2">{item.pesan}</p>
                          <p className="text-sm text-gray-400">
                            <span className="font-medium text-gray-200">Lokasi:</span> {item.lokasi || '-'}
                          </p>
                          <p className="text-sm text-gray-400">
                            <span className="font-medium text-gray-200">Oleh:</span> {item.email}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>

      <FooterUser />
    </div>
  );
}