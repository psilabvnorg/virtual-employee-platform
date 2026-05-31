import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CategorySelect from './pages/CategorySelect';
import Capture from './pages/Capture';
import Upload from './pages/Upload';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Onboard from './pages/Onboard';

export default function App() {
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem('doc-vault-onboarded') === 'true',
  );

  return (
    <Routes>
      <Route path="/onboard" element={<Onboard onComplete={() => setOnboarded(true)} />} />
      <Route path="/" element={onboarded ? <CategorySelect /> : <Navigate to="/onboard" replace />} />
      <Route path="/capture/:category" element={<Capture />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/search" element={<Search />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to={onboarded ? '/' : '/onboard'} replace />} />
    </Routes>
  );
}
