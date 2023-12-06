<template>
  <div>
    <h1>{{ bill.name }}</h1>
    <hr />
    <p>{{ formatAmount(bill.amount) }}</p>
    <p>By {{ formatDate(bill.dueDate) }}</p>
    <p>Recurring: {{ bill.recurring }}</p>
    <button>Mark Paid</button>
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
