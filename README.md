ft_transcendence/
│
├── Makefile
├── docker-compose.yml
├── .env
│
├── backend/
│   ├── auth/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   ├── settings.py
│   │   │   ├── urls.py
│   │   │   └── wsgi.py
│   │   ├── manage.py
│   │   └── auth_app/
│   │       ├── __init__.py
│   │       ├── admin.py
│   │       ├── apps.py
│   │       ├── models.py
│   │       ├── serializers.py
│   │       ├── tests.py
│   │       ├── urls.py
│   │       └── views.py
│   └── service-two
│
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   └── App.js
│   └── public/
│       └── index.html
│
│
└── pgadmin/