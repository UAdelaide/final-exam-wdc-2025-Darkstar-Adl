var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');
require('dotenv').config();


var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



let db;

(async () => {
  try {
    // Connect without db, and no password
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    // Create db if doesn't exist
    console.log("[DB] creating/resetting db: ", process.env.DB_NAME);
    await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME} ;`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} ;`);
    await connection.end();

    console.log("[DB] connecting to db using: (", process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, ")");
    // Connect to db
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log("[DB] insertign rows into db");
    // Create tables that doent already exist
    await db.query(`
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('owner', 'walker') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Dogs (
    dog_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    size ENUM('small', 'medium', 'large') NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES Users(user_id)
);

CREATE TABLE WalkRequests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    dog_id INT NOT NULL,
    requested_time DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
);

CREATE TABLE WalkApplications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    walker_id INT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
    FOREIGN KEY (walker_id) REFERENCES Users(user_id),
    CONSTRAINT unique_application UNIQUE (request_id, walker_id)
);

CREATE TABLE WalkRatings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    walker_id INT NOT NULL,
    owner_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
    FOREIGN KEY (walker_id) REFERENCES Users(user_id),
    FOREIGN KEY (owner_id) REFERENCES Users(user_id),
    CONSTRAINT unique_rating_per_walk UNIQUE (request_id)
);
      )
    `);

    // Populate tables
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
((SELECT user_id FROM dogs WHERE name = "Max"), "2025-06-10 08:00:00", 30, "Parklands", "open"),
((SELECT user_id FROM dogs WHERE name = "Bella"), "2025-06-10 09:30:00", 45, "Beachside Ave", "accepted"),
((SELECT user_id FROM dogs WHERE name = "Scooby"), "2025-06-20 08:30:00", 45, "Starting Ave", "accepted"),
((SELECT user_id FROM dogs WHERE name = "Knine"), "2025-06-21 01:30:00", 60, "Middle St", "open"),
((SELECT user_id FROM dogs WHERE name = "Maxwell"), "2025-06-21 16:30:00", 30, "Final Blvd", "open");
    `);
  } catch (err) {
    console.error('There was an error in db init. Mysql might not have been started try: service mysql start', err);
  }
})();



app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
