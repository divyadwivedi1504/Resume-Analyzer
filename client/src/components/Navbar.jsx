import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <Sparkles size={22} /> Resume<span>IQ</span>
        </Link>
        <nav className="nav-links">
          {user ? (
            <>
              <NavLink to="/analyze">Analyze</NavLink>
              <NavLink to="/dashboard">History</NavLink>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <LogOut size={16} /> {(user.name || 'Account').split(' ')[0]}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link to="/register" className="btn btn-primary">Get started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
