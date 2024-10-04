function userList() {
    const users = getUsers();
    console.log("RENDERIZANDO USERS");
    const container = document.getElementById('userList');
    
    container.innerHTML = '';

    users.forEach(person => {
        const personDiv = document.createElement('div');
        personDiv.className = 'user-card';
        
        personDiv.innerHTML = `
            <div class="col-4">
                <h2>${person.name}</h2>
            </div>
            <div class="col-4">
                <p>Age: ${person.age}</p>
            </div>
            <div class="col-4">
                <p>Job: ${person.job}</p>
            </div>
            `;
        
        container.appendChild(personDiv);
    });
}

export function renderUsers() {
    userList();
}