import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api-client';
import { LogIn, Lock, Mail, AlertCircle, Shield, UserCheck, GraduationCap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, user } = res.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'guru') {
        navigate('/guru');
      } else {
        navigate('/murid');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal login. Periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <span className="font-heading font-extrabold text-2xl tracking-wider">PKL</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">PKLku Digital System</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Sistem Informasi Manajemen Magang / PKL SMK</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@smk.sch.id"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Memproses...' : 'Masuk Aplikasi'}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-xs text-slate-400 font-medium mb-3">Quick Login (Akun Demo Seed):</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@smk.sch.id')}
              className="py-2 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-600 text-xs font-medium flex flex-col items-center justify-center transition-colors"
            >
              <Shield className="w-4 h-4 mb-1 text-purple-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('guru1@smk.sch.id')}
              className="py-2 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-600 text-xs font-medium flex flex-col items-center justify-center transition-colors"
            >
              <UserCheck className="w-4 h-4 mb-1 text-emerald-600" />
              <span>Guru</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('siswa1@smk.sch.id')}
              className="py-2 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-600 text-xs font-medium flex flex-col items-center justify-center transition-colors"
            >
              <GraduationCap className="w-4 h-4 mb-1 text-blue-600" />
              <span>Murid</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
