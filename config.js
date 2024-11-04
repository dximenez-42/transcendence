const config = {
    SECRET_KEY: 'django-insecure-h#t7m@i&=4wq85em)%)z8j7dlj*m)4@9tusb9ugfl58ntfjd)x',
    DJANGO_DEBUG: true, // Change to boolean
    CLIENT_ID: 'u-s4t2ud-f22922ae1f5ec8fb7ff691ca5ddb9a1e758c6f4e446bb65df248559bfc08f037',
    CLIENT_SECRET: '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',
    HOST: 'localhost',
    PORT: 8080,
    REDIRECT_URI: function() {
        return `http://${this.HOST}:${this.PORT}/api/auth/login`;
    },
    URL_API: function() {
        return `http://${this.HOST}:${this.PORT}/api`;
    },
    POSTGRES_DB: 'mydatabase',
    POSTGRES_USER: 'myuser',
    POSTGRES_PASSWORD: 'mypassword',
    PGADMIN_DEFAULT_EMAIL: 'admin@example.com',
    PGADMIN_DEFAULT_PASSWORD: 'admin'
};

// Export the config object
export default config;
