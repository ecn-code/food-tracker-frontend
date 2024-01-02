import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useNavigationStore = defineStore('navigation', () => {
    const navigation = ref({ from: null, to: null });
    const setNavigation = (nameFrom, nameTo) => {
        navigation.value = {
            from: nameFrom,
            to: nameTo
        };
    };

    return { navigation, setNavigation }
});