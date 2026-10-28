import React, { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiBell, FiCamera, FiCalendar, FiCheck, FiChevronRight, FiDroplet, FiGlobe, FiHelpCircle, FiLogOut, FiPieChart, FiSettings, FiShield, FiStar, FiTarget, FiUser, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import DropdownSelect from '../components/DropdownSelect';
import LanguageToggle from '../components/LanguageToggle';
import { useI18n } from '../i18n/LanguageContext';
import goalsService from '../services/goalsService';
import profileService from '../services/profileService';
import * as apiClient from '../services/apiClient';

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dietOptions = ['Vegetarian', 'Non-vegetarian', 'Vegan', 'Pescatarian'];
const activityLevels = ['Low', 'Moderate', 'High'];

function clampPercentage(value) {
  if (!Number.isFinite(Number(value))) return 0;
  return Math.min(100, Math.max(0, Number(value)));
}

function getProgressColor(key) {
  switch (key) {
    case 'calories':
      return '#f59e0b';
    case 'protein':
      return '#4CAF50';
    case 'carbs':
      return '#f59e0b';
    case 'water':
      return '#4CAF50';
    default:
      return '#4CAF50';
  }
}

function CircularProgress({ value, target, label, color, icon, unit }) {
  const percentage = target > 0 ? (value / target) * 100 : 0;
  const displayValue = clampPercentage(percentage);
  const style = {
    background: `conic-gradient(${color} ${displayValue * 3.6}deg, #e7efe0 0deg)`
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24 rounded-full p-2" style={style}>
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#f8faf5]">
          <span className="text-xl font-bold text-darkgreen">{Math.round(displayValue)}%</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-darkgreen">
        <span className="text-lg" aria-hidden="true">{icon}</span>
      </div>
      <div className="mt-2 text-center text-sm text-gray-600">
        <div className="font-medium text-darkgreen">{label}</div>
        <div className="text-xs text-gray-500">{Math.round(value)} / {Math.round(target)} {unit}</div>
      </div>
    </div>
  );
}

function ModalShell({ title, onClose, closeLabel, children, actions }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d2d1f]/30 p-4">
      <div className="w-full max-w-md rounded-[28px] bg-[#f8faf5] p-5 shadow-[0_18px_50px_rgba(31,51,39,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-darkgreen">{title}</h3>
          <button type="button" aria-label={closeLabel} onClick={onClose} className="h-9 w-9 rounded-full bg-white text-lg text-darkgreen shadow-sm">×</button>
        </div>
        {children}
        {actions && <div className="mt-5 flex justify-end gap-3">{actions}</div>}
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { t, tOption } = useI18n();
  const [profile, setProfile] = useState(() => profileService.loadProfile());
  const [modalType, setModalType] = useState(null);
  const [draft, setDraft] = useState(() => profileService.loadProfile());

  useEffect(() => {
    const unsub = profileService.subscribe(nextProfile => {
      setProfile(nextProfile);
      setDraft(nextProfile);
    });

    const goalsUnsub = goalsService.subscribe(() => {
      const refreshed = profileService.refreshDerivedProfile();
      setProfile(refreshed);
      setDraft(refreshed);
    });

    return () => {
      unsub();
      goalsUnsub();
    };
  }, []);

  const progressCards = useMemo(() => [
    {
      key: 'calories',
      label: t('nutrients.calories'),
      value: Number(profile.progress?.calories?.current ?? 0),
      target: Number(profile.progress?.calories?.target ?? 1600),
      icon: <FiZap className="text-amber-500" aria-hidden="true" />,
      unit: t('units.kcal'),
      color: '#f59e0b'
    },
    {
      key: 'protein',
      label: t('nutrients.protein'),
      value: Number(profile.progress?.protein?.current ?? 0),
      target: Number(profile.progress?.protein?.target ?? 80),
      icon: <FiActivity className="text-green-600" aria-hidden="true" />,
      unit: t('units.g'),
      color: '#4CAF50'
    },
    {
      key: 'carbs',
      label: t('nutrients.carbs'),
      value: Number(profile.progress?.carbs?.current ?? 0),
      target: Number(profile.progress?.carbs?.target ?? 300),
      icon: <FiPieChart className="text-amber-500" aria-hidden="true" />,
      unit: t('units.g'),
      color: '#f59e0b'
    },
    {
      key: 'water',
      label: t('nutrients.water'),
      value: Number(profile.progress?.water?.current ?? 0),
      target: Number(profile.progress?.water?.target ?? 8),
      icon: <FiDroplet className="text-sky-500" aria-hidden="true" />,
      unit: t('units.L'),
      color: '#4CAF50'
    }
  ], [profile, t]);

  const preferenceCards = [
    {
      key: 'dietPreference',
      label: t('profile.dietPreference'),
      value: tOption('diet', profile.preferences?.dietPreference || 'Vegetarian'),
      icon: <FiTarget className="text-xl text-green-700" />,
      valueClass: 'text-base font-medium'
    },
    {
      key: 'dailyCalorieGoal',
      label: t('profile.dailyCalorieGoal'),
      value: `${profile.preferences?.dailyCalorieGoal ?? 1600} ${t('units.kcal')}`,
      icon: <FiZap className="text-xl text-yellow-500" />,
      valueClass: 'text-base font-medium'
    },
    {
      key: 'activityLevel',
      label: t('profile.activityLevel'),
      value: tOption('activity', profile.preferences?.activityLevel || 'Moderate'),
      icon: <FiActivity className="text-xl text-green-700" />,
      valueClass: 'text-base font-medium'
    },
    {
      key: 'waterGoal',
      label: t('profile.waterGoal'),
      value: t('profile.glasses', { count: profile.preferences?.waterGoal ?? 8 }),
      icon: <FiDroplet className="text-xl text-sky-500" />,
      valueClass: 'text-base font-medium'
    }
  ];

  const menuRows = [
    { key: 'notifications', icon: <FiBell className="text-lg" /> },
    { key: 'privacy', icon: <FiShield className="text-lg" /> },
    { key: 'support', icon: <FiHelpCircle className="text-lg" /> },
    { key: 'logout', icon: <FiLogOut className="text-lg" /> }
  ].map(row => ({
    ...row,
    label: t(`profile.menu.${row.key}.label`),
    description: t(`profile.menu.${row.key}.description`)
  }));

  const shortDays = t('profile.shortDays');
  const weeklyChecks = dayOrder.map((day, index) => ({
    key: day,
    label: shortDays[index],
    checked: Boolean(profile.weeklyActivity?.[day]) || day === 'saturday' || day === 'sunday'
  }));

  const openModal = (type) => {
    setModalType(type);
    setDraft(profile);
  };

  const updateDraft = (update) => {
    setDraft(current => ({
      ...current,
      ...update,
      preferences: { ...current.preferences, ...(update.preferences || {}) },
      notifications: { ...current.notifications, ...(update.notifications || {}) }
    }));
  };

  const handleSaveProfile = async () => {
    const saved = profileService.updateProfile(draft);
    setProfile(saved);
    await apiClient.saveProfile(saved);
    setModalType(null);
  };

  const handleSavePreferences = () => {
    const saved = profileService.updateProfile({
      name: draft.name,
      preferences: draft.preferences,
      notifications: draft.notifications
    });
    setProfile(saved);
    setModalType(null);
  };

  const handleLogout = async () => {
    setModalType(null);
    try {
      await apiClient.signOut();
    } catch (error) {
      console.warn('Unable to revoke the NutriOwl session; signed out on this device.', error);
    } finally {
      navigate('/', { replace: true });
    }
  };

  const menuRowButton = (row) => (
    <button key={row.key} onClick={() => openModal(row.key)} aria-label={row.label} className="flex w-full items-center justify-between gap-3 rounded-[20px] px-3 py-4 text-left transition hover:bg-white/50">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5e6] text-darkgreen">
          {row.icon}
        </div>
        <div className="text-xl font-medium text-darkgreen">{row.label}</div>
      </div>
      <FiChevronRight className="text-2xl text-darkgreen" />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f6f4ee] font-poppins text-darkgreen p-4 pb-32">
      <div className="mx-auto max-w-[420px]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">{t('profile.title')}</h1>
            <p className="mt-2 whitespace-pre-line text-lg text-gray-600">{t('profile.subtitle')}</p>
          </div>
          <div className="relative ml-2 mt-2 flex h-28 w-28 items-center justify-center">
            <button aria-label={t('profile.openSettings')} onClick={() => openModal('settings')} className="absolute right-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f7ee] text-xl text-green-700 shadow-sm">
              <FiSettings />
            </button>
            <div className="h-24 w-24 overflow-hidden rounded-full bg-[#edf5e7] p-1 shadow-[0_8px_16px_rgba(46,94,62,0.08)]">
              <img src="/nutriowl_mascot_full.jpg" alt={t('common.mascotAlt')} className="h-full w-full rounded-full object-cover" />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] bg-[#dfeccd] p-4 shadow-[0_8px_18px_rgba(86,103,76,0.08)]">
          <button onClick={() => openModal('personal')} aria-label={t('profile.editProfileAria')} className="flex w-full items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#bde09f] text-3xl text-green-800 shadow-inner">
                <FiUser />
              </div>
              <div>
                <div className="text-2xl font-bold text-darkgreen">{profile.name}</div>
              </div>
            </div>
            <div className="text-3xl text-darkgreen"><FiChevronRight /></div>
          </button>
        </div>

        <div className="mt-5 rounded-[26px] bg-[#edf4e2] p-3 shadow-[0_8px_18px_rgba(86,103,76,0.08)]">
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-2xl bg-[#f8faf5] p-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 text-[#ff9c2a]">
                <FiZap aria-hidden="true" />
              </div>
              <div className="mt-2 text-2xl font-bold text-darkgreen">{profile.streak}</div>
              <div className="text-xs text-gray-600">{t('common.dayStreak')}</div>
            </div>
            <div className="rounded-2xl bg-[#f8faf5] p-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 text-[#f3b312]">
                <FiStar aria-hidden="true" />
              </div>
              <div className="mt-2 text-2xl font-bold text-darkgreen">{profile.points}</div>
              <div className="text-xs text-gray-600">{t('profile.points')}</div>
            </div>
            <div className="rounded-2xl bg-[#f8faf5] p-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 text-[#4CAF50]">
                <FiTarget aria-hidden="true" />
              </div>
              <div className="mt-2 text-2xl font-bold text-darkgreen">{profile.goalsSet}</div>
              <div className="text-xs text-gray-600">{t('profile.goalsSet')}</div>
            </div>
            <div className="rounded-2xl bg-[#f8faf5] p-3 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 text-[#4CAF50]">
                <FiCamera aria-hidden="true" />
              </div>
              <div className="mt-2 text-2xl font-bold text-darkgreen">{profile.mealsScanned}</div>
              <div className="text-xs text-gray-600">{t('profile.mealsScanned')}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] bg-[#edf4e2] p-4 shadow-[0_8px_18px_rgba(86,103,76,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-darkgreen">{t('profile.myProgress')}</h2>
            <button aria-label={t('profile.changePeriod')} className="inline-flex items-center gap-2 rounded-full bg-[#f8faf5] px-3 py-2 text-sm font-medium text-darkgreen shadow-sm">
              <FiCalendar />
              {t('profile.thisWeek')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {progressCards.map(item => (
              <CircularProgress key={item.key} value={item.value} target={item.target} label={item.label} color={item.color} icon={item.icon} unit={item.unit} />
            ))}
            <div className="col-span-2 rounded-[24px] bg-[#f7f8f1] p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-lg font-semibold text-darkgreen">{t('profile.weeklyStreak')}</div>
                <div className="text-sm text-gray-600">{t('profile.days', { count: profile.streak })}</div>
              </div>
              <div className="mt-3 flex justify-between gap-[2px] px-1">
                {weeklyChecks.map((day) => (
                  <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-600">{day.label}</span>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full ${day.checked ? 'bg-[#cfe1b7] text-[#294b2b]' : 'bg-[#ebf0e4] text-gray-400'}`}>
                      {day.checked ? <FiCheck className="text-[12px]" /> : <span className="text-[10px] opacity-0">✓</span>}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-[#dfeccd] p-1 shadow-sm">
                  <img src="/nutriowl_mascot_full.jpg" alt={t('common.mascotAlt')} className="h-full w-full rounded-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] bg-[#edf4e2] p-4 shadow-[0_8px_18px_rgba(86,103,76,0.08)]">
          <button onClick={() => openModal('preferences')} className="flex w-full items-center justify-between gap-3 text-left" aria-label={t('profile.editPreferences')}>
            <h2 className="text-3xl font-bold text-darkgreen">{t('profile.myPreferences')}</h2>
            <div className="text-3xl text-darkgreen"><FiChevronRight /></div>
          </button>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {preferenceCards.map((entry) => (
              <button key={entry.key} onClick={() => openModal('preferences')} className="rounded-[20px] bg-[#f9f9f2] p-3 text-left shadow-sm" aria-label={t('profile.editItem', { item: entry.label })}>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#ecf5e7]">{entry.icon}</div>
                <div className="text-sm text-gray-600">{entry.label}</div>
                <div className={`${entry.valueClass} mt-2 text-darkgreen`}>{entry.value}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[28px] bg-[#f3f7ee] p-2 shadow-[0_8px_18px_rgba(86,103,76,0.08)]">
          {menuRows.slice(0, -1).map(menuRowButton)}
          <div className="flex w-full items-center justify-between gap-3 rounded-[20px] px-3 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5e6] text-darkgreen">
                <FiGlobe className="text-lg" aria-hidden="true" />
              </div>
              <div className="text-xl font-medium text-darkgreen">{t('language.label')}</div>
            </div>
            <LanguageToggle />
          </div>
          {menuRowButton(menuRows[menuRows.length - 1])}
        </div>

        <BottomNavigation active="profile" />
      </div>

      {modalType && (
        <ModalShell
          title={t(`profile.modal.${modalType}`)}
          closeLabel={t('profile.closeDialog')}
          onClose={() => setModalType(null)}
          actions={
            modalType === 'logout'
              ? [
                  <button key="cancel" type="button" onClick={() => setModalType(null)} className="rounded-full bg-[#edf5e6] px-4 py-2 font-medium text-darkgreen">{t('common.cancel')}</button>,
                  <button key="confirm" type="button" onClick={handleLogout} className="rounded-full bg-[#4CAF50] px-4 py-2 font-medium text-white">{t('profile.logOutConfirm')}</button>
                ]
              : modalType === 'privacy' || modalType === 'support' || modalType === 'settings'
                ? [
                    <button key="close" type="button" onClick={() => setModalType(null)} className="rounded-full bg-[#4CAF50] px-4 py-2 font-medium text-white">{t('common.close')}</button>
                  ]
                : [
                    <button key="cancel" type="button" onClick={() => setModalType(null)} className="rounded-full bg-[#edf5e6] px-4 py-2 font-medium text-darkgreen">{t('common.cancel')}</button>,
                    <button key="save" type="button" onClick={modalType === 'preferences' ? handleSavePreferences : handleSaveProfile} className="rounded-full bg-[#4CAF50] px-4 py-2 font-medium text-white">{t('common.save')}</button>
                  ]
          }
        >
          {modalType === 'personal' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-darkgreen">{t('profile.name')}</label>
                <input id="profile-name" aria-label={t('profile.name')} value={draft.name || ''} onChange={(event) => updateDraft({ name: event.target.value })} className="w-full rounded-2xl border border-[#dfe7d5] bg-white px-3 py-3 text-darkgreen focus:outline-none" />
              </div>
            </div>
          )}

          {modalType === 'preferences' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="diet" className="mb-2 block text-sm font-medium text-darkgreen">{t('profile.dietPreference')}</label>
                <DropdownSelect id="diet" ariaLabel={t('profile.dietPreference')} value={draft.preferences?.dietPreference || 'Vegetarian'} onChange={value => updateDraft({ preferences: { dietPreference: value } })} options={dietOptions.map(value => ({ value, label: tOption('diet', value) }))} />
              </div>
              <div>
                <label htmlFor="calorie-goal" className="mb-2 block text-sm font-medium text-darkgreen">{t('profile.dailyCalorieGoal')}</label>
                <input id="calorie-goal" aria-label={t('profile.dailyCalorieGoal')} type="number" value={draft.preferences?.dailyCalorieGoal ?? ''} onChange={(event) => updateDraft({ preferences: { dailyCalorieGoal: event.target.value } })} className="w-full rounded-2xl border border-[#dfe7d5] bg-white px-3 py-3 text-darkgreen focus:outline-none" />
              </div>
              <div>
                <label htmlFor="activity-level" className="mb-2 block text-sm font-medium text-darkgreen">{t('profile.activityLevel')}</label>
                <DropdownSelect id="activity-level" ariaLabel={t('profile.activityLevel')} value={draft.preferences?.activityLevel || 'Moderate'} onChange={value => updateDraft({ preferences: { activityLevel: value } })} options={activityLevels.map(value => ({ value, label: tOption('activity', value) }))} />
              </div>
              <div>
                <label htmlFor="water-goal" className="mb-2 block text-sm font-medium text-darkgreen">{t('profile.waterGoal')}</label>
                <input id="water-goal" aria-label={t('profile.waterGoal')} type="number" min="1" value={draft.preferences?.waterGoal ?? ''} onChange={(event) => updateDraft({ preferences: { waterGoal: event.target.value } })} className="w-full rounded-2xl border border-[#dfe7d5] bg-white px-3 py-3 text-darkgreen focus:outline-none" />
              </div>
            </div>
          )}

          {modalType === 'notifications' && (
            <div className="space-y-4">
              {['dailyNutritionReminder', 'goalReminders', 'hydrationReminders'].map((key) => (
                <label key={key} className="flex items-center justify-between rounded-2xl bg-[#edf5e6] p-3 text-darkgreen">
                  <span className="font-medium">{t(`profile.notifications.${key}`)}</span>
                  <input type="checkbox" aria-label={t(`profile.notifications.${key}`)} checked={Boolean(draft.notifications?.[key])} onChange={(event) => updateDraft({ notifications: { [key]: event.target.checked } })} className="h-5 w-5 accent-[#4CAF50]" />
                </label>
              ))}
            </div>
          )}

          {modalType === 'privacy' && (
            <div className="space-y-4 text-base leading-7 text-gray-700">
              {t('profile.privacyText').map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>
          )}

          {modalType === 'support' && (
            <div className="space-y-4 text base text-gray-700">
              {t('profile.support').map(item => (
                <div key={item.title} className="rounded-2xl bg-[#edf5e6] p-3">
                  <div className="font-semibold text-darkgreen">{item.title}</div>
                  <p className="mt-1">{item.body}</p>
                </div>
              ))}
            </div>
          )}

          {modalType === 'settings' && (
            <div className="space-y-4">
              <button onClick={() => openModal('personal')} className="flex w-full items-center justify-between rounded-2xl bg-[#edf5e6] p-3 text-left font-medium text-darkgreen">
                <span>{t('profile.profileDetails')}</span>
                <FiChevronRight />
              </button>
              <button onClick={() => openModal('preferences')} className="flex w-full items-center justify-between rounded-2xl bg-[#edf5e6] p-3 text-left font-medium text-darkgreen">
                <span>{t('profile.modal.preferences')}</span>
                <FiChevronRight />
              </button>
              <button onClick={() => openModal('notifications')} className="flex w-full items-center justify-between rounded-2xl bg-[#edf5e6] p-3 text-left font-medium text-darkgreen">
                <span>{t('profile.modal.notifications')}</span>
                <FiChevronRight />
              </button>
              <div className="flex w-full items-center justify-between rounded-2xl bg-[#edf5e6] p-3 font-medium text-darkgreen">
                <span>{t('language.label')}</span>
                <LanguageToggle />
              </div>
            </div>
          )}

          {modalType === 'logout' && (
            <div className="space-y-4 text-center text-gray-700">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf5e6] text-2xl text-darkgreen">
                <FiLogOut />
              </div>
              <p className="text-lg font-medium text-darkgreen">{t('profile.logoutQuestion')}</p>
              <p className="text-sm text-gray-600">{t('profile.logoutDetail')}</p>
            </div>
          )}
        </ModalShell>
      )}
    </div>
  );
}
