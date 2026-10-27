import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import api from '../services/api';
import { money } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const PAGE_SIZE = 10;

export default function Products() {
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

  const load = () => {
    setLoading(true);
    api
      .get('/products', { params: { search: q } })
      .then((r) => setRows(r.data.data))
      .catch((e) => toast.error(e.response?.data?.message || 'Unable to load items'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q]);

  const del = async (p) => {
    const ok = await confirm({
      title: 'Delete item?',
      message: `“${p.name}” will be removed from your catalog.`,
      confirmLabel: 'Delete item'
    });
    if (!ok) return;
    try {
      await api.delete(`/products/${p._id}`);
      toast.success('Item deleted');
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
      label: 'Name',
      className: 'cell-wide',
      render: (p) => (
        <>
          <strong>{p.name}</strong>
          <div className="muted small clamp-1">{p.description}</div>
        </>
      )
    },
    { key: 'type', label: 'Type', render: (p) => <span className="type-pill">{p.type}</span> },
    { key: 'price', label: 'Price', align: 'right', className: 'num', render: (p) => money(p.price) },
    { key: 'taxRate', label: 'Tax', align: 'right', className: 'num', render: (p) => `${p.taxRate}%` },
    { key: 'unit', label: 'Unit' },
    { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'actions',
      label: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (p) => (
        <div className="row-actions">
          <button
            className="icon-btn"
            aria-label={`Edit ${p.name}`}
            title="Edit"
            onClick={() => {
              setEdit(p);
              setOpen(true);
            }}
          >
            <Pencil size={16} />
          </button>
          {isAdmin && (
            <button className="icon-btn danger" aria-label={`Delete ${p.name}`} title="Delete" onClick={() => del(p)}>
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
        eyebrow="Catalog"
        title="Products & services"
        description="Keep your billable catalog current with prices and GST rates."
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
          >
            Add item
          </Button>
        }
      />
      <div className="toolbar">
        <SearchBar value={q} onChange={setQ} placeholder="Search products and services..." />
        {!loading && <span className="toolbar-count">{rows.length} {rows.length === 1 ? 'item' : 'items'}</span>}
      </div>
      <div className="panel flush">
        <DataTable
          columns={columns}
          rows={pageRows}
          loading={loading}
          caption="Products and services"
          empty={
            <EmptyState
              icon={Package}
              title={q ? 'No items match your search.' : 'No products or services yet.'}
              description={q ? 'Try a different keyword.' : 'Add items to reuse them on every invoice.'}
            />
          }
        />
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} total={rows.length} pageSize={PAGE_SIZE} />
      <ProductModal
        open={open}
        onClose={() => setOpen(false)}
        initial={edit}
        onSaved={() => {
          setOpen(false);
          toast.success(edit ? 'Item updated' : 'Item added');
          load();
        }}
      />
    </>
  );
}

const blankProduct = { name: '', type: 'SERVICE', description: '', price: '', taxRate: 18, unit: 'unit', status: 'ACTIVE' };

function ProductModal({ open, onClose, initial, onSaved }) {
  const [f, setF] = useState(blankProduct);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) {
      setF(initial || blankProduct);
      setErr('');
    }
  }, [open, initial]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      if (initial) await api.put(`/products/${initial._id}`, f);
      else await api.post('/products', f);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.message || 'Unable to save');
    } finally {
      setBusy(false);
    }
  };

  const set = (key) => (e) => setF({ ...f, [key]: e.target.value });

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit item' : 'Add product/service'}>
      <form className="form" onSubmit={save}>
        {err && <div className="form-error" role="alert">{err}</div>}
        <label>Name<input required value={f.name} onChange={set('name')} /></label>
        <div className="two-col">
          <label>
            Type
            <select value={f.type} onChange={set('type')}>
              <option>PRODUCT</option>
              <option>SERVICE</option>
            </select>
          </label>
          <label>Unit<input value={f.unit} onChange={set('unit')} /></label>
        </div>
        <div className="two-col">
          <label>Price<input type="number" min="0" step="0.01" required value={f.price} onChange={set('price')} /></label>
          <label>Tax rate %<input type="number" min="0" max="100" step="0.01" value={f.taxRate} onChange={set('taxRate')} /></label>
        </div>
        <label>Description<textarea value={f.description} onChange={set('description')} /></label>
        <label>
          Status
          <select value={f.status} onChange={set('status')}>
            <option>ACTIVE</option>
            <option>INACTIVE</option>
          </select>
        </label>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>{busy ? 'Saving...' : 'Save item'}</Button>
        </div>
      </form>
    </Modal>
  );
}
