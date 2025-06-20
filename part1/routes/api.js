var express = require('express');
var router = express.Router();

/* api/dogs

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
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
