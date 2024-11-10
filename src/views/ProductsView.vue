<template>
    <LayoutBase>
        <template v-slot:content>
            <TableComponent v-model:loading="loading" v-model:reload="reload" v-model:item="editingProduct" v-model:validationMessage="validationMessage"
                v-model:saving="saving" :emptyItem="{ nutritional_value: [], name: null, description: null }" :params="params" 
                :headers="headers" :service="productService" :sort-by="[{ key: 'name', order: 'asc' }]" id-name="SK"
                title="Products" @on-edit="edit" @before-save="save" @on-close="close" :paginated="true"
                :slot-cells="['item.nutritional_value']" @after-get="afterGet">

                <template v-slot:item.nutritional_value="{ item }">
                    <v-chip
                        v-for="nv in item.nutritional_value.sort((n1, n2) => n1[0].toLowerCase().localeCompare(n2[0].toLowerCase()))"
                        size="x-small" color="primary">
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
                                <v-col cols="6">
                                    <v-text-field :rules="[rules.required]" v-model="editingProduct.name" :disabled="saving"
                                        tabindex="2" label="Name"></v-text-field>
                                    <v-text-field v-model="editingProduct.description" :disabled="saving" tabindex="2"
                                        label="Description"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-select v-model="selectedNutritionalValues"
                                        @update:modelValue="selectNutritionalValue" :items="nutritionals" :disabled="saving"
                                        :item-props="nutritionalProps" tabindex="3" multiple
                                        label="Nutritional Values"></v-select>
                                </v-col>
                                <v-divider></v-divider>
                                <v-col cols="12" v-for="nutritionalValue in editedNutritionalValues">
                                    <v-text-field :rules="[rules.required]" v-model="nutritionalValue[0]" :disabled="true"
                                        label="Name"></v-text-field>
                                    <v-text-field type="number" :rules="[rules.required]" v-model="nutritionalValue[2]"
                                        :disabled="saving" :suffix="nutritionalValue[1]" label="Value"></v-text-field>
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
import ProductService from '../services/ProductService';
import TableComponent from '../components/TableComponent.vue';
import { ref, onMounted, nextTick } from 'vue';
import NutritionalValueService from '../services/NutritionalValueService';

const productService = new ProductService;
const nutritionalValueService = new NutritionalValueService;
const rules = {
    required: value => !!value || 'Field is required',
};
const headers = [
    { title: 'Name', key: 'name' },
    { title: 'Description', key: 'description' },
    { title: 'Nutritional', key: 'nutritional_value' },
    { title: 'Actions', key: 'actions', sortable: false },
];
const nutritionalProps = nutritional => {
    return {
        title: nutritional.shortname,
        subtitle: nutritional.name
    };
};
const columnNutritionalValue = nv => `${nv[0]}=${nv[2]}${nv[1]}`;
const getNutritionalValues = async () => {
    const response = await nutritionalValueService.get();
    if (response.isOk) {
        nutritionals.value = response.data.items.sort((n1, n2) => n1.name.toLowerCase().localeCompare(n2.name.toLowerCase()));
    } else {
        console.error('Error retrieving nutritionals');
    }
};
onMounted(getNutritionalValues);

const editingProduct = ref({});
const saving = ref(false);
const loading = ref(false);
const reload = ref(false);
const validationMessage = ref(null);
const nutritionals = ref([]);
const selectedNutritionalValues = ref([]);
const editedNutritionalValues = ref([]);
const query = ref('');
const params = ref({
    'items_per_page': 40
});
let updateQueryTimeout = null;
const searchField = ref(null);

const selectNutritionalValue = nutritionalValuesSelected => {
    const selected = [];
    nutritionalValuesSelected.forEach(nvSelected => {
        const nutritionalValue = editedNutritionalValues.value.filter(nv => nv[0] == nvSelected.name);
        if (nutritionalValue.length == 0) {
            selected.push([nvSelected.name, nvSelected.unit, 0]);
        } else {
            selected.push([nutritionalValue[0][0], nutritionalValue[0][1], nutritionalValue[0][2]]);
        }
    });
    editedNutritionalValues.value = selected;
};

const edit = () => {
    selectedNutritionalValues.value = editingProduct.value.nutritional_value
        .map(nutritionalValue => nutritionals.value.filter(nv => nv.name == nutritionalValue[0])[0]);
    editedNutritionalValues.value = editingProduct.value.nutritional_value
        .map(nv => nv);
};

const save = () => {
    editingProduct.value.nutritional_value = editedNutritionalValues.value;
};

const close = () => {
    editedNutritionalValues.value = [];
    selectedNutritionalValues.value = [];
}

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

    reload.value = true;
};

const afterGet = () => {
    nextTick(() => searchField.value.focus());
};
</script>