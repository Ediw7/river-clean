import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';

export default function Peta() {
  const navigate = useNavigate();
  const [petaData, setPetaData] = useState([]);
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
          .from('peta_status')
          .select('*')
          .order('updated_at', { ascending: false });

        setPetaData(data || []);
      } catch (err) {
        setError('Gagal memuat data peta: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Peta Interaktif Sungai</h1>
            {loading ? (
              <p className="text-center">Memuat peta...</p>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                {petaData.length === 0 ? (
                  <p className="text-center text-gray-500">Belum ada data peta.</p>
                ) : (
                  <div>
                    {petaData.map((item) => (
                      <div key={item.id} className="mb-4 p-4 border rounded">
                        <p>Lokasi: {item.lokasi}</p>
                        <p>Status: {item.status}</p>
                        <p>Jenis Limbah: {item.jenis_limbah || '-'}</p>
                        <p>Intensitas Heatmap: {item.heatmap_intensity}</p>
                      </div>
                    ))}
                  </div>
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