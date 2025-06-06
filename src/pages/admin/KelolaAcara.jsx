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
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
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

        const { data } = await supabase.from('acara_pembersihan').select('*').order('created_at', { ascending: false });
        setAcara(data || []);
      } catch (err) {
        setError('Gagal memuat acara: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleEdit = async (id, updatedData) => {
    try {
      const { error } = await supabase
        .from('acara_pembersihan')
        .update({
          judul: updatedData.judul,
          lokasi: updatedData.lokasi,
          tanggal: updatedData.tanggal,
          deskripsi: updatedData.deskripsi,
          poster_url: updatedData.poster_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
      setAcara(acara.map((item) =>
        item.id === id ? { ...item, ...updatedData, updated_at: new Date().toISOString() } : item
      ));
      setEditData(null);
    } catch (err) {
      setError('Gagal mengedit acara: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus acara ini?')) {
      try {
        const { error } = await supabase.from('acara_pembersihan').delete().eq('id', id);
        if (error) throw error;
        setAcara(acara.filter((item) => item.id !== id));
      } catch (err) {
        setError('Gagal menghapus acara: ' + err.message);
      }
    }
  };

  if (error) {
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
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Kelola Acara Pembersihan</h1>
            <button
              onClick={() => navigate('/admin/tambahacara')}
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Tambah Acara
            </button>
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
                        <th className="p-2">Deskripsi</th>
                        <th className="p-2">Poster</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acara.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{item.judul}</td>
                          <td className="p-2">{item.lokasi}</td>
                          <td className="p-2">{new Date(item.tanggal).toLocaleDateString()}</td>
                          <td className="p-2">{item.deskripsi || '-'}</td>
                          <td className="p-2">
                            {item.poster_url ? (
                              <a href={item.poster_url} target="_blank" rel="noopener noreferrer">
                                <img src={item.poster_url} alt="Poster" className="w-16 h-16 object-cover rounded" />
                              </a>
                            ) : (
                              <span className="text-gray-500">Tidak ada poster</span>
                            )}
                          </td>
                          <td className="p-2">{item.status}</td>
                          <td className="p-2 space-x-2">
                            <button
                              onClick={() => setEditData(item)}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Hapus
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
      {/* Modal Edit */}
      {editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Acara</h2>
            <input
              type="text"
              value={editData.judul}
              onChange={(e) => setEditData({ ...editData, judul: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Judul"
              required
            />
            <input
              type="text"
              value={editData.lokasi}
              onChange={(e) => setEditData({ ...editData, lokasi: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Lokasi"
              required
            />
            <input
              type="date"
              value={editData.tanggal}
              onChange={(e) => setEditData({ ...editData, tanggal: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              required
            />
            <textarea
              value={editData.deskripsi || ''}
              onChange={(e) => setEditData({ ...editData, deskripsi: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="Deskripsi (opsional)"
            />
            <input
              type="url"
              value={editData.poster_url || ''}
              onChange={(e) => setEditData({ ...editData, poster_url: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              placeholder="URL Poster (contoh: https://example.com/poster.jpg)"
            />
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