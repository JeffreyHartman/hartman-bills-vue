<template>
  <div>
    <h1>Bill Details</h1>
    <p>Bill ID: </p>
    <!-- Add more details here -->
  </div>
</template>

<script>
export default {  
  created() {
    const id = this.$route.params.id;
    console.log(id);
  },
}
</script>

<style scoped>
/* Add your component styles here */
</style>
