<template>
    <LayoutBase>
        <template v-slot:content>
            <TableComponent v-model:loading="loading" v-model:reload="reload" v-model:item="editingRecipe" v-model:validationMessage="validationMessage"
                v-model:saving="saving" :emptyItem="{ products: [], nutritional_value: [], name: null, description: null }" :paginated="true"
                :headers="headers" :service="recipeService" :sort-by="[{ key: 'name', order: 'asc' }]" id-name="SK" :params="params"
                title="Recipes" @on-edit="edit" @before-save="save" @on-close="close" :slot-cells="['item.nutritional_value']" @after-get="afterGet">

                <template v-slot:item.nutritional_value="{ item }">
                    <v-chip v-for="nv in item.nutritional_value" size="x-small" color="primary">
                        {{ columnNutritionalValue(nv) }}
                    </v-chip>
                </template>

                <template v-slot:toolbar>
                    <v-fade-transition>
                        <v-btn @click="reload = true" :disabled="loading" icon="mdi-reload"></v-btn>
                    </v-fade-transition>
                    <v-text-field ref="searchField" lazy="true" :clearable="true" @update:modelValue="updateQuery" class="mt-5" v-model="query" type="text"
                        :disabled="loading" label="Search" style="max-width: 200px"></v-text-field>
                </template>

                <template v-slot:form>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field :rules="[rules.required]" v-model="editingRecipe.name" :disabled="saving"
                                        tabindex="2" label="Name"></v-text-field>
                                    <v-combobox :closable-chips="true" :chips="true" v-model="selectedProducts" @update:modelValue="selectProduct"
                                        :items="products" :disabled="saving" :item-props="productProps" tabindex="3"
                                        multiple label="Products"></v-combobox>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea v-model="editingRecipe.description" :disabled="saving" tabindex="2" label="Receta" variant="outlined"></v-textarea>
                                </v-col>
                                <v-divider></v-divider>
                                <v-col cols="12" v-for="product in editedProducts">
                                    <v-text-field :rules="[rules.required]" v-model="product[0]" :disabled="true"
                                        label="Name"></v-text-field>
                                    <v-text-field type="number" :rules="[rules.required]" v-model="product[2]" :disabled="saving"
                                        :suffix="product[1]" label="Value"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-container>
                        <v-alert v-if="validationMessage != null" :text="validationMessage" type="error"
                            variant="tonal"></v-alert>
                    </v-card-text>
                </template>
                <template v-slot:item_actions="{item}">
                    <v-icon class="me-2" size="small" @click="openDialogCreateProduct(item)">
                        mdi-apple
                    </v-icon>
                </template>
            </TableComponent>
        </template>
    </LayoutBase>
    <v-dialog @click:outside="closeDialogCreateProduct" transition="dialog-bottom-transition" v-model="dialogCreateProduct" max-width="500px">
        <v-card class="mx-auto">
            <v-card-title class="mx-auto text-h5">Create product</v-card-title>
            <v-card-subtitle>You are going to create a product from <b>'{{ recipeSelected }}'</b>
                (Portion of {{ recipeSelected }})</v-card-subtitle>
            <v-card-actions class="mx-auto">
                <v-form @submit.prevent="createProduct">
                    <v-text-field
                        autofocus
                        :disabled="saving"
                        v-model="portions"
                        label="Portions"
                        required
                        type="number"
                    ></v-text-field>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="saving" color="blue-darken-1" variant="text" @click="closeDialogCreateProduct">Cancel</v-btn>
                    <v-btn :disabled="saving" class="float-right" color="blue-darken-1" variant="text" type="submit">Create</v-btn>
                </v-form>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import LayoutBase from '../layouts/LayoutBase.vue';
import RecipeService from '../services/RecipeService';
import TableComponent from '../components/TableComponent.vue';
import { ref, onMounted, nextTick } from 'vue';
import ProductService from '../services/ProductService';

const recipeService = new RecipeService;
const productService = new ProductService;
const rules = {
    required: value => !!value || 'Field is required',
};
const headers = [
    { title: 'Name', key: 'name' },
    { title: 'Description', key: 'description' },
    { title: 'Nutritional', key: 'nutritional_value' },
    { title: 'Actions', key: 'actions', sortable: false },
];
const productProps = product => {
    if(!product || !product.name) {
        console.error('Error con producto que posiblemente fue eliminado y esta asociado');
        return;
    }

    return {
        title: product.name,
    };
};
const columnNutritionalValue = nv => `${nv.name}=${nv.value}${nv.unit}`;

const getProducts = async () => {
    products.value = [];
    const productParams = {
        'items_per_page': 40
    };
    
    let response = null;
    do {
        loading.value = true;
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

    loading.value = false;
};

onMounted(getProducts);

const editingRecipe = ref({});
const saving = ref(false);
const loading = ref(false);
const reload = ref(false);
const validationMessage = ref(null);
const products = ref([]);
const selectedProducts = ref([]);
const editedProducts = ref([]);
const dialogCreateProduct = ref(false);
const recipeSelected = ref(null);
const portions = ref(null);
const query = ref('');
const params = ref({
    'items_per_page': 40
});
let updateQueryTimeout = null;
const searchField = ref(null);

const selectProduct = currentSelectedProducts => {
    const selected = [];
    currentSelectedProducts.forEach(pSelected => {
        const product = editedProducts.value.filter(p => p[0] == pSelected.name);
        if (product.length == 0) {
            selected.push([pSelected.name, getSuffix(pSelected), 0]);
        } else {
            selected.push([product[0][0], product[0][1], product[0][2]]);
        }
    });
    editedProducts.value = selected;
};

const edit = () => {
    selectedProducts.value = editingRecipe.value.products
        .map(product => products.value.filter(p => p.name == product[0])[0]);
    editedProducts.value = editingRecipe.value.products
        .map(p => p);
};

const save = () => {
    editingRecipe.value.products = editedProducts.value;
};

const close = () => {
    editedProducts.value = [];
    selectedProducts.value = [];
}

const openDialogCreateProduct = item => {
    dialogCreateProduct.value = true;
    recipeSelected.value = item.name;
};

const closeDialogCreateProduct = () => {
    dialogCreateProduct.value = false;
    recipeSelected.value = null;
    portions.value = null;
};

const createProduct = async () => {
    if(!portions.value) {
        alert('Portions is required');
        return;
    }

    saving.value = true;
    const response = await productService.addFromRecipe(recipeSelected.value, portions.value);
    if (response.isOk) {
        closeDialogCreateProduct();
    } else {
        alert('Error creating product');
    }
    saving.value = false;
};

const getSuffix = product => {
  if(product.recipe_name) {
    return 'portions';
  }
  
  return 'gr';
};

const updateQuery = queryValue => {
    clearTimeout(updateQueryTimeout);

    updateQueryTimeout = setTimeout(() => {
        query.value = queryValue;
        finishUpdateQuery();
    }, 500);
};

const finishUpdateQuery = () => {
    delete params.value['last_evaluated_key'];

    if(query.value) {
        params.value['query'] = query.value;
    } else {
        delete params.value['query'];
    }
    console.log(query.value)

    reload.value = true;
};

const afterGet = () => {
    nextTick(() => searchField.value.focus());
};
</script>