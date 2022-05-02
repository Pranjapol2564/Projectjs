const express = require("express"),
      router = express.Router();


// Importing controller
const bookController = require('../controllers/books');

// Browse books
router.get("/books/:filter/:value", bookController.getBooks);

// Fetch books by search value
router.post("/books/:filter/:value", bookController.findBooks);


module.exports = router;