<template>
    <v-table theme="dark">
        <thead>
            <tr>
                <th v-for="column in columns" scope="col">{{ column.name }}</th>
                <slot name="add-button"></slot>
            </tr>
        </thead>
        <tbody>
            <slot name="body"></slot>
        </tbody>
    </v-table>
</template>

<script setup>
const { columns } = defineProps(['columns'])

</script>