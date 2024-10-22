# Structure
```
ft_transcendence
├── Makefile
├── README.md
├── backend
│   ├── auth
│   │   ├── Dockerfile
│   │   ├── auth
│   │   │   ├── __init__.py
│   │   │   ├── asgi.py
│   │   │   ├── settings.py
│   │   │   ├── urls.py
│   │   │   └── wsgi.py
│   │   ├── auth_app
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── migrations
│   │   │   │   └── __init__.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── tests.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── manage.py
│   │   └── requirements.txt
│   ├── chat
│   │   ├── Dockerfile
│   │   ├── chat
│   │   │   ├── __init__.py
│   │   │   ├── asgi.py
│   │   │   ├── settings.py
│   │   │   ├── urls.py
│   │   │   └── wsgi.py
│   │   ├── chat_app
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── consumers.py
│   │   │   ├── middleware.py
│   │   │   ├── migrations
│   │   │   │   └── __init__.py
│   │   │   ├── models.py
│   │   │   ├── routing.py
│   │   │   ├── tests.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   └── requirements.txt
│   ├── games
│   │   ├── Dockerfile
│   │   ├── games
│   │   │   ├── __init__.py
│   │   │   ├── asgi.py
│   │   │   ├── settings.py
│   │   │   ├── urls.py
│   │   │   └── wsgi.py
│   │   ├── games_app
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── consumers.py
│   │   │   ├── middleware.py
│   │   │   ├── migrations
│   │   │   │   └── __init__.py
│   │   │   ├── models.py
│   │   │   ├── routing.py
│   │   │   ├── tests.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── manage.py
│   │   └── requirements.txt
│   ├── tournaments
│   │   ├── Dockerfile
│   │   ├── manage.py
│   │   ├── requirements.txt
│   │   ├── tournaments
│   │   │   ├── __init__.py
│   │   │   ├── asgi.py
│   │   │   ├── settings.py
│   │   │   ├── urls.py
│   │   │   └── wsgi.py
│   │   └── tournaments_app
│   │       ├── __init__.py
│   │       ├── admin.py
│   │       ├── apps.py
│   │       ├── middleware.py
│   │       ├── migrations
│   │       │   └── __init__.py
│   │       ├── models.py
│   │       ├── tests.py
│   │       ├── urls.py
│   │       └── views.py
│   └── users
│       ├── Dockerfile
│       ├── manage.py
│       ├── requirements.txt
│       ├── users
│       │   ├── __init__.py
│       │   ├── asgi.py
│       │   ├── settings.py
│       │   ├── urls.py
│       │   └── wsgi.py
│       └── users_app
│           ├── __init__.py
│           ├── admin.py
│           ├── apps.py
│           ├── middleware.py
│           ├── migrations
│           │   └── __init__.py
│           ├── models.py
│           ├── tests.py
│           ├── urls.py
│           └── views.py
├── config.js
├── docker-compose.yml
├── frontend
│   ├── animations.js
│   ├── api
│   │   ├── chat.js
│   │   ├── game.js
│   │   ├── languages.js
│   │   ├── session.js
│   │   └── users.js
│   ├── app.js
│   ├── components
│   │   ├── chat.js
│   │   ├── game.js
│   │   ├── gameSettings.js
│   │   ├── home.js
│   │   ├── login.js
│   │   ├── profile.js
│   │   └── tournamentSettings.js
│   ├── game
│   │   ├── CSS
│   │   │   └── pong.css
│   │   ├── README.md
│   │   ├── constants.js
│   │   ├── controls.js
│   │   ├── edgeJudge.js
│   │   ├── format.md
│   │   ├── index.html
│   │   ├── infoHandler.js
│   │   ├── main.js
│   │   ├── pong.js
│   │   └── socket.js
│   ├── index.html
│   ├── languages
│   │   ├── en.json
│   │   ├── es.json
│   │   └── fr.json
│   ├── library.css
│   ├── package-lock.json
│   ├── package.json
│   ├── styles.css
│   └── templates
│       ├── 1vs1_settings.html
│       ├── 404.html
│       ├── chat.html
│       ├── create_game.html
│       ├── game.html
│       ├── game_index.html
│       ├── game_online.html
│       ├── game_settings.html
│       ├── home.html
│       ├── login.html
│       ├── online_settings.html
│       ├── profile.html
│       ├── tournament.html
│       └── tournament_settings.html
├── microservices.txt
├── nginx
│   ├── default.conf
│   └── nginx.conf
├── postgres
│   ├── init.sql
│   └── pgadmin
│       └── servers.json
└── python.py
```
