<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <bills-list></bills-list>
  <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    Click me
  </button>
</template>

<script>
import BillsList from '@/components/BillsList.vue'

export default {
  name: 'App',
  components: {
    BillsList
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
