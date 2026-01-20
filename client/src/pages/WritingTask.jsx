import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import OnboardingTour from '../components/OnboardingTour';
import { useTranslation } from 'react-i18next';
import { getResultSteps, getTestSteps } from '../onboarding/onboardingSteps';
import { useOnboarding } from '../hooks/useOnboarding';

const SAMPLE_PROMPT =
  'Some people think that governments should invest more money in public services instead of arts such as music and theatre. To what extent do you agree or disagree?';

export default function WritingTask() {
  const { t, i18n } = useTranslation();
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [essay, setEssay] = useState('');
  const [level, setLevel] = useState('B1');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { shouldRunTestTour, shouldRunResultTour, forcedSegment, persistOnFinish, markDone, clearForce } =
    useOnboarding();

  const runTestTour = useMemo(() => shouldRunTestTour && forcedSegment !== 'result', [shouldRunTestTour, forcedSegment]);
  const runResultTour = useMemo(
    () => !!result && shouldRunResultTour,
    [result, shouldRunResultTour]
  );

  const testSteps = useMemo(() => getTestSteps(t), [t, i18n.language]);
  const resultSteps = useMemo(() => getResultSteps(t), [t, i18n.language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!prompt.trim() || !essay.trim()) {
      setError(t('writing.validationMissing'));
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/writing/submit', { prompt, essay, level });
      setResult(data.data || data);
      setEssay('');
    } catch (err) {
      console.error('Writing submission failed', err);
      setError(err.response?.data?.message || t('writing.scoreError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container min-h-screen">
      <OnboardingTour
        steps={testSteps}
        run={runTestTour}
        onFinish={async () => {
          await markDone('test', { persist: persistOnFinish });
          clearForce();
        }}
        onSkip={async () => {
          await markDone('test', { persist: persistOnFinish });
          clearForce();
        }}
      />

      <OnboardingTour
        steps={resultSteps}
        run={runResultTour}
        onFinish={async () => {
          await markDone('result', { persist: persistOnFinish });
          clearForce();
        }}
        onSkip={async () => {
          await markDone('result', { persist: persistOnFinish });
          clearForce();
        }}
      />

      <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
        <div className="card p-6" data-tour="test-intro">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('writing.title')}</h1>
          <p className="text-gray-600">
            {t('writing.subtitle')}
          </p>
          {forcedSegment === 'result' && !result && (
            <p className="text-sm text-gray-700 mt-3" data-tour="test-rules">
              {t('writing.resultTourReplayHint')}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          <div data-tour="test-rules">
            <p className="text-sm text-gray-600">
              {t('writing.tipsNoRefresh')}
            </p>
          </div>

          <div data-tour="test-prompt">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('writing.promptLabel')}</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div data-tour="test-level">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('writing.levelLabel')}</label>
              <select
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {['A2', 'B1', 'B2', 'C1', 'C2'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div data-tour="test-essay">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('writing.essayLabel')}</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 min-h-[220px]"
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder={t('writing.essayPlaceholder')}
            />
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <button type="submit" className="btn-primary px-4 py-2" disabled={loading} data-tour="test-submit">
            {loading ? t('writing.scoring') : t('writing.submit')}
          </button>
        </form>

        {result && (
          <div className="card p-6 space-y-4" data-tour="result-card">
            <div data-tour="result-overall">
              <p className="text-sm text-gray-500">{t('writing.overallBand')}</p>
              <p className="text-3xl font-bold text-gray-900">{result.aiScore?.overall || '—'}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2" data-tour="result-metrics">
              {['taskResponse', 'coherence', 'lexical', 'grammar'].map((metric) => (
                <div key={metric} className="border border-gray-100 rounded-xl p-4">
                  <p className="text-sm text-gray-500">{t(`writing.metrics.${metric}`)}</p>
                  <p className="text-xl font-semibold">
                    {result.aiScore?.[metric] ? result.aiScore[metric] : '—'}
                  </p>
                </div>
              ))}
            </div>
            {result.aiScore?.feedback && (
              <div data-tour="result-feedback">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('writing.feedbackLabel')}</p>
                <p className="text-gray-700 whitespace-pre-line">{result.aiScore.feedback}</p>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3" data-tour="result-next">
              <Link to="/" className="text-blue-600 hover:underline text-sm">
                {t('writing.viewDashboardHistory')} →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

