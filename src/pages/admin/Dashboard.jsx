import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import { 
  FileText, Users, Calendar, Heart, MessageCircle, MapPin, Loader2, AlertCircle, 
  ChevronRight, Phone, GitBranch, Star, Sparkles, Crown, Activity, Shield // Pastikan semua icon ada
} from 'lucide-react'; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    laporan: 0,
    acara: 0,
    pengguna: 0,
    companion: 0,
    laporanBelumDiverifikasi: 0,
    pesanDigital: 0,
    pesanDigitalBelumDibalas: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null); // Reset error di setiap awal fetch

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single();

      if (userError || userData?.role !== 'admin') {
        navigate('/login');
        return;
      }

      const allPromises = await Promise.allSettled([ // Menggunakan Promise.allSettled
        supabase.from('laporan_pencemaran').select('id', { count: 'exact' }),
        supabase.from('acara_pembersihan').select('id', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('river_companion').select('id', { count: 'exact' }),
        supabase.from('laporan_pencemaran').select('id', { count: 'exact' }).eq('status', 'menunggu'),
        supabase
          .from('laporan_pencemaran')
          .select(`
            id,
            deskripsi,
            created_at,
            status,
            nama,
            email
          `)
          .order('created_at', { ascending: false })
          .limit(5)
          .eq('status', 'menunggu'),
        supabase.from('pesan_digital').select('id', { count: 'exact' }),
        supabase.from('pesan_digital').select('id, pesan_replies(id)', { count: 'exact' }).is('pesan_replies', null),
      ]);

      // Proses setiap hasil promise dari Promise.allSettled
      const results = allPromises.map(promise => promise.status === 'fulfilled' ? promise.value : { data: null, count: 0, error: promise.reason });

      // Log error dari setiap promise yang gagal (untuk debugging)
      results.forEach((res, index) => {
        if (res.error && res.error.code !== 'PGRST116') { // Abaikan PGRST116 (no rows found)
          console.error(`Partial data fetch error at index ${index}:`, res.error);
          // Anda bisa mengatur error umum di sini jika ada sub-query yang gagal
          // setError('Beberapa data gagal dimuat. Mohon coba lagi.');
        }
      });

      // Destrukturisasi hasil yang sudah diproses
      const [
        laporanResponse, 
        acaraResponse, 
        penggunaResponse, 
        companionResponse,
        laporanBelumResponse, 
        recentResponse, 
        pesanDigitalResponse,
        pesanDigitalBelumReplyResponse
      ] = results;


      setStats({
        laporan: laporanResponse?.count || 0, // Pastikan ada null check
        acara: acaraResponse?.count || 0,
        pengguna: penggunaResponse?.count || 0,
        companion: companionResponse?.count || 0,
        laporanBelumDiverifikasi: laporanBelumResponse?.count || 0,
        pesanDigital: pesanDigitalResponse?.count || 0,
        pesanDigitalBelumDibalas: pesanDigitalBelumReplyResponse?.count || 0,
      });
      setRecentActivities(recentResponse?.data || []); // Pastikan data tidak null
    } catch (err) {
      setError('Gagal memuat data: ' + err.message);
      console.error('Dashboard data fetch error (top-level catch):', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-4 font-medium">{error}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 font-medium"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      title: 'Laporan',
      value: stats.laporan,
      subtitle: 'Total laporan masuk',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      pending: stats.laporanBelumDiverifikasi,
      link: '/admin/laporan'
    },
    {
      title: 'Acara',
      value: stats.acara,
      subtitle: 'Total acara dibuat',
      icon: Calendar,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      link: '/admin/acara'
    },
    {
      title: 'Pengguna',
      value: stats.pengguna,
      subtitle: 'Total pengguna terdaftar',
      icon: Users,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      link: '/admin/pengguna'
    },
    {
      title: 'River Companion',
      value: stats.companion,
      subtitle: 'Total companion diadopsi',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50',
      link: '/admin/kelolacompanion'
    },
    {
      title: 'Pesan Digital',
      value: stats.pesanDigital,
      subtitle: 'Total pesan terkirim',
      icon: MessageCircle,
      color: 'from-orange-500 to-yellow-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-yellow-50',
      pending: stats.pesanDigitalBelumDibalas,
      link: '/pesandigital'
    }
  ];

  return (
    <div className="h-screen overflow-hidden bg-white">
      {/* Header fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderAdmin />
      </div>

      <div className="flex pt-16 h-full">
        {/* Sidebar fixed */}
        <div className="fixed top-16 left-0 h-[calc(100%-4rem)] w-84 z-40">
          <SidebarAdmin />
        </div>

        {/* Konten utama scrollable */}
        <main className="ml-56 pt-6 pb-16 px-8 w-full overflow-y-auto h-full bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Admin Dashboard River Clean
                  </h1>
                  <p className="text-slate-600">Selamat datang! Pantau dan kelola aktivitas River Clean dengan mudah.</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Memuat data...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Statistik Utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  {statItems.map((item, index) => (
                    <div 
                      key={item.title}
                      className={`${item.bgColor} backdrop-blur-sm border border-white/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer`}
                      onClick={() => item.link && navigate(item.link)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                            {item.value}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-700 mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-500">{item.subtitle}</p>
                        {item.pending > 0 && (
                          <div className="mt-2 px-2 py-1 bg-red-100 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-xs font-medium">
                              Belum Diverifikasi: {item.pending}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Aktivitas Terbaru (Laporan Menunggu Diverifikasi) */}
                <div className="bg-white/70 backdrop-blur-sm border border-white/50 p-6 rounded-2xl shadow-lg mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">Laporan Menunggu Diverifikasi</h2>
                    <button 
                      onClick={() => navigate('/admin/laporan')} 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                    >
                      Lihat Semua
                    </button>
                  </div>
                  {recentActivities.length === 0 ? (
                    <p className="text-center text-slate-500">Tidak ada laporan yang menunggu diverifikasi.</p>
                  ) : (
                    <ul className="space-y-4">
                      {recentActivities.map((activity) => (
                        <li key={activity.id} className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full flex items-center justify-center mt-1">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              {/* PERBAIKAN DI SINI: Akses nama/email langsung dari activity */}
                              <p className="text-slate-700 font-medium">Laporan dari {activity.nama || activity.email?.split('@')[0] || 'Anonim'}:</p>
                              <p className="text-sm text-slate-500">{activity.deskripsi || '-'}</p> {/* Tambah null check */}
                              <p className="text-xs text-slate-400">
                                Tanggal: {new Date(activity.created_at || '').toLocaleDateString()} {/* Tambah null check */}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Tombol Aksi Cepat */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <button
                    onClick={() => navigate('/admin/laporan')}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Kelola Laporan</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/kelolacompanion')}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Kelola Companion</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/acara')}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Kelola Acara</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

    </div>
  );
}