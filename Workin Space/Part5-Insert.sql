-- v1 20/06 4pm

INSERT INTO users (username, email, password_hash, role) VALUES
("alice123", "alice@example.com", "hashed123", "owner"),
("bobwalker", "bob@example.com", "hashed456", "walker"),
("carol123", "carol@example.com", "hashed789", "owner"),
("exampasser123", "passing@exam.com", "hashed98", "walker"),
("examsuccess99", "winning@exam.com", "hashed99", "owner");

INSERT INTO dogs (name, size, owner_id) VALUES
("Max", "medium", (SELECT id FROM users WHERE username = "alice123")),
("Bella", "small", (SELECT id FROM users WHERE username = "carol123")),
("Scooby", "large", (SELECT id FROM users WHERE username = "examsuccess99")),
("Knine", "small", (SELECT id FROM users WHERE username = "examsuccess99")),
("Maxwell", "medium", (SELECT id FROM users WHERE username = "exampasser123"));

INSERT INTO walk_requests (dog_id, requested_time, duration_minutes, location, status) VALUES
((SELECT id FROM dogs WHERE name = "Max"), "2025-06-10 08:00:00", 30, "Parklands", "open"),
((SELECT id FROM dogs WHERE name = "Bella"), "2025-06-10 09:30:00", 45, "Beachside Ave", "accepted"),
((SELECT id FROM dogs WHERE name = "Scooby"), "2025-06-20 08:30:00", 45, "Starting Ave", "accepted"),
((SELECT id FROM dogs WHERE name = "Knine"), "2025-06-21 01:30:00", 60, "Middle St", "open"),
((SELECT id FROM dogs WHERE name = "Maxwell"), "2025-06-21 16:30:00", 30, "Final Blvd", "open");
