import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, MessageCircle, Camera, MapPin, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function NavbarUser() {
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
    <nav className="hidden md:flex items-center space-x-8">
      {[
        { name: 'Edukasi', icon: BookOpen, path: '/user/edukasi' },
        { name: 'Forum', icon: MessageCircle, path: '/user/forum' },
        { name: 'Laporan', icon: Camera, path: '/user/laporan' },
        { name: 'Peta', icon: MapPin, path: '/user/peta' },
        { name: 'Logout', icon: LogOut, path: '/', onClick: handleLogout }, // Tambahan logout
      ].map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          onClick={item.onClick} // Tambahkan onClick untuk logout
          className={({ isActive }) =>
            `flex items-center space-x-2 text-slate-400 transition-colors duration-300 group ${
              isActive ? 'text-cyan-400' : 'hover:text-cyan-400'
            }`
          }
        >
          <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}