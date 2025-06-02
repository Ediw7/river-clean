import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) navigate('/user/dashboard');
    };
    checkSession();
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
  
    console.log('Registering with email:', email);
    console.log('Password:', password);
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'user' } }, // Tetap default sebagai 'user'
    });
  
    if (error) {
      console.log('Supabase Error:', error);
      setError(error.message);
      return;
    }
  
    // Sinkronkan data ke tabel users
    const { error: insertError } = await supabase.from('users').insert([{ email, role: 'user' }]);
    if (insertError) {
      setError('Gagal menyimpan data pengguna: ' + insertError.message);
      return;
    }
  
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-cyan-950/30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-700/50 hover:border-cyan-500/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mb-6">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                Daftar
              </span>
            </h1>
            <p className="text-slate-400">Bergabung dengan komunitas River Hero</p>
          </div>

          {/* Registration Form */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl p-8 hover:border-cyan-500/30 transition-all duration-300">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="Masukkan password"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Register Button */}
              <button 
                type="submit" 
                className="group relative w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <UserPlus className="w-5 h-5" />
                  <span>Daftar Sekarang</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Sudah punya akun?{' '}
                <Link 
                  to="/login" 
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300 hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Dengan mendaftar, Anda setuju dengan{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
                Syarat & Ketentuan
              </a>{' '}
              dan{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
                Kebijakan Privasi
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}