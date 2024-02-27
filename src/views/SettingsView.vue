<template>
    <LayoutBase>
        <template v-slot:content>
            <v-skeleton-loader :loading="saving" type="card">
                <v-card class="mt-2 mx-auto" max-width="300" title="Parts of the day">
                    <template v-slot:append>
                        <v-btn @click="openDialogPartsOfDay" class="float-right" icon="mdi-pencil"></v-btn>
                    </template>
                    <v-list>
                        <v-list-item v-for="dayMoment in partsOfDay" :key="dayMoment" :title="dayMoment"></v-list-item>
                    </v-list>
                </v-card>
            </v-skeleton-loader>
        </template>
    </LayoutBase>
    <v-dialog @click:outside="closeDialogPartsOfDay" transition="dialog-bottom-transition" v-model="dialogPartsOfDay"
        max-width="500px">
        <v-card class="mx-auto">
            <v-card-title class="mx-auto text-h5">Parts of the day</v-card-title>
            <v-card-subtitle class="mx-auto">Add parts of the day separated by commas</v-card-subtitle>
            <v-card-actions class="mx-auto">
                <v-form v-model="form" @submit.prevent="saveSettings">
                    <v-text-field autofocus :disabled="saving" v-model="copyPartsOfDayInput" label="Parts of the day"
                    :rules="[rules.required]"></v-text-field>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="saving" color="blue-darken-1" variant="text"
                        @click="closeDialogPartsOfDay">Cancel</v-btn>
                    <v-btn :disabled="!form || saving" class="float-right" color="blue-darken-1" variant="text"
                        type="submit">Save</v-btn>
                </v-form>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import LayoutBase from '../layouts/LayoutBase.vue';
import SettingService from '../services/SettingService';

import { ref, onMounted, computed } from 'vue';

const saving = ref(true);
const form = ref(true);
const dialogPartsOfDay = ref(false);
const partsOfDayInput = ref('');
const copyPartsOfDayInput = ref([]);
const partsOfDay = computed(() => partsOfDayInput.value?.split(','));

const rules = {
    required: value => !!value || 'Field is required',
};

const settingService = new SettingService;

const getSettings = async () => {
    saving.value = true;
    const response = await settingService.get('settings_v1');
    saving.value = false;

    if (response.isOk) {
        partsOfDayInput.value = response.data.settings.partsOfDay;
    } else {
        console.error('Error retrieving settings');
    }
};

onMounted(getSettings);

const saveSettings = async () => {
    saving.value = true;
    const response = await settingService.add({
        'shortname': 'settings_v1',
        'partsOfDay': copyPartsOfDayInput.value
    });
    saving.value = false;

    if (response.isOk) {
        partsOfDayInput.value = '' + copyPartsOfDayInput.value;
        closeDialogPartsOfDay();
    } else {
        console.error('Error retrieving settings');
    }
};

const openDialogPartsOfDay = () => {
    dialogPartsOfDay.value = true;
    copyPartsOfDayInput.value = '' + partsOfDayInput.value;
};

const closeDialogPartsOfDay = () => {
    dialogPartsOfDay.value = false;
};
</script>