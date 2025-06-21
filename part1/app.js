var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');
require('dotenv').config();
var fs = require('fs').promises;


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



(async () => {
  try {
    // Connect without db, and no password
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    // Create db and tables if doesn't exist, reset if do
    console.log("[DB] creating/resetting db: ", process.env.DB_NAME, " then connecting to db and adding tables");
    await connection.query(await fs.readFile(path.join(__dirname, "Part5-Tables.sql"), "utf8"));

    console.log("[DB] insertign rows into db");
    // Populate tables
    await connection.query(await fs.readFile(path.join(__dirname, "Part5-Rows.sql"), "utf8"));

    await connection.end();

  } catch (err) {
    console.error('There was an error in db init. Mysql might not have been started try: service mysql start', err);
  }
})();

var pool = require('./db.js');



app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/api', apiRouter);
// I moved the routes from the the api route to app.js becasue that fits the task desc best,
// and these things can be picky sometimes... (api route file still exists though)





/* /api/dogs
Return a list of all dogs with their size and owner's username.
Sample Response:
[
  {
    "dog_name": "Max",
    "size": "medium",
    "owner_username": "alice123"
  },
  {
    "dog_name": "Bella",
    "size": "small",
    "owner_username": "carol123"
  }
]
*/
app.get('/api/dogs', async function(req, res, next) {
  // These routes are in app.js because it fits the task desc best,
  // they could also be in the /api route
  const [rows] = await pool.query(`
        SELECT d.name AS dog_name, d.size, u.username AS owner_username
        FROM Dogs AS d
        JOIN Users AS u ON d.owner_id = u.user_id
        ;
    `);
    res.json(rows);
});

/* /api/walkrequests/open
Return all open walk requests,
including the dog name, requested time, location, and owner's username.
Sample Response:
[
  {
    "request_id": 1,
    "dog_name": "Max",
    "requested_time": "2025-06-10T08:00:00.000Z",
    "duration_minutes": 30,
    "location": "Parklands",
    "owner_username": "alice123"
  }
]
*/
app.get('/api/walkrequests/open', async function(req, res, next) {
  const [rows] = await pool.query(`
        SELECT w.request_id, d.name AS dog_name, w.requested_time, w.duration_minutes, w.location, u.username AS owner_username
        FROM WalkRequests AS w
        JOIN Dogs AS d ON d.owner_id = w.dog_id
        JOIN Users AS u ON d.owner_id = u.user_id
        ;
    `);
    res.json(rows);
});

/* /api/walkers/summary
Return a summary of each walker with their average rating and number of completed walks.
Sample Response:
[
  {
    "walker_username": "bobwalker",
    "total_ratings": 2,
    "average_rating": 4.5,
    "completed_walks": 2
  },
  {
    "walker_username": "newwalker",
    "total_ratings": 0,
    "average_rating": null,
    "completed_walks": 0
  }
]
*/
app.get('/api/walkers/summary', async function(req, res, next) {
  const [rows] = await pool.query(`
        SELECT u.username AS walker_username,
            COUNT(rt.rating_id) AS total_ratings,
            AVG(rt.rating) AS average_rating,
            COUNT(CASE WHEN rq.status = "completed" THEN 1 END) AS completed_walks
        FROM Users AS u
        LEFT JOIN WalkRatings AS rt ON rt.walker_id = u.user_id
        LEFT JOIN WalkRequests AS rq ON rq.request_id = rt.walker_id
        WHERE u.role = 'walker'
        GROUP BY u.user_id
        ;
    `);
    res.json(rows);
});





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
