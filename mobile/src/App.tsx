import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CategorySelect from './pages/CategorySelect';
import Capture from './pages/Capture';
import Upload from './pages/Upload';
import Search from './pages/Search';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CategorySelect />} />
      <Route path="/capture/:category" element={<Capture />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/search" element={<Search />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
