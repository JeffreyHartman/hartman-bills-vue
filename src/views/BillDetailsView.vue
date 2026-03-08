<template>
  <div v-if="bill" class="pt-6 space-y-4">
    <!-- Status badge & amount -->
    <div class="card p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h2 class="text-xl font-semibold">{{ bill.name }}</h2>
          <span
            class="inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-lg"
            :class="statusBadgeClass"
          >{{ statusLabel }}</span>
        </div>
        <p class="text-2xl font-mono font-bold" :class="isPaid ? 'text-surface-400 line-through' : ''">
          {{ formatAmount(bill.amount) }}
        </p>
      </div>

      <!-- Details -->
      <dl class="space-y-3 text-sm">
        <div class="flex justify-between">
          <dt class="text-surface-400 dark:text-surface-500">Due Date</dt>
          <dd class="font-medium">{{ formatDateLong(displayDueDate) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-surface-400 dark:text-surface-500">Days Until Due</dt>
          <dd class="font-medium" :class="dueTextClass">{{ dueLabel }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-surface-400 dark:text-surface-500">Frequency</dt>
          <dd class="font-medium">{{ recurringLabel(bill.recurring) }}</dd>
        </div>
        <div v-if="bill.paidDates.length > 0" class="flex justify-between">
          <dt class="text-surface-400 dark:text-surface-500">Times Paid</dt>
          <dd class="font-medium">{{ bill.paidDates.length }}</dd>
        </div>
      </dl>
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button
        v-if="!isPaid"
        @click="markAsPaid"
        class="btn-success flex-1 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Mark Paid
      </button>
      <button
        v-else
        @click="markAsUnpaid"
        class="btn-secondary flex-1 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
        Mark Unpaid
      </button>

      <router-link
        :to="{ name: 'bill-edit', params: { id: bill.id } }"
        class="btn-secondary flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
        Edit
      </router-link>
    </div>

    <!-- Danger zone -->
    <div class="pt-2">
      <button
        @click="confirmDelete"
        class="w-full text-sm text-status-overdue hover:text-red-700 dark:hover:text-red-400 py-2 transition-colors"
      >
        Delete this bill
      </button>
    </div>
  </div>

  <div v-else class="pt-20 text-center">
    <p class="text-surface-400">Bill not found</p>
    <router-link to="/" class="text-accent text-sm mt-2 inline-block">Back to bills</router-link>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { formatAmount, formatDateLong, daysUntilDue, daysUntilDueLabel, billStatus, recurringLabel } from '@/utils/formatting.js';

export default {
  name: 'BillDetailsView',
  computed: {
    ...mapGetters(['billById']),
    bill() {
      return this.billById(this.$route.params.id);
    },
    displayDueDate() {
      if (!this.bill) return null;
      const raw = this.$route.query.due;
      if (raw) return this.parseCalendarDate(raw);
      return this.bill.dueDate || this.bill.creationDate;
    },
    isPaid() {
      if (!this.bill) return false;
      const dueDate = this.displayDueDate;
      return this.bill.paidDates.some(pd => {
        const d1 = new Date(pd);
        const d2 = new Date(dueDate);
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
      });
    },
    status() {
      return billStatus(this.displayDueDate, this.isPaid);
    },
    statusLabel() {
      const labels = { paid: 'Paid', overdue: 'Overdue', warning: 'Due Soon', upcoming: 'Upcoming' };
      return labels[this.status];
    },
    statusBadgeClass() {
      const classes = {
        paid: 'bg-status-paid-light dark:bg-status-paid-dark/40 text-status-paid',
        overdue: 'bg-status-overdue-light dark:bg-status-overdue-dark/40 text-status-overdue',
        warning: 'bg-status-warning-light dark:bg-status-warning-dark/40 text-status-warning',
        upcoming: 'bg-accent/10 text-accent',
      };
      return classes[this.status];
    },
    dueLabel() {
      return daysUntilDueLabel(this.displayDueDate);
    },
    dueTextClass() {
      if (this.isPaid) return 'text-status-paid';
      const days = daysUntilDue(this.displayDueDate);
      if (days < 0) return 'text-status-overdue';
      if (days <= 3) return 'text-status-warning';
      return '';
    }
  },
  methods: {
    formatAmount,
    formatDateLong,
    recurringLabel,
    parseCalendarDate(value) {
      if (!value) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(value);
    },
    async markAsPaid() {
      try {
        await this.$store.dispatch('markPaid', { billId: this.bill.id, date: this.displayDueDate });
      } catch (err) {
        console.error('markAsPaid failed:', err);
        window.alert('Failed to mark as paid. Please try again.');
      }
    },
    async markAsUnpaid() {
      try {
        await this.$store.dispatch('markUnpaid', { billId: this.bill.id, date: this.displayDueDate });
      } catch (err) {
        console.error('markAsUnpaid failed:', err);
        window.alert('Failed to mark as unpaid. Please try again.');
      }
    },
    async confirmDelete() {
      if (window.confirm(`Delete "${this.bill.name}"? This cannot be undone.`)) {
        try {
          await this.$store.dispatch('deleteBill', this.bill.id);
          this.$router.push('/');
        } catch (err) {
          console.error('confirmDelete failed:', err);
          window.alert('Failed to delete bill. Please try again.');
        }
      }
    }
  }
};
</script>
