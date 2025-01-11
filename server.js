require('dotenv').config();
const express = require('express');
const basicAuth = require('express-basic-auth');

const app = express();
const port = 3000;

// Basic Authentication setup
const authUsers = {};
authUsers[process.env.USERNAME] = process.env.PASSWORD;

// Middleware for Basic Auth
app.use('/secret', basicAuth({
    users: authUsers,
    challenge: true, // Prompts the browser for login
    unauthorizedResponse: (req) => 'Unauthorized Access',
}));

// Routes
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.get('/secret', (req, res) => {
    res.send(process.env.SECRET_MESSAGE);
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

