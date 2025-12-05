import { defineStore } from "pinia";
import { supabase } from "../supabaseClient";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      this.user = user;
    },
    async signInWithGoogle() {
      this.loading = true;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      this.loading = false;
      if (error) {
        console.error(error);
      }
    },
    async signOut() {
      await supabase.auth.signOut();
      this.user = null;
    },
  },
});
