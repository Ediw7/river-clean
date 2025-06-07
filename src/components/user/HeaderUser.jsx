import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, MessageCircle, Camera, MapPin, LogOut } from 'lucide-react';
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

  const handleLogoClick = () => {
    navigate('/user/dashboard'); // Navigasi kembali ke dashboard user
  };

  const navItems = [
    { name: 'Edukasi', icon: BookOpen, path: '/user/edukasi' },
    { name: 'Forum', icon: MessageCircle, path: '/user/forum' },
    { name: 'Laporan', icon: Camera, path: '/user/laporan' },
    { name: 'Peta', icon: MapPin, path: '/user/peta' },
    { name: 'Acara', icon: BookOpen, path: '/user/acara' },
    { name: 'Companion', icon: MessageCircle, path: '/user/companion' },
    { name: 'PesanDigital', icon: Camera, path: '/user/pesandigital' },
    { name: 'Tantangan', icon: MapPin, path: '/user/tantangan' },
  ];

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-700/70 text-white p-4 flex justify-between items-center shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-10 w-24 h-24 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="flex items-center space-x-3 relative z-10" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent select-none">
          RiverClean
        </h1>
      </div>
      
      <nav className="hidden md:flex items-center space-x-4 relative z-10">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${
                isActive ? 'bg-cyan-700/40 text-cyan-200 shadow-inner' : 'hover:bg-cyan-900/30 hover:text-cyan-300'
              }`
            }
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
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