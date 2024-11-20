
export async function getUser() {
    const url = `api/users/me`;
    const token = sessionStorage.getItem('auth_token');
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': token,
        },
    });

    if (response.ok) {
        const res = await response.json();
        return res.user;
    } else if (response.status === 401) {
        sessionStorage.clear();
        window.location.hash = '#login';
    } else {
        console.error("Fetch failed with status:", response.status);
        // console.log("Response error:", response);
        return [];
    }
}

export async function getBlockedUsers() {
    const url = 'api/users/blocked';
    // console.log(url);
    const token = sessionStorage.getItem('auth_token');
    // console.log(token);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });

        if (response.ok) {
            const users = await response.json();
            // console.log(users.blocked);
            return users.blocked;
        } else if (response.status === 401) {
            sessionStorage.clear();
            window.location.hash = '#login';
        } else {
            console.error("Fetch failed with status:", response.status);
            // console.log("Response", response);
            return [];
        }
    } catch (error) {
        console.error("There was a problem with the Fetch request:", error.message);
        return [];
    }
}

export async function blockUser(userId) {
    const url = "api/users/block/" + userId;
    const token = sessionStorage.getItem('auth_token');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Authorization": token
            },
        })
        if (response.ok) {
            // console.log("User Blocked successfully");
            return true;
        } else if (response.status === 401) {
            sessionStorage.clear();
            window.location.hash = '#login';
        }
    } catch (error) {
        console.error("There was a problem blocking user:", error.message);
    }
}


export async function unblockUser(userId) {
    const url = "api/users/unblock/" + userId;
    const token = sessionStorage.getItem('auth_token');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Authorization": token
            },
        })
        if (response.ok) {
            // console.log("User Blocked successfully");
            return true;
        } else if (response.status === 401) {
            sessionStorage.clear();
            window.location.hash = '#login';
        }
    } catch (error) {
        console.error("There was a problem blocking user:", error.message);
    }
}


export async function updateUsername(newName) {
    const url = "api/users/edit";
    const token = sessionStorage.getItem('auth_token');
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                "Authorization": token
            },
            body: JSON.stringify({
                username: sessionStorage.getItem('username'),
                name: newName,
            }),

        })
        if (response.ok) {
            sessionStorage.setItem('name', newName);
            // console.log("Username updated successfully");
            return true;
        } else if (response.status === 401) {
            sessionStorage.clear();
            window.location.hash = '#login';
        }
    } catch (error) {
        console.error("There was a problem updating username:", error.message);
    }
}