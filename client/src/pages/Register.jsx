import React, { useState } from 'react';
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
    goal: 'try',
    targetBand: 6.5,
    currentLevel: 'A2'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🎯 {t('auth.createAccount')}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
            {error}
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
              <option value="try">🎯 {t('auth.goalOptions.try')}</option>
              <option value="study">🎓 {t('auth.goalOptions.study')}</option>
              <option value="immigrate">🏠 {t('auth.goalOptions.immigrate')}</option>
              <option value="work">💼 {t('auth.goalOptions.work')}</option>
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
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
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