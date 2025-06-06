import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';

export default function Acara() {
  const navigate = useNavigate();
  const [acara, setAcara] = useState([]);
  const [formData, setFormData] = useState({
    judul: '',
    lokasi: '',
    tanggal: '',
    deskripsi: '',
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

      try {
        const { data } = await supabase
          .from('acara_pembersihan')
          .select('*')
          .order('tanggal', { ascending: true });

        setAcara(data || []);
      } catch (err) {
        setError('Gagal memuat acara: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('acara_pembersihan').insert({
        judul: formData.judul,
        lokasi: formData.lokasi,
        tanggal: formData.tanggal,
        deskripsi: formData.deskripsi,
        usulan_oleh: (await supabase.auth.getUser()).data.user.id,
        status: 'pending',
      });

      if (error) throw error;

      setAcara([
        ...acara,
        {
          judul: formData.judul,
          lokasi: formData.lokasi,
          tanggal: formData.tanggal,
          deskripsi: formData.deskripsi,
          usulan_oleh: (await supabase.auth.getUser()).data.user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]);
      setFormData({ judul: '', lokasi: '', tanggal: '', deskripsi: '' });
    } catch (err) {
      setError('Gagal mengusulkan acara: ' + err.message);
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
      <HeaderUser />
      <div className="flex flex-1">
        <NavbarUser />
        <main className="ml-0 md:ml-64 p-8 w-full">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Partisipasi Acara Pembersihan</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4 mb-6">
              <div>
                <label className="block text-gray-700">Judul</label>
                <input
                  type="text"
                  name="judul"
                  value={formData.judul}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Lokasi</label>
                <input
                  type="text"
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Tanggal</label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Usulkan Acara
              </button>
            </form>
            {loading ? (
              <p className="text-center">Memuat acara...</p>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                {acara.length === 0 ? (
                  <p className="text-center text-gray-500">Belum ada acara.</p>
                ) : (
                  acara.map((item) => (
                    <div key={item.id} className="mb-4 p-4 border rounded">
                      <p>Judul: {item.judul}</p>
                      <p>Lokasi: {item.lokasi}</p>
                      <p>Tanggal: {item.tanggal}</p>
                      <p>Status: {item.status}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <FooterUser />
    </div>
  );
}