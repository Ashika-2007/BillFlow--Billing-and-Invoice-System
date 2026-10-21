import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(n || 0);

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      try {
        setError('');

        const [r, i, c] = await Promise.all([
          api.get('/reports/revenue'),
          api.get('/reports/invoices'),
          api.get('/reports/clients')
        ]);

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

    loadReports();
  }, []);

  const downloadReportPDF = () => {
    if (!data) return;

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
      `Total Revenue: ${money(data.revenue.totalRevenue)}`,
      20,
      y
    );

    y += 8;

    doc.text(
      `Outstanding Amount: ${money(data.invoices.outstanding)}`,
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
        doc.text(money(item.revenue), 110, y);

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
          money(client.billed),
          108,
          y
        );

        doc.text(
          money(client.paid),
          143,
          y
        );

        doc.text(
          money(client.outstanding),
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

  if (error) {
    return (
      <>
        <PageHeader
          eyebrow="ANALYTICS"
          title="Reports"
          description="Understand revenue, invoice health and customer balances from live MongoDB data."
        />

        <div className="panel">
          <p>{error}</p>
        </div>
      </>
    );
  }

  if (!data) {
    return <LoadingSpinner label="Loading reports..." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="ANALYTICS"
        title="Reports"
        description="Understand revenue, invoice health and customer balances from live MongoDB data."
      />

      {/* PDF Download */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '20px'
        }}
      >
        <button
          type="button"
          onClick={downloadReportPDF}
          className="button button-primary"
        >
          Download Report PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="muted">Total revenue</div>

          <div className="stat-value">
            {money(data.revenue.totalRevenue)}
          </div>
        </div>

        <div className="stat-card">
          <div className="muted">Outstanding</div>

          <div className="stat-value">
            {money(data.invoices.outstanding)}
          </div>
        </div>

        <div className="stat-card">
          <div className="muted">Invoice statuses</div>

          <div className="stat-value">
            {data.invoices.statusDistribution.length}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>Monthly revenue</h3>
              <p>Successful payments</p>
            </div>
          </div>

          <div className="chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={data.revenue.monthly}>
                <XAxis dataKey="month" />

                <YAxis
                  tickFormatter={(v) =>
                    `₹${Math.round(v / 1000)}k`
                  }
                />

                <Tooltip
                  formatter={(v) => money(v)}
                />

                <Bar
                  dataKey="revenue"
                  fill="#7C3AED"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>Status distribution</h3>
              <p>Invoice portfolio</p>
            </div>
          </div>

          <div className="chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={data.invoices.statusDistribution}
                  dataKey="count"
                  nameKey="_id"
                  outerRadius={90}
                  label
                >
                  {data.invoices.statusDistribution.map(
                    (item, index) => (
                      <Cell
                        key={item._id}
                        fill={
                          [
                            '#7C3AED',
                            '#F59E0B',
                            '#16A34A',
                            '#DC2626',
                            '#EC4899'
                          ][index % 5]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Top clients</h3>
            <p>By billed amount</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Invoices</th>
                <th>Billed</th>
                <th>Paid</th>
                <th>Outstanding</th>
              </tr>
            </thead>

            <tbody>
              {data.clients.map((client, index) => (
                <tr key={client._id || index}>
                  <td>
                    <strong>{client.name}</strong>
                  </td>

                  <td>
                    {client.invoiceCount}
                  </td>

                  <td>
                    {money(client.billed)}
                  </td>

                  <td>
                    {money(client.paid)}
                  </td>

                  <td>
                    {money(client.outstanding)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}