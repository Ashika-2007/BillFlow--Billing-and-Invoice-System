import React, { useEffect, useState } from 'react';
import { Save, Pencil } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';
import Modal from '../components/Modal';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';

export default function Settings() {
  const toast = useToast();
  const [tax, setTax] = useState(null);
  const [ratesText, setRatesText] = useState('');
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const load = () =>
    Promise.all([api.get('/settings/tax'), api.get('/settings/users')])
      .then(([t, u]) => {
        setTax(t.data.data);
        setRatesText(t.data.data.rates.join(', '));
        setUsers(u.data.data);
        setError('');
      })
      .catch((e) => setError(e.response?.data?.message || 'Unable to load settings'));

  useEffect(() => {
    load();
  }, []);

  if (error && !tax) return <ErrorState message={error} onRetry={load} />;
  if (!tax) return <LoadingSpinner label="Loading settings..." />;

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put('/settings/tax', tax);
      toast.success('Tax settings saved');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Unable to save');
    } finally {
      setBusy(false);
    }
  };

  // Keep the raw text while typing; derive the numeric list from it
  const onRates = (e) => {
    const text = e.target.value;
    setRatesText(text);
    setTax({
      ...tax,
      rates: text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
        .filter((x) => !Number.isNaN(x))
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (u) => (
        <div className="person">
          <Avatar name={u.name} tone="soft" />
          <div>
            <strong>{u.name}</strong>
            <div className="muted small">{u.email}</div>
          </div>
        </div>
      )
    },
    { key: 'role', label: 'Role', render: (u) => <span className="type-pill">{u.role}</span> },
    { key: 'status', label: 'Status', render: (u) => <StatusBadge status={u.status} /> },
    {
      key: 'actions',
      label: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (u) => (
        <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setEditing(u)} aria-label={`Edit ${u.name}`}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <>
      <PageHeader eyebrow="Admin" title="Settings" description="Configure GST rates and manage workspace access." />
      <div className="settings-grid">
        <section className="panel">
          <div className="panel-title">Tax settings</div>
          <form className="form" onSubmit={save}>
            <label>
              Tax profile name
              <input value={tax.name} onChange={(e) => setTax({ ...tax, name: e.target.value })} />
            </label>
            <label>
              Available GST rates
              <input value={ratesText} onChange={onRates} inputMode="decimal" placeholder="0, 5, 12, 18, 28" />
              <small className="field-hint">Separate rates with commas.</small>
            </label>
            {tax.rates.length > 0 && (
              <div className="chip-row" aria-label="Rates preview">
                {tax.rates.map((r, i) => (
                  <span className={`chip ${r === Number(tax.defaultRate) ? 'is-default' : ''}`} key={`${r}-${i}`}>{r}%</span>
                ))}
              </div>
            )}
            <label>
              Default rate
              <select value={tax.defaultRate} onChange={(e) => setTax({ ...tax, defaultRate: Number(e.target.value) })}>
                {tax.rates.map((r) => (
                  <option key={r} value={r}>{r}%</option>
                ))}
              </select>
            </label>
            <div>
              <Button type="submit" icon={Save} loading={busy}>{busy ? 'Saving...' : 'Save settings'}</Button>
            </div>
          </form>
        </section>

        <section className="panel flush">
          <div className="panel-head padded">
            <div>
              <h3>Team access</h3>
              <p>{users.length} {users.length === 1 ? 'user' : 'users'} in this workspace</p>
            </div>
          </div>
          <DataTable columns={columns} rows={users} caption="Team members" />
        </section>
      </div>

      <UserModal
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          toast.success('User updated');
          load();
        }}
      />
    </>
  );
}

function UserModal({ user, onClose, onSaved }) {
  const toast = useToast();
  const [role, setRole] = useState('CLIENT');
  const [status, setStatus] = useState('ACTIVE');
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState(null);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setStatus(user.status);
      setLast(user);
    }
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put(`/settings/users/${user._id}`, { role, status });
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update user');
    } finally {
      setBusy(false);
    }
  };

  const shown = user || last;

  return (
    <Modal open={Boolean(user)} onClose={onClose} title="Edit user access" size="sm">
      {shown && (
        <form className="form" onSubmit={submit}>
          <div className="person modal-person">
            <Avatar name={shown.name} tone="soft" />
            <div>
              <strong>{shown.name}</strong>
              <div className="muted small">{shown.email}</div>
            </div>
          </div>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option>ADMIN</option>
              <option>STAFF</option>
              <option>CLIENT</option>
            </select>
          </label>
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>ACTIVE</option>
              <option>INACTIVE</option>
            </select>
          </label>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={busy}>{busy ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
