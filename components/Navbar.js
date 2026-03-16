'use client';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span>Meter DataHub</span>
        </a>
        <div className="navbar-links">
          <a href="/" className="nav-link">🏠 Home</a>
          
          {!user && (
            <a href="/login" className="nav-link">🔑 Login</a>
          )}
          
          {user && (
            <>
              <a href="/meters/add" className="nav-link">➕ Add Meter</a>
              <a href="/my-meters" className="nav-link">📋 My Meters</a>
              {user.isAdmin && (
                <a href="/admin" className="nav-link">⚙️ Admin</a>
              )}
              <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
                👤 {user.fullName} | Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
