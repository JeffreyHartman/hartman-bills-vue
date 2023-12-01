<template>
  <div class="dark:bg-black dark:text-white min-h-screen mx-auto">
    <app-header></app-header>
    <router-view/>  
    <button @click="toggleDarkMode" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
      Dark Mode toggle!
    </button>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'

export default {
  name: 'App',
  components: {
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
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
