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
        JOIN Users AS u ON d.owner_id = u.user_id
        ;
    `);
    res.json(rows);
});

/* api/walkrequests/open

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
router.get('/walkrequests/open', async function(req, res, next) {
  const [rows] = await pool.query(`
        SELECT w.request_id, d.name AS dog_name, requested_time, duration_minutes, location, u.username AS owner_username
        FROM WalkRequests AS w
        JOIN Dogs AS dw ON wd.owner_id = w.dog_id
        JOIN Users AS u ON d.owner_id = u.user_id
        JOIN Dogs AS uw ON ud.owner_id = w.dog_id
        ;
    `);
    res.json(rows);
});

module.exports = router;
