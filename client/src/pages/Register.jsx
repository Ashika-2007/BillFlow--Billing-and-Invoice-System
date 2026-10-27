import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      nav('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to register');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <div className="eyebrow">Get started</div>
      <h2>Create your billing account</h2>
      <p className="muted">Client accounts can manage their own billing information securely.</p>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="form">
        <label>
          Full name
          <input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <div className="two-col">
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Phone
            <input type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
        </div>
        <label>
          Password
          <div className="password-field">
            <input
              type={show ? 'text' : 'password'}
              minLength="8"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <small className="field-hint">At least 8 characters.</small>
        </label>
        <Button type="submit" full loading={busy}>
          {busy ? 'Creating...' : 'Create account'}
        </Button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
