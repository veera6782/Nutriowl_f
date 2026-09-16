import React, { useEffect, useState } from 'react';
import OwlAssistant from '../components/OwlAssistant';
import BottomNavigation from '../components/BottomNavigation';
import * as apiClient from '../services/apiClient';
import GoalCard from '../components/GoalCard';
import GoalEditor from '../components/GoalEditor';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [fruitPreference, setFruitPreference] = useState(2);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBackendGoals() {
      try {
        const [savedProfile, savedGoals] = await Promise.all([apiClient.getProfile(), apiClient.getGoals()]);
        setProfile(savedProfile);
        setGoals(savedGoals.goals || []);
        setPlan(savedGoals.wellnessPlan || null);
        setFruitPreference(savedGoals.fruitPreference?.servings || 2);
        setError('');
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadBackendGoals();

  }, []);

  async function handleIncrement(goal) {
    try {
      const saved = await apiClient.updateGoal(goal.id, { increment: goal.type === 'number' ? 10 : 1 });
      setGoals(saved.goals || []);
      setMessage('Nice progress!');
      clearMessageLater();
    } catch (e) {
      setError(e.message);
    }
  }

  function clearMessageLater() {
    setTimeout(() => setMessage(''), 1600);
  }

  function handleEdit(goal) {
    setEditing(goal);
  }

  async function handleSave(edited) {
    try {
      const saved = await apiClient.updateGoal(edited.id, { target: edited.target });
      setGoals(saved.goals || []);
      setEditing(null);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleFruitPreference(event) {
    const servings = Number(event.target.value);
    setFruitPreference(servings);
    try {
      const saved = await apiClient.updateGoalPreferences({ fruitPreference: { servings } });
      setGoals(saved.goals || []);
      setPlan(saved.wellnessPlan || null);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleGenerate() {
    try {
      const saved = await apiClient.generateGoals();
      setPlan(saved.wellnessPlan || null);
      setMessage('Your wellness plan is ready!');
      clearMessageLater();
    } catch (e) {
      setError(e.message);
    }
  }

  function dayStreakCount() {
    return goals.filter(g => g.daily && g.progress >= g.target).length;
  }

  if (loading) return <div className="min-h-screen bg-cream p-4">Loading goals...</div>;
  if (error && !profile) return <div className="min-h-screen bg-cream p-4"><p className="text-red-600">{error}</p></div>;

  return (
    <div className="min-h-screen bg-cream font-poppins text-darkgreen p-4 pb-32">
      <div className="flex items-start justify-between">
        <button aria-label="Back" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">{'<'}</button>
        <div className="flex-1 mx-4">
          <h1 className="text-3xl font-bold">Your Goals</h1>
          <p className="text-sm text-gray-600 mt-1">Set your goals, stay consistent and become your healthiest self!</p>
        </div>
        <div className="w-24 h-24">
          <OwlAssistant />
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mt-6 bg-green-50 rounded-2xl p-4 flex items-center gap-4">
        <div className="bg-white rounded-xl p-3 w-20 h-20 flex flex-col items-center justify-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">{dayStreakCount()}</div>
          <div className="text-xs text-gray-600">Day Streak</div>
        </div>
        <div className="flex-1">
          <div className="font-semibold">You&apos;re doing awesome! 🔥</div>
          <div className="text-sm text-gray-600 mt-2">Keep going to reach your next milestone.</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg">Your wellness plan</h3>
            <p className="text-xs text-gray-600 mt-1">Personalized for {profile?.name || 'you'}</p>
          </div>
          <button type="button" onClick={handleGenerate} className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white">Refresh</button>
        </div>
        <label className="mt-4 block text-sm text-gray-700">
          Fruit variety preference
          <select value={fruitPreference} onChange={handleFruitPreference} className="ml-2 rounded-lg border border-gray-200 bg-white px-2 py-1">
            {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} servings</option>)}
          </select>
        </label>
        {plan ? (
          <div className="mt-4 grid gap-3 text-sm text-gray-700">
            {Object.entries(plan).filter(([key]) => key !== 'generatedAt' && key !== 'tips').map(([key, value]) => (
              <div key={key}><div className="font-semibold capitalize text-darkgreen">{key.replace(/([A-Z])/g, ' $1')}</div><div className="mt-1">{Array.isArray(value) ? value.join(' • ') : value}</div></div>
            ))}
          </div>
        ) : <p className="mt-4 text-sm text-gray-600">No wellness plan has been generated yet.</p>}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-semibold text-lg">Daily Goals</h3>
          <div className="text-green-600 text-sm">{goals.filter(g=>g.daily).filter(g=>g.progress>=g.target).length}/{goals.filter(g=>g.daily).length} completed</div>
        </div>

        <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm">
          {goals.filter(g=>g.daily).map(g => (
            <GoalCard key={g.id} goal={g} onIncrement={() => handleIncrement(g)} onEdit={() => handleEdit(g)} />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-semibold text-lg">Weekly Goals</h3>
          <div className="text-green-600 text-sm">{goals.filter(g=>!g.daily).filter(g=>g.progress>=g.target).length}/{goals.filter(g=>!g.daily).length} completed</div>
        </div>

        <div className="mt-3 bg-green-50 rounded-2xl p-4 shadow-sm">
          {goals.filter(g=>!g.daily).map(g => (
            <GoalCard key={g.id} goal={g} onIncrement={() => handleIncrement(g)} onEdit={() => handleEdit(g)} />
          ))}
        </div>
      </div>

      {message && (
        <div className="fixed right-6 bottom-36 bg-green-600 text-white px-4 py-2 rounded-lg shadow">{message}</div>
      )}

      {editing && <GoalEditor goal={editing} onSave={handleSave} onClose={() => setEditing(null)} />}

      <BottomNavigation active="goals" />
    </div>
  );
}
