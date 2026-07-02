'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTrophy, FaLock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ACHIEVEMENTS = [
  { id: '1', emoji: '🚀', nameKey: 'firstTrip', descKey: 'firstTripDesc', earned: true },
  { id: '2', emoji: '🗺️', nameKey: 'explorer', descKey: 'explorerDesc', earned: true },
  { id: '3', emoji: '⭐', nameKey: 'highScorer', descKey: 'highScorerDesc', earned: true },
  { id: '4', emoji: '🏆', nameKey: 'roadMaster', descKey: 'roadMasterDesc', earned: false },
  { id: '5', emoji: '💡', nameKey: 'reporter', descKey: 'reporterDesc', earned: true },
  { id: '6', emoji: '🌍', nameKey: 'longHaul', descKey: 'longHaulDesc', earned: false },
];

export default function AchievementsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const earned = ACHIEVEMENTS.filter(a => a.earned).length;

  return (
    <div className="min-h-dvh bg-dark-bg">
      <div className="relative px-4 sm:px-6 pt-14 pb-safe-bottom pb-12 max-w-lg mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-all">
          <FaArrowLeft size={14} /> {t('achievements.back')}
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white font-display">{t('achievements.title')}</h1>
          <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">{earned}/{ACHIEVEMENTS.length}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`card p-4 flex flex-col items-center text-center gap-2 ${!a.earned ? 'opacity-40' : ''}`}>
              <span className="text-3xl">{a.earned ? a.emoji : '🔒'}</span>
              <p className={`text-sm font-bold ${a.earned ? 'text-white' : 'text-gray-400'}`}>{t(`achievements.list.${a.nameKey}`)}</p>
              <p className="text-[11px] text-gray-500">{t(`achievements.list.${a.descKey}`)}</p>
              {a.earned && <span className="text-[10px] bg-primary-600/30 text-primary-400 px-2 py-0.5 rounded-full font-semibold">{t('achievements.earned')}</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
