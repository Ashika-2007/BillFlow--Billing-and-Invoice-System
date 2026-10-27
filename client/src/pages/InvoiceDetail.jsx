import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import api from '../services/api';
import { money as formatMoney, formatDate } from '../utils/format';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';
import { BrandMark } from '../components/Brand';

const money = (n) => formatMoney(n, 2);
// jsPDF's built-in Helvetica has no ₹ glyph (it is dropped and corrupts the line), so PDFs use "Rs."
const pdfMoney = (n) => money(n).replace('₹', 'Rs. ');

export default function InvoiceDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [x, setX] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/invoices/${id}`)
      .then((r) => setX(r.data.data))
      .catch((e) => setError(e.response?.data?.message || 'Invoice not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading invoice..." />;
  if (!x) return <ErrorState message={error || 'Invoice not found.'} />;

  const pdf = async () => {
    setPdfBusy(true);
    try {
      // jsPDF is large, so it is only fetched when someone actually downloads a PDF
      const { jsPDF } = await import('jspdf');
      const d = new jsPDF();
      d.setFontSize(22);
      d.text('INVOICE', 150, 20);
      d.setFontSize(16);
      d.text('BillFlow', 20, 20);
      d.setFontSize(10);
      d.text('Professional Billing & Invoice Management', 20, 28);
      d.text(`Invoice: ${x.invoiceNumber}`, 20, 45);
      d.text(`Issue date: ${new Date(x.issueDate).toLocaleDateString('en-IN')}`, 20, 52);
      d.text(`Due date: ${new Date(x.dueDate).toLocaleDateString('en-IN')}`, 20, 59);
      d.text(`Bill to: ${x.client.companyName || x.client.name}`, 20, 75);
      d.text(x.client.email || '', 20, 82);
      let y = 100;
      d.text('Item', 20, y);
      d.text('Qty', 105, y);
      d.text('Unit', 125, y);
      d.text('Amount', 165, y);
      x.items.forEach((i) => {
        y += 8;
        d.text(i.name.slice(0, 42), 20, y);
        d.text(String(i.quantity), 105, y);
        d.text(pdfMoney(i.unitPrice), 125, y);
        d.text(pdfMoney(i.amount + i.taxAmount), 165, y);
      });
      y += 15;
      d.text(`Subtotal: ${pdfMoney(x.subtotal)}`, 125, y);
      y += 7;
      d.text(`Discount: ${pdfMoney(x.discountAmount)}`, 125, y);
      y += 7;
      d.text(`Tax: ${pdfMoney(x.taxAmount)}`, 125, y);
      y += 9;
      d.setFontSize(13);
      d.text(`Total: ${pdfMoney(x.totalAmount)}`, 125, y);
      d.setFontSize(10);
      y += 14;
      d.text(`Status: ${x.status.replaceAll('_', ' ')}`, 20, y);
      if (x.notes) {
        y += 12;
        d.text(`Notes: ${x.notes}`, 20, y);
      }
      if (x.terms) {
        y += 8;
        d.text(`Terms: ${x.terms}`, 20, y);
      }
      d.save(`${x.invoiceNumber}.pdf`);
      toast.success('PDF downloaded');
    } catch {
      toast.error('Unable to generate the PDF');
    } finally {
      setPdfBusy(false);
    }
  };

  const paidPct = x.totalAmount > 0 ? Math.min(100, Math.round((x.paidAmount / x.totalAmount) * 100)) : 0;

  return (
    <>
      <div className="detail-top no-print">
        <Button to="/invoices" variant="secondary" icon={ArrowLeft}>Back to invoices</Button>
        <div className="header-actions">
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
          <Button icon={Download} onClick={pdf} loading={pdfBusy}>Download PDF</Button>
        </div>
      </div>

      <div className="payment-progress no-print">
        <div className="payment-progress-text">
          <span><strong>{money(x.paidAmount)}</strong> paid of {money(x.totalAmount)}</span>
          <span>{paidPct}%</span>
        </div>
        <div className="progress" role="progressbar" aria-valuenow={paidPct} aria-valuemin="0" aria-valuemax="100" aria-label="Amount paid">
          <span style={{ width: `${paidPct}%` }} />
        </div>
      </div>

      <article className="invoice-paper">
        {x.status === 'PAID' && <div className="paid-stamp" aria-hidden="true">Paid</div>}
        <div className="invoice-head">
          <div>
            <div className="invoice-brand"><BrandMark size={30} /> BillFlow</div>
            <p>Professional Billing & Invoice Management</p>
          </div>
          <div className="invoice-title">
            <h1>Invoice</h1>
            <strong className="mono">{x.invoiceNumber}</strong>
            <StatusBadge status={x.status} />
          </div>
        </div>

        <div className="invoice-meta">
          <div>
            <span>Bill to</span>
            <strong>{x.client.companyName || x.client.name}</strong>
            <p>{x.client.email}<br />{x.client.phone}<br />{x.client.address}</p>
          </div>
          <div>
            <span>Issue date</span>
            <strong>{formatDate(x.issueDate)}</strong>
            <span>Due date</span>
            <strong>{formatDate(x.dueDate)}</strong>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th className="align-right">Qty</th>
                <th className="align-right">Unit price</th>
                <th className="align-right">Tax</th>
                <th className="align-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {x.items.map((i, n) => (
                <tr key={n}>
                  <td><strong>{i.name}</strong></td>
                  <td className="num align-right">{i.quantity}</td>
                  <td className="num align-right">{money(i.unitPrice)}</td>
                  <td className="num align-right">{i.taxRate}%</td>
                  <td className="num align-right">{money(i.amount + i.taxAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-bottom">
          <div>
            <strong>Notes</strong>
            <p>{x.notes || '—'}</p>
            <strong>Terms</strong>
            <p>{x.terms || '—'}</p>
          </div>
          <div className="invoice-totals">
            <div><span>Subtotal</span><strong>{money(x.subtotal)}</strong></div>
            <div><span>Discount</span><strong>- {money(x.discountAmount)}</strong></div>
            <div><span>Tax</span><strong>{money(x.taxAmount)}</strong></div>
            <div className="grand"><span>Total</span><strong>{money(x.totalAmount)}</strong></div>
            <div><span>Paid</span><strong>{money(x.paidAmount)}</strong></div>
            <div className="balance"><span>Balance due</span><strong>{money(x.remainingAmount)}</strong></div>
          </div>
        </div>
      </article>
    </>
  );
}
