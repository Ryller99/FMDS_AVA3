import { defineStore } from "pinia";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useLoansStore = defineStore("loans", {
  state: () => ({
    loans: [],
    categories: [],
    statuses: [],
    loading: false,
    error: null,
    filter: "all", // all | pending | returned
  }),

  getters: {
    filteredLoans(state) {
      if (state.filter === "pending") {
        const pendingStatus = state.statuses.find((s) => s.name === "pendente");
        if (!pendingStatus) return state.loans;

        return state.loans.filter((l) => l.status_id === pendingStatus.id);
      }

      if (state.filter === "returned") {
        const returnedStatus = state.statuses.find(
          (s) => s.name === "devolvido"
        );
        if (!returnedStatus) return state.loans;

        return state.loans.filter((l) => l.status_id === returnedStatus.id);
      }

      return state.loans;
    },

    totalPendingAmount(state) {
      const pendingStatus = state.statuses.find((s) => s.name === "pendente");
      if (!pendingStatus) return 0;

      return state.loans
        .filter((l) => l.status_id === pendingStatus.id && l.amount)
        .reduce((sum, l) => sum + Number(l.amount), 0);
    },

    countPending(state) {
      const pendingStatus = state.statuses.find((s) => s.name === "pendente");
      if (!pendingStatus) return 0;

      return state.loans.filter((l) => l.status_id === pendingStatus.id).length;
    },

    countReturned(state) {
      const returnedStatus = state.statuses.find(
        (s) => s.name === "devolvido"
      );
      if (!returnedStatus) return 0;

      return state.loans.filter((l) => l.status_id === returnedStatus.id)
        .length;
    },
  },

  actions: {
    setFilter(filter) {
      this.filter = filter;
    },

    async loadMeta() {
      this.loading = true;
      this.error = null;

      try {
        const [catRes, statRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/statuses`),
        ]);

        this.categories = await catRes.json();
        this.statuses = await statRes.json();
      } catch (err) {
        console.error(err);
        this.error = "Erro ao carregar dados.";
      } finally {
        this.loading = false;
      }
    },

    async loadLoans() {
      this.loading = true;
      this.error = null;

      try {
        const res = await fetch(`${API_BASE_URL}/loans`);
        this.loans = await res.json();
      } catch (err) {
        console.error(err);
        this.error = "Erro ao carregar empréstimos.";
      } finally {
        this.loading = false;
      }
    },

    async createLoan(payload) {
      const res = await fetch(`${API_BASE_URL}/loans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao criar empréstimo");

      const loan = await res.json();
      this.loans.unshift(loan);
    },

    async updateLoan(id, payload) {
      const res = await fetch(`${API_BASE_URL}/loans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao atualizar empréstimo");

      const updated = await res.json();

      const idx = this.loans.findIndex((l) => l.id === id);
      if (idx !== -1) this.loans[idx] = updated;
    },

    async deleteLoan(id) {
      const res = await fetch(`${API_BASE_URL}/loans/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao excluir empréstimo");

      this.loans = this.loans.filter((l) => l.id !== id);
    },
  },
});