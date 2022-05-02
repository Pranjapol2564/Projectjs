const Book = require('../models/book');



exports.getBooks = async(req, res, next) => {
    const filter = req.params.filter;
    const value = req.params.value;
    let searchObj = {};
 
    // constructing search object
    if(filter != 'all' && value != 'all') {
       // fetch books by search value and filter
       searchObj[filter] = value;
    }

    try {
       // Fetch books from database
       const books = await Book
       .find(searchObj)

       // Get the count of total available book of given filter
       const count = await Book.find(searchObj).countDocuments();
 
       res.render("books", {
          books: books,
          filter: filter,
          value: value,
          user: req.user,
       })
    } catch(err) {
       console.log(err)
    }
}

exports.findBooks = async(req, res, next) => {
   const filter = req.body.filter.toLowerCase();
   const value = req.body.searchName;

   // show flash message if empty search field is sent to backend
   if(value == "") {
       req.flash("error", "Search field is empty. Please fill the search field in order to get a result");
       return res.redirect('back');
   }

   const searchObj = {};
   searchObj[filter] = value;

   try {
      // Fetch books from database
      const books = await Book
      .find(searchObj)

      // Get the count of total available book of given filter
      const count = await Book.find(searchObj).countDocuments();

      res.render("books", {
         books: books,
         filter: filter,
         value: value,
         user: req.user,
      })
   } catch(err) {
      console.log(err)
   }
}

// find book details working procedure
/*
   1. fetch book from db by id
   2. populate book with associated comments
   3. render user/bookDetails template and send the fetched book
*/