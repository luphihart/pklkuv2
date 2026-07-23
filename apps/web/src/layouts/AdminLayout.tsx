import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building, ShieldCheck, LogOut, FileSpreadsheet, Users } from 'lucide-react';

export const AdminLayout: React.FC = () => {
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
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg shadow-md">
              PKL
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg text-white leading-none">PKLku</h1>
              <p className="text-xs text-slate-400 mt-0.5">Admin Portal</p>
            </div>
          </div>

          <nav className="space-y-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/admin/master-dudi"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Building className="w-5 h-5" />
              <span>Master DUDI</span>
            </NavLink>

            <NavLink
              to="/admin/penempatan"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Users className="w-5 h-5" />
              <span>Plotting Penempatan</span>
            </NavLink>

            <NavLink
              to="/admin/presensi"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Rekap Presensi</span>
            </NavLink>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-semibold text-slate-300">{user?.name || 'Administrator'}</span>
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
