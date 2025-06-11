import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';
import { Fish, Edit, Trash2, AlertTriangle, User, GitBranch, Heart } from 'lucide-react';

export default function KelolaCompanion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: '',
    nama: '',
    jenis: 'ikan',
    kesehatan: 100,

  });
  const [companions, setCompanions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, data: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase.from('users').select('id, email');
      if (usersError) throw usersError;
      setUsers(usersData || []);

      const { data: companionsData, error: companionsError } = await supabase.from('river_companion').select(`
        id,
        nama,
        jenis,
        kesehatan,
        level,
        exp,
        user_id,
        users (email)
      `).order('created_at', { ascending: false }); 
      if (companionsError) throw companionsError;
      setCompanions(companionsData || []);

    } catch (err) {
      setError('Gagal memuat data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Silakan login terlebih dahulu.');
        navigate('/login');
        return;
      }

      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.email)
          .single();

        if (userError || !userData || userData.role !== 'admin') {
          setError('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
          navigate('/login');
          return;
        }

        await fetchData();

      } catch (err) {
        setError('Gagal memverifikasi role admin atau memuat data: ' + err.message);
        console.error('Auth check error:', err);
      }
    };

    checkAuthAndFetch();
  }, [navigate, fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const tempId = Math.random().toString(36).substring(2, 9);
    const newUserEmail = users.find(u => u.id === formData.user_id)?.email || 'Unknown User';
    const newCompanion = {
        ...formData,
        id: tempId,
        users: { email: newUserEmail },
        level: 1,
        exp: 0,   
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    setCompanions(prev => [newCompanion, ...prev]);

    try {
      const { error: insertError } = await supabase.from('river_companion').insert([{
        user_id: formData.user_id,
        nama: formData.nama,
        jenis: formData.jenis,
        kesehatan: parseInt(formData.kesehatan, 10),
 
      }]);
      if (insertError) {
        console.error('Supabase INSERT error:', insertError);
        console.error('Pesan error Supabase:', insertError.message);
        console.error('Detail error Supabase:', insertError.details);
        console.error('Hint error Supabase:', insertError.hint);
        throw insertError;
      }

      await fetchData();
      setFormData({ user_id: '', nama: '', jenis: 'ikan', kesehatan: 100 }); 
      setError('Companion berhasil ditambahkan!');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError('Gagal menambahkan companion: ' + err.message);
      setCompanions(prev => prev.filter(c => c.id !== tempId));
    }
  };


  const handleEdit = async () => {
    const { id, user_id, nama, jenis, kesehatan, level, exp } = editModal.data;
    const originalCompanions = [...companions];

    const newUserEmail = users.find(u => u.id === user_id)?.email || 'Unknown User';
    const updatedCompanionItem = {
      ...editModal.data,
      users: { email: newUserEmail },
      updated_at: new Date().toISOString(),
    };
    setCompanions(prev =>
      prev.map(comp =>
        comp.id === id ? { ...comp, ...updatedCompanionItem } : comp
      )
    );

    try {
      const { error: updateError } = await supabase
        .from('river_companion')
        .update({
          user_id,
          nama,
          jenis,
          kesehatan: parseInt(kesehatan, 10),

          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        console.error('Supabase UPDATE error:', updateError);
        console.error('Pesan error Supabase:', updateError.message);
        console.error('Detail error Supabase:', updateError.details);
        console.error('Hint error Supabase:', updateError.hint);
        throw updateError;
      }

      setEditModal({ open: false, data: null });
      setError('Companion berhasil diperbarui!');
      setTimeout(() => setError(null), 3000);

    } catch (err) {
      setError('Gagal mengedit companion: ' + err.message);
      setCompanions(originalCompanions);
      setEditModal({ open: true, data: originalCompanions.find(c => c.id === id) });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus companion ini?')) {
      const originalCompanions = [...companions];

      setCompanions(prev => prev.filter(comp => comp.id !== id));

      try {
        const { error: deleteError } = await supabase.from('river_companion').delete().eq('id', id);
        if (deleteError) {
          console.error('Supabase DELETE error:', deleteError);
          console.error('Pesan error Supabase:', deleteError.message);
          console.error('Detail error Supabase:', deleteError.details);
          console.error('Hint error Supabase:', deleteError.hint);
          throw deleteError;
        }
        setError('Companion berhasil dihapus!');
        setTimeout(() => setError(null), 3000);
      } catch (err) {
        setError('Gagal menghapus companion: ' + err.message);
        setCompanions(originalCompanions);
      }
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
      <div className="fixed top-0 left-0 right-0 z-50">
        <HeaderAdmin />
      </div>

      <div className="flex pt-16 h-full">
        <div className="fixed top-16 left-0 h-[calc(100%-4rem)] w-84 z-40">
          <SidebarAdmin />
        </div>

        <main className="ml-56 pt-6 pb-16 px-8 w-full overflow-y-auto h-full bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-cyan-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Fish className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Kelola Companion Keren
                  </h1>
                  <p className="text-slate-600">Atur dan kelola companion pengguna.</p>
                </div>
              </div>
            </div>

            {error && error.includes('berhasil') && (
              <p className="text-center text-green-600 mb-4 font-semibold animate-pulse">{error}</p>
            )}
   
            <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg p-6 mb-8 transform hover:scale-[1.02] transition duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tambah Companion Baru</h2>
              <div className="flex flex-col md:flex-row gap-8">
                <form onSubmit={handleSubmit} className="w-full md:w-1/2 bg-gray-50/80 p-6 rounded-xl shadow-inner">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Pengguna</label>
                    <select
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80"
                      required
                    >
                      <option value="">Pilih Pengguna</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>{user.email}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Companion</label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80"
                      placeholder="Contoh: Ikan Emas"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Companion</label>
                    <select
                      value={formData.jenis}
                      onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80"
                    >
                      <option value="ikan">Ikan</option>
                      <option value="katak">Katak</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kesehatan (0-100)</label>
                    <input
                      type="number"
                      value={formData.kesehatan}
                      onChange={(e) => setFormData({ ...formData, kesehatan: Math.min(100, Math.max(0, e.target.value)) })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
    
                  <div className="flex justify-end space-x-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
                    >
                      Tambah Companion
                    </button>
                  </div>
                </form>
                <div className="w-full md:w-1/2 flex items-center justify-center">
                  <div className="relative w-64 h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl shadow-lg p-4 flex items-center justify-center">
                    {/* Tampilkan emoticon default Fish */}
                    <span className="text-8xl animate-bounce">🐟</span>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-gray-700 font-semibold">
                      {formData.nama || 'Nama Companion'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Daftar Companion */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Companion</h2>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Memuat companions...</p>
                </div>
              ) : companions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Fish className="w-8 h-8 text-cyan-600" />
                  </div>
                  <p className="text-slate-500 text-lg">Belum ada companion yang ditambahkan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companions.map((comp) => (
                    <div
                      key={comp.id}
                      className="bg-gradient-to-br from-blue-50/70 to-green-50/70 rounded-lg shadow-md p-4 hover:shadow-xl transition duration-300 transform hover:-translate-y-2"
                    >
                      <div className="w-full h-40 flex items-center justify-center bg-gray-100/80 rounded-lg">
                        <span className="text-6xl">{comp.jenis === 'ikan' ? '🐟' : '🐸'}</span> {/* Tampilkan emoticon berdasarkan jenis */}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mt-2">{comp.nama}</h3>
                      <p className="text-gray-600">Jenis: {comp.jenis}</p>
                      <p className="text-gray-600 flex items-center space-x-1"><Heart className="w-4 h-4 text-red-500" /> <span>Kesehatan: {comp.kesehatan}%</span></p>
                      <p className="text-gray-600 flex items-center space-x-1"><GitBranch className="w-4 h-4 text-purple-600" /> <span>Level: {comp.level}</span></p>
                      <p className="text-gray-600 flex items-center space-x-1"><User className="w-4 h-4 text-blue-600" /> <span>Pemilik: {comp.users.email}</span></p>
                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={() => setEditModal({ open: true, data: comp })}
                          className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 flex items-center space-x-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(comp.id)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 bg-red-500 flex items-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <FooterAdmin />
      {editModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full max-w-3xl border border-white/50">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Edit Companion</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Pengguna</label>
                <select
                  value={editModal.data.user_id}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, user_id: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  required
                >
                  <option value="">Pilih Pengguna</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Companion</label>
                <input
                  type="text"
                  value={editModal.data.nama}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, nama: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  placeholder="Nama Companion"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Companion</label>
                <select
                  value={editModal.data.jenis}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, jenis: e.target.value } })}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                >
                  <option value="ikan">Ikan</option>
                  <option value="katak">Katak</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kesehatan (0-100)</label>
                <input
                  type="number"
                  value={editModal.data.kesehatan}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, kesehatan: Math.min(100, Math.max(0, e.target.value)) } })}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  min="0"
                  max="100"
                  required
                />
              </div>

            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditModal({ open: false, data: null })}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => handleEdit()}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}