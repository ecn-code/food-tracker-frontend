import Service from "./Service";
import { useUserStore } from "../stores/user";
import { storeToRefs } from 'pinia';

export default class NutritionalValueService extends Service {

    async get() {
        const userStore = useUserStore();
        const { user } = storeToRefs(userStore);
        const token = user.value.token;
        return await super.fetchData(
            '/nutritional-values',
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
    };

    async add(unit) {
        return await this.fetchWithBody(
            '/nutritional-values',
            'POST',
            JSON.stringify(unit)
        );
    }

    async edit(shortname, unit) {
        return await this.fetchWithBody(
            '/nutritional-values/' + shortname,
            'PUT',
            JSON.stringify(unit)
        );
    }

    async remove(shortname) {
        return await this.fetchWithBody(
            '/nutritional-values',
            'DELETE',
            JSON.stringify({ shortname: shortname })
        );
    }

    fetchWithBody(path, method, body) {
        const userStore = useUserStore();
        const { user } = storeToRefs(userStore);
        const token = user.value.token;

        return super.fetchWithBody(path, method, body, token);
    };

}