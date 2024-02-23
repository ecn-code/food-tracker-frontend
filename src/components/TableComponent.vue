<template>
    <v-data-table-virtual class="fill-height" @update:options="get" :loading="loading" :headers="headers" :items="items"
        :sort-by="sortBy">
        <template v-for="slotCell in slotCells" v-slot:[slotCell]="{ item }">
            <slot :name="slotCell" :item="item"></slot>
        </template>
        <template v-slot:top>
            <v-toolbar flat>
                <v-toolbar-title>{{ title }}</v-toolbar-title>
                <slot name="toolbar"></slot>
                <v-dialog @click:outside="close" v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn :disabled="loading" color="primary" dark class="mb-2" @click="add">
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
                        <v-card-subtitle>Are you sure you want to delete <b>'{{ item ? item[idName] : '' }}'</b>?</v-card-subtitle>
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
            <slot name="item_actions" :item="item"></slot>
            <v-icon size="small" class="me-2" @click="edit(item)">
                mdi-pencil
            </v-icon>
            <v-icon v-if="canDuplicate" size="small" class="me-2" @click="duplicate(item)">
                mdi-content-copy
            </v-icon>
            <v-icon size="small" @click="removeAlert(item)">
                mdi-delete
            </v-icon>
        </template>
        <template v-slot:no-data>
            <v-btn color="primary" @click="clear">
                Reset
            </v-btn>
        </template>
    </v-data-table-virtual>
</template>

<script setup>
import { ref, nextTick, computed, watch } from 'vue';

const dialog = ref(false);
const dialogRemove = ref(false);
const form = ref(false);
const editing = ref(false);
const saving = defineModel('saving');

const validationMessage = defineModel('validationMessage');
const formRef = ref(null);
const items = ref([]);
const item = defineModel('item');
const reload = defineModel('reload');
const loading = defineModel('loading');

const {
    headers,
    service,
    sortBy,
    idName,
    emptyItem,
    title,
    slotCells,
    canDuplicate,
    params
} = defineProps({
    headers: Array,
    service: Object,
    sortBy: Array,
    idName: String,
    emptyItem: Object,
    title: String,
    slotCells: Array,
    canDuplicate: { type: Boolean, required: false, default: false },
    params: { type: Object, required: false, default: {} },
});

const formTitle = computed(() => {
    return editing.value ? 'Edit' : 'New'
});
const saveBtnText = computed(() => {
    return saving.value ? 'saving...' : 'save';
});
watch(reload, () => reload.value ? get() : '');

const emit = defineEmits(['on-edit', 'on-duplicate', 'before-save', 'on-close', 'on-reset', 'before-remove']);

const get = async () => {
    loading.value = true;

    const response = await service.get(params);
    if (response.isOk) {
        items.value = response.data.items;
        loading.value = false;
        reload.value = false;
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
    dialog.value = true;
    emit('on-edit');
};

const duplicate = itemSelected => {
    dialog.value = true;
    item.value = Object.assign({}, itemSelected);
    dialog.value = true;
    emit('on-duplicate');
};

const save = async () => {
    emit('before-save');
    loading.value = true;
    saving.value = true;
    validationMessage.value = null;

    if (editing.value) {
        const response = await service.edit(item.value[idName], item.value);

        if (response.isOk) {
            const callback = () => items.value[findIndex(item.value[idName])] = item.value;
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
        validationMessage.value = null;
        emit('on-close');
    });
};

const removeAlert = itemSelected => {
    dialogRemove.value = true;
    item.value = itemSelected;
    emit('before-remove');
};

const remove = async () => {
    dialogRemove.value = false;
    loading.value = true;
    const response = await service.remove(item.value[idName]);

    if (response.isOk) {
        items.value = items.value.filter(i => i[idName] != item.value[idName]);
        loading.value = false;
    }
    item.value = Object.assign({}, emptyItem);
};

const closeDialogRemove = () => {
    dialogRemove.value = false;
    item.value = Object.assign({}, emptyItem);
};

const clear = () => {
    emit('on-reset');
};
</script>