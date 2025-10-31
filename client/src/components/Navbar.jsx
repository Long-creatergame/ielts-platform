import React, { useState, memo, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import HelpCenter from './HelpCenter';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

const Navbar = memo(() => {
  const { user, logout } = useAuth();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  // Removed Quick Start per UX cleanup
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleLanguageChange = useCallback((langCode) => {
    i18n.changeLanguage(langCode);
  }, [i18n]);

  const toggleMobileMenu = useCallback(() => {
    setShowMobileMenu(prev => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  const userInitial = useMemo(() => 
    user?.name?.charAt(0).toUpperCase() || 'U', 
    [user]
  );

  return (
    <nav className="bg-white/90 backdrop-blur sticky top-0 z-40 border-b border-gray-100">
      <div className="container-page">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            <span className="text-3xl">🎯</span>
            <span className="hidden sm:block">IELTS Platform</span>
            <span className="sm:hidden">IELTS</span>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            {user ? (
              <>
                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    {t('nav.dashboard')}
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    {t('nav.profile')}
                  </Link>
                </div>
                
                {/* Action Buttons */}
                <div className="hidden md:flex items-center space-x-2">
                  <button
                    onClick={() => setShowHelpCenter(true)}
                    className="btn-primary px-3 py-2 text-sm"
                  >
                    {t('common.help')}
                  </button>
                </div>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {userInitial}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-[500]" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-[501] overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        
                        {/* Language Selector */}
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-xs text-gray-500 mb-2 font-medium">🌐 {t('common.language')}</p>
                          <div className="grid grid-cols-2 gap-1">
                            {languages.map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors ${
                                  i18n.language === lang.code 
                                    ? 'bg-blue-100 text-blue-600 font-semibold' 
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <span className="text-base">{lang.flag}</span>
                                <span>{lang.name}</span>
                                {i18n.language === lang.code && (
                                  <svg className="w-3 h-3 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                          >
                            <span>🚪</span>
                            <span>{t('nav.logout')}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Start removed */}
      
      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            <Link 
              to="/dashboard" 
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              {t('nav.dashboard')}
            </Link>
            <Link 
              to="/profile" 
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              {t('nav.profile')}
            </Link>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="px-3 py-2 flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <span className="text-sm text-gray-600 font-medium">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Help Center */}
      <HelpCenter isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;