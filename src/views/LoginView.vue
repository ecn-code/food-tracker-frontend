<template>
  <v-container fluid class="fill-height">
    <v-row>
      <v-col>
        <v-card class="elevation-12">
          <v-toolbar dark color="primary">
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <form ref="form" @submit.prevent="login">
              <v-text-field :disabled="loading" v-model="username" name="username" label="Username" type="text" placeholder="username"
                required></v-text-field>

              <v-text-field :disabled="loading" v-model="password" name="password" label="Password" type="password" placeholder="password"
                required></v-text-field>
              <v-btn :disabled="loading" v-if="isUsernameAndPasswordFilled" type="submit" class="mt-4" color="primary" value="log in">{{ loginButtonText }}</v-btn>
            </form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import LoginService from '../services/LoginService';
import router from '../router';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const { setUser, isAuth } = userStore;

const loginService = new LoginService;
const username = ref('');
const password = ref('');
const loading = ref(false);

const loginButtonText = computed(() => {
  return loading.value ? 'loading...' : 'Login'
});

const login = async () => {
  loading.value = true;
  const response = await loginService.login(username.value, password.value);
  if (response.isOk) {
    success(response.data);
  } else {
    error(response.data);
  }
}

const success = (data) => {
  loading.value = false;
  setUser({
    token: data.token,
    username: username.value
  });
  router.push({ name: 'home' });
};
const error = (data) => {
  console.error(data);
  alert('Login failed');
  loading.value = false;
};

const isUsernameAndPasswordFilled = computed(() => {
  return username.value != '' && password.value != '';
});

if (isAuth) {
  router.push({ name: 'home' });
}
</script>

<style></style>
