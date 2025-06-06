import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';

export default function KelolaPengguna() {
  const navigate = useNavigate();
  const [pengguna, setPengguna] = useState([]);
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
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        setPengguna(data || []);
      } catch (err) {
        setError('Gagal memuat pengguna: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleUbahRole = async (id, newRole) => {
    try {
      await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', id);
      setPengguna(pengguna.map((item) =>
        item.id === id ? { ...item, role: newRole } : item
      ));
    } catch (err) {
      setError('Gagal memperbarui role: ' + err.message);
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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Kelola Pengguna</h1>
            {loading ? (
              <p className="text-center">Memuat pengguna...</p>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                {pengguna.length === 0 ? (
                  <p className="text-center text-gray-500">Belum ada pengguna.</p>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2">Email</th>
                        <th className="p-2">Role</th>
                        <th className="p-2">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pengguna.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{item.email}</td>
                          <td className="p-2">{item.role}</td>
                          <td className="p-2 space-x-2">
                            {item.role === 'user' ? (
                              <button
                                onClick={() => handleUbahRole(item.id, 'admin')}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Jadikan Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUbahRole(item.id, 'user')}
                                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                              >
                                Jadikan User
                              </button>
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