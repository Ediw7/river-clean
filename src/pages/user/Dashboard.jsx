import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';
import { 
  FileText, Users, Calendar, Heart, MessageCircle, MapPin, Loader2, AlertCircle, 
  ChevronRight, Phone, GitBranch, Star, Sparkles, Crown, Clock 
} from 'lucide-react'; 

export default function UserDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userStats, setUserStats] = useState({
    namaLengkap: 'Pengguna',
    totalLaporanDiverifikasi: 0,
    totalAcara: 0,
    companionLevel: 0,
    companionExp: 0,
    companionNama: '',
    companionJenis: '', 
    companionKesehatan: 0,
    totalPesanDigital: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentForumTopics, setRecentForumTopics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);
      const userId = user.id;

      // --- Ambil Data User Utama ---
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('nama, email') 
        .eq('id', userId)
        .single();
      if (userError) throw userError;

      const namaLengkap = userData.nama || userData.email?.split('@')[0] || 'Pengguna';

      const [
        laporanResponse,
        acaraResponse,
        companionResponse,
        pesanDigitalResponse,
        recentReportResponse,
        upcomingEventsResponse,
        recentForumResponse
      ] = await Promise.allSettled([
        supabase.from('laporan_pencemaran').select('id', { count: 'exact' }).eq('user_id', userId).eq('status', 'diverifikasi'),
        supabase.from('acara_pembersihan').select('id', { count: 'exact' }),
        supabase.from('river_companion').select('nama, jenis, level, exp, kesehatan').eq('user_id', userId).single(),
        supabase.from('pesan_digital').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('laporan_pencemaran').select('id, lokasi, jenis_sampah, deskripsi, status, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
        supabase.from('acara_pembersihan').select('id, judul, lokasi, tanggal, waktu, no_cp, link_pendaftaran').gte('tanggal', new Date().toISOString().split('T')[0]).order('tanggal', { ascending: true }).limit(3),
        supabase.from('pesan_digital').select('id, pesan, created_at, sender_name, pesan_replies(id)').order('created_at', { ascending: false }).limit(3),
      ]);

      const getFulfilledResult = (response) => response.status === 'fulfilled' ? response.value : { data: null, count: 0, error: response.reason };
      const laporanResult = getFulfilledResult(laporanResponse);
      const acaraResult = getFulfilledResult(acaraResponse);
      const companionResult = getFulfilledResult(companionResponse);
      const pesanDigitalResult = getFulfilledResult(pesanDigitalResponse);
      const recentReportResult = getFulfilledResult(recentReportResponse);
      const upcomingEventsResult = getFulfilledResult(upcomingEventsResponse);
      const recentForumResult = getFulfilledResult(recentForumResponse);

      [laporanResult, acaraResult, companionResult, pesanDigitalResult, recentReportResult, upcomingEventsResult, recentForumResult].forEach(res => {
        if (res.error && res.error.code !== 'PGRST116') { 
            console.error('Partial data fetch error:', res.error);
        }
      });


      const totalLaporanDiverifikasi = laporanResult.count || 0;
      const totalAcara = acaraResult.count || 0;
      const totalPesanDigital = pesanDigitalResult.count || 0;

      const companionData = companionResult.data;
      const companionLevel = companionData?.level || 0;
      const companionExp = companionData?.exp || 0;
      const companionNama = companionData?.nama || 'Belum Adopsi';
      const companionJenis = companionData?.jenis || 'ikan'; 
      const companionKesehatan = companionData?.kesehatan || 0;

      const processedRecentReports = (recentReportResult.data || []).map(report => ({
        ...report,
        deskripsi: report.deskripsi?.substring(0, 70) + (report.deskripsi && report.deskripsi.length > 70 ? '...' : ''),
        time: new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      }));

      const processedUpcomingEvents = (upcomingEventsResult.data || []).map(event => ({
        ...event,
        tanggalDisplay: new Date(event.tanggal).toLocaleDateString('id-ID'),
        waktuDisplay: event.waktu ? `pukul ${event.waktu.substring(0,5)}` : '',
      }));

      const processedRecentForumTopics = (recentForumResult.data || []).map(topic => ({
        id: topic.id,
        title: topic.pesan?.substring(0, 50) + (topic.pesan && topic.pesan.length > 50 ? '...' : ''),
        replies: topic.pesan_replies ? topic.pesan_replies.length : 0,
        time: new Date(topic.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
      }));


      setUserStats({
        namaLengkap: namaLengkap,
        totalLaporanDiverifikasi: totalLaporanDiverifikasi,
        totalAcara: totalAcara, 
        totalPesanDigital: totalPesanDigital,
        companionLevel: companionLevel,
        companionExp: companionExp,
        companionNama: companionNama,
        companionJenis: companionJenis,
        companionKesehatan: companionKesehatan,
      });

      setRecentReports(processedRecentReports);
      setUpcomingEvents(processedUpcomingEvents);
      setRecentForumTopics(processedRecentForumTopics);

    } catch (err) {
      setError('Gagal memuat data dashboard: ' + err.message);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getHealthColor = (health) => {
    if (health >= 70) return 'bg-green-500';
    if (health >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-950 text-white flex flex-col relative overflow-x-hidden">
        <HeaderUser />
        <div className="flex flex-1 items-center justify-center pt-24">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-cyan-300 animate-spin mb-4" />
            <p className="text-gray-300 text-lg">Memuat data kontribusi Anda...</p>
          </div>
        </div>
        <FooterUser />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-950 text-white flex flex-col relative overflow-x-hidden">
        <HeaderUser />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        <div className="flex flex-1 items-center justify-center pt-24">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl z-10 max-w-md mx-4">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-300 mb-4">Terjadi Kesalahan</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={() => { setError(null); fetchDashboardData(); }}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-950 text-white flex flex-col relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-emerald-900/30">
        <div className="absolute top-10 left-10 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <HeaderUser />

      <div className="pt-24 relative z-10">
        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Selamat Datang */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Selamat datang, <span className="text-yellow-300">{userStats.namaLengkap}</span>!
              </h1>
              <p className="text-lg md:text-xl text-gray-300">Mari lanjutkan misi menyelamatkan sungai Indonesia 🌊</p>
            </div>

            {/* Statistik Utama */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12"> 
              {[
                { label: "Laporan", value: userStats.totalLaporanDiverifikasi, icon: FileText, color: "from-blue-500 to-cyan-500", iconColor: "text-white" },
                { label: "Event", value: userStats.totalAcara, icon: Calendar, color: "from-purple-500 to-indigo-500", iconColor: "text-white" }, 
                { label: "Pesan Digital", value: userStats.totalPesanDigital, icon: MessageCircle, color: "from-pink-500 to-rose-500", iconColor: "text-white" } 
              ].map((stat, index) => (
                <div key={index} className={`bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Box Kiri (Companion & Laporan Terbaru) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Companion Card */}
                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold flex items-center text-cyan-300">
                      <Heart className="w-7 h-7 mr-3" />
                      River Companion Anda
                    </h2>
                    <button onClick={() => navigate('/companion')} className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition">Lihat Companion</button>
                  </div>
                  {userStats.companionLevel > 0 ? (
                    <div className="flex items-center gap-4">
                      <div className={`w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center text-5xl bg-gradient-to-br ${userStats.companionJenis === 'ikan' ? 'from-blue-400 to-blue-600' : 'from-green-400 to-green-600'} shadow-lg`}>
                        {userStats.companionJenis === 'ikan' ? '🐟' : '🐸'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{userStats.companionNama}</h3>
                        <p className="text-gray-400 text-sm mb-2">Level {userStats.companionLevel} • {userStats.companionJenis}</p>
                        <div className="w-full bg-gray-700/50 rounded-full h-2 mb-1">
                          <div
                            className={`h-2 rounded-full ${getHealthColor(userStats.companionKesehatan)} transition-all duration-500`}
                            style={{ width: `${userStats.companionKesehatan}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400">Kesehatan: {userStats.companionKesehatan}%</p>
                        <div className="w-full bg-gray-700/50 rounded-full h-1 mt-2">
                          <div
                            className="h-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${(userStats.companionExp / 50) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400">EXP: {userStats.companionExp}/50</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <Fish className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400">Belum memiliki Companion. <button onClick={() => navigate('/companion')} className="text-cyan-400 hover:underline">Adopsi sekarang!</button></p>
                    </div>
                  )}
                </div>

                {/* Laporan Terbaru Anda */}
                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold flex items-center text-cyan-300">
                      <FileText className="w-7 h-7 mr-3" />
                      Laporan Terbaru Anda
                    </h2>
                    <button onClick={() => navigate('/laporan')} className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition">Lihat Semua</button>
                  </div>
                  <div className="space-y-4">
                    {recentReports.length === 0 ? (
                      <p className="text-gray-400 text-center">Belum ada laporan terbaru dari Anda.</p>
                    ) : (
                      recentReports.map((report) => (
                        <div key={report.id} className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-300 shadow-md">
                          <h3 className="font-semibold text-white">{report.lokasi} - {report.jenis_sampah}</h3>
                          <p className="text-sm text-gray-400">{report.deskripsi?.substring(0, 70)}...</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              report.status === 'diverifikasi' ? 'bg-green-500/20 text-green-400' :
                              report.status === 'menunggu' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {report.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(report.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Box Kanan (Event, Forum) */}
              <div className="space-y-8">
                {/* Event Mendatang */}
                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold flex items-center text-cyan-300">
                      <Calendar className="w-7 h-7 mr-3" />
                      Event Mendatang
                    </h2>
                    <button onClick={() => navigate('/acara')} className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition">Lihat Semua</button>
                  </div>
                  <div className="space-y-4">
                    {upcomingEvents.length === 0 ? (
                      <p className="text-gray-400 text-center">Tidak ada event mendatang.</p>
                    ) : (
                      upcomingEvents.map((event) => (
                        <div key={event.id} className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-300 shadow-md">
                          <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{event.judul}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{event.tanggalDisplay} {event.waktuDisplay}</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{event.lokasi}</span>
                          </div>
                          {event.no_cp && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Kontak: {event.no_cp}</p>}
                          {event.link_pendaftaran && <a href={event.link_pendaftaran} target="_blank" rel="noopener noreferrer" className="mt-2 text-cyan-400 hover:underline text-xs flex items-center gap-1">Daftar <ChevronRight className="w-3 h-3"/></a>}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Forum Diskusi Terbaru */}
                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-extrabold flex items-center text-cyan-300">
                      <MessageCircle className="w-6 h-6 mr-2" />
                      Forum Diskusi Terbaru
                    </h2>
                    <button onClick={() => navigate('/pesandigital')} className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition">Lihat Forum</button>
                  </div>
                  <div className="space-y-3">
                    {recentForumTopics.length === 0 ? (
                      <p className="text-gray-400 text-center">Belum ada topik forum terbaru.</p>
                    ) : (
                      recentForumTopics.map((topic) => (
                        <div key={topic.id} className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-all cursor-pointer shadow-md">
                          <h3 className="text-sm font-medium text-white mb-1">{topic.title}</h3>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{topic.replies} balasan</span>
                            <span>{topic.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <FooterUser />
    </div>
  );
}