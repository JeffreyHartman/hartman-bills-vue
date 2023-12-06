<template>
  <div>
    <h1>Bill Details</h1>
    <p>Bill ID: {{ bill.id }}</p>
    <!-- Add more details here -->
  </div>
</template>

<script>
import { mapState } from 'vuex';

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
}
</script>

<style scoped>
/* Add your component styles here */
</style>
