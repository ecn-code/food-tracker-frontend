import router from '../router';
import { useUserStore } from '../stores/user';

export default class Service {

    async fetchData(uri, options, queryParams = {}) {
        try {

            const response = await fetch(
                import.meta.env.VITE_BD + uri + '?' + new URLSearchParams(queryParams),
                options
            );

            const isOk = response.ok;
            const status = response.status;
            const data = status != 204 && status != 419 ? await response.json() : null;

            const userStore = useUserStore();
            const { logout } = userStore;

            if (status == 419 || status == 401) {
                logout();
                router.push({ name: 'login' });
                return {};
            }

            if(status == 502) {
                console.error("502!!!");
            }

            return {
                isOk,
                data,
                status
            };

        } catch (error) {
            console.error(error);
            return {
                isOk: false,
                data: error,
                status: 500
            };
        }
    }

    fetchWithBody(path, method, body, token) {
        return this.fetchData(
            path,
            {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body
            }
        );
     };

}