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

// Importa il modulo counter.js
const Counter = require('./models/counter');
const { getNextId } = require('./models/counter');

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
const segnalazioneSchema = new mongoose.Schema({
    id: Number,
    tipo: String,
    commento: String,
    coordinate: [Number],
    feedbacks: [{
        username: String,
        commento: String
    }]
});

const Segnalazione = mongoose.model('Segnalazione', segnalazioneSchema);

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
            console.log("Login successful");
            res.status(200).json({ redirect: './webapp/map.html' });
        } else {
            console.log("Login failed");
            res.status(401).json({ message: 'wrong username or password' });
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Rotte per ottenere i dettagli di una segnalazione e i suoi feedback
app.get('/api/segnalazioni/:id', async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findById(req.params.id).exec();
        if (!segnalazione) {
            return res.status(404).json({ message: 'Segnalazione non trovata' });
        }
        res.status(200).json(segnalazione);
    } catch (err) {
        console.error("Errore durante il recupero della segnalazione:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

app.get('/api/segnalazioni/:id/feedbacks', async (req, res) => {
    try {
        const segnalazione = await Segnalazione.findById(req.params.id).exec();
        if (!segnalazione) {
            return res.status(404).json({ message: 'Segnalazione non trovata' });
        }
        res.status(200).json(segnalazione.feedbacks);
    } catch (err) {
        console.error("Errore durante il recupero dei feedback:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

app.post('/api/segnalazioni/:id/feedbacks', async (req, res) => {
    const { commento } = req.body;
    const username = user;  // Assuming 'user' is the currently logged-in user

    try {
        const segnalazione = await Segnalazione.findById(req.params.id).exec();
        if (!segnalazione) {
            return res.status(404).json({ message: 'Segnalazione non trovata' });
        }

        segnalazione.feedbacks.push({ username, commento });
        await segnalazione.save();

        res.status(200).json({ message: 'Feedback aggiunto con successo' });
    } catch (err) {
        console.error("Errore durante l'aggiunta del feedback:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

// Route to create a new segnalazione
app.post('/api/segnalazioni', async (req, res) => {
    const { tipo, commento, coordinate } = req.body;

    try {
        const newId = await getNextId('segnalazioneId'); // Utilizza la funzione per ottenere il prossimo ID

        const newSegnalazione = new Segnalazione({
            id: newId, // Usa il nuovo ID generato
            tipo,
            commento,
            coordinate,
            feedbacks: []
        });

        await newSegnalazione.save();
        res.status(201).json(newSegnalazione);
    } catch (err) {
        console.error("Errore durante la creazione della segnalazione:", err);
        res.status(500).json({ message: 'Errore interno del server' });
    }
});

// Route per il logout
app.post('/logout', async (req, res) => {
    await RegUser.updateOne({username: user.username}, {$set: {auth: "0"}}).exec().then(() => {
        res.redirect('/login.html');
        console.log("Logout Successful");
        console.log("User auth updated successfully (logout)");
    }).catch((err) => {
        console.error("Error updating user auth (logout): ", err);
    });
});

// Funzione per avviare il server
async function startServer() {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer();
