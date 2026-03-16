'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = '/';
      } else {
        setError(data.error || 'Login failed. Invalid API key.');
      }
    } catch (e) {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '16px' }}>🔐</div>
        <h1 className="login-title">Login</h1>
        <p className="login-subtitle">আপনার PBSNet API Key দিয়ে লগইন করুন</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">API Key</label>
            <input
              type="text"
              className="form-input"
              placeholder="pbsnet-xxxx-xxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              id="api-key-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px' }}
            id="login-submit"
          >
            {loading ? 'Verifying...' : 'Login with PBSNet'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          PBSNet API Key দিয়ে সুরক্ষিত ভাবে লগইন হবে
        </p>
      </div>
    </div>
  );
}
