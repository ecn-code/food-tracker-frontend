import Service from "./Service";

export default class LoginService extends Service {

    async login(username, password) {
        const authHeader = btoa(`${username}:${password}`);
        return await super.fetchData(
            '/users/login',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${authHeader}`
                },
            }
        );
    }

}