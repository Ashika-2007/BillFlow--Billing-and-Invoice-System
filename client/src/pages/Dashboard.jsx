import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  FileText,
  Clock3,
  AlertTriangle,
  Users,
  Package,
  ArrowRight,
  Plus,
  ReceiptText,
  CreditCard,
  UserPlus,
  TrendingUp,
  CalendarDays,
  Banknote
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { money, compactMoney, formatDate, formatMonth, greeting, humanize } from '../utils/format';
import { STATUS_COLORS } from '../utils/status';
import useReducedMotion from '../hooks/useReducedMotion';

import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import AnimatedNumber from '../components/AnimatedNumber';
import Sparkline from '../components/Sparkline';
import ChartTooltip from '../components/ChartTooltip';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import Avatar from '../components/Avatar';
import Reveal from '../components/Reveal';
import { Skeleton, CardSkeleton } from '../components/Skeleton';

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Preparing your dashboard">
      <div className="page-header">
        <div className="page-header-text">
          <Skeleton width={120} height={12} />
          <Skeleton width={320} height={34} style={{ marginTop: 14 }} />
          <Skeleton width={420} height={14} style={{ marginTop: 14 }} />
        </div>
      </div>
      <div className="kpi-grid">
        <div className="span-6"><CardSkeleton height={150} /></div>
        <div className="span-3"><CardSkeleton height={150} /></div>
        <div className="span-3"><CardSkeleton height={150} /></div>
      </div>
      <div className="analytics-grid">
        <CardSkeleton height={340} />
        <CardSkeleton height={340} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const reduced = useReducedMotion();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/dashboard/stats')
      .then((response) => setData(response.data.data))
      .catch((error) => setError(error.response?.data?.message || 'Unable to load dashboard'));

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError('');
          load();
        }}
      />
    );
  }
  if (!data) return <DashboardSkeleton />;

  const isClient = user?.role === 'CLIENT';
  const canManageBilling = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const firstName = user?.name?.split(' ')[0] || 'there';

  const series = (data.revenueByMonth || []).map((m) => ({ ...m, label: formatMonth(m.month) }));
  const pie = [
    { name: 'Paid', value: data.paidInvoices, color: STATUS_COLORS.PAID },
    { name: 'Pending', value: data.pendingInvoices, color: STATUS_COLORS.PENDING },
    { name: 'Overdue', value: data.overdueInvoices, color: STATUS_COLORS.OVERDUE }
  ];
  const pieTotal = pie.reduce((s, p) => s + p.value, 0);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (invoice) => (
        <Link className="link mono" to={`/invoices/${invoice._id}`}>
          {invoice.invoiceNumber}
        </Link>
      )
    },
    {
      key: 'client',
      label: 'Client',
      className: 'cell-wrap',
      render: (invoice) => {
        const name = invoice.client?.companyName || invoice.client?.name;
        return (
          <div className="person">
            <Avatar name={name} size="sm" tone="soft" />
            <span>{name}</span>
          </div>
        );
      }
    },
    { key: 'totalAmount', label: 'Amount', align: 'right', className: 'num', render: (invoice) => <strong>{money(invoice.totalAmount)}</strong> },
    { key: 'status', label: 'Status', render: (invoice) => <StatusBadge status={invoice.status} /> },
    {
      key: 'dueDate',
      label: 'Due date',
      render: (invoice) => (
        <span className="date-cell">
          <CalendarDays size={13} aria-hidden="true" />
          {formatDate(invoice.dueDate)}
        </span>
      )
    }
  ];

  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow={today}
        title={
          <>
            {greeting()}, <span className="accent">{firstName}.</span>
          </>
        }
        description={
          isClient
            ? 'Here’s an overview of your invoices, payments and outstanding balance.'
            : 'Here’s your financial snapshot. Everything important, right where you need it.'
        }
        actions={
          canManageBilling ? (
            <>
              <Button variant="secondary" to="/reports" icon={TrendingUp}>View analytics</Button>
              <Button to="/invoices/new" icon={Plus}>Create invoice</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" to="/payments" icon={CreditCard}>View payments</Button>
              <Button to="/invoices" icon={ReceiptText}>View my invoices</Button>
            </>
          )
        }
      />

      {/* KPI grid */}
      <section className="kpi-grid" aria-label="Key figures">
        <div className={`span-6 ${isClient ? 'row-2' : ''}`}>
          <div className="kpi-feature">
            <div className="kpi-feature-top">
              <span className="kpi-feature-label">{isClient ? 'Outstanding balance' : 'Total revenue'}</span>
              <span className="icon-box on-dark" aria-hidden="true">
                {isClient ? <Clock3 size={17} /> : <Wallet size={17} />}
              </span>
            </div>
            <div className="kpi-feature-value">
              <AnimatedNumber value={isClient ? data.outstandingAmount : data.totalRevenue} format={money} duration={1100} />
            </div>
            <div className="kpi-feature-sub">
              {isClient ? 'Awaiting payment across your invoices' : `Collected from successful payments${series.length ? ` over ${series.length} ${series.length === 1 ? 'month' : 'months'}` : ''}`}
            </div>
            {!isClient && <Sparkline values={series.map((s) => s.revenue)} />}
          </div>
        </div>

        {isClient ? (
          <>
            <div className="span-6"><StatCard index={1} label="Total paid" value={data.totalRevenue} format={money} icon={Wallet} tone="success" hint="Payments you’ve made" /></div>
            <div className="span-3"><StatCard index={2} label="Invoices" value={data.totalInvoices} icon={FileText} hint="Total issued to you" /></div>
            <div className="span-3"><StatCard index={3} label="Overdue" value={data.overdueInvoices} icon={AlertTriangle} tone={data.overdueInvoices ? 'danger' : 'brand'} hint={data.overdueInvoices ? 'Needs attention' : 'Nothing overdue'} /></div>
          </>
        ) : (
          <>
            <div className="span-3"><StatCard index={1} label="Outstanding" value={data.outstandingAmount} format={money} icon={Clock3} tone="warning" hint="Awaiting payment" /></div>
            <div className="span-3"><StatCard index={2} label="Overdue" value={data.overdueInvoices} icon={AlertTriangle} tone={data.overdueInvoices ? 'danger' : 'brand'} hint={data.overdueInvoices ? 'Invoices past due' : 'Nothing overdue'} /></div>
            <div className="span-4"><StatCard index={3} label="Invoices" value={data.totalInvoices} icon={FileText} hint="Total created" /></div>
            <div className="span-4"><StatCard index={4} label="Clients" value={data.totalClients} icon={Users} hint="Active customers" /></div>
            <div className="span-4"><StatCard index={5} label="Products & services" value={data.totalProducts} icon={Package} hint="In your catalog" /></div>
          </>
        )}
      </section>

      {/* Analytics */}
      <section className="analytics-grid">
        <Reveal className="panel chart-card">
          <div className="panel-head">
            <div>
              <div className="section-label">Financial performance</div>
              <h2>Revenue overview</h2>
              <p>Successful payments across your billing workspace.</p>
            </div>
            {canManageBilling && (
              <Link to="/reports" className="round-arrow" aria-label="Open reports">
                <ArrowRight size={17} />
              </Link>
            )}
          </div>
          <div className="big-chart">
            {series.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0e7c6b" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#0e7c6b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e8e5da" strokeDasharray="3 4" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#5f6c68', fontSize: 12 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} width={52} tick={{ fill: '#5f6c68', fontSize: 12 }} tickFormatter={compactMoney} />
                  <Tooltip
                    cursor={{ stroke: '#0e7c6b', strokeWidth: 1, strokeDasharray: '3 3' }}
                    content={<ChartTooltip formatter={(v) => money(v)} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#0e7c6b"
                    fill="url(#revenueFill)"
                    strokeWidth={2.5}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                    isAnimationActive={!reduced}
                    animationDuration={1100}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Banknote} title="No revenue yet." description="Once payments are recorded, your monthly revenue will chart here." />
            )}
          </div>
        </Reveal>

        <Reveal className="panel chart-card" delay={80}>
          <div className="panel-head">
            <div>
              <div className="section-label">Invoice health</div>
              <h2>Invoice status</h2>
              <p>Current portfolio breakdown.</p>
            </div>
          </div>
          {pieTotal ? (
            <>
              <div className="status-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pie}
                      dataKey="value"
                      innerRadius="68%"
                      outerRadius="94%"
                      paddingAngle={3}
                      stroke="none"
                      cornerRadius={4}
                      isAnimationActive={!reduced}
                      animationBegin={150}
                      animationDuration={900}
                    >
                      {pie.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip formatter={(v) => `${v} invoices`} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="status-center">
                  <strong>{pieTotal}</strong>
                  <span>Tracked</span>
                </div>
              </div>
              <ul className="status-list">
                {pie.map((item) => (
                  <li className="status-row" key={item.name}>
                    <span className="status-name">
                      <i style={{ background: item.color }} />
                      {item.name}
                    </span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
              <p className="chart-note">Draft and cancelled invoices aren’t counted here.</p>
            </>
          ) : (
            <EmptyState icon={FileText} title="No invoices yet." description="Your paid, pending and overdue split will appear here." />
          )}
        </Reveal>
      </section>

      {/* Activity */}
      <section className="activity-grid">
        <Reveal className="panel flush">
          <div className="panel-head padded">
            <div>
              <div className="section-label">Recent activity</div>
              <h2>Recent invoices</h2>
              <p>{isClient ? 'Your latest billing activity.' : 'Latest billing activity across your workspace.'}</p>
            </div>
            <Link to="/invoices" className="view-all">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <DataTable
            columns={invoiceColumns}
            rows={data.recentInvoices}
            caption="Recent invoices"
            empty={<EmptyState icon={ReceiptText} title="No recent invoices yet." />}
          />
        </Reveal>

        <div className="side-stack">
          <Reveal className="panel" delay={60}>
            <div className="panel-head">
              <div>
                <div className="section-label">Shortcuts</div>
                <h2>Quick actions</h2>
              </div>
            </div>
            <div className="quick-list">
              {canManageBilling && (
                <Link to="/invoices/new" className="quick-action">
                  <span className="quick-action-icon"><ReceiptText size={18} /></span>
                  <span><strong>Create invoice</strong><small>Generate a new bill</small></span>
                  <ArrowRight size={16} />
                </Link>
              )}
              {canManageBilling && (
                <Link to="/clients" className="quick-action">
                  <span className="quick-action-icon"><UserPlus size={18} /></span>
                  <span><strong>Add client</strong><small>Add a new customer</small></span>
                  <ArrowRight size={16} />
                </Link>
              )}
              {isClient && (
                <Link to="/invoices" className="quick-action">
                  <span className="quick-action-icon"><ReceiptText size={18} /></span>
                  <span><strong>My invoices</strong><small>View your billing history</small></span>
                  <ArrowRight size={16} />
                </Link>
              )}
              <Link to="/payments" className="quick-action">
                <span className="quick-action-icon"><CreditCard size={18} /></span>
                <span><strong>Payments</strong><small>Track recent payments</small></span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          <Reveal className="panel" delay={120}>
            <div className="panel-head">
              <div>
                <div className="section-label">Cash in</div>
                <h2>Recent payments</h2>
              </div>
            </div>
            {data.recentPayments?.length ? (
              <ul className="payment-list">
                {data.recentPayments.slice(0, 5).map((p) => (
                  <li key={p._id}>
                    <span className="payment-dot" aria-hidden="true"><Banknote size={15} /></span>
                    <span className="payment-meta">
                      <strong>{p.client?.companyName || p.client?.name || 'Payment'}</strong>
                      <small>
                        {p.invoice?.invoiceNumber ? `${p.invoice.invoiceNumber} · ` : ''}
                        {humanize(p.paymentMethod)} · {formatDate(p.paymentDate)}
                      </small>
                    </span>
                    <strong className="payment-amount">+{money(p.amount)}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">No payments recorded yet.</p>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
