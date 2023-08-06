<template>
  <div class="bill-item flex justify-between mb-4">
    <div class="text-left">
      <div class="font-bold text-xl mb-2">{{ bill.name }}</div>
      <div>{{ formatDate(bill.dueDate) }}</div>
    </div>    
    <div class="text-gray-700 dark:text-white text-right">      
      <div>{{ bill.amount }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BillItem',
  props: {
    bill: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate(dateString) {
      const options = { month: 'short', day: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', options);
    }
  }
}
</script>