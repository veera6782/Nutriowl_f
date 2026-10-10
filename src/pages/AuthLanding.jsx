import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail } from 'react-icons/fi';
import profileService from '../services/profileService';
import * as apiClient from '../services/apiClient';

export default function AuthLanding() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const profile = mode === 'signup'
        ? await apiClient.signUp(normalizedEmail, password)
        : await apiClient.signIn(normalizedEmail, password);
      profileService.saveProfile(profile);
      navigate(mode === 'signup' || !profile.onboardingCompleted ? '/onboarding' : '/home', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Unable to complete your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream font-poppins text-darkgreen">
      <div className="my-auto mx-auto w-full max-w-[420px] px-4 py-8">
        <div className="relative mt-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#edf7ea] via-white to-[#e9f5e8] px-5 pb-5 pt-6 shadow-[0_12px_30px_rgba(46,94,62,0.10)] ring-1 ring-[#dbe9d9]">
          <div className="absolute -left-6 top-10 h-20 w-20 rounded-full bg-[#dff2de] blur-xl" />
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#e5f5de] blur-xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#5d7e66]">
                {mode ? (mode === 'signup' ? 'Create account' : 'Welcome back') : 'Welcome'}
              </p>
              <h1 className="mt-2 text-[2.8rem] font-bold leading-[0.94] tracking-[-0.06em] text-darkgreen">
                {mode ? (mode === 'signup' ? <>Let&apos;s get<br />started</> : <>Good to<br />see you</>) : <>Let&apos;s get<br />started</>}
              </h1>
            </div>
            <div className="w-[150px] shrink-0 overflow-hidden rounded-full bg-[#f4f9f2] p-1 shadow-[0_8px_20px_rgba(46,94,62,0.08)]">
              <img src="/nutriowl_mascot_full.jpg" alt="NutriOwl mascot" className="h-full w-full object-contain" />
            </div>
          </div>
        </div>

        <p className="mt-4 px-1 text-[15px] leading-6 text-gray-600">
          {mode
            ? mode === 'signup'
              ? 'Create an account with your email and a password.'
              : 'Sign in with your email and password.'
            : 'Sign in or create an account to personalize your nutrition journey and keep your goals on track.'}
        </p>

        {!mode ? (
          <div className="mt-7 space-y-3">
            <button
              type="button"
              onClick={() => changeMode('signup')}
              className="flex w-full items-center justify-center rounded-[18px] bg-[#4CAF50] px-4 py-4 text-base font-semibold text-white shadow-[0_10px_20px_rgba(76,175,80,0.28)] transition hover:bg-[#3f9d45]"
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => changeMode('signin')}
              className="flex w-full items-center justify-center rounded-[18px] border border-[#bfd7c1] bg-white px-4 py-4 text-base font-semibold text-darkgreen shadow-[0_8px_20px_rgba(46,94,62,0.07)] transition hover:bg-[#f4f9f2]"
            >
              Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="auth-email" className="mb-2 block text-sm font-semibold">Email</label>
              <div className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 shadow-sm ring-1 ring-[#dfe8da]">
                <FiMail className="shrink-0 text-green-700" aria-hidden="true" />
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-base outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="auth-password" className="mb-2 block text-sm font-semibold">Password</label>
              <div className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 shadow-sm ring-1 ring-[#dfe8da]">
                <FiLock className="shrink-0 text-green-700" aria-hidden="true" />
                <input
                  id="auth-password"
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  minLength={8}
                  required
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-transparent text-base outline-none"
                />
              </div>
            </div>
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-confirm-password" className="mb-2 block text-sm font-semibold">Retype password</label>
                <div className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 shadow-sm ring-1 ring-[#dfe8da]">
                  <FiLock className="shrink-0 text-green-700" aria-hidden="true" />
                  <input
                    id="auth-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
                    placeholder="Retype your password"
                    className="w-full bg-transparent text-base outline-none"
                  />
                </div>
              </div>
            )}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-[18px] bg-[#4CAF50] px-4 py-4 text-base font-semibold text-white shadow-[0_10px_20px_rgba(76,175,80,0.28)] transition hover:bg-[#3f9d45] disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => changeMode(null)}
              className="w-full py-2 text-sm font-medium text-green-800"
            >
              Back
            </button>
          </form>
        )}

        {!mode && (
          <p className="mt-6 px-1 text-[13px] leading-5 text-gray-600">
            By continuing, you agree to NutriOwl&apos;s healthy habits and personalized guidance.
          </p>
        )}
      </div>
    </div>
  );
}
