import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        navigate(userData?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.toLowerCase().endsWith('@gmail.com') || !password) {
      setError('Email harus @gmail.com dan kata sandi wajib diisi.');
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user.id)
        .single();

      if (!userData) {
        setError('Data pengguna tidak ditemukan. Silakan daftar ulang.');
        return;
      }

      navigate(userData.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (err) {
      setError(err.message || 'Email atau kata sandi salah. Coba lagi.');
      console.error('Login Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-cyan-950/30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="absolute top-4 left-4 md:left-6 z-20">
        <Link to="/" className="inline-flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-700/50 hover:border-cyan-500/50">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Kembali</span>
        </Link>
      </div>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mb-6">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                Masuk
              </span>
            </h1>
            <p className="text-slate-400">Masuk ke akun River Hero Anda</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl p-6 sm:p-8 hover:border-cyan-500/30 transition-all duration-300">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Alamat Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="nama@gmail.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Kata Sandi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="Masukkan kata sandi"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              <button 
                type="submit" 
                className="group relative w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <LogIn className="w-5 h-5" />
                  <span>Masuk</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Belum punya akun?{' '}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300 hover:underline">
                  Daftar di sini
                </Link>
              </p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Dengan masuk, Anda setuju dengan{' '}
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