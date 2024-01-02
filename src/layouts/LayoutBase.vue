<template>
    <v-layout>
        <v-navigation-drawer expand-on-hover rail image="https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg" permanent
            theme="dark">
            <v-list nav>
                <v-list-item v-for="link in menu.links" :to="link.to" :prepend-icon="link.icon" :title="link.title"
                    :value="link.title">
                </v-list-item>
            </v-list>
            <template v-slot:append>
                <v-list-item @click="logoutAction" prepend-icon="mdi-power" title="Logout" value="logout">
                </v-list-item>
            </template>
        </v-navigation-drawer>

        <v-app-bar title="Food Tracker" color="blue-accent-3" elevation="5"></v-app-bar>

        <v-main style="min-height: 300px;">
            <slot name="content"></slot>
        </v-main>
    </v-layout>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import router from '../router';

import { useUserStore } from '../stores/user';


const userStore = useUserStore();
const { logout } = userStore;
const { user } = storeToRefs(userStore);

const logoutAction = () => {
    logout();
    router.push({ name: 'login' });
};

const menu = {
    links: [
        { to: { name: 'home' }, icon: 'mdi-home-analytics', title: 'Home' },
        { to: { name: 'units' }, icon: 'mdi-ruler-square', title: 'Units' },
        { to: { name: 'nutritional-values' }, icon: 'mdi-molecule', title: 'Nutritionals' },
        { to: { name: 'products' }, icon: 'mdi-food-apple', title: 'Products' },
        { to: { name: 'recipes' }, icon: 'mdi-silverware', title: 'Recipes' },
        { to: { name: 'menus' }, icon: 'mdi-calendar-text', title: 'Menus' }
    ]
};

</script>


<css scoped>
main {
    display: flex;
    flex-wrap: nowrap;
    height: 100vh;
    height: -webkit-fill-available;
    max-height: 100vh;
    overflow-x: auto;
    overflow-y: hidden;
}
#nav {
    min-height: 100vh;
}
.divider {
    flex-shrink: 0;
    width: 1.5rem;
    height: 100vh;
    background-color: rgba(0, 0, 0, .1);
    border: solid rgba(0, 0, 0, .15);
    border-width: 1px 0;
    box-shadow: inset 0 0.5em 1.5em rgba(0, 0, 0, .1), inset 0 0.125em 0.5em rgba(0, 0, 0, .15);
}
.bi {
    vertical-align: -0.125em;
    pointer-events: none;
    fill: currentColor;
    margin-right: 0.5rem;
}
.router-link-exact-active {
    color: #fff;
    background-color: #0d6efd;
}
</css>