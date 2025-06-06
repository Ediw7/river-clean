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
    <header className="bg-[#1E3A8A] text-white p-4 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">River Clean</h1>
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-1 text-white transition duration-300 group ${
                  isActive ? 'text-cyan-300' : 'hover:text-cyan-300'
                }`
              }
            >
              <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </header>
  );
}
