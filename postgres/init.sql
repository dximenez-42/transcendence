-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    token VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE table IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE game_status AS ENUM ('open', 'ready', 'playing', 'finished');

CREATE table IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    host_id INT NOT NULL,
    FOREIGN KEY (host_id) REFERENCES users(id),
    status game_status DEFAULT 'open',
    room_id VARCHAR(255) NOT NULL,
    tournament_id INT,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE table IF NOT EXISTS game_players (
    id SERIAL PRIMARY KEY,
    game_id INT NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id),
    player_id INT NOT NULL,
    FOREIGN KEY (player_id) REFERENCES users(id),
    score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
