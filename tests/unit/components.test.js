import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { createRouter, createMemoryHistory } from 'vue-router';
import SummaryStats from '@/components/SummaryStats.vue';
import BillItem from '@/components/BillItem.vue';

function makeStore(overrides = {}) {
  return createStore({
    state() {
      return { bills: [], darkMode: false, isSidebarOpen: false };
    },
    getters: {
      summaryStats: () => ({
        upcomingCount: 3,
        upcomingTotal: 500,
        overdueCount: 1,
        overdueTotal: 100,
        paidCount: 2,
        recurringCount: 4,
        ...overrides,
      }),
      upcomingBills: () => [],
      overdueBills: () => [],
      recurringBills: () => [],
      paidBills: () => [],
      allInstances: () => [],
      totalDue: () => 500,
      totalOverdue: () => 100,
      billById: () => () => null,
    },
  });
}

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'bills', component: { template: '<div />' } },
      { path: '/bill/:id', name: 'bill-details', component: { template: '<div />' } },
    ],
  });
}

describe('SummaryStats', () => {
  it('renders upcoming and overdue totals', () => {
    const wrapper = mount(SummaryStats, {
      global: { plugins: [makeStore(), makeRouter()] },
    });
    expect(wrapper.text()).toContain('$500.00');
    expect(wrapper.text()).toContain('$100.00');
    expect(wrapper.text()).toContain('3 bills');
    expect(wrapper.text()).toContain('1 bill');
  });

  it('applies overdue styling when overdue count > 0', () => {
    const wrapper = mount(SummaryStats, {
      global: { plugins: [makeStore({ overdueCount: 2 }), makeRouter()] },
    });
    const cards = wrapper.findAll('.card');
    expect(cards[1].classes().some(c => c.includes('border-status-overdue'))).toBe(true);
  });

  it('does not apply overdue styling when no overdue bills', () => {
    const wrapper = mount(SummaryStats, {
      global: { plugins: [makeStore({ overdueCount: 0, overdueTotal: 0 }), makeRouter()] },
    });
    const cards = wrapper.findAll('.card');
    expect(cards[1].classes().some(c => c.includes('border-status-overdue'))).toBe(false);
  });
});

describe('BillItem', () => {
  const futureBill = {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    name: 'Electric',
    amount: 142.50,
    dueDate: new Date(Date.now() + 10 * 86400000),
    recurring: { interval: 1, unit: 'month' },
    isPaid: false,
    paidDates: [],
  };

  const paidBill = {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    name: 'Water',
    amount: 67.00,
    dueDate: new Date(Date.now() - 5 * 86400000),
    recurring: null,
    isPaid: true,
    paidDates: ['2026-03-02T12:00:00Z'],
  };

  it('renders bill name and amount', () => {
    const wrapper = mount(BillItem, {
      props: { bill: futureBill },
      global: { plugins: [makeRouter()] },
    });
    expect(wrapper.text()).toContain('Electric');
    expect(wrapper.text()).toContain('$142.50');
  });

  it('shows recurring label for recurring bills', () => {
    const wrapper = mount(BillItem, {
      props: { bill: futureBill },
      global: { plugins: [makeRouter()] },
    });
    expect(wrapper.text()).toContain('Monthly');
  });

  it('does not show recurring label for one-time bills', () => {
    const wrapper = mount(BillItem, {
      props: { bill: paidBill },
      global: { plugins: [makeRouter()] },
    });
    expect(wrapper.text()).not.toContain('Monthly');
    expect(wrapper.text()).not.toContain('One-time');
  });

  it('shows line-through for paid bills', () => {
    const wrapper = mount(BillItem, {
      props: { bill: paidBill },
      global: { plugins: [makeRouter()] },
    });
    const amount = wrapper.find('.font-mono');
    expect(amount.classes()).toContain('line-through');
  });

  it('shows "Paid" label for paid bills', () => {
    const wrapper = mount(BillItem, {
      props: { bill: paidBill },
      global: { plugins: [makeRouter()] },
    });
    expect(wrapper.text()).toContain('Paid');
  });

  it('renders a router-link to bill details', () => {
    const wrapper = mount(BillItem, {
      props: { bill: futureBill },
      global: { plugins: [makeRouter()] },
    });
    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toContain('/bill/a1b2c3d4-0001-4000-8000-000000000001');
  });
});
