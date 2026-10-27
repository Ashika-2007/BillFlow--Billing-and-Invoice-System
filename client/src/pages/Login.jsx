import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';

const DEMO = [
  { role: 'Admin', email: 'admin@billing.com', password: 'Admin@123' },
  { role: 'Staff', email: 'staff@billing.com', password: 'Staff@123' },
  { role: 'Client', email: 'client@billing.com', password: 'Client@123' }
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form);
      nav('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <div className="eyebrow">Welcome back</div>
      <h2>Sign in to your workspace</h2>
      <p className="muted">Use your billing account to continue.</p>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="form">
        <label>
          Email
          <span className="input-icon">
            <Mail size={16} aria-hidden="true" />
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
            />
          </span>
        </label>
        <label>
          Password
          <div className="password-field">
            <Lock size={16} className="field-lead" aria-hidden="true" />
            <input
              type={show ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
            />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>
        <Button type="submit" full loading={busy}>
          {busy ? 'Signing in...' : 'Sign in'}
          {!busy && <ArrowRight size={16} aria-hidden="true" />}
        </Button>
      </form>

      <p className="auth-switch">
        Don’t have an account? <Link to="/register">Create one</Link>
      </p>

      <div className="demo-box">
        <strong>Demo accounts</strong>
        <span className="demo-hint">Select one to fill the form</span>
        {DEMO.map((d) => (
          <button
            type="button"
            key={d.role}
            className="demo-row"
            onClick={() => setForm({ email: d.email, password: d.password })}
          >
            <b>{d.role}</b>
            <span>
              {d.email} / {d.password}
            </span>
          </button>
        ))}
      </div>
    </AuthLayout>
  );
}
