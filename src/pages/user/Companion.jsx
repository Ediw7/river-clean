import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Sparkles, Fish, Gift, Activity, Crown, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';

export default function Companion() {
  const navigate = useNavigate();
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFeeding, setIsFeeding] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [adopsiModal, setAdopsiModal] = useState({ open: false, nama: '', jenis: 'ikan' });
  const [adopsiLoading, setAdopsiLoading] = useState(false);
  const [adopsiError, setAdopsiError] = useState(null);

  const fetchCompanionData = useCallback(async (userId) => {
    if (!userId) {
      setLoading(false);
      setCompanion(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('river_companion')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
          setCompanion(null);
      } else if (fetchError) {
          throw fetchError;
      } else {
          setCompanion(data);
      }
    } catch (err) {
      setError('Gagal memuat companion: ' + (err.message || 'Unknown error'));
      console.error('Error fetching companion:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);
      await fetchCompanionData(user.id);
    };

    initializePage();
  }, [navigate, fetchCompanionData]);

  const handleAdopsiSubmit = async (e) => {
    e.preventDefault();
    setAdopsiLoading(true);
    setAdopsiError(null);

    if (!adopsiModal.nama.trim()) {
        setAdopsiError('Nama companion wajib diisi.');
        setAdopsiLoading(false);
        return;
    }
    if (adopsiModal.nama.trim().length < 3) { // Validasi nama minimal 3 karakter
        setAdopsiError('Nama companion minimal 3 karakter.');
        setAdopsiLoading(false);
        return;
    }

    try {
      if (companion && !window.confirm('Adopsi companion baru akan menggantikan yang lama. Lanjutkan?')) {
        setAdopsiLoading(false);
        return;
      }

      if (companion) {
          const { error: deleteError } = await supabase
            .from('river_companion')
            .delete()
            .eq('user_id', currentUser.id);
          if (deleteError) {
              console.warn('Gagal menghapus companion lama:', deleteError.message);
          }
      }

      const newCompanionData = {
        user_id: currentUser.id,
        nama: adopsiModal.nama.trim(),
        jenis: adopsiModal.jenis,
        kesehatan: 0,
        level: 1,
        exp: 0,
        // emoticon dan warna dihapus
        last_activity: new Date().toISOString(),
      };
      const { data: insertedCompanion, error: insertError } = await supabase
        .from('river_companion')
        .insert([newCompanionData])
        .select()
        .single();

      if (insertError) throw insertError;

      setCompanion(insertedCompanion);
      alert('Selamat! Anda telah mengadopsi companion baru!');
      setAdopsiModal({ open: false, nama: '', jenis: 'ikan' });

    } catch (err) {
      setAdopsiError('Gagal mengadopsi companion: ' + (err.message || 'Unknown error'));
      console.error('Adoption error:', err);
    } finally {
      setAdopsiLoading(false);
    }
  };

  const handlePerawatan = async () => {
    const EXP_TO_NEXT_LEVEL_DISPLAY = 500; 
    const EXP_FROM_CARE = 10; 

    if (!companion || isFeeding || companion.kesehatan >= 100) return;
    setIsFeeding(true);
    setError(null);

    const originalCompanion = { ...companion };

    const newKesehatanOptimistic = Math.min(companion.kesehatan + 20, 100);
    const newExpOptimistic = companion.exp + EXP_FROM_CARE; 
    let newLevelOptimistic = companion.level;
    let newExpRemainderOptimistic = newExpOptimistic;


    while (newExpRemainderOptimistic >= EXP_TO_NEXT_LEVEL_DISPLAY) {
        newLevelOptimistic += 1;
        newExpRemainderOptimistic -= EXP_TO_NEXT_LEVEL_DISPLAY;
    }

    setCompanion(prev => ({
        ...prev,
        kesehatan: newKesehatanOptimistic,
        exp: newExpRemainderOptimistic, 
        level: newLevelOptimistic,      
    }));

    try {
      const { error: updateError } = await supabase
        .from('river_companion')
        .update({
          kesehatan: newKesehatanOptimistic,
          exp: newExpOptimistic, 
          last_activity: new Date().toISOString(),
        })
        .eq('id', companion.id);

      if (updateError) throw updateError;

      alert('Companion berhasil dirawat! Kesehatan meningkat.');

      await fetchCompanionData(currentUser.id);

    } catch (err) {
      setError('Gagal merawat companion: ' + (err.message || 'Unknown error'));
      console.error('Care error:', err);
      setCompanion(originalCompanion); 
    } finally {
      setTimeout(() => setIsFeeding(false), 1500);
    }
  };

  const getHealthColor = (health) => {
    if (health >= 70) return 'bg-green-500';
    if (health >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHealthStatus = (health) => {
    if (health >= 80) return { text: 'Sangat Sehat', icon: '😊' };
    if (health >= 60) return { text: 'Sehat', icon: '🙂' };
    if (health >= 40) return { text: 'Kurang Sehat', icon: '😐' };
    if (health >= 20) return { text: 'Sakit', icon: '😷' };
    return { text: 'Sangat Sakit', icon: '😵' };
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
                onClick={() => { setError(null); fetchCompanionData(currentUser?.id); }}
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

      
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderUser />
      </div>

      <div className="flex flex-1 pt-24 relative z-10">
        <main className="p-6 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-md border border-cyan-400/30 rounded-2xl mb-6">
                <Fish className="w-10 h-10 text-cyan-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
                Sungai Virtual Pet
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Rawat teman virtual kamu di sungai yang bersih!
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-cyan-300 animate-spin mb-4" />
                <p className="text-gray-300 text-lg">Memuat companion...</p>
              </div>
            ) : companion ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="relative h-80 bg-gradient-to-b from-cyan-900/50 to-blue-900/50 overflow-hidden">
                      <div className="absolute inset-0">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-cyan-300 rounded-full opacity-60 animate-pulse"
                            style={{
                              left: `${20 + i * 15}%`,
                              top: `${60 + (i % 2) * 20}%`,
                              animationDelay: `${i * 0.5}s`,
                              animationDuration: '2s',
                            }}
                          />
                        ))}
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`w-32 h-32 rounded-full bg-gradient-to-br ${companion.jenis === 'ikan' ? 'from-blue-400 to-blue-600' : 'from-green-400 to-green-600'} 
                                    shadow-2xl flex items-center justify-center transform transition-all duration-300
                                    ${isFeeding ? 'scale-110 rotate-6' : 'hover:scale-105 animate-pulse'}`}
                        >
                          {/* Emoticon berdasarkan jenis */}
                          <span className="text-6xl">{companion.jenis === 'ikan' ? '🐟' : '🐸'}</span>
                          {companion.level >= 4 && <Crown className="absolute -top-2 -right-2 text-yellow-400" size={24} />}
                        </div>
                      </div>

                      {isFeeding && (
                        <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1 h-1 bg-orange-400 rounded-full animate-bounce"
                              style={{
                                left: `${i * 8}px`,
                                top: `${i % 2 === 0 ? '0' : '10'}px`,
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: '1s',
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-emerald-400/50 to-transparent opacity-60"></div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-cyan-300 flex items-center gap-2">
                          {companion.nama}
                          {companion.level >= 3 && <Sparkles className="text-yellow-400" size={20} />}
                        </h2>
                        <div className="flex items-center gap-1 bg-blue-900/50 px-3 py-1 rounded-full border border-blue-700/50">
                          <Star className="text-blue-300" size={16} />
                          <span className="font-semibold text-blue-200">Level {companion.level}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
                            <Heart className="text-red-400" size={16} />
                            Kesehatan
                          </span>
                          <span className="text-sm font-bold text-gray-200">
                            {getHealthStatus(companion.kesehatan).icon} {companion.kesehatan}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${getHealthColor(companion.kesehatan)} transition-all duration-500`}
                            style={{ width: `${companion.kesehatan}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{getHealthStatus(companion.kesehatan).text}</p>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
                            <Activity className="text-blue-400" size={16} />
                            Pengalaman
                          </span>
                          <span className="text-sm font-bold text-gray-200">{companion.exp}/500 EXP</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${(companion.exp / 500) * 100}%` }}
                          />
                        </div>
                      </div>

                      {companion.kesehatan < 30 && (
                        <div className="bg-red-900/50 border border-red-700/50 rounded-xl p-4 mb-4">
                          <p className="text-red-300 font-medium flex items-center gap-2">
                            <span className="text-2xl">🚨</span>
                            Companion kamu sakit! Rawat segera!
                          </p>
                        </div>
                      )}

                      <button
                        onClick={handlePerawatan}
                        disabled={companion.kesehatan >= 100 || isFeeding}
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform flex flex-col items-center
                                    ${companion.kesehatan >= 100 || isFeeding
                                       ? 'bg-gray-600/50 cursor-not-allowed border border-gray-700/50'
                                       : 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 hover:from-cyan-600/40 hover:to-blue-600/40 hover:scale-105 hover:shadow-xl'
                                    }`}
                        aria-label={isFeeding ? 'Memberi Makan' : 'Beri Makan & Rawat'}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Gift size={20} />
                          {isFeeding ? 'Memberi Makan...' : 'Beri Makan & Rawat'}
                        </div>
                        <div className="text-xs opacity-90 mt-1">+20 Kesehatan • +10 EXP</div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-cyan-300 mb-4">Statistik</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Jenis</span>
                        <span className="font-semibold capitalize text-gray-200">{companion.jenis}</span>
                      </div>
                      {/* Dihapus: Statistik Warna */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Level</span>
                        <span className="font-semibold text-gray-200">{companion.level}/5</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-cyan-400/30 rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-cyan-300 mb-3">💡 Tips Perawatan</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Beri makan secara teratur untuk menjaga kesehatan</li>
                      <li>• Kunjungi setiap hari agar companion tidak sakit</li>
                      <li>• Level akan naik setiap 50 EXP</li>
                      <li>• Warna akan berubah seiring level naik</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-8 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Fish size={40} className="text-cyan-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4">Belum Ada Companion</h2>
                  <p className="text-gray-400 mb-8">
                    Adopsi companion virtual pertama kamu dan mulai petualangan di sungai yang bersih!
                  </p>
                  <button
                    onClick={() => setAdopsiModal({ open: true, nama: '', jenis: 'ikan' })}
                    className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 rounded-xl text-cyan-200 font-semibold hover:from-cyan-600/40 hover:to-blue-600/40 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                    aria-label="Adopsi Companion"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Heart size={20} />
                      Adopsi Companion Sekarang
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <FooterUser />

      {/* Modal Adopsi */}
      {adopsiModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-cyan-300 mb-6 text-center">Adopsi Companion Baru</h2>
            <form onSubmit={handleAdopsiSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nama Companion *</label>
                <input
                  type="text"
                  value={adopsiModal.nama}
                  onChange={(e) => setAdopsiModal({ ...adopsiModal, nama: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                  placeholder="Beri nama companion kamu"
                  required
                />
                {adopsiError && adopsiError.includes('Nama') && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{adopsiError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Jenis</label>
                <select
                  value={adopsiModal.jenis}
                  onChange={(e) => setAdopsiModal({ ...adopsiModal, jenis: e.target.value })}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300"
                >
                  <option value="ikan">Ikan</option>
                  <option value="katak">Katak</option>
                </select>
              </div>
              {/* Warna dan Emoticon Dihapus dari Form Adopsi */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setAdopsiModal({ open: false, nama: '', jenis: 'ikan' })}
                  className="px-6 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-medium hover:bg-gray-600/50 transition-colors duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={adopsiLoading}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/50 rounded-lg text-white font-semibold hover:from-cyan-600/40 hover:to-blue-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {adopsiLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Heart size={16} />}
                  <span>Adopsi!</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}