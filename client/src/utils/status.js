// Single source of truth for status colours used by badges and charts
export const STATUS_COLORS = {
  PAID: '#2f9e6e',
  PARTIALLY_PAID: '#4b7bc8',
  PENDING: '#d9a441',
  SENT: '#8a7bd1',
  OVERDUE: '#d9534f',
  DRAFT: '#9aa5a1',
  CANCELLED: '#c3c0b4'
};
export const statusColor = (s, i = 0) =>
  STATUS_COLORS[String(s).toUpperCase()] ||
  ['#0e7c6b', '#d9a441', '#4b7bc8', '#d9534f', '#8a7bd1'][i % 5];
