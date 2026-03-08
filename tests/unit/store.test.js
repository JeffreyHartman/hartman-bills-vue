import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createStore } from 'vuex';
import { mutations, generateBillInstances, checkIfPaid, readDarkModeCookie } from '@/store/index.js';

function createTestStore(bills = []) {
  return createStore({
    state() {
      return {
        isSidebarOpen: false,
        darkMode: false,
        user: null,
        bills,
      };
    },
    mutations,
  });
}

describe('Store mutations', () => {
  let store;

  beforeEach(() => {
    store = createTestStore([
      {
        id: 'a1b2c3d4-0001-4000-8000-000000000001',
        name: 'Rent',
        creationDate: new Date().toISOString(),
        dueDate: null,
        amount: 1500,
        recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 1, dayOfYear: null },
        paidDates: [],
      },
      {
        id: 'a1b2c3d4-0002-4000-8000-000000000002',
        name: 'Car Repair',
        creationDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        amount: 300,
        recurring: null,
        paidDates: [],
      },
    ]);
  });

  it('toggleSidebar toggles the state', () => {
    expect(store.state.isSidebarOpen).toBe(false);
    store.commit('toggleSidebar');
    expect(store.state.isSidebarOpen).toBe(true);
    store.commit('toggleSidebar');
    expect(store.state.isSidebarOpen).toBe(false);
  });

  it('addBill adds a new bill to state', () => {
    store.commit('addBill', {
      id: 'a1b2c3d4-0003-4000-8000-000000000003',
      name: 'Internet',
      amount: 79.99,
      recurring: null,
      dueDate: new Date().toISOString(),
      creationDate: new Date().toISOString(),
      paidDates: [],
    });
    expect(store.state.bills).toHaveLength(3);
    const newBill = store.state.bills[2];
    expect(newBill.name).toBe('Internet');
    expect(newBill.paidDates).toEqual([]);
  });

  it('updateBill updates an existing bill', () => {
    store.commit('updateBill', { id: 'a1b2c3d4-0001-4000-8000-000000000001', name: 'Monthly Rent', amount: 1600 });
    const bill = store.state.bills.find(b => b.id === 'a1b2c3d4-0001-4000-8000-000000000001');
    expect(bill.name).toBe('Monthly Rent');
    expect(bill.amount).toBe(1600);
    // Other fields preserved
    expect(bill.recurring).not.toBeNull();
  });

  it('updateBill does nothing for non-existent id', () => {
    store.commit('updateBill', { id: 'a1b2c3d4-9999-4000-8000-000000000099', name: 'Ghost' });
    expect(store.state.bills).toHaveLength(2);
  });

  it('deleteBill removes a bill by id', () => {
    store.commit('deleteBill', 'a1b2c3d4-0001-4000-8000-000000000001');
    expect(store.state.bills).toHaveLength(1);
    expect(store.state.bills[0].id).toBe('a1b2c3d4-0002-4000-8000-000000000002');
  });

  it('markPaid adds a paid date', () => {
    const dueDate = '2026-03-15T12:00:00Z';
    store.commit('markPaid', { billId: 'a1b2c3d4-0001-4000-8000-000000000001', date: dueDate });
    expect(store.state.bills[0].paidDates).toHaveLength(1);
  });

  it('markPaid does not duplicate paid dates for the same calendar day', () => {
    store.commit('markPaid', { billId: 'a1b2c3d4-0001-4000-8000-000000000001', date: '2026-03-15T12:00:00Z' });
    store.commit('markPaid', { billId: 'a1b2c3d4-0001-4000-8000-000000000001', date: '2026-03-15T18:00:00Z' });
    expect(store.state.bills[0].paidDates).toHaveLength(1);
  });

  it('markUnpaid removes the matching paid date', () => {
    const dueDate = '2026-03-15T12:00:00Z';
    store.commit('markPaid', { billId: 'a1b2c3d4-0001-4000-8000-000000000001', date: dueDate });
    expect(store.state.bills[0].paidDates).toHaveLength(1);
    store.commit('markUnpaid', { billId: 'a1b2c3d4-0001-4000-8000-000000000001', date: dueDate });
    expect(store.state.bills[0].paidDates).toHaveLength(0);
  });
});

describe('Store - generateBillInstances (via imported functions)', () => {
  it('exported functions are accessible', async () => {
    const mod = await import('@/store/index.js');
    expect(mod.generateBillInstances).toBeDefined();
    expect(mod.checkIfPaid).toBeDefined();
  });

  it('generates a single instance for non-recurring bills', async () => {
    const { generateBillInstances } = await import('@/store/index.js');
    const bill = {
      id: 'a1b2c3d4-0001-4000-8000-000000000001',
      name: 'Test',
      dueDate: '2026-06-15T12:00:00Z',
      recurring: null,
      paidDates: [],
    };
    const instances = generateBillInstances(bill);
    expect(instances).toHaveLength(1);
    expect(instances[0].name).toBe('Test');
  });

  it('generates multiple instances for recurring bills', async () => {
    const { generateBillInstances } = await import('@/store/index.js');
    const bill = {
      id: 'a1b2c3d4-0002-4000-8000-000000000002',
      name: 'Monthly',
      creationDate: new Date().toISOString(),
      dueDate: null,
      recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 15, dayOfYear: null },
      paidDates: [],
    };
    const instances = generateBillInstances(bill);
    // Should generate roughly 12 instances (one per month for a year)
    expect(instances.length).toBeGreaterThanOrEqual(10);
    expect(instances.length).toBeLessThanOrEqual(14);
  });

  it('handles end-of-month dates without drift for monthly bills', async () => {
    const { calculateDueDate } = await import('@/store/index.js');
    const recurring = { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 31, dayOfYear: null };
    const jan31 = new Date(2026, 0, 31, 12, 0, 0);

    const feb = calculateDueDate(recurring, jan31);
    expect(feb.getMonth()).toBe(1); // February
    expect(feb.getDate()).toBe(28); // clamped to last day

    const mar = calculateDueDate(recurring, feb);
    expect(mar.getMonth()).toBe(2); // March
    expect(mar.getDate()).toBe(31); // back to 31

    const apr = calculateDueDate(recurring, mar);
    expect(apr.getMonth()).toBe(3); // April
    expect(apr.getDate()).toBe(30); // clamped to 30
  });

  it('marks instances as paid when matching paidDates exist', async () => {
    const { generateBillInstances } = await import('@/store/index.js');
    const dueDate = '2026-06-15T12:00:00Z';
    const bill = {
      id: 'a1b2c3d4-0003-4000-8000-000000000003',
      name: 'Paid Bill',
      dueDate,
      recurring: null,
      paidDates: ['2026-06-15T12:00:00Z'],
    };
    const instances = generateBillInstances(bill);
    expect(instances[0].isPaid).toBe(true);
  });
});

describe('checkIfPaid - recurring bill paid early', () => {
  it('marks instance as paid when paidDate was stored using local midnight (matching app flow)', () => {
    // In the actual app, markPaid stores: new Date(parseCalendarDate("2026-04-01")).toISOString()
    // which is April 1 midnight local time expressed as ISO string.
    const april1Local = new Date(2026, 3, 1); // April 1 midnight local
    const bill = {
      paidDates: [april1Local.toISOString()],
    };
    // generateBillInstances produces dueDate at some hour on April 1 local time
    const dueDate = new Date(2026, 3, 1, 20, 0, 0); // April 1 at 8 PM local
    expect(checkIfPaid(bill, dueDate)).toBe(true);
  });

  it('does not mark a different month as paid', () => {
    const april1Local = new Date(2026, 3, 1);
    const bill = {
      paidDates: [april1Local.toISOString()],
    };
    const dueDate = new Date(2026, 4, 1, 12, 0, 0); // May 1
    expect(checkIfPaid(bill, dueDate)).toBe(false);
  });

  it('full flow: recurring monthly bill marked paid shows up correctly', () => {
    // Simulate: bill created in past, monthly on the 1st
    const creationDate = new Date(2026, 0, 15, 14, 30, 0); // Jan 15 2:30 PM local
    const bill = {
      id: 'test-recurring',
      name: 'Mortgage',
      creationDate: creationDate.toISOString(),
      dueDate: null,
      amount: 1500,
      recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 1, dayOfYear: null },
      paidDates: [],
    };

    // Generate instances — should include April 1
    const instances = generateBillInstances(bill);
    const aprilInstance = instances.find(i => {
      const d = new Date(i.dueDate);
      return d.getMonth() === 3 && d.getDate() === 1; // April 1
    });
    expect(aprilInstance).toBeDefined();
    expect(aprilInstance.isPaid).toBe(false);

    // Now mark it paid using the same date that the detail page would use:
    // parseCalendarDate("2026-04-01") = new Date(2026, 3, 1) = April 1 midnight local
    const paidDate = new Date(2026, 3, 1);
    bill.paidDates.push(paidDate.toISOString());

    // Regenerate instances — April 1 should now be paid
    const updated = generateBillInstances(bill);
    const aprilUpdated = updated.find(i => {
      const d = new Date(i.dueDate);
      return d.getMonth() === 3 && d.getDate() === 1;
    });
    expect(aprilUpdated).toBeDefined();
    expect(aprilUpdated.isPaid).toBe(true);
  });
});

describe('Dark mode cookie persistence', () => {
  afterEach(() => {
    // Clean up cookie
    document.cookie = 'darkMode=; path=/; max-age=0';
  });

  it('readDarkModeCookie returns false when no cookie set', () => {
    document.cookie = 'darkMode=; path=/; max-age=0';
    expect(readDarkModeCookie()).toBe(false);
  });

  it('readDarkModeCookie returns true when cookie is 1', () => {
    document.cookie = 'darkMode=1; path=/';
    expect(readDarkModeCookie()).toBe(true);
  });

  it('readDarkModeCookie returns false when cookie is 0', () => {
    document.cookie = 'darkMode=0; path=/';
    expect(readDarkModeCookie()).toBe(false);
  });

  it('toggleDarkMode sets the cookie', () => {
    const state = { darkMode: false };
    mutations.toggleDarkMode(state);
    expect(state.darkMode).toBe(true);
    expect(document.cookie).toContain('darkMode=1');

    mutations.toggleDarkMode(state);
    expect(state.darkMode).toBe(false);
    expect(document.cookie).toContain('darkMode=0');
  });

  it('setDarkMode sets the cookie to specific value', () => {
    const state = { darkMode: false };
    mutations.setDarkMode(state, true);
    expect(state.darkMode).toBe(true);
    expect(document.cookie).toContain('darkMode=1');
  });
});

describe('recurringBills getter - next due date', () => {
  it('shows next upcoming due date for recurring bills, not null', () => {
    // Create a store with a recurring bill
    const now = new Date();
    const creationDate = new Date(now);
    creationDate.setMonth(creationDate.getMonth() - 2);

    const store = createStore({
      state() {
        return {
          bills: [{
            id: 'recurring-1',
            name: 'Monthly Bill',
            creationDate: creationDate.toISOString(),
            dueDate: null,
            amount: 100,
            recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 15, dayOfYear: null },
            paidDates: [],
          }],
        };
      },
      mutations,
      getters: {
        allInstances(state) {
          return state.bills.flatMap(bill => generateBillInstances(bill));
        },
        recurringBills(state, getters) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return state.bills
            .filter(b => b.recurring !== null)
            .map(b => {
              const instance = getters.allInstances
                .filter(i => i.id === b.id && !i.isPaid && new Date(i.dueDate) >= today)
                .sort((a, c) => new Date(a.dueDate) - new Date(c.dueDate))[0];
              return {
                ...b,
                dueDate: instance ? instance.dueDate : b.creationDate,
                isPaid: false,
                instanceId: instance ? instance.instanceId : b.id,
              };
            });
        },
      },
    });

    const recurring = store.getters.recurringBills;
    expect(recurring).toHaveLength(1);
    // dueDate should be set (not null), and should be in the future
    expect(recurring[0].dueDate).not.toBeNull();
    const dueDate = new Date(recurring[0].dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(dueDate >= today).toBe(true);
  });
});
