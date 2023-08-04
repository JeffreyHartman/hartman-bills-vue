<template>
  <div class="bills-list">
    <bill-item
      v-for="bill in bills"
      :key="bill.id"
      :bill="bill"
    />
  </div>
</template>

<script>
import BillItem from '@/components/BillItem.vue'

export default {
  name: 'BillsList',
  components: {
    'bill-item': BillItem
  },
  data() {
    return {
      bills: [
        { id: 1, name: 'Electricity', dueDate: '2020-01-01', amount: 100.00 },
        { id: 2, name: 'Water', dueDate: '2020-01-01', amount: 50.00 },
        { id: 3, name: 'Internet', dueDate: '2020-01-01', amount: 80.00 }
      ]
    }
  }
}
</script>