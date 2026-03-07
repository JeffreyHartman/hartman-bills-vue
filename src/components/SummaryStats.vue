<template>
  <div class="grid grid-cols-2 gap-3 mb-6">
    <div class="card p-4">
      <p class="text-xs font-medium text-surface-400 dark:text-surface-500 uppercase tracking-wider">Upcoming</p>
      <p class="text-2xl font-mono font-semibold mt-1">{{ formatAmount(stats.upcomingTotal) }}</p>
      <p class="text-xs text-surface-400 mt-0.5">{{ stats.upcomingCount }} bill{{ stats.upcomingCount !== 1 ? 's' : '' }}</p>
    </div>
    <div class="card p-4" :class="stats.overdueCount > 0 ? 'border-status-overdue/30 bg-status-overdue-light/30 dark:bg-status-overdue-dark/20' : ''">
      <p class="text-xs font-medium uppercase tracking-wider" :class="stats.overdueCount > 0 ? 'text-status-overdue' : 'text-surface-400 dark:text-surface-500'">Overdue</p>
      <p class="text-2xl font-mono font-semibold mt-1" :class="stats.overdueCount > 0 ? 'text-status-overdue' : ''">{{ formatAmount(stats.overdueTotal) }}</p>
      <p class="text-xs mt-0.5" :class="stats.overdueCount > 0 ? 'text-status-overdue/70' : 'text-surface-400'">{{ stats.overdueCount }} bill{{ stats.overdueCount !== 1 ? 's' : '' }}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { formatAmount } from '@/utils/formatting.js';

export default {
  name: 'SummaryStats',
  computed: {
    ...mapGetters(['summaryStats']),
    stats() {
      return this.summaryStats;
    }
  },
  methods: { formatAmount }
};
</script>
