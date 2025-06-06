import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';

export default function Laporan() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    foto: null,
    deskripsi: '',
    lokasi: '',
    jenis_sampah: '',
  });
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

      try {
        const { data } = await supabase
          .from('laporan_pencemaran')
          .select('*')
          .eq('email', user.email)
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

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let fotoUrl = null;
      if (formData.foto) {
        const { data, error: uploadError } = await supabase.storage
          .from('laporan')
          .upload(`${Date.now()}_${formData.foto.name}`, formData.foto);
        if (uploadError) throw uploadError;
        fotoUrl = `${supabase.storage.from('laporan').getPublicUrl(data.path).data.publicUrl}`;
      }

      const { error } = await supabase.from('laporan_pencemaran').insert({
        user_id: (await supabase.auth.getUser()).data.user.id,
        email: (await supabase.auth.getUser()).data.user.email,
        foto_url: fotoUrl,
        deskripsi: formData.deskripsi,
        lokasi: formData.lokasi,
        jenis_sampah: formData.jenis_sampah,
        saran: 'Saran akan dihitung oleh AI...', // Placeholder untuk AI
      });

      if (error) throw error;

      setLaporan([
        ...laporan,
        {
          user_id: (await supabase.auth.getUser()).data.user.id,
          email: (await supabase.auth.getUser()).data.user.email,
          foto_url: fotoUrl,
          deskripsi: formData.deskripsi,
          lokasi: formData.lokasi,
          jenis_sampah: formData.jenis_sampah,
          status: 'menunggu',
          created_at: new Date().toISOString(),
        },
      ]);
      setFormData({ foto: null, deskripsi: '', lokasi: '', jenis_sampah: '' });
    } catch (err) {
      setError('Gagal mengirim laporan: ' + err.message);
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
        <main className="ml-0 md:ml-64 p-8 w-full">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Lapor Pencemaran Sungai</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
              <div>
                <label className="block text-gray-700">Foto</label>
                <input
                  type="file"
                  name="foto"
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
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
                <label className="block text-gray-700">Jenis Sampah</label>
                <input
                  type="text"
                  name="jenis_sampah"
                  value={formData.jenis_sampah}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Kirim Laporan
              </button>
            </form>
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Riwayat Laporan Anda</h2>
              {loading ? (
                <p className="text-center">Memuat laporan...</p>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  {laporan.length === 0 ? (
                    <p className="text-center text-gray-500">Belum ada laporan.</p>
                  ) : (
                    laporan.map((item) => (
                      <div key={item.id} className="mb-4 p-4 border rounded">
                        <p>Deskripsi: {item.deskripsi}</p>
                        <p>Lokasi: {item.lokasi}</p>
                        <p>Jenis Sampah: {item.jenis_sampah}</p>
                        <p>Status: {item.status}</p>
                        {item.foto_url && (
                          <img src={item.foto_url} alt="Laporan" className="mt-2 w-32 h-32 object-cover" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <FooterUser />
    </div>
  );
}