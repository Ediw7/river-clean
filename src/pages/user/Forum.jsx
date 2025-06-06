import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import NavbarUser from '../../components/user/NavbarUser';
import FooterUser from '../../components/user/FooterUser';

export default function Forum() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
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
        // Simulasi tabel forum (buat tabel baru jika diperlukan)
        const { data } = await supabase
          .from('forum') // Buat tabel forum jika belum ada
          .select('*')
          .order('created_at', { ascending: false });

        setThreads(data || []);
      } catch (err) {
        setError('Gagal memuat forum: ' + err.message);
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
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Forum Diskusi</h1>
            {loading ? (
              <p className="text-center">Memuat forum...</p>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                {threads.length === 0 ? (
                  <p className="text-center text-gray-500">Belum ada diskusi.</p>
                ) : (
                  threads.map((thread) => (
                    <div key={thread.id} className="mb-4 p-4 border rounded">
                      <p>{thread.content}</p>
                      <p className="text-sm text-gray-500">Oleh: {thread.user_email}</p>
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