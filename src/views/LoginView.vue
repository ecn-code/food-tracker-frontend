<template>
  <div class="container-fluid d-flex flex-column min-vh-100 justify-content-center align-items-center">
    <form v-on:submit.prevent="login">
      <div class="form-outline mb-4">
        <input :disabled="loading" placeholder="Username" class="form-control" v-model="username" />
      </div>

      <div class="form-outline mb-4">
        <input :disabled="loading" placeholder="Password" type="password" class="form-control" v-model="password" />
      </div>

      <button :disabled="loading" v-if="isUsernameAndPasswordFilled" @click="login" type="submit" class="btn btn-primary btn-block w-100">{{ loginButtonText }}</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import LoginService from '../services/LoginService';
import router from '../router';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const { setUser } = userStore;

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
  router.push({name: 'home'});
};
const error = (data) => {
  console.error(data);
  alert('Login failed');
  loading.value = false;
};

const isUsernameAndPasswordFilled = computed(() => {
  return username.value != '' && password.value != '';
});
</script>

<style></style>
