<template>
  <div class="dark:bg-black dark:text-white min-h-screen">
    <app-header></app-header>      
    <bills-list></bills-list>
    <button @click="toggleDarkMode" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
      Dark Mode toggle!
    </button>
  </div>
</template>

<script>
import BillsList from '@/components/BillsList.vue'
import AppHeader from '@/components/AppHeader.vue'

export default {
  name: 'App',
  components: {
    BillsList,
    AppHeader
  },
  data() {
    return {
      isDebouncing: false
    }
  },
  methods: {
    toggleDarkMode() {
      if (this.isDebouncing) return;
      this.isDebouncing = true;
      setTimeout(() => {
        document.body.classList.toggle('dark')
        this.isDebouncing = false;
      }, 300);
    }
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
