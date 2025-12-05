<template>
  <div class="page-bg">
    <v-container class="py-8" style="max-width: 900px">

      <!-- Botão Sair (topo direito) -->
      <div class="d-flex justify-end mb-4">
        <v-btn color="red" variant="tonal" @click="logout">
          <v-icon start>mdi-logout</v-icon>
          Sair
        </v-btn>
      </div>

      <!-- Header -->
      <div class="text-center mb-8">
        <v-avatar size="64" class="mb-4" color="orange-lighten-4">
          <v-icon size="36" color="orange">mdi-hand-heart</v-icon>
        </v-avatar>
        <h1 class="text-h4 font-weight-bold text-orange">
          Empréstimos para Amigos
        </h1>
        <p class="text-body-1 text-grey-darken-1 mt-2">
          Gerencie tudo que você emprestou e nunca mais esqueça quem está te devendo! 🧾
        </p>
      </div>

      <!-- Cards de resumo -->
      <v-row class="mb-6" dense>
        <v-col cols="12" sm="4">
          <v-card class="pa-4" elevation="1">
            <div class="text-caption text-grey-darken-1 mb-1">Pendentes</div>
            <div class="text-h5 font-weight-bold">
              {{ loansStore.countPending }}
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="4">
          <v-card class="pa-4" elevation="1">
            <div class="text-caption text-grey-darken-1 mb-1">Devolvidos</div>
            <div class="text-h5 font-weight-bold">
              {{ loansStore.countReturned }}
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="4">
          <v-card class="pa-4" elevation="1">
            <div class="text-caption text-grey-darken-1 mb-1">Valor pendente</div>
            <div class="text-h5 font-weight-bold">
              R$ {{ loansStore.totalPendingAmount.toFixed(2) }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Botão adicionar -->
      <div class="text-center mb-4">
        <v-btn color="orange" class="px-6" @click="openForm()">
          <v-icon start>mdi-plus</v-icon>
          Adicionar empréstimo
        </v-btn>
      </div>

      <!-- Filtros -->
      <div class="d-flex justify-center mb-4">
        <v-btn-toggle
          v-model="filter"
          mandatory
          rounded="xl"
          color="orange"
          density="comfortable"
        >
          <v-btn value="all">Todos</v-btn>
          <v-btn value="pending">Pendentes</v-btn>
          <v-btn value="returned">Devolvidos</v-btn>
        </v-btn-toggle>
      </div>

      <!-- Lista -->
      <v-skeleton-loader
        v-if="loansStore.loading"
        type="list-item-two-line"
        class="mt-4"
        :loading="loansStore.loading"
      />

      <div v-else>
        <v-alert
          v-if="loansStore.error"
          type="error"
          class="mb-4"
          dense
          border="start"
        >
          {{ loansStore.error }}
        </v-alert>

        <v-alert
          v-if="loansStore.filteredLoans.length === 0"
          type="info"
          variant="outlined"
          class="mb-2"
        >
          Nenhum empréstimo encontrado. Que tal adicionar o primeiro? 😄
        </v-alert>

        <v-card
          v-for="loan in loansStore.filteredLoans"
          :key="loan.id"
          class="mb-3 px-4 py-3"
          :elevation="1"
        >
          <div class="d-flex justify-space-between align-start">
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ loan.friend_name }}
              </div>
              <div class="text-body-2 text-grey-darken-1">
                {{ loan.description }}
              </div>

              <!-- Categoria + valor com ajuste -->
              <div class="d-flex align-center mt-2" style="gap: 8px">

                <!-- CATEGORIA -->
                <v-chip
                  v-if="categoryName(loan.category_id)"
                  class="chip-big"
                  color="orange-lighten-4"
                  label
                >
                  {{ categoryName(loan.category_id) }}
                </v-chip>

                <!-- VALOR -->
                <v-chip
                  v-if="loan.amount"
                  class="chip-big"
                  color="green-lighten-5"
                  label
                >
                  R$ {{ Number(loan.amount).toFixed(2) }}
                </v-chip>

                <!-- DATA -->
                <span
                  v-if="loan.due_date"
                  class="text-caption text-grey-darken-1"
                  style="font-size: 13px"
                >
                  {{ formatDate(loan.due_date) }}
                </span>
              </div>
            </div>

            <div class="d-flex flex-column align-end" style="gap: 4px">
              <v-btn
                size="small"
                color="green"
                variant="tonal"
                v-if="isPending(loan)"
                @click="markReturned(loan)"
              >
                Marcar devolvido
              </v-btn>

              <v-btn
                size="small"
                color="orange"
                variant="tonal"
                v-else
                @click="markPending(loan)"
              >
                Marcar pendente
              </v-btn>

              <div class="d-flex mt-1">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  @click="openForm(loan)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  color="red"
                  @click="removeLoan(loan.id)"
                />
              </div>
            </div>
          </div>
        </v-card>
      </div>

      <!-- Dialog formulário -->
      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-card-title class="font-weight-bold">
            {{ editedLoan ? "Editar empréstimo" : "Novo empréstimo" }}
          </v-card-title>
          <v-card-text>
            <v-form ref="formRef" @submit.prevent="saveLoan">
              <v-text-field
                v-model="form.friend_name"
                label="Nome do amigo"
                required
                density="compact"
                class="mb-3"
              />
              <v-text-field
                v-model="form.description"
                label="Descrição"
                required
                density="compact"
                class="mb-3"
              />
              <v-text-field
                v-model.number="form.amount"
                label="Valor (opcional)"
                density="compact"
                type="number"
                class="mb-3"
              />
              <v-select
                v-model="form.category_id"
                :items="categoryItems"
                item-title="name"
                item-value="id"
                label="Categoria"
                required
                density="compact"
                class="mb-3"
              />
              <v-select
                v-model="form.status_id"
                :items="statusItems"
                item-title="name"
                item-value="id"
                label="Status"
                required
                density="compact"
                class="mb-3"
              />
              <v-text-field
                v-model="form.due_date"
                label="Data combinada (opcional)"
                type="date"
                density="compact"
                class="mb-1"
              />
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
            <v-btn color="orange" @click="saveLoan">Salvar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed, watch } from "vue";
import { useLoansStore } from "../stores/loans";

const loansStore = useLoansStore();

const dialog = ref(false);
const editedLoan = ref(null);
const formRef = ref(null);

const form = reactive({
  friend_name: "",
  description: "",
  amount: null,
  category_id: null,
  status_id: null,
  due_date: null,
});

const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

const filter = ref("all");

watch(filter, (val) => {
  loansStore.setFilter(val);
});

const categoryItems = computed(() => loansStore.categories);
const statusItems = computed(() => loansStore.statuses);

const categoryName = (id) => {
  const c = loansStore.categories.find((cat) => cat.id === id);
  return c?.name || "";
};

const statusByName = (name) =>
  loansStore.statuses.find((s) => s.name === name);

const isPending = (loan) => {
  const pending = statusByName("pendente");
  return pending && loan.status_id === pending.id;
};

const markReturned = async (loan) => {
  const returned = statusByName("devolvido");
  if (!returned) return;
  await loansStore.updateLoan(loan.id, {
    ...loan,
    status_id: returned.id,
  });
};

const markPending = async (loan) => {
  const pending = statusByName("pendente");
  if (!pending) return;
  await loansStore.updateLoan(loan.id, {
    ...loan,
    status_id: pending.id,
  });
};

const openForm = (loan = null) => {
  editedLoan.value = loan;
  if (loan) {
    Object.assign(form, {
      friend_name: loan.friend_name,
      description: loan.description,
      amount: loan.amount,
      category_id: loan.category_id,
      status_id: loan.status_id,
      due_date: loan.due_date,
    });
  } else {
    Object.assign(form, {
      friend_name: "",
      description: "",
      amount: null,
      category_id: null,
      status_id: null,
      due_date: null,
    });
  }
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
};

const saveLoan = async () => {
  const payload = { ...form };
  if (editedLoan.value) {
    await loansStore.updateLoan(editedLoan.value.id, payload);
  } else {
    await loansStore.createLoan(payload);
  }
  dialog.value = false;
};

const removeLoan = async (id) => {
  if (confirm("Tem certeza que deseja excluir este empréstimo?")) {
    await loansStore.deleteLoan(id);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR");
};

onMounted(async () => {
  await loansStore.loadMeta();
  await loansStore.loadLoans();
  loansStore.setFilter("all");
});
</script>

<style scoped>
.page-bg {
  background: #ffe8cf;
  min-height: 100vh;
}

.text-orange {
  color: #ff9800;
}

/* Chips maiores, pretos e em negrito */
.chip-big {
  font-size: 15px !important;
  font-weight: 700 !important;
  color: #000 !important;
  padding: 6px 10px !important;
}
</style>
