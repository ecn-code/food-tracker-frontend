<template>
    <LayoutBase>
        <template v-slot:content>
            <TableComponent v-model:item="editingNutritional" v-model:validationMessage="validationMessage"
                v-model:saving="saving" :emptyItem="{ shortname: null, name: null, unit: null }" :headers="headers"
                :service="nutritionalValueService" :sort-by="[{ key: 'shortname', order: 'asc' }]" id-name="shortname"
                title="Nutritional Values">
                <template v-slot:form>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field :rules="[rules.required]" :disabled="saving"
                                        v-model="editingNutritional.shortname" tabindex="1"
                                        label="ShortName"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field :rules="[rules.required]" v-model="editingNutritional.name"
                                        :disabled="saving" tabindex="2" label="Name"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-select item-value="shortname" v-model="editingNutritional.unit" :items="units"
                                        :disabled="saving" :item-props="unitsProps" tabindex="3"
                                        label="Unit"></v-select>
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
import TableComponent from '../components/TableComponent.vue';
import { onMounted, ref } from 'vue';
import UnitService from '../services/UnitService';
import NutritionalValueService from '../services/NutritionalValueService';

const unitService = new UnitService;
const nutritionalValueService = new NutritionalValueService;
const rules = {
    required: value => !!value || 'Field is required',
};
const headers = [
    { title: 'ShortName', key: 'shortname' },
    { title: 'Name', key: 'name' },
    { title: 'Unit', key: 'unit' },
    { title: 'Actions', key: 'actions', sortable: false },
];

const units = ref([]);
const editingNutritional = ref({});
const saving = ref(false);
const validationMessage = ref(null);

const getUnits = async () => {
    const response = await unitService.get();
    if (response.isOk) {
        units.value = response.data.items;
    } else {
        alert('Error retrieving units');
    }
};
onMounted(getUnits);

const unitsProps = unit => {
    return {
        title: unit.shortname,
        subtitle: unit.name
    };
};

</script>