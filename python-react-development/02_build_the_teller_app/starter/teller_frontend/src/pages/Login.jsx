import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// STARTER STUB — a minimal, working login so you can sign in and test the wiring.
// Rebuild this as a polished Carbon login per SPEC.md (Form, TextInput, Button,
// InlineNotification for errors, GFM Bank branding). The auth call (useAuth().login)
// already works against the backend — keep using it.
// ─────────────────────────────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState(import.meta.env.VITE_TELLER_USERNAME || '');
  const [password, setPassword] = useState(import.meta.env.VITE_TELLER_PASSWORD || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      // A 401 means the credentials are wrong. Anything else is usually the
      // backend still waking up (it scales to zero, ~10–15s cold start) or a
      // network error — don't mislabel that as bad credentials.
      if (err?.response?.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError('Could not reach the backend — it may be waking up (~15s). Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: '4rem auto', fontFamily: 'sans-serif' }}>
      <h1>GFM Bank — Teller Portal</h1>
      <p style={{ color: '#6f6f6f' }}>Starter stub — rebuild with Carbon per SPEC.md.</p>
      <form onSubmit={onSubmit}>
        {error && <p style={{ color: '#da1e28' }}>{error}</p>}
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <button type="submit" disabled={busy || !username || !password} style={{ marginTop: '1rem' }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default Login;
