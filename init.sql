CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  elo INT DEFAULT 1000,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_friendships (
  user_id1 INT,
  user_id2 INT,
  PRIMARY KEY (user_id1, user_id2),
  FOREIGN KEY (user_id1) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id2) REFERENCES users(user_id) ON DELETE CASCADE,
  CHECK (user_id1 <> user_id2)  -- Ensure a user cannot be friends with themselves
);

INSERT INTO users (username, password, email) VALUES ('admin', 'admin', 'admin@example.com');
INSERT INTO users (username, password, email) VALUES ('dximenez', 'dximenez', 'dximenez@42.com');
INSERT INTO users (username, password, email) VALUES ('carlosga', 'carlosga', 'carlosga@42.com');

INSERT INTO user_friendships (user_id1, user_id2) VALUES (1, 2);
INSERT INTO user_friendships (user_id1, user_id2) VALUES (2, 1);

INSERT INTO user_friendships (user_id1, user_id2) VALUES (1, 3);
INSERT INTO user_friendships (user_id1, user_id2) VALUES (3, 1);



CREATE TABLE IF NOT EXISTS tournaments (
  tournament_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  result TEXT
);

CREATE TABLE IF NOT EXISTS tournament_players (
  tournament_id INT,
  player_id INT,
  PRIMARY KEY (tournament_id, player_id),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matches (
  match_id SERIAL PRIMARY KEY,
  player1_id INT,
  player2_id INT,
  FOREIGN KEY (player1_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (player2_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CHECK (player1_id <> player2_id),  -- Ensure a user cannot play against themselves

  score_player1 INT,
  score_player2 INT,

  tournament_id INT,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  play_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);