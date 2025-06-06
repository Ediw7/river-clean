import { useNavigate } from 'react-router-dom'; 
import { Droplets, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase'; 

export default function HeaderAdmin() {
  const navigate = useNavigate(); 

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); 
      navigate('/login'); 
    } catch (error) {
      console.error('Logout failed:', error.message); 
    }
  };

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-700/70 text-white p-4 flex justify-between items-center shadow-xl relative overflow-hidden">

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-10 w-24 h-24 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="flex items-center space-x-3 relative z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
          <Droplets className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent select-none">
          River Clean Admin
        </h1>
      </div>
      
      <button
        onClick={handleLogout}
        className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600/30 to-red-700/30 backdrop-blur-md border border-red-600 rounded-xl transition-transform duration-300 hover:scale-105 hover:from-red-500/50 hover:to-red-600/50 relative z-10 shadow-sm"
      >
        <LogOut className="w-5 h-5 text-white group-hover:text-white transition-colors duration-300" />
        <span className="font-medium text-white group-hover:text-white transition-colors duration-300">Logout</span>
      </button>
    </header>
  );
}
