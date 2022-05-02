// importing dependencies
const fs = require('fs');

// importing models
const Book = require('../models/book');
const User = require('../models/user');
const Activity = require('../models/activity');
const Issue = require('../models/issue');

// GLOBAL_VARIABLES

// admin -> show dashboard working procedure
/*
    1. Get user, book and activity count
    2. Fetch all activities in chunk (for pagination)
    3. Render admin/index
*/
exports.getDashboard = async(req, res, next) => {
    try{
        const users_count = await User.find().countDocuments() - 1;
        const books_count = await Book.find().countDocuments();
        const activity_count = await Activity.find().countDocuments();
        const activities = await Activity
            .find()
            .sort('-entryTime')

        res.render("admin/index", {
            users_count : users_count,
            books_count : books_count,
            activities : activities,
            });   
    } catch(err) {
        console.log(err)
    }
}

// admin -> search activities working procedure
/*
    1. Get user and book count
    2. Fetch activities by search query
    3. Render admin/index
    **pagination is not done
*/
exports.postDashboard = async(req, res, next) => {
    try {
        const search_value = req.body.searchUser;
        
        // getting user and book count
        const books_count = await Book.find().countDocuments();
        const users_count = await User.find().countDocuments();

        // fetching activities by search query
        const activities = await Activity
            .find({
                $or : [
                    {"user_id.username" :search_value},
                    {"category" : search_value}
                ]
            });

        // rendering
        res.render("admin/index", {
            users_count: users_count,
            books_count: books_count,
            activities: activities,
            current: 1,

        });      
        
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
}


// admin -> get book inventory working procedure
/*
    1. Construct search object
    2. Fetch books by search object
    3. Render admin/bookInventory
*/
exports.getAdminBookInventory = async(req, res, next) => {
    try{
        const filter = req.params.filter;
        const value = req.params.value;

        // console.log(filter, value);
        // // constructing search object
        let searchObj = {};
        if(filter !== 'all' && value !== 'all') {
            // fetch books by search value and filter
            searchObj[filter] = value;
         }

        // get the book counts
        const books_count = await Book.find(searchObj).countDocuments();

        // fetching books
        const books = await Book
            .find(searchObj)
        
        // rendering admin/bookInventory
        res.render("admin/bookInventory", {
            books : books,
            filter : filter,
            value : value,
        });
    } catch(err) {
        // console.log(err.messge);
        return res.redirect('back');
    }
}

// admin -> return book inventory by search query working procedure
/*
    same as getAdminBookInventory method
*/
exports.postAdminBookInventory = async(req, res, next) => {
    try {
        const filter = req.body.filter.toLowerCase();
        const value = req.body.searchName;

        if(value == "") {
            req.flash("error", "Search field is empty. Please fill the search field in order to get a result");
            return res.redirect('back');
        }
        const searchObj = {};
        searchObj[filter] = value;

        // get the books count
        const books_count = await Book.find(searchObj).countDocuments();

        // fetch the books by search query
        const books = await Book
            .find(searchObj)

        
        // rendering admin/bookInventory
        res.render("admin/bookInventory", {
            books: books,
            filter: filter,
            value: value,
        });

    } catch(err) {
        // console.log(err.message);
        return res.redirect('back');
    }
}

// admin -> get the book to be updated
exports.getUpdateBook = async (req, res, next) => {

    try {
        const book_id = req.params.book_id;
        const book = await Book.findById(book_id);

        res.render('admin/book', {
            book: book,
        })
    } catch(err) {
        console.log(err);
        return res.redirect('back');
    }
};

// admin -> post update book
exports.postUpdateBook = async(req, res, next) => {

    try {
        const book_info = req.body.book;
        const book_id = req.params.book_id;

        await Book.findByIdAndUpdate(book_id, book_info);

        res.redirect("/admin/bookInventory/all/all");
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> delete book
exports.getDeleteBook = async(req, res, next) => {
    try {
        const book_id = req.params.book_id;

        const book = await Book.findById(book_id);
        await book.remove();

        req.flash("success", `A book named ${book.title} is just deleted!`);
        res.redirect('back');

    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> get user list
exports.getUserList = async (req, res, next) =>  {
    try {
        const users = await User
            .find()
            .sort('-joined')

        const users_count = await User.find().countDocuments();

        res.render('admin/users', {
            users: users,
        });

    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> show searched user
exports.postShowSearchedUser = async (req, res, next) => {
    try {
        const search_value = req.body.searchUser;

        const users = await User.find({
            $or: [
                {"firstName": search_value},
                {"lastName": search_value},
                {"username": search_value},
                {"email": search_value},
            ]
        });

        if(users.length <= 0) {
            req.flash("error", "User not found!");
            return res.redirect('back');
        } else {
            res.render("admin/users", {
                users: users,
            });
        }
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> flag/unflag user
exports.getFlagUser = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const user = await User.findById(user_id);

        if(user.violationFlag) {
            user.violationFlag = false;
            await user.save();
            req.flash("success", `An user named ${user.firstName} ${user.lastName} is just unflagged!`);
        } else {
            user.violationFlag = true;
            await user.save();
            req.flash("warning", `An user named ${user.firstName} ${user.lastName} is just flagged!`);
        }

        res.redirect("/admin/users");
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> show one user
exports.getUserProfile = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const user = await User.findById(user_id);
        const issues = await Issue.find({"user_id.id": user_id});
        const activities = await Activity.find({"user_id.id": user_id}).sort('-entryTime');

        res.render("admin/user", {
            user: user,
            issues: issues,
            activities: activities,
        });
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
}

// admin -> show all activities of one user
exports.getUserAllActivities = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const activities = await Activity.find({"user_id.id": user_id})
                                         .sort('-entryTime');
        res.render("admin/activities", {
            activities: activities
        });
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> show activities by category
exports.postShowActivitiesByCategory = async (req, res, next) => {
    try {
        const category = req.body.category;
        const activities = await Activity.find({"category": category});

        res.render("admin/activities", {
            activities: activities,
        });
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};

// admin -> delete a user
exports.getDeleteUser = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        const user = await User.findById(user_id);
        await user.remove();

        await Issue.deleteMany({"user_id.id": user_id});
        await Activity.deleteMany({"user_id.id": user_id});

        res.redirect("/admin/users");
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
}

// admin -> add new book
exports.getAddNewBook = (req, res, next) => {
    res.render("admin/addBook");
}

exports.postAddNewBook = async(req, res, next) => {
    try {
        const book_info = req.body.book;
        
        const isDuplicate = await Book.find(book_info);

        if(isDuplicate.length > 0) {
            req.flash("error", "This book is already registered in inventory");
            return res.redirect('back');
        } 

        const new_book = new Book(book_info);
        await new_book.save();
        req.flash("success", `A new book named ${new_book.title} is added to the inventory`);
        res.redirect("/admin/bookInventory/all/all");
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
};
