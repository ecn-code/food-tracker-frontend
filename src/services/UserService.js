import Service from "./Service";
import { useUserStore } from "../stores/user";
import { storeToRefs } from 'pinia';

export default class UserService extends Service {

    RESOURCE = '/users';

    get() {
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
            }
        );
    };

}