const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users').authenticated;
const genl_routes = require('./router/general').general;

const app = express();

app.use(express.json());

app.use(session({
  secret: "fingerprint_customer",
  resave: false,
  saveUninitialized: true
}));

app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "Failed to authenticate token" });
    }

    req.user = decoded;
    next();
  });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));
