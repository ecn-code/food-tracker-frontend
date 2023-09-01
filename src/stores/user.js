import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const STORE_NAME = 'user_store';

  const user = ref(JSON.parse(localStorage.getItem(STORE_NAME) || JSON.stringify({token: ''})));
  const isAuth = computed(() => user.value.token != '')
  const setUser = (newUser) => {
    user.value = newUser;
    localStorage.setItem(STORE_NAME, JSON.stringify(user.value));
  };
  const removeUser = () => {
    localStorage.removeItem(STORE_NAME);
  };

  return { user, isAuth, setUser, removeUser }
})
