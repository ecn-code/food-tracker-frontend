import Service from "./Service";
import { useUserStore } from "../stores/user";
import { storeToRefs } from 'pinia';

export default class ProductService extends Service {

    RESOURCE = '/products';

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

    async add(unit) {
        return await this.fetchWithBody(
            this.RESOURCE,
            'POST',
            JSON.stringify(unit)
        );
    }

    async addFromRecipe(recipe, portions) {
        return await this.fetchWithBody(
            this.RESOURCE + '/recipe',
            'POST',
            JSON.stringify({
                recipe_name: recipe,
                portions: portions
            })
        );
    }

    async edit(shortname, unit) {
        return await this.fetchWithBody(
            this.RESOURCE + '/' + shortname,
            'PUT',
            JSON.stringify(unit)
        );
    }

    async remove(shortname) {
        return await this.fetchWithBody(
            this.RESOURCE,
            'DELETE',
            JSON.stringify({ name: shortname })
        );
    }

    fetchWithBody(path, method, body) {
        const userStore = useUserStore();
        const { user } = storeToRefs(userStore);
        const token = user.value.token;

        return super.fetchWithBody(path, method, body, token);
    };

}