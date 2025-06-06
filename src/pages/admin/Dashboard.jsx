import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    laporan: 0,
    acara: 0,
    pengguna: 0,
    tantangan: 0,
    companion: 0,
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
        const [laporan, acara, pengguna, tantangan, companion] = await Promise.all([
          supabase.from('laporan_pencemaran').select('*', { count: 'exact' }),
          supabase.from('acara_pembersihan').select('*', { count: 'exact' }),
          supabase.from('users').select('*', { count: 'exact' }),
          supabase.from('tantangan').select('*', { count: 'exact' }),
          supabase.from('river_companion').select('*', { count: 'exact' }),
        ]);

        setStats({
          laporan: laporan.count || 0,
          acara: acara.count || 0,
          pengguna: pengguna.count || 0,
          tantangan: tantangan.count || 0,
          companion: companion.count || 0,
        });
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Admin Dashboard</h1>
            <p className="text-gray-700 mb-4">Selamat datang di dashboard admin River Clean!</p>
            {loading ? (
              <p className="text-center">Memuat data...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Kartu stat */}
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h2 className="text-xl font-semibold text-gray-800">Laporan</h2>
                  <p className="text-3xl text-green-600 font-bold mt-2">{stats.laporan}</p>
                  <p className="text-sm text-gray-500">Laporan pencemaran menunggu</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h2 className="text-xl font-semibold text-gray-800">Acara</h2>
                  <p className="text-3xl text-green-600 font-bold mt-2">{stats.acara}</p>
                  <p className="text-sm text-gray-500">Acara pembersihan terjadwal</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h2 className="text-xl font-semibold text-gray-800">Pengguna</h2>
                  <p className="text-3xl text-green-600 font-bold mt-2">{stats.pengguna}</p>
                  <p className="text-sm text-gray-500">Pengguna terdaftar</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h2 className="text-xl font-semibold text-gray-800">Tantangan</h2>
                  <p className="text-3xl text-green-600 font-bold mt-2">{stats.tantangan}</p>
                  <p className="text-sm text-gray-500">Tantangan aktif</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h2 className="text-xl font-semibold text-gray-800">River Companion</h2>
                  <p className="text-3xl text-green-600 font-bold mt-2">{stats.companion}</p>
                  <p className="text-sm text-gray-500">Peliharaan virtual aktif</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

    
      {/* <div className="fixed bottom-0 left-0 right-0 z-50">
        <FooterAdmin />
      </div> */}
    </div>
  );
}