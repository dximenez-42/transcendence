# Structure
```
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
├── nginx/
│   ├── default.conf
│   └── nginx.conf
│
├── frontend/
│
│
└── pgadmin/
```