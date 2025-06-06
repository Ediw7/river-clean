import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import Chart from '../../components/admin/Chart'; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    laporan: 0,
    acara: 0,
    pengguna: 0,
    tantangan: 0,
    companion: 0,
    laporanBelumDiverifikasi: 0,
    tantanganBelumDiverifikasi: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    data: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
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

      try {
        const [
          laporan, acara, pengguna, tantangan, companion,
          laporanBelum, tantanganBelum, recent, chartQuery
        ] = await Promise.all([
          supabase.from('laporan_pencemaran').select('*', { count: 'exact' }),
          supabase.from('acara_pembersihan').select('*', { count: 'exact' }),
          supabase.from('users').select('*', { count: 'exact' }),
          supabase.from('tantangan').select('*', { count: 'exact' }),
          supabase.from('river_companion').select('*', { count: 'exact' }),
          supabase.from('laporan_pencemaran').select('*', { count: 'exact' }).eq('status', 'menunggu'),
          supabase.from('partisipasi_tantangan').select('*', { count: 'exact' }).eq('status', 'menunggu'),
          supabase
            .from('laporan_pencemaran')
            .select(`
              id,
              judul,
              created_at,
              users (email)
            `)
            .order('created_at', { ascending: false })
            .limit(5)
            .eq('status', 'menunggu'),
          supabase
            .from('tantangan')
            .select('jenis_tantangan')
        ]);

        // Proses data untuk grafik
        const jenisCount = chartQuery.data.reduce((acc, curr) => {
          const jenis = curr.jenis_tantangan;
          acc[jenis] = (acc[jenis] || 0) + 1;
          return acc;
        }, {});
        const labels = Object.keys(jenisCount);
        const data = Object.values(jenisCount);

        setStats({
          laporan: laporan.count || 0,
          acara: acara.count || 0,
          pengguna: pengguna.count || 0,
          tantangan: tantangan.count || 0,
          companion: companion.count || 0,
          laporanBelumDiverifikasi: laporanBelum.count || 0,
          tantanganBelumDiverifikasi: tantanganBelum.count || 0,
        });
        setRecentActivities(recent.data || []);
        setChartData({ labels, data });
      } catch (err) {
        setError('Gagal memuat data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
        <button onClick={() => navigate('/login')} className="ml-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Login
        </button>
      </div>
    );
  }

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
        <main className="ml-56 pt-6 pb-16 px-8 w-full overflow-y-auto h-full">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">
              Admin Dashboard River Clean
            </h1>
            <p className="text-gray-600 mb-6">Selamat datang! Pantau dan kelola aktivitas River Clean dengan mudah.</p>
            {loading ? (
              <p className="text-center text-gray-600">Memuat data...</p>
            ) : (
              <>
                {/* Statistik Utama */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                    <h2 className="text-xl font-semibold text-gray-800">Laporan</h2>
                    <p className="text-3xl text-gray-700 font-bold mt-2">{stats.laporan}</p>
                    <p className="text-sm text-gray-500">Total laporan</p>
                    {stats.laporanBelumDiverifikasi > 0 && (
                      <p className="text-red-500 text-sm mt-1">Belum Diverifikasi: {stats.laporanBelumDiverifikasi}</p>
                    )}
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                    <h2 className="text-xl font-semibold text-gray-800">Acara</h2>
                    <p className="text-3xl text-gray-700 font-bold mt-2">{stats.acara}</p>
                    <p className="text-sm text-gray-500">Acara terjadwal</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                    <h2 className="text-xl font-semibold text-gray-800">Pengguna</h2>
                    <p className="text-3xl text-gray-700 font-bold mt-2">{stats.pengguna}</p>
                    <p className="text-sm text-gray-500">Pengguna terdaftar</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                    <h2 className="text-xl font-semibold text-gray-800">Tantangan</h2>
                    <p className="text-3xl text-gray-700 font-bold mt-2">{stats.tantangan}</p>
                    <p className="text-sm text-gray-500">Tantangan aktif</p>
                    {stats.tantanganBelumDiverifikasi > 0 && (
                      <p className="text-red-500 text-sm mt-1">Belum Diverifikasi: {stats.tantanganBelumDiverifikasi}</p>
                    )}
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
                    <h2 className="text-xl font-semibold text-gray-800">River Companion</h2>
                    <p className="text-3xl text-gray-700 font-bold mt-2">{stats.companion}</p>
                    <p className="text-sm text-gray-500">Peliharaan virtual</p>
                  </div>
                </div>

                {/* Grafik */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribusi Tantangan</h2>
                  <Chart labels={chartData.labels} data={chartData.data} />
                </div>

                {/* Aktivitas Terbaru */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h2>
                  {recentActivities.length === 0 ? (
                    <p className="text-center text-gray-500">Tidak ada aktivitas terbaru.</p>
                  ) : (
                    <ul className="space-y-4">
                      {recentActivities.map((activity) => (
                        <li key={activity.id} className="border-b pb-2">
                          <p className="text-gray-700">Laporan: {activity.judul}</p>
                          <p className="text-sm text-gray-500">Oleh: {activity.users.email}</p>
                          <p className="text-sm text-gray-500">
                            Tanggal: {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Tombol Aksi Cepat */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/admin/tantangan')}
                    className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition"
                  >
                    Kelola Tantangan
                  </button>
                  <button
                    onClick={() => navigate('/admin/companion')}
                    className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition"
                  >
                    Kelola Companion
                  </button>
                  <button
                    onClick={() => navigate('/admin/laporan')}
                    className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition"
                  >
                    Kelola Laporan
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