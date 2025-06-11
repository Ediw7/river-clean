import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin'; 
import { Users, UserCheck, UserX, AlertTriangle } from 'lucide-react';

export default function KelolaPengguna() {
  const navigate = useNavigate();
  const [pengguna, setPengguna] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*') 
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPengguna(data || []);
    } catch (err) {
      setError('Gagal memuat pengguna: ' + err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []); 
  useEffect(() => {
    const checkAuthAndFetch = async () => {
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
        setError('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
        navigate('/login');
        return;
      }
      
      await fetchData(); 
    };

    checkAuthAndFetch();
  }, [navigate, fetchData]); 

  const handleUbahRole = async (id, newRole) => {
    const originalPengguna = [...pengguna]; 
    const userIndex = pengguna.findIndex(item => item.id === id);
    const originalUser = pengguna[userIndex];

    setPengguna(prevPengguna =>
      prevPengguna.map(item =>
        item.id === id ? { ...item, role: newRole } : item
      )
    );

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', id);

      if (updateError) {
        console.error('Supabase UPDATE role error:', updateError);
        console.error('Pesan error Supabase:', updateError.message);
        throw updateError;
      }
  
    } catch (err) {
      setError('Gagal memperbarui role: ' + err.message);
      console.error('Error updating role:', err);
      setPengguna(originalPengguna); 
    }
  };

  if (error && !error.includes('berhasil')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg">
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

        <main className="ml-56 pt-6 pb-16 px-8 w-full overflow-y-auto h-full bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mt-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Kelola Pengguna
                  </h1>
                  <p className="text-slate-600">Atur dan kelola peran pengguna di RiverClean.</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Memuat pengguna...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg overflow-hidden">
                {pengguna.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-cyan-600" />
                    </div>
                    <p className="text-slate-500 text-lg">Belum ada pengguna terdaftar.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                          <th className="p-4 font-semibold text-slate-700">Nama</th> 
                          <th className="p-4 font-semibold text-slate-700">Email</th>
                          <th className="p-4 font-semibold text-slate-700">Role</th>
                          <th className="p-4 font-semibold text-slate-700">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pengguna.map((item) => (
                          <tr
                            key={item.id}
                            className={`border-b border-slate-100 hover:bg-slate-50 transition-all duration-300 ${
                              item.role === 'admin' ? 'bg-blue-50/20' : 'bg-white'
                            }`}
                          >
                            <td className="p-4 text-slate-700 whitespace-nowrap">{item.nama || 'Tidak Ada Nama'}</td> {/* Tampilkan nama */}
                            <td className="p-4 text-slate-700 whitespace-nowrap">{item.email}</td>
                            <td className="p-4 text-slate-700 whitespace-nowrap">{item.role}</td>
                            <td className="p-4 whitespace-nowrap">
                              {item.role === 'user' ? (
                                <button
                                  onClick={() => handleUbahRole(item.id, 'admin')}
                                  className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center space-x-1"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  <span>Jadikan Admin</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUbahRole(item.id, 'user')}
                                  className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 flex items-center space-x-1"
                                >
                                  <UserX className="w-4 h-4" />
                                  <span>Jadikan User</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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