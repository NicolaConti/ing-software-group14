const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const routes = require('../routes/routes');

const app = express();
const PORT = process.env.PORT || 3000;
const url = "mongodb+srv://continicolaa:NikyZen01@ingsoftwaredb.nocpa6u.mongodb.net/ingsoftware_db?retryWrites=true&w=majority&appName=IngSoftwareDB";

// Import MongoDB models and utility functions
const { getNextSequence } = require('../models/counter');
const RegUser = require('../models/RegUser');
const Admin = require('../models/Admin');
const LoginHistory = require('../models/LoginHistory');
const Segnalazione = require('../models/Segnalazione');

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: url })
}));

// API routes
app.use('/api', routes);

// MongoDB connection
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB: ", err);
});

// Route to serve the map.html file
app.get('/map.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/map.html'));
});

// Route to serve the feedback.html file
app.get('/Feedback.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/Feedback.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
