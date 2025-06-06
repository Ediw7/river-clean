import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function HeaderUser() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="bg-[#1E3A8A] text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">River Clean</h1>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
    </header>
  );
}