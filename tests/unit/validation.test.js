import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { createRouter, createMemoryHistory } from 'vue-router';
import {
  sanitizeMonetaryInput,
  cleanMonetaryPaste,
  sanitizeIntegerInput,
} from '@/utils/formatting.js';
import EditBillView from '@/views/EditBillView.vue';

// --- Sanitization utility tests ---

describe('sanitizeMonetaryInput', () => {
  it('passes through valid decimal values', () => {
    expect(sanitizeMonetaryInput('123.45')).toBe('123.45');
  });

  it('strips letters and special characters', () => {
    expect(sanitizeMonetaryInput('abc123.45xyz')).toBe('123.45');
  });

  it('allows only one decimal point and limits to 2 decimal places', () => {
    // '12.34.56' → remove extra dot → '12.3456' → limit to 2 decimals → '12.34'
    expect(sanitizeMonetaryInput('12.34.56')).toBe('12.34');
  });

  it('limits to 2 decimal places', () => {
    expect(sanitizeMonetaryInput('99.999')).toBe('99.99');
  });

  it('handles empty string', () => {
    expect(sanitizeMonetaryInput('')).toBe('');
  });

  it('handles integer input', () => {
    expect(sanitizeMonetaryInput('100')).toBe('100');
  });

  it('strips negative signs', () => {
    expect(sanitizeMonetaryInput('-50.00')).toBe('50.00');
  });

  it('allows trailing decimal with no digits after', () => {
    expect(sanitizeMonetaryInput('100.')).toBe('100.');
  });
});

describe('cleanMonetaryPaste', () => {
  it('strips dollar signs', () => {
    expect(cleanMonetaryPaste('$100.00')).toBe('100.00');
  });

  it('strips commas from large numbers', () => {
    expect(cleanMonetaryPaste('1,234.56')).toBe('1234.56');
  });

  it('strips dollar sign and commas together', () => {
    expect(cleanMonetaryPaste('$1,234.56')).toBe('1234.56');
  });

  it('strips spaces', () => {
    expect(cleanMonetaryPaste('1 234.56')).toBe('1234.56');
  });

  it('handles messy paste with multiple commas and dollar sign', () => {
    expect(cleanMonetaryPaste('$12,345,678.90')).toBe('12345678.90');
  });

  it('limits to 2 decimal places after cleaning', () => {
    expect(cleanMonetaryPaste('$1,234.567')).toBe('1234.56');
  });

  it('handles plain number', () => {
    expect(cleanMonetaryPaste('50')).toBe('50');
  });
});

describe('sanitizeIntegerInput', () => {
  it('passes through digits', () => {
    expect(sanitizeIntegerInput('123')).toBe('123');
  });

  it('strips non-digit characters', () => {
    expect(sanitizeIntegerInput('12abc34')).toBe('1234');
  });

  it('strips decimal points', () => {
    expect(sanitizeIntegerInput('12.5')).toBe('125');
  });

  it('strips negative signs', () => {
    expect(sanitizeIntegerInput('-5')).toBe('5');
  });

  it('handles empty string', () => {
    expect(sanitizeIntegerInput('')).toBe('');
  });
});

// --- EditBillView form validation tests ---

function makeStore() {
  return createStore({
    state() {
      return { bills: [], darkMode: false, isSidebarOpen: false, user: null };
    },
    getters: {
      billById: () => () => null,
    },
    actions: {
      addBill: () => {},
    },
  });
}

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'bills', component: { template: '<div />' } },
      { path: '/bill/new', name: 'bill-add', component: { template: '<div />' } },
      { path: '/bill/:id/edit', name: 'bill-edit', component: { template: '<div />' } },
    ],
  });
}

describe('EditBillView validation', () => {
  it('shows error when name is empty', async () => {
    const router = makeRouter();
    await router.push('/bill/new');
    const wrapper = mount(EditBillView, {
      global: { plugins: [makeStore(), router] },
    });

    // Set amount but leave name empty
    wrapper.vm.form.amountDisplay = '100';
    wrapper.vm.form.dueDate = '2026-12-25';
    await wrapper.find('form').trigger('submit');

    expect(wrapper.vm.formError).toBe('Bill name is required.');
    expect(wrapper.text()).toContain('Bill name is required.');
  });

  it('shows error when amount is empty', async () => {
    const router = makeRouter();
    await router.push('/bill/new');
    const wrapper = mount(EditBillView, {
      global: { plugins: [makeStore(), router] },
    });

    wrapper.vm.form.name = 'Test Bill';
    wrapper.vm.form.dueDate = '2026-12-25';
    await wrapper.find('form').trigger('submit');

    expect(wrapper.vm.formError).toContain('valid amount');
  });

  it('shows error when amount is zero', async () => {
    const router = makeRouter();
    await router.push('/bill/new');
    const wrapper = mount(EditBillView, {
      global: { plugins: [makeStore(), router] },
    });

    wrapper.vm.form.name = 'Test Bill';
    wrapper.vm.form.amountDisplay = '0';
    wrapper.vm.form.dueDate = '2026-12-25';
    await wrapper.find('form').trigger('submit');

    expect(wrapper.vm.formError).toContain('valid amount');
  });

  it('shows error when due date is missing for non-recurring bill', async () => {
    const router = makeRouter();
    await router.push('/bill/new');
    const wrapper = mount(EditBillView, {
      global: { plugins: [makeStore(), router] },
    });

    wrapper.vm.form.name = 'Test Bill';
    wrapper.vm.form.amountDisplay = '50';
    await wrapper.find('form').trigger('submit');

    expect(wrapper.vm.formError).toContain('Due date is required');
  });

  it('validates successfully with all required fields filled', async () => {
    const router = makeRouter();
    await router.push('/bill/new');
    const wrapper = mount(EditBillView, {
      global: { plugins: [makeStore(), router] },
    });

    expect(wrapper.vm.validateForm()).not.toBeNull();

    wrapper.vm.form.name = 'Test Bill';
    wrapper.vm.form.amountDisplay = '99.99';
    wrapper.vm.form.dueDate = '2026-12-25';

    expect(wrapper.vm.validateForm()).toBeNull();
  });

  it('sanitizes amount input on the amountDisplay field', async () => {
    const router = makeRouter();
    await router.push('/bill/new');
    const wrapper = mount(EditBillView, {
      global: { plugins: [makeStore(), router] },
    });

    const amountInput = wrapper.find('#amount');

    // Simulate typing a valid amount
    await amountInput.setValue('123.45');
    await amountInput.trigger('input');
    expect(wrapper.vm.form.amountDisplay).toBe('123.45');
  });

  it('validates recurring bill interval', async () => {
    const router = makeRouter();
    await router.push('/bill/new');
    const wrapper = mount(EditBillView, {
      global: { plugins: [makeStore(), router] },
    });

    wrapper.vm.form.name = 'Monthly Bill';
    wrapper.vm.form.amountDisplay = '50';
    wrapper.vm.form.isRecurring = true;
    wrapper.vm.form.interval = '';

    const error = wrapper.vm.validateForm();
    expect(error).toContain('Interval must be at least 1');
  });
});
