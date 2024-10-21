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

CREATE TYPE status_enum AS ENUM ('open', 'preparing', 'ready', 'playing', 'finished');

CREATE table IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    host_id INT NOT NULL,
    FOREIGN KEY (host_id) REFERENCES users(id),
    status status_enum DEFAULT 'open',
    max_players INT NOT NULL,
    room_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE table IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    host_id INT NOT NULL,
    FOREIGN KEY (host_id) REFERENCES users(id),
    status status_enum DEFAULT 'open',
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

CREATE TABLE IF NOT EXISTS tournament_players (
    id SERIAL PRIMARY KEY,
    tournament_id INT NOT NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    player_id INT NOT NULL,
    FOREIGN KEY (player_id) REFERENCES users(id),
    eliminated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE table IF NOT EXISTS users_blocked (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    blocked_id INT NOT NULL,
    FOREIGN KEY (blocked_id) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    room_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users_chats (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    chat_id INT NOT NULL,
    FOREIGN KEY (chat_id) REFERENCES chats(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    chat_id INT NOT NULL,
    FOREIGN KEY (chat_id) REFERENCES chats(id),
    content TEXT NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, username, email, token) VALUES ('Admin', 'admin', 'admin@example.com', 'admin');
INSERT INTO users (name, username, email, token) VALUES ('dani', 'dximenez', 'dximenez@student.42madrid.com', 'dximenez');
INSERT INTO users (name, username, email, token) VALUES ('carlos', 'carlosga', 'carlosga@student.42madrid.com', 'carlosga');
INSERT INTO users (name, username, email, token) VALUES
('John Doe', 'johndoe', 'johndoe@example.com', 'token123'),
('Jane Smith', 'janesmith', 'janesmith@example.com', 'token456'),
('Alice Johnson', 'alicej', 'alice@example.com', 'token789'),
('Bob Brown', 'bobb', 'bob@example.com', 'token321'),
('Charlie Davis', 'charlied', 'charlie@example.com', 'token654');
