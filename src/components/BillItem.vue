<template>
  <router-link :to="{ name: 'bill-details', params: { id: bill.id } }">
    <div class="bill-item flex justify-between mb-4">
      <div class="text-left">
        <div class="mb-2 text-sm">{{ bill.name }}</div>
        <div class="text-gray-400 text-xs">{{ formatDate(bill.dueDate) }} > {{ daysUntilDue(bill.dueDate) }} days</div>
      </div>    
      <div class="text-gray-700 dark:text-white text-right">      
        <div>{{ formatAmount(bill.amount) }}</div>
      </div>
    </div>
  </router-link>
</template>

<script>
import { formatDate, formatAmount } from '@/utils/formatting.js';

export default {
  name: 'BillItem',
  props: {
    bill: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate,
    formatAmount,
    daysUntilDue(dueDate) {
      const today = new Date();
      const due = new Date(dueDate);
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      return diffDays;
    }
  }
}
</script>