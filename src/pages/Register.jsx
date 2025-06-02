import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#1E40AF] mb-6 text-center">Register</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-[#16A34A] text-white p-2 rounded hover:bg-green-700">
            Register
          </button>
        </form>
        <p className="text-center mt-4">
          Sudah punya akun? <Link to="/login" className="text-[#1E40AF] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}