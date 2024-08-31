export function setUserSession(userId="123456", username="carlosga", email="john@example.com") {
    // Set the necessary variables in localStorage

    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);

    console.log('User session set:', {
        userId: userId,
        username: username,
        email: email
    });
}