import { describe, it, expect } from 'vitest';
import {
  formatAmount,
  formatDate,
  formatDateLong,
  daysUntilDue,
  daysUntilDueLabel,
  billStatus,
  recurringLabel,
  toLocalDateString,
} from '@/utils/formatting.js';

describe('formatAmount', () => {
  it('formats whole numbers with two decimal places', () => {
    expect(formatAmount(100)).toBe('$100.00');
  });

  it('formats decimal amounts', () => {
    expect(formatAmount(49.99)).toBe('$49.99');
  });

  it('formats large amounts with comma separators', () => {
    expect(formatAmount(1850)).toBe('$1,850.00');
  });

  it('formats zero', () => {
    expect(formatAmount(0)).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('formats a date as short month and day', () => {
    const result = formatDate('2026-03-15T12:00:00');
    expect(result).toBe('Mar 15');
  });
});

describe('formatDateLong', () => {
  it('formats a date with full month, day, and year', () => {
    const result = formatDateLong('2026-03-15T12:00:00');
    expect(result).toBe('March 15, 2026');
  });
});

describe('daysUntilDue', () => {
  it('returns 0 for today', () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    expect(daysUntilDue(today)).toBe(0);
  });

  it('returns positive for future dates', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(daysUntilDue(future)).toBe(5);
  });

  it('returns negative for past dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    expect(daysUntilDue(past)).toBe(-3);
  });
});

describe('daysUntilDueLabel', () => {
  it('returns "Due today" for today', () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    expect(daysUntilDueLabel(today)).toBe('Due today');
  });

  it('returns "Due tomorrow" for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(daysUntilDueLabel(tomorrow)).toBe('Due tomorrow');
  });

  it('returns overdue label for past dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    expect(daysUntilDueLabel(past)).toBe('5 days overdue');
  });

  it('returns days left for near future', () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    expect(daysUntilDueLabel(future)).toBe('3 days left');
  });

  it('returns formatted date for far future', () => {
    const far = new Date();
    far.setDate(far.getDate() + 30);
    // Should return a short date like "Apr 6"
    expect(daysUntilDueLabel(far)).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});

describe('billStatus', () => {
  it('returns "paid" when isPaid is true', () => {
    expect(billStatus(new Date(), true)).toBe('paid');
  });

  it('returns "overdue" for past due dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    expect(billStatus(past, false)).toBe('overdue');
  });

  it('returns "warning" for dates within 3 days', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 2);
    expect(billStatus(soon, false)).toBe('warning');
  });

  it('returns "upcoming" for future dates beyond 3 days', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    expect(billStatus(future, false)).toBe('upcoming');
  });
});

describe('recurringLabel', () => {
  it('returns "One-time" for null', () => {
    expect(recurringLabel(null)).toBe('One-time');
  });

  it('returns "Monthly" for interval 1, month', () => {
    expect(recurringLabel({ interval: 1, unit: 'month' })).toBe('Monthly');
  });

  it('returns "Weekly" for interval 1, week', () => {
    expect(recurringLabel({ interval: 1, unit: 'week' })).toBe('Weekly');
  });

  it('returns "Every 2 weeks" for interval 2, week', () => {
    expect(recurringLabel({ interval: 2, unit: 'week' })).toBe('Every 2 weeks');
  });

  it('returns "Yearly" for interval 1, year', () => {
    expect(recurringLabel({ interval: 1, unit: 'year' })).toBe('Yearly');
  });
});

describe('toLocalDateString', () => {
  it('formats a date as YYYY-MM-DD using local time', () => {
    // Use a date at noon local to avoid any timezone ambiguity
    const date = new Date(2026, 3, 1, 12, 0, 0); // April 1, 2026 noon local
    expect(toLocalDateString(date)).toBe('2026-04-01');
  });

  it('pads single-digit months and days', () => {
    const date = new Date(2026, 0, 5, 12, 0, 0); // January 5
    expect(toLocalDateString(date)).toBe('2026-01-05');
  });

  it('preserves local date even for late-night times that shift in UTC', () => {
    // 11 PM local time — in timezones west of UTC, this is the next day in UTC
    const date = new Date(2026, 3, 1, 23, 0, 0); // April 1, 11 PM local
    expect(toLocalDateString(date)).toBe('2026-04-01');
  });

  it('handles ISO string input', () => {
    // Create a date string that represents April 1 at noon local
    const date = new Date(2026, 3, 1, 12, 0, 0);
    expect(toLocalDateString(date.toISOString())).toBe('2026-04-01');
  });

  it('short-circuits YYYY-MM-DD strings without UTC parse', () => {
    // new Date('2026-04-01') parses as UTC midnight, which shifts to March 31
    // in negative UTC offsets. The short-circuit avoids this.
    expect(toLocalDateString('2026-04-01')).toBe('2026-04-01');
    expect(toLocalDateString('2026-12-25')).toBe('2026-12-25');
  });
});
