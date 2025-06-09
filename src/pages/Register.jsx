import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, Mail, Lock, UserPlus, ArrowLeft, Phone, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [nama, setNama] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameValidationError, setNameValidationError] = useState(null);
  const [formError, setFormError] = useState(null); // PERBAIKAN DI SINI: Deklarasi state formError
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser(); // Destructure with default empty object
      if (user) navigate('/user/dashboard');
    };
    checkSession();
  }, [navigate]);

  const validateInputs = () => {
    setNameValidationError(null); // Reset validasi nama spesifik
    setFormError(null); // Reset validasi form umum

    if (!nama.trim()) {
      setNameValidationError('Nama lengkap wajib diisi.');
      return false;
    }
    if (nama.trim().length < 4) {
      setNameValidationError('Nama harus lebih dari 3 karakter.');
      return false;
    }
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setFormError('Email harus berakhiran @gmail.com'); // Set error umum
      return false;
    }
    if (password.length < 6) {
      setFormError('Kata sandi harus minimal 6 karakter.'); // Set error umum
      return false;
    }
    return true;
  };

  const handleNamaChange = (e) => {
    const value = e.target.value;
    setNama(value);
    if (value.trim().length > 0 && value.trim().length < 4) {
      setNameValidationError('Nama harus lebih dari 3 karakter.');
    } else {
      setNameValidationError(null);
    }
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null); // Reset error di awal submit

    const isValid = validateInputs();
    if (!isValid) {
      setIsLoading(false);
      return; // Hentikan proses jika validasi gagal (pesan sudah di setFormError atau setNameValidationError)
    }

    try {
      console.log('Starting Supabase Auth signUp for:', { email: email.trim(), nama: nama.trim(), whatsappNumber: whatsappNumber?.trim() || null });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) {
        console.error('Supabase Auth signUp Error:', authError.message);
        setFormError(authError.message || 'Pendaftaran gagal. Coba lagi.'); // Set error
        setIsLoading(false);
        // navigate('/login', { state: { message: authError.message || 'Pendaftaran gagal. Coba lagi.' } }); // Redirect ini bisa kita simpan jika ingin menampilkan pesan di halaman login
        return;
      }

      if (!authData.user) {
        console.log('User needs email verification. Auth data:', authData);
        setFormError('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi dan login.'); // Set error
        setIsLoading(false);
        // navigate('/login', { state: { message: 'Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi dan login.' } }); // Redirect
        return;
      }

      console.log('Auth signUp successful, user ID:', authData.user.id);

      const userDataToInsert = {
        id: authData.user.id,
        email: email.trim(),
        nama: nama.trim(),
        whatsapp_number: whatsappNumber?.trim() || null,
        role: 'user',
        points: 0,
        created_at: new Date().toISOString()
      };

      console.log('Attempting to upsert user data into public.users:', userDataToInsert);

      const { error: upsertError } = await supabase
        .from('users')
        .upsert(userDataToInsert, { onConflict: ['id'] });

      if (upsertError) {
        console.error('Supabase Upsert Error into public.users:', upsertError.message);
        setFormError('Pendaftaran berhasil, tetapi gagal menyimpan detail pengguna: ' + upsertError.message); // Set error
        setIsLoading(false);
        // navigate('/login', { state: { message: 'Pendaftaran berhasil, tetapi gagal menyimpan detail pengguna: ' + upsertError.message } });
        return;
      }

      console.log('User data successfully saved to public.users.');
      setFormError('Pendaftaran berhasil! Silakan login.'); // Pesan sukses akhir
      // Redirect ke login setelah sukses
      navigate('/login', { state: { message: 'Pendaftaran berhasil! Silakan login.' } });

    } catch (err) {
      console.error('Unexpected Registration Error:', err);
      setFormError('Terjadi kesalahan tidak terduga: ' + (err.message || '')); // Set error
      setIsLoading(false);
      // navigate('/login', { state: { message: 'Terjadi kesalahan tidak terduga saat pendaftaran.' } });
    } finally {
      setIsLoading(false);
    }
  };

  const isRegisterButtonDisabled = isLoading || nama.trim().length < 3 || !email.toLowerCase().endsWith('@gmail.com') || password.length < 6;


  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-cyan-950/30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:bg-slate-700/50 hover:border-cyan-500/50">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-md">
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

          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl p-8 hover:border-cyan-500/30 transition-all duration-300">
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Nama Lengkap *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={nama}
                    onChange={handleNamaChange}
                    className="w-full pl-4 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="Masukkan nama lengkap (min. 3 karakter)"
                    required
                    disabled={isLoading}
                  />
                </div>
                {nameValidationError && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {nameValidationError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Alamat Email *</label>
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Kata Sandi *</label>
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Nomor WhatsApp (Opsional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="+6281234567890"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {formError && ( // Tampilkan formError jika ada
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400 text-sm">{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isRegisterButtonDisabled}
                className="group relative w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Mendaftar...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Daftar Sekarang</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300 hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>

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