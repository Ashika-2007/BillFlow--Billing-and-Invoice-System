import React, { useEffect, useState } from 'react';
import { Plus, Eye, Pencil, Trash2, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Pagination from '../components/Pagination';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';

const PAGE_SIZE = 10;

export default function Clients() {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const isAdmin = user?.role === 'ADMIN';

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api
      .get('/clients', { params: { search: q } })
      .then((r) => setRows(r.data.data))
      .catch((e) => setError(e.response?.data?.message || 'Unable to load clients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q]);

  const del = async (c) => {
    const ok = await confirm({
      title: 'Delete client?',
      message: `“${c.companyName || c.name}” will be permanently removed. This can’t be undone.`,
      confirmLabel: 'Delete client'
    });
    if (!ok) return;
    try {
      await api.delete(`/clients/${c._id}`);
      toast.success('Client deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Unable to delete');
    }
  };

  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const columns = [
    {
      key: 'name',
      label: 'Client',
      render: (c) => (
        <div className="person">
          <Avatar name={c.name} tone="soft" />
          <strong>{c.name}</strong>
        </div>
      )
    },
    { key: 'companyName', label: 'Company', render: (c) => c.companyName || '—' },
    { key: 'email', label: 'Email', className: 'cell-wrap', render: (c) => c.email },
    { key: 'phone', label: 'Phone', render: (c) => c.phone || '—' },
    { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    {
      key: 'actions',
      label: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (c) => (
        <div className="row-actions">
          <Link to={`/clients/${c._id}`} className="icon-btn" aria-label={`View ${c.name}`} title="View">
            <Eye size={16} />
          </Link>
          <button
            className="icon-btn"
            aria-label={`Edit ${c.name}`}
            title="Edit"
            onClick={() => {
              setEdit(c);
              setOpen(true);
            }}
          >
            <Pencil size={16} />
          </button>
          {isAdmin && (
            <button className="icon-btn danger" aria-label={`Delete ${c.name}`} title="Delete" onClick={() => del(c)}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title="Clients"
        description="Manage customers, contacts and outstanding balances."
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
          >
            Add client
          </Button>
        }
      />

      <div className="toolbar">
        <SearchBar value={q} onChange={setQ} placeholder="Search clients, companies or email..." />
        {!loading && !error && <span className="toolbar-count">{rows.length} {rows.length === 1 ? 'client' : 'clients'}</span>}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="panel flush">
            <DataTable
              columns={columns}
              rows={pageRows}
              loading={loading}
              caption="Clients"
              empty={
                <EmptyState
                  icon={UsersRound}
                  title={q ? 'No clients match your search.' : 'No clients yet.'}
                  description={q ? 'Try a different name, company or email.' : 'Add your first client to start sending invoices.'}
                />
              }
            />
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} total={rows.length} pageSize={PAGE_SIZE} />
        </>
      )}

      <ClientModal
        open={open}
        onClose={() => setOpen(false)}
        initial={edit}
        onSaved={() => {
          setOpen(false);
          toast.success(edit ? 'Client updated' : 'Client added');
          load();
        }}
      />
    </>
  );
}

const blankClient = {
  name: '',
  email: '',
  phone: '',
  companyName: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  postalCode: '',
  taxId: '',
  notes: '',
  status: 'ACTIVE'
};

function ClientModal({ open, onClose, initial, onSaved }) {
  const [form, setForm] = useState(blankClient);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initial || blankClient);
      setError('');
    }
  }, [open, initial]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (initial) await api.put(`/clients/${initial._id}`, form);
      else await api.post('/clients', form);
      onSaved();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to save client');
    } finally {
      setBusy(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit client' : 'Add client'} wide>
      <form className="form" onSubmit={submit}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="two-col">
          <label>Name<input required value={form.name} onChange={set('name')} /></label>
          <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        </div>
        <div className="two-col">
          <label>Phone<input value={form.phone} onChange={set('phone')} /></label>
          <label>Company<input value={form.companyName} onChange={set('companyName')} /></label>
        </div>
        <label>Address<input value={form.address} onChange={set('address')} /></label>
        <div className="three-col">
          <label>City<input value={form.city} onChange={set('city')} /></label>
          <label>State<input value={form.state} onChange={set('state')} /></label>
          <label>Postal code<input value={form.postalCode} onChange={set('postalCode')} /></label>
        </div>
        <div className="two-col">
          <label>Tax ID<input value={form.taxId} onChange={set('taxId')} /></label>
          <label>
            Status
            <select value={form.status} onChange={set('status')}>
              <option>ACTIVE</option>
              <option>INACTIVE</option>
            </select>
          </label>
        </div>
        <label>Notes<textarea value={form.notes} onChange={set('notes')} /></label>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>{busy ? 'Saving...' : 'Save client'}</Button>
        </div>
      </form>
    </Modal>
  );
}
