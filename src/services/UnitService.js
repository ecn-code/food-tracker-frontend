import Service from "./Service";
import { useUserStore } from "../stores/user";
import { storeToRefs } from 'pinia';

export default class UnitService extends Service {

    async getUnits() {
        const userStore = useUserStore();
        const { user } = storeToRefs(userStore);
        const token = user.value.token;
        return await super.fetchData(
            '/units',
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
            '/units',
            'POST',
            JSON.stringify(unit)
        );
    }

    async edit(shortname, unit) {
        return await this.fetchWithBody(
            '/units/' + shortname,
            'PUT',
            JSON.stringify(unit)
        );
    }

    async remove(shortname) {
        return await this.fetchWithBody(
            '/units',
            'DELETE',
            JSON.stringify({shortname: shortname})
        );
    }

     fetchWithBody(path, method, body) {
        const userStore = useUserStore();
        const { user } = storeToRefs(userStore);
        const token = user.value.token;

        return super.fetchWithBody(path, method, body, token);
     };
}