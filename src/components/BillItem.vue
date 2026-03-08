<template>
  <router-link
    :to="{ name: 'bill-details', params: { id: bill.id }, query: bill.dueDate ? { due: toLocalDateString(bill.dueDate) } : {} }"
    class="block"
  >
    <div
      class="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-150
             hover:bg-surface-50 dark:hover:bg-surface-800/50 group"
    >
      <!-- Status indicator -->
      <div
        class="w-1 h-10 rounded-full flex-shrink-0"
        :class="statusColor"
      ></div>

      <!-- Bill info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-medium text-sm truncate">{{ bill.name }}</span>
          <span
            v-if="bill.recurring"
            class="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 flex-shrink-0"
          >{{ recurringLabel(bill.recurring) }}</span>
        </div>
        <p class="text-xs mt-0.5" :class="dueTextClass">{{ dueLabel }}</p>
      </div>

      <!-- Amount -->
      <div class="text-right flex-shrink-0">
        <p class="font-mono font-semibold text-sm" :class="bill.isPaid ? 'text-surface-400 line-through' : ''">
          {{ formatAmount(bill.amount) }}
        </p>
      </div>

      <!-- Chevron -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
           class="w-4 h-4 text-surface-300 dark:text-surface-600 group-hover:text-surface-400 transition-colors flex-shrink-0">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </div>
  </router-link>
</template>

<script>
import { formatAmount, daysUntilDueLabel, billStatus, recurringLabel, toLocalDateString } from '@/utils/formatting.js';

export default {
  name: 'BillItem',
  props: {
    bill: { type: Object, required: true }
  },
  computed: {
    status() {
      return billStatus(this.bill.dueDate, this.bill.isPaid);
    },
    statusColor() {
      const colors = {
        paid: 'bg-status-paid',
        overdue: 'bg-status-overdue',
        warning: 'bg-status-warning',
        upcoming: 'bg-accent/40',
      };
      return colors[this.status] || 'bg-surface-300';
    },
    dueLabel() {
      if (this.bill.isPaid) return 'Paid';
      return daysUntilDueLabel(this.bill.dueDate);
    },
    dueTextClass() {
      if (this.bill.isPaid) return 'text-status-paid';
      if (this.status === 'overdue') return 'text-status-overdue';
      if (this.status === 'warning') return 'text-status-warning';
      return 'text-surface-400 dark:text-surface-500';
    }
  },
  methods: { formatAmount, recurringLabel, toLocalDateString }
};
</script>
