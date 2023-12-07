<template>
  <div class="max-w-md mx-auto overflow-hidden m-3 p-6 space-y-2">
    <h1 class="text-2xl font-bold mb-2">{{ bill.name }}</h1>
    <hr class="mb-2"/>
    <p class="text-gray-700 text-xl font-bold"> {{ formatAmount(bill.amount) }}</p>
    <p class="text-gray-400 font-bold">By {{ formatDate(bill.dueDate) }}</p>
    <p class="inline-flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span :style="{ color: daysUntilDue.includes('past') ? 'red' : 'inherit' }">{{ daysUntilDue }}</span>
    </p>
    <p class="text-gray-700"><strong class="font-semibold">Status:</strong> {{ bill.status }}</p>
    <p class="text-gray-700"><strong class="font-semibold">Recurring:</strong> {{ bill.recurring ? 'Yes' : 'No' }}</p>
    <button class="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Mark Paid</button>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { formatDate, formatAmount } from '@/utils/formatting.js';

export default {
  computed: {
    ...mapState(['bills']),
    bill() {
      const id = parseInt(this.$route.params.id);
      return this.bills.find(bill => bill.id === id);
    },
    daysUntilDue() {
      const dueDate = new Date(this.bill.dueDate);
      const today = new Date();
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? `${diffDays} days until due` : `${Math.abs(diffDays)} days past due`;
    }
  },
  created() {
    const id = this.$route.params.id;
    console.log(id);
  },
  methods: {
    formatDate,
    formatAmount
  }
}
</script>

<style scoped>
/* Add your component styles here */
</style>
