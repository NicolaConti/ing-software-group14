const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const url = "mongodb+srv://continicolaa:NikyZen01@ingsoftwaredb.nocpa6u.mongodb.net/ingsoftware_db?retryWrites=true&w=majority&appName=IngSoftwareDB";
let user;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.js') {
            res.setHeader('Content-Type', 'text/javascript');
        }
    }
}));

// Connect to MongoDB
mongoose.connect(url, {
    serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
        dbName: 'ingsoftware_db',
    }
})
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

// Define the schema for the 'RegUser' collection
const regUserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    auth: String,
    suspended: String
}, { collection: 'RegisteredUser' });

// Define the model for the 'RegUser' collection
const RegUser = mongoose.model('RegUser', regUserSchema);

// Modello Segnalazione
const Segnalazione = mongoose.model('Segnalazione', new mongoose.Schema({
    tipo: String,
    commento: String,
    coordinate: [Number]
}));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './webapp/login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './webapp/login.html'));
});

app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, './webapp/map.html'));
});

app.get('/registrazione', (req, res) => {
    res.sendFile(path.join(__dirname, './webapp/registrazione.html'));
});

app.get('/recovery', (req, res) => {
    res.sendFile(path.join(__dirname, './webapp/recovery.html'));
});

// Utility functions to validate email and password formats
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(String(password));
}

// Route for user registration
app.post('/SignIn', async (req, res) => {
    const { username, password, email } = req.body;

    console.log('Received data:', req.body);

    // Validate email and password format
    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'wrong email format' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ message: 'wrong password format' });
    }

    try {
        const existingUsername = await RegUser.findOne({ username }).exec();
        const existingEmail = await RegUser.findOne({ email }).exec();

        if (existingUsername) {
            return res.status(401).json({ message: 'username already taken' });
        }

        if (existingEmail) {
            return res.status(400).json({ message: 'email already taken' });
        }

        const newUser = new RegUser({ username, password, email, auth: "0", suspended: "0" });
        await newUser.save();

        // Log the registration
        const registrationData = `${new Date().toISOString()} - REGISTER - Username: ${username}, Email: ${email}\n`;
        fs.appendFileSync('./webapp/registered_users.txt', registrationData);

        // Send success response
        res.status(200).json({ redirect: './webapp/map.html' });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route for user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log("Attempting login with:", username, password);

        const user = await RegUser.findOne({ username, password }).exec();

        console.log("Query result:", user);
        if (user) {
            await RegUser.updateOne({ username: user.username }, { $set: { auth: "1" } }).exec();
            console.log("User auth updated successfully (login)");

            res.status(200).json({ message: 'Login successful', redirect: './webapp/map.html' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route for checking username availability
app.get('/check-username', async (req, res) => {
    const username = req.query.username;
    try {
        const user = await RegUser.findOne({ username }).exec();
        res.status(200).json({ exists: !!user });
    } catch (err) {
        console.error("Error checking username:", err);
        res.status(500).send('Internal server error');
    }
});

// Route for user logout
app.post('/logout', async (req, res) => {
    await RegUser.updateOne({ username: user.username }, { $set: { auth: "0" } }).exec().then(() => {
        res.redirect('./webapp/login.html');
        console.log("Logout Successful");
    }).catch((err) => {
        console.error("Error updating user auth (logout): ", err);
    });
});

// Rotte API per Segnalazioni
app.get('/api/segnalazioni', async (req, res) => {
    const segnalazioni = await Segnalazione.find();
    res.json(segnalazioni);
});

app.post('/api/segnalazioni', async (req, res) => {
    const { tipo, commento, coordinate } = req.body;
    const segnalazione = new Segnalazione({ tipo, commento, coordinate });
    await segnalazione.save();
    res.json(segnalazione);
});

app.delete('/api/segnalazioni/:id', async (req, res) => {
    const { id } = req.params;
    await Segnalazione.findByIdAndDelete(id);
    res.json({ message: 'Segnalazione eliminata' });
});

app.post('/api/segnalazioni/:id/commento', async (req, res) => {
    const { id } = req.params;
    const { commento } = req.body;
    const segnalazione = await Segnalazione.findById(id);
    segnalazione.commento = commento;
    await segnalazione.save();
    res.json(segnalazione);
});

const segnalazioniController = require('./models/segnalazioniController');

// Route to add a comment to a report
app.post('/api/segnalazioni/:idSegnalazione/commento', segnalazioniController.aggiungiCommento);

// Route to get comments of a report
app.get('/api/segnalazioni/:idSegnalazione/commenti', segnalazioniController.ottieniCommenti);


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});