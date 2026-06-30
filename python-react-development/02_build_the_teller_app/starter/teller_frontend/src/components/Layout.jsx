import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPORARY starter scaffold so the app runs and you can navigate while building.
// Replace this with a proper Carbon **UI Shell** app shell (Header, HeaderName,
// HeaderNavigation, HeaderGlobalBar) per SPEC.md, including:
//   • GFM Bank branding   • online/offline backend status indicator   • logout
// ─────────────────────────────────────────────────────────────────────────────
const Layout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <strong>GFM Bank — Teller Portal (scaffold)</strong>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/transfer">Transfer</NavLink>
        <NavLink to="/overdraft">Overdraft</NavLink>
        <button type="button" onClick={handleLogout} style={{ marginLeft: 'auto' }}>
          Log out
        </button>
      </nav>
      <main style={{ padding: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
