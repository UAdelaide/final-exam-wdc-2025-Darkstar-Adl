var createError = require('http-errors');
const express = require('express');
const pool = require('../db.js');
const router = express.Router();

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
router.get('/dogs', async function(req, res, next) {
  const [rows] = await pool.query(`
        SELECT d.name AS dog_name, d.size, u.username AS owner_username
        FROM Dogs AS d
        JOIN Users AS u ON Dogs.owner_id = Users.user_id
        ;
    `);
    res.json(rows);
});

// catch 404 and forward to error handler
router.use(function(req, res, next) {
  next(createError(404));
});

module.exports = router;
