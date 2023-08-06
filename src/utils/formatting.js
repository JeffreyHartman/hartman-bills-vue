export function formatAmount(amount) {
  return `$${parseFloat(amount).toFixed(2)}`;
}

export function formatDate(dateString) {
  const options = { month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}