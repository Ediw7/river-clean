import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';

export default function KelolaCompanion() {
  const navigate = useNavigate();
  const [companion, setCompanion] = useState([]);
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
          .from('river_companion')
          .select('*, users(email)')
          .order('updated_at', { ascending: false });

        setCompanion(data || []);
      } catch (err) {
        setError('Gagal memuat data companion: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleUbahKesehatan = async (id, newKesehatan) => {
    try {
      await supabase
        .from('river_companion')
        .update({ kesehatan: newKesehatan, updated_at: new Date().toISOString() })
        .eq('id', id);
      setCompanion(companion.map((item) =>
        item.id === id ? { ...item, kesehatan: newKesehatan, updated_at: new Date().toISOString() } : item
      ));
    } catch (err) {
      setError('Gagal memperbarui kesehatan: ' + err.message);
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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Kelola River Companion</h1>
            {loading ? (
              <p className="text-center">Memuat data companion...</p>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                {companion.length === 0 ? (
                  <p className="text-center text-gray-500">Belum ada data companion.</p>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2">Email Pengguna</th>
                        <th className="p-2">Nama Companion</th>
                        <th className="p-2">Jenis</th>
                        <th className="p-2">Kesehatan</th>
                        <th className="p-2">Aksi</th>
                    </tr>
                    </thead>
                    <tbody>
                      {companion.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{item.users?.email}</td>
                          <td className="p-2">{item.nama}</td>
                          <td className="p-2">{item.jenis}</td>
                          <td className="p-2">{item.kesehatan}</td>
                          <td className="p-2 space-x-2">
                            <button
                              onClick={() => handleUbahKesehatan(item.id, Math.min(item.kesehatan + 10, 100))}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Tambah Kesehatan (+10)
                            </button>
                            <button
                              onClick={() => handleUbahKesehatan(item.id, Math.max(item.kesehatan - 10, 0))}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            >
                              Kurangi Kesehatan (-10)
                            </button>
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