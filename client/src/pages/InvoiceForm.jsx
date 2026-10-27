import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { money as formatMoney } from '../utils/format';
import { useToast } from '../components/Toast';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';

const money = (n) => formatMoney(n, 2);
const blank = { product: '', quantity: 1, discount: 0 };

export default function InvoiceForm() {
  const { id } = useParams();
  const edit = Boolean(id);
  const nav = useNavigate();
  const toast = useToast();

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [f, setF] = useState({
    client: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    discount: 0,
    discountType: 'PERCENTAGE',
    notes: '',
    terms: 'Payment due within 14 days.',
    status: 'DRAFT',
    items: [{ ...blank }]
  });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(edit);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/products')])
      .then(([c, p]) => {
        setClients(c.data.data);
        setProducts(p.data.data.filter((x) => x.status === 'ACTIVE'));
      })
      .catch((e) => setLoadError(e.response?.data?.message || 'Unable to load clients and products'));

    if (edit)
      api
        .get(`/invoices/${id}`)
        .then((r) => {
          const x = r.data.data;
          setF({
            client: x.client._id,
            issueDate: x.issueDate.slice(0, 10),
            dueDate: x.dueDate.slice(0, 10),
            discount: x.discount,
            discountType: x.discountType,
            notes: x.notes || '',
            terms: x.terms || '',
            status: x.status,
            items: x.items.map((i) => ({ product: i.product, quantity: i.quantity, discount: i.discount }))
          });
        })
        .catch((e) => setLoadError(e.response?.data?.message || 'Unable to load invoice'))
        .finally(() => setLoading(false));
  }, [id]);

  const totals = useMemo(() => {
    let subtotal = 0,
      tax = 0;
    f.items.forEach((i) => {
      const p = products.find((x) => x._id === i.product);
      if (p) {
        const gross = p.price * Number(i.quantity || 0);
        const after = Math.max(0, gross - Number(i.discount || 0));
        subtotal += gross;
        tax += (after * p.taxRate) / 100;
      }
    });
    const disc = f.discountType === 'FIXED' ? Math.min(Number(f.discount || 0), subtotal) : (subtotal * Number(f.discount || 0)) / 100;
    return {
      subtotal,
      discount: disc,
      tax: Math.max(0, tax - disc * (tax / (subtotal || 1))),
      total: Math.max(0, subtotal - disc) + Math.max(0, tax - disc * (tax / (subtotal || 1)))
    };
  }, [f, products]);

  const setItem = (idx, key, val) =>
    setF((x) => ({ ...x, items: x.items.map((i, n) => (n === idx ? { ...i, [key]: val } : i)) }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...f,
        items: f.items.map((i) => ({ product: i.product, quantity: Number(i.quantity), discount: Number(i.discount || 0) }))
      };
      if (edit) await api.put(`/invoices/${id}`, payload);
      else await api.post('/invoices', payload);
      toast.success(edit ? 'Invoice updated' : 'Invoice created');
      nav('/invoices');
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to save invoice');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading invoice..." />;
  if (loadError && edit && !f.client) return <ErrorState message={loadError} onRetry={() => window.location.reload()} />;

  return (
    <>
      <PageHeader
        eyebrow="Invoice"
        title={edit ? 'Edit invoice' : 'Create invoice'}
        description="Build an invoice from your live client and catalog data."
        actions={<Button variant="secondary" icon={ArrowLeft} onClick={() => nav('/invoices')}>Back</Button>}
      />
      {(error || loadError) && <div className="form-error" role="alert">{error || loadError}</div>}

      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="panel form-stack">
            <div className="panel-title">Invoice details</div>
            <div className="two-col">
              <label>
                Client
                <select required value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })}>
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>{c.companyName || c.name} — {c.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
                  <option>DRAFT</option>
                  <option>SENT</option>
                  <option>PENDING</option>
                </select>
              </label>
            </div>
            <div className="two-col">
              <label>Issue date<input type="date" required value={f.issueDate} onChange={(e) => setF({ ...f, issueDate: e.target.value })} /></label>
              <label>Due date<input type="date" required value={f.dueDate} min={f.issueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></label>
            </div>

            <div className="panel-title line">Line items</div>
            <div className="line-item line-head" aria-hidden="true">
              <span>Product / service</span>
              <span>Qty</span>
              <span>Item discount</span>
              <span className="align-right">Line total</span>
              <span />
            </div>
            {f.items.map((it, idx) => {
              const p = products.find((x) => x._id === it.product);
              return (
                <div className="line-item" key={idx}>
                  <select value={it.product} onChange={(e) => setItem(idx, 'product', e.target.value)} required aria-label={`Item ${idx + 1} product`}>
                    <option value="">Select product/service</option>
                    {products.map((x) => (
                      <option key={x._id} value={x._id}>{x.name} — {money(x.price)}</option>
                    ))}
                  </select>
                  <input type="number" min="0.01" step="0.01" value={it.quantity} onChange={(e) => setItem(idx, 'quantity', e.target.value)} aria-label={`Item ${idx + 1} quantity`} />
                  <input type="number" min="0" step="0.01" value={it.discount} onChange={(e) => setItem(idx, 'discount', e.target.value)} placeholder="Item discount" aria-label={`Item ${idx + 1} discount`} />
                  <div className="line-total">{money(p ? p.price * Number(it.quantity || 0) - Number(it.discount || 0) : 0)}</div>
                  {f.items.length > 1 ? (
                    <button type="button" className="icon-btn danger" aria-label={`Remove item ${idx + 1}`} onClick={() => setF((x) => ({ ...x, items: x.items.filter((_, n) => n !== idx) }))}>
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              );
            })}
            <div>
              <Button variant="ghost" icon={Plus} onClick={() => setF((x) => ({ ...x, items: [...x.items, { ...blank }] }))}>
                Add line item
              </Button>
            </div>

            <div className="two-col">
              <label>Discount<input type="number" min="0" value={f.discount} onChange={(e) => setF({ ...f, discount: e.target.value })} /></label>
              <label>
                Discount type
                <select value={f.discountType} onChange={(e) => setF({ ...f, discountType: e.target.value })}>
                  <option>PERCENTAGE</option>
                  <option>FIXED</option>
                </select>
              </label>
            </div>
            <label>Notes<textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
            <label>Terms<textarea value={f.terms} onChange={(e) => setF({ ...f, terms: e.target.value })} /></label>
          </div>

          <aside className="panel invoice-summary">
            <div className="panel-title">Summary</div>
            <div className="summary-row"><span>Subtotal</span><strong>{money(totals.subtotal)}</strong></div>
            <div className="summary-row"><span>Discount</span><strong>- {money(totals.discount)}</strong></div>
            <div className="summary-row"><span>Tax</span><strong>{money(totals.tax)}</strong></div>
            <div className="summary-total"><span>Total</span><strong>{money(totals.total)}</strong></div>
            <Button type="submit" full loading={busy}>{busy ? 'Saving...' : edit ? 'Save changes' : 'Create invoice'}</Button>
            <p className="muted small">The backend re-fetches catalog prices/tax rates and recalculates all totals before saving.</p>
          </aside>
        </div>
      </form>
    </>
  );
}
