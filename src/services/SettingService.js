import Service from "./Service";
import { useUserStore } from "../stores/user";
import { storeToRefs } from 'pinia';

export default class SettingService extends Service {

    RESOURCE = '/settings';

    async get(shortname) {
        const userStore = useUserStore();
        const { user } = storeToRefs(userStore);
        const token = user.value.token;
        return await super.fetchData(
            this.RESOURCE + '/' + shortname,
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

    async add(settings) {
        return await this.fetchWithBody(
            this.RESOURCE,
            'POST',
            JSON.stringify(settings)
        );
    }

     fetchWithBody(path, method, body) {
        const userStore = useUserStore();
        const { user } = storeToRefs(userStore);
        const token = user.value.token;

        return super.fetchWithBody(path, method, body, token);
     };

}