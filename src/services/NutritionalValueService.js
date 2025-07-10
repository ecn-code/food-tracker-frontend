import Service from "./Service";
import { useUserStore } from "../stores/user";
import { storeToRefs } from 'pinia';

const NUTRITIONAL_INFORMATION_PATH = '/nutritional-information';

export default class NutritionalValueService extends Service {

    async get() {
        const userStore = useUserStore();
        const { user } = storeToRefs(userStore);
        const token = user.value.token;
        return await super.fetchData(
            NUTRITIONAL_INFORMATION_PATH,
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
            NUTRITIONAL_INFORMATION_PATH,
            'POST',
            JSON.stringify(unit)
        );
    }

    async edit(id, unit) {
        return await this.fetchWithBody(
            `${NUTRITIONAL_INFORMATION_PATH}/${id}`,
            'PUT',
            JSON.stringify(unit)
        );
    }

    async remove(id) {
        return await this.fetchWithBody(
            `${NUTRITIONAL_INFORMATION_PATH}/${id}`,
            'DELETE',
            null
        );
    }

    fetchWithBody(path, method, body) {
        const userStore = useUserStore();
        const { user } = storeToRefs(userStore);
        const token = user.value.token;

        return super.fetchWithBody(path, method, body, token);
    };

}