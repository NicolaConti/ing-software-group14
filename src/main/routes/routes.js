const express = require('express');
const router = express.Router();

// Import MongoDB models and utility functions
const { getNextSequence } = require('../models/counter');
const RegUser = require('../models/RegUser');
const Admin = require('../models/Admin');
const LoginHistory = require('../models/LoginHistory');
const Segnalazione = require('../models/Segnalazione');

// Middleware for checking authentication
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.status(401).send('User not authenticated');
    }
}

// API route for user authentication
router.get('/username', ensureAuthenticated, (req, res) => {
    res.json({ username: req.session.user });
});

// API route to handle new segnalazione creation
router.post('/segnalazioni', ensureAuthenticated, async (req, res) => {
    try {
        const { tipo, commento, coordinate } = req.body;

        const newSegnalazione = new Segnalazione({
            id: await getNextSequence('segnalazioni'),
            tipo,
            commento,
            coordinate
        });

        await newSegnalazione.save();
        res.json(newSegnalazione);
    } catch (error) {
        console.error('Error creating segnalazione:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API route to fetch all segnalazioni
router.get('/segnalazioni', ensureAuthenticated, async (req, res) => {
    try {
        const segnalazioni = await Segnalazione.find({});
        res.json(segnalazioni);
    } catch (error) {
        console.error('Error fetching segnalazioni:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API route to fetch feedbacks for a specific segnalazione
router.get('/segnalazioni/:id/feedbacks', ensureAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        const segnalazione = await Segnalazione.findOne({ id });

        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione not found' });
        }

        res.json(segnalazione.feedbacks || []);
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API route for user login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await RegUser.findOne({ username, password });

        if (user) {
            req.session.user = user.username;
            res.redirect('/map.html');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Internal Server Error');
    }
});

// API route for user logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.redirect('/');
    });
});

module.exports = router;
