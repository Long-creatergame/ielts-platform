import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import OnboardingTour from '../components/OnboardingTour';
import { resultSteps, testSteps } from '../onboarding/onboardingSteps';
import { useOnboarding } from '../hooks/useOnboarding';

const SAMPLE_PROMPT =
  'Some people think that governments should invest more money in public services instead of arts such as music and theatre. To what extent do you agree or disagree?';

export default function WritingTask() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!prompt.trim() || !essay.trim()) {
      setError('Please provide both a prompt and your essay response.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/writing/submit', { prompt, essay, level });
      setResult(data.data || data);
      setEssay('');
    } catch (err) {
      console.error('Writing submission failed', err);
      setError(err.response?.data?.message || 'Unable to score your essay right now.');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">IELTS Writing Task 2</h1>
          <p className="text-gray-600">
            Paste your essay, submit it, and receive instant AI scoring calibrated for IELTS Task 2.
          </p>
          {forcedSegment === 'result' && !result && (
            <p className="text-sm text-gray-700 mt-3" data-tour="test-rules">
              Để xem hướng dẫn <strong>Kết quả</strong>, bạn hãy nộp bài trước (sau đó phần kết quả sẽ hiện ra).
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          <div data-tour="test-rules">
            <p className="text-sm text-gray-600">
              Lưu ý: khi đang làm bài, hạn chế refresh trang để tránh mất nội dung.
            </p>
          </div>

          <div data-tour="test-prompt">
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div data-tour="test-level">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your level</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Essay</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 min-h-[220px]"
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Write at least 250 words..."
            />
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <button type="submit" className="btn-primary px-4 py-2" disabled={loading} data-tour="test-submit">
            {loading ? 'Scoring…' : 'Submit for AI scoring'}
          </button>
        </form>

        {result && (
          <div className="card p-6 space-y-4" data-tour="result-card">
            <div data-tour="result-overall">
              <p className="text-sm text-gray-500">Overall band</p>
              <p className="text-3xl font-bold text-gray-900">{result.aiScore?.overall || '—'}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2" data-tour="result-metrics">
              {['taskResponse', 'coherence', 'lexical', 'grammar'].map((metric) => (
                <div key={metric} className="border border-gray-100 rounded-xl p-4">
                  <p className="text-sm text-gray-500 capitalize">{metric}</p>
                  <p className="text-xl font-semibold">
                    {result.aiScore?.[metric] ? result.aiScore[metric] : '—'}
                  </p>
                </div>
              ))}
            </div>
            {result.aiScore?.feedback && (
              <div data-tour="result-feedback">
                <p className="text-sm font-medium text-gray-700 mb-2">Feedback</p>
                <p className="text-gray-700 whitespace-pre-line">{result.aiScore.feedback}</p>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3" data-tour="result-next">
              <Link to="/" className="text-blue-600 hover:underline text-sm">
                Xem lịch sử & tiến độ ở Dashboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

