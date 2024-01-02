import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const STORE_NAME = 'user_store';
  const EMPTY_USER = { token: '' };

  const user = ref(JSON.parse(localStorage.getItem(STORE_NAME) || JSON.stringify(EMPTY_USER)));
  const isAuth = computed(() => user.value.token != '');
  const setUser = (newUser) => {
    user.value = newUser;
    localStorage.setItem(STORE_NAME, JSON.stringify(user.value));
  };
  const logout = () => {
    localStorage.removeItem(STORE_NAME);
    user.value = EMPTY_USER;
  };

  return { user, isAuth, setUser, logout }
})
