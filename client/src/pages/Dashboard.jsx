import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import OnboardingTour from '../components/OnboardingTour';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { getDashboardSteps } from '../onboarding/onboardingSteps';
import { useOnboarding } from '../hooks/useOnboarding';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTourModal, setShowTourModal] = useState(false);

  const {
    shouldRunDashboardTour,
    persistOnFinish,
    markDone,
    replay,
    resetAll,
    clearForce,
  } = useOnboarding();

  const dashboardSteps = useMemo(() => getDashboardSteps(t), [t, i18n.language]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/dashboard');
        setDashboard(data.data || data);
      } catch (err) {
        console.error('Dashboard load failed', err);
        setError(err.response?.data?.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen">
        <p className="text-gray-600">{t('dashboard.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen">
        <div className="card p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <Link to="/writing" className="btn-primary inline-block px-4 py-2">
            {t('dashboard.goToWriting')}
          </Link>
        </div>
      </div>
    );
  }

  const { user, writing } = dashboard || {};
  const submissions = writing?.recentSubmissions || [];

  return (
    <div className="app-container min-h-screen">
      <OnboardingTour
        steps={dashboardSteps}
        run={shouldRunDashboardTour}
        onFinish={async () => {
          await markDone('dashboard', { persist: persistOnFinish });
          clearForce();
        }}
        onSkip={async () => {
          // Skip means: do not auto-show again
          await markDone('dashboard', { persist: persistOnFinish });
          clearForce();
        }}
      />

      <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
        <div className="card p-6" data-tour="dashboard-welcome">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('dashboard.welcomeBack', {
                  name: user?.name || t('dashboard.writerFallback'),
                })}
              </h1>
              <p className="text-gray-600">
                {t('dashboard.targetBandLabel')}: <strong>{user?.targetBand || 6.5}</strong> •{' '}
                {t('dashboard.currentLevelLabel')}{' '}
                <strong>{user?.currentLevel || 'B1'}</strong>
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary px-3 py-2"
              data-tour="dashboard-replay"
              onClick={() => setShowTourModal(true)}
            >
              {t('dashboard.replayTutorial')}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/writing" className="btn-primary px-4 py-2" data-tour="dashboard-start-test">
              {t('dashboard.startWritingTask')}
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3" data-tour="dashboard-stats">
          <div className="card p-5">
            <p className="text-sm text-gray-500 mb-1">{t('dashboard.stats.submissions')}</p>
            <p className="text-3xl font-bold text-gray-900">
              {writing?.totalSubmissions || 0}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-gray-500 mb-1">{t('dashboard.stats.averageBand')}</p>
            <p className="text-3xl font-bold text-gray-900">
              {writing?.averageBand ? writing.averageBand : '—'}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-gray-500 mb-1">{t('dashboard.stats.lastResult')}</p>
            <p className="text-3xl font-bold text-gray-900">
              {writing?.latestSubmission?.aiScore?.overall || '—'}
            </p>
          </div>
        </div>

        <div className="card p-6" data-tour="dashboard-history">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.recentSubmissions')}</h2>
            <Link to="/writing" className="text-blue-600 hover:underline text-sm">
              {t('dashboard.submitAnother')} →
            </Link>
          </div>
          {submissions.length === 0 ? (
            <p className="text-gray-600">{t('dashboard.noEssaysYet')}</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission._id}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition"
                >
                  <p className="text-sm text-gray-500">
                    {new Date(submission.createdAt).toLocaleString(i18n.language)}
                  </p>
                  <p className="font-semibold text-gray-800 mt-1">
                    {submission.aiScore?.overall
                      ? t('dashboard.overallBandValue', { value: submission.aiScore.overall })
                      : t('dashboard.awaitingFeedback')}
                  </p>
                  <p className="text-gray-600 mt-2">{submission.prompt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showTourModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/40 px-4">
          <div className="card w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.tutorial.modalTitle')}</h3>
                <p className="text-sm text-gray-600">
                  {t('dashboard.tutorial.modalDesc')}
                </p>
              </div>
              <button className="btn-secondary px-3 py-1" onClick={() => setShowTourModal(false)}>
                {t('dashboard.tutorial.close')}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                className="btn-primary px-4 py-2 text-left"
                onClick={() => {
                  setShowTourModal(false);
                  replay('dashboard');
                }}
              >
                {t('dashboard.tutorial.replayDashboard')}
              </button>
              <Link
                to="/writing"
                className="btn-secondary px-4 py-2 text-left"
                onClick={() => {
                  setShowTourModal(false);
                  replay('test');
                }}
              >
                {t('dashboard.tutorial.replayTest')}
              </Link>
              <Link
                to="/writing"
                className="btn-secondary px-4 py-2 text-left"
                onClick={() => {
                  setShowTourModal(false);
                  replay('result');
                }}
              >
                {t('dashboard.tutorial.replayResult')}
              </Link>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                className="text-red-600 hover:underline text-sm"
                onClick={async () => {
                  const ok = window.confirm(t('dashboard.tutorial.resetConfirmPrompt'));
                  if (!ok) return;
                  await resetAll();
                  setShowTourModal(false);
                }}
              >
                {t('dashboard.tutorial.reset')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

