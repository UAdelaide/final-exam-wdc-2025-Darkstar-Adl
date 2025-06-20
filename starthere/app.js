var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let db;

(async () => {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '' // Set your MySQL root password
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS testdb');
    await connection.end();

    // Now connect to the created database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'testdb'
    });

    // Create a table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        author VARCHAR(255)
      )
    `);

    // Insert data if table is empty
    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM books');
    if (rows[0].count === 0) {
      await db.execute(`
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
      `);
    }
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

// Route to return books as JSON
app.get('/', async (req, res) => {
  try {
    const [books] = await db.execute('SELECT * FROM books');
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;