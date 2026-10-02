import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthLanding() {
  const navigate = useNavigate();

  const goToOnboarding = () => navigate('/onboarding');

  return (
    <div className="flex min-h-screen flex-col bg-cream font-poppins text-darkgreen">
      <div className="my-auto mx-auto w-full max-w-[420px] px-4 py-8">
        <div className="relative mt-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#edf7ea] via-white to-[#e9f5e8] px-5 pb-5 pt-6 shadow-[0_12px_30px_rgba(46,94,62,0.10)] ring-1 ring-[#dbe9d9]">
          <div className="absolute -left-6 top-10 h-20 w-20 rounded-full bg-[#dff2de] blur-xl" />
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#e5f5de] blur-xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#5d7e66]">Welcome</p>
              <h1 className="mt-2 text-[2.8rem] font-bold leading-[0.94] tracking-[-0.06em] text-darkgreen">
                Let&apos;s get<br />started
              </h1>
            </div>
            <div className="w-[150px] shrink-0 overflow-hidden rounded-full bg-[#f4f9f2] p-1 shadow-[0_8px_20px_rgba(46,94,62,0.08)]">
              <img src="/nutriowl_mascot_full.jpg" alt="NutriOwl mascot" className="h-full w-full object-contain" />
            </div>
          </div>

          <p className="relative mt-4 text-[15px] leading-6 text-gray-600">
            Sign in or create an account to personalize your nutrition journey and keep your goals on track.
          </p>
        </div>

        <div className="mt-7 space-y-3">
          <button
            type="button"
            onClick={goToOnboarding}
            className="flex w-full items-center justify-center rounded-[18px] bg-[#4CAF50] px-4 py-4 text-base font-semibold text-white shadow-[0_10px_20px_rgba(76,175,80,0.28)] transition hover:bg-[#3f9d45]"
          >
            Sign Up
          </button>

          <button
            type="button"
            onClick={goToOnboarding}
            className="flex w-full items-center justify-center rounded-[18px] border border-[#bfd7c1] bg-white px-4 py-4 text-base font-semibold text-darkgreen shadow-[0_8px_20px_rgba(46,94,62,0.07)] transition hover:bg-[#f4f9f2]"
          >
            Sign In
          </button>
        </div>

        <div className="mt-6 rounded-[18px] bg-white/70 px-4 py-3 text-center text-[13px] text-gray-600 ring-1 ring-[#e2ebdf]">
          By continuing, you agree to NutriOwl&apos;s healthy habits and personalized guidance.
        </div>
      </div>
    </div>
  );
}
