import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import NavbarUser from '../../components/user/NavbarUser';
import FooterUser from '../../components/user/FooterUser';

export default function PesanDigital() {
  const navigate = useNavigate();
  const [pesan, setPesan] = useState([]);
  const [formData, setFormData] = useState({ pesan: '', lokasi: '' });
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
          .from('pesan_digital')
          .select('*')
          .order('created_at', { ascending: false });

        setPesan(data || []);
      } catch (err) {
        setError('Gagal memuat pesan: ' + err.message);
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
      const { error } = await supabase.from('pesan_digital').insert({
        user_id: (await supabase.auth.getUser()).data.user.id,
        email: (await supabase.auth.getUser()).data.user.email,
        pesan: formData.pesan,
        lokasi: formData.lokasi,
      });

      if (error) throw error;

      setPesan([
        ...pesan,
        {
          user_id: (await supabase.auth.getUser()).data.user.id,
          email: (await supabase.auth.getUser()).data.user.email,
          pesan: formData.pesan,
          lokasi: formData.lokasi,
          created_at: new Date().toISOString(),
        },
      ]);
      setFormData({ pesan: '', lokasi: '' });
    } catch (err) {
      setError('Gagal mengirim pesan: ' + err.message);
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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Pesan dalam Botol Digital</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4 mb-6">
              <div>
                <label className="block text-gray-700">Pesan</label>
                <textarea
                  name="pesan"
                  value={formData.pesan}
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
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Kirim Pesan
              </button>
            </form>
            {loading ? (
              <p className="text-center">Memuat pesan...</p>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                {pesan.length === 0 ? (
                  <p className="text-center text-gray-500">Belum ada pesan.</p>
                ) : (
                  pesan.map((item) => (
                    <div key={item.id} className="mb-4 p-4 border rounded">
                      <p>Pesan: {item.pesan}</p>
                      <p>Lokasi: {item.lokasi || '-'}</p>
                      <p>Oleh: {item.email}</p>
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