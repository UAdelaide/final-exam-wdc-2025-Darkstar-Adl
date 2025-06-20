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
router.get('/walkrequests/open', async function(req, res, next) {
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
router.get('/walkers/summary', async function(req, res, next) {
  const [rows] = await pool.query(`
        SELECT u.username AS walker_username,
            COUNT(ra.rating_id) AS total_ratings,
            AVG(ra.rating) AS average_rating,
            COUNT(re) AS completed_walks
        FROM Users AS u
        LEFT JOIN WalkRequests AS re
        LEFT JOIN WalkRatings AS ra
        GROUP BY u.user_id
        ;
    `);
    res.json(rows);
});

// SELECT * FROM r WHERE r.walker_id =


module.exports = router;
