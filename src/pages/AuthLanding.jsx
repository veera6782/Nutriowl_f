import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail } from 'react-icons/fi';
import LanguageToggle from '../components/LanguageToggle';
import { useI18n } from '../i18n/LanguageContext';
import profileService from '../services/profileService';
import * as apiClient from '../services/apiClient';

export default function AuthLanding() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // { key } for our own messages (re-translated on language change), { text } for server messages.
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError({ key: 'auth.errors.invalidEmail' });
      return;
    }
    if (password.length < 8) {
      setError({ key: 'auth.errors.passwordShort' });
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError({ key: 'auth.errors.passwordMismatch' });
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
      setError(submitError.message ? { text: submitError.message } : { key: 'auth.errors.generic' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream font-poppins text-darkgreen">
      <div className="my-auto mx-auto w-full max-w-[420px] px-4 py-8">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>

        <div className="relative mt-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#edf7ea] via-white to-[#e9f5e8] px-5 pb-5 pt-6 shadow-[0_12px_30px_rgba(46,94,62,0.10)] ring-1 ring-[#dbe9d9]">
          <div className="absolute -left-6 top-10 h-20 w-20 rounded-full bg-[#dff2de] blur-xl" />
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#e5f5de] blur-xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#5d7e66]">
                {mode ? (mode === 'signup' ? t('auth.eyebrowCreate') : t('auth.eyebrowBack')) : t('auth.eyebrowWelcome')}
              </p>
              <h1 className="mt-2 whitespace-pre-line text-[2.8rem] font-bold leading-[0.94] tracking-[-0.06em] text-darkgreen">
                {mode === 'signin' ? t('auth.headingBack') : t('auth.headingStart')}
              </h1>
            </div>
            <div className="w-[150px] shrink-0 overflow-hidden rounded-full bg-[#f4f9f2] p-1 shadow-[0_8px_20px_rgba(46,94,62,0.08)]">
              <img src="/nutriowl_mascot_full.jpg" alt={t('common.mascotAlt')} className="h-full w-full object-contain" />
            </div>
          </div>
        </div>

        <p className="mt-4 px-1 text-[15px] leading-6 text-gray-600">
          {mode
            ? mode === 'signup'
              ? t('auth.introSignup')
              : t('auth.introSignin')
            : t('auth.intro')}
        </p>

        {!mode ? (
          <div className="mt-7 space-y-3">
            <button
              type="button"
              onClick={() => changeMode('signup')}
              className="flex w-full items-center justify-center rounded-[18px] bg-[#4CAF50] px-4 py-4 text-base font-semibold text-white shadow-[0_10px_20px_rgba(76,175,80,0.28)] transition hover:bg-[#3f9d45]"
            >
              {t('auth.signUp')}
            </button>
            <button
              type="button"
              onClick={() => changeMode('signin')}
              className="flex w-full items-center justify-center rounded-[18px] border border-[#bfd7c1] bg-white px-4 py-4 text-base font-semibold text-darkgreen shadow-[0_8px_20px_rgba(46,94,62,0.07)] transition hover:bg-[#f4f9f2]"
            >
              {t('auth.signIn')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="auth-email" className="mb-2 block text-sm font-semibold">{t('auth.email')}</label>
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
              <label htmlFor="auth-password" className="mb-2 block text-sm font-semibold">{t('auth.password')}</label>
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
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full bg-transparent text-base outline-none"
                />
              </div>
            </div>
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-confirm-password" className="mb-2 block text-sm font-semibold">{t('auth.confirmPassword')}</label>
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
                    placeholder={t('auth.confirmPlaceholder')}
                    className="w-full bg-transparent text-base outline-none"
                  />
                </div>
              </div>
            )}
            {error && <p role="alert" className="text-sm text-red-600">{error.key ? t(error.key) : error.text}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-[18px] bg-[#4CAF50] px-4 py-4 text-base font-semibold text-white shadow-[0_10px_20px_rgba(76,175,80,0.28)] transition hover:bg-[#3f9d45] disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? t('auth.pleaseWait') : mode === 'signup' ? t('auth.createAccount') : t('auth.signIn')}
            </button>
            <button
              type="button"
              onClick={() => changeMode(null)}
              className="w-full py-2 text-sm font-medium text-green-800"
            >
              {t('common.back')}
            </button>
          </form>
        )}

        {!mode && (
          <p className="mt-6 px-1 text-[13px] leading-5 text-gray-600">
            {t('auth.terms')}
          </p>
        )}
      </div>
    </div>
  );
}
