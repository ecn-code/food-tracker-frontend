<template>
    <div id="loading" v-if="props.loading">
        <div id="loading-text">
            LOADING
        </div>
    </div>
</template>

<script setup>
const props = defineProps(['loading']);
</script>

<style scoped>
#loading {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: green;
}

#loading-text {
    color: white;
    position: absolute;
    top: 50%;
    left: 50%;
}
</style>