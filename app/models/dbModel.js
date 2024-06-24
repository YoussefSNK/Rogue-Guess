const db = require('../database/database');


exports.createForm = (title, option, text, callback) => {
    const query = 'INSERT INTO Form (Title, Option, Text) VALUES (?, ?, ?)';
    db.run(query, [title, option, text], function(err) {
        callback(err, this.lastID);
    });
};


exports.getForms = (callback) => {
    const query = 'SELECT * FROM Form';
    db.all(query, [], (err, rows) => {
        callback(err, rows);
    });
};