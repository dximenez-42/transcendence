-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Assuming you'll store hashed passwords
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sender FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_receiver FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Pong Games Table
CREATE TABLE IF NOT EXISTS pong_games (
    id SERIAL PRIMARY KEY,
    player1_id INT NOT NULL,
    player2_id INT NOT NULL,
    winner_id INT,
    game_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    game_end TIMESTAMP,
    player1_score INT DEFAULT 0,
    player2_score INT DEFAULT 0,
    CONSTRAINT fk_player1 FOREIGN KEY(player1_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_player2 FOREIGN KEY(player2_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_winner FOREIGN KEY(winner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Pong Tournaments Table
CREATE TABLE IF NOT EXISTS pong_tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organizer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_organizer FOREIGN KEY(organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tournament Participants Table
CREATE TABLE IF NOT EXISTS tournament_participants (
    id SERIAL PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tournament FOREIGN KEY(tournament_id) REFERENCES pong_tournaments(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tournament Matches Table
CREATE TABLE IF NOT EXISTS tournament_matches (
    id SERIAL PRIMARY KEY,
    tournament_id INT NOT NULL,
    game_id INT NOT NULL,
    round INT NOT NULL,
    CONSTRAINT fk_tournament FOREIGN KEY(tournament_id) REFERENCES pong_tournaments(id) ON DELETE CASCADE,
    CONSTRAINT fk_game FOREIGN KEY(game_id) REFERENCES pong_games(id) ON DELETE CASCADE
);
