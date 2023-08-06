<template>
  <div class="container mx-auto max-w-md dark:bg-black dark:text-white">
    <div class="bills-list">
      <div v-for="(group, month) in groupedBills" :key="month">
        <!-- Month Header -->
        <div class="flex justify-between items-center bg-gray-200 dark:bg-gray-600 rounded-md px-4 mt-2">
          <div class="font-bold">{{ month }}</div>
          <div class="font-bold">{{ formatAmount(group.total) }}</div>
        </div>
        
        <div v-for="bill in group.bills" :key="bill.id">
          <bill-item          
            :bill="bill"
            class="bg-white dark:bg-black px-8 pt-1"
          >        
          </bill-item>
          <hr class="dark:border-gray-700"/>
        </div>        
      </div>      
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
  computed: {
    groupedBills() {
      return this.bills.reduce((acc, bill) => {
        const monthYear = new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        if (!acc[monthYear]) {
          acc[monthYear] = {
            bills: [],
            total: 0
          };
        }

        acc[monthYear].bills.push(bill);
        acc[monthYear].total += bill.amount;

        return acc;
      }, {});
    }    
  },
  methods: {
    formatAmount(amount) {
      return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }
  },
  data() {
    return {
      bills: [
        { id: 1, name: 'Electricity', dueDate: '2023-08-09T12:00:00Z', amount: 100.00 },
        { id: 2, name: 'Water', dueDate: '2023-08-16T12:00:00Z', amount: 50.00 },
        { id: 3, name: 'Internet', dueDate: '2023-08-19T12:00:00Z', amount: 80.00 },
        { id: 1, name: 'Electricity', dueDate: '2023-09-09T12:00:00Z', amount: 100.00 },
        { id: 2, name: 'Water', dueDate: '2023-09-16T12:00:00Z', amount: 50.00 },
        { id: 3, name: 'Internet', dueDate: '2023-09-19T12:00:00Z', amount: 80.00 }
      ]
    }
  }
}
</script>