import React from 'react';
import { useI18n } from '../i18n/LanguageContext';

export default function TipsCard() {
  const { t } = useI18n();
  return (
    <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">💡</div>
      <div className="flex-1">
        <p className="font-semibold">{t('scanner.tipsTitle')}</p>
        <p className="text-sm text-gray-600">{t('scanner.tipsBody')}</p>
      </div>
      <div className="w-20 h-20 overflow-hidden rounded-full bg-white p-1 shadow-sm">
        <img src="/nutriowl_mascot_full.jpg" alt={t('common.mascotAlt')} className="w-full h-full object-cover rounded-full" />
      </div>
    </div>
  );
}
