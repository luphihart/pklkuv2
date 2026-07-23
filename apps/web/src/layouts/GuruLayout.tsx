import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileCheck, LogOut } from 'lucide-react';

export const GuruLayout: React.FC = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-lg shadow-md">
              PKL
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg text-white leading-none">PKLku</h1>
              <p className="text-xs text-slate-400 mt-0.5">Portal Guru Pembimbing</p>
            </div>
          </div>

          <nav className="space-y-1">
            <NavLink
              to="/guru"
              end
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/guru/bimbingan"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Users className="w-5 h-5" />
              <span>Murid Bimbingan</span>
            </NavLink>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">{user?.name || 'Guru Pembimbing'}</span>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400" title="Keluar">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
};
