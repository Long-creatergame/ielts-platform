import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    goal: 0,
    goalReason: 'try',
    targetBand: 6.5,
    currentLevel: 'A2'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, options, selectedIndex } = e.target;
    const numericFields = ['goal', 'targetBand'];
    const updates = {
      [name]: numericFields.includes(name) ? Number(value) : value
    };
    if (name === 'goal' && options?.[selectedIndex]?.dataset?.reason) {
      updates.goalReason = options[selectedIndex].dataset.reason;
    }
    setFormData((prev) => ({
      ...prev,
      ...updates
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'));
      setLoading(false);
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError(t('auth.passwordComplexity'));
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        goal: Number(formData.goal) || 0,
        targetBand: Number(formData.targetBand) || 6.5,
      };
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full card p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🎯 {t('auth.createAccount')}
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 animate-fade-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.fullName')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.ieltsGoal')}
            </label>
            <select
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0} data-reason="try">🎯 {t('auth.goalOptions.try')}</option>
              <option value={1} data-reason="study">🎓 {t('auth.goalOptions.study')}</option>
              <option value={2} data-reason="immigrate">🏠 {t('auth.goalOptions.immigrate')}</option>
              <option value={3} data-reason="work">💼 {t('auth.goalOptions.work')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="targetBand" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.targetBand')}
            </label>
            <select
              id="targetBand"
              name="targetBand"
              value={formData.targetBand}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5.0}>5.0</option>
              <option value={5.5}>5.5</option>
              <option value={6.0}>6.0</option>
              <option value={6.5}>6.5</option>
              <option value={7.0}>7.0</option>
              <option value={7.5}>7.5</option>
              <option value={8.0}>8.0</option>
              <option value={8.5}>8.5</option>
              <option value={9.0}>9.0</option>
            </select>
          </div>

          <div>
            <label htmlFor="currentLevel" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.currentLevel')}
            </label>
            <select
              id="currentLevel"
              name="currentLevel"
              value={formData.currentLevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A1">{t('auth.levelOptions.A1')}</option>
              <option value="A2">{t('auth.levelOptions.A2')}</option>
              <option value="B1">{t('auth.levelOptions.B1')}</option>
              <option value="B2">{t('auth.levelOptions.B2')}</option>
              <option value="C1">{t('auth.levelOptions.C1')}</option>
              <option value="C2">{t('auth.levelOptions.C2')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('auth.passwordRequirements')}
            </p>
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-1 mb-1">
                  {formData.password.length >= 6 && (
                    <div className="flex-1 h-1 bg-green-500 rounded"></div>
                  )}
                  {formData.password.length > 0 && formData.password.length < 6 && (
                    <div className="flex-1 h-1 bg-yellow-500 rounded"></div>
                  )}
                  {formData.password.length === 0 && (
                    <div className="flex-1 h-1 bg-gray-200 rounded"></div>
                  )}
                  {/(?=.*[a-z])/.test(formData.password) && (
                    <div className="flex-1 h-1 bg-green-500 rounded"></div>
                  )}
                  {formData.password.length > 0 && !/(?=.*[a-z])/.test(formData.password) && (
                    <div className="flex-1 h-1 bg-gray-200 rounded"></div>
                  )}
                  {/(?=.*[A-Z])/.test(formData.password) && (
                    <div className="flex-1 h-1 bg-green-500 rounded"></div>
                  )}
                  {formData.password.length > 0 && !/(?=.*[A-Z])/.test(formData.password) && (
                    <div className="flex-1 h-1 bg-gray-200 rounded"></div>
                  )}
                  {/(?=.*\d)/.test(formData.password) && (
                    <div className="flex-1 h-1 bg-green-500 rounded"></div>
                  )}
                  {formData.password.length > 0 && !/(?=.*\d)/.test(formData.password) && (
                    <div className="flex-1 h-1 bg-gray-200 rounded"></div>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  {formData.password.length >= 6 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) 
                    ? '✓ Mật khẩu mạnh' 
                    : 'Độ mạnh: Trung bình'}
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.confirmPassword')}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:bg-gray-400 py-3 px-4"
          >
            {loading ? t('auth.creatingAccount') : t('auth.signUp')}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}