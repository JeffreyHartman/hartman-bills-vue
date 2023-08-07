<template>
  <div class="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
    <!-- Hamburger menu icon -->
    <div @click="toggleMenu" class="cursor-pointer">
      <div class="h1 w-6 bg-white my-1"></div>
      <div class="h1 w-6 bg-white my-1"></div>
      <div class="h1 w-6 bg-white my-1"></div>
    </div>

    <!-- App Title -->
    <div class="text-xl font-bold">Hartman Bills</div>

    <!-- Empty div for spacing -->
    <div class="w-6"></div>
  </div>
  
</template>

<script>
export default {
  name: 'AppHeader',
  methods: {
    toggleMenu() {
      this.$emit('toggle-menu');
    }
  }
}
</script>