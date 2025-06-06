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

        // Periksa kesehatan berdasarkan aktivitas terakhir
        if (data) {
          const lastActivity = new Date(data.last_activity);
          const now = new Date();
          const daysInactive = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

          if (daysInactive > 3) {
            // Companion "sakit" jika tidak aktif lebih dari 3 hari
            const newKesehatan = Math.max(data.kesehatan - (daysInactive * 10), 0);
            await supabase
              .from('river_companion')
              .update({ kesehatan: newKesehatan, last_activity: now })
              .eq('id', data.id);
            data.kesehatan = newKesehatan;
          }
        }

        setCompanion(data || null);
      } catch (err) {
        setError('Gagal memuat companion: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();

    // Perbarui aktivitas setiap kali halaman dimuat
    const updateActivity = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && companion) {
        await supabase
          .from('river_companion')
          .update({ last_activity: new Date().toISOString() })
          .eq('id', companion.id);
      }
    };
    updateActivity();
  }, [navigate, companion]);

  const handleAdopsi = async () => {
    try {
      const { error } = await supabase.from('river_companion').insert({
        user_id: (await supabase.auth.getUser()).data.user.id,
        nama: 'Ikan Kecil',
        jenis: 'ikan',
        kesehatan: 100,
        warna: 'biru',
        last_activity: new Date().toISOString(),
        level: 1,
        exp: 0,
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

  const handlePerawatan = async () => {
    if (!companion) return;

    try {
      const newKesehatan = Math.min(companion.kesehatan + 20, 100);

      let newLevel = companion.level;
      let newWarna = companion.warna;

      let newExp = companion.exp + 10; // pakai let agar bisa diubah

      if (newExp >= 50) {
        newLevel = Math.min(companion.level + 1, 5);
        newExp = newExp % 50;
        newWarna = newLevel === 2 ? 'hijau' : newLevel === 3 ? 'kuning' : newLevel === 4 ? 'emas' : 'biru';
      }

      await supabase
        .from('river_companion')
        .update({
          kesehatan: newKesehatan,
          exp: newExp,
          level: newLevel,
          warna: newWarna,
          last_activity: new Date().toISOString(),
        })
        .eq('id', companion.id);

      setCompanion({ ...companion, kesehatan: newKesehatan, exp: newExp, level: newLevel, warna: newWarna });
    } catch (err) {
      setError('Gagal merawat companion: ' + err.message);
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
                <p>Level: {companion.level}</p>
                <p>EXP: {companion.exp}/50</p>
                {companion.kesehatan < 30 && <p className="text-red-500">Companion kamu sakit! Rawat segera!</p>}
                <button
                  onClick={handlePerawatan}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  disabled={companion.kesehatan >= 100}
                >
                  Beri Makan/Rawat (+20 Kesehatan, +10 EXP)
                </button>
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