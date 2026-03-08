<template>
  <div v-if="bill" class="pt-6 space-y-4">
    <!-- Status badge & amount -->
    <div class="card p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center"
            :style="{ backgroundColor: bill.iconColor || '#4f46e5' }"
          >
            <component :is="iconComponent" class="w-6 h-6 text-white" :stroke-width="1.75" />
          </div>
          <div>
            <h2 class="text-xl font-semibold">{{ bill.name }}</h2>
            <span
              class="inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-lg"
              :class="statusBadgeClass"
            >{{ statusLabel }}</span>
          </div>
        </div>
        <p class="text-2xl font-mono font-bold" :class="isPaid ? 'text-surface-400 line-through' : ''">
          {{ formatAmount(displayAmount) }}
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
          <dd class="font-medium" :class="dueTextClass">{{ daysUntilDueDisplay }}</dd>
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

      <button
        @click="handleEdit"
        class="btn-secondary flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
        Edit
      </button>
    </div>

    <!-- Edit scope modal for recurring bills -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" @click.self="showEditModal = false">
          <div class="fixed inset-0 bg-black/40" @click="showEditModal = false"></div>
          <div class="relative bg-white dark:bg-surface-900 rounded-2xl shadow-elevated w-full max-w-sm p-5 space-y-3 z-10">
            <h3 class="text-base font-semibold">Edit recurring bill</h3>
            <button
              @click="navigateEdit('instance')"
              class="card w-full p-4 text-left flex items-center gap-3 hover:border-accent transition-colors"
            >
              <div class="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-accent">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-sm">This instance only</p>
                <p class="text-xs text-surface-400 mt-0.5">Change amount or due date for just this occurrence</p>
              </div>
            </button>
            <button
              @click="navigateEdit('all')"
              class="card w-full p-4 text-left flex items-center gap-3 hover:border-accent transition-colors"
            >
              <div class="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-accent">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-sm">All instances</p>
                <p class="text-xs text-surface-400 mt-0.5">Change the recurring bill and all future occurrences</p>
              </div>
            </button>
            <button @click="showEditModal = false" class="w-full text-sm text-surface-400 py-2 mt-1">Cancel</button>
          </div>
        </div>
      </Transition>
    </Teleport>

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
import { formatAmount, formatDateLong, daysUntilDue, daysUntilDueLabel, billStatus, recurringLabel, toLocalDateString } from '@/utils/formatting.js';
import { ICON_MAP } from '@/utils/billIcons.js';
import { Receipt } from 'lucide-vue-next';

export default {
  name: 'BillDetailsView',
  data() {
    return {
      showEditModal: false,
    };
  },
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
    displayAmount() {
      if (!this.bill) return 0;
      if (!this.bill.recurring || !this.bill.overrides) return this.bill.amount;
      const key = toLocalDateString(this.displayDueDate);
      const override = this.bill.overrides[key];
      if (override && override.amount != null) return Number(override.amount);
      return this.bill.amount;
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
    iconComponent() {
      if (!this.bill) return Receipt;
      return ICON_MAP[this.bill.icon] || Receipt;
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
    daysUntilDueDisplay() {
      const days = daysUntilDue(this.displayDueDate);
      if (this.isPaid) return 'Paid';
      if (days === 0) return 'Due today';
      if (days === 1) return 'Due tomorrow';
      if (days === -1) return '1 day overdue';
      if (days < 0) return `${Math.abs(days)} days overdue`;
      return `${days} days`;
    },
    dueTextClass() {
      if (this.isPaid) return 'text-status-paid';
      const days = daysUntilDue(this.displayDueDate);
      if (days < 0) return 'text-status-overdue';
      if (days <= 3) return 'text-status-warning';
      return '';
    },
    isRecurringInstance() {
      return this.bill?.recurring && this.$route.query.due;
    }
  },
  methods: {
    formatAmount,
    formatDateLong,
    recurringLabel,
    handleEdit() {
      if (!this.bill) return;
      if (this.isRecurringInstance) {
        this.showEditModal = true;
      } else {
        this.$router.push({ name: 'bill-edit', params: { id: this.bill.id } });
      }
    },
    navigateEdit(scope) {
      if (!this.bill) return;
      this.showEditModal = false;
      const route = { name: 'bill-edit', params: { id: this.bill.id } };
      if (scope === 'instance') {
        route.query = { instance: this.$route.query.due };
      }
      this.$router.push(route);
    },
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
