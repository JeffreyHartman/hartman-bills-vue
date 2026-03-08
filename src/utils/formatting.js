export function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Parse a date string safely in local time (YYYY-MM-DD strings are UTC by spec, which shifts dates in US timezones)
function parseLocalDate(dateString) {
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateString);
}

export function formatDate(dateString) {
  return parseLocalDate(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateWithYear(dateString) {
  return parseLocalDate(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateLong(dateString) {
  return parseLocalDate(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function daysUntilDue(dueDate) {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
}

export function daysUntilDueLabel(dueDate) {
  const days = daysUntilDue(dueDate);
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days === -1) return '1 day overdue';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days <= 7) return `${days} days left`;
  return formatDate(dueDate);
}

export function billStatus(dueDate, isPaid) {
  if (isPaid) return 'paid';
  const days = daysUntilDue(dueDate);
  if (days < 0) return 'overdue';
  if (days <= 3) return 'warning';
  return 'upcoming';
}

export function recurringLabel(recurring) {
  if (!recurring) return 'One-time';
  const { interval, unit } = recurring;
  if (interval === 1) {
    const labels = { day: 'Daily', week: 'Weekly', month: 'Monthly', year: 'Yearly' };
    return labels[unit] || unit;
  }
  return `Every ${interval} ${unit}s`;
}

// Format a Date as a local YYYY-MM-DD string (avoids UTC date shift from toISOString)
export function toLocalDateString(date) {
  // Short-circuit for YYYY-MM-DD strings to avoid UTC parse shifting the date
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Sanitize a string to only contain valid monetary characters (digits, one decimal, max 2 decimal places)
export function sanitizeMonetaryInput(value) {
  let cleaned = String(value).replace(/[^\d.]/g, '');
  // Only allow one decimal point
  const dotIndex = cleaned.indexOf('.');
  if (dotIndex !== -1) {
    cleaned = cleaned.substring(0, dotIndex + 1) + cleaned.substring(dotIndex + 1).replace(/\./g, '');
  }
  // Max 2 decimal places
  const parts = cleaned.split('.');
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
  }
  return cleaned;
}

// Parse a pasted/typed monetary string (handles $, commas, spaces) into a clean decimal string
export function cleanMonetaryPaste(str) {
  return sanitizeMonetaryInput(String(str).replace(/[$,\s]/g, ''));
}

// Sanitize a string to only contain digits
export function sanitizeIntegerInput(value) {
  return String(value).replace(/[^\d]/g, '');
}
