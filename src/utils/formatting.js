export function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateLong(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
