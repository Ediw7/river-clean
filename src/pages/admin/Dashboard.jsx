import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Header from '../../components/Header';
import Sidebar from '../../components/sidebarAdmin';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    laporan: 0,
    acara: 0,
    pengguna: 0,
    tantangan: 0,
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
        const [laporan, acara, pengguna, tantangan] = await Promise.all([
          supabase.from('laporan_pencemaran').select('*', { count: 'exact' }),
          supabase.from('acara_pembersihan').select('*', { count: 'exact' }),
          supabase.from('users').select('*', { count: 'exact' }),
          supabase.from('tantangan_sungai').select('*', { count: 'exact' }),
        ]);

        setStats({
          laporan: laporan.count || 0,
          acara: acara.count || 0,
          pengguna: pengguna.count || 0,
          tantangan: tantangan.count || 0,
        });
      } catch (err) {
        setError('Gagal memuat data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <Header />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Admin Dashboard</h1>
          <p className="text-gray-700 mb-4">Selamat datang di dashboard admin RiverClean!</p>
          {loading ? (
            <p className="text-center">Memuat data...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800">Laporan</h2>
                <p className="text-3xl text-[#16A34A] font-bold mt-2">{stats.laporan}</p>
                <p className="text-sm text-gray-500">Laporan pencemaran menunggu</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800">Acara</h2>
                <p className="text-3xl text-[#16A34A] font-bold mt-2">{stats.acara}</p>
                <p className="text-sm text-gray-500">Acara pembersihan terjadwal</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800">Pengguna</h2>
                <p className="text-3xl text-[#16A34A] font-bold mt-2">{stats.pengguna}</p>
                <p className="text-sm text-gray-500">Pengguna terdaftar</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800">Tantangan</h2>
                <p className="text-3xl text-[#16A34A] font-bold mt-2">{stats.tantangan}</p>
                <p className="text-sm text-gray-500">Tantangan aktif</p>
              </div>
            </div>
          )}
          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#1E40AF] text-white rounded hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
