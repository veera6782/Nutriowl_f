import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiArrowRight, FiBarChart2, FiCalendar, FiHeart, FiLock, FiMail, FiMaximize2, FiSun, FiTrendingUp, FiUser, FiZap } from 'react-icons/fi';
import LanguageToggle from '../components/LanguageToggle';
import { useI18n } from '../i18n/LanguageContext';
import profileService from '../services/profileService';
import * as apiClient from '../services/apiClient';

const initialForm = {
  name: '',
  email: '',
  age: '',
  height: '',
  weight: '',
  activityLevel: '',
  goals: [],
  onboardingCompleted: false
};

// Titles and descriptions live in the i18n dictionaries under onboarding.activity / onboarding.goals.
const activityOptions = ['low', 'moderate', 'high'];
const goalOptions = ['balanced', 'strength', 'energy', 'performance', 'habits'];

const activityIcons = {
  low: FiActivity,
  moderate: FiTrendingUp,
  high: FiZap
};

const goalIcons = {
  balanced: FiSun,
  strength: FiActivity,
  energy: FiZap,
  performance: FiTrendingUp,
  habits: FiHeart
};

function isValidEmail(val) {
  return /\S+@\S+\.\S+/.test(val || '');
}

// Returns i18n keys rather than text, so messages follow the language toggle.
function validate(form) {
  const nextErrors = {};

  if (!form.name || form.name.trim().length < 2) nextErrors.name = 'onboarding.errors.name';
  if (!form.email) nextErrors.email = 'onboarding.errors.emailRequired';
  else if (!isValidEmail(form.email)) nextErrors.email = 'onboarding.errors.emailInvalid';

  if (!form.age) nextErrors.age = 'onboarding.errors.ageRequired';
  else if (Number(form.age) <= 0 || Number(form.age) > 120) nextErrors.age = 'onboarding.errors.ageInvalid';

  if (!form.height) nextErrors.height = 'onboarding.errors.heightRequired';
  else if (Number(form.height) <= 30 || Number(form.height) > 300) nextErrors.height = 'onboarding.errors.heightInvalid';

  if (!form.weight) nextErrors.weight = 'onboarding.errors.weightRequired';
  else if (Number(form.weight) <= 10 || Number(form.weight) > 600) nextErrors.weight = 'onboarding.errors.weightInvalid';

  if (!form.activityLevel) nextErrors.activityLevel = 'onboarding.errors.activity';
  if (!form.goals.length) nextErrors.goals = 'onboarding.errors.goals';

  return nextErrors;
}

export default function Onboarding() {
  const { t } = useI18n();
  const [form, setForm] = useState(() => ({ ...initialForm, email: apiClient.getCurrentEmail() }));
  const [errors, setErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [saving, setSaving] = useState(false);
  // { key } for our own message, { text } for a server message.
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!apiClient.getCurrentEmail()) navigate('/', { replace: true });
  }, [navigate]);

  function handleField(key, value) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (errors[key]) {
      setErrors({ ...errors, [key]: undefined });
    }
  }

  function handleBlur() {
    if (!hasAttemptedSubmit) return;
    setErrors(validate(form));
  }

  function toggleGoal(goalKey) {
    const goals = form.goals.includes(goalKey)
      ? form.goals.filter((key) => key !== goalKey)
      : [...form.goals, goalKey];
    handleField('goals', goals);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const profile = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      onboardingCompleted: true
    };

    setSubmitError(null);
    setSaving(true);
    try {
      await apiClient.saveProfile(profile);
      profileService.saveProfile(profile);
      navigate('/home', { replace: true });
    } catch (error) {
      setSubmitError(error.message ? { text: error.message } : { key: 'onboarding.errors.save' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream font-poppins text-darkgreen">
      <div className="mx-auto max-w-[420px] px-4 pb-8 pt-3">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>

        <div className="relative mt-4">
          <div className="absolute right-1 top-2 h-14 w-14 rounded-full bg-green-100/60 blur-sm" />
          <div className="absolute right-10 top-10 h-10 w-10 rounded-full bg-green-100/60 blur-sm" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1 pt-2">
              <h1 className="whitespace-pre-line text-[3rem] font-bold leading-[0.98] tracking-[-0.05em]">{t('onboarding.heading')}</h1>
            </div>
            <div className="w-[180px] shrink-0 overflow-hidden rounded-full bg-[#f4f9f2] p-1 shadow-[0_8px_20px_rgba(46,94,62,0.08)]">
              <img src="/nutriowl_mascot_full.jpg" alt={t('common.mascotAlt')} className="h-full w-full object-contain" />
            </div>
          </div>
          <p className="relative mt-3 w-full text-[16px] leading-6 text-gray-600">
            {t('onboarding.intro')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="rounded-[20px] bg-white px-4 py-3 shadow-[0_6px_18px_rgba(46,94,62,0.08)] ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-inner">
                <FiUser size={20} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <label className="block text-[14px] font-semibold text-darkgreen">{t('onboarding.nameLabel')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleField('name', e.target.value)}
                  onBlur={handleBlur}
                  placeholder={t('onboarding.namePlaceholder')}
                  className="mt-2 w-full border-0 bg-transparent p-0 text-[16px] text-darkgreen placeholder:text-gray-400 focus:outline-none"
                />
              </div>
            </div>
            {errors.name && <div className="mt-2 text-xs text-red-600">{t(errors.name)}</div>}
          </div>

          <div className="rounded-[20px] bg-white px-4 py-3 shadow-[0_6px_18px_rgba(46,94,62,0.08)] ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-inner">
                <FiMail size={20} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <label className="block text-[14px] font-semibold text-darkgreen">{t('onboarding.emailLabel')}</label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  autoComplete="email"
                  className="mt-2 w-full border-0 bg-transparent p-0 text-[16px] text-darkgreen focus:outline-none"
                />
              </div>
            </div>
            {errors.email && <div className="mt-2 text-xs text-red-600">{t(errors.email)}</div>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[20px] bg-white px-4 py-3 shadow-[0_6px_18px_rgba(46,94,62,0.08)] ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-inner">
                  <FiCalendar size={20} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="block text-[14px] font-semibold text-darkgreen">{t('onboarding.ageLabel')}</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.age}
                      onChange={(e) => handleField('age', e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={handleBlur}
                      placeholder={t('onboarding.agePlaceholder')}
                      className="w-full min-w-0 border-0 bg-transparent p-0 text-[12px] text-darkgreen placeholder:text-gray-400 focus:outline-none"
                    />
                    <span className="text-[12px] text-gray-500">{t('units.years')}</span>
                  </div>
                </div>
              </div>
              {errors.age && <div className="mt-2 text-xs text-red-600">{t(errors.age)}</div>}
            </div>

            <div className="rounded-[20px] bg-white px-4 py-3 shadow-[0_6px_18px_rgba(46,94,62,0.08)] ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-inner">
                  <FiMaximize2 size={20} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="block text-[14px] font-semibold text-darkgreen">{t('onboarding.heightLabel')}</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.height}
                      onChange={(e) => handleField('height', e.target.value.replace(/[^0-9.]/g, ''))}
                      onBlur={handleBlur}
                      placeholder={t('onboarding.heightPlaceholder')}
                      className="w-full min-w-0 border-0 bg-transparent p-0 text-[12px] text-darkgreen placeholder:text-gray-400 focus:outline-none"
                    />
                    <span className="text-[12px] text-gray-500">{t('units.cm')}</span>
                  </div>
                </div>
              </div>
              {errors.height && <div className="mt-2 text-xs text-red-600">{t(errors.height)}</div>}
            </div>
          </div>

          <div className="rounded-[20px] bg-white px-4 py-3 shadow-[0_6px_18px_rgba(46,94,62,0.08)] ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-inner">
                <FiBarChart2 size={20} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <label className="block text-[14px] font-semibold text-darkgreen">{t('onboarding.weightLabel')}</label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.weight}
                    onChange={(e) => handleField('weight', e.target.value.replace(/[^0-9.]/g, ''))}
                    onBlur={handleBlur}
                    placeholder={t('onboarding.weightPlaceholder')}
                    className="w-full border-0 bg-transparent p-0 text-[16px] text-darkgreen placeholder:text-gray-400 focus:outline-none"
                  />
                  <span className="text-[12px] text-gray-500">{t('units.kg')}</span>
                </div>
              </div>
            </div>
            {errors.weight && <div className="mt-2 text-xs text-red-600">{t(errors.weight)}</div>}
          </div>

          <div className="pt-1">
            <label className="mb-3 block text-[14px] font-semibold text-darkgreen">{t('onboarding.activityLabel')}</label>
            <div className="grid grid-cols-3 gap-3">
              {activityOptions.map((key) => {
                const selected = form.activityLevel === key;
                const ActivityIcon = activityIcons[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleField('activityLevel', key)}
                    className={`rounded-[18px] border bg-white px-3 py-4 text-left shadow-[0_6px_18px_rgba(46,94,62,0.08)] transition ${selected ? 'border-green-300 bg-green-50' : 'border-[#dfe8da]'}`}
                  >
                    <div className="mb-3 flex h-16 items-center justify-center">
                      <ActivityIcon className="text-green-700" size={36} aria-hidden="true" />
                    </div>
                    <div className="text-center text-[14px] font-semibold text-darkgreen">{t(`onboarding.activity.${key}.title`)}</div>
                    <div className="mt-2 text-center text-[11px] leading-4 text-gray-600">{t(`onboarding.activity.${key}.desc`)}</div>
                  </button>
                );
              })}
            </div>
            {errors.activityLevel && <div className="mt-2 text-xs text-red-600">{t(errors.activityLevel)}</div>}
          </div>

          <div className="pt-1">
            <label className="mb-3 block text-[14px] font-semibold text-darkgreen">
              {t('onboarding.goalLabel')} <span className="font-normal text-gray-500">{t('onboarding.selectAll')}</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {goalOptions.map((key) => {
                const selected = form.goals.includes(key);
                const GoalIcon = goalIcons[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleGoal(key)}
                    className={`rounded-[18px] border bg-white px-3 py-4 text-left shadow-[0_6px_18px_rgba(46,94,62,0.08)] transition ${selected ? 'border-green-300 bg-green-50' : 'border-[#dfe8da]'}`}
                  >
                    <div className="mb-3 flex h-16 items-center justify-between">
                      <GoalIcon className="text-green-700" size={30} aria-hidden="true" />
                      <span className={`flex h-6 w-6 items-center justify-center rounded-md border text-sm ${selected ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 text-transparent'}`}>
                        ✓
                      </span>
                    </div>
                    <div className="text-center text-[14px] font-semibold leading-5 text-darkgreen">{t(`onboarding.goals.${key}.title`)}</div>
                    <div className="mt-2 text-center text-[11px] leading-4 text-gray-600">{t(`onboarding.goals.${key}.desc`)}</div>
                  </button>
                );
              })}
            </div>
            {errors.goals && <div className="mt-2 text-xs text-red-600">{t(errors.goals)}</div>}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 flex w-full items-center justify-center rounded-full bg-green-600 px-6 py-4 text-center text-[26px] font-bold text-white shadow-[0_10px_20px_rgba(76,175,80,0.25)] transition hover:bg-green-700 disabled:cursor-wait disabled:opacity-60"
          >
            <span>{saving ? t('onboarding.saving') : t('onboarding.continue')}</span>
            <FiArrowRight className="ml-3" size={24} aria-hidden="true" />
          </button>
          {submitError && <p className="mt-2 text-center text-sm text-red-600">{submitError.key ? t(submitError.key) : submitError.text}</p>}
        </form>

        <div className="mt-4 flex items-center justify-center gap-2 pb-4 text-[12px] text-gray-500">
          <FiLock size={14} aria-hidden="true" />
          <span>{t('onboarding.safe')}</span>
        </div>
      </div>
    </div>
  );
}
