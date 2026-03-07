<template>
  <div class="pt-6">
    <summary-stats />
    <bills-list />
  </div>
</template>

<script>
import SummaryStats from '@/components/SummaryStats.vue';
import BillsList from '@/components/BillsList.vue';

export default {
  name: 'BillsView',
  components: { SummaryStats, BillsList }
};
</script>
