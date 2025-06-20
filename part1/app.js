var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');


var indexRouter = require('./routes/index');
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
      host: 'localhost',
      user: 'root',
      password: ''
    });

    // Create db if doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS testdb');
    await connection.end();

    // Connect to db
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'testdb'
    });

    // Create tables that doent already exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        author VARCHAR(255)
      )
    `);

    // Populate tables
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
    console.error('There was an error in db init. Mysql might not have been started try: service mysql start', err);
  }
})();



app.use('/', indexRouter);
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
