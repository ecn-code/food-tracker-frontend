import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import MenusView from '../views/MenusView.vue';
import NutritionalValuesView from '../views/NutritionalValuesView.vue';
import ProductsView from '../views/ProductsView.vue';
import RecipesView from '../views/RecipesView.vue';
import UnitsView from '../views/UnitsView.vue';

import { useUserStore } from '../stores/user';
import { storeToRefs } from 'pinia';
import { useNavigationStore } from '../stores/navigation';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        requireAuth: false
      }
    },
    {
      path: '/units',
      name: 'units',
      component: UnitsView,
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/nutritional-values',
      name: 'nutritional-values',
      component: NutritionalValuesView,
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: RecipesView,
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/menus',
      name: 'menus',
      component: MenusView,
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'any',
      redirect: { name: 'login', params: {} }
    }
  ]
});

router.beforeEach((to, from, next) => {
  console.log('beforeEach', screen.width);

  const userStore = useUserStore();
  const { isAuth } = storeToRefs(userStore);

  const navigationStore = useNavigationStore();
  const { setNavigation } = navigationStore;
  const navigation = localStorage.getItem('navigation') ? JSON.parse(localStorage.getItem('navigation')) : null;

  if (from.name == 'login' && navigation && navigation.withoutAuth) {
    console.log(navigation.last.name)
    localStorage.setItem('navigation', JSON.stringify({ withoutAuth: false, last: to }));
    next({ name: navigation.last.name });
    return;
  }

  if (to.meta.requireAuth && !isAuth.value) {
    localStorage.setItem('navigation', JSON.stringify({ withoutAuth: true, last: to }))
    next({ name: 'login' });
  } else {
    setNavigation(from.name, to.name);
    next();
  }
});

export default router
