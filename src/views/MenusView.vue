<template>
    <LayoutBase>
        <template v-slot:content>
            <TableComponent v-model:item="editingMenu" v-model:validationMessage="validationMessage"
                v-model:saving="saving" :emptyItem="{ id: null, recipes: [], nutritional_value: [], username: null, date: null }"
                :headers="headers" :service="menuService" :sort-by="[{ key: 'name', order: 'asc' }]" id-name="id" :can-duplicate="true"
                title="Menus" @on-edit="edit" @before-save="save" @on-close="close" @before-remove="remove" :slot-cells="['item.nutritional_value']">

                <template v-slot:item.nutritional_value="{ item }">
                    <v-chip v-for="nv in item.nutritional_value" size="x-small" color="primary">
                        {{ columnNutritionalValue(nv) }}
                    </v-chip>
                </template>

                <template v-slot:form>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field :rules="[rules.required]" v-model="editingMenu.date" :disabled="saving"
                                        tabindex="2" type="date" label="Date"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-select v-model="editingMenu.username"
                                        :items="users" :disabled="saving" item-title="username" item-value="username" tabindex="3"
                                        label="User"></v-select>
                                </v-col>
                                <v-col cols="12">
                                    <v-select v-model="editingMenu.recipes" 
                                        :items="recipes" :disabled="saving" item-title="name" item-value="name" tabindex="3"
                                        multiple label="Recipes"></v-select>
                                </v-col>
                            </v-row>
                        </v-container>
                        <v-alert v-if="validationMessage != null" :text="validationMessage" type="error"
                            variant="tonal"></v-alert>
                    </v-card-text>
                </template>
            </TableComponent>
        </template>
    </LayoutBase>
</template>

<script setup>
import LayoutBase from '../layouts/LayoutBase.vue';
import RecipeService from '../services/RecipeService';
import TableComponent from '../components/TableComponent.vue';
import { ref, onMounted } from 'vue';
import MenuService from '../services/MenuService';
import UserService from '../services/UserService';

const recipeService = new RecipeService;
const menuService = new MenuService;
const userService = new UserService;
const rules = {
    required: value => !!value || 'Field is required',
};
const headers = [
    { title: 'User', key: 'username' },
    { title: 'Date', key: 'date' },
    { title: 'Recipes', key: 'recipes' },
    { title: 'Nutritional', key: 'nutritional_value' },
    { title: 'Actions', key: 'actions', sortable: false },
];
const columnNutritionalValue = nv => `${nv.name}=${nv.value}${nv.unit}`;
const getRecipes = async () => {
    const response = await recipeService.get();
    if (response.isOk) {
        recipes.value = response.data.items;
    } else {
        alert('Error retrieving recipes');
    }
};
const getUsers = async () => {
    const response = await userService.get();
    if (response.isOk) {
        users.value = response.data;
    } else {
        alert('Error retrieving users');
    }
};
onMounted(() => {
    getRecipes();
    getUsers();
});

const editingMenu = ref({});
const saving = ref(false);
const validationMessage = ref(null);
const recipes = ref([]);
const users = ref([]);

const edit = () => {
};

const save = () => {
    fillMenuId();
};

const close = () => {
}

const remove = () => {
    fillMenuId();
};

const fillMenuId = () => {
    editingMenu.value.id = (editingMenu.value.username ? editingMenu.value.username : '') + '|' + editingMenu.value.date;
};
</script>