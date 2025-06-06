import { Droplets, LogOut } from 'lucide-react';

export default function HeaderAdmin() {
  const handleLogout = async () => {
    // await supabase.auth.signOut();
    // navigate('/');
    console.log('Logout clicked');
  };

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50 text-white p-4 flex justify-between items-center shadow-xl relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-0 right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="flex items-center space-x-3 relative z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
          <Droplets className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
          River Clean Admin
        </h1>
      </div>
      
      <button
        onClick={handleLogout}
        className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-md border border-red-500/30 rounded-xl transition-all duration-300 hover:scale-105 hover:from-red-500/30 hover:to-red-600/30 relative z-10"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </header>
  );
}