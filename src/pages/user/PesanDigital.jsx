import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, MapPin, Send, Loader2, AlertCircle, Search, Filter, Reply } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';
import { motion, AnimatePresence } from 'framer-motion';

export default function PesanDigital() {
  const navigate = useNavigate();
  const [pesan, setPesan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ pesan: '', lokasi: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const maxMessageLength = 280;
  const [replyForm, setReplyForm] = useState({ pesanId: null, message: '' });

  // Fungsi untuk mendapatkan nama user yang sedang login
  const getCurrentUserName = useCallback(async (userId) => {
    if (!userId) return 'Anonim';
    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('nama, email')
            .eq('id', userId)
            .single();
        if (userError) throw userError;
        return userData.nama || userData.email || 'Anonim';
    } catch (err) {
        console.error("Failed to fetch user name:", err);
        return 'Anonim';
    }
  }, []);

  const fetchPesanData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mengambil pesan utama dengan sender_name dan pesan_replies dengan author_name
      const { data, error: fetchError } = await supabase
        .from('pesan_digital')
        .select(`
          id,
          user_id,
          email,
          pesan,
          lokasi,
          created_at,
          sender_name,
          pesan_replies (
            id,
            user_id,
            pesan,
            created_at,
            author_name
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const sortedPesan = data.map(msg => ({
          ...msg,
          pesan_replies: msg.pesan_replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      }));

      setPesan(sortedPesan || []);
    } catch (err) {
      setError('Gagal memuat pesan: ' + (err.message || 'Unknown error'));
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializePage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      await fetchPesanData();
    };
    initializePage();
  }, [navigate, fetchPesanData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'pesan' && value.length > maxMessageLength) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserName = await getCurrentUserName(user.id);

      const { data: newPesan, error: insertError } = await supabase.from('pesan_digital').insert({
        user_id: user.id,
        email: user.email,
        pesan: formData.pesan,
        lokasi: formData.lokasi || null,
        sender_name: currentUserName,
      }).select().single();

      if (insertError) throw insertError;

      setPesan(prevPesan => [
          { ...newPesan, pesan_replies: [] },
          ...prevPesan,
      ]);
      setFormData({ pesan: '', lokasi: '' });
      setToast({ type: 'success', message: 'Pesan berhasil dikirim!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Gagal mengirim pesan: ' + err.message });
      console.error('Submit message error:', err);
    } finally {
      setFormLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleReplyInputChange = (e, pesanId) => {
    setReplyForm({ pesanId, message: e.target.value });
  };

  const handleReplySubmit = async (e, pesanId) => {
    e.preventDefault();
    if (!replyForm.message.trim()) return;
    
    setFormLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserName = await getCurrentUserName(user.id);

      const { data: newReply, error: insertError } = await supabase.from('pesan_replies').insert({
        pesan_id: pesanId,
        user_id: user.id,
        pesan: replyForm.message,
        author_name: currentUserName,
      }).select().single();

      if (insertError) throw insertError;

      setPesan(prevPesan => prevPesan.map(msg =>
        msg.id === pesanId
          ? { ...msg, pesan_replies: [...msg.pesan_replies, newReply] }
          : msg
      ));
      setReplyForm({ pesanId: null, message: '' });
      setToast({ type: 'success', message: 'Balasan berhasil dikirim!' });

    } catch (err) {
      setToast({ type: 'error', message: 'Gagal mengirim balasan: ' + err.message });
      console.error('Submit reply error:', err);
    } finally {
      setFormLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const getFilteredAndSortedPesan = () => {
    let currentPesan = pesan;

    if (searchTerm) {
      currentPesan = currentPesan.filter((item) =>
        item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === 'created_at') {
      return currentPesan.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'lokasi') {
      return currentPesan.sort((a, b) => (a.lokasi || '').localeCompare(b.lokasi || ''));
    }
    return currentPesan;
  };

  const displayedPesan = getFilteredAndSortedPesan();

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
                onClick={() => fetchPesanData()}
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

            {/* Form Kirim Pesan */}
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-all duration-300"
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

            {/* Message List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-cyan-300 animate-spin mb-4" />
                <p className="text-gray-300 text-lg">Memuat pesan...</p>
              </div>
            ) : (
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-6">
                <AnimatePresence>
                  {displayedPesan.length === 0 ? (
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
                      className="grid grid-cols-1 gap-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {displayedPesan.map((item) => (
                        <motion.div
                          key={item.id || item.created_at}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 shadow-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                              <MessageSquare size={20} className="text-cyan-400" />
                              <span className="text-gray-200">{item.sender_name || 'Anonim'}</span>
                            </h3>
                            <span className="text-xs text-gray-400">
                              {new Date(item.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-2">{item.pesan}</p>
                          {item.lokasi && (
                            <p className="text-sm text-gray-400 flex items-center gap-1">
                              <MapPin size={16} className="text-gray-500" />
                              <span className="font-medium text-gray-200">Lokasi:</span> {item.lokasi}
                            </p>
                          )}

                          {/* Replies Section */}
                          {item.pesan_replies && item.pesan_replies.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-700/50">
                              <h4 className="text-sm font-semibold text-gray-300 mb-3">Balasan:</h4>
                              <div className="space-y-3">
                                {item.pesan_replies.map(reply => (
                                  <div key={reply.id} className="bg-gray-700/30 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-gray-200">{reply.author_name || 'Anonim'}</span>
                                      <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-300">{reply.pesan}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reply Form */}
                          <form onSubmit={(e) => handleReplySubmit(e, item.id)} className="mt-4 pt-4 border-t border-gray-700/50">
                            <textarea
                                value={replyForm.pesanId === item.id ? replyForm.message : ''}
                                onChange={(e) => handleReplyInputChange(e, item.id)}
                                className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-200 focus:outline-none focus:border-cyan-500/50 resize-y"
                                rows="2"
                                placeholder="Tulis balasan Anda..."
                                aria-label="Tulis balasan"
                            />
                            <button
                                type="submit"
                                disabled={formLoading || !replyForm.message.trim()}
                                className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300 flex items-center justify-center gap-1 ${
                                    formLoading || !replyForm.message.trim()
                                    ? 'bg-gray-600/50 cursor-not-allowed'
                                    : 'bg-cyan-600/50 hover:bg-cyan-700/50'
                                }`}
                            >
                                {formLoading && replyForm.pesanId === item.id ? (
                                  <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                  <Reply className="w-4 h-4" />
                                )}
                                <span>Balas</span>
                            </button>
                          </form>
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