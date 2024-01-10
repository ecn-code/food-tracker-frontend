<template>
    <LayoutBase>
        <template v-slot:content>
            <TableComponent v-model:item="editingRecipe" v-model:validationMessage="validationMessage"
                v-model:saving="saving" :emptyItem="{ products: [], nutritional_value: [], name: null, description: null }"
                :headers="headers" :service="recipeService" :sort-by="[{ key: 'name', order: 'asc' }]" id-name="name"
                title="Recipes" @on-edit="edit" @before-save="save" @close="close" :slot-cells="['item.nutritional_value']">

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
                                    <v-text-field :rules="[rules.required]" v-model="editingRecipe.name" :disabled="saving"
                                        tabindex="2" label="Name"></v-text-field>
                                    <v-text-field v-model="editingRecipe.description" :disabled="saving" tabindex="2"
                                        label="Description"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-select v-model="selectedProducts" @update:modelValue="selectProduct"
                                        :items="products" :disabled="saving" :item-props="productProps" tabindex="3"
                                        multiple label="Products"></v-select>
                                </v-col>
                                <v-col cols="12" v-for="product in editedProducts">
                                    <v-text-field :rules="[rules.required]" v-model="product[0]" :disabled="true"
                                        label="Name"></v-text-field>
                                    <v-text-field :rules="[rules.required]" v-model="product[2]" :disabled="saving"
                                        :suffix="product[1]" label="Value"></v-text-field>
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
    return {
        title: product.name,
    };
};
const columnNutritionalValue = nv => `${nv.name}=${nv.value}${nv.unit}`;
const getProducts = async () => {
    const response = await productService.get();
    if (response.isOk) {
        products.value = response.data.items;
    } else {
        alert('Error retrieving products');
    }
};
onMounted(getProducts);

const editingRecipe = ref({});
const saving = ref(false);
const validationMessage = ref(null);
const products = ref([]);
const selectedProducts = ref([]);
const editedProducts = ref([]);

const selectProduct = currentSelectedProducts => {
    const selected = [];
    currentSelectedProducts.forEach(pSelected => {
        const product = editedProducts.value.filter(p => p[0] == pSelected.name);
        if (product.length == 0) {
            selected.push([pSelected.name, pSelected.unit, 0]);
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
</script>