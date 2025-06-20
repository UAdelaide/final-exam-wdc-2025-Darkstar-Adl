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
        SELECT dog_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    size
        FROM Dogs;
    `);
    res.json()
});

module.exports = router;
