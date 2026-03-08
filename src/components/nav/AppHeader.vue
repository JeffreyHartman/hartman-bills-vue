<template>
  <header class="sticky top-0 z-30 bg-white/80 dark:bg-surface-950/80 backdrop-blur-lg border-b border-surface-100 dark:border-surface-800">
    <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
      <!-- Left: Back or Title -->
      <div class="flex items-center gap-3">
        <button
          v-if="showBack"
          @click="goBack"
          class="p-1.5 -ml-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold tracking-tight">{{ pageTitle }}</h1>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-1">
        <button
          @click="toggleDark"
          class="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          :aria-label="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg v-if="!darkMode" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        </button>
        <button
          @click="logout"
          class="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Sign out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'AppHeader',
  computed: {
    ...mapState(['darkMode']),
    showBack() {
      return this.$route.name !== 'bills';
    },
    pageTitle() {
      const titles = {
        'bills': 'Coffer',
        'bill-details': 'Details',
        'bill-edit': 'Edit Bill',
        'bill-add': 'New Bill',
      };
      return titles[this.$route.name] || 'Coffer';
    }
  },
  methods: {
    goBack() {
      this.$router.back();
    },
    toggleDark() {
      this.$store.commit('toggleDarkMode');
    },
    async logout() {
      try {
        await this.$store.dispatch('logout');
        this.$router.push({ name: 'login' });
      } catch (err) {
        console.error('Logout failed:', err);
        window.alert('Failed to sign out. Please try again.');
      }
    }
  }
};
</script>
