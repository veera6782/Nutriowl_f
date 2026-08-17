import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Goals from './pages/Goals';
import FoodScanner from './pages/FoodScanner';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/scan" element={<FoodScanner />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
