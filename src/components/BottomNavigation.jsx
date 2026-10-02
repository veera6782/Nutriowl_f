import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiCamera, FiHome, FiMessageCircle, FiTarget, FiUser } from 'react-icons/fi';

export default function BottomNavigation({ active = 'scan' }) {
  const items = [
    { key: 'home', label: 'Home', icon: FiHome, to: '/home' },
    { key: 'goals', label: 'Goals', icon: FiTarget, to: '/goals' },
    { key: 'scan', label: 'Scan', icon: FiCamera, to: '/scan' },
    { key: 'chat', label: 'Chat', icon: FiMessageCircle, to: '/chat' },
    { key: 'profile', label: 'Profile', icon: FiUser, to: '/profile' }
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 flex w-[calc(100%-2rem)] max-w-[388px] -translate-x-1/2 items-center justify-between rounded-3xl bg-white p-4 shadow-lg">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <NavLink key={item.key} to={item.to} aria-label={`Navigate to ${item.label}`} className={`flex-1 flex flex-col items-center gap-1 text-sm ${active === item.key ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active === item.key ? 'bg-green-50' : ''}`}>
              <Icon size={20} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="text-xs">{item.label}</div>
          </NavLink>
        );
      })}
    </nav>
  );
}
