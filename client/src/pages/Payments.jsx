import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';
import api from '../services/api';
import { money, formatDate, humanize } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';

const PAGE_SIZE = 10;

export default function Payments() {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const canManage = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const isAdmin = user?.role === 'ADMIN';

  const [rows, setRows] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/payments', { params: { search: q } })
      .then((r) => setRows(r.data.data))
      .catch((e) => toast.error(e.response?.data?.message || 'Unable to load payments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!canManage) return;
    api
      .get('/invoices')
      .then((r) => setInvoices(r.data.data.filter((i) => !['PAID', 'CANCELLED'].includes(i.status))))
      .catch(() => {});
  }, []);

  const del = async (p) => {
    const ok = await confirm({
      title: 'Void payment?',
      message: `The ${money(p.amount)} payment${p.invoice?.invoiceNumber ? ` on ${p.invoice.invoiceNumber}` : ''} will be voided and the invoice balance updated.`,
      confirmLabel: 'Void payment',
      cancelLabel: 'Keep payment'
    });
    if (!ok) return;
    try {
      await api.delete(`/payments/${p._id}`);
      toast.success('Payment voided');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Unable to void');
    }
  };

  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const columns = [
    { key: 'paymentDate', label: 'Date', render: (p) => formatDate(p.paymentDate) },
    { key: 'invoice', label: 'Invoice', render: (p) => <span className="mono">{p.invoice?.invoiceNumber || '—'}</span> },
    { key: 'client', label: 'Client', className: 'cell-wrap', render: (p) => p.client?.companyName || p.client?.name },
    { key: 'paymentMethod', label: 'Method', render: (p) => <span className="type-pill">{humanize(p.paymentMethod)}</span> },
    { key: 'transactionId', label: 'Transaction', render: (p) => <span className="mono muted-text">{p.transactionId || '—'}</span> },
    { key: 'amount', label: 'Amount', align: 'right', className: 'num', render: (p) => <strong>{money(p.amount)}</strong> },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            label: <span className="sr-only">Actions</span>,
            align: 'right',
            render: (p) => (
              <div className="row-actions">
                <button className="icon-btn danger" aria-label="Void payment" title="Void payment" onClick={() => del(p)}>
                  <Trash2 size={16} />
                </button>
              </div>
            )
          }
        ]
      : [])
  ];

  return (
    <>
      <PageHeader
        eyebrow="Cash flow"
        title="Payments"
        description={canManage ? 'Record collections and keep invoice balances in sync.' : 'A record of every payment made on your invoices.'}
        actions={canManage && <Button icon={Plus} onClick={() => setOpen(true)}>Record payment</Button>}
      />
      <div className="toolbar">
        <SearchBar value={q} onChange={setQ} placeholder="Search transaction ID..." />
        {!loading && <span className="toolbar-count">{rows.length} {rows.length === 1 ? 'payment' : 'payments'}</span>}
      </div>
      <div className="panel flush">
        <DataTable
          columns={columns}
          rows={pageRows}
          loading={loading}
          caption="Payments"
          empty={
            <EmptyState
              icon={Wallet}
              title={q ? 'No payments match your search.' : 'No payments recorded yet.'}
              description={q ? 'Check the transaction ID and try again.' : 'Payments will show up here as soon as they are recorded.'}
            />
          }
        />
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} total={rows.length} pageSize={PAGE_SIZE} />
      <PaymentModal
        open={open}
        onClose={() => setOpen(false)}
        invoices={invoices}
        onSaved={() => {
          setOpen(false);
          toast.success('Payment recorded');
          load();
        }}
      />
    </>
  );
}

const blankPayment = () => ({
  invoice: '',
  amount: '',
  paymentMethod: 'UPI',
  transactionId: '',
  paymentDate: new Date().toISOString().slice(0, 10),
  notes: ''
});

function PaymentModal({ open, onClose, invoices, onSaved }) {
  const [f, setF] = useState(blankPayment);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const selected = invoices.find((i) => i._id === f.invoice);

  useEffect(() => {
    if (open) {
      setF(blankPayment());
      setErr('');
    }
  }, [open]);

  useEffect(() => {
    if (selected) {
      api
        .get(`/invoices/${selected._id}`)
        .then((r) => setF((x) => ({ ...x, amount: r.data.data.remainingAmount })))
        .catch(() => setF((x) => ({ ...x, amount: selected.totalAmount })));
    }
  }, [selected?._id]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api.post('/payments', f);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.message || 'Unable to record payment');
    } finally {
      setBusy(false);
    }
  };

  const set = (key) => (e) => setF({ ...f, [key]: e.target.value });

  return (
    <Modal open={open} onClose={onClose} title="Record payment">
      <form className="form" onSubmit={save}>
        {err && <div className="form-error" role="alert">{err}</div>}
        <label>
          Invoice
          <select required value={f.invoice} onChange={set('invoice')}>
            <option value="">Select invoice</option>
            {invoices.map((i) => (
              <option key={i._id} value={i._id}>{i.invoiceNumber} — {money(i.totalAmount)}</option>
            ))}
          </select>
        </label>
        {selected && (
          <div className="info-box">
            Invoice total: <strong>{money(selected.totalAmount)}</strong> · Status: {humanize(selected.status)}
          </div>
        )}
        <label>Amount<input type="number" min="0.01" step="0.01" required value={f.amount} onChange={set('amount')} /></label>
        <div className="two-col">
          <label>
            Method
            <select value={f.paymentMethod} onChange={set('paymentMethod')}>
              {['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'OTHER'].map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>Payment date<input type="date" value={f.paymentDate} onChange={set('paymentDate')} /></label>
        </div>
        <label>Transaction ID<input value={f.transactionId} onChange={set('transactionId')} /></label>
        <label>Notes<textarea value={f.notes} onChange={set('notes')} /></label>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>{busy ? 'Recording...' : 'Record payment'}</Button>
        </div>
      </form>
    </Modal>
  );
}
