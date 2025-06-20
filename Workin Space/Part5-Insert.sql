INSERT INTO users (username, email, password_hash, role) ('alice123', 'alice@example.com', 'hashed123', 'owner'),
('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('exampasser123', 'passing@exam.com', 'hashed98', 'walker'),
('examsuccess99', 'winning@exam.com', 'hashed99', 'owner');

INSERT INTO dogs (name, size, owner_id)
('Max', 'medium', (SELECT id FROM users WHERE username = 'alice123')),
('Bella', 'small', (SELECT id FROM users WHERE username = 'carol123')),
('Scooby', 'large', (SELECT id FROM users WHERE username = 'examsuccess99')),
('Knine', 'small', (SELECT id FROM users WHERE username = 'examsuccess99')),
('Maxwell', 'medium', (SELECT id FROM users WHERE username = 'exampasser123')),

INSERT INTO walk_requests (dog_id, requested_time, duration_minutes, location, status)
