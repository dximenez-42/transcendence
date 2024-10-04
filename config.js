const config = {
    SECRET_KEY: 'django-insecure-h#t7m@i&=4wq85em)%)z8j7dlj*m)4@9tusb9ugfl58ntfjd)x',
    DJANGO_DEBUG: true, // Change to boolean
    CLIENT_ID: 'u-s4t2ud-da24ef20df28e232477906fab1cef244486b986e4500de2e7823304ade8d7ca3',
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
