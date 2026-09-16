import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FoodScanner from './pages/FoodScanner';
import Goals from './pages/Goals';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import History from './pages/History';
import Onboarding from './pages/Onboarding';

function StartupGate() {
  return <Onboarding />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#e9f0e5]">
      <div className="mx-auto min-h-screen w-full max-w-[420px] overflow-x-hidden bg-cream shadow-[0_0_30px_rgba(46,94,62,0.12)]">
        <Routes>
          <Route path="/" element={<StartupGate />} />
          <Route path="/home" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/scan" element={<FoodScanner />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
