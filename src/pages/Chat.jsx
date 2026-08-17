import React from 'react';
import OwlAssistant from '../components/OwlAssistant';
import BottomNavigation from '../components/BottomNavigation';

export default function Chat() {
  return (
    <div className="min-h-screen bg-cream font-poppins text-darkgreen p-4 pb-32">
      <div className="flex items-start justify-between">
        <button aria-label="Back" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">{'<'}</button>
        <div className="flex-1 mx-4">
          <h1 className="text-3xl font-bold">Chat</h1>
          <p className="text-sm text-gray-600 mt-1">Ask NutriOwl for quick nutrition support.</p>
        </div>
        <div className="w-24 h-24">
          <OwlAssistant />
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm">
        <div className="rounded-2xl bg-green-50 p-4 text-sm text-gray-700">
          Hi! I can help you track meals, hydration, and protein goals.
        </div>
        <div className="mt-4 rounded-2xl bg-[#f7f4ec] p-4 text-sm text-gray-700">
          Today you are on target for your calorie goal and water intake.
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-[#f8fbf3] p-4 shadow-sm">
        <label htmlFor="chat-message" className="sr-only">Message NutriOwl</label>
        <input id="chat-message" type="text" defaultValue="What should I eat after workout?" aria-label="Message NutriOwl" className="w-full rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm text-darkgreen focus:outline-none" />
      </div>

      <BottomNavigation active="chat" />
    </div>
  );
}
