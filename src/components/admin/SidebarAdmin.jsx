import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Map, Calendar, Users, Trophy, Settings } from 'lucide-react';

export default function SidebarAdmin() {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen fixed top-0 left-0 p-4">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-300">Admin Menu</h2>
      </div>
      <nav className="space-y-2">
        {[
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Kelola Laporan', path: '/admin/laporan', icon: FileText },
          { name: 'Kelola Peta', path: '/admin/peta', icon: Map },
          { name: 'Kelola Acara', path: '/admin/acara', icon: Calendar },
          { name: 'Kelola Pengguna', path: '/admin/pengguna', icon: Users },
          { name: 'Kelola Tantangan', path: '/admin/tantangan', icon: Trophy },
          { name: 'Kelola Companion', path: '/admin/companion', icon: Settings },
        ].map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-blue-500 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}