import Service from "./Service";
import { useUserStore } from "../stores/user";
import { storeToRefs } from 'pinia';

export default class WeeklyMenuService extends Service {

    RESOURCE = '/weekly-menus';

    async count() {
        const userStore = useUserStore();
        const { user } = storeToRefs(userStore);
        const token = user.value.token;
        return await super.fetchData(
            this.RESOURCE + '/count',
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

    get(params) {
        const userStore = useUserStore();
        const { user } = storeToRefs(userStore);
        const token = user.value.token;
        return super.fetchData(
            this.RESOURCE,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            },
            params
        );
    };

    async lock(date) {
        return await this.fetchWithBody(
            this.RESOURCE + '/lock',
            'POST',
            JSON.stringify({date: date})
        );
    }

    async add(menu) {
        return await this.fetchWithBody(
            this.RESOURCE,
            'POST',
            JSON.stringify(menu)
        );
    }

    async edit(shortname, menu) {
        return await this.fetchWithBody(
            this.RESOURCE + '/' + shortname,
            'PUT',
            JSON.stringify(menu)
        );
    }

    async remove(shortname) {
        return await this.fetchWithBody(
            this.RESOURCE,
            'DELETE',
            JSON.stringify({ id: shortname })
        );
    }

    fetchWithBody(path, method, body) {
        const userStore = useUserStore();
        const { user } = storeToRefs(userStore);
        const token = user.value.token;

        return super.fetchWithBody(path, method, body, token);
    };

}