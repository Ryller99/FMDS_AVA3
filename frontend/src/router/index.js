import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/dashboard",
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Se não tem user carregado, tenta carregar antes de validar
  if (!authStore.user && to.path !== "/login") {
    await authStore.loadUser();
  }

  // Bloqueia rotas protegidas
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next("/login");
  }

  // Se já está logado, não deixa ir pro login
  if (to.path === "/login" && authStore.isAuthenticated) {
    return next("/dashboard");
  }

  next();
});

export default router;