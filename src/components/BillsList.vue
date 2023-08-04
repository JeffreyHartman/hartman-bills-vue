<template>
  <div class="container mx-auto px-4 max-w-md">
    <div class="bills-list">
      <bill-item
        v-for="bill in bills"
        :key="bill.id"
        :bill="bill"
        class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >      
    </bill-item>
    </div>
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