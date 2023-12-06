<template>
  <div 
    class="sidebar fixed top-16 left-0 z-50 h-full w-64 bg-[#f0f8ff] dark:bg-[#1f2937] shadow-lg transition transform duration-1000 ease-in-out"
    :class="{ 'translate-x-0': $store.state.isSidebarOpen }"
  >
    <div class="p-4">
      <router-link to="/" class="block p-2 text-blue-600">Bills</router-link>
      <router-link to="/about" class="block p-2 text-blue-600">About</router-link>
    </div>    
  </div>
</template>

<script>
export default {
  name: 'SideBar',
};
</script>
