<template>
  <div class="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
    <div v-if="route.path.includes('/bill/')">
      <span @click="goBack" class="cursor-pointer text-2xl mr-2">&larr;</span>
      <span class="text-xl font-bold">Details</span>
    </div>
    <div v-else>
      <!-- Hamburger menu icon -->
      <span @click="toggleMenu" class="cursor-pointer text-2xl mr-2">
        &#9776;
      </span>
      <span class="text-xl font-bold">Bills</span>      
    </div>
  </div>
  
</template>

<script>
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'AppHeader',
  setup() {
    const route = useRoute();
    const router = useRouter();

    const goBack = () => {
      router.go(-1);
    };

    return { route, goBack };
  },
  methods: {
    toggleMenu() {
      this.$emit('toggle-menu');
    }
  }
}
</script>