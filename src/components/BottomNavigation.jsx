import React from 'react';
import { NavLink } from 'react-router-dom';

export default function BottomNavigation({ active = 'scan' }) {
  const items = [
    { key: 'home', label: 'Home', icon: '🏠', to: '/home' },
    { key: 'goals', label: 'Goals', icon: '🎯', to: '/goals' },
    { key: 'scan', label: 'Scan', icon: '🔲', to: '/scan' },
    { key: 'chat', label: 'Chat', icon: '💬', to: '/chat' },
    { key: 'profile', label: 'Profile', icon: '👤', to: '/profile' }
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 flex w-[calc(100%-2rem)] max-w-[388px] -translate-x-1/2 items-center justify-between rounded-3xl bg-white p-4 shadow-lg">
      {items.map(i => (
        <NavLink key={i.key} to={i.to} aria-label={`Navigate to ${i.label}`} className={`flex-1 flex flex-col items-center gap-1 text-sm ${active === i.key ? 'text-green-600' : 'text-gray-500'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active === i.key ? 'bg-green-50' : ''}`}>{i.icon}</div>
          <div className="text-xs">{i.label}</div>
        </NavLink>
      ))}
    </nav>
  );
}
