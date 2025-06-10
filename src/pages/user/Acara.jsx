import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Bell, Loader2, AlertCircle, Clock, Phone, Link, Info } from 'lucide-react';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';

export default function Acara() {
  const navigate = useNavigate();
  const [acara, setAcara] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchAcaraData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('acara_pembersihan')
        .select('*')
        .order('tanggal', { ascending: true });

      if (fetchError) {
        console.error('Error fetching acara:', fetchError);
        throw fetchError;
      }
      setAcara(data || []);
    } catch (err) {
      setError('Gagal memuat acara: ' + (err.message || 'Unknown error'));
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
      await fetchAcaraData();
    };

    initializePage();
  }, [navigate, fetchAcaraData]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return format(date, 'dd MMMMyyyy', { locale: id });
    } catch (e) {
      console.error("Failed to format date:", e);
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const handleRegisterClick = (link) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      alert('Link pendaftaran belum tersedia untuk acara ini.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white flex flex-col relative overflow-hidden">
         <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderUser />
      </div>
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
                onClick={() => fetchAcaraData()}
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
                <Calendar className="w-10 h-10 text-cyan-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
                Partisipasi Acara Pembersihan
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Ikuti acara pembersihan sungai yang dikelola oleh komunitas kami.
              </p>
            </div>

         
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
                      <p className="text-gray-400">Belum ada acara yang dikonfirmasi saat ini.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {acara.map((item, index) => {
                        return (
                          <div
                            key={item.id || index}
                            className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:from-gray-800/70 hover:to-gray-800/50 hover:border-gray-600/70 transition-all duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               {item.poster_url && (
                                <div className="md:col-span-1 flex justify-center items-center">
                                    <img 
                                        src={item.poster_url} 
                                        alt={`Poster ${item.judul}`} 
                                        className="max-h-48 w-full object-contain rounded-lg shadow-md border border-gray-700/50" 
                                    />
                                </div>
                               )}
                               <div className={`${item.poster_url ? 'md:col-span-2' : 'md:col-span-3'} flex flex-col justify-between`}>
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-white flex items-center mb-2">
                                        <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
                                        {item.judul}
                                    </h3>
                                    <p className="text-gray-300 mt-1">{item.deskripsi}</p>
                                </div>
                                <div className="text-sm text-gray-300 space-y-1">
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-emerald-400" />
                                        <span>{item.lokasi}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                                        <span>{formatDate(item.tanggal)}</span>
                                    </div>
                                    {item.waktu && (
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2 text-orange-400" />
                                            <span>Pukul {item.waktu.substring(0, 5)} WIB</span>
                                        </div>
                                    )}
                                    {item.no_cp && (
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 mr-2 text-purple-400" />
                                            <span>Kontak: {item.no_cp}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    {item.link_pendaftaran ? (
                                        <button
                                            onClick={() => handleRegisterClick(item.link_pendaftaran)}
                                            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-sm font-medium text-white hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2"
                                            aria-label={`Daftar untuk acara ${item.judul}`}
                                        >
                                            <Link className="w-4 h-4" />
                                            <span>Daftar Sekarang</span>
                                        </button>
                                    ) : (
                                        <span className="w-full px-4 py-2 bg-gray-700/50 rounded-lg text-sm font-medium text-gray-400 flex items-center justify-center space-x-2">
                                            <Info className="w-4 h-4" />
                                            <span>Link Belum Tersedia</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                            </div>
                          </div>
                        );
                      })}
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