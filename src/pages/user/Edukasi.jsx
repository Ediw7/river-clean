import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import HeaderUser from '../../components/user/HeaderUser';
import NavbarUser from '../../components/user/NavbarUser';
import FooterUser from '../../components/user/FooterUser';

export default function Edukasi() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/login');
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <HeaderUser />
      <div className="flex flex-1">
        <main className="ml-0 md:ml-64 p-8 w-full">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">Edukasi Sungai</h1>
            <p className="text-gray-700 mb-4">
              Pelajari tentang ekosistem sungai, pentingnya menjaga kebersihan, dan cara-cara berkontribusi untuk lingkungan.
            </p>
            {/* Tambahkan konten edukasi di sini, misalnya artikel atau video */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-2">Artikel: Pentingnya Sungai Bersih</h2>
              <p>Sungai adalah sumber kehidupan bagi banyak ekosistem. Menjaga kebersihannya...</p>
            </div>
          </div>
        </main>
      </div>
      <FooterUser />
    </div>
  );
}