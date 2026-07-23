import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Camera, BookOpen, FileText, LogOut } from 'lucide-react';

export const MuridLayout: React.FC = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h2 className="font-heading font-semibold text-slate-900 leading-tight text-sm">
              {user?.name || 'Siswa PKL'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{user?.email || 'Siswa'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Keluar"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 flex justify-around items-center shadow-lg">
        <NavLink
          to="/murid"
          end
          className={({ isActive }) =>
            `flex flex-col items-center space-y-1 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-950'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/murid/presensi"
          className={({ isActive }) =>
            `flex flex-col items-center space-y-1 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-950'
            }`
          }
        >
          <Camera className="w-5 h-5" />
          <span>Presensi</span>
        </NavLink>

        <NavLink
          to="/murid/jurnal"
          className={({ isActive }) =>
            `flex flex-col items-center space-y-1 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-950'
            }`
          }
        >
          <BookOpen className="w-5 h-5" />
          <span>Jurnal</span>
        </NavLink>

        <NavLink
          to="/murid/izin"
          className={({ isActive }) =>
            `flex flex-col items-center space-y-1 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-950'
            }`
          }
        >
          <FileText className="w-5 h-5" />
          <span>Izin</span>
        </NavLink>
      </nav>
    </div>
  );
};
