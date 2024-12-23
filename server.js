const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

let users = {}; // In-memory user storage (for demo purposes)

// CSV Writer setup
const csvWriter = createCsvWriter({
    path: 'log.csv',
    header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'lastName', title: 'Last Name' },
        { id: 'timestamp', title: 'Login Time' }
    ],
    append: true // Append to the file if it exists
});

// Register endpoint
app.post('/register', (req, res) => {
    const { id, name, lastName } = req.body;
    if (users[id]) {
        return res.status(400).json({ message: 'User  already exists' });
    }
    users[id] = { name, lastName };
    res.cookie('userId', id, { httpOnly: true });
    res.json({ message: 'User  registered successfully' });
});

// Login endpoint
app.get('/login', (req, res) => {
    const userId = req.cookies.userId;
    if (userId && users[userId]) {
        // Log the login event
        const user = users[userId];
        const loginData = {
            id: userId,
            name: user.name,
            lastName: user.lastName,
            timestamp: new Date().toISOString() // Current timestamp
        };

        // Write to CSV
        csvWriter.writeRecords([loginData]) // returns a promise
            .then(() => {
                console.log('Login data logged to CSV');
            })
            .catch(err => {
                console.error('Error writing to CSV:', err);
            });

        return res.json({ loggedIn: true, user: user });
    }
    res.json({ loggedIn: false });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});