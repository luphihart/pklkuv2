import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { MuridLayout } from './layouts/MuridLayout';
import { MuridDashboard } from './features/dashboard/MuridDashboard';
import { PresensiPage } from './features/presensi/PresensiPage';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './features/dashboard/AdminDashboard';
import { DudiListPage } from './features/master-data/DudiListPage';
import { GuruLayout } from './layouts/GuruLayout';
import { GuruDashboard } from './features/dashboard/GuruDashboard';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Murid Routes */}
        <Route path="/murid" element={<MuridLayout />}>
          <Route index element={<MuridDashboard />} />
          <Route path="presensi" element={<PresensiPage />} />
          <Route path="jurnal" element={<div className="p-4 bg-white rounded-2xl border border-slate-200 text-sm">Modul Jurnal Harian</div>} />
          <Route path="izin" element={<div className="p-4 bg-white rounded-2xl border border-slate-200 text-sm">Modul Pengajuan Izin / Sakit</div>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="master-dudi" element={<DudiListPage />} />
          <Route path="presensi" element={<AdminDashboard />} />
        </Route>

        {/* Guru Routes */}
        <Route path="/guru" element={<GuruLayout />}>
          <Route index element={<GuruDashboard />} />
          <Route path="bimbingan" element={<GuruDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
