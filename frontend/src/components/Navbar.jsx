import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, MapPin, Calendar, ShieldCheck, LogOut, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon-box">
            <Zap size={22} fill="white" strokeWidth={2.5} />
          </div>
          <span>VoltFinder</span>
        </Link>

        {/* Center Nav Links */}
        <nav>
          <ul className="nav-menu">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                end
              >
                <MapPin size={17} />
                <span>Explore Map</span>
              </NavLink>
            </li>

            {isAuthenticated && (
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <Calendar size={17} />
                  <span>My Dashboard</span>
                </NavLink>
              </li>
            )}

            {isAdmin && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <ShieldCheck size={17} />
                  <span>Admin Panel</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Right Nav Actions */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <div className="user-badge">
                <div className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user?.name?.split(' ')[0]}</span>
                {isAdmin && <span className="admin-tag">Admin</span>}
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Log Out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                <LogIn size={16} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
