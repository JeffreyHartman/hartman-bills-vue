<template>
  <div class="pt-6">
    <form @submit.prevent="saveBill" class="space-y-4">
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
              v-model.number="form.amount"
              type="number"
              step="0.01"
              min="0"
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
                v-model.number="form.interval"
                type="number"
                min="1"
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
              v-model.number="form.dayOfMonth"
              type="number"
              min="1"
              max="31"
              class="input-field"
              placeholder="1-31"
            >
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button type="button" @click="$router.back()" class="btn-secondary flex-1">Cancel</button>
        <button type="submit" class="btn-primary flex-1">{{ isEditing ? 'Save Changes' : 'Add Bill' }}</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'EditBillView',
  data() {
    return {
      form: {
        name: '',
        amount: null,
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
      this.form.amount = bill.amount;
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
    async saveBill() {
      const billData = {
        name: this.form.name,
        amount: this.form.amount,
        recurring: this.form.isRecurring ? {
          interval: this.form.interval,
          unit: this.form.unit,
          dayOfWeek: null,
          dayOfMonth: this.form.unit === 'month' ? this.form.dayOfMonth : null,
          dayOfYear: null,
        } : null,
        dueDate: this.form.isRecurring ? null : new Date(this.form.dueDate + 'T12:00:00').toISOString(),
      };

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
    }
  }
};
</script>
