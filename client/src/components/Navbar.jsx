import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import QuickStart from './QuickStart';
import HelpCenter from './HelpCenter';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/test/start" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Take Test
                  </Link>
                  <Link to="/test-history" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Test History
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Profile
                  </Link>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <LanguageSelector />
                  <button
                    onClick={() => setShowQuickStart(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <span className="hidden sm:inline">Quick Start</span>
                    <span className="sm:hidden">QS</span>
                  </button>
                  <button
                    onClick={() => setShowHelpCenter(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <span className="hidden sm:inline">Help</span>
                    <span className="sm:hidden">?</span>
                  </button>
                </div>
                
                {/* User Info & Logout */}
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden">Exit</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Start Modal */}
      {showQuickStart && (
        <QuickStart onClose={() => setShowQuickStart(false)} />
      )}
      
      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            <Link 
              to="/dashboard" 
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/test/start" 
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              Take Test
            </Link>
            <Link 
              to="/test-history" 
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              Test History
            </Link>
            <Link 
              to="/profile" 
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              Profile
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
}
