import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Bell, Loader2, AlertCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';


export default function Acara() {
  const navigate = useNavigate();
  const [acara, setAcara] = useState([]);
  const [formData, setFormData] = useState({
    judul: '',
    lokasi: '',
    tanggal: '',
    deskripsi: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('acara_pembersihan')
          .select('*')
          .order('tanggal', { ascending: true });

        if (fetchError) throw fetchError;

        setAcara(data || []);
      } catch (err) {
        setError('Gagal memuat acara: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: insertError } = await supabase.from('acara_pembersihan').insert({
        judul: formData.judul,
        lokasi: formData.lokasi,
        tanggal: formData.tanggal,
        deskripsi: formData.deskripsi,
        usulan_oleh: user.id,
        status: 'pending'
      });

      if (insertError) throw insertError;

      const newEvent = {
        judul: formData.judul,
        lokasi: formData.lokasi,
        tanggal: formData.tanggal,
        deskripsi: formData.deskripsi,
        usulan_oleh: user.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        participants: 0
      };
      setAcara([newEvent, ...acara]);
      setFormData({ judul: '', lokasi: '', tanggal: '', deskripsi: '' });
    } catch (err) {
      setError('Gagal mengusulkan acara: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinEvent = (eventId) => {
    console.log(`Joining event with ID: ${eventId}`);
  };

  // Fallback date formatting
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

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
                <Calendar className="w-10 h-10 text-cyan-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
                Partisipasi Acara Pembersihan
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Ikuti atau usulkan acara pembersihan sungai untuk menjaga lingkungan
              </p>
            </div>

            {/* Notification Toggle */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-2xl mb-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-6 h-6 text-cyan-300 mr-2" />
                  <h2 className="text-xl font-bold text-cyan-300">Notifikasi Acara</h2>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                    className="sr-only peer"
                    aria-label="Aktifkan notifikasi acara"
                  />
                  <div className="w-11 h-6 bg-gray-700/50 rounded-full peer-checked:bg-cyan-600/50 transition-all duration-300"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-gray-300 rounded-full peer-checked:bg-cyan-300 peer-checked:translate-x-5 transition-all duration-300"></div>
                </label>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Aktifkan notifikasi untuk mendapatkan pengingat tentang acara terdekat
              </p>
            </div>

            {/* Form Section */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl mb-12">
              <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center">
                <Send className="w-6 h-6 mr-2" />
                Usulkan Acara Baru
              </h2>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="group">
                    <label className="flex items-center text-gray-300 font-semibold mb-3">
                      <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
                      Judul *
                    </label>
                    <input
                      type="text"
                      name="judul"
                      value={formData.judul}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 focus:bg-gray-800/70 transition-all duration-300 group-hover:border-gray-500/70"
                      required
                      placeholder="Contoh: Bersih-bersih Sungai Citarum"
                      aria-label="Judul Acara"
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
                      placeholder="Contoh: Bandung"
                      aria-label="Lokasi Acara"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="group">
                    <label className="flex items-center text-gray-300 font-semibold mb-3">
                      <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                      Tanggal *
                    </label>
                    <input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-white focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-gray-800/70 transition-all duration-300 group-hover:border-gray-500/70"
                      required
                      aria-label="Tanggal Acara"
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center text-gray-300 font-semibold mb-3">
                      <Send className="w-5 h-5 mr-2 text-orange-400" />
                      Deskripsi
                    </label>
                    <textarea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:bg-gray-800/70 transition-all duration-300 group-hover:border-gray-500/70 resize-none"
                      rows="4"
                      placeholder="Jelaskan detail acara pembersihan..."
                      aria-label="Deskripsi Acara"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-8 py-4 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 rounded-2xl text-cyan-200 font-bold hover:from-cyan-600/40 hover:to-blue-600/40 hover:border-cyan-400/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 group"
                    aria-label={submitting ? "Mengusulkan Acara" : "Usulkan Acara"}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Mengusulkan Acara...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Usulkan Acara</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Events Section */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                Jadwal Acara Pembersihan
              </h2>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-cyan-300 animate-spin mb-4" />
                  <p className="text-gray-300 text-lg">Memuat acara...</p>
                </div>
              ) : (
                <div>
                  {acara.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Belum ada acara.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {acara.map((item, index) => (
                        <div
                          key={item.id || index} // Fallback key for unsaved events
                          className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:from-gray-800/70 hover:to-gray-800/50 hover:border-gray-600/70 transition-all duration-500"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-white flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
                                {item.judul}
                              </h3>
                              <div className="flex items-center text-gray-300 mt-2">
                                <MapPin className="w-4 h-4 mr-2 text-emerald-400" />
                                <span>{item.lokasi}</span>
                              </div>
                              <div className="flex items-center text-gray-300 mt-1">
                                <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                                <span>{formatDate(item.tanggal)}</span>
                              </div>
                              <p className="text-gray-300 mt-2">{item.deskripsi}</p>
                              {item.participants > 0 && (
                                <p className="text-gray-400 text-sm mt-2">
                                  Peserta: {item.participants}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${
                                item.status === 'confirmed'
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              }`}>
                                {item.status === 'confirmed' ? 'Terkonfirmasi' : 'Menunggu'}
                              </span>
                              <button
                                onClick={() => handleJoinEvent(item.id)}
                                className="mt-3 px-4 py-2 bg-gradient-to-r from-cyan-700/20 to-blue-700/20 border border-cyan-800 rounded-lg text-sm font-medium text-cyan-300 hover:bg-cyan-700/30 transition-all duration-300"
                                aria-label={`Daftar untuk acara ${item.judul}`}
                              >
                                Daftar Sekarang
                              </button>
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