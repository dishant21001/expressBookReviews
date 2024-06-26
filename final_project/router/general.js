const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users").isValid;
let users = require("./auth_users").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const bookList = await new Promise((resolve) => resolve(books));
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books", error });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
    const book = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    });
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: "Book not found", error });
  }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const { author } = req.params;
  try {
    const booksByAuthor = await new Promise((resolve) => {
      const result = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
      resolve(result);
    });
    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      throw new Error("No books found by this author");
    }
  } catch (error) {
    return res.status(404).json({ message: "No books found by this author", error });
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const { title } = req.params;
  try {
    const booksByTitle = await new Promise((resolve) => {
      const result = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
      resolve(result);
    });
    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
    } else {
      throw new Error("No books found with this title");
    }
  } catch (error) {
    return res.status(404).json({ message: "No books found with this title", error });
  }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
    const reviews = await new Promise((resolve, reject) => {
      if (books[isbn] && books[isbn].reviews) {
        resolve(books[isbn].reviews);
      } else {
        reject("No reviews found for this book");
      }
    });
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(404).json({ message: "No reviews found for this book", error });
  }
});

module.exports.general = public_users;
