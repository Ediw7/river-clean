import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/login');
      else {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.email)
          .single();
        if (userData?.role !== 'user') navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1E40AF] mb-6">User Dashboard</h1>
        <p className="text-gray-700 mb-4">Selamat datang di dashboard user RiverClean!</p>
        <button onClick={handleLogout} className="px-4 py-2 bg-[#1E40AF] text-white rounded hover:bg-blue-700">
          Logout
        </button>
      </div>
    </div>
  );
}