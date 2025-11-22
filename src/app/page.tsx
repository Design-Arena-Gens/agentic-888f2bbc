/* eslint-disable react/no-unescaped-entities */
'use client';
import Link from 'next/link';
import { useI18n, t } from '@/lib/i18n/I18nProvider';
import { useDashboardStats } from '@/lib/state/dashboard';
import { useEffect, useState } from 'react';
import { getDb } from '@/lib/sqlite/db';

export default function HomePage() {
  const { dir, toggleLang } = useI18n();
  const stats = useDashboardStats();
  const [overdueBanner, setOverdueBanner] = useState<number>(0);
  useEffect(() => {
    const tick = async () => {
      const db = getDb();
      await db.ready;
      const today = new Date().toISOString().slice(0, 10);
      const c = db.get<{ c: number }>(
        'SELECT COUNT(*) as c FROM projects WHERE end_date IS NOT NULL AND end_date < ? AND status != ?',
        [today, 'completed']
      )?.c ?? 0;
      setOverdueBanner(c);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return (
    <main className="container mx-auto max-w-6xl p-4 md:p-6" dir={dir}>
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {t('dashboard_title')}
        </h1>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={toggleLang}>{t('switch_lang')}</button>
          <Link href="/projects" className="btn btn-primary">{t('manage_projects')}</Link>
        </div>
      </header>
      {overdueBanner > 0 && (
        <div className="card p-4 mb-4 border-red-200">
          <div className="text-red-700 font-medium">
            {t('stat_overdue')}: {overdueBanner}
          </div>
        </div>
      )}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-gray-500">{t('stat_projects')}</div>
          <div className="text-3xl font-bold">{stats.projectsCount}</div>
        </div>
        <div className="card p-4">
          <div className="text-gray-500">{t('stat_active')}</div>
          <div className="text-3xl font-bold">{stats.activeCount}</div>
        </div>
        <div className="card p-4">
          <div className="text-gray-500">{t('stat_overdue')}</div>
          <div className="text-3xl font-bold text-red-600">{stats.overdueCount}</div>
        </div>
      </section>
    </main>
  );
}

