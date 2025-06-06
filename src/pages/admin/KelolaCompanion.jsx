import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderAdmin from '../../components/admin/HeaderAdmin';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import FooterAdmin from '../../components/admin/FooterAdmin';

export default function KelolaCompanion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: '',
    nama: '',
    jenis: 'ikan',
    kesehatan: 100,
    warna: '',
    emoticon: '🐟',
  });
  const [companions, setCompanions] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
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

        const { data: usersData } = await supabase.from('users').select('id, email');
        setUsers(usersData || []);

        const { data: companionsData } = await supabase.from('river_companion').select(`
          id,
          nama,
          jenis,
          kesehatan,
          warna,
          emoticon,
          user_id,
          users (email)
        `).order('created_at', { ascending: false });
        setCompanions(companionsData || []);
      } catch (err) {
        setError('Gagal memuat data: ' + err.message);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error: insertError } = await supabase.from('river_companion').insert([{
        user_id: formData.user_id,
        nama: formData.nama,
        jenis: formData.jenis,
        kesehatan: parseInt(formData.kesehatan),
        warna: formData.warna || null,
        emoticon: formData.emoticon,
      }]);
      if (insertError) throw insertError;
      setFormData({ user_id: '', nama: '', jenis: 'ikan', kesehatan: 100, warna: '', emoticon: '🐟' });
      const { data: updatedCompanions } = await supabase.from('river_companion').select(`
        id,
        nama,
        jenis,
        kesehatan,
        warna,
        emoticon,
        user_id,
        users (email)
      `).order('created_at', { ascending: false });
      setCompanions(updatedCompanions || []);
      setError('Companion berhasil ditambahkan!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError('Gagal menambahkan companion: ' + err.message);
    }
  };

  const handleEdit = async (id, updatedData) => {
    try {
      const { error } = await supabase
        .from('river_companion')
        .update({
          user_id: updatedData.user_id,
          nama: updatedData.nama,
          jenis: updatedData.jenis,
          kesehatan: parseInt(updatedData.kesehatan),
          warna: updatedData.warna || null,
          emoticon: updatedData.emoticon,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      const { data: updatedCompanions } = await supabase.from('river_companion').select(`
        id,
        nama,
        jenis,
        kesehatan,
        warna,
        emoticon,
        user_id,
        users (email)
      `).order('created_at', { ascending: false });
      setCompanions(updatedCompanions || []);
      setEditData(null);
    } catch (err) {
      setError('Gagal mengedit companion: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus companion ini?')) {
      try {
        const { error } = await supabase.from('river_companion').delete().eq('id', id);
        if (error) throw error;
        const { data: updatedCompanions } = await supabase.from('river_companion').select(`
          id,
          nama,
          jenis,
          kesehatan,
          warna,
          emoticon,
          user_id,
          users (email)
        `).order('created_at', { ascending: false });
        setCompanions(updatedCompanions || []);
      } catch (err) {
        setError('Gagal menghapus companion: ' + err.message);
      }
    }
  };

  if (error && !error.includes('berhasil')) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
        <button onClick={() => navigate('/login')} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Login
        </button>
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
          <div className="max-w-6xl w-full">
            <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 mb-8">
              Kelola Companion Keren
            </h1>
            {error && error.includes('berhasil') && (
              <p className="text-center text-green-600 mb-4 font-semibold animate-pulse">{error}</p>
            )}
            {/* Form Tambah Companion */}
            <div className="bg-white rounded-xl shadow-2xl p-6 mb-8 transform hover:scale-105 transition duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tambah Companion Baru</h2>
              <div className="flex flex-col md:flex-row gap-8">
                <form onSubmit={handleSubmit} className="w-full md:w-1/2 bg-gray-50 p-6 rounded-lg shadow-inner">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-lg mb-2">Pilih Pengguna</label>
                    <select
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih Pengguna</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>{user.email}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-lg mb-2">Nama Companion</label>
                    <input
                      type="text"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Ikan Emas"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-lg mb-2">Jenis Companion</label>
                    <select
                      value={formData.jenis}
                      onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ikan">Ikan</option>
                      <option value="katak">Katak</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-lg mb-2">Kesehatan (0-100)</label>
                    <input
                      type="number"
                      value={formData.kesehatan}
                      onChange={(e) => setFormData({ ...formData, kesehatan: Math.min(100, Math.max(0, e.target.value)) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-lg mb-2">Warna (Opsional)</label>
                    <input
                      type="text"
                      value={formData.warna}
                      onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Merah, Biru"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-lg mb-2">Emoticon</label>
                    <select
                      value={formData.emoticon}
                      onChange={(e) => setFormData({ ...formData, emoticon: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="🐟">🐟 (Ikan)</option>
                      <option value="🐠">🐠 (Ikan Tropis)</option>
                      <option value="🦈">🦈 (Hiu)</option>
                      <option value="🐸">🐸 (Katak)</option>
                      <option value="🐢">🐢 (Kura-kura)</option>
                      <option value="🦎">🦎 (Kadal)</option>
                      <option value="🐾">🐾 (Default)</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/companion')}
                      className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-300"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition duration-300 transform hover:scale-105"
                    >
                      Tambah Companion
                    </button>
                  </div>
                </form>
                <div className="w-full md:w-1/2 flex items-center justify-center">
                  <div className="relative w-64 h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-full shadow-lg p-4 flex items-center justify-center">
                    <span className="text-8xl animate-bounce">{formData.emoticon}</span>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-gray-700 font-semibold">
                      {formData.nama || 'Nama Companion'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Daftar Companion */}
            <div className="bg-white rounded-xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Daftar Companion</h2>
              {companions.length === 0 ? (
                <p className="text-center text-gray-500">Belum ada companion yang ditambahkan.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companions.map((comp) => (
                    <div
                      key={comp.id}
                      className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg shadow-md p-4 hover:shadow-xl transition duration-300 transform hover:-translate-y-2"
                    >
                      <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-lg">
                        <span className="text-6xl">{comp.emoticon}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mt-2">{comp.nama}</h3>
                      <p className="text-gray-600">Jenis: {comp.jenis}</p>
                      <p className="text-gray-600">Kesehatan: {comp.kesehatan}%</p>
                      <p className="text-gray-600">Warna: {comp.warna || 'Default'}</p>
                      <p className="text-gray-600">Pemilik: {comp.users.email}</p>
                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={() => setEditData(comp)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(comp.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                        >
                          Hapus
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
      {editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Companion</h2>
            <select
              value={editData.user_id}
              onChange={(e) => setEditData({ ...editData, user_id: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              required
            >
              <option value="">Pilih Pengguna</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.email}</option>
              ))}
            </select>
            <input
              type="text"
              value={editData.nama}
              onChange={(e) => setEditData({ ...editData, nama: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Nama Companion"
              required
            />
            <select
              value={editData.jenis}
              onChange={(e) => setEditData({ ...editData, jenis: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            >
              <option value="ikan">Ikan</option>
              <option value="katak">Katak</option>
            </select>
            <input
              type="number"
              value={editData.kesehatan}
              onChange={(e) => setEditData({ ...editData, kesehatan: Math.min(100, Math.max(0, e.target.value)) })}
              className="w-full p-2 mb-2 border rounded"
              min="0"
              max="100"
              required
            />
            <input
              type="text"
              value={editData.warna || ''}
              onChange={(e) => setEditData({ ...editData, warna: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Warna (Opsional)"
            />
            <select
              value={editData.emoticon}
              onChange={(e) => setEditData({ ...editData, emoticon: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            >
              <option value="🐟">🐟 (Ikan)</option>
              <option value="🐠">🐠 (Ikan Tropis)</option>
              <option value="🦈">🦈 (Hiu)</option>
              <option value="🐸">🐸 (Katak)</option>
              <option value="🐢">🐢 (Kura-kura)</option>
              <option value="🦎">🦎 (Kadal)</option>
              <option value="🐾">🐾 (Default)</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditData(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                onClick={() => handleEdit(editData.id, editData)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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