import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="font-semibold text-lg">IELTS Writing AI</div>
      {user && (
        <nav className="nav-links flex items-center gap-4">
          <Link to="/">Dashboard</Link>
          <Link to="/writing">Writing Task</Link>
          <button onClick={logout} className="btn-secondary px-3 py-1">
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}

