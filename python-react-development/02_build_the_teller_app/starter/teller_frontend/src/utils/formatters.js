// Small formatting helpers shared across pages. Pre-provided so currency/date/IBAN
// rendering is consistent and correct everywhere.

/** Format a EUR amount as "€1,234.56". */
export const formatCurrency = (amount) => {
  const n = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

/** Format an ISO timestamp as a readable date + time. */
export const formatDateTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/** Group an IBAN into blocks of four for display: DE89 8506 4317 … */
export const formatIban = (iban) => {
  if (!iban) return '';
  const clean = iban.replace(/\s/g, '').toUpperCase();
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
};

/** Basic IBAN shape check (2 letters + 2 digits + alphanumerics). */
export const isValidIban = (iban) => {
  if (!iban || typeof iban !== 'string') return false;
  return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(iban.replace(/\s/g, '').toUpperCase());
};
