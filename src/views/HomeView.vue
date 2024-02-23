<template>
  <LayoutBase>
    <template v-slot:content>
      <v-skeleton-loader :loading="loading" type="text, card, divider, card">
        <v-text-field @update:modelValue="updateWeekYear" v-model="weekYear" tabindex="2" type="week" :disabled="loading"
          label="Date"></v-text-field>
        <v-select @update:modelValue="updateUser" v-model="username" :items="users" :disabled="loading"
          item-title="username" item-value="username" tabindex="3" label="User"></v-select>

        <v-container fluid>
          <v-row class="flex-child text-subtitle-2">

            <v-col class="d-flex" cols="12">
              <v-row class="ma-n3">

                <v-col cols="12" md="4" sm="6" v-for="menu in weeklyMenu.menus">
                  <v-card class="mx-auto" max-width="400">
                    <v-toolbar flat color="blue-lighten-4" dark>
                      <v-toolbar-title>{{ getDayOfWeek(menu.date) }} ({{ menu.date }})
                      </v-toolbar-title>
                    </v-toolbar>

                    <v-card-text>
                      <v-col v-if="!Array.isArray(menu.recipes) && !Array.isArray(menu.products)" cols="12"
                        v-for="part_of_day in ['Desayuno', 'Comida', 'Cena']">
                        <h5>{{ part_of_day }}</h5>
                        <v-divider></v-divider>
                        <ul class="px-4">
                          <li v-for="recipe in ['Receta 1', 'Receta 2']">
                            <h6>{{ recipe }}</h6>
                          </li>
                        </ul>
                      </v-col>
                      <div v-if="Array.isArray(menu.recipes) && Array.isArray(menu.products)">
                        <h3>Menu</h3>
                        <ul class="px-4">
                          <li v-for="recipe in menu.recipes">
                            <h4>{{ recipe }}</h4>
                          </li>
                          <li v-for="product in menu.products">
                            <h4>{{ product.name }} ({{ product.value }}{{ getSuffix(product) }})</h4>
                          </li>
                        </ul>
                      </div>
                    </v-card-text>

                    <div class="mx-2 mb-2">
                      <v-chip class="mb-1 mr-1" size="small" v-for="nutritional_value in menu.nutritional_value">
                        {{ nutritional_value.name }}={{ nutritional_value.value }}{{ nutritional_value.unit }}
                      </v-chip>
                    </div>
                  </v-card>
                </v-col>

                <v-divider></v-divider>

                <v-col cols="4" v-for="nutritional_value in weeklyMenu.nutritional_value">
                  <v-card class="mx-auto" max-width="400">
                    <v-toolbar flat color="deep-purple-accent-4" dark>
                      <v-toolbar-title>{{ nutritional_value.name }}</v-toolbar-title>
                    </v-toolbar>

                    <v-card-text>
                      Total:
                      <h2 class="text-h6 mb-2 text-right">
                        {{ twoDecimals(nutritional_value.value) }} {{ nutritional_value.unit }}
                      </h2>
                      AVG:
                      <h2 class="text-h6 mb-2 text-right">
                        {{ twoDecimals(getAvg(nutritional_value.value)) }} {{ nutritional_value.unit }}
                      </h2>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>

          </v-row>
        </v-container>
      </v-skeleton-loader>
    </template>
  </LayoutBase>
</template>

<script setup>
import LayoutBase from '../layouts/LayoutBase.vue';
import { ref, onMounted } from 'vue';
import WeeklyMenuService from '../services/WeeklyMenuService';
import UserService from '../services/UserService';
import { useUserStore } from "../stores/user";
import { storeToRefs } from 'pinia';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const weekYear = ref(new Date().getYearWeek());
const weeklyMenu = ref({});
const loading = ref(true);
const users = ref([]);
const username = ref(null);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const weeklyMenuService = new WeeklyMenuService;
const userService = new UserService;

const getWeeklyMenu = async () => {
  loading.value = true;
  const response = await weeklyMenuService.get({
    username: username.value,
    year_week: weekYear.value
  });
  if (response.isOk) {
    const data = response.data;
    const menusSort = Object.keys(data.menus).sort();
    const menus = {};
    menusSort.forEach(key => menus[key] = data.menus[key]);
    data.menus = menus;
    weeklyMenu.value = data;
  } else {
    console.error('Error retrieving weekly menu');
  }
  loading.value = false;
};
const getUsers = async () => {
  const response = await userService.get();
  if (response.isOk) {
    users.value = response.data;
  } else {
    console.error('Error retrieving users');
  }
};
onMounted(() => {
  username.value = user.value.username;
  getWeeklyMenu();
  getUsers();
});

const getDayOfWeek = (dayStr) => {
  return daysOfWeek[new Date(dayStr).getDay()];
};

const getAvg = (value) => {
  return value / Object.keys(weeklyMenu.value.menus).length;
};

const twoDecimals = (value) => {
  return parseFloat(value).toFixed(2);
};

const updateWeekYear = weekYearUpdated => {
  weekYear.value = weekYearUpdated;
  getWeeklyMenu();
};

const updateUser = userUpdated => {
  username.value = userUpdated;
  getWeeklyMenu();
};

const getSuffix = product => {
  if(product.recipe_name) {
    return product.value > 1 ? 'portions' : 'portion';
  }
  
  return 'gr';
};
</script>