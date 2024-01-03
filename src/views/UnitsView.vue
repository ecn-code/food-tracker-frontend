<template>
    <LayoutBase>
        <template v-slot:content>
            <TableComponent v-model:item="editingUnit" v-model:validationMessage="validationMessage" v-model:saving="saving"
                :emptyItem="{ shortname: null, name: null }" :headers="headers" :service="unitService"
                :sort-by="[{ key: 'shortname', order: 'asc' }]" id-name="shortname" title="Units">
                <template v-slot:form>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field :rules="[rules.required]" :disabled="saving"
                                        v-model="editingUnit.shortname" tabindex="1" label="ShortName"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field :rules="[rules.required]" v-model="editingUnit.name" :disabled="saving"
                                        tabindex="2" label="Name"></v-text-field>
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

import TableComponent from '../components/TableComponent.vue';
import LayoutBase from '../layouts/LayoutBase.vue';
import UnitService from '../services/UnitService';
import { ref } from 'vue';

const editingUnit = ref({});
const saving = ref(false);
const validationMessage = ref(null);

const rules = {
    required: value => !!value || 'Field is required',
};
const unitService = new UnitService;
const headers = [
    { title: 'ShortName', key: 'shortname' },
    { title: 'Name', key: 'name' },
    { title: 'Actions', key: 'actions', sortable: false },
];

</script>