<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-surface-50 dark:bg-surface-950">
    <div class="card p-8 w-full max-w-sm">
      <h1 class="text-2xl font-bold text-center mb-6">Coffer</h1>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="email" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="input-field"
            placeholder="you@example.com"
            required
          >
        </div>

        <div>
          <label for="password" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="input-field"
            placeholder="••••••••"
            required
            minlength="6"
          >
        </div>

        <p v-if="error" class="text-sm text-status-overdue">{{ error }}</p>

        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In') }}
        </button>
      </form>

      <button
        @click="isSignUp = !isSignUp"
        class="w-full text-sm text-surface-500 hover:text-accent mt-4 transition-colors"
      >
        {{ isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up' }}
      </button>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase.js';

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      isSignUp: false,
      loading: false,
      error: null,
    };
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      this.error = null;

      const { data, error } = this.isSignUp
        ? await supabase.auth.signUp({ email: this.email, password: this.password })
        : await supabase.auth.signInWithPassword({ email: this.email, password: this.password });

      this.loading = false;

      if (error) {
        this.error = error.message;
        return;
      }

      if (this.isSignUp) {
        this.isSignUp = false;
        if (!data.session) {
          this.error = 'Account created. Confirm your email, then sign in.';
          return;
        }
      }

      this.$router.push({ name: 'bills' });
    }
  }
};
</script>
