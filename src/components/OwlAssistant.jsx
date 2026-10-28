import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../i18n/LanguageContext';

export default function OwlAssistant({ flying = false }) {
  const { t } = useI18n();
  useEffect(() => {}, []);

  return (
    <div className="relative">
      <motion.div animate={{ opacity: [0.95, 1, 0.95] }} transition={{ duration: 3, repeat: Infinity }}>
        <img src="/owl.png" alt="NutriOwl" className="w-full h-full object-contain" />
      </motion.div>
      <motion.div initial={{ scale: 0.8, y: -6 }} animate={{ scale: [0.9, 1], y: [0, -4, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="absolute -top-2 right-0">
        <div className="bg-white p-2 rounded-full shadow text-xs">{t('history.owlBubble')}</div>
      </motion.div>
    </div>
  );
}
