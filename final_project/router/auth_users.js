const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
 return !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    if (authenticatedUser(username, password)) {
      const token = jwt.sign({ username: username }, "access", { expiresIn: "1h" });
      req.session.authorization = {
        accessToken: token,
        username: username,
      };

      return res.status(200).json({message: "User logged in successfully", token: token,});
    } else {
      return res.status(400).json({ message: "Username or password is incorrect" });
    }
  } else {
    return res.status(400).json({ message: "Username or password not provided" });
  }
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  console.log("Update book review")
  let isbn = req.params.isbn;
  let review = req.query.review;
  let username = req.session.authorization.username;

  if (books[isbn]) {
    // Add or update the user's review
    if (books[isbn].reviews[username]) {
      books[isbn].reviews[username] = [review];
      return res.status(200).json({ message: "Review modified successfully" });
    } else {
      books[isbn].reviews[username] = [review];
      return res.status(200).json({ message: "Review added successfully" });
    }
  } else {
    return res.status(404).json({ message: `No book found with ISBN ${isbn}` });
  }

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (books[isbn]) {
    let book = books[isbn];
    delete book.reviews[username];
    return res.status(200).send("Review successfully deleted");
  }
  else {
    return res.status(404).json({message: `ISBN Not Found`});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

