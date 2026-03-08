<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-200">
    <app-header v-if="isAuthenticated" />
    <main :class="isAuthenticated ? 'max-w-2xl mx-auto px-4 pb-24' : ''">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- FAB: Add Bill -->
    <router-link
      v-if="isAuthenticated && $route.name === 'bills'"
      :to="{ name: 'bill-add' }"
      class="fixed bottom-6 right-6 w-14 h-14 bg-accent hover:bg-accent-light text-white
             rounded-2xl shadow-elevated hover:shadow-lg flex items-center justify-center
             transition-all duration-200 active:scale-95 z-40"
      aria-label="Add new bill"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </router-link>
  </div>
</template>

<script>
import AppHeader from '@/components/nav/AppHeader.vue';
import { supabase, signalAuthReady } from '@/lib/supabase.js';

export default {
  name: 'App',
  components: { AppHeader },
  computed: {
    isAuthenticated() {
      return !!this.$store.state.user;
    }
  },
  created() {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const previousUserId = this.$store.state.user?.id ?? null;
      const nextUserId = session?.user?.id ?? null;

      this.$store.commit('setUser', session?.user || null);
      signalAuthReady();

      // IMPORTANT: Do NOT await fetchBills here. The Supabase auth client awaits
      // this callback inside _notifyAllSubscribers, which runs inside _initialize().
      // If fetchBills awaits getSession() (via _getAccessToken), it deadlocks because
      // getSession() waits for initializePromise, which is blocked on _initialize().
      // Using nextTick + fire-and-forget breaks the synchronous chain.
      if (nextUserId && nextUserId !== previousUserId) {
        this.$nextTick(() => {
          this.$store.dispatch('fetchBills').catch(err => {
            console.error('Failed to fetch bills after auth change:', err);
          });
        });
      }
      if (!session && this.$route.name !== 'login') {
        this.$router.push({ name: 'login' });
      }
    });
    this.authSubscription = subscription;
  },
  beforeUnmount() {
    this.authSubscription?.unsubscribe();
  }
};
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
