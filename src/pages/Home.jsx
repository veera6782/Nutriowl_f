import React from 'react';
import OwlAssistant from '../components/OwlAssistant';
import BottomNavigation from '../components/BottomNavigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-cream font-poppins text-darkgreen p-4 pb-32">
      <div className="flex items-start justify-between">
        <button aria-label="Back" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">{'<'}</button>
        <div className="flex-1 mx-4">
          <h1 className="text-3xl font-bold">Home</h1>
          <p className="text-sm text-gray-600 mt-1">Your nutrition dashboard is ready.</p>
        </div>
        <div className="w-24 h-24">
          <OwlAssistant />
        </div>
      </div>

      <div className="mt-6 bg-white rounded-3xl shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Today&apos;s focus</p>
            <h2 className="mt-1 text-2xl font-bold">Eat light and hydrate</h2>
          </div>
          <div className="text-3xl">🌿</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="bg-green-50 rounded-3xl p-4 shadow-sm">
          <div className="text-sm text-gray-600">Daily goal</div>
          <div className="mt-2 text-3xl font-bold text-green-700">82%</div>
          <div className="mt-1 text-sm text-gray-600">Calories on track</div>
        </div>
        <div className="bg-[#fffaf1] rounded-3xl p-4 shadow-sm">
          <div className="text-sm text-gray-600">Hydration</div>
          <div className="mt-2 text-3xl font-bold text-green-700">5.6L</div>
          <div className="mt-1 text-sm text-gray-600">of 8L today</div>
        </div>
      </div>

      <BottomNavigation active="home" />
    </div>
  );
}
