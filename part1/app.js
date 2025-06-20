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
    console.log("[DB] creating/resetting db: ", process.env.DB_NAME, " the nconnecting and adding tables");
    await connection.query(await fs.readFile(path.join(__dirname, "Part5-Tables.sql"), "utf8"));

    console.log("[DB] insertign rows into db");
    // Populate tables
    await connection.query(await fs.readFile(path.join(__dirname, "Part5-Rows.sql"), "utf8"));

    await connection.end();

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
