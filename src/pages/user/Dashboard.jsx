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
import NavbarUser from '../../components/NavbarUser';


export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userStats = {
    reports: 12,
    points: 2450,
    rank: 3,
    eventsJoined: 8,
    badges: 15
  };

  const recentReports = [
    { id: 1, location: "Sungai Citarum", type: "Plastik", status: "Processed", time: "2 jam lalu" },
    { id: 2, location: "Sungai Ciliwung", type: "Minyak", status: "Under Review", time: "1 hari lalu" },
    { id: 3, location: "Sungai Brantas", type: "Limbah Industri", status: "Verified", time: "3 hari lalu" }
  ];

  const upcomingEvents = [
    { id: 1, title: "Bersih-bersih Sungai Citarum", date: "15 Jun 2025", location: "Bandung", participants: 45 },
    { id: 2, title: "Edukasi Lingkungan SMA 1", date: "18 Jun 2025", location: "Jakarta", participants: 120 },
    { id: 3, title: "Tanam Pohon Bantaran Sungai", date: "22 Jun 2025", location: "Surabaya", participants: 67 }
  ];

  const challenges = [
    { id: 1, title: "Kumpul 1kg Sampah", progress: 75, reward: "100 poin", deadline: "2 hari" },
    { id: 2, title: "Laporkan 5 Pencemaran", progress: 40, reward: "Badge Explorer", deadline: "5 hari" },
    { id: 3, title: "Ikuti 3 Event", progress: 66, reward: "200 poin", deadline: "1 minggu" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-cyan-950/30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">RiverClean</span>
            </div>
            
            <div className="flex items-center space-x-6">
                 <NavbarUser />

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell className="w-6 h-6 text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-md rounded-full px-4 py-2 border border-slate-700">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Andi Pratama</span>
                  <Settings className="w-4 h-4 text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 relative z-10">
        {/* Welcome Section */}
        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Selamat datang, <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Andi!</span>
              </h1>
              <p className="text-xl text-slate-400">Mari lanjutkan misi menyelamatkan sungai Indonesia 🌊</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
              {[
                { label: "Laporan", value: userStats.reports, icon: Camera, color: "from-red-500/20 to-orange-500/20", iconColor: "text-red-400" },
                { label: "Poin", value: userStats.points, icon: Zap, color: "from-yellow-500/20 to-orange-500/20", iconColor: "text-yellow-400" },
                { label: "Ranking", value: `#${userStats.rank}`, icon: Trophy, color: "from-emerald-500/20 to-green-500/20", iconColor: "text-emerald-400" },
                { label: "Event", value: userStats.eventsJoined, icon: Calendar, color: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-400" },
                { label: "Badge", value: userStats.badges, icon: Award, color: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-400" }
              ].map((stat, index) => (
                <div key={index} className={`bg-gradient-to-br ${stat.color} backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left Column - Quick Actions */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Quick Actions */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <Target className="w-6 h-6 text-cyan-400 mr-3" />
                    Aksi Cepat
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { title: "📸 Laporkan Pencemaran", desc: "Upload foto dan lokasi pencemaran", color: "from-red-500/20 to-orange-500/20" },
                      { title: "🗺️ Lihat Peta Sungai", desc: "Eksplorasi kondisi sungai real-time", color: "from-blue-500/20 to-cyan-500/20" },
                      { title: "📅 Daftar Event", desc: "Ikuti pembersihan sungai terdekat", color: "from-emerald-500/20 to-green-500/20" }
                    ].map((action, index) => (
                      <button key={index} className={`group bg-gradient-to-br ${action.color} backdrop-blur-md border border-white/10 rounded-2xl p-6 text-left hover:scale-105 transition-all duration-300 hover:border-cyan-500/30`}>
                        <h3 className="font-semibold mb-2 text-white">{action.title}</h3>
                        <p className="text-sm text-slate-400 mb-4">{action.desc}</p>
                        <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Reports */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center">
                      <Camera className="w-6 h-6 text-cyan-400 mr-3" />
                      Laporan Terbaru
                    </h2>
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">Lihat Semua</button>
                  </div>
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div key={report.id} className="bg-slate-800/50 backdrop-blur-md border border-slate-600 rounded-xl p-4 hover:bg-slate-800/70 transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{report.location}</h3>
                            <p className="text-sm text-slate-400">{report.type}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'Processed' ? 'bg-green-500/20 text-green-400' :
                            report.status === 'Under Review' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{report.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center">
                      <Calendar className="w-6 h-6 text-cyan-400 mr-3" />
                      Event Mendatang
                    </h2>
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">Lihat Semua</button>
                  </div>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="bg-slate-800/50 backdrop-blur-md border border-slate-600 rounded-xl p-4 hover:bg-slate-800/70 transition-all duration-300 group cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{event.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                              <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{event.date}</span>
                              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{event.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-slate-400">
                            <Users className="w-4 h-4 mr-1" />
                            {event.participants}
                          </div>
                        </div>
                        <button className="mt-3 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg text-sm font-medium text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300">
                          Daftar Sekarang
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Challenges & Community */}
              <div className="space-y-8">
                
                {/* Current Challenges */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <Trophy className="w-5 h-5 text-cyan-400 mr-2" />
                    Tantangan Aktif
                  </h2>
                  <div className="space-y-4">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="bg-slate-800/50 backdrop-blur-md border border-slate-600 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-white text-sm">{challenge.title}</h3>
                            <p className="text-xs text-slate-400 mt-1">{challenge.reward}</p>
                          </div>
                          <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
                            {challenge.deadline}
                          </span>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Progress</span>
                            <span>{challenge.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${challenge.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 text-cyan-400 mr-2" />
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
                      <div key={user.rank} className={`flex items-center justify-between p-3 rounded-xl ${user.isUser ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' : 'bg-slate-800/50'}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            user.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                            user.rank === 2 ? 'bg-slate-400/20 text-slate-400' :
                            user.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                            'bg-slate-600/20 text-slate-400'
                          }`}>
                            {user.rank}
                          </div>
                          <span className="font-medium text-white">{user.name}</span>
                        </div>
                        <span className="text-sm text-cyan-400 font-medium">{user.points}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Forum Preview */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center">
                      <MessageCircle className="w-5 h-5 text-cyan-400 mr-2" />
                      Forum Diskusi
                    </h2>
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm">Lihat Forum</button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: "Tips membersihkan sampah plastik", replies: 23, time: "2j" },
                      { title: "Update Sungai Citarum", replies: 45, time: "5j" },
                      { title: "Event Jakarta Besok", replies: 12, time: "1h" }
                    ].map((topic, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800/70 transition-all cursor-pointer">
                        <h3 className="text-sm font-medium text-white mb-1">{topic.title}</h3>
                        <div className="flex justify-between text-xs text-slate-400">
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
    </div>
  );
}