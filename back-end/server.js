const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
const crypto = require('crypto');

const hash = crypto.createHash('sha256')
    .update('password123')
    .digest('hex');

console.log(hash);

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Update with your MySQL password
    database: 'my_database'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Registration Route
app.post('/register', async (req, res) => {
    const { name, age, gender, email, mobile, password } = req.body;

    // Validate input fields
    if (!name || !age || !gender || !email || !mobile || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the user already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ? OR mobile = ?';
    db.query(checkQuery, [email, mobile], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error.' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Email or Mobile already registered.' });
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error hashing password.' });
            }

            // Insert the user into the database
            const insertQuery = `
                INSERT INTO users (name, age, gender, email, mobile, password)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            db.query(
                insertQuery,
                [name, age, gender, email, mobile, hash],
                (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: 'Database insertion error.' });
                    }
                    return res.status(201).json({ message: 'User registered successfully.' });
                }
            );
        });
    });
});

// Route: User login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if the email exists in the database
    const selectQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(selectQuery, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Incorrect email or password.' });
        }

        const user = results[0];

        // Compare the entered password with the stored hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error comparing passwords.' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect email or password.' });
            }

            // Successful login
            res.status(200).json({ message: 'Login successful.' });
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
