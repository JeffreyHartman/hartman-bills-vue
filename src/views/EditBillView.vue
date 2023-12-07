<template>
  <div>
    <form @submit.prevent="saveBill">
      <label for="name">Name:</label>
      <input type="text" id="name" v-model="bill.name" required>

      <label for="amount">Amount:</label>
      <input type="number" id="amount" v-model="bill.amount" required>

      <label for="dueDate">Due Date:</label>
      <input type="date" id="dueDate" v-model="bill.dueDate" required>

      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      bill: {
        name: '',
        amount: 0,
        dueDate: ''
      }
    };
  },
  created() {
    // Fetch the bill from the store
    const bill = this.$store.state.bills.find(b => b.id === this.$route.params.id);
    this.bill = { ...bill };    
  },
  methods: {
    saveBill() {
      // Save the bill logic goes here
      console.log('Saving bill:', this.bill);      
    }
  }
};
</script>

<style scoped>
/* Add your custom styles here */
</style>
