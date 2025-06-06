import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';

export default function KelolaLaporan() {
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState([]);
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
        const { data } = await supabase
          .from('laporan_pencemaran')
          .select('*')
          .order('created_at', { ascending: false });

        setLaporan(data || []);
      } catch (err) {
        setError('Gagal memuat laporan: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleVerifikasi = async (id, newStatus) => {
    try {
      await supabase
        .from('laporan_pencemaran')
        .update({ status: newStatus })
        .eq('id', id);
      setLaporan(laporan.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      setError('Gagal memperbarui status: ' + err.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <HeaderAdmin />
      <div className="flex flex-1">
        <SidebarAdmin />
        <main className="ml-64 p-8 w-full">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Kelola Laporan Pencemaran</h1>
            {loading ? (
              <p className="text-center">Memuat laporan...</p>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                {laporan.length === 0 ? (
                  <p className="text-center text-gray-500">Belum ada laporan.</p>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2">Email</th>
                        <th className="p-2">Deskripsi</th>
                        <th className="p-2">Lokasi</th>
                        <th className="p-2">Jenis Sampah</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laporan.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{item.email}</td>
                          <td className="p-2">{item.deskripsi}</td>
                          <td className="p-2">{item.lokasi}</td>
                          <td className="p-2">{item.jenis_sampah}</td>
                          <td className="p-2">{item.status}</td>
                          <td className="p-2 space-x-2">
                            {item.status === 'menunggu' && (
                              <>
                                <button
                                  onClick={() => handleVerifikasi(item.id, 'diverifikasi')}
                                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                  Verifikasi
                                </button>
                                <button
                                  onClick={() => handleVerifikasi(item.id, 'ditolak')}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <FooterAdmin />
    </div>
  );
}