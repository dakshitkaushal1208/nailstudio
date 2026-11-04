-- Password reset now uses a 6-digit emailed code. Wrong guesses are counted per code so it cannot be brute-forced.
ALTER TABLE password_reset_tokens ADD COLUMN attempts INT NOT NULL DEFAULT 0;
