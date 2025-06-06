import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import FooterUser from '../../components/user/FooterUser';

export default function Companion() {
  const navigate = useNavigate();
  const [companion, setCompanion] = useState(null);
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
          .from('river_companion')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setCompanion(data || null);
      } catch (err) {
        setError('Gagal memuat companion: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleAdopsi = async () => {
    try {
      const { error } = await supabase.from('river_companion').insert({
        user_id: (await supabase.auth.getUser()).data.user.id,
        nama: 'Ikan Kecil',
        jenis: 'ikan',
        kesehatan: 100,
        warna: 'biru',
      });

      if (error) throw error;

      const { data } = await supabase
        .from('river_companion')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id)
        .single();

      setCompanion(data);
    } catch (err) {
      setError('Gagal mengadopsi companion: ' + err.message);
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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Sungai Virtual Pet</h1>
            {loading ? (
              <p className="text-center">Memuat companion...</p>
            ) : companion ? (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <p>Nama: {companion.nama}</p>
                <p>Jenis: {companion.jenis}</p>
                <p>Kesehatan: {companion.kesehatan}%</p>
                <p>Warna: {companion.warna}</p>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <p>Kamu belum memiliki companion!</p>
                <button
                  onClick={handleAdopsi}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Adopsi Companion
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      <FooterUser />
    </div>
  );
}