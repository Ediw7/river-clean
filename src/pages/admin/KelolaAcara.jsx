import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';

export default function KelolaAcara() {
  const navigate = useNavigate();
  const [acara, setAcara] = useState([]);
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
          .from('acara_pembersihan')
          .select('*')
          .order('created_at', { ascending: false });

        setAcara(data || []);
      } catch (err) {
        setError('Gagal memuat acara: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleVerifikasi = async (id, newStatus) => {
    try {
      await supabase
        .from('acara_pembersihan')
        .update({ status: newStatus })
        .eq('id', id);
      setAcara(acara.map((item) =>
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
    <div className="h-screen overflow-hidden bg-white relative">
        
    {/* Header fixed */}
    <div className="fixed top-0 left-0 right-0 z-50">
      <HeaderAdmin />
    </div>
    
    <div className="flex pt-16 h-full">
      {/* Sidebar fixed */}
      <div className="fixed top-16 left-0 h-[calc(100%-4rem)] w-84 z-40">
        <SidebarAdmin />
      </div>
    
      <main className="ml-56 p-8 overflow-y-auto w-full relative z-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Kelola Acara Pembersihan</h1>
            {loading ? (
              <p className="text-center">Memuat acara...</p>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                {acara.length === 0 ? (
                  <p className="text-center text-gray-500">Belum ada acara.</p>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2">Judul</th>
                        <th className="p-2">Lokasi</th>
                        <th className="p-2">Tanggal</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acara.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{item.judul}</td>
                          <td className="p-2">{item.lokasi}</td>
                          <td className="p-2">{item.tanggal}</td>
                          <td className="p-2">{item.status}</td>
                          <td className="p-2 space-x-2">
                            {item.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleVerifikasi(item.id, 'disetujui')}
                                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                  Setujui
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