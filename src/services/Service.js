import router from '../router';
import { useUserStore } from '../stores/user';

export default class Service {

    async fetchData(uri, options) {
        try {

            const response = await fetch(
                import.meta.env.VITE_BD + uri,
                options
            );

            const isOk = response.ok;
            const status = response.status;
            const data = status == 200 || status == 409 ? await response.json() : null;

            const userStore = useUserStore();
            const { logout } = userStore;

            if (status == 419) {
                logout();
                router.push({ name: 'login' });
                return {};
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
                data: null,
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