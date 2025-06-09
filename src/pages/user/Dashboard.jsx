import { useState, useEffect } from 'react';
import { 
  Droplets, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Trophy, 
  MessageCircle, 
  Camera, 
  Filter,
  Bell,
  User,
  Settings,
  Award,
  TrendingUp,
  Clock,
  Users,
  ChevronRight,
  Plus,
  Target,
  Zap
} from 'lucide-react';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';
import { supabase } from '../../lib/supabase';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [scrollY, setScrollY] = useState(0);
  const [userStats, setUserStats] = useState({ reports: 0, points: 0, rank: 0, eventsJoined: 0, badges: 0 });
  const [recentReports, setRecentReports] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [userName, setUserName] = useState('User'); // State baru untuk nama user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    fetchUserData();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Ambil user yang sedang login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userId = user.id;

      // Ambil nama user dari email
      const userEmail = user.email?.split('@')[0] || 'User';
      setUserName(userEmail);

      // Ambil stats dari tabel users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single();
      if (userError) throw userError;

      // Ambil jumlah laporan dari laporan_pencemaran
      const { data: reportData, error: reportError, count: reportCount } = await supabase
        .from('laporan_pencemaran')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);
      if (reportError) throw reportError;

      // Ambil jumlah event yang diikuti dari pendaftaran_acara (status 'diterima')
      const { data: eventData, error: eventError, count: eventCount } = await supabase
        .from('pendaftaran_acara')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'diterima');
      if (eventError) throw eventError;

      // Ambil jumlah badges dari user_badges
      const { data: badgeData, error: badgeError, count: badgeCount } = await supabase
        .from('user_badges')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);
      if (badgeError) throw badgeError;

      // Hitung ranking berdasarkan points
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('points')
        .order('points', { ascending: false });
      if (allUsersError) throw allUsersError;
      const rank = allUsers.findIndex(u => u.points === userData.points) + 1 || 0;

      setUserStats({
        reports: reportCount || 0,
        points: userData.points,
        rank,
        eventsJoined: eventCount || 0,
        badges: badgeCount || 0
      });

      // Ambil recent reports dari laporan_pencemaran
      const { data: recentReportData, error: recentReportError } = await supabase
        .from('laporan_pencemaran')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      if (recentReportError) throw recentReportError;
      setRecentReports(recentReportData.map(report => ({
        ...report,
        time: new Date(report.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'long', year: 'numeric' })
      })));

      // Ambil upcoming events dari acara_pembersihan (status 'aktif' dan tanggal > sekarang)
      const { data: eventListData, error: eventListError } = await supabase
        .from('acara_pembersihan')
        .select('*')
        .eq('status', 'aktif')
        .gte('tanggal', new Date().toISOString().split('T')[0])
        .order('tanggal', { ascending: true })
        .limit(3);
      if (eventListError) throw eventListError;
      setUpcomingEvents(eventListData);

      // Ambil challenges dari tantangan (status 'aktif' dan tanggal_selesai > sekarang)
      const { data: challengeData, error: challengeError } = await supabase
        .from('tantangan')
        .select('*')
        .eq('status', 'aktif')
        .gte('tanggal_selesai', new Date().toISOString().split('T')[0])
        .order('tanggal_selesai', { ascending: true })
        .limit(3);
      if (challengeError) throw challengeError;
      const userChallenges = await Promise.all(challengeData.map(async (challenge) => {
        const { data: participation, error: partError } = await supabase
          .from('partisipasi_tantangan')
          .select('status, poin_diperoleh')
          .eq('user_id', userId)
          .eq('tantangan_id', challenge.id)
          .single();
        return {
          ...challenge,
          progress: participation?.poin_diperoleh || 0,
          deadline: `${Math.ceil((new Date(challenge.tanggal_selesai) - new Date()) / (1000 * 60 * 60 * 24))} hari`
        };
      }));
      setChallenges(userChallenges);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-950 text-white relative overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-emerald-900/30">
        <div className="absolute top-10 left-10 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <HeaderUser />

      <div className="pt-24 relative z-10">
        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Selamat datang, <span className="text-gold-300">{userName}</span>!
              </h1>
              <p className="text-lg md:text-xl text-gray-300">Mari lanjutkan misi menyelamatkan sungai Indonesia 🌊</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
              {[
                { label: "Laporan", value: userStats.reports, icon: Camera, color: "from-red-700/20 to-orange-700/20", iconColor: "text-red-400" },
                { label: "Poin", value: userStats.points, icon: Zap, color: "from-yellow-700/20 to-orange-700/20", iconColor: "text-yellow-400" },
                { label: "Ranking", value: `#${userStats.rank}`, icon: Trophy, color: "from-emerald-700/20 to-green-700/20", iconColor: "text-emerald-400" },
                { label: "Event", value: userStats.eventsJoined, icon: Calendar, color: "from-blue-700/20 to-cyan-700/20", iconColor: "text-blue-400" },
                { label: "Badge", value: userStats.badges, icon: Award, color: "from-purple-700/20 to-pink-700/20", iconColor: "text-purple-400" }
              ].map((stat, index) => (
                <div key={index} className={`bg-${stat.color} backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-7 h-7 ${stat.iconColor} transition-transform hover:rotate-12`} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg">
                  <h2 className="text-2xl font-extrabold mb-6 flex items-center text-cyan-300">
                    <Target className="w-7 h-7 mr-3" />
                    Aksi Cepat
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { title: "📸 Laporkan Pencemaran", desc: "Upload foto dan lokasi pencemaran", color: "from-red-700/20 to-orange-700/20" },
                      { title: "🗺️ Lihat Peta Sungai", desc: "Eksplorasi kondisi sungai real-time", color: "from-blue-700/20 to-cyan-700/20" },
                      { title: "📅 Daftar Event", desc: "Ikuti pembersihan sungai terdekat", color: "from-emerald-700/20 to-green-700/20" }
                    ].map((action, index) => (
                      <button key={index} className={`group bg-${action.color} backdrop-blur-md border border-gray-800 rounded-xl p-6 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                        <h3 className="font-semibold mb-2 text-white">{action.title}</h3>
                        <p className="text-sm text-gray-400 mb-4">{action.desc}</p>
                        <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold flex items-center text-cyan-300">
                      <Camera className="w-7 h-7 mr-3" />
                      Laporan Terbaru
                    </h2>
                    <button className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition">Lihat Semua</button>
                  </div>
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div key={report.id} className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-300 shadow-md hover:shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{report.lokasi}</h3>
                            <p className="text-sm text-gray-400">{report.jenis_sampah}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'diverifikasi' ? 'bg-green-500/20 text-green-400' :
                            report.status === 'menunggu' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{report.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold flex items-center text-cyan-300">
                      <Calendar className="w-7 h-7 mr-3" />
                      Event Mendatang
                    </h2>
                    <button className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition">Lihat Semua</button>
                  </div>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-300 shadow-md hover:shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{event.judul}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                              <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{new Date(event.tanggal).toLocaleDateString('id-ID')}</span>
                              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{event.lokasi}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Users className="w-4 h-4 mr-1" />
                            {event.participants || 0}
                          </div>
                        </div>
                        <button className="mt-3 px-4 py-2 bg-gradient-to-r from-cyan-700/20 to-blue-700/20 border border-cyan-800 rounded-lg text-sm font-medium text-cyan-300 hover:bg-cyan-700/30 transition-all duration-300">
                          Daftar Sekarang
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-extrabold mb-6 flex items-center text-cyan-300">
                    <Trophy className="w-6 h-6 mr-2" />
                    Tantangan Aktif
                  </h2>
                  <div className="space-y-4">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-4 shadow-md hover:shadow-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-white text-sm">{challenge.judul}</h3>
                            <p className="text-xs text-gray-400 mt-1">{challenge.poin} poin</p>
                          </div>
                          <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
                            {challenge.deadline}
                          </span>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{challenge.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${challenge.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-extrabold mb-6 flex items-center text-cyan-300">
                    <TrendingUp className="w-6 h-6 mr-2" />
                    Leaderboard
                  </h2>
                  <div className="space-y-3">
                    {[
                      { name: "Sarah K.", points: 3200, rank: 1 },
                      { name: "Budi S.", points: 2800, rank: 2 },
                      { name: "Andi P.", points: 2450, rank: 3, isUser: true },
                      { name: "Rina M.", points: 2100, rank: 4 },
                      { name: "Dani L.", points: 1900, rank: 5 }
                    ].map((user) => (
                      <div key={user.rank} className={`flex items-center justify-between p-3 rounded-xl ${user.isUser ? 'bg-gradient-to-r from-cyan-700/20 to-blue-700/20 border border-cyan-800' : 'bg-gray-800/50'}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            user.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                            user.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                            user.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-600/20 text-gray-400'
                          }`}>
                            {user.rank}
                          </div>
                          <span className="font-medium text-white">{user.name}</span>
                        </div>
                        <span className="text-sm text-cyan-300 font-medium">{user.points}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-extrabold flex items-center text-cyan-300">
                      <MessageCircle className="w-6 h-6 mr-2" />
                      Forum Diskusi
                    </h2>
                    <button className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition">Lihat Forum</button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: "Tips membersihkan sampah plastik", replies: 23, time: "2j" },
                      { title: "Update Sungai Citarum", replies: 45, time: "5j" },
                      { title: "Event Jakarta Besok", replies: 12, time: "1h" }
                    ].map((topic, index) => (
                      <div key={index} className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-all cursor-pointer shadow-md hover:shadow-lg">
                        <h3 className="text-sm font-medium text-white mb-1">{topic.title}</h3>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{topic.replies} balasan</span>
                          <span>{topic.time}</span>
                        </div>
                      </div>
                    ))}
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