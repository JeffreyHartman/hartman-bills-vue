import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'vuex';
import { mutations } from '@/store/index.js';

function createTestStore(bills = []) {
  return createStore({
    state() {
      return {
        isSidebarOpen: false,
        darkMode: false,
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
        id: 1,
        name: 'Rent',
        creationDate: new Date().toISOString(),
        dueDate: null,
        amount: 1500,
        recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 1, dayOfYear: null },
        paidDates: [],
      },
      {
        id: 2,
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

  it('addBill adds a new bill with auto-generated id and empty paidDates', () => {
    store.commit('addBill', {
      name: 'Internet',
      amount: 79.99,
      recurring: null,
      dueDate: new Date().toISOString(),
      creationDate: new Date().toISOString(),
    });
    expect(store.state.bills).toHaveLength(3);
    const newBill = store.state.bills[2];
    expect(newBill.name).toBe('Internet');
    expect(newBill.paidDates).toEqual([]);
  });

  it('updateBill updates an existing bill', () => {
    store.commit('updateBill', { id: 1, name: 'Monthly Rent', amount: 1600 });
    const bill = store.state.bills.find(b => b.id === 1);
    expect(bill.name).toBe('Monthly Rent');
    expect(bill.amount).toBe(1600);
    // Other fields preserved
    expect(bill.recurring).not.toBeNull();
  });

  it('updateBill does nothing for non-existent id', () => {
    store.commit('updateBill', { id: 999, name: 'Ghost' });
    expect(store.state.bills).toHaveLength(2);
  });

  it('deleteBill removes a bill by id', () => {
    store.commit('deleteBill', 1);
    expect(store.state.bills).toHaveLength(1);
    expect(store.state.bills[0].id).toBe(2);
  });

  it('markPaid adds a paid date', () => {
    const dueDate = '2026-03-15T12:00:00Z';
    store.commit('markPaid', { billId: 1, date: dueDate });
    expect(store.state.bills[0].paidDates).toHaveLength(1);
  });

  it('markPaid does not duplicate paid dates for the same calendar day', () => {
    store.commit('markPaid', { billId: 1, date: '2026-03-15T12:00:00Z' });
    store.commit('markPaid', { billId: 1, date: '2026-03-15T18:00:00Z' });
    expect(store.state.bills[0].paidDates).toHaveLength(1);
  });

  it('markUnpaid removes the matching paid date', () => {
    const dueDate = '2026-03-15T12:00:00Z';
    store.commit('markPaid', { billId: 1, date: dueDate });
    expect(store.state.bills[0].paidDates).toHaveLength(1);
    store.commit('markUnpaid', { billId: 1, date: dueDate });
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
      id: 1,
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
      id: 2,
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

  it('marks instances as paid when matching paidDates exist', async () => {
    const { generateBillInstances } = await import('@/store/index.js');
    const dueDate = '2026-06-15T12:00:00Z';
    const bill = {
      id: 3,
      name: 'Paid Bill',
      dueDate,
      recurring: null,
      paidDates: ['2026-06-15T12:00:00Z'],
    };
    const instances = generateBillInstances(bill);
    expect(instances[0].isPaid).toBe(true);
  });
});
