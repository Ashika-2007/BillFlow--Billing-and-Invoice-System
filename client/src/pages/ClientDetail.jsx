import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Hash, ReceiptText } from 'lucide-react';
import api from '../services/api';
import { money, formatDate } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import Avatar from '../components/Avatar';

export default function ClientDetail() {
  const { id } = useParams();
  const [x, setX] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    api
      .get(`/clients/${id}`)
      .then((r) => setX(r.data.data))
      .catch((e) => setError(e.response?.data?.message || 'Unable to load client'));
  };

  useEffect(load, [id]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!x) return <LoadingSpinner label="Loading client..." />;

  const address = [x.client.address, x.client.city, x.client.state, x.client.postalCode].filter(Boolean).join(', ');

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
    { key: 'totalAmount', label: 'Amount', align: 'right', className: 'num', render: (i) => money(i.totalAmount) },
    { key: 'status', label: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    { key: 'dueDate', label: 'Due', render: (i) => formatDate(i.dueDate) }
  ];

  return (
    <>
      <div className="detail-top">
        <Button to="/clients" variant="secondary" icon={ArrowLeft}>
          Back to clients
        </Button>
      </div>
      <div className="detail-grid">
        <aside className="panel profile-card">
          <Avatar name={x.client.name} size="xl" />
          <h2>{x.client.name}</h2>
          <p className="muted">{x.client.companyName || 'Individual client'}</p>
          <StatusBadge status={x.client.status} />

          <ul className="profile-list">
            <li><Mail size={15} aria-hidden="true" /> <span>{x.client.email}</span></li>
            <li><Phone size={15} aria-hidden="true" /> <span>{x.client.phone || 'No phone'}</span></li>
            <li><MapPin size={15} aria-hidden="true" /> <span>{address || 'No address'}</span></li>
            <li><Hash size={15} aria-hidden="true" /> <span>Tax ID: {x.client.taxId || '—'}</span></li>
          </ul>

          <div className="balance-card">
            <span>Outstanding balance</span>
            <strong>{money(x.outstanding)}</strong>
          </div>
        </aside>

        <section className="panel flush">
          <div className="panel-head padded">
            <div>
              <h3>Invoices</h3>
              <p>{x.invoices.length} {x.invoices.length === 1 ? 'invoice' : 'invoices'}</p>
            </div>
            <Button to="/invoices/new" variant="secondary" size="sm">New invoice</Button>
          </div>
          <DataTable
            columns={columns}
            rows={x.invoices}
            caption="Client invoices"
            empty={<EmptyState icon={ReceiptText} title="No invoices for this client yet." description="Invoices you create for them will be listed here." />}
          />
        </section>
      </div>
    </>
  );
}
