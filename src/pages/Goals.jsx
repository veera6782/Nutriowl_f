import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { useI18n } from '../i18n/LanguageContext';
import * as apiClient from '../services/apiClient';
import GoalCard from '../components/GoalCard';
import GoalEditor from '../components/GoalEditor';

export default function Goals() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBackendGoals() {
      try {
        const [savedProfile, savedGoals] = await Promise.all([apiClient.getProfile(), apiClient.getGoals()]);
        setProfile(savedProfile);
        setGoals(savedGoals.goals || []);
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
      setShowProgress(true);
      clearMessageLater();
    } catch (e) {
      setError(e.message);
    }
  }

  function clearMessageLater() {
    setTimeout(() => setShowProgress(false), 1600);
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

  function dayStreakCount() {
    return goals.filter(g => g.daily && g.progress >= g.target).length;
  }

  function handleBack() {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }
    navigate('/home', { replace: true });
  }

  if (loading) return <div className="min-h-screen bg-cream p-4">{t('goals.loading')}</div>;
  if (error && !profile) return <div className="min-h-screen bg-cream p-4"><p className="text-red-600">{error}</p></div>;

  const dailyGoals = goals.filter(g => g.daily);
  const weeklyGoals = goals.filter(g => !g.daily);
  const doneCount = list => list.filter(g => g.progress >= g.target).length;

  return (
    <div className="min-h-screen bg-cream font-poppins text-darkgreen p-4 pb-32">
      <div className="flex items-start justify-between">
        <button type="button" aria-label={t('common.back')} onClick={handleBack} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">{'<'}</button>
        <div className="flex-1 mx-4">
          <h1 className="text-3xl font-bold">{t('goals.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('goals.subtitle')}</p>
        </div>
        <div className="w-24 h-24 overflow-hidden rounded-full bg-[#edf8ed] p-1 shadow-[0_8px_16px_rgba(46,94,62,0.08)]">
          <img src="/nutriowl_mascot_full.jpg" alt={t('common.mascotAlt')} className="h-full w-full object-cover rounded-full" />
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mt-6 bg-green-50 rounded-2xl p-4 flex items-center gap-4">
        <div className="bg-white rounded-xl p-3 w-20 h-20 flex flex-col items-center justify-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">{dayStreakCount()}</div>
          <div className="text-xs text-gray-600">{t('common.dayStreak')}</div>
        </div>
        <div className="flex-1">
          <div className="font-semibold">{t('goals.awesome')}</div>
          <div className="text-sm text-gray-600 mt-2">{t('goals.keepGoing')}</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-semibold text-lg">{t('goals.daily')}</h3>
          <div className="text-green-600 text-sm">{t('goals.completedCount', { done: doneCount(dailyGoals), total: dailyGoals.length })}</div>
        </div>

        <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm">
          {dailyGoals.map(g => (
            <GoalCard key={g.id} goal={g} onIncrement={() => handleIncrement(g)} onEdit={() => handleEdit(g)} />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-semibold text-lg">{t('goals.weekly')}</h3>
          <div className="text-green-600 text-sm">{t('goals.completedCount', { done: doneCount(weeklyGoals), total: weeklyGoals.length })}</div>
        </div>

        <div className="mt-3 bg-green-50 rounded-2xl p-4 shadow-sm">
          {weeklyGoals.map(g => (
            <GoalCard key={g.id} goal={g} onIncrement={() => handleIncrement(g)} onEdit={() => handleEdit(g)} />
          ))}
        </div>
      </div>

      {showProgress && (
        <div className="fixed right-6 bottom-36 bg-green-600 text-white px-4 py-2 rounded-lg shadow">{t('goals.niceProgress')}</div>
      )}

      {editing && <GoalEditor goal={editing} onSave={handleSave} onClose={() => setEditing(null)} />}

      <BottomNavigation active="goals" />
    </div>
  );
}
