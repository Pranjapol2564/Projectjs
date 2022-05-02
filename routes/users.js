// importing modules
const express = require("express"),
      router = express.Router(),
      middleware = require("../middleware");

// importing controller
const userController = require('../controllers/user');

// user -> dashboard
router.get("/user", middleware.isLoggedIn, userController.getUserDashboard);

//user -> issue a book
router.post("/books/:book_id/issue/:user_id", middleware.isLoggedIn, userController.postIssueBook);

//user -> show return-renew page
router.get("/books/return-renew", middleware.isLoggedIn, userController.getShowRenewReturn);

//user -> renew book
router.post("/books/:book_id/renew", middleware.isLoggedIn, middleware.isLoggedIn, userController.postRenewBook);

// user -> return book

router.post("/books/:book_id/return", middleware.isLoggedIn, userController.postReturnBook);


module.exports = router;