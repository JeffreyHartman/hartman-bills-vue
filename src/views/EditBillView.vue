<template>
  <div class="pt-6">
    <form @submit.prevent="saveBill" novalidate class="space-y-4">
      <div class="card p-6 space-y-5">
        <!-- Name -->
        <div>
          <label for="name" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Bill Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="input-field"
            placeholder="e.g. Electric Bill"
            maxlength="100"
            required
          >
        </div>

        <!-- Amount -->
        <div>
          <label for="amount" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Amount</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-mono">$</span>
            <input
              id="amount"
              :value="form.amountDisplay"
              @input="onAmountInput"
              @keydown="onAmountKeydown"
              type="text"
              inputmode="decimal"
              class="input-field pl-8 font-mono"
              placeholder="0.00"
              required
            >
          </div>
        </div>

        <!-- Due Date (for non-recurring) -->
        <div v-if="!form.isRecurring">
          <label for="dueDate" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Due Date</label>
          <input
            id="dueDate"
            v-model="form.dueDate"
            type="date"
            class="input-field"
            required
          >
        </div>

        <!-- Recurring toggle -->
        <div class="flex items-center justify-between py-1">
          <span class="text-sm font-medium">Recurring</span>
          <button
            type="button"
            @click="form.isRecurring = !form.isRecurring"
            class="relative w-11 h-6 rounded-full transition-colors duration-200"
            :class="form.isRecurring ? 'bg-accent' : 'bg-surface-300 dark:bg-surface-600'"
            role="switch"
            :aria-checked="form.isRecurring"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
              :class="form.isRecurring ? 'translate-x-5' : ''"
            ></span>
          </button>
        </div>

        <!-- Recurring settings -->
        <div v-if="form.isRecurring" class="space-y-4 pl-0 border-l-2 border-accent/20 ml-0 pl-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="interval" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Every</label>
              <input
                id="interval"
                :value="form.interval"
                @input="onIntervalInput"
                @keydown="onIntegerKeydown"
                type="text"
                inputmode="numeric"
                class="input-field"
                required
              >
            </div>
            <div>
              <label for="unit" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Period</label>
              <select id="unit" v-model="form.unit" class="input-field">
                <option value="day">Day(s)</option>
                <option value="week">Week(s)</option>
                <option value="month">Month(s)</option>
                <option value="year">Year(s)</option>
              </select>
            </div>
          </div>

          <div v-if="form.unit === 'month'">
            <label for="dayOfMonth" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Day of Month</label>
            <input
              id="dayOfMonth"
              :value="form.dayOfMonth"
              @input="onDayOfMonthInput"
              @keydown="onIntegerKeydown"
              type="text"
              inputmode="numeric"
              class="input-field"
              placeholder="1-31"
            >
          </div>
        </div>
      </div>

      <!-- Form error -->
      <p v-if="formError" class="text-sm text-status-overdue">{{ formError }}</p>

      <!-- Actions -->
      <div class="flex gap-3">
        <button type="button" @click="$router.back()" class="btn-secondary flex-1" :disabled="isSaving">Cancel</button>
        <button type="submit" class="btn-primary flex-1" :disabled="isSaving">
          {{ isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Bill') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { sanitizeMonetaryInput, cleanMonetaryPaste, sanitizeIntegerInput } from '@/utils/formatting.js';

export default {
  name: 'EditBillView',
  data() {
    return {
      isSaving: false,
      formError: null,
      form: {
        name: '',
        amountDisplay: '',
        dueDate: '',
        isRecurring: false,
        interval: 1,
        unit: 'month',
        dayOfMonth: 1,
      }
    };
  },
  computed: {
    ...mapGetters(['billById']),
    isEditing() {
      return !!this.$route.params.id;
    },
    existingBill() {
      if (!this.isEditing) return null;
      return this.billById(this.$route.params.id);
    }
  },
  created() {
    if (this.existingBill) {
      const bill = this.existingBill;
      this.form.name = bill.name;
      this.form.amountDisplay = bill.amount != null ? String(bill.amount) : '';
      this.form.isRecurring = !!bill.recurring;
      if (bill.recurring) {
        this.form.interval = bill.recurring.interval;
        this.form.unit = bill.recurring.unit;
        this.form.dayOfMonth = bill.recurring.dayOfMonth || 1;
      }
      if (bill.dueDate) {
        const d = new Date(bill.dueDate);
        this.form.dueDate = d.toISOString().split('T')[0];
      }
    }
  },
  methods: {
    onAmountKeydown(e) {
      // Allow: digits, decimal point, backspace, delete, tab, escape, enter, arrows, home, end
      const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (allowed.includes(e.key)) return;
      // Allow Ctrl/Cmd + A/C/V/X
      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
      // Allow digits
      if (/^\d$/.test(e.key)) return;
      // Allow one decimal point
      if (e.key === '.' && !e.target.value.includes('.')) return;
      e.preventDefault();
    },
    onAmountInput(e) {
      const raw = e.target.value;
      // Handle paste with commas/$ by cleaning first
      const cleaned = raw.includes(',') || raw.includes('$') ? cleanMonetaryPaste(raw) : sanitizeMonetaryInput(raw);
      this.form.amountDisplay = cleaned;
      // Sync the DOM value if sanitization changed it
      if (e.target.value !== cleaned) {
        e.target.value = cleaned;
      }
    },
    onIntegerKeydown(e) {
      const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (allowed.includes(e.key)) return;
      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
      if (/^\d$/.test(e.key)) return;
      e.preventDefault();
    },
    onIntervalInput(e) {
      const cleaned = sanitizeIntegerInput(e.target.value);
      let num = parseInt(cleaned, 10);
      if (isNaN(num) || num < 1) {
        this.form.interval = cleaned === '' ? '' : 1;
      } else if (num > 365) {
        this.form.interval = 365;
      } else {
        this.form.interval = num;
      }
      e.target.value = this.form.interval;
    },
    onDayOfMonthInput(e) {
      const cleaned = sanitizeIntegerInput(e.target.value);
      let num = parseInt(cleaned, 10);
      if (isNaN(num) || num < 1) {
        this.form.dayOfMonth = cleaned === '' ? '' : 1;
      } else if (num > 31) {
        this.form.dayOfMonth = 31;
      } else {
        this.form.dayOfMonth = num;
      }
      e.target.value = this.form.dayOfMonth;
    },
    validateForm() {
      const amount = parseFloat(this.form.amountDisplay);
      if (!this.form.name.trim()) {
        return 'Bill name is required.';
      }
      if (!this.form.amountDisplay || isNaN(amount) || amount <= 0) {
        return 'Please enter a valid amount greater than $0.';
      }
      if (!this.form.isRecurring && !this.form.dueDate) {
        return 'Due date is required for non-recurring bills.';
      }
      if (this.form.isRecurring) {
        const interval = parseInt(this.form.interval, 10);
        if (isNaN(interval) || interval < 1) {
          return 'Interval must be at least 1.';
        }
        if (this.form.unit === 'month') {
          const day = parseInt(this.form.dayOfMonth, 10);
          if (isNaN(day) || day < 1 || day > 31) {
            return 'Day of month must be between 1 and 31.';
          }
        }
      }
      return null;
    },
    async saveBill() {
      if (this.isSaving) return;
      if (this.isEditing && !this.existingBill) return;

      this.formError = null;
      const error = this.validateForm();
      if (error) {
        this.formError = error;
        return;
      }

      this.isSaving = true;
      const amount = parseFloat(this.form.amountDisplay);

      const billData = {
        name: this.form.name.trim(),
        amount,
        recurring: this.form.isRecurring ? {
          interval: parseInt(this.form.interval, 10),
          unit: this.form.unit,
          dayOfWeek: null,
          dayOfMonth: this.form.unit === 'month' ? parseInt(this.form.dayOfMonth, 10) : null,
          dayOfYear: null,
        } : null,
        dueDate: this.form.isRecurring ? null : new Date(this.form.dueDate + 'T12:00:00').toISOString(),
      };

      try {
        if (this.isEditing) {
          await this.$store.dispatch('updateBill', {
            id: this.existingBill.id,
            paidDates: this.existingBill.paidDates,
            ...billData,
          });
        } else {
          await this.$store.dispatch('addBill', { ...billData, creationDate: new Date().toISOString() });
        }
        this.$router.push('/');
      } catch (err) {
        console.error('Failed to save bill:', err);
        this.formError = 'Failed to save bill. Please try again.';
      } finally {
        this.isSaving = false;
      }
    }
  }
};
</script>
