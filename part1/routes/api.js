var express = require('express');
const pool = require('../db');
var router = express.Router();

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
router.get('/dogs', function(req, res, next) {
  const [rows] = await pool.query(`
    
    `);
});

module.exports = router;
