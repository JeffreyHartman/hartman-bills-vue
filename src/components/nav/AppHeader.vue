<template>
  <div class="h-16 bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
    <div class="flex items-center">
      <!-- Left content (back arrow or hamburger) -->
      <span v-if="route.path.includes('/bill/')" @click="goBack" class="cursor-pointer text-2xl mr-2">&larr;</span>
      <span class="text-xl font-bold" v-if="route.path.includes('/bill/')">Details</span>
      <span class="text-xl font-bold" v-else>Bills</span>
    </div>

    <div v-if="route.path.includes('/bill/')" class="flex items-center">
      <!-- Right content (edit and delete buttons) -->
      <button @click="editBill" class="p-2">
        <!-- Edit icon (SVG) --> Edit
      </button>
      <button @click="deleteBill" class="p-2">
        <!-- Delete icon (SVG) --> Delete
      </button>
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
      this.$store.commit('toggleSidebar');
    }
  }
}
</script>