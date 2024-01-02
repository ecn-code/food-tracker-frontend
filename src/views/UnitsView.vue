<template>
    <LayoutBase>
        <template v-slot:content>
            <v-data-table-server v-model:items-per-page="unitsPerPage" :items-length="totalUnits" @update:options="get"
                :loading="loading" :headers="headers" :items="units" :sort-by="[{ key: 'shortname', order: 'asc' }]">
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title>Units</v-toolbar-title>
                        <v-dialog v-model="dialog" max-width="500px">
                            <template v-slot:activator="{ props }">
                                <v-btn color="primary" dark class="mb-2" @click="add">
                                    Add
                                </v-btn>
                            </template>
                            <div ref="div">
                                <v-form id="unit-dialog" v-model="form" @submit.prevent="save">
                                    <v-card>
                                        <v-card-title>
                                            <span class="text-h5">{{ formTitle }}</span>
                                        </v-card-title>

                                        <v-card-text>
                                            <v-container>
                                                <v-row>
                                                    <v-col cols="12" sm="6" md="4">
                                                        <v-text-field :rules="[rules.required]" :disabled="loadingSave"
                                                            v-model="editingUnit.shortname" tabindex="1"
                                                            label="ShortName"></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" sm="6" md="4">
                                                        <v-text-field :rules="[rules.required]" v-model="editingUnit.name"
                                                            :disabled="loadingSave" tabindex="2"
                                                            label="Name"></v-text-field>
                                                    </v-col>
                                                </v-row>
                                            </v-container>
                                            <v-alert v-if="description != null" :text="description" type="error"
                                                variant="tonal"></v-alert>
                                        </v-card-text>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn tabindex="12" :disabled="loadingSave" color="blue-darken-1"
                                                variant="text" @click="close">
                                                Cancel
                                            </v-btn>
                                            <v-btn tabindex="13" :disabled="!form || loadingSave" color="blue-darken-1"
                                                variant="text" type="submit">
                                                {{ saveBtnText }}
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-form>
                            </div>
                        </v-dialog>
                        <v-dialog v-model="dialogRemove" max-width="500px">
                            <v-card class="mx-auto" color="red-lighten-4">
                                <v-card-title class="mx-auto text-h5">DELETE</v-card-title>
                                <v-card-subtitle>Are you sure you want to delete <b>'{{ shortName }}'</b>?</v-card-subtitle>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="blue-darken-1" variant="text" @click="closeDialogRemove">Cancel</v-btn>
                                    <v-btn color="blue-darken-1" variant="text" @click="remove">OK</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-icon size="small" class="me-2" @click="edit(item)">
                        mdi-pencil
                    </v-icon>
                    <v-icon size="small" @click="removeAlert(item.shortname)">
                        mdi-delete
                    </v-icon>
                </template>
                <template v-slot:no-data>
                    <v-btn color="primary" @click="get">
                        Reset
                    </v-btn>
                </template>
            </v-data-table-server>
        </template>
    </LayoutBase>
</template>

<script setup>
/**
 * <h1>Units</h1>
            https://vuetifyjs.com/en/components/data-tables/basics/#crud-actions
            <TableComponent :columns="columns">
                <template v-slot:add-button>
                    <button @click="" class="btn btn-danger">
                        <Fa :icon="faTrashCan" />
                    </button>
                </template>
                <template v-slot:body>
                    <tr v-for="unit in units">
                        <td>{{ unit.shortname }}</td>
                        <td>{{ unit.name }}</td>
                        <td>
                            <button @click="remove(unit.shortname)" class="btn btn-danger">
                                <Fa :icon="faTrashCan" />
                            </button>
                        </td>
                    </tr>
                </template>
            </TableComponent>
            <LoadingComponent :loading="loading"></LoadingComponent>
 * 
 */

import LayoutBase from '../layouts/LayoutBase.vue';
import UnitService from '../services/UnitService';
import { ref, computed, nextTick } from 'vue';

const units = ref([]);
const editingUnit = ref({});
const loading = ref(false);
const loadingSave = ref(false);
const dialog = ref(false);
const totalUnits = ref(0);
const unitsPerPage = ref(10);
const editing = ref(false);
const form = ref(false);
const div = ref(null);
const description = ref(null);
const shortName = ref(null);

const rules = {
    required: value => !!value || 'Field is required',
};
const emptyUnit = { shortname: null, name: null };
const unitService = new UnitService;
const headers = [
    { title: 'ShortName', key: 'shortname' },
    { title: 'Name', key: 'name' },
    { title: 'Actions', key: 'actions', sortable: false },
];
const dialogRemove = ref(false);
const saveBtnText = computed(() => {
    return loadingSave.value ? 'saving...' : 'save';
});

const get = async ({ page, itemsPerPage, sortBy }) => {
    loading.value = true;
    const response = await unitService.getUnits();

    if (response.isOk) {
        units.value = response.data;
        loading.value = false;
        totalUnits.value = units.value.length;
    }
};

const removeAlert = shortname => {
    dialogRemove.value = true;
    shortName.value = shortname;
};

const remove = async () => {
    dialogRemove.value = false;
    loading.value = true;
    const response = await unitService.remove(shortName.value);

    if (response.isOk) {
        units.value = units.value.filter(unit => unit.shortname != shortName.value);
        loading.value = false;
    }
};

const add = () => {
    dialog.value = true;
    nextTick(() => {
        div.value.querySelector('.v-form [tabindex="1"]').focus();
    });
};

const edit = unit => {
    editing.value = true;
    editingUnit.value = Object.assign({}, unit)
    shortName.value = unit.shortname
    dialog.value = true;
};

const formTitle = computed(() => {
    return editing.value ? 'Edit' : 'New'
});

const closeDialogRemove = () => {
    dialogRemove.value = false;
    shortName.value = null;
};

const close = (callback) => {
    dialog.value = false;
    nextTick(() => {
        typeof callback == 'function' ? callback() : '';
        editingUnit.value = Object.assign({}, emptyUnit);
        loading.value = false;
        editing.value = false;
        loadingSave.value = false;
        shortName.value = null;
    });
};

const save = async () => {
    loading.value = true;
    loadingSave.value = true;

    if (editing.value) {
        const response = await unitService.edit(shortName.value, editingUnit.value);

        if(response.isOk) {
            description.value = null;
            const callback = () => units.value[findIndex(shortName.value)] = editingUnit.value;
            close(callback);
        } else {
            description.value = response.data ? response.data.description : null;
            loadingSave.value = false;
            loading.value = false;
        }

        
    } else {
        const response = await unitService.add(editingUnit.value);

        if (response.isOk) {
            description.value = null;
            const callback = () => units.value.push(editingUnit.value);
            close(callback);
        } else {
            description.value = response.data ? response.data.description : null;
            loadingSave.value = false;
            loading.value = false;
        }
    }
};

const findIndex = (shortname) => {
    return units.value.findIndex(unit => unit.shortname == shortname);
};
</script>