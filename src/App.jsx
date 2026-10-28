import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import * as apiClient from './services/apiClient';
import FoodScanner from './pages/FoodScanner';
import Goals from './pages/Goals';
import Home from './pages/Home';
import Profile from './pages/Profile';
import History from './pages/History';
import Onboarding from './pages/Onboarding';
import AuthLanding from './pages/AuthLanding';

// Chat pulls in the Markdown renderer, so it loads only when opened.
const Chat = lazy(() => import('./pages/Chat'));

// Pages for signed-in members; an expired session sends them back to sign-in.
// Chat is not listed: it keeps working anonymously.
const PROTECTED_PATHS = ['/home', '/onboarding', '/scan', '/goals', '/profile', '/history'];

function StartupGate() {
  return <AuthLanding />;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  useEffect(() => {
    // apiClient has already cleared the session; it notifies once per rejected token,
    // and "/" isn't protected, so this can't redirect repeatedly.
    const unsubscribe = apiClient.onSessionExpired(() => {
      if (PROTECTED_PATHS.includes(pathRef.current)) {
        navigate('/', { replace: true, state: { sessionExpired: true } });
      }
    });
    // Quietly drop a stale stored token without delaying the first render.
    apiClient.validateStoredSession();
    return unsubscribe;
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#e9f0e5]">
      <div className="mx-auto min-h-screen w-full max-w-[420px] overflow-x-hidden bg-cream shadow-[0_0_30px_rgba(46,94,62,0.12)]">
        <Routes>
          <Route path="/" element={<StartupGate />} />
          <Route path="/home" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/scan" element={<FoodScanner />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/chat" element={<Suspense fallback={null}><Chat /></Suspense>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
