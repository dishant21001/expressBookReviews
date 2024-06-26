const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check if username and password match the records
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const accessToken = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
  return res.status(200).json({ accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "Failed to authenticate token" });
    }

    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully" });
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "Failed to authenticate token" });
    }

    const username = decoded.username;

    if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
