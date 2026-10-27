export const money = (n, digits = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: digits
  }).format(n || 0);

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN') : '—';

export const formatDateLong = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

// Accepts "2026-05" (reports API) or "May 2026" (dashboard API) and returns "May ’26"
export const formatMonth = (value = '') => {
  const iso = /^(\d{4})-(\d{2})$/.exec(value);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, 1);
    return `${d.toLocaleString('en-US', { month: 'short' })} ’${String(iso[1]).slice(2)}`;
  }
  const parts = String(value).split(' ');
  return parts.length === 2 ? `${parts[0]} ’${parts[1].slice(2)}` : value;
};

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

export const greeting = (date = new Date()) => {
  const h = date.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const ACRONYMS = { upi: 'UPI', gst: 'GST', neft: 'NEFT', imps: 'IMPS' };

export const humanize = (s = '') =>
  String(s)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\b(upi|gst|neft|imps)\b/gi, (m) => ACRONYMS[m.toLowerCase()]);

// ₹1.2L / ₹3.4Cr / ₹45k — for compact chart axes
export const compactMoney = (n = 0) => {
  const v = Math.abs(n);
  if (v >= 1e7) return `₹${+(n / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `₹${+(n / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `₹${+(n / 1e3).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
};
