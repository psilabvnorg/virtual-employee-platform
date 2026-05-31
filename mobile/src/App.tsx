import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CategorySelect from './pages/CategorySelect';
import Capture from './pages/Capture';
import Upload from './pages/Upload';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Onboard from './pages/Onboard';

function needsOnboard(): boolean {
  return localStorage.getItem('doc-vault-onboarded') !== 'true';
}

export default function App() {
  return (
    <Routes>
      <Route path="/onboard" element={<Onboard />} />
      <Route path="/" element={needsOnboard() ? <Navigate to="/onboard" replace /> : <CategorySelect />} />
      <Route path="/capture/:category" element={<Capture />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/search" element={<Search />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to={needsOnboard() ? '/onboard' : '/'} replace />} />
    </Routes>
  );
}
