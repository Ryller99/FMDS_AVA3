<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6" elevation="3">
          <v-card-title class="text-h5 font-weight-bold text-center mb-4">
            Empréstimos para Amigos
          </v-card-title>

          <v-card-text class="text-center">
            <p class="mb-6">
              Faça login com sua conta Google para organizar tudo que você já
              emprestou pros amigos. 😄
            </p>

            <v-btn
              color="primary"
              block
              :loading="auth.loading"
              @click="login"
            >
              <v-icon start>mdi-google</v-icon>
              Entrar com Google
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();

const login = async () => {
  await auth.signInWithGoogle();
};
</script>