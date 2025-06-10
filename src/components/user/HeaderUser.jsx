import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, MessageCircle, Camera, MapPin, LogOut, Menu, X } from 'lucide-react'; 
import { supabase } from '../../lib/supabase';
import { useState } from 'react'; 

export default function HeaderUser() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleLogoClick = () => {
    navigate('/user/dashboard');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', icon: BookOpen, path: '/user/dashboard' }, 
    { name: 'Laporan', icon: Camera, path: '/user/laporan' },
    { name: 'Peta', icon: MapPin, path: '/user/peta' },
    { name: 'Acara', icon: BookOpen, path: '/user/acara' },
    { name: 'Companion', icon: MessageCircle, path: '/user/companion' },
    { name: 'Pesan Digital', icon: MessageCircle, path: '/user/pesandigital' },
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-700/70 text-white p-4 flex justify-between items-center shadow-xl relative overflow-visible">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-10 w-24 h-24 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Logo */}
      <div className="flex items-center space-x-3 relative z-10" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent select-none">
          RiverClean
        </h1>
      </div>
      

      <div className="flex items-center md:hidden relative z-10">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Navigasi Desktop */}
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
        <button
          onClick={handleLogout}
          className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600/30 to-red-700/30 border border-red-600 rounded-xl transition-transform duration-300 hover:scale-105 hover:from-red-500/50 hover:to-red-600/50 shadow-sm"
        >
          <LogOut className="w-5 h-5 text-white group-hover:text-white transition-colors duration-300" />
          <span className="font-medium text-white group-hover:text-white transition-colors duration-300">Logout</span>
        </button>
      </nav>
      
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-slate-700/70 py-4 shadow-xl z-30">
          <nav className="flex flex-col items-center space-y-4 px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)} 
                className={({ isActive }) =>
                  `flex items-center space-x-2 w-full justify-center px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-cyan-700/40 text-cyan-200 shadow-inner' : 'hover:bg-cyan-900/30 hover:text-cyan-300'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-base font-medium">{item.name}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600/30 to-red-700/30 border border-red-600 rounded-xl transition-transform duration-300 hover:from-red-500/50 hover:to-red-600/50 shadow-sm"
            >
              <LogOut className="w-5 h-5 text-white" />
              <span className="font-medium text-white">Logout</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}