import React, { useEffect, useState } from 'react';
import { Plus, Eye, Pencil, Trash2, ReceiptText } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { money, formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';

const PAGE_SIZE = 10;
const STATUSES = ['DRAFT', 'SENT', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'];

export default function Invoices() {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const canManage = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const isAdmin = user?.role === 'ADMIN';

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    api
      .get('/invoices', { params: { search: q, status } })
      .then((r) => setRows(r.data.data))
      .catch((e) => toast.error(e.response?.data?.message || 'Unable to load invoices'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [q, status]);

  const del = async (inv) => {
    const ok = await confirm({
      title: 'Cancel invoice?',
      message: `${inv.invoiceNumber} will be marked as cancelled and can no longer be edited.`,
      confirmLabel: 'Cancel invoice',
      cancelLabel: 'Keep invoice'
    });
    if (!ok) return;
    try {
      await api.delete(`/invoices/${inv._id}`);
      toast.success(`${inv.invoiceNumber} cancelled`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Unable to cancel');
    }
  };

  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const locked = (inv) => ['PAID', 'CANCELLED'].includes(inv.status);

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (i) => (
        <Link className="link mono" to={`/invoices/${i._id}`}>
          {i.invoiceNumber}
        </Link>
      )
    },
    { key: 'client', label: 'Client', className: 'cell-wrap', render: (i) => i.client?.companyName || i.client?.name },
    { key: 'issueDate', label: 'Issued', render: (i) => formatDate(i.issueDate) },
    { key: 'dueDate', label: 'Due', render: (i) => formatDate(i.dueDate) },
    { key: 'totalAmount', label: 'Amount', align: 'right', className: 'num', render: (i) => <strong>{money(i.totalAmount)}</strong> },
    { key: 'status', label: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    {
      key: 'actions',
      label: <span className="sr-only">Actions</span>,
      align: 'right',
      render: (i) => (
        <div className="row-actions">
          <Link className="icon-btn" to={`/invoices/${i._id}`} aria-label={`View ${i.invoiceNumber}`} title="View">
            <Eye size={16} />
          </Link>
          {canManage &&
            (locked(i) ? (
              <span className="icon-btn is-disabled" aria-disabled="true" title="Paid or cancelled invoices can’t be edited">
                <Pencil size={16} />
              </span>
            ) : (
              <Link className="icon-btn" to={`/invoices/${i._id}/edit`} aria-label={`Edit ${i.invoiceNumber}`} title="Edit">
                <Pencil size={16} />
              </Link>
            ))}
          {isAdmin && !locked(i) && (
            <button className="icon-btn danger" aria-label={`Cancel ${i.invoiceNumber}`} title="Cancel invoice" onClick={() => del(i)}>
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
        eyebrow="Billing"
        title="Invoices"
        description={canManage ? 'Create, track and manage every customer invoice.' : 'Review your invoices and download copies.'}
        actions={canManage && <Button to="/invoices/new" icon={Plus}>Create invoice</Button>}
      />
      <div className="toolbar">
        <SearchBar value={q} onChange={setQ} placeholder="Search invoice number..." />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
          ))}
        </select>
        {!loading && <span className="toolbar-count">{rows.length} {rows.length === 1 ? 'invoice' : 'invoices'}</span>}
      </div>
      <div className="panel flush">
        <DataTable
          columns={columns}
          rows={pageRows}
          loading={loading}
          caption="Invoices"
          empty={
            <EmptyState
              icon={ReceiptText}
              title={q || status ? 'No invoices match your filters.' : 'No invoices found.'}
              description={q || status ? 'Clear the search or choose a different status.' : canManage ? 'Create your first invoice to get paid.' : 'Invoices issued to you will appear here.'}
              action={canManage && !q && !status && <Button to="/invoices/new" icon={Plus}>Create invoice</Button>}
            />
          }
        />
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} total={rows.length} pageSize={PAGE_SIZE} />
    </>
  );
}
