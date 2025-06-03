import { NavLink } from 'react-router-dom';
import { BookOpen, MessageCircle, Camera, MapPin } from 'lucide-react';

export default function NavbarUser() {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      {[
        { name: 'Edukasi', icon: BookOpen, path: '/user/edukasi' },
        { name: 'Forum', icon: MessageCircle, path: '/user/forum' },
        { name: 'Laporan', icon: Camera, path: '/user/laporan' },
        { name: 'Peta', icon: MapPin, path: '/user/peta' }
      ].map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
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