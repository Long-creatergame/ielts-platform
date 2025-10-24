import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import QuickStart from './QuickStart';
import HelpCenter from './HelpCenter';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            🎯 IELTS Platform
          </Link>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link to="/test/start" className="text-gray-700 hover:text-blue-600">
                  Take Test
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                  Profile
                </Link>
                <button
                  onClick={() => setShowQuickStart(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Quick Start
                </button>
                <button
                  onClick={() => setShowHelpCenter(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Help
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">👋 {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Logout
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
      
      {/* Help Center */}
      <HelpCenter isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />
    </nav>
  );
}
