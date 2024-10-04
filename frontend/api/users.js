const URL_API='http://localhost:8080/api'


export function getUsers() {
    const data = [
        { name: 'Alice', age: 30, job: 'Engineer' },
        { name: 'Bob', age: 25, job: 'Designer' },
        { name: 'Charlie', age: 35, job: 'Teacher' }
    ];
    console.log(data);
    return data;
}


export async function getUser() {
    const url = `api/users/me`;
    const token = sessionStorage.getItem('auth_token');
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });

        if (response.ok) {
            const res = await response.json();
            return res.user;
        } else {
            console.error("Fetch failed with status:", response.status);
            console.log("Response error:",response);
            return [];
        }
    } catch (error) {
        console.error("There was a problem with the Fetch request:", error.message);
        return [];
    }
    return user
}