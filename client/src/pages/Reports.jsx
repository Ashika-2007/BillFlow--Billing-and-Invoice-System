import React, { useEffect, useState } from 'react';
import { Download, TrendingUp, Clock3, Layers, BarChart3, PieChart as PieIcon, Trophy } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import api from '../services/api';
import { money, compactMoney, formatMonth, humanize } from '../utils/format';
import { statusColor } from '../utils/status';
import useReducedMotion from '../hooks/useReducedMotion';
import { useToast } from '../components/Toast';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import ChartTooltip from '../components/ChartTooltip';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Reveal from '../components/Reveal';
import { CardSkeleton } from '../components/Skeleton';

// jsPDF's built-in Helvetica has no ₹ glyph (it is dropped and corrupts the line), so PDFs use "Rs."
const pdfMoney = (n) => money(n).replace('₹', 'Rs. ');

function ReportsSkeleton() {
  return (
    <div role="status" aria-label="Loading reports">
      <div className="stats-grid">
        <CardSkeleton height={120} />
        <CardSkeleton height={120} />
        <CardSkeleton height={120} />
      </div>
      <div className="analytics-grid">
        <CardSkeleton height={340} />
        <CardSkeleton height={340} />
      </div>
    </div>
  );
}

export default function Reports() {
  const reduced = useReducedMotion();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);

  const loadReports = async () => {
    try {
      setError('');
      const [r, i, c] = await Promise.all([api.get('/reports/revenue'), api.get('/reports/invoices'), api.get('/reports/clients')]);
      setData({
        revenue: r.data.data,
        invoices: i.data.data,
        clients: c.data.data
      });
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Unable to load reports. Please try again.');
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const downloadReportPDF = async () => {
    if (!data) return;
    // jsPDF is large, so it is fetched only when a report is actually downloaded
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    // -----------------------------
    // Header
    // -----------------------------
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('BillFlow', 20, 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Billing & Invoice System', 20, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Financial Report', 20, 45);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })}`,
      20,
      53
    );
    doc.line(20, 59, pageWidth - 20, 59);
    // -----------------------------
    // Summary
    // -----------------------------
    let y = 74;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Summary', 20, y);
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      `Total Revenue: ${pdfMoney(data.revenue.totalRevenue)}`,
      20,
      y
    );
    y += 8;
    doc.text(
      `Outstanding Amount: ${pdfMoney(data.invoices.outstanding)}`,
      20,
      y
    );
    y += 8;
    doc.text(
      `Invoice Status Categories: ${
        data.invoices.statusDistribution.length
      }`,
      20,
      y
    );
    // -----------------------------
    // Monthly Revenue
    // -----------------------------
    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Monthly Revenue', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text('Month', 20, y);
    doc.text('Revenue', 110, y);
    doc.line(20, y + 2, pageWidth - 20, y + 2);
    y += 10;
    doc.setFont('helvetica', 'normal');
    if (data.revenue.monthly.length === 0) {
      doc.text('No monthly revenue data available.', 20, y);
      y += 10;
    } else {
      data.revenue.monthly.forEach((item) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(String(item.month), 20, y);
        doc.text(pdfMoney(item.revenue), 110, y);
        y += 8;
      });
    }
    // -----------------------------
    // Invoice Status
    // -----------------------------
    y += 12;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Invoice Status Distribution', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text('Status', 20, y);
    doc.text('Count', 110, y);
    doc.line(20, y + 2, pageWidth - 20, y + 2);
    y += 10;
    doc.setFont('helvetica', 'normal');
    if (data.invoices.statusDistribution.length === 0) {
      doc.text('No invoice status data available.', 20, y);
      y += 10;
    } else {
      data.invoices.statusDistribution.forEach((item) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(String(item._id || 'Unknown'), 20, y);
        doc.text(String(item.count || 0), 110, y);
        y += 8;
      });
    }
    // -----------------------------
    // Top Clients
    // -----------------------------
    y += 12;
    if (y > 245) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Top Clients', 20, y);
    y += 10;
    doc.setFontSize(8);
    doc.text('Client', 20, y);
    doc.text('Invoices', 78, y);
    doc.text('Billed', 108, y);
    doc.text('Paid', 143, y);
    doc.text('Outstanding', 173, y);
    doc.line(20, y + 2, pageWidth - 20, y + 2);
    y += 10;
    doc.setFont('helvetica', 'normal');
    if (data.clients.length === 0) {
      doc.text('No client data available.', 20, y);
      y += 10;
    } else {
      data.clients.forEach((client) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text('Client', 20, y);
          doc.text('Invoices', 78, y);
          doc.text('Billed', 108, y);
          doc.text('Paid', 143, y);
          doc.text('Outstanding', 173, y);
          doc.line(20, y + 2, pageWidth - 20, y + 2);
          y += 10;
          doc.setFont('helvetica', 'normal');
        }
        doc.text(
          String(client.name || 'Unknown').slice(0, 25),
          20,
          y
        );
        doc.text(
          String(client.invoiceCount || 0),
          78,
          y
        );
        doc.text(
          pdfMoney(client.billed),
          108,
          y
        );
        doc.text(
          pdfMoney(client.paid),
          143,
          y
        );
        doc.text(
          pdfMoney(client.outstanding),
          173,
          y
        );
        y += 8;
      });
    }
    // -----------------------------
    // Footer on every page
    // -----------------------------
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.line(
        20,
        pageHeight - 18,
        pageWidth - 20,
        pageHeight - 18
      );
      doc.text(
        'BillFlow • Billing & Invoice System',
        20,
        pageHeight - 10
      );
      doc.text(
        `Page ${page} of ${pageCount}`,
        pageWidth - 45,
        pageHeight - 10
      );
    }
    // -----------------------------
    // Save PDF
    // -----------------------------
    const date = new Date().toISOString().slice(0, 10);
    doc.save(`BillFlow-Report-${date}.pdf`);
  };

  const onDownload = async () => {
    setPdfBusy(true);
    try {
      await downloadReportPDF();
      toast.success('Report downloaded');
    } catch {
      toast.error('Unable to generate the report PDF');
    } finally {
      setPdfBusy(false);
    }
  };

  const header = (
    <PageHeader
      eyebrow="Analytics"
      title="Reports"
      description="Understand revenue, invoice health and customer balances from live MongoDB data."
      actions={data && <Button icon={Download} onClick={onDownload} loading={pdfBusy}>Download report PDF</Button>}
    />
  );

  if (error) {
    return (
      <>
        {header}
        <ErrorState message={error} onRetry={loadReports} />
      </>
    );
  }
  if (!data) {
    return (
      <>
        {header}
        <ReportsSkeleton />
      </>
    );
  }

  const monthly = data.revenue.monthly.map((m) => ({ ...m, label: formatMonth(m.month) }));
  const dist = data.invoices.statusDistribution.map((s) => ({ ...s, name: humanize(s._id), color: statusColor(s._id) }));
  const totalInvoices = dist.reduce((s, d) => s + d.count, 0);

  const clientColumns = [
    { key: 'rank', label: '#', className: 'rank-cell', render: (_c, i) => <span className="rank">{i + 1}</span> },
    { key: 'name', label: 'Client', className: 'cell-wrap', render: (c) => <strong>{c.name}</strong> },
    { key: 'invoiceCount', label: 'Invoices', align: 'right', className: 'num' },
    { key: 'billed', label: 'Billed', align: 'right', className: 'num', render: (c) => money(c.billed) },
    { key: 'paid', label: 'Paid', align: 'right', className: 'num', render: (c) => money(c.paid) },
    {
      key: 'outstanding',
      label: 'Outstanding',
      align: 'right',
      className: 'num',
      render: (c) => <span className={c.outstanding > 0 ? 'text-warning' : 'muted-text'}>{money(c.outstanding)}</span>
    }
  ];

  return (
    <>
      {header}

      <div className="stats-grid">
        <StatCard index={0} label="Total revenue" value={data.revenue.totalRevenue} format={money} icon={TrendingUp} tone="success" hint="From successful payments" />
        <StatCard index={1} label="Outstanding" value={data.invoices.outstanding} format={money} icon={Clock3} tone="warning" hint="Unpaid invoice balance" />
        <StatCard index={2} label="Invoice statuses" value={data.invoices.statusDistribution.length} icon={Layers} hint={`${totalInvoices} invoices in total`} />
      </div>

      <div className="analytics-grid">
        <Reveal className="panel chart-card">
          <div className="panel-head">
            <div>
              <div className="section-label">Revenue</div>
              <h3>Monthly revenue</h3>
              <p>Successful payments</p>
            </div>
          </div>
          <div className="big-chart">
            {monthly.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e8e5da" strokeDasharray="3 4" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#5f6c68', fontSize: 12 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} width={52} tick={{ fill: '#5f6c68', fontSize: 12 }} tickFormatter={compactMoney} />
                  <Tooltip cursor={{ fill: 'rgba(14,124,107,.07)' }} content={<ChartTooltip formatter={(v) => money(v)} />} />
                  <Bar dataKey="revenue" name="Revenue" fill="#0e7c6b" radius={[5, 5, 0, 0]} maxBarSize={44} isAnimationActive={!reduced} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={BarChart3} title="No revenue data yet." description="Monthly revenue appears once payments are recorded." />
            )}
          </div>
        </Reveal>

        <Reveal className="panel chart-card" delay={80}>
          <div className="panel-head">
            <div>
              <div className="section-label">Portfolio</div>
              <h3>Status distribution</h3>
              <p>Invoice portfolio</p>
            </div>
          </div>
          {dist.length ? (
            <>
              <div className="status-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dist} dataKey="count" nameKey="name" innerRadius="68%" outerRadius="94%" paddingAngle={3} cornerRadius={4} stroke="none" isAnimationActive={!reduced} animationDuration={900}>
                      {dist.map((item) => (
                        <Cell key={item._id} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip formatter={(v) => `${v} invoices`} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="status-center">
                  <strong>{totalInvoices}</strong>
                  <span>Invoices</span>
                </div>
              </div>
              <ul className="status-list">
                {dist.map((item) => (
                  <li className="status-row" key={item._id}>
                    <span className="status-name">
                      <i style={{ background: item.color }} />
                      {item.name}
                    </span>
                    <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState icon={PieIcon} title="No invoices yet." />
          )}
        </Reveal>
      </div>

      <Reveal className="panel flush">
        <div className="panel-head padded">
          <div>
            <div className="section-label">Customers</div>
            <h3>Top clients</h3>
            <p>By billed amount</p>
          </div>
        </div>
        <DataTable
          columns={clientColumns}
          rows={data.clients}
          rowKey={(c, i) => c._id || i}
          caption="Top clients by billed amount"
          empty={<EmptyState icon={Trophy} title="No client data yet." />}
        />
      </Reveal>
    </>
  );
}
