<template>
    <LayoutBase>
        <template v-slot:content>
            <TableComponent v-model:loading="loading" v-model:reload="reload" v-model:item="editingMenu"
                v-model:validationMessage="validationMessage" v-model:saving="saving"
                :emptyItem="{ id: null, products: [], nutritional_value: [], username: null, date: null }"
                :headers="headers" :service="menuService" :sort-by="[{ key: 'name', order: 'asc' }]" id-name="id"
                :can-duplicate="true" title="Menus" @on-add="add" @on-edit="edit" @on-duplicate="edit"
                @before-save="save" @on-close="close" @before-remove="remove" :params="params" @on-reset="reset"
                :slot-cells="['item.nutritional_value', 'item.products']">

                <template v-slot:toolbar>
                    <v-fade-transition>
                        <v-btn @click="reload = true" :disabled="loading" icon="mdi-reload"></v-btn>
                    </v-fade-transition>
                    <v-select :clearable="true" @update:modelValue="updateUser" class="mt-5" v-model="username"
                        :items="users" :disabled="loading" item-title="username" item-value="username" label="User"
                        style="max-width: 200px"></v-select>
                    <v-text-field @update:modelValue="updateWeekYear" class="mt-5" v-model="weekYear" type="week"
                        :disabled="loading" label="Date" style="max-width: 200px"></v-text-field>
                    <v-dialog @click:outside="closeBlockMenu" v-model="dialogBlockMenu" max-width="350px">
                        <template v-slot:activator="{ props }">
                            <v-btn :disabled="loading" color="primary" dark class="mb-2" @click="openBlockMenu">
                                Lock
                            </v-btn>
                        </template>
                        <v-form v-model="form" @submit.prevent="blockMenu">
                            <v-card>
                                <v-card-title>
                                    <span class="text-h5">Lock</span>
                                </v-card-title>

                                <v-card-text>
                                    <v-container>
                                        <v-row>
                                            <v-col cols="12">
                                                <v-text-field :rules="[rules.required]" v-model="date"
                                                    :disabled="saving" tabindex="2" type="week"
                                                    label="Date"></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-card-text>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn tabindex="12" :disabled="saving" color="blue-darken-1" variant="text"
                                        @click="closeBlockMenu">
                                        Cancel
                                    </v-btn>
                                    <v-btn tabindex="13" :disabled="!form || saving" color="blue-darken-1"
                                        variant="text" type="submit">
                                        Apply
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-form>
                    </v-dialog>
                </template>

                <template v-slot:item.nutritional_value="{ item }">
                    <v-chip v-for="nv in item.nutritional_value" size="x-small" color="primary">
                        {{ columnNutritionalValue(nv) }}
                    </v-chip>
                </template>
                <template v-slot:item.products="{ item }">
                    <v-chip v-if="Array.isArray(item.products)" v-for="p in item.products" size="x-small"
                        color="primary">
                        {{ columnProducts(p) }}
                    </v-chip>
                    <div class="d-inline" v-if="!Array.isArray(item.products)" v-for="ps in item.products">
                        <v-chip v-for="p in ps" size="x-small" color="primary">
                            {{ columnProducts(p) }}
                        </v-chip>
                    </div>
                </template>

                <template v-slot:form>
                    <v-card-text>
                        <v-container>
                            <v-skeleton-loader :loading="!settingsFinished" type="card">
                                <v-row v-show="settingsFinished">
                                    <v-col cols="6">
                                        <v-text-field :rules="[rules.required]" v-model="editingMenu.date"
                                            :disabled="saving" tabindex="2" type="date" label="Date"></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-select :rules="[rules.required]" v-model="editingMenu.username"
                                            :items="users" :disabled="saving" item-title="username"
                                            item-value="username" tabindex="3" label="User"></v-select>
                                    </v-col>
                                    <v-tabs v-if="partsOfDay.length > 0 && !Array.isArray(selectedProducts)"
                                        v-for="partOfDay in partsOfDay" v-model="tab" color="deep-purple-accent-4"
                                        align-tabs="center">
                                        <v-tab :value="partOfDay">{{ partOfDay }}</v-tab>
                                    </v-tabs>
                                    <v-col v-if="partsOfDay.length > 0 && !Array.isArray(selectedProducts)" cols="12">
                                        <v-window v-model="tab">
                                            <v-window-item v-for="partOfDay in partsOfDay" :value="partOfDay">

                                                <v-col cols="11">
                                                    <v-combobox @update:model-value="selectedProductsChanged" :closable-chips="true" :chips="true" v-model="selectedProducts[partOfDay]" :items="products"
                                                        :disabled="saving" item-title="name" :return-object="true"
                                                        itabindex="3" multiple label="Products"></v-combobox>
                                                </v-col>
                                                <v-divider></v-divider>
                                                <v-col cols="12" v-for="product in selectedProducts[partOfDay]">
                                                    <v-text-field :rules="[rules.required]" v-model="product.name"
                                                        :disabled="true" label="Name"></v-text-field>
                                                    <v-text-field type="number" :rules="[rules.required]"
                                                        v-model="product.value" :disabled="saving"
                                                        :suffix="getSuffix(product)" label="Value"></v-text-field>
                                                </v-col>
                                            </v-window-item>
                                        </v-window>
                                    </v-col>
                                </v-row>
                            </v-skeleton-loader>
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
import TableComponent from '../components/TableComponent.vue';
import { ref, onMounted, nextTick } from 'vue';
import MenuService from '../services/MenuService';
import UserService from '../services/UserService';
import ProductService from '../services/ProductService';
import SettingService from '../services/SettingService';

const menuService = new MenuService;
const userService = new UserService;
const productService = new ProductService;
const settingService = new SettingService;

const rules = {
    required: value => !!value || 'Field is required',
};
const headers = [
    { title: 'User', key: 'username' },
    { title: 'Date', key: 'date' },
    { title: 'Products', key: 'products' },
    { title: 'Nutritional', key: 'nutritional_value' },
    { title: 'Actions', key: 'actions', sortable: false },
];
const columnNutritionalValue = nv => `${nv.name}=${nv.value}${nv.unit}`;
const columnProducts = p => `${p.name}=${p.value}${getSuffix(p)}`;
const getUsers = async () => {
    const response = await userService.get();
    if (response.isOk) {
        users.value = response.data;
    } else {
        console.error('Error retrieving users');
    }
};
const getProducts = async () => {
    products.value = [];
    const productParams = {
        'items_per_page': 40
    };
    
    let response = null;
    do {
        response = await productService.get(productParams);
        if (response.isOk) {
            if(response.data.last_evaluated_key) {
                productParams['last_evaluated_key'] = JSON.stringify(response.data.last_evaluated_key);
            } else {
                delete productParams['last_evaluated_key'];
            }
            products.value.push(...response.data.items);
        } else {
            console.error('Error retrieving products');
        }
    } while(response.isOk && productParams['last_evaluated_key']);
};

const getSettings = async () => {
    const response = await settingService.get('settings_v1');

    if (response.isOk) {
        partsOfDay.value = response.data.partsOfDay.split(',');
        selectedProducts.value = {};
    } else {
        console.error('Error retrieving settings');
    }

    settingsFinished.value = true;
};

onMounted(() => {
    getUsers();
    getProducts();
    getSettings();
});

const editingMenu = ref({});
const saving = ref(false);
const validationMessage = ref(null);
const users = ref([]);
const date = ref(null);
const dialogBlockMenu = ref(false);
const form = ref(false);
const reload = ref(false);
const loading = ref(false);
const weekYear = ref(null);
const params = ref({});
const username = ref(null);
const partsOfDay = ref([]);
const tab = ref(null);
const settingsFinished = ref(false);

const selectedProducts = ref([]);
const products = ref([]);

const add = () => {
    if (partsOfDay.value.length > 0) {
        selectedProducts.value = {};
    } else {
        selectedProducts.value = [];
    }
};

const edit = () => {
    if (!Array.isArray(editingMenu.value.products) || !Array.isArray(selectedProducts.value)) {
        selectedProducts.value = {};
        Object.keys(editingMenu.value.products).forEach(partOfDay => {
            selectedProducts.value[partOfDay] = editingMenu.value.products[partOfDay].map(p => Object.assign({}, p));
        });
        Object.keys(selectedProducts.value).forEach(partOfDay => {
            selectedProducts.value[partOfDay].forEach(p => {
                products.value.filter(p2 => p2.name == p.name).forEach(p2 => {
                    p2.value = p.value;
                });
            });
        });
    } else {
        selectedProducts.value = [];
        selectedProducts.value = editingMenu.value.products.map(p => Object.assign({}, p));
        selectedProducts.value.forEach(p => {
            products.value.filter(p2 => p2.name == p.name).forEach(p2 => {
                p2.value = p.value;
            });
        });
    }
};

const save = () => {
    fillMenuId();

    if (!Array.isArray(editingMenu.value.products) || !Array.isArray(selectedProducts.value)) {
        editingMenu.value.products = {};

        Object.keys(selectedProducts.value).forEach(partOfDay => {

            editingMenu.value.products[partOfDay] = selectedProducts.value[partOfDay].map(p => {
                return {
                    name: p.name,
                    value: p.value,
                    recipe_name: p.recipe_name
                }
            });
        });
    } else {
        editingMenu.value.products = selectedProducts.value.map(p => {
            return {
                name: p.name,
                value: p.value,
                recipe_name: p.recipe_name
            }
        });
    }
};

const close = () => {
    products.value.forEach(p => {
        delete p.value;
    });
    selectedProducts.value = [];
}

const remove = () => {
    fillMenuId();
};

const fillMenuId = () => {
    editingMenu.value.id = (editingMenu.value.username ? editingMenu.value.username : '') + '|' + editingMenu.value.date;
};

const openBlockMenu = () => {
    dialogBlockMenu.value = true;
    date.value = null;
};

const blockMenu = async () => {
    saving.value = true;
    const response = await menuService.lock(date.value);
    if (response.isOk) {
        dialogBlockMenu.value = false;
        reload.value = true;
    }
    saving.value = false;
};

const closeBlockMenu = () => {
    dialogBlockMenu.value = false;
};

const updateWeekYear = weekYearUpdated => {
    weekYear.value = weekYearUpdated;
    params.value['year_week'] = weekYearUpdated;
    reload.value = true;
};

const updateUser = userUpdated => {
    username.value = userUpdated;
    params.value['username'] = userUpdated ? userUpdated : '';
    reload.value = true;
};

const reset = () => {
    params.value['year_week'] = '';
    weekYear.value = null;

    username.value = null;
    params.value['username'] = '';

    reload.value = true;
};

const getSuffix = product => {
    if (product.recipe_name) {
        return product.value > 1 ? 'portions' : 'portion';
    }

    return 'gr';
};

const selectedProductsChanged = value => {
    const index = value.findIndex(v => typeof v === 'string');
    if(index != -1) {
        const text = value[index];
        nextTick(() => {
            Object.keys(selectedProducts.value).forEach(
                partOfDay => selectedProducts.value[partOfDay] = selectedProducts.value[partOfDay].filter(product => product !== text)
            );
        });
    }
};
</script>