import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Map,
  Calendar,
  Users,
  Trophy,
  Settings,
} from 'lucide-react';

export default function SidebarAdmin() {
  return (
    <aside className="w-60 h-screen bg-slate-950 text-white p-4 shadow-lg border-r border-slate-800">
      <div className="mb-6 mt-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Dashboard Admin
        </h2>
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
              `flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
