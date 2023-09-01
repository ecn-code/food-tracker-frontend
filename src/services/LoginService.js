export default class LoginService {

    check = (response) => {
        if (response.ok) {
            return response.json();
        }

        response.json().then((data) => {
            console.log(data);
        });
        throw new Error('Authentication failed');
    };

    error = (msg, errorCallback) => {
        alert(msg);
        errorCallback();
    }

    async login(username, password) {
        const authHeader = btoa(`${username}:${password}`);
        const response = await fetch(
            'http://localhost:3000/users/login',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${authHeader}`
                }
            }
        );
        const isOk = response.ok;
        const data = await response.json();
        return {
            isOk,
            data
        };
    }

}