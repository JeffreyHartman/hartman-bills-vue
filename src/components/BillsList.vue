<template>
  <div class="container mx-auto px-4 max-w-md dark:bg-black dark:text-white">
    <div class="bills-list">
      <div v-for="(group, month) in groupedBills" :key="month">
        <!-- Month Header -->
        <div class="flex justify-between items-center">
          <div class="text-xl font-bold">{{ month }}</div>
          <div class="text-xl font-bold">{{ group.total }}</div>
        </div>
        <hr />
        <div v-for="bill in group.bills" :key="bill.id">
          <bill-item          
            :bill="bill"
            class="bg-white dark:bg-black px-8 pt-1"
          >        
          </bill-item>
        </div>
        <hr />
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