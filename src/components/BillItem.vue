<template>
  <router-link
    :to="{ name: 'bill-details', params: { id: bill.id }, query: bill.dueDate ? { due: toLocalDateString(bill.originalDueDate || bill.dueDate) } : {} }"
    class="block"
  >
    <div
      class="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-150
             hover:bg-surface-50 dark:hover:bg-surface-800/50 group card"
    >
      <!-- Icon circle -->
      <div
        class="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center"
        :style="{ backgroundColor: bill.iconColor || '#4f46e5' }"
      >
        <component :is="iconComponent" class="w-5 h-5 text-white" :stroke-width="1.75" />
      </div>

      <!-- Bill info -->
      <div class="flex-1 min-w-0">
        <span class="font-medium text-sm truncate block">{{ bill.name }}</span>
        <p class="text-xs mt-0.5 flex items-center gap-1" :class="dueTextClass">
          <template v-if="bill.isPaid">
            <span class="text-status-paid font-medium">Paid on</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-2.5 h-2.5 text-surface-300">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span class="text-surface-500 dark:text-surface-400">{{ formatDateWithYear(paidDate) }}</span>
          </template>
          <template v-else>
            <span>{{ formatDateWithYear(bill.dueDate) }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-2.5 h-2.5 text-surface-300">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span>{{ dueLabel }}</span>
          </template>
        </p>
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
import { formatAmount, formatDate, formatDateWithYear, daysUntilDue, billStatus, toLocalDateString } from '@/utils/formatting.js';
import { ICON_MAP } from '@/utils/billIcons.js';
import { Receipt } from 'lucide-vue-next';

export default {
  name: 'BillItem',
  props: {
    bill: { type: Object, required: true }
  },
  computed: {
    iconComponent() {
      return ICON_MAP[this.bill.icon] || Receipt;
    },
    status() {
      return billStatus(this.bill.dueDate, this.bill.isPaid);
    },
    paidDate() {
      if (!this.bill.isPaid || !this.bill.paidDates) return null;
      const dueDate = new Date(this.bill.dueDate);
      const match = this.bill.paidDates.find(pd => {
        const d = new Date(pd);
        return d.getFullYear() === dueDate.getFullYear() &&
               d.getMonth() === dueDate.getMonth() &&
               d.getDate() === dueDate.getDate();
      });
      return match || this.bill.dueDate;
    },
    dueLabel() {
      const days = daysUntilDue(this.bill.dueDate);
      if (days === 0) return 'Today';
      if (days === 1) return 'Tomorrow';
      if (days < 0) return `${Math.abs(days)} days overdue`;
      return `${days} days`;
    },
    dueTextClass() {
      if (this.bill.isPaid) return 'text-status-paid';
      if (this.status === 'overdue') return 'text-status-overdue';
      if (this.status === 'warning') return 'text-status-warning';
      return 'text-surface-400 dark:text-surface-500';
    }
  },
  methods: { formatAmount, formatDate, formatDateWithYear, toLocalDateString }
};
</script>
