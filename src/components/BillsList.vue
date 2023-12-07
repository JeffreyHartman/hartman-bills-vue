<template>
  <div class="container mx-auto dark:bg-black dark:text-white">
    <!-- Bills navigation -->
    <div class="navbar p-4 bg-gray-200 dark:bg-gray-800 mb-4 rounded-md text-sm">
        <button :class="{ 'active-filter': currentTab === 'upcoming' }" @click="setCurrentTab('upcoming')" class="nav-button">UPCOMING</button>
        <div class="overdue-wrapper">
          <div v-if="hasOverdueBills" class="warning-symbol"></div>
          <button :class="{ 'active-filter': currentTab === 'overdue' }" @click="setCurrentTab('overdue')" class="nav-button">OVERDUE</button>
        </div>
        <button :class="{ 'active-filter': currentTab === 'recurring' }" @click="setCurrentTab('recurring')" class="nav-button">RECURRING</button>
        <button :class="{ 'active-filter': currentTab === 'paid' }" @click="setCurrentTab('paid')" class="nav-button">PAID</button>
    </div>

    <div class="bills-list">
      <div v-for="(group, month) in groupedBills" :key="month">
        <!-- Month Header -->
        <div class="flex justify-between items-center bg-gray-200 dark:bg-gray-600 rounded-md px-4 mt-4">
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
import { mapGetters } from 'vuex';
import { formatAmount } from '@/utils/formatting.js';

export default {
  name: 'BillsList',
  components: {
    'bill-item': BillItem
  },
  computed: {
    ...mapGetters([
      'upcomingBills',
      'overdueBills',
      'recurringBills',
      'paidBills'
    ]),
    groupedBills() {
      return this.filteredBills.reduce((acc, bill) => {
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
    },
    filteredBills() {
      switch (this.currentTab) {
        case 'upcoming':
          return this.upcomingBills;
        case 'overdue':
          return this.overdueBills;
        case 'recurring':
          return this.recurringBills;
        case 'paid':
          return this.paidBills;
        default:
          return [];
      }
    },
    hasOverdueBills() {
      return this.overdueBills.length > 0;
    }
  },
  methods: {
    formatAmount,
    setCurrentTab(tab) {
      this.currentTab = tab;
    }
  },
  data() {
    return {
      currentTab: 'upcoming'
    }
  }
}
</script>

<style scoped>
.nav-button {
  margin-right: 12px;
  cursor: pointer;
  transition: color 0.3s;
}

.nav-button:last-child {
  margin-right: 0;
}

.nav-button:hover {
  color: #3182ce;
}

.active-filter {
  text-decoration: underline;
  font-weight: bold;
}

.overdue-wrapper {
  position: relative;
  display: inline-block;
  margin-right: 12px;
}

.warning-symbol {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: red;
  border-radius: 50%;
  top: -10px;
  right: -1px;
}
</style>
