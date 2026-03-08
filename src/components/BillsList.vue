<template>
  <div>
    <!-- Tab navigation -->
    <div class="flex gap-1 p-1 bg-surface-100 dark:bg-surface-900 rounded-xl mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="currentTab = tab.key"
        class="relative flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150"
        :class="currentTab === tab.key
          ? 'bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 shadow-card'
          : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'"
      >
        {{ tab.label }}
        <span
          v-if="tab.key === 'overdue' && overdueCount > 0"
          class="absolute -top-1 -right-1 w-4 h-4 bg-status-overdue text-white text-[10px] font-bold rounded-full flex items-center justify-center"
        >{{ overdueCount }}</span>
      </button>
    </div>

    <!-- Bills grouped by month -->
    <div v-if="groupedBills.length > 0" class="space-y-4">
      <div v-for="group in groupedBills" :key="group.month">
        <!-- Month header -->
        <div class="flex justify-between items-baseline px-2 mb-1">
          <h3 class="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">{{ group.month }}</h3>
          <span class="text-xs font-mono font-medium text-surface-400 dark:text-surface-500">{{ formatAmount(group.total) }}</span>
        </div>

        <!-- Bill cards -->
        <div class="space-y-2">
          <bill-item
            v-for="bill in group.bills"
            :key="bill.instanceId || bill.id"
            :bill="bill"
          />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="card p-12 text-center">
      <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-surface-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
      </div>
      <p class="text-sm text-surface-500 dark:text-surface-400">No {{ currentTab }} bills</p>
    </div>
  </div>
</template>

<script>
import BillItem from '@/components/BillItem.vue';
import { mapGetters } from 'vuex';
import { formatAmount } from '@/utils/formatting.js';

export default {
  name: 'BillsList',
  components: { BillItem },
  data() {
    return {
      currentTab: 'upcoming',
      tabs: [
        { key: 'upcoming', label: 'Upcoming' },
        { key: 'overdue', label: 'Overdue' },
        { key: 'recurring', label: 'Recurring' },
        { key: 'paid', label: 'Paid' },
      ]
    };
  },
  computed: {
    ...mapGetters(['upcomingBills', 'overdueBills', 'recurringBills', 'paidBills']),
    overdueCount() {
      return this.overdueBills.length;
    },
    filteredBills() {
      switch (this.currentTab) {
        case 'upcoming': return this.upcomingBills;
        case 'overdue': return this.overdueBills;
        case 'recurring': return this.recurringBills;
        case 'paid': return this.paidBills;
        default: return [];
      }
    },
    groupedBills() {
      const groups = {};
      this.filteredBills.forEach(bill => {
        const date = new Date(bill.dueDate || bill.creationDate);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!groups[monthYear]) {
          groups[monthYear] = { month: monthYear, bills: [], total: 0, sortDate: date };
        }
        groups[monthYear].bills.push(bill);
        groups[monthYear].total += bill.amount;
      });
      return Object.values(groups).sort((a, b) => a.sortDate - b.sortDate);
    }
  },
  methods: { formatAmount }
};
</script>
