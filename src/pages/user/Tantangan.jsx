import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import NavbarUser from '../../components/user/NavbarUser';
import FooterUser from '../../components/user/FooterUser';

export default function Tantangan() {
  const navigate = useNavigate();
  const [tantangan, setTantangan] = useState([]);
  const [partisipasi, setPartisipasi] = useState([]);
  const [formData, setFormData] = useState({ submission: null });
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
        const [tantanganData, partisipasiData] = await Promise.all([
          supabase.from('tantangan').select('*').order('created_at', { ascending: false }),
          supabase
            .from('partisipasi_tantangan')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        ]);

        setTantangan(tantanganData.data || []);
        setPartisipasi(partisipasiData.data || []);
      } catch (err) {
        setError('Gagal memuat tantangan: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : null });
  };

  const handleSubmit = async (tantanganId) => {
    try {
      let submissionUrl = null;
      if (formData.submission) {
        const { data, error: uploadError } = await supabase.storage
          .from('tantangan')
          .upload(`${Date.now()}_${formData.submission.name}`, formData.submission);
        if (uploadError) throw uploadError;
        submissionUrl = `${supabase.storage.from('tantangan').getPublicUrl(data.path).data.publicUrl}`;
      }

      const { error } = await supabase.from('partisipasi_tantangan').insert({
        user_id: (await supabase.auth.getUser()).data.user.id,
        tantangan_id: tantanganId,
        submission_url: submissionUrl,
      });

      if (error) throw error;

      setPartisipasi([
        ...partisipasi,
        {
          user_id: (await supabase.auth.getUser()).data.user.id,
          tantangan_id: tantanganId,
          submission_url: submissionUrl,
          status: 'menunggu',
          created_at: new Date().toISOString(),
        },
      ]);
      setFormData({ submission: null });
    } catch (err) {
      setError('Gagal mengirim partisipasi: ' + err.message);
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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Tantangan Pahlawan Sungai</h1>
            {loading ? (
              <p className="text-center">Memuat tantangan...</p>
            ) : (
              <div>
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                  <h2 className="text-xl font-semibold mb-4">Daftar Tantangan</h2>
                  {tantangan.length === 0 ? (
                    <p className="text-center text-gray-500">Belum ada tantangan.</p>
                  ) : (
                    tantangan.map((item) => (
                      <div key={item.id} className="mb-4 p-4 border rounded">
                        <p>Judul: {item.judul}</p>
                        <p>Deskripsi: {item.deskripsi}</p>
                        <p>Poin: {item.poin}</p>
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(item.id); }} className="mt-2">
                          <input
                            type="file"
                            name="submission"
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                          />
                          <button
                            type="submit"
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Kirim Partisipasi
                          </button>
                        </form>
                      </div>
                    ))
                  )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">Riwayat Partisipasi Anda</h2>
                  {partisipasi.length === 0 ? (
                    <p className="text-center text-gray-500">Belum ada partisipasi.</p>
                  ) : (
                    partisipasi.map((item) => (
                      <div key={item.id} className="mb-4 p-4 border rounded">
                        <p>Tantangan ID: {item.tantangan_id}</p>
                        <p>Status: {item.status}</p>
                        {item.submission_url && (
                          <img src={item.submission_url} alt="Submission" className="mt-2 w-32 h-32 object-cover" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <FooterUser />
    </div>
  );
}