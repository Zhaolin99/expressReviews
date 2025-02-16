const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");


public_users.post("/register", (req,res) => {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  let username = req.body.username;
  let password = req.body.password;
  console.log(req.body)
  if (username && password) {
    if (isValid(username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "User registered successfully" });
    } else {
      return res.status(400).json({ message: "Username already exists" });
    }
  } else {
    return res.status(400).json({ message: "Username or password not provided" });
  }
});

//Task 1/10 getting the list of books available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
  console.log('Book lists:');
  //res.status(200).send(JSON.stringify({books}, null, 4));
  try {
    // Use Promise to resolve local books or Axios to fetch from an API
    const bookList = await new Promise(async (resolve, reject) => {
      try {
        const response = await axios.get('https://zlzhong8j-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books');
        resolve(response.data); // Return books from external API
      } catch (error) {
        console.error('Axios fetch failed, defaulting to local books:', error.message);
        resolve(books); // Fallback to local books if Axios fails
      }
    });

    // Return the book list as JSON
    res.status(200).json(bookList);
  } catch (error) {
    console.error('Error retrieving book list:', error.message);
    res.status(500).json({ message: "Error retrieving book list" });
  }
});

// Task 2/11 Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  let isbn = req.params.isbn;

  // Task2
  //if(books[isbn]){
  //return res.status(200).send(JSON.stringify(books[isbn],null,4));
  //}else{
  //return res.status(404).send("Given ISBN:"+isbn+", NOT FOUND");
  //}
  axios.get('https://zlzhong8j-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books')
      .then((response) => {
        if (response.data[isbn]) {
          res.status(200).send(JSON.stringify(response.data[isbn], null, 4));
        } else {
          res.status(404).send("No book found with ISBN " + isbn);
        }
      })
      .catch((error) => {
        console.error(error);
        if (books[isbn]) {
          res.status(200).send(JSON.stringify(books[isbn], null, 4));
        } else {
          res.status(404).send("No book found with ISBN " + isbn + " in local records");
        }
      });
});

// Task 3/12 Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  let author = req.params.author;
  //const booksByAuthor = Object.values(books).filter(book => book.author === author);
  //if (booksByAuthor.length > 0) {
  //return res.status(200).json(booksByAuthor);
  //} else {
  //return res.status(404).send(`No book found with author ${author}`);
  //}

  axios.get('https://zlzhong8j-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books')
      .then((response) => {
        if (response.data[author]) {
          res.status(200).send(JSON.stringify(response.data[author], null, 4));
        } else {
          res.status(404).send("No book found with author " + author);
        }
      })
      .catch((error) => {
        console.error(error);
        if (books[author]) {
          res.status(200).send(JSON.stringify(books[author], null, 4));
        } else {
          res.status(404).send("No book found with author " + author + " in local records");
        }
      });

});

// Task 4/13 Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title;
  //const booksByTitle = Object.values(books).filter(book => book.title === title);

  //if (booksByTitle.length > 0) {
  //return res.status(200).json(booksByTitle);
  //} else {
  //return res.status(404).send(`No Book found with Title ${title}`);
  //}

  axios.get('https://zlzhong8j-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books')
      .then((response) => {
        const book = Object.values(response.data).find(book => book.title === title);
        if (book) {
          return res.status(200).json(book);
        }
        const localBook = Object.values(books).find(book => book.title === title);
        if (localBook) {
          return res.status(200).json(localBook);
        }
        res.status(404).send(`No book found with title "${title}" in API or local records`);
      })
      .catch((error) => {
        console.error('Error fetching from API:', error.message);
        const localBook = Object.values(books).find(book => book.title === title);
        if (localBook) {
          return res.status(200).json(localBook);
        }
        res.status(404).send(`No book found with title "${title}" in local records`);
      });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  if(books[isbn]){
    return res.status(200).send(JSON.stringify(books[isbn].reviews,null,4));
  }
  else{
    return res.status(404).send("Given ISBN:"+isbn+", NOT FOUND");
  }
});

module.exports.general = public_users;
