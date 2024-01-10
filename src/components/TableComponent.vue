<template>
    <v-data-table-virtual class="fill-height" @update:options="get" :loading="loading" :headers="headers" :items="items"
        :sort-by="sortBy">
        <template v-for="slotCell in slotCells" v-slot:[slotCell]="{ item }">
            <slot :name="slotCell" :item="item"></slot>
        </template>
        <template v-slot:top>
            <v-toolbar flat>
                <v-toolbar-title>{{ title }}</v-toolbar-title>
                <v-dialog @click:outside="close" v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn color="primary" dark class="mb-2" @click="add">
                            Add
                        </v-btn>
                    </template>
                    <div style="overflow: auto;" ref="formRef">
                        <v-form v-model="form" @submit.prevent="save">
                            <v-card>
                                <v-card-title>
                                    <span class="text-h5">{{ formTitle }}</span>
                                </v-card-title>

                                <slot name="form"></slot>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn tabindex="12" :disabled="saving" color="blue-darken-1" variant="text"
                                        @click="close">
                                        Cancel
                                    </v-btn>
                                    <v-btn tabindex="13" :disabled="!form || saving" color="blue-darken-1" variant="text"
                                        type="submit">
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
                        <v-card-subtitle>Are you sure you want to delete <b>'{{ id }}'</b>?</v-card-subtitle>
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
            <v-icon size="small" @click="removeAlert(item[idName])">
                mdi-delete
            </v-icon>
        </template>
        <template v-slot:no-data>
            <v-btn color="primary" @click="get">
                Reset
            </v-btn>
        </template>
    </v-data-table-virtual>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue';

const loading = ref(false);
const dialog = ref(false);
const dialogRemove = ref(false);
const form = ref(false);
const editing = ref(false);
const saving = defineModel('saving');

const validationMessage = defineModel('validationMessage');
const formRef = ref(null);
const items = ref([]);
const item = defineModel('item');
const id = ref(null);

const {
    headers,
    service,
    sortBy,
    idName,
    emptyItem,
    title,
    slotCells
} = defineProps([
    'headers',
    'service',
    'sortBy',
    'idName',
    'emptyItem',
    'title',
    'slotCells'
]);

const formTitle = computed(() => {
    return editing.value ? 'Edit' : 'New'
});
const saveBtnText = computed(() => {
    return saving.value ? 'saving...' : 'save';
});

const emit = defineEmits(['on-edit', 'before-save', 'close']);

const get = async () => {
    loading.value = true;

    const response = await service.get();
    if (response.isOk) {
        items.value = response.data.items;
        loading.value = false;
    }
};

const add = () => {
    dialog.value = true;
    nextTick(() => {
        formRef.value?.querySelector('.v-form')?.querySelector('[tabindex="1"]')?.focus();
    });
};

const edit = itemSelected => {
    editing.value = true;
    item.value = Object.assign({}, itemSelected);
    id.value = itemSelected[idName];
    dialog.value = true;
    emit('on-edit');
};

const save = async () => {
    emit('before-save');
    loading.value = true;
    saving.value = true;
    validationMessage.value = null;

    if (editing.value) {
        const response = await service.edit(id.value, item.value);

        if (response.isOk) {
            const callback = () => items.value[findIndex(id.value)] = item.value;
            close(callback);
        } else {
            const message = response.data ? response.data.description : null;
            saving.value = false;
            loading.value = false;
            validationMessage.value = message;
        }


    } else {
        const response = await service.add(item.value);

        if (response.isOk) {
            const callback = () => items.value.push(item.value);
            close(callback);
        } else {
            const message = response.data ? response.data.description : null;
            saving.value = false;
            loading.value = false;
            validationMessage.value = message;
        }
    }
};

const findIndex = (idToFind) => {
    return items.value.findIndex(item => item[idName] == idToFind);
};

const close = (callback) => {
    dialog.value = false;
    nextTick(() => {
        typeof callback == 'function' ? callback() : '';
        item.value = Object.assign({}, emptyItem);
        loading.value = false;
        editing.value = false;
        saving.value = false;
        id.value = null;
        emit('close');
    });
};

const removeAlert = idSelected => {
    dialogRemove.value = true;
    id.value = idSelected;
};

const remove = async () => {
    dialogRemove.value = false;
    loading.value = true;
    const response = await service.remove(id.value);

    if (response.isOk) {
        items.value = items.value.filter(item => item[idName] != id.value);
        loading.value = false;
    }
};

const closeDialogRemove = () => {
    dialogRemove.value = false;
    id.value = null;
};
</script>