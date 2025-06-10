import { Link } from 'react-router-dom';
import { Droplets, Menu, X } from 'lucide-react'; 
import { useState } from 'react'; 

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              RiverClean
            </Link>
          </div>

          <div className="md:hidden"> 
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Navigasi untuk Desktop */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <button className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-md text-sm font-medium hover:from-blue-800 hover:to-indigo-800 transition-all duration-300">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-md text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300">
                Register
              </button>
            </Link>
          </nav>
        </div>

        {/* Menu Mobile yang Dapat Dibuka */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2">
            <nav className="flex flex-col items-center space-y-4"> 
              <Link to="/login" className="w-full">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-md text-sm font-medium hover:from-blue-800 hover:to-indigo-800 transition-all duration-300"
                >
                  Login
                </button>
              </Link>
              <Link to="/register" className="w-full">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-md text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
                >
                  Register
                </button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}