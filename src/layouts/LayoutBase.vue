<template>
    <v-layout>
        <v-navigation-drawer v-if="screeWidth <= 400" rail image="https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg"
            permanent theme="dark">
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

        <v-main scrollable>
            <slot name="content"></slot>
        </v-main>

        <v-bottom-navigation v-if="screeWidth > 400" bg-color="blue-accent-3">
            <v-btn v-for="link in menu.links" :to="link.to" :value="link.title">
                <v-icon>{{ link.icon }}</v-icon>
                {{ link.title }}
            </v-btn>
            <v-btn @click="logoutAction" value="logout">
                <v-icon>mdi-power</v-icon>
                Logout
            </v-btn>
        </v-bottom-navigation>
    </v-layout>
</template>

<script setup>
import router from '../router';

import { useUserStore } from '../stores/user';


const userStore = useUserStore();
const { logout } = userStore;
const screeWidth = screen.width;

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
</css>