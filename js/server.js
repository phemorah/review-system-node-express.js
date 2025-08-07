const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('reviews.db');
db.run('CREATE TABLE IF NOT EXISTS reviews (name TEXT, rating INTEGER, comment TEXT, date TEXT)');

app.post('/reviews', (req, res) => {
    const { name, rating, comment } = req.body;

    if (!name || !comment || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Invalid input: name, rating (1-5), and comment are required' });
    }

    const date = new Date().toISOString();
    db.run('INSERT INTO reviews (name, rating, comment, date) VALUES (?, ?, ?, ?)', 
           [name, rating, comment, date], 
           function(err) {
               if (err) {
                   console.error('Error saving review:', err);
                   return res.status(500).json({ error: 'Error saving review' });
               }
               res.status(201).json({ message: 'Review saved', id: this.lastID });
           });
});

app.get('/reviews', (req, res) => {
    db.all('SELECT * FROM reviews', [], (err, rows) => {
        if (err) {
            console.error('Error fetching reviews:', err);
            return res.status(500).json({ error: 'Error fetching reviews' });
        }
        res.json(rows);
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));