import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Camera, Trash2, Brush, Users, Star, Loader2, AlertCircle, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';



export default function Tantangan() {
  const navigate = useNavigate();
  const [tantangan, setTantangan] = useState([]);
  const [partisipasi, setPartisipasi] = useState([]);
  const [formData, setFormData] = useState({});
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Mock data for demonstration
        const mockTantangan = [
          { id: 1, judul: 'Foto Kreatif', deskripsi: 'Unggah foto aksi pembersihan dengan pose unik.', poin: 50, type: 'photo' },
          { id: 2, judul: 'Kumpulkan 5 Sampah Unik', deskripsi: 'Laporkan 5 jenis sampah berbeda.', poin: 75, type: 'waste', progress: 3 },
          { id: 3, judul: 'Desain Poster Edukasi', deskripsi: 'Buat poster tentang menjaga sungai.', poin: 100, type: 'poster', votes: 42 },
          { id: 4, judul: 'Misi Tim Sungai', deskripsi: 'Kumpulkan 10 kg sampah atau bersihkan 3 titik sungai.', poin: 150, type: 'team', progress: 7 },
          { id: 5, judul: 'Quest Harian', deskripsi: 'Selesaikan quest harian untuk naik level.', poin: 25, type: 'daily', level: 2 },
        ];
        const mockPartisipasi = [
          { id: 1, user_id: user.id, tantangan_id: 1, submission_url: 'https://via.placeholder.com/150', status: 'menunggu', created_at: '2025-06-01T10:00:00Z' },
          { id: 2, user_id: user.id, tantangan_id: 3, submission_url: 'https://via.placeholder.com/150', status: 'disetujui', created_at: '2025-06-02T14:00:00Z' },
        ];

        setTantangan(mockTantangan);
        setPartisipasi(mockPartisipasi);
      } catch (err) {
        setError('Gagal memuat tantangan: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e, tantanganId) => {
    const { files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [tantanganId]: files[0] }));
      setPreviews((prev) => ({ ...prev, [tantanganId]: URL.createObjectURL(files[0]) }));
    }
  };

  const handleSubmit = async (e, tantanganId) => {
    e.preventDefault();
    setSubmitting((prev) => ({ ...prev, [tantanganId]: true }));
    setError(null);
    try {
      const file = formData[tantanganId];
      let submissionUrl = null;
      if (file) {
        const { data, error: uploadError } = await supabase.storage
          .from('tantangan')
          .upload(`${Date.now()}_${file.name}`, file);
        if (uploadError) throw uploadError;
        submissionUrl = supabase.storage.from('tantangan').getPublicUrl(data.path).data.publicUrl;
      }

      const { data: user } = await supabase.auth.getUser();
      const { error: insertError } = await supabase.from('partisipasi_tantangan').insert({
        user_id: user.id,
        tantangan_id: tantanganId,
        submission_url: submissionUrl,
        status: 'menunggu',
      });

      if (insertError) throw insertError;

      const newPartisipasi = {
        user_id: user.id,
        tantangan_id: tantanganId,
        submission_url: submissionUrl,
        status: 'menunggu',
        created_at: new Date().toISOString(),
      };
      setPartisipasi([newPartisipasi, ...partisipasi]);
      setFormData((prev) => ({ ...prev, [tantanganId]: null }));
      setPreviews((prev) => ({ ...prev, [tantanganId]: null }));
    } catch (err) {
      setError('Gagal mengirim partisipasi: ' + err.message);
    } finally {
      setSubmitting((prev) => ({ ...prev, [tantanganId]: false }));
    }
  };

  const handleVote = (tantanganId) => {
    console.log(`Voting for challenge ID: ${tantanganId}`);
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
                <Trophy className="w-10 h-10 text-cyan-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
                Tantangan Pahlawan Sungai
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Ikuti tantangan seru untuk menjaga sungai, raih poin, dan dapatkan badge eksklusif!
              </p>
            </div>

            {/* Challenges Section */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl mb-12">
              <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center">
                <Trophy className="w-6 h-6 mr-2" />
                Daftar Tantangan
              </h2>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-cyan-300 animate-spin mb-4" />
                  <p className="text-gray-300 text-lg">Memuat tantangan...</p>
                </div>
              ) : (
                <div>
                  {tantangan.length === 0 ? (
                    <div className="text-center py-12">
                      <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Belum ada tantangan.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {tantangan.map((item, index) => (
                        <div
                          key={item.id}
                          className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:from-gray-800/70 hover:to-gray-800/50 hover:border-gray-600/70 transition-all duration-500"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white flex items-center">
                                {item.type === 'photo' && <Camera className="w-5 h-5 mr-2 text-cyan-400" />}
                                {item.type === 'waste' && <Trash2 className="w-5 h-5 mr-2 text-emerald-400" />}
                                {item.type === 'poster' && <Brush className="w-5 h-5 mr-2 text-blue-400" />}
                                {item.type === 'team' && <Users className="w-5 h-5 mr-2 text-orange-400" />}
                                {item.type === 'daily' && <Star className="w-5 h-5 mr-2 text-yellow-400" />}
                                {item.judul}
                              </h3>
                              <p className="text-gray-300 mt-2">{item.deskripsi}</p>
                              <p className="text-gray-300 mt-1">Poin: {item.poin}</p>
                              {item.type === 'waste' && (
                                <div className="mt-3">
                                  <p className="text-gray-400 text-sm">Progres: {item.progress}/5 Sampah</p>
                                  <div className="w-full bg-gray-700/50 rounded-full h-2.5 mt-1">
                                    <div
                                      className="bg-emerald-500/50 h-2.5 rounded-full"
                                      style={{ width: `${(item.progress / 5) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              {item.type === 'team' && (
                                <div className="mt-3">
                                  <p className="text-gray-400 text-sm">Progres: {item.progress}/10 kg</p>
                                  <div className="w-full bg-gray-700/50 rounded-full h-2.5 mt-1">
                                    <div
                                      className="bg-orange-500/50 h-2.5 rounded-full"
                                      style={{ width: `${(item.progress / 10) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              {item.type === 'daily' && (
                                <p className="text-gray-400 text-sm mt-2">Level: {item.level}</p>
                              )}
                              {item.type === 'poster' && (
                                <div className="mt-3 flex items-center">
                                  <p className="text-gray-400 text-sm mr-2">Vote: {item.votes}</p>
                                  <button
                                    onClick={() => handleVote(item.id)}
                                    className="px-3 py-1 bg-blue-700/20 border border-blue-800 rounded-lg text-sm text-blue-300 hover:bg-blue-700/30 transition-all duration-300"
                                    aria-label={`Vote untuk ${item.judul}`}
                                  >
                                    Vote
                                  </button>
                                </div>
                              )}
                            </div>
                            {(item.type === 'photo' || item.type === 'poster') && (
                              <form onSubmit={(e) => handleSubmit(e, item.id)} className="mt-4 sm:mt-0 w-full sm:w-auto">
                                <div className="group">
                                  <label className="flex items-center text-gray-300 font-semibold mb-3">
                                    <Upload className="w-5 h-5 mr-2 text-cyan-400" />
                                    Unggah File
                                  </label>
                                  <input
                                    type="file"
                                    name={`submission-${item.id}`}
                                    onChange={(e) => handleInputChange(e, item.id)}
                                    accept="image/*"
                                    className="w-full p-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-white focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 focus:bg-gray-800/70 transition-all duration-300 group-hover:border-gray-500/70"
                                    aria-label={`Unggah file untuk ${item.judul}`}
                                  />
                                </div>
                                {previews[item.id] && (
                                  <img
                                    src={previews[item.id]}
                                    alt="Preview"
                                    className="mt-3 w-32 h-32 object-cover rounded-lg border border-gray-600/50"
                                  />
                                )}
                                <button
                                  type="submit"
                                  disabled={submitting[item.id] || !formData[item.id]}
                                  className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 rounded-lg text-cyan-200 font-medium hover:from-cyan-600/40 hover:to-blue-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                  aria-label={submitting[item.id] ? "Mengirim Partisipasi" : `Kirim Partisipasi untuk ${item.judul}`}
                                >
                                  {submitting[item.id] ? (
                                    <>
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                      <span>Mengirim...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-5 h-5" />
                                      <span>Kirim Partisipasi</span>
                                    </>
                                  )}
                                </button>
                              </form>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Participation History Section */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center">
                <Star className="w-6 h-6 mr-2" />
                Riwayat Partisipasi Anda
              </h2>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-cyan-300 animate-spin mb-4" />
                  <p className="text-gray-300 text-lg">Memuat partisipasi...</p>
                </div>
              ) : (
                <div>
                  {partisipasi.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Belum ada partisipasi.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {partisipasi.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:from-gray-800/70 hover:to-gray-800/50 hover:border-gray-600/70 transition-all duration-500"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-bold text-white">Tantangan ID: {item.tantangan_id}</h3>
                              <p className="text-gray-300 mt-2">Status: {item.status === 'disetujui' ? 'Disetujui' : 'Menunggu'}</p>
                              <p className="text-gray-400 text-sm mt-1">
                                Tanggal: {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                            {item.submission_url && (
                              <img
                                src={item.submission_url}
                                alt="Submission"
                                className="w-32 h-32 object-cover rounded-lg border border-gray-600/50"
                              />
                            )}
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